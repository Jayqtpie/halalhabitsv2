/**
 * Settings repository - typed data access for the settings table.
 * Pure TypeScript, no React imports.
 */
import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { settings } from '../schema';
import type { NewSettings } from '../../types/database';
import { syncQueueRepo } from './syncQueueRepo';
import { assertSyncable } from '../../services/privacy-gate';
import { useAuthStore } from '../../stores/authStore';

export const settingsRepo = {
  async getByUser(userId: string) {
    const db = getDb();
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, userId));
    return result[0] ?? null;
  },

  async upsert(userId: string, data: Partial<Omit<NewSettings, 'id' | 'userId'>>) {
    const db = getDb();
    const existing = await this.getByUser(userId);

    if (existing) {
      await db
        .update(settings)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(settings.userId, userId));
    } else {
      // For new settings, we need to generate an id
      const { generateId } = await import('../../utils/uuid');
      await db
        .insert(settings)
        .values({
          id: generateId(),
          userId,
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .returning();
    }

    // Enqueue for sync after upsert — always use UPDATE operation (safe for both insert/update)
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        assertSyncable('settings');
        const updated = await db.select().from(settings).where(eq(settings.userId, userId));
        if (updated[0]) {
          syncQueueRepo.enqueue('settings', updated[0].id, 'UPDATE', updated[0]).catch(() => {});
        }
      }
    } catch (e) { console.warn('[settingsRepo] sync enqueue failed:', e); }
  },
};
