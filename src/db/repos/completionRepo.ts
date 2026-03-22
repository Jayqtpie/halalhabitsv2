/**
 * Completion repository - typed data access for the habit_completions table.
 * Pure TypeScript, no React imports.
 */
import { eq, and, gte, lt } from 'drizzle-orm';
import { getDb } from '../client';
import { habitCompletions, habits } from '../schema';
import type { NewHabitCompletion } from '../../types/database';

export const completionRepo = {
  /**
   * Get completions for a specific habit within a date range.
   * Uses completedAt column for date filtering.
   */
  async getForDate(habitId: string, dateStart: string, dateEnd: string) {
    const db = getDb();
    return db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habitId),
          gte(habitCompletions.completedAt, dateStart),
          lt(habitCompletions.completedAt, dateEnd),
        ),
      );
  },

  /** Alias for getForDate — kept for calendar/heatmap call sites. */
  async getForDateRange(habitId: string, startDate: string, endDate: string) {
    return completionRepo.getForDate(habitId, startDate, endDate);
  },

  /**
   * Get ALL completions for a user on a given day (for daily view).
   * Joins with habits table to filter by userId.
   */
  async getAllForDate(userId: string, dateStart: string, dateEnd: string) {
    const db = getDb();
    return db
      .select({
        id: habitCompletions.id,
        habitId: habitCompletions.habitId,
        completedAt: habitCompletions.completedAt,
        xpEarned: habitCompletions.xpEarned,
        streakMultiplier: habitCompletions.streakMultiplier,
        createdAt: habitCompletions.createdAt,
      })
      .from(habitCompletions)
      .innerJoin(habits, eq(habitCompletions.habitId, habits.id))
      .where(
        and(
          eq(habits.userId, userId),
          gte(habitCompletions.completedAt, dateStart),
          lt(habitCompletions.completedAt, dateEnd),
        ),
      );
  },

  /**
   * Insert a new completion record.
   */
  async create(data: NewHabitCompletion) {
    const db = getDb();
    return db.insert(habitCompletions).values(data).returning();
  },

  /**
   * Check if a habit has already been completed today (idempotency guard).
   */
  async hasCompletionToday(habitId: string, dayStart: string, dayEnd: string) {
    const db = getDb();
    const results = await db
      .select({ id: habitCompletions.id })
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, habitId),
          gte(habitCompletions.completedAt, dayStart),
          lt(habitCompletions.completedAt, dayEnd),
        ),
      )
      .limit(1);
    return results.length > 0;
  },
};
