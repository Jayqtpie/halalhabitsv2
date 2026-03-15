/**
 * Quest repository - typed data access for the quests table.
 * Pure TypeScript, no React imports.
 */
import { eq, and, lt, gte, ne, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { quests } from '../schema';
import type { NewQuest } from '../../types/database';

export const questRepo = {
  /**
   * Get active (available + in_progress) quests for a user.
   */
  async getActive(userId: string) {
    const db = getDb();
    return db
      .select()
      .from(quests)
      .where(
        and(
          eq(quests.userId, userId),
          ne(quests.status, 'expired'),
          ne(quests.status, 'completed'),
        )
      );
  },

  /**
   * Get all quests for a user regardless of status.
   */
  async getByUser(userId: string) {
    const db = getDb();
    return db
      .select()
      .from(quests)
      .where(eq(quests.userId, userId));
  },

  /**
   * Get completed quests for a user.
   */
  async getCompleted(userId: string) {
    const db = getDb();
    return db
      .select()
      .from(quests)
      .where(
        and(
          eq(quests.userId, userId),
          eq(quests.status, 'completed'),
        )
      );
  },

  /**
   * Get distinct template IDs used by a user in the last N days.
   * Used for no-repeat-within-7-days tracking in quest selection.
   */
  async getRecentTemplateIds(userId: string, days: number): Promise<string[]> {
    const db = getDb();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString();

    const rows = await db
      .selectDistinct({ templateId: quests.templateId })
      .from(quests)
      .where(
        and(
          eq(quests.userId, userId),
          gte(quests.createdAt, cutoffStr),
        )
      );

    // Filter out nulls (quests without templateId)
    return rows.map(r => r.templateId).filter((id): id is string => id !== null);
  },

  async create(data: NewQuest) {
    const db = getDb();
    return db.insert(quests).values(data).returning();
  },

  async updateProgress(id: string, progress: number) {
    const db = getDb();
    return db
      .update(quests)
      .set({ progress, status: 'in_progress' })
      .where(eq(quests.id, id));
  },

  /**
   * Atomically increment quest progress by 1, clamped to targetValue.
   * Uses raw SQL MIN(progress + 1, target_value) to prevent race conditions.
   * Sets status to 'in_progress' (caller should call complete() if progress reaches targetValue).
   */
  async updateProgressAtomic(id: string, targetValue: number) {
    const db = getDb();
    return db
      .update(quests)
      .set({
        progress: sql`MIN(${quests.progress} + 1, ${targetValue})`,
        status: 'in_progress',
      })
      .where(eq(quests.id, id))
      .returning();
  },

  async complete(id: string) {
    const db = getDb();
    return db
      .update(quests)
      .set({
        status: 'completed',
        completedAt: new Date().toISOString(),
      })
      .where(eq(quests.id, id));
  },

  /**
   * Expire quests past their expiresAt timestamp.
   * Expires both 'available' and 'in_progress' quests.
   */
  async expireOld() {
    const db = getDb();
    const now = new Date().toISOString();
    return db
      .update(quests)
      .set({ status: 'expired' })
      .where(
        and(
          lt(quests.expiresAt, now),
          ne(quests.status, 'completed'),
          ne(quests.status, 'expired'),
        )
      );
  },
};
