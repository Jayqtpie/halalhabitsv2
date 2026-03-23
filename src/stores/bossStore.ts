/**
 * Boss Store — Zustand state for Nafs Boss Arena battles.
 *
 * Orchestrates full battle lifecycle:
 *   startBattle -> bossRepo.create -> load state
 *   processDailyOutcome -> damage/healing -> defeat or escape or continue
 *   loadActiveBattle -> multi-day catch-up for missed days
 *   abandonBattle -> escape flow with partial XP
 *
 * NO persist middleware — battle data lives in SQLite via bossRepo.
 * PRIVATE: boss_battles data never syncs (nafs archetype reveals personal struggle).
 */
import { create } from 'zustand';
import { bossRepo } from '../db/repos/bossRepo';
import {
  canStartBattle,
  calculateBossMaxHp,
  calculateBossXpReward,
  calculateDailyDamage,
  calculateDailyHealing,
  applyDailyOutcome,
  calculatePartialXp,
  getMaxDays,
} from '../domain/boss-engine';
import type { DailyLogEntry } from '../domain/boss-engine';
import type { ArchetypeId } from '../domain/boss-content';
import type { BossBattle } from '../types/database';
import { useGameStore } from './gameStore';
import { generateId } from '../utils/uuid';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get today's date string in YYYY-MM-DD format */
function todayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

/** Get YYYY-MM-DD from an ISO timestamp */
function dateStr(isoString: string): string {
  return isoString.split('T')[0];
}

/** Compute the number of calendar days between two date strings (YYYY-MM-DD) */
function daysBetween(dateA: string, dateB: string): number {
  const msA = new Date(dateA).getTime();
  const msB = new Date(dateB).getTime();
  return Math.round(Math.abs(msB - msA) / 86400000);
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface BossState {
  activeBattle: BossBattle | null;
  loading: boolean;
  pendingDefeatCelebration: { archetype: ArchetypeId; xpAwarded: number } | null;
  pendingEscapeNotice: { archetype: ArchetypeId; damagePercent: number; xpAwarded: number } | null;

  loadActiveBattle: (userId: string) => Promise<void>;
  startBattle: (archetype: ArchetypeId, playerLevel: number, userId: string) => Promise<boolean>;
  processDailyOutcome: (userId: string, habitsCompleted: number, totalHabits: number) => Promise<void>;
  abandonBattle: (userId: string) => Promise<void>;
  canStart: (userId: string) => Promise<boolean>;
  clearCelebration: () => void;
  clearEscapeNotice: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBossStore = create<BossState>((set, get) => ({
  activeBattle: null,
  loading: false,
  pendingDefeatCelebration: null,
  pendingEscapeNotice: null,

  // ─── loadActiveBattle ─────────────────────────────────────────────────────

  loadActiveBattle: async (userId: string) => {
    set({ loading: true });
    try {
      const battle = await bossRepo.getActiveBattle(userId);

      if (!battle) {
        set({ activeBattle: null, loading: false });
        return;
      }

      // Multi-day catch-up: process missed days if app was closed
      const lastUpdatedDate = dateStr(battle.updatedAt);
      const today = todayDateStr();
      const missedDays = daysBetween(lastUpdatedDate, today);

      if (missedDays > 0) {
        let currentHp = battle.bossHp;
        let currentDay = battle.currentDay;
        const maxDays = battle.maxDays;
        const bossMaxHp = battle.bossMaxHp;
        const dailyLog: DailyLogEntry[] = JSON.parse(battle.dailyLog ?? '[]');

        for (let i = 0; i < missedDays; i++) {
          // Full miss for each untracked day (conservative: app was closed)
          const damage = 0;
          const healing = calculateDailyHealing(1, 1, bossMaxHp, battle.mercyMode);
          const newHp = applyDailyOutcome(currentHp, bossMaxHp, damage, healing);

          // Generate a date for this missed day
          const missedDate = new Date(
            new Date(lastUpdatedDate).getTime() + (i + 1) * 86400000
          )
            .toISOString()
            .split('T')[0];

          dailyLog.push({
            day: currentDay,
            date: missedDate,
            habitsCompleted: 0,
            totalHabits: 1,
            damage,
            healing,
            hpAfter: newHp,
          });

          currentHp = newHp;
          currentDay = currentDay + 1;

          // Write this day's outcome to DB
          const updatedAt = new Date(
            new Date(lastUpdatedDate).getTime() + (i + 1) * 86400000
          ).toISOString();
          await bossRepo.updateDailyOutcome(
            battle.id,
            currentHp,
            currentDay,
            JSON.stringify(dailyLog),
            updatedAt,
          );

          // Check for defeat
          if (currentHp <= 0) {
            const now = new Date().toISOString();
            await bossRepo.defeat(battle.id, now);
            const playerLevel = useGameStore.getState().currentLevel;
            const fullXp = calculateBossXpReward(playerLevel);
            await useGameStore.getState().awardXP(userId, fullXp, 1.0, 'boss_defeat', battle.id);
            await useGameStore.getState().checkTitles(userId);
            set({
              activeBattle: null,
              loading: false,
              pendingDefeatCelebration: { archetype: battle.archetype as ArchetypeId, xpAwarded: fullXp },
            });
            return;
          }

          // Check for day limit exceeded
          if (currentDay > maxDays) {
            const now = new Date().toISOString();
            const playerLevel = useGameStore.getState().currentLevel;
            const partialXp = calculatePartialXp(calculateBossXpReward(playerLevel), bossMaxHp, currentHp);
            const damagePercent = Math.round(((bossMaxHp - currentHp) / bossMaxHp) * 100);
            await bossRepo.escape(battle.id, now);
            await useGameStore.getState().awardXP(userId, partialXp, 1.0, 'boss_defeat', battle.id);
            set({
              activeBattle: null,
              loading: false,
              pendingEscapeNotice: { archetype: battle.archetype as ArchetypeId, damagePercent, xpAwarded: partialXp },
            });
            return;
          }
        }
      }

      // Reload fresh battle state from DB
      const freshBattle = await bossRepo.getActiveBattle(userId);
      set({ activeBattle: freshBattle, loading: false });
    } catch (e) {
      set({ loading: false });
      console.warn('[bossStore] loadActiveBattle error:', e);
    }
  },

  // ─── startBattle ──────────────────────────────────────────────────────────

  startBattle: async (archetype: ArchetypeId, playerLevel: number, userId: string) => {
    try {
      // Check eligibility
      const lastBattle = await bossRepo.getLastBattle(userId);
      const activeBattle = await bossRepo.getActiveBattle(userId);
      const now = new Date().toISOString();

      if (!canStartBattle(playerLevel, activeBattle, lastBattle?.endedAt ?? null, now, 3)) {
        return false;
      }

      const bossMaxHp = calculateBossMaxHp(playerLevel);
      const maxDays = getMaxDays(playerLevel);
      // Determine if the player currently has any active mercy mode across habits
      // This is used to halve boss healing during the battle (compassionate difficulty)
      const { useHabitStore } = await import('./habitStore');
      const habitMercyModes = useHabitStore.getState().mercyModes;
      const mercyMode = Object.values(habitMercyModes).some(m => m?.active === true);
      const id = generateId();

      await bossRepo.create({
        id,
        userId,
        archetype,
        bossHp: bossMaxHp,
        bossMaxHp,
        currentDay: 1,
        maxDays,
        dailyLog: '[]',
        status: 'active',
        mercyMode,
        startedAt: now,
        updatedAt: now,
      });

      // Reload active battle
      const fresh = await bossRepo.getActiveBattle(userId);
      set({ activeBattle: fresh });

      return true;
    } catch (e) {
      console.warn('[bossStore] startBattle error:', e);
      return false;
    }
  },

  // ─── processDailyOutcome ──────────────────────────────────────────────────

  processDailyOutcome: async (userId: string, habitsCompleted: number, totalHabits: number) => {
    try {
      const battle = get().activeBattle;
      if (!battle) return;

      // Guard: already processed today
      if (dateStr(battle.updatedAt) === todayDateStr()) return;

      const damage = calculateDailyDamage(habitsCompleted, totalHabits, battle.bossMaxHp);
      const missed = totalHabits - habitsCompleted;
      const healing = calculateDailyHealing(missed, totalHabits, battle.bossMaxHp, battle.mercyMode);
      const newHp = applyDailyOutcome(battle.bossHp, battle.bossMaxHp, damage, healing);
      const newDay = battle.currentDay + 1;
      const now = new Date().toISOString();

      const dailyLog: DailyLogEntry[] = JSON.parse(battle.dailyLog ?? '[]');
      dailyLog.push({
        day: battle.currentDay,
        date: todayDateStr(),
        habitsCompleted,
        totalHabits,
        damage,
        healing,
        hpAfter: newHp,
      });
      const newDailyLog = JSON.stringify(dailyLog);

      await bossRepo.updateDailyOutcome(battle.id, newHp, newDay, newDailyLog, now);

      if (newHp <= 0) {
        // Defeat flow
        await bossRepo.defeat(battle.id, now);
        const playerLevel = useGameStore.getState().currentLevel;
        const fullXp = calculateBossXpReward(playerLevel);
        await useGameStore.getState().awardXP(userId, fullXp, 1.0, 'boss_defeat', battle.id);
        await useGameStore.getState().checkTitles(userId);
        set({
          activeBattle: null,
          pendingDefeatCelebration: { archetype: battle.archetype as ArchetypeId, xpAwarded: fullXp },
        });
      } else if (newDay > battle.maxDays) {
        // Escape flow — player ran out of days
        const playerLevel = useGameStore.getState().currentLevel;
        const partialXp = calculatePartialXp(calculateBossXpReward(playerLevel), battle.bossMaxHp, newHp);
        const damagePercent = Math.round(((battle.bossMaxHp - newHp) / battle.bossMaxHp) * 100);
        await bossRepo.escape(battle.id, now);
        await useGameStore.getState().awardXP(userId, partialXp, 1.0, 'boss_defeat', battle.id);
        set({
          activeBattle: null,
          pendingEscapeNotice: { archetype: battle.archetype as ArchetypeId, damagePercent, xpAwarded: partialXp },
        });
      } else {
        // Battle continues — reload fresh state
        const fresh = await bossRepo.getActiveBattle(userId);
        set({ activeBattle: fresh });
      }
    } catch (e) {
      console.warn('[bossStore] processDailyOutcome error:', e);
    }
  },

  // ─── abandonBattle ────────────────────────────────────────────────────────

  abandonBattle: async (userId: string) => {
    try {
      const battle = get().activeBattle;
      if (!battle) return;

      const now = new Date().toISOString();
      const playerLevel = useGameStore.getState().currentLevel;
      const partialXp = calculatePartialXp(
        calculateBossXpReward(playerLevel),
        battle.bossMaxHp,
        battle.bossHp,
      );
      const damagePercent = Math.round(((battle.bossMaxHp - battle.bossHp) / battle.bossMaxHp) * 100);

      await bossRepo.escape(battle.id, now);
      await useGameStore.getState().awardXP(userId, partialXp, 1.0, 'boss_defeat', battle.id);

      set({
        activeBattle: null,
        pendingEscapeNotice: { archetype: battle.archetype as ArchetypeId, damagePercent, xpAwarded: partialXp },
      });
    } catch (e) {
      console.warn('[bossStore] abandonBattle error:', e);
    }
  },

  // ─── canStart ─────────────────────────────────────────────────────────────

  canStart: async (userId: string) => {
    try {
      const lastBattle = await bossRepo.getLastBattle(userId);
      const activeBattle = await bossRepo.getActiveBattle(userId);
      const level = useGameStore.getState().currentLevel;
      return canStartBattle(level, activeBattle, lastBattle?.endedAt ?? null, new Date().toISOString(), 3);
    } catch (e) {
      console.warn('[bossStore] canStart error:', e);
      return false;
    }
  },

  // ─── clearCelebration ─────────────────────────────────────────────────────

  clearCelebration: () => set({ pendingDefeatCelebration: null }),

  // ─── clearEscapeNotice ────────────────────────────────────────────────────

  clearEscapeNotice: () => set({ pendingEscapeNotice: null }),
}));
