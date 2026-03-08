/**
 * User repository - typed data access for the users table.
 * Pure TypeScript, no React imports.
 */
import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { users } from '../schema';
import type { NewUser } from '../../types/database';

export const userRepo = {
  async getById(id: string) {
    const db = getDb();
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] ?? null;
  },

  async create(data: NewUser) {
    const db = getDb();
    return db.insert(users).values(data).returning();
  },

  async updateXP(id: string, newTotalXP: number, newLevel: number) {
    const db = getDb();
    return db
      .update(users)
      .set({
        totalXp: newTotalXP,
        currentLevel: newLevel,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id));
  },

  async setActiveTitle(id: string, titleId: string | null) {
    const db = getDb();
    return db
      .update(users)
      .set({
        activeTitleId: titleId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id));
  },
};
