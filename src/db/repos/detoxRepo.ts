/**
 * Detox repository — CRUD and queries for detox_sessions table.
 *
 * Privacy: detox_sessions is classified LOCAL_ONLY in the Privacy Gate.
 * This repo MUST NEVER call assertSyncable or syncQueueRepo — session data
 * is ephemeral and stays on device only.
 *
 * Day/week boundary parameters are passed by caller (not computed inside repo)
 * to keep repo pure and deterministic.
 */
import { eq, and, gte, lt, count } from 'drizzle-orm';
import { getDb } from '../client';
import { detoxSessions } from '../schema';
import type { NewDetoxSession } from '../../types/database';

export const detoxRepo = {
  /**
   * Create a new detox session.
   * No sync queue enqueue — LOCAL_ONLY classification.
   */
  async create(data: NewDetoxSession) {
    const db = getDb();
    return db.insert(detoxSessions).values(data).returning();
  },

  /**
   * Get the currently active session for a user (status='active').
   * Returns the session or null if none is active.
   */
  async getActiveSession(userId: string) {
    const db = getDb();
    const rows = await db
      .select()
      .from(detoxSessions)
      .where(
        and(
          eq(detoxSessions.userId, userId),
          eq(detoxSessions.status, 'active'),
        ),
      );
    return rows[0] ?? null;
  },

  /**
   * Get all sessions for a user within a calendar day.
   * dayStart and dayEnd are ISO strings (e.g. '2026-01-01T00:00:00.000Z' and '2026-01-02T00:00:00.000Z').
   * Caller is responsible for computing boundary values.
   */
  async getTodaySessions(userId: string, dayStart: string, dayEnd: string) {
    const db = getDb();
    return db
      .select()
      .from(detoxSessions)
      .where(
        and(
          eq(detoxSessions.userId, userId),
          gte(detoxSessions.startedAt, dayStart),
          lt(detoxSessions.startedAt, dayEnd),
        ),
      );
  },

  /**
   * Get all deep-variant sessions for a user since the start of the current week.
   * weekStart is an ISO string (e.g. Monday at 00:00:00.000Z).
   * Caller is responsible for computing the weekStart boundary.
   */
  async getThisWeekDeepSessions(userId: string, weekStart: string) {
    const db = getDb();
    return db
      .select()
      .from(detoxSessions)
      .where(
        and(
          eq(detoxSessions.userId, userId),
          eq(detoxSessions.variant, 'deep'),
          gte(detoxSessions.startedAt, weekStart),
        ),
      );
  },

  /**
   * Mark a session as completed, recording XP earned and end timestamp.
   */
  async complete(id: string, xpEarned: number, endedAt: string) {
    const db = getDb();
    return db
      .update(detoxSessions)
      .set({ status: 'completed', xpEarned, endedAt })
      .where(eq(detoxSessions.id, id))
      .returning();
  },

  /**
   * Mark a session as abandoned (early exit), recording XP penalty and end timestamp.
   */
  async exitEarly(id: string, xpPenalty: number, endedAt: string) {
    const db = getDb();
    return db
      .update(detoxSessions)
      .set({ status: 'abandoned', xpPenalty, endedAt })
      .where(eq(detoxSessions.id, id))
      .returning();
  },

  /**
   * Count total completed detox sessions for a user.
   * Used by the title engine for milestone-based title unlocks.
   */
  async getCompletedCount(userId: string): Promise<number> {
    const db = getDb();
    const rows = await db
      .select({ value: count() })
      .from(detoxSessions)
      .where(
        and(
          eq(detoxSessions.userId, userId),
          eq(detoxSessions.status, 'completed'),
        ),
      );
    return rows[0]?.value ?? 0;
  },
};
