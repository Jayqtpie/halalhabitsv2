/**
 * Quest repository - typed data access for the quests table.
 * Pure TypeScript, no React imports.
 */
import { eq, and, lt } from 'drizzle-orm';
import { getDb } from '../client';
import { quests } from '../schema';
import type { NewQuest } from '../../types/database';

export const questRepo = {
  async getActive(userId: string) {
    const db = getDb();
    return db
      .select()
      .from(quests)
      .where(
        and(
          eq(quests.userId, userId),
          eq(quests.status, 'available')
        )
      );
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

  async expireOld() {
    const db = getDb();
    const now = new Date().toISOString();
    return db
      .update(quests)
      .set({ status: 'expired' })
      .where(
        and(
          lt(quests.expiresAt, now),
          eq(quests.status, 'available')
        )
      );
  },
};
