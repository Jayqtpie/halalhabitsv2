/**
 * Boss battle repository — CRUD and queries for boss_battles table.
 *
 * Privacy: boss_battles is classified PRIVATE in the Privacy Gate.
 * Nafs archetype data reveals personal struggle — this data MUST NEVER
 * be synced. This repo MUST NEVER call assertSyncable or syncQueueRepo.
 *
 * @see src/services/privacy-gate.ts — boss_battles PRIVATE classification
 * @see BOSS-08 requirement
 */
import { eq, and, desc, count, ne } from 'drizzle-orm';
import { getDb } from '../client';
import { bossBattles } from '../schema';
import type { BossBattle, NewBossBattle } from '../../types/database';

export const bossRepo = {
  /**
   * Create a new boss battle.
   * No sync queue enqueue — PRIVATE classification.
   */
  async create(data: NewBossBattle): Promise<BossBattle[]> {
    const db = getDb();
    return db.insert(bossBattles).values(data).returning();
  },

  /**
   * Get the currently active boss battle for a user (status='active').
   * Returns the battle or null if none is active.
   */
  async getActiveBattle(userId: string): Promise<BossBattle | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(bossBattles)
      .where(
        and(
          eq(bossBattles.userId, userId),
          eq(bossBattles.status, 'active'),
        ),
      );
    return rows[0] ?? null;
  },

  /**
   * Get the most recently ended battle for a user (status != 'active').
   * Used for cooldown calculation — returns most recently ended battle.
   */
  async getLastBattle(userId: string): Promise<BossBattle | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(bossBattles)
      .where(
        and(
          eq(bossBattles.userId, userId),
          ne(bossBattles.status, 'active'),
        ),
      )
      .orderBy(desc(bossBattles.endedAt))
      .limit(1);
    return rows[0] ?? null;
  },

  /**
   * Get all battles for a user, ordered by most recent first.
   */
  async getAllBattles(userId: string): Promise<BossBattle[]> {
    const db = getDb();
    return db
      .select()
      .from(bossBattles)
      .where(eq(bossBattles.userId, userId))
      .orderBy(desc(bossBattles.startedAt));
  },

  /**
   * Update the daily outcome — boss HP, current day, daily log, and timestamp.
   * Called each day as the player completes habits.
   */
  async updateDailyOutcome(
    id: string,
    bossHp: number,
    currentDay: number,
    dailyLog: string,
    updatedAt: string,
  ): Promise<BossBattle[]> {
    const db = getDb();
    return db
      .update(bossBattles)
      .set({ bossHp, currentDay, dailyLog, updatedAt })
      .where(eq(bossBattles.id, id))
      .returning();
  },

  /**
   * Mark a battle as defeated (boss HP reached 0 before maxDays).
   */
  async defeat(id: string, endedAt: string): Promise<BossBattle[]> {
    const db = getDb();
    return db
      .update(bossBattles)
      .set({ status: 'defeated', endedAt, updatedAt: endedAt })
      .where(eq(bossBattles.id, id))
      .returning();
  },

  /**
   * Mark a battle as escaped (player ran out of days without defeating boss).
   */
  async escape(id: string, endedAt: string): Promise<BossBattle[]> {
    const db = getDb();
    return db
      .update(bossBattles)
      .set({ status: 'escaped', endedAt, updatedAt: endedAt })
      .where(eq(bossBattles.id, id))
      .returning();
  },

  /**
   * Count total defeated boss battles for a user.
   * Used by the title engine for milestone-based title unlocks.
   */
  async getDefeatedCount(userId: string): Promise<number> {
    const db = getDb();
    const rows = await db
      .select({ value: count() })
      .from(bossBattles)
      .where(
        and(
          eq(bossBattles.userId, userId),
          eq(bossBattles.status, 'defeated'),
        ),
      );
    return rows[0]?.value ?? 0;
  },

  /**
   * Get distinct archetype IDs that were defeated by a user.
   * Used to track which nafs archetypes the player has conquered.
   */
  async getDefeatedArchetypes(userId: string): Promise<string[]> {
    const db = getDb();
    const rows = await db
      .selectDistinct({ archetype: bossBattles.archetype })
      .from(bossBattles)
      .where(
        and(
          eq(bossBattles.userId, userId),
          eq(bossBattles.status, 'defeated'),
        ),
      );
    return rows.map((r) => r.archetype);
  },
};
