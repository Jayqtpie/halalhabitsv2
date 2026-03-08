/**
 * XP Ledger repository - typed data access for the xp_ledger table.
 * Pure TypeScript, no React imports.
 */
import { eq, and, gte, lt, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { xpLedger } from '../schema';
import type { NewXPLedger } from '../../types/database';

export const xpRepo = {
  async create(data: NewXPLedger) {
    const db = getDb();
    return db.insert(xpLedger).values(data).returning();
  },

  async getByUser(userId: string) {
    const db = getDb();
    return db
      .select()
      .from(xpLedger)
      .where(eq(xpLedger.userId, userId))
      .orderBy(xpLedger.earnedAt);
  },

  async getDailyTotal(userId: string, date: string) {
    const db = getDb();
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${xpLedger.amount}), 0)`,
      })
      .from(xpLedger)
      .where(
        and(
          eq(xpLedger.userId, userId),
          gte(xpLedger.earnedAt, date),
          lt(xpLedger.earnedAt, nextDateStr)
        )
      );

    return result[0]?.total ?? 0;
  },

  async getLifetimeTotal(userId: string) {
    const db = getDb();
    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${xpLedger.amount}), 0)`,
      })
      .from(xpLedger)
      .where(eq(xpLedger.userId, userId));

    return result[0]?.total ?? 0;
  },
};
