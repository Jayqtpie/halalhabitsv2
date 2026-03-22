/**
 * User repository - typed data access for the users table.
 * Pure TypeScript, no React imports.
 */
import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { users } from '../schema';
import type { NewUser } from '../../types/database';
import { syncQueueRepo } from './syncQueueRepo';
import { assertSyncable } from '../../services/privacy-gate';
import { useAuthStore } from '../../stores/authStore';

export const userRepo = {
  async getById(id: string) {
    const db = getDb();
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] ?? null;
  },

  async create(data: NewUser) {
    const db = getDb();
    const result = await db.insert(users).values(data).returning();

    // Enqueue for sync (non-blocking, skip for guests)
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        assertSyncable('users');
        syncQueueRepo.enqueue('users', data.id, 'INSERT', data).catch(() => {});
      }
    } catch (e) { console.warn('[userRepo] sync enqueue failed:', e); }

    return result;
  },

  async updateXP(id: string, newTotalXP: number, newLevel: number) {
    const db = getDb();
    const result = await db
      .update(users)
      .set({
        totalXp: newTotalXP,
        currentLevel: newLevel,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id));

    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        assertSyncable('users');
        const updated = await db.select().from(users).where(eq(users.id, id));
        if (updated[0]) {
          syncQueueRepo.enqueue('users', id, 'UPDATE', updated[0]).catch(() => {});
        }
      }
    } catch (e) { console.warn('[userRepo] sync enqueue failed:', e); }

    return result;
  },

  async setActiveTitle(id: string, titleId: string | null) {
    const db = getDb();
    const result = await db
      .update(users)
      .set({
        activeTitleId: titleId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id));

    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        assertSyncable('users');
        const updated = await db.select().from(users).where(eq(users.id, id));
        if (updated[0]) {
          syncQueueRepo.enqueue('users', id, 'UPDATE', updated[0]).catch(() => {});
        }
      }
    } catch (e) { console.warn('[userRepo] sync enqueue failed:', e); }

    return result;
  },
};
