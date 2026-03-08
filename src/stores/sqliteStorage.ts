/**
 * Zustand persist storage adapter backed by SQLite.
 *
 * Implements the StateStorage interface to read/write the _zustand_store table.
 * This is the ONLY bridge between Zustand persist and the local database.
 */
import type { StateStorage } from 'zustand/middleware';
import { getDb } from '../db/client';
import { zustandStore } from '../db/schema';
import { eq } from 'drizzle-orm';

export const sqliteStorage: StateStorage = {
  async getItem(name: string): Promise<string | null> {
    const db = getDb();
    const result = await db
      .select({ value: zustandStore.value })
      .from(zustandStore)
      .where(eq(zustandStore.key, name));
    return result[0]?.value ?? null;
  },

  async setItem(name: string, value: string): Promise<void> {
    const db = getDb();
    await db
      .insert(zustandStore)
      .values({ key: name, value })
      .onConflictDoUpdate({ target: zustandStore.key, set: { value } });
  },

  async removeItem(name: string): Promise<void> {
    const db = getDb();
    await db.delete(zustandStore).where(eq(zustandStore.key, name));
  },
};
