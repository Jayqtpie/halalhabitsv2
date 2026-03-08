/**
 * Habit repository - typed data access for the habits table.
 * Pure TypeScript, no React imports.
 */
import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { habits } from '../schema';
import type { NewHabit } from '../../types/database';

export const habitRepo = {
  async getActive(userId: string) {
    const db = getDb();
    return db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.status, 'active')))
      .orderBy(habits.sortOrder);
  },

  async getAll(userId: string) {
    const db = getDb();
    return db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))
      .orderBy(habits.sortOrder);
  },

  async getById(id: string) {
    const db = getDb();
    const result = await db.select().from(habits).where(eq(habits.id, id));
    return result[0] ?? null;
  },

  async create(data: NewHabit) {
    const db = getDb();
    return db.insert(habits).values(data).returning();
  },

  async update(id: string, data: Partial<Omit<NewHabit, 'id'>>) {
    const db = getDb();
    return db
      .update(habits)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(habits.id, id));
  },

  async archive(id: string) {
    const db = getDb();
    return db
      .update(habits)
      .set({ status: 'archived', updatedAt: new Date().toISOString() })
      .where(eq(habits.id, id));
  },

  async reorder(userId: string, orderedIds: string[]) {
    const db = getDb();
    const now = new Date().toISOString();
    // Update sort_order for each habit based on position in orderedIds
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(habits)
        .set({ sortOrder: i, updatedAt: now })
        .where(and(eq(habits.id, orderedIds[i]), eq(habits.userId, userId)));
    }
  },
};
