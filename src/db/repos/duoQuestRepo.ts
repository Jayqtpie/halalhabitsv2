/**
 * Duo Quest repository — typed data access for the duo_quests table.
 *
 * Privacy classification: SYNCABLE — both buddies need to see quest progress.
 * All writes call assertSyncable('duo_quests') and enqueue to syncQueueRepo.
 *
 * Query pattern: reads are scoped to buddyPairId so each buddy pair only sees
 * their own quests. No global queries exposed.
 *
 * Privacy invariant (DUOQ-05 / D-05 / D-13):
 * updateProgress stores individual userA/userB columns for accurate tracking,
 * but the domain layer (duo-quest-engine.ts getAggregateProgress) is responsible
 * for aggregating this data before any public-facing UI display. The repo does
 * not expose raw individual progress in a dedicated aggregate read method —
 * consumers should call getAggregateProgress() from the domain engine.
 *
 * Active quest count (DUOQ-08):
 * getActiveCountByBuddyPair enforces the 3-quest-per-pair limit check by
 * returning the count of active quests. The store layer uses this to call
 * canCreateDuoQuest() from the domain engine before creating.
 *
 * Pure TypeScript, no React imports.
 */
import { eq, and, lte, count } from 'drizzle-orm';
import { getDb } from '../client';
import { duoQuests } from '../schema';
import { assertSyncable } from '../../services/privacy-gate';
import { syncQueueRepo } from './syncQueueRepo';
import { useAuthStore } from '../../stores/authStore';
import type { DuoQuest, NewDuoQuest } from '../../types/database';

export const duoQuestRepo = {
  /**
   * Create a new duo quest row.
   * Asserts SYNCABLE, inserts, then enqueues for cloud sync.
   */
  async create(data: NewDuoQuest): Promise<DuoQuest[]> {
    assertSyncable('duo_quests');
    const db = getDb();
    const rows = await db.insert(duoQuests).values(data).returning();
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        await syncQueueRepo.enqueue('duo_quests', rows[0].id, 'UPSERT', rows[0]);
      }
    } catch {
      console.warn('[duoQuestRepo] sync enqueue failed on create');
    }
    return rows;
  },

  /**
   * Get active duo quests for a buddy pair (status='active').
   * Scoped to buddyPairId — never a global query.
   */
  async getActiveByBuddyPair(buddyPairId: string): Promise<DuoQuest[]> {
    const db = getDb();
    return db.select().from(duoQuests).where(
      and(
        eq(duoQuests.buddyPairId, buddyPairId),
        eq(duoQuests.status, 'active'),
      ),
    );
  },

  /**
   * Count active duo quests for a buddy pair.
   * Used by the store to enforce the MAX_ACTIVE_DUO_QUESTS = 3 limit
   * (canCreateDuoQuest check in duo-quest-engine.ts).
   */
  async getActiveCountByBuddyPair(buddyPairId: string): Promise<number> {
    const db = getDb();
    const result = await db.select({ value: count() }).from(duoQuests).where(
      and(
        eq(duoQuests.buddyPairId, buddyPairId),
        eq(duoQuests.status, 'active'),
      ),
    );
    return result[0]?.value ?? 0;
  },

  /**
   * Get all duo quests for a buddy pair (any status).
   * Scoped to buddyPairId — never a global query.
   */
  async getByBuddyPair(buddyPairId: string): Promise<DuoQuest[]> {
    const db = getDb();
    return db.select().from(duoQuests).where(
      eq(duoQuests.buddyPairId, buddyPairId),
    );
  },

  /**
   * Get a single duo quest by ID. Returns null if not found.
   */
  async getById(id: string): Promise<DuoQuest | null> {
    const db = getDb();
    const rows = await db.select().from(duoQuests).where(eq(duoQuests.id, id));
    return rows[0] ?? null;
  },

  /**
   * Update progress for one side of a duo quest.
   * Asserts SYNCABLE, writes to the correct column pair (userA or userB),
   * then enqueues for cloud sync.
   *
   * Individual progress is stored here for accurate dual-column tracking.
   * For UI display, use getAggregateProgress() from duo-quest-engine.ts.
   *
   * @param id - quest ID
   * @param side - 'a' for userA, 'b' for userB
   * @param progress - new progress value (not an increment)
   * @param completed - whether this side has met the target
   */
  async updateProgress(
    id: string,
    side: 'a' | 'b',
    progress: number,
    completed: boolean,
  ): Promise<void> {
    assertSyncable('duo_quests');
    const db = getDb();
    const payload =
      side === 'a'
        ? { userAProgress: progress, userACompleted: completed, updatedAt: new Date().toISOString() }
        : { userBProgress: progress, userBCompleted: completed, updatedAt: new Date().toISOString() };
    await db.update(duoQuests).set(payload).where(eq(duoQuests.id, id));
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        const updated = await db.select().from(duoQuests).where(eq(duoQuests.id, id));
        if (updated[0]) {
          await syncQueueRepo.enqueue('duo_quests', id, 'UPSERT', updated[0]);
        }
      }
    } catch {
      console.warn('[duoQuestRepo] sync enqueue failed on updateProgress');
    }
  },

  /**
   * Update the status of a duo quest (and optional extra fields like completedAt).
   * Asserts SYNCABLE, updates, then enqueues for cloud sync.
   */
  async updateStatus(id: string, status: string, extra?: Partial<DuoQuest>): Promise<void> {
    assertSyncable('duo_quests');
    const db = getDb();
    const payload = { status, updatedAt: new Date().toISOString(), ...extra };
    await db.update(duoQuests).set(payload).where(eq(duoQuests.id, id));
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        const updated = await db.select().from(duoQuests).where(eq(duoQuests.id, id));
        if (updated[0]) {
          await syncQueueRepo.enqueue('duo_quests', id, 'UPSERT', updated[0]);
        }
      }
    } catch {
      console.warn('[duoQuestRepo] sync enqueue failed on updateStatus');
    }
  },

  /**
   * Get all active quests that have passed their expiry time.
   * Used by the store/background task to expire overdue active quests.
   *
   * @param now - ISO timestamp to compare against expiresAt (lte check)
   */
  async getExpiredActive(now: string): Promise<DuoQuest[]> {
    const db = getDb();
    return db.select().from(duoQuests).where(
      and(
        eq(duoQuests.status, 'active'),
        lte(duoQuests.expiresAt, now),
      ),
    );
  },
};
