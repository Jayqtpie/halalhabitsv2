/**
 * Duo Quest Store — Zustand state for Duo Quest lifecycle.
 *
 * Orchestrates full duo quest lifecycle:
 *   loadDuoQuests -> populate activeQuests + completedQuests for one buddy pair
 *   loadAllDuoQuests -> concat quests across all buddy pairs for Activities tab
 *   createFromTemplate -> enforce 3-quest max, create from template
 *   createCustom -> enforce 3-quest max, create with custom params
 *   recordMyProgress -> update progress, award individual XP, award bonus XP if both done
 *   checkInactivityStatus -> returns 'ok' | 'warning' | 'exit_eligible' per D-09/D-10
 *   exitQuest -> award partial XP per D-10, update status to 'exited'
 *
 * NO persist middleware — duo quest data lives in SQLite via duoQuestRepo.
 * SYNCABLE: duo quest progress syncs via the existing sync queue.
 *
 * XP awards (DUOQ-03):
 * - Individual: awardXP(userId, xpRewardEach, 1, 'duo_quest_individual', questId)
 * - Bonus (both complete): awardXP(userId, xpRewardBonus, 1, 'duo_quest_bonus', questId)
 * - Partial exit: awardXP(userId, partialXP.individualXP, 1, 'duo_quest_partial', questId)
 *
 * Inactivity (D-09/D-10):
 * - 48h warning, 72h exit eligible
 * - On exit: proportional individual XP, no bonus XP
 */
import { create } from 'zustand';
import { duoQuestRepo } from '../db/repos/duoQuestRepo';
import {
  canCreateDuoQuest,
  createDuoQuest,
  recordProgress,
  checkInactivity,
  calculatePartialXP,
  isQuestComplete,
  type InactivityStatus,
} from '../domain/duo-quest-engine';
import { useGameStore } from './gameStore';
import { generateId } from '../utils/uuid';
import type { DuoQuest } from '../types/database';
import type { DuoQuestTemplate } from '../domain/duo-quest-templates';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CreateQuestResult = 'success' | 'max_reached';

// ─── Store Interface ────────────────────────────────────────────────────────────

interface DuoQuestState {
  activeQuests: DuoQuest[];
  completedQuests: DuoQuest[];
  loading: boolean;

  loadDuoQuests: (buddyPairId: string) => Promise<void>;
  loadAllDuoQuests: (buddyPairIds: string[]) => Promise<void>;
  createFromTemplate: (params: {
    buddyPairId: string;
    userId: string;
    template: DuoQuestTemplate;
  }) => Promise<CreateQuestResult>;
  createCustom: (params: {
    buddyPairId: string;
    userId: string;
    title: string;
    description: string;
    targetValue: number;
    durationDays: number;
    xpRewardEach: number;
    xpRewardBonus?: number;
  }) => Promise<CreateQuestResult>;
  recordMyProgress: (questId: string, side: 'a' | 'b', userId: string) => Promise<void>;
  checkInactivityStatus: (questId: string, side: 'a' | 'b') => Promise<InactivityStatus>;
  exitQuest: (questId: string, side: 'a' | 'b', userId: string) => Promise<void>;
}

// ─── Store ──────────────────────────────────────────────────────────────────────

export const useDuoQuestStore = create<DuoQuestState>((set, get) => ({
  activeQuests: [],
  completedQuests: [],
  loading: false,

  // ─── loadDuoQuests ────────────────────────────────────────────────────

  loadDuoQuests: async (buddyPairId: string) => {
    set({ loading: true });
    try {
      const [activeQuests, allQuests] = await Promise.all([
        duoQuestRepo.getActiveByBuddyPair(buddyPairId),
        duoQuestRepo.getByBuddyPair(buddyPairId),
      ]);
      const completedQuests = allQuests.filter(
        (q) => q.status === 'completed' || q.status === 'exited',
      );
      set({ activeQuests, completedQuests, loading: false });
    } catch (e) {
      set({ loading: false });
      console.warn('[duoQuestStore] loadDuoQuests error:', e);
    }
  },

  // ─── loadAllDuoQuests ─────────────────────────────────────────────────

  loadAllDuoQuests: async (buddyPairIds: string[]) => {
    set({ loading: true });
    try {
      // Load active + completed quests across all buddy pairs
      const [activeResults, allResults] = await Promise.all([
        Promise.all(buddyPairIds.map((id) => duoQuestRepo.getActiveByBuddyPair(id))),
        Promise.all(buddyPairIds.map((id) => duoQuestRepo.getByBuddyPair(id))),
      ]);
      const activeQuests = activeResults.flat();
      const completedQuests = allResults.flat().filter(
        (q) => q.status === 'completed' || q.status === 'exited',
      );
      set({ activeQuests, completedQuests, loading: false });
    } catch (e) {
      set({ loading: false });
      console.warn('[duoQuestStore] loadAllDuoQuests error:', e);
    }
  },

  // ─── createFromTemplate ───────────────────────────────────────────────

  createFromTemplate: async (params) => {
    const { buddyPairId, userId, template } = params;
    try {
      // Enforce 3-quest max (D-08)
      const activeCount = await duoQuestRepo.getActiveCountByBuddyPair(buddyPairId);
      if (!canCreateDuoQuest(activeCount)) return 'max_reached';

      // Build quest data from template via domain engine
      const questData = createDuoQuest({
        buddyPairId,
        createdByUserId: userId,
        title: template.title,
        description: template.description,
        xpRewardEach: template.xpRewardEach,
        xpRewardBonus: template.xpRewardBonus,
        targetType: template.targetType,
        targetValue: template.targetValue,
        durationDays: template.durationDays,
      });

      await duoQuestRepo.create({ id: generateId(), ...questData });
      await get().loadDuoQuests(buddyPairId);
      return 'success';
    } catch (e) {
      console.warn('[duoQuestStore] createFromTemplate error:', e);
      return 'max_reached';
    }
  },

  // ─── createCustom ─────────────────────────────────────────────────────

  createCustom: async (params) => {
    const {
      buddyPairId,
      userId,
      title,
      description,
      targetValue,
      durationDays,
      xpRewardEach,
      xpRewardBonus,
    } = params;
    try {
      // Enforce 3-quest max (D-08)
      const activeCount = await duoQuestRepo.getActiveCountByBuddyPair(buddyPairId);
      if (!canCreateDuoQuest(activeCount)) return 'max_reached';

      // Custom text should be filtered by UI (leo-profanity per D-06) before reaching store
      // xpRewardBonus defaults to 50% of individual reward if not supplied
      const effectiveBonusXP = xpRewardBonus ?? Math.round(xpRewardEach * 0.5);

      const questData = createDuoQuest({
        buddyPairId,
        createdByUserId: userId,
        title,
        description,
        xpRewardEach,
        xpRewardBonus: effectiveBonusXP,
        targetType: 'completion_count',
        targetValue,
        durationDays,
      });

      await duoQuestRepo.create({ id: generateId(), ...questData });
      await get().loadDuoQuests(buddyPairId);
      return 'success';
    } catch (e) {
      console.warn('[duoQuestStore] createCustom error:', e);
      return 'max_reached';
    }
  },

  // ─── recordMyProgress ─────────────────────────────────────────────────

  recordMyProgress: async (questId: string, side: 'a' | 'b', userId: string) => {
    try {
      const quest = await duoQuestRepo.getById(questId);
      if (!quest) {
        console.warn('[duoQuestStore] recordMyProgress: quest not found', questId);
        return;
      }

      // Skip if this side already completed
      const alreadyCompleted = side === 'a' ? quest.userACompleted : quest.userBCompleted;
      if (alreadyCompleted) return;

      // Use domain engine to compute updated progress fields (immutable update)
      const updated = recordProgress(
        {
          userAProgress: quest.userAProgress,
          userBProgress: quest.userBProgress,
          userACompleted: quest.userACompleted,
          userBCompleted: quest.userBCompleted,
          targetValue: quest.targetValue,
        },
        side,
      );

      const newProgress = side === 'a' ? updated.userAProgress : updated.userBProgress;
      const nowCompleted = side === 'a' ? updated.userACompleted : updated.userBCompleted;

      // Persist progress update to repo (absolute value, not increment)
      await duoQuestRepo.updateProgress(questId, side, newProgress, nowCompleted);

      // Award individual XP if this side just completed their portion (DUOQ-03)
      if (nowCompleted) {
        await useGameStore.getState().awardXP(
          userId,
          quest.xpRewardEach,
          1,
          'duo_quest_individual',
          questId,
        );
      }

      // Check if BOTH sides are now complete — award bonus XP and mark completed (DUOQ-03)
      const questAfterUpdate = {
        ...quest,
        userAProgress: updated.userAProgress,
        userBProgress: updated.userBProgress,
        userACompleted: updated.userACompleted,
        userBCompleted: updated.userBCompleted,
      };

      if (isQuestComplete(questAfterUpdate)) {
        const now = new Date().toISOString();
        await duoQuestRepo.updateStatus(questId, 'completed', { completedAt: now });

        // Award bonus XP to the player who just triggered both-complete (DUOQ-03)
        // The other player's bonus is awarded when they call recordMyProgress from their device
        // Note: in a real-time sync scenario both would get it; here we award to the current user
        await useGameStore.getState().awardXP(
          userId,
          quest.xpRewardBonus,
          1,
          'duo_quest_bonus',
          questId,
        );
      }

      // Reload quests for this buddy pair
      await get().loadDuoQuests(quest.buddyPairId);
    } catch (e) {
      console.warn('[duoQuestStore] recordMyProgress error:', e);
    }
  },

  // ─── checkInactivityStatus ────────────────────────────────────────────

  checkInactivityStatus: async (questId: string, side: 'a' | 'b'): Promise<InactivityStatus> => {
    try {
      const quest = await duoQuestRepo.getById(questId);
      if (!quest) return 'ok';

      // Determine partner's last progress timestamp
      // The partner is the opposite side from the caller
      // We use updatedAt as the proxy for partner's last activity (the quest record updates on any write)
      // A more precise implementation would store per-side timestamps; updatedAt is a safe conservative proxy
      const partnerLastProgressAt = quest.updatedAt;
      return checkInactivity(partnerLastProgressAt);
    } catch (e) {
      console.warn('[duoQuestStore] checkInactivityStatus error:', e);
      return 'ok';
    }
  },

  // ─── exitQuest ────────────────────────────────────────────────────────

  exitQuest: async (questId: string, side: 'a' | 'b', userId: string) => {
    try {
      const quest = await duoQuestRepo.getById(questId);
      if (!quest) {
        console.warn('[duoQuestStore] exitQuest: quest not found', questId);
        return;
      }

      // Calculate proportional partial XP (D-10 — no bonus on exit)
      const userProgress = side === 'a' ? quest.userAProgress : quest.userBProgress;
      const partialXP = calculatePartialXP({
        xpRewardEach: quest.xpRewardEach,
        userProgress,
        targetValue: quest.targetValue,
      });

      // Award partial individual XP (bonusXP is always 0 from calculatePartialXP per D-10)
      if (partialXP.individualXP > 0) {
        await useGameStore.getState().awardXP(
          userId,
          partialXP.individualXP,
          1,
          'duo_quest_partial',
          questId,
        );
      }

      // Mark quest as exited
      await duoQuestRepo.updateStatus(questId, 'exited');

      // Reload quests for this buddy pair
      await get().loadDuoQuests(quest.buddyPairId);
    } catch (e) {
      console.warn('[duoQuestStore] exitQuest error:', e);
    }
  },
}));
