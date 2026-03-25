/**
 * Buddy Store — Zustand state for Buddy Connection System.
 *
 * Orchestrates full buddy lifecycle:
 *   loadBuddies -> populate accepted, pendingIncoming, pendingOutgoing
 *   generateInviteCode -> create pending row with invite code
 *   enterCode -> redeem an invite code (with rate limit / cap / expiry checks)
 *   acceptRequest -> transition pending to accepted
 *   declineRequest / removeBuddy -> transition to removed
 *   blockBuddy -> determine side and write blocked_by_a or blocked_by_b
 *
 * NO persist middleware — buddy data lives in SQLite via buddyRepo.
 * SYNCABLE: buddy connection metadata syncs via the existing sync queue.
 */
import { create } from 'zustand';
import { buddyRepo, type PublicBuddyProfile } from '../db/repos/buddyRepo';
import {
  generateInviteCode as genCode,
  isInviteCodeExpired,
  canSendRequest,
  canAddBuddy,
  isBlocked,
  getBlockerSide,
} from '../domain/buddy-engine';
import { generateId } from '../utils/uuid';
import type { Buddy } from '../types/database';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type EnterCodeResult =
  | 'success'
  | 'expired'
  | 'not_found'
  | 'already_connected'
  | 'blocked'
  | 'rate_limited'
  | 'max_buddies';

// ─── Store Interface ────────────────────────────────────────────────────────────

interface BuddyState {
  accepted: Buddy[];
  pendingIncoming: Buddy[];
  pendingOutgoing: Buddy[];
  loading: boolean;
  pendingBadgeCount: number;
  lastGeneratedCode: string | null;

  loadBuddies: (userId: string) => Promise<void>;
  generateInviteCode: (userId: string) => Promise<string>;
  enterCode: (code: string, userId: string) => Promise<EnterCodeResult>;
  acceptRequest: (buddyId: string, userId: string) => Promise<void>;
  declineRequest: (buddyId: string, userId: string) => Promise<void>;
  removeBuddy: (buddyId: string, userId: string) => Promise<void>;
  blockBuddy: (buddyId: string, currentUserId: string, buddy: Buddy) => Promise<void>;
  searchUsers: (query: string) => Promise<PublicBuddyProfile[]>;
  getBuddyProfile: (buddyUserId: string) => Promise<PublicBuddyProfile | null>;
  sendHeartbeat: (userId: string) => Promise<void>;
}

// ─── Store ──────────────────────────────────────────────────────────────────────

export const useBuddyStore = create<BuddyState>((set, get) => ({
  accepted: [],
  pendingIncoming: [],
  pendingOutgoing: [],
  loading: false,
  pendingBadgeCount: 0,
  lastGeneratedCode: null,

  // ─── loadBuddies ─────────────────────────────────────────────────────────

  loadBuddies: async (userId: string) => {
    set({ loading: true });
    try {
      const [accepted, pendingIncoming, pendingOutgoing] = await Promise.all([
        buddyRepo.getAccepted(userId),
        buddyRepo.getPending(userId),
        buddyRepo.getPendingOutbound(userId),
      ]);
      set({
        accepted,
        pendingIncoming,
        pendingOutgoing,
        pendingBadgeCount: pendingIncoming.length,
        loading: false,
      });
    } catch (e) {
      set({ loading: false });
      console.warn('[buddyStore] loadBuddies error:', e);
    }
  },

  // ─── generateInviteCode ──────────────────────────────────────────────────

  generateInviteCode: async (userId: string) => {
    const code = genCode();
    const now = new Date().toISOString();
    await buddyRepo.create({
      id: generateId(),
      userA: userId,
      userB: '',  // placeholder — filled when code is redeemed by recipient
      status: 'pending',
      inviteCode: code,
      createdAt: now,
      updatedAt: now,
      acceptedAt: null,
    });
    set({ lastGeneratedCode: code });
    return code;
  },

  // ─── enterCode ───────────────────────────────────────────────────────────

  enterCode: async (code: string, userId: string) => {
    try {
      // Rate limit check — cap on concurrent pending outbound
      const pendingCount = await buddyRepo.getPendingOutboundCount(userId);
      if (!canSendRequest(pendingCount)) return 'rate_limited';

      // Buddy cap check — max accepted buddies
      const acceptedCount = await buddyRepo.getAcceptedCount(userId);
      if (!canAddBuddy(acceptedCount)) return 'max_buddies';

      // Find the invite row by code
      const inviteRow = await buddyRepo.findByInviteCode(code.toUpperCase().trim());
      if (!inviteRow) return 'not_found';
      if (isInviteCodeExpired(inviteRow.createdAt)) return 'expired';

      // Prevent self-redemption
      if (inviteRow.userA === userId) return 'already_connected';

      // Check for any existing pair between the two users
      const existing = await buddyRepo.getExistingPair(userId, inviteRow.userA);
      if (existing) {
        if (isBlocked(existing.status)) return 'blocked';
        return 'already_connected';
      }

      // Redeem: set userB, clear invite code (single-use), mark accepted
      await buddyRepo.updateStatus(inviteRow.id, 'accepted', {
        userB: userId,
        inviteCode: null,  // single-use: clear code on redemption
        acceptedAt: new Date().toISOString(),
      } as Partial<Buddy>);

      await get().loadBuddies(userId);
      return 'success';
    } catch (e) {
      console.warn('[buddyStore] enterCode error:', e);
      return 'not_found';
    }
  },

  // ─── acceptRequest ───────────────────────────────────────────────────────

  acceptRequest: async (buddyId: string, userId: string) => {
    try {
      await buddyRepo.updateStatus(buddyId, 'accepted', {
        acceptedAt: new Date().toISOString(),
      } as Partial<Buddy>);
      await get().loadBuddies(userId);
    } catch (e) {
      console.warn('[buddyStore] acceptRequest error:', e);
    }
  },

  // ─── declineRequest ──────────────────────────────────────────────────────

  declineRequest: async (buddyId: string, userId: string) => {
    try {
      await buddyRepo.updateStatus(buddyId, 'removed');
      await get().loadBuddies(userId);
    } catch (e) {
      console.warn('[buddyStore] declineRequest error:', e);
    }
  },

  // ─── removeBuddy ─────────────────────────────────────────────────────────

  removeBuddy: async (buddyId: string, userId: string) => {
    try {
      await buddyRepo.updateStatus(buddyId, 'removed');
      await get().loadBuddies(userId);
    } catch (e) {
      console.warn('[buddyStore] removeBuddy error:', e);
    }
  },

  // ─── blockBuddy ──────────────────────────────────────────────────────────

  blockBuddy: async (buddyId: string, currentUserId: string, buddy: Buddy) => {
    try {
      const side = getBlockerSide(buddy.userA, buddy.userB, currentUserId);
      const newStatus = `blocked_by_${side}`;
      await buddyRepo.updateStatus(buddyId, newStatus);
      await get().loadBuddies(currentUserId);
    } catch (e) {
      console.warn('[buddyStore] blockBuddy error:', e);
    }
  },

  // ─── searchUsers ─────────────────────────────────────────────────────────

  searchUsers: async (query: string) => {
    try {
      return buddyRepo.searchDiscoverable(query);
    } catch (e) {
      console.warn('[buddyStore] searchUsers error:', e);
      return [];
    }
  },

  // ─── getBuddyProfile ─────────────────────────────────────────────────────

  getBuddyProfile: async (buddyUserId: string) => {
    try {
      return buddyRepo.getBuddyProfile(buddyUserId);
    } catch (e) {
      console.warn('[buddyStore] getBuddyProfile error:', e);
      return null;
    }
  },

  // ─── sendHeartbeat ───────────────────────────────────────────────────────

  sendHeartbeat: async (userId: string) => {
    try {
      await buddyRepo.updateHeartbeat(userId);
    } catch (e) {
      console.warn('[buddyStore] sendHeartbeat error:', e);
    }
  },
}));
