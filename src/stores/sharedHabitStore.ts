/**
 * Shared Habit Store — Zustand state for Shared Habit lifecycle.
 *
 * Orchestrates full shared habit lifecycle:
 *   loadSharedHabits -> populate activeSharedHabits + proposals
 *   proposeSharedHabit -> Privacy Gate check -> create via domain engine + repo
 *   acceptProposal -> set status to 'active'
 *   declineProposal -> set status to 'ended'
 *   endSharedHabit -> unilateral end per D-04 (either player can end)
 *   getSharedStreak -> pure domain computation, no DB call
 *
 * NO persist middleware — shared habit data lives in SQLite via sharedHabitRepo.
 * SYNCABLE: shared habit metadata syncs via the existing sync queue.
 *
 * Badge integration (D-03):
 * After loadSharedHabits resolves, calls useBuddyStore.getState().setPendingProposalCount
 * with proposals.length so the Buddy tab badge includes incoming proposal count.
 *
 * After proposeSharedHabit, call buddyStore.loadBuddies to refresh the badge
 * for the proposing user's buddy list (the buddy's badge will update on their next load).
 */
import { create } from 'zustand';
import { sharedHabitRepo } from '../db/repos/sharedHabitRepo';
import {
  isEligibleForSharing,
  createSharedHabitProposal,
  calculateSharedStreak,
  canEndSharedHabit,
} from '../domain/shared-habit-engine';
import { useBuddyStore } from './buddyStore';
import { generateId } from '../utils/uuid';
import type { SharedHabit } from '../types/database';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProposeResult = 'success' | 'ineligible_type';

// ─── Store Interface ────────────────────────────────────────────────────────────

interface SharedHabitState {
  activeSharedHabits: SharedHabit[];
  proposals: SharedHabit[];
  loading: boolean;

  loadSharedHabits: (buddyPairIds: string[], userId: string) => Promise<void>;
  proposeSharedHabit: (params: {
    buddyPairId: string;
    userId: string;
    habitType: string;
    name: string;
    targetFrequency?: 'daily' | 'weekly';
  }) => Promise<ProposeResult>;
  acceptProposal: (sharedHabitId: string, userId: string, buddyPairIds: string[]) => Promise<void>;
  declineProposal: (sharedHabitId: string, userId: string, buddyPairIds: string[]) => Promise<void>;
  endSharedHabit: (sharedHabitId: string, userId: string, buddyPairIds: string[]) => Promise<void>;
  getSharedStreak: (
    sharedHabitId: string,
    userADates: string[],
    userBDates: string[],
  ) => number;
}

// ─── Store ──────────────────────────────────────────────────────────────────────

export const useSharedHabitStore = create<SharedHabitState>((set, get) => ({
  activeSharedHabits: [],
  proposals: [],
  loading: false,

  // ─── loadSharedHabits ──────────────────────────────────────────────────

  loadSharedHabits: async (buddyPairIds: string[], userId: string) => {
    set({ loading: true });
    try {
      // Load active shared habits across all buddy pairs
      const activeResults = await Promise.all(
        buddyPairIds.map((pairId) => sharedHabitRepo.getActiveByBuddyPair(pairId)),
      );
      const activeSharedHabits = activeResults.flat();

      // Load incoming proposals (habits proposed by buddy, not by current user)
      const proposals = await sharedHabitRepo.getProposalsForUser(buddyPairIds, userId);

      set({ activeSharedHabits, proposals, loading: false });

      // D-03: Notify buddyStore of incoming proposal count so Buddy tab badge reflects it
      useBuddyStore.getState().setPendingProposalCount(proposals.length);
    } catch (e) {
      set({ loading: false });
      console.warn('[sharedHabitStore] loadSharedHabits error:', e);
    }
  },

  // ─── proposeSharedHabit ────────────────────────────────────────────────

  proposeSharedHabit: async (params) => {
    const { buddyPairId, userId, habitType, name, targetFrequency } = params;
    try {
      // Privacy Gate (D-02): reject worship habits
      if (!isEligibleForSharing(habitType)) {
        return 'ineligible_type';
      }

      // Create proposal-shaped object via domain engine
      const proposalData = createSharedHabitProposal({
        buddyPairId,
        createdByUserId: userId,
        habitType,
        name,
        targetFrequency,
      });

      // Persist via repo (assertSyncable + sync queue handled inside)
      await sharedHabitRepo.create({
        id: generateId(),
        ...proposalData,
      });

      // Reload to update local state
      // Note: buddyStore.loadBuddies should be called by the UI after this
      // to refresh the buddy tab badge for this user's buddy pairs.
      const { buddyPairIds: currentBuddyPairIds } = _extractBuddyPairIds(get());
      if (currentBuddyPairIds.length > 0 || buddyPairId) {
        await get().loadSharedHabits(
          currentBuddyPairIds.length > 0 ? currentBuddyPairIds : [buddyPairId],
          userId,
        );
      }

      return 'success';
    } catch (e) {
      console.warn('[sharedHabitStore] proposeSharedHabit error:', e);
      return 'ineligible_type';
    }
  },

  // ─── acceptProposal ───────────────────────────────────────────────────

  acceptProposal: async (sharedHabitId: string, userId: string, buddyPairIds: string[]) => {
    try {
      await sharedHabitRepo.updateStatus(sharedHabitId, 'active');
      await get().loadSharedHabits(buddyPairIds, userId);
    } catch (e) {
      console.warn('[sharedHabitStore] acceptProposal error:', e);
    }
  },

  // ─── declineProposal ──────────────────────────────────────────────────

  declineProposal: async (sharedHabitId: string, userId: string, buddyPairIds: string[]) => {
    try {
      await sharedHabitRepo.updateStatus(sharedHabitId, 'ended');
      await get().loadSharedHabits(buddyPairIds, userId);
    } catch (e) {
      console.warn('[sharedHabitStore] declineProposal error:', e);
    }
  },

  // ─── endSharedHabit ───────────────────────────────────────────────────

  endSharedHabit: async (sharedHabitId: string, userId: string, buddyPairIds: string[]) => {
    try {
      // Verify the habit is in a state that allows ending
      const habit = await sharedHabitRepo.getById(sharedHabitId);
      if (!habit || !canEndSharedHabit(habit.status)) {
        console.warn('[sharedHabitStore] endSharedHabit: habit not found or cannot be ended');
        return;
      }

      // Per D-04: either player can end a shared habit unilaterally
      await sharedHabitRepo.updateStatus(sharedHabitId, 'ended');
      await get().loadSharedHabits(buddyPairIds, userId);
    } catch (e) {
      console.warn('[sharedHabitStore] endSharedHabit error:', e);
    }
  },

  // ─── getSharedStreak ──────────────────────────────────────────────────

  getSharedStreak: (
    _sharedHabitId: string,
    userADates: string[],
    userBDates: string[],
  ): number => {
    // Pure computation delegated to domain engine — no DB call
    return calculateSharedStreak(userADates, userBDates);
  },
}));

// ─── Internal Helpers ──────────────────────────────────────────────────────────

/**
 * Extract the set of buddy pair IDs from current active shared habits and proposals.
 * Used for reload calls within the store where the caller doesn't re-supply pair IDs.
 */
function _extractBuddyPairIds(state: SharedHabitState): { buddyPairIds: string[] } {
  const seen = new Set<string>();
  for (const h of state.activeSharedHabits) seen.add(h.buddyPairId);
  for (const p of state.proposals) seen.add(p.buddyPairId);
  return { buddyPairIds: Array.from(seen) };
}
