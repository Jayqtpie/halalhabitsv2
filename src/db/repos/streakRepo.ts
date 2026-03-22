/**
 * Streak repository - typed data access for the streaks table.
 * Pure TypeScript, no React imports.
 */
import { eq, and } from 'drizzle-orm';
import { getDb } from '../client';
import { streaks, habits } from '../schema';
import type { NewStreak } from '../../types/database';
import { generateId } from '../../utils/uuid';

export const streakRepo = {
  /**
   * Get streak record for a specific habit.
   */
  async getByHabitId(habitId: string) {
    const db = getDb();
    const results = await db
      .select()
      .from(streaks)
      .where(eq(streaks.habitId, habitId));
    return results[0] ?? null;
  },

  /**
   * Get all streaks for a user's active habits.
   * Joins with habits table to filter by userId and active status.
   */
  async getAllForUser(userId: string) {
    const db = getDb();
    return db
      .select({
        id: streaks.id,
        habitId: streaks.habitId,
        currentCount: streaks.currentCount,
        longestCount: streaks.longestCount,
        lastCompletedAt: streaks.lastCompletedAt,
        multiplier: streaks.multiplier,
        isRebuilt: streaks.isRebuilt,
        rebuiltAt: streaks.rebuiltAt,
        mercyRecoveryDay: streaks.mercyRecoveryDay,
        preBreakStreak: streaks.preBreakStreak,
        updatedAt: streaks.updatedAt,
      })
      .from(streaks)
      .innerJoin(habits, eq(streaks.habitId, habits.id))
      .where(and(eq(habits.userId, userId), eq(habits.status, 'active')));
  },

  /**
   * Create or update a streak record.
   * Uses onConflictDoUpdate on the habitId unique index.
   */
  async upsert(habitId: string, data: Partial<Omit<NewStreak, 'id' | 'habitId'>>) {
    const db = getDb();
    const now = new Date().toISOString();
    const existing = await this.getByHabitId(habitId);

    if (existing) {
      return db
        .update(streaks)
        .set({ ...data, updatedAt: now })
        .where(eq(streaks.habitId, habitId));
    }

    return db.insert(streaks).values({
      id: generateId(),
      habitId,
      currentCount: 0,
      longestCount: 0,
      multiplier: 1.0,
      isRebuilt: false,
      mercyRecoveryDay: 0,
      preBreakStreak: 0,
      updatedAt: now,
      ...data,
    });
  },

  /**
   * Update Mercy Mode columns for a habit's streak.
   */
  async updateMercyMode(habitId: string, recoveryDay: number, preBreakStreak: number) {
    const db = getDb();
    return db
      .update(streaks)
      .set({
        mercyRecoveryDay: recoveryDay,
        preBreakStreak,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(streaks.habitId, habitId));
  },

  /**
   * Reset streak to zero (fresh start).
   * Clears mercy mode columns as well.
   */
  async resetStreak(habitId: string) {
    const db = getDb();
    return db
      .update(streaks)
      .set({
        currentCount: 0,
        longestCount: 0,
        multiplier: 1.0,
        lastCompletedAt: null,
        isRebuilt: false,
        rebuiltAt: null,
        mercyRecoveryDay: 0,
        preBreakStreak: 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(streaks.habitId, habitId));
  },
};
