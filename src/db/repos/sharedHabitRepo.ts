/**
 * Shared Habit repository — typed data access for the shared_habits table.
 *
 * Privacy classification: SYNCABLE — both buddies need to see shared goal.
 * All writes call assertSyncable('shared_habits') and enqueue to syncQueueRepo.
 *
 * Query pattern: reads are scoped to buddyPairId so each buddy pair only sees
 * their own shared habits. No global queries exposed.
 *
 * Privacy invariant: sharedHabitRepo NEVER reads habit_completions, streaks,
 * or muhasabah_entries. Proposals exclude self-created entries (incoming only).
 *
 * Pure TypeScript, no React imports.
 */
import { eq, and, ne, inArray } from 'drizzle-orm';
import { getDb } from '../client';
import { sharedHabits } from '../schema';
import { assertSyncable } from '../../services/privacy-gate';
import { syncQueueRepo } from './syncQueueRepo';
import { useAuthStore } from '../../stores/authStore';
import type { SharedHabit, NewSharedHabit } from '../../types/database';

export const sharedHabitRepo = {
  /**
   * Create a new shared habit row.
   * Asserts SYNCABLE, inserts, then enqueues for cloud sync.
   */
  async create(data: NewSharedHabit): Promise<SharedHabit[]> {
    assertSyncable('shared_habits');
    const db = getDb();
    const rows = await db.insert(sharedHabits).values(data).returning();
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        await syncQueueRepo.enqueue('shared_habits', rows[0].id, 'UPSERT', rows[0]);
      }
    } catch {
      console.warn('[sharedHabitRepo] sync enqueue failed on create');
    }
    return rows;
  },

  /**
   * Get all shared habits for a buddy pair (any status).
   * Scoped to buddyPairId — never a global query.
   */
  async getByBuddyPair(buddyPairId: string): Promise<SharedHabit[]> {
    const db = getDb();
    return db.select().from(sharedHabits).where(
      eq(sharedHabits.buddyPairId, buddyPairId),
    );
  },

  /**
   * Get active shared habits for a buddy pair.
   * Returns only status='active' habits scoped to buddyPairId.
   */
  async getActiveByBuddyPair(buddyPairId: string): Promise<SharedHabit[]> {
    const db = getDb();
    return db.select().from(sharedHabits).where(
      and(
        eq(sharedHabits.buddyPairId, buddyPairId),
        eq(sharedHabits.status, 'active'),
      ),
    );
  },

  /**
   * Get incoming proposals for a user — shared habits where status='proposed'
   * and the user did NOT create them (incoming from their buddy).
   *
   * Privacy invariant: proposals where createdByUserId == userId are excluded.
   * This prevents the user from seeing their own outbound proposals here.
   *
   * @param buddyPairIds - IDs of all buddy pairs the user belongs to
   * @param userId - the requesting user's ID
   */
  async getProposalsForUser(buddyPairIds: string[], userId: string): Promise<SharedHabit[]> {
    if (buddyPairIds.length === 0) return [];
    const db = getDb();
    return db.select().from(sharedHabits).where(
      and(
        inArray(sharedHabits.buddyPairId, buddyPairIds),
        eq(sharedHabits.status, 'proposed'),
        ne(sharedHabits.createdByUserId, userId),
      ),
    );
  },

  /**
   * Update the status of a shared habit row.
   * Asserts SYNCABLE, updates, then enqueues for cloud sync.
   */
  async updateStatus(id: string, status: string): Promise<void> {
    assertSyncable('shared_habits');
    const db = getDb();
    await db.update(sharedHabits).set({
      status,
      updatedAt: new Date().toISOString(),
    }).where(eq(sharedHabits.id, id));
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        const updated = await db.select().from(sharedHabits).where(eq(sharedHabits.id, id));
        if (updated[0]) {
          await syncQueueRepo.enqueue('shared_habits', id, 'UPSERT', updated[0]);
        }
      }
    } catch {
      console.warn('[sharedHabitRepo] sync enqueue failed on updateStatus');
    }
  },

  /**
   * Get a single shared habit by ID. Returns null if not found.
   */
  async getById(id: string): Promise<SharedHabit | null> {
    const db = getDb();
    const rows = await db.select().from(sharedHabits).where(eq(sharedHabits.id, id));
    return rows[0] ?? null;
  },
};
