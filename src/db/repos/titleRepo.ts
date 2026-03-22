/**
 * Title repository - typed data access for the titles and user_titles tables.
 * Pure TypeScript, no React imports.
 */
import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { titles, userTitles } from '../schema';
import type { NewUserTitle } from '../../types/database';
import { syncQueueRepo } from './syncQueueRepo';
import { assertSyncable } from '../../services/privacy-gate';
import { useAuthStore } from '../../stores/authStore';

export const titleRepo = {
  /**
   * Get all title definitions ordered by sortOrder.
   * Used for seeding checks and building TitleCondition arrays.
   */
  async getAll() {
    const db = getDb();
    return db.select().from(titles).orderBy(titles.sortOrder);
  },

  /**
   * Get all titles earned by a user.
   */
  async getUserTitles(userId: string) {
    const db = getDb();
    return db
      .select()
      .from(userTitles)
      .where(eq(userTitles.userId, userId));
  },

  /**
   * Grant a title to a user. Silently ignores duplicate grants
   * via onConflictDoNothing (idempotent).
   *
   * Returns the inserted row if new, or an empty array if already granted.
   */
  async grantTitle(data: NewUserTitle) {
    const db = getDb();
    const result = await db
      .insert(userTitles)
      .values(data)
      .onConflictDoNothing()
      .returning();

    // Enqueue for sync (non-blocking, skip for guests)
    // Only enqueue if a new row was actually inserted (result is non-empty)
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated && result.length > 0) {
        assertSyncable('user_titles');
        syncQueueRepo.enqueue('user_titles', data.titleId, 'INSERT', data).catch(() => {});
      }
    } catch (e) { console.warn('[titleRepo] sync enqueue failed:', e); }

    return result;
  },

  /**
   * Count how many title definitions exist.
   * Used for seeding idempotency check.
   */
  async count() {
    const db = getDb();
    const result = await db.select({ id: titles.id }).from(titles);
    return result.length;
  },

  /**
   * Bulk insert title seed data (for first-run seeding).
   * Uses onConflictDoNothing to be fully idempotent.
   * NOTE: seedTitles is static seed data, NOT enqueued for sync.
   */
  async seedTitles(data: typeof titles.$inferInsert[]) {
    const db = getDb();
    return db.insert(titles).values(data).onConflictDoNothing();
  },
};
