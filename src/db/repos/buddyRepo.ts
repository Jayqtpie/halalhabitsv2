/**
 * Buddy repository — typed data access for the buddies table.
 *
 * Privacy classification: SYNCABLE — connection metadata both users need.
 * All writes call assertSyncable('buddies') and enqueue to syncQueueRepo.
 *
 * Dual-owner query pattern: reads check (userA = userId OR userB = userId)
 * so both sides of a connection can access the same row.
 *
 * Supabase queries (searchDiscoverable, getBuddyProfile, updateHeartbeat)
 * are guarded by supabaseConfigured — they gracefully degrade offline.
 *
 * Privacy invariant: buddyRepo NEVER reads habit_completions, streaks,
 * or muhasabah_entries. Buddy profiles expose only public user fields.
 *
 * Pure TypeScript, no React imports.
 */
import { eq, and, or, count } from 'drizzle-orm';
import { getDb } from '../client';
import { buddies } from '../schema';
import { assertSyncable } from '../../services/privacy-gate';
import { syncQueueRepo } from './syncQueueRepo';
import { useAuthStore } from '../../stores/authStore';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import type { Buddy, NewBuddy } from '../../types/database';

/**
 * Public-facing buddy profile — only safe fields from the users table.
 * Never includes habit_completions, streaks, or muhasabah_entries.
 */
export type PublicBuddyProfile = {
  id: string;
  displayName: string;
  currentLevel: number;
  totalXp: number;
  activeTitleId: string | null;
  currentStreakCount: number;
  lastActiveAt: string | null;
};

export const buddyRepo = {
  /**
   * Create a new buddy connection row.
   * Asserts SYNCABLE, inserts, then enqueues for cloud sync.
   */
  async create(data: NewBuddy): Promise<Buddy[]> {
    assertSyncable('buddies');
    const db = getDb();
    const rows = await db.insert(buddies).values(data).returning();
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        await syncQueueRepo.enqueue('buddies', rows[0].id, 'UPSERT', rows[0]);
      }
    } catch {
      console.warn('[buddyRepo] sync enqueue failed on create');
    }
    return rows;
  },

  /**
   * Update the status of a buddy row (pending -> accepted, or rejected/removed).
   * Asserts SYNCABLE, updates, then enqueues the updated row for sync.
   */
  async updateStatus(id: string, status: string, extra?: Partial<Buddy>): Promise<void> {
    assertSyncable('buddies');
    const db = getDb();
    const payload = { status, updatedAt: new Date().toISOString(), ...extra };
    await db.update(buddies).set(payload).where(eq(buddies.id, id));
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        const updated = await db.select().from(buddies).where(eq(buddies.id, id));
        if (updated[0]) {
          await syncQueueRepo.enqueue('buddies', id, 'UPSERT', updated[0]);
        }
      }
    } catch {
      console.warn('[buddyRepo] sync enqueue failed on updateStatus');
    }
  },

  /**
   * Get all accepted buddy connections for a user.
   * Dual-owner: checks both userA and userB columns.
   */
  async getAccepted(userId: string): Promise<Buddy[]> {
    const db = getDb();
    return db.select().from(buddies).where(
      and(
        eq(buddies.status, 'accepted'),
        or(eq(buddies.userA, userId), eq(buddies.userB, userId)),
      ),
    );
  },

  /**
   * Get incoming pending requests for a user (userB = userId).
   * Inbound only — the user is the recipient.
   */
  async getPending(userId: string): Promise<Buddy[]> {
    const db = getDb();
    return db.select().from(buddies).where(
      and(eq(buddies.status, 'pending'), eq(buddies.userB, userId)),
    );
  },

  /**
   * Get outbound pending requests sent by a user (userA = userId).
   */
  async getPendingOutbound(userId: string): Promise<Buddy[]> {
    const db = getDb();
    return db.select().from(buddies).where(
      and(eq(buddies.status, 'pending'), eq(buddies.userA, userId)),
    );
  },

  /**
   * Count outbound pending requests sent by a user.
   */
  async getPendingOutboundCount(userId: string): Promise<number> {
    const db = getDb();
    const result = await db.select({ value: count() }).from(buddies).where(
      and(eq(buddies.status, 'pending'), eq(buddies.userA, userId)),
    );
    return result[0]?.value ?? 0;
  },

  /**
   * Count accepted buddy connections for a user.
   * Dual-owner: checks both userA and userB columns.
   */
  async getAcceptedCount(userId: string): Promise<number> {
    const db = getDb();
    const result = await db.select({ value: count() }).from(buddies).where(
      and(
        eq(buddies.status, 'accepted'),
        or(eq(buddies.userA, userId), eq(buddies.userB, userId)),
      ),
    );
    return result[0]?.value ?? 0;
  },

  /**
   * Find a buddy row by invite code. Returns null if not found.
   */
  async findByInviteCode(code: string): Promise<Buddy | null> {
    const db = getDb();
    const rows = await db.select().from(buddies).where(eq(buddies.inviteCode, code));
    return rows[0] ?? null;
  },

  /**
   * Find any buddy row between two users regardless of which is userA/userB.
   * Used to prevent duplicate connection requests.
   */
  async getExistingPair(userIdA: string, userIdB: string): Promise<Buddy | null> {
    const db = getDb();
    const rows = await db.select().from(buddies).where(
      or(
        and(eq(buddies.userA, userIdA), eq(buddies.userB, userIdB)),
        and(eq(buddies.userA, userIdB), eq(buddies.userB, userIdA)),
      ),
    );
    return rows[0] ?? null;
  },

  // ─── Supabase-backed queries (degrade gracefully offline) ──────────────────

  /**
   * Search for discoverable users by display name.
   * Only returns users with is_discoverable = true.
   * Requires supabaseConfigured and query >= 2 chars.
   */
  async searchDiscoverable(query: string): Promise<PublicBuddyProfile[]> {
    if (!supabaseConfigured || !query || query.length < 2) return [];
    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, current_level, total_xp, active_title_id, current_streak_count, last_active_at')
      .eq('is_discoverable', true)
      .ilike('display_name', `%${query}%`)
      .limit(20);
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      displayName: row.display_name as string,
      currentLevel: row.current_level as number,
      totalXp: row.total_xp as number,
      activeTitleId: (row.active_title_id as string | null) ?? null,
      currentStreakCount: (row.current_streak_count as number) ?? 0,
      lastActiveAt: (row.last_active_at as string | null) ?? null,
    }));
  },

  /**
   * Fetch the public profile of a buddy by their user ID.
   * Only reads safe public fields — never habit_completions, streaks, or muhasabah_entries.
   */
  async getBuddyProfile(buddyUserId: string): Promise<PublicBuddyProfile | null> {
    if (!supabaseConfigured) return null;
    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, current_level, total_xp, active_title_id, current_streak_count, last_active_at')
      .eq('id', buddyUserId)
      .single();
    if (error || !data) return null;
    return {
      id: (data as Record<string, unknown>).id as string,
      displayName: (data as Record<string, unknown>).display_name as string,
      currentLevel: (data as Record<string, unknown>).current_level as number,
      totalXp: (data as Record<string, unknown>).total_xp as number,
      activeTitleId: ((data as Record<string, unknown>).active_title_id as string | null) ?? null,
      currentStreakCount: ((data as Record<string, unknown>).current_streak_count as number) ?? 0,
      lastActiveAt: ((data as Record<string, unknown>).last_active_at as string | null) ?? null,
    };
  },

  /**
   * Update the last_active_at heartbeat for the current user on Supabase.
   * Requires supabaseConfigured and authenticated session.
   */
  async updateHeartbeat(userId: string): Promise<void> {
    if (!supabaseConfigured) return;
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;
    await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);
  },
};
