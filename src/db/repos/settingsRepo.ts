/**
 * Settings repository - typed data access for the settings table.
 * Pure TypeScript, no React imports.
 */
import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { settings } from '../schema';
import type { NewSettings } from '../../types/database';

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
      return db
        .update(settings)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(settings.userId, userId));
    }

    // For new settings, we need to generate an id
    const { generateId } = await import('../../utils/uuid');
    return db
      .insert(settings)
      .values({
        id: generateId(),
        userId,
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .returning();
  },
};
