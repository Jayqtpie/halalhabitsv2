/**
 * Habit repository - typed data access for the habits table.
 * Pure TypeScript, no React imports.
 */
import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { habits } from '../schema';
import type { NewHabit } from '../../types/database';
import { syncQueueRepo } from './syncQueueRepo';
import { assertSyncable } from '../../services/privacy-gate';
import { useAuthStore } from '../../stores/authStore';

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
    const result = await db.insert(habits).values(data).returning();

    // Enqueue for sync (non-blocking, skip for guests)
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        assertSyncable('habits');
        syncQueueRepo.enqueue('habits', data.id, 'INSERT', data).catch(() => {});
      }
    } catch { /* enqueue must never block local write */ }

    return result;
  },

  async update(id: string, data: Partial<Omit<NewHabit, 'id'>>) {
    const db = getDb();
    const result = await db
      .update(habits)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(habits.id, id));

    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        assertSyncable('habits');
        const updated = await db.select().from(habits).where(eq(habits.id, id));
        if (updated[0]) {
          syncQueueRepo.enqueue('habits', id, 'UPDATE', updated[0]).catch(() => {});
        }
      }
    } catch {}

    return result;
  },

  async archive(id: string) {
    const db = getDb();
    const result = await db
      .update(habits)
      .set({ status: 'archived', updatedAt: new Date().toISOString() })
      .where(eq(habits.id, id));

    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        assertSyncable('habits');
        const updated = await db.select().from(habits).where(eq(habits.id, id));
        if (updated[0]) {
          syncQueueRepo.enqueue('habits', id, 'UPDATE', updated[0]).catch(() => {});
        }
      }
    } catch {}

    return result;
  },

  async reorder(userId: string, orderedIds: string[]) {
    const db = getDb();
    const now = new Date().toISOString();
    // Update sort_order for each habit based on position in orderedIds
    // NOTE: reorder is cosmetic, NOT enqueued for sync (per design decision)
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(habits)
        .set({ sortOrder: i, updatedAt: now })
        .where(and(eq(habits.id, orderedIds[i]), eq(habits.userId, userId)));
    }
  },
};
