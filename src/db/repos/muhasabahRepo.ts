/**
 * Muhasabah repository — CRUD for muhasabah_entries table.
 *
 * Privacy: muhasabah_entries is classified PRIVATE in the Privacy Gate.
 * This repo MUST NEVER call assertSyncable — this data never leaves the device.
 *
 * Follows the established store-repo-engine pattern (same as habitRepo, questRepo, etc.)
 */
import { getDb } from '../client';
import { muhasabahEntries } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const muhasabahRepo = {
  /**
   * Create a new Muhasabah entry.
   * Called by muhasabahStore.submit() after user completes the reflection flow.
   */
  async create(entry: typeof muhasabahEntries.$inferInsert) {
    const db = getDb();
    return db.insert(muhasabahEntries).values(entry).returning();
  },

  /**
   * Fetch the most recent Muhasabah entries for a user.
   */
  async getByUserId(userId: string, limit = 30) {
    const db = getDb();
    return db
      .select()
      .from(muhasabahEntries)
      .where(eq(muhasabahEntries.userId, userId))
      .orderBy(desc(muhasabahEntries.createdAt))
      .limit(limit);
  },

  /**
   * Get today's Muhasabah entry for a user (if exists).
   * Returns null if no entry exists for the given date string (YYYY-MM-DD).
   */
  async getTodayEntry(userId: string, todayDateStr: string) {
    const db = getDb();
    const rows = await db
      .select()
      .from(muhasabahEntries)
      .where(eq(muhasabahEntries.userId, userId))
      .orderBy(desc(muhasabahEntries.createdAt))
      .limit(1);

    const entry = rows[0];
    return entry?.createdAt?.startsWith(todayDateStr) ? entry : null;
  },

  /**
   * Count consecutive days with Muhasabah entries ending today.
   * Fetches last 30 entries and counts contiguous daily coverage going backward.
   */
  async getStreak(userId: string): Promise<number> {
    const entries = await muhasabahRepo.getByUserId(userId, 30);
    if (!entries.length) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < entries.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);

      const entryDate = new Date(entries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === expected.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },
};
