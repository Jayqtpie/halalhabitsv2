/**
 * XP Ledger repository - typed data access for the xp_ledger table.
 * Pure TypeScript, no React imports.
 */
import { eq, and, gte, lt, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { xpLedger } from '../schema';
import type { NewXPLedger } from '../../types/database';
import { syncQueueRepo } from './syncQueueRepo';
import { assertSyncable } from '../../services/privacy-gate';
import { useAuthStore } from '../../stores/authStore';

export const xpRepo = {
  async create(data: NewXPLedger) {
    const db = getDb();
    const result = await db.insert(xpLedger).values(data).returning();

    // Enqueue for sync (non-blocking, skip for guests)
    // Privacy: strip sourceId and sourceType before syncing — these fields
    // combined with the habits table could reconstruct worship completion logs
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        assertSyncable('xp_ledger');
        const { sourceId: _sid, sourceType: _stype, ...syncSafeData } = data;
        syncQueueRepo.enqueue('xp_ledger', data.id, 'INSERT', {
          ...syncSafeData,
          sourceId: null,
          sourceType: 'redacted',
        }).catch(() => {});
      }
    } catch {
      console.warn('[xpRepo] sync enqueue failed');
    }

    return result;
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
