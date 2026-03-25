/**
 * Habit domain state management.
 *
 * Orchestrates the full completion flow: create completion record,
 * update streak via streak-engine, persist to SQLite, and update UI state.
 *
 * NO persist middleware - habit data lives in SQLite via repository layer.
 *
 * Usage with useShallow for multi-field selectors:
 *   const { habits, loading } = useHabitStore(useShallow(s => ({ habits: s.habits, loading: s.loading })));
 */
import { create } from 'zustand';
import { eq } from 'drizzle-orm';
import type { Habit, NewHabit } from '../types/database';
import type { StreakState, MercyModeState, HabitWithStatus } from '../types/habits';
import { habitRepo, completionRepo, streakRepo } from '../db/repos';
import { getDb } from '../db/client';
import { users } from '../db/schema';
import {
  processCompletion,
  detectStreakBreak,
  processRecovery,
  startFreshReset,
} from '../domain/streak-engine';
import { sortHabitsForDisplay } from '../domain/habit-sorter';
import { generateId } from '../utils/uuid';
import { useGameStore } from './gameStore';
import { registerHabitStore } from './bridge';
import { isFriday, getFridayMultiplier, combinedMultiplier } from '../domain/friday-engine';
import { useDetoxStore } from './detoxStore';
import { isProtectedByDetox, getSessionEndTime } from '../domain/detox-engine';

// ─── Base XP Map ──────────────────────────────────────────────────────────────

/**
 * Base XP values per habit type, from blueprint section 03.
 * Fajr gets 50 XP (highest salah) due to difficulty of waking early.
 * All other salah: 15 XP. Custom habits default to 15 XP.
 */
function getBaseXP(habitType: string): number {
  const XP_MAP: Record<string, number> = {
    salah_fajr: 50,
    salah_dhuhr: 15,
    salah_asr: 15,
    salah_maghrib: 15,
    salah_isha: 15,
    quran: 20,
    dhikr: 10,
    adhkar: 10,
    adhkar_evening: 10,
    fasting: 25,
    sadaqah: 15,
    tahajjud: 20,
    dua: 10,
    muhasabah: 20,
  };
  return XP_MAP[habitType] ?? 15; // Default 15 XP for custom habits
}

// ─── Date Helpers ─────────────────────────────────────────────────────

/** Get midnight local time boundaries for a given date string or today. */
function getDayBoundaries(date?: string): { dayStart: string; dayEnd: string } {
  const d = date ? new Date(date) : new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return {
    dayStart: start.toISOString(),
    dayEnd: end.toISOString(),
  };
}

// ─── Denormalized Streak Sync ─────────────────────────────────────────

/**
 * Update the denormalized current_streak_count on the users table.
 *
 * Privacy Gate note: the streaks table is PRIVATE and never syncs.
 * The users.current_streak_count field is SYNCABLE and safely surfaces
 * an aggregated streak count for buddy profiles without exposing PRIVATE
 * streak details (habit names, completion timestamps, etc).
 *
 * Called after every streak mutation so buddy profile views stay current.
 */
async function syncStreakToUser(userId: string, streakCount: number): Promise<void> {
  try {
    const db = getDb();
    await db
      .update(users)
      .set({
        currentStreakCount: streakCount,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
  } catch (e) {
    // Non-fatal: buddy streak display may lag, but core habit data is safe
    console.warn('[habitStore] syncStreakToUser error:', e);
  }
}

// ─── Store Interface ──────────────────────────────────────────────────

interface HabitState {
  habits: Habit[];
  completions: Record<string, boolean>; // habitId -> completedToday
  streaks: Record<string, StreakState>; // habitId -> streak state
  mercyModes: Record<string, MercyModeState>; // habitId -> mercy mode state
  dailyProgress: { completed: number; total: number };
  loading: boolean;
  error: string | null;

  // Existing methods (kept for backward compatibility)
  loadHabits: (userId: string) => Promise<void>;
  addHabit: (habit: NewHabit) => Promise<void>;
  archiveHabit: (habitId: string) => Promise<void>;

  // New methods for completion/streak orchestration
  loadDailyState: (userId: string, date?: string) => Promise<void>;
  completeHabit: (habitId: string, userId: string) => Promise<void>;
  startRecovery: (habitId: string) => Promise<void>;
  resetStreak: (habitId: string) => Promise<void>;
  updateHabit: (habitId: string, data: Partial<Omit<NewHabit, 'id'>>) => Promise<void>;
  getHabitsForDisplay: () => HabitWithStatus[];
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  completions: {},
  streaks: {},
  mercyModes: {},
  dailyProgress: { completed: 0, total: 0 },
  loading: false,
  error: null,

  // ─── Existing Methods ─────────────────────────────────────────────

  loadHabits: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const habits = await habitRepo.getActive(userId);
      set({ habits, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addHabit: async (habit: NewHabit) => {
    try {
      const [created] = await habitRepo.create(habit);
      set((state) => ({ habits: [...state.habits, created] }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  archiveHabit: async (habitId: string) => {
    try {
      await habitRepo.archive(habitId);
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== habitId),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  // ─── New: Daily State Loading ─────────────────────────────────────

  loadDailyState: async (userId: string, date?: string) => {
    set({ loading: true, error: null });
    try {
      const { dayStart, dayEnd } = getDayBoundaries(date);
      const now = date || new Date().toISOString();

      // Load habits, completions, and streaks in parallel
      const [activeHabits, todayCompletions, userStreaks] = await Promise.all([
        habitRepo.getActive(userId),
        completionRepo.getAllForDate(userId, dayStart, dayEnd),
        streakRepo.getAllForUser(userId),
      ]);

      // Build completion lookup: habitId -> completedToday
      const completions: Record<string, boolean> = {};
      const completedHabitIds = new Set(todayCompletions.map((c) => c.habitId));
      for (const habit of activeHabits) {
        completions[habit.id] = completedHabitIds.has(habit.id);
      }

      // Build streak lookup: habitId -> StreakState
      const streakMap: Record<string, StreakState> = {};
      const mercyModes: Record<string, MercyModeState> = {};

      for (const s of userStreaks) {
        const streakState: StreakState = {
          currentCount: s.currentCount,
          longestCount: s.longestCount,
          multiplier: s.multiplier,
          lastCompletedAt: s.lastCompletedAt,
          isRebuilt: s.isRebuilt,
        };

        // Check for mercy mode from persisted columns
        if (s.mercyRecoveryDay > 0 || s.preBreakStreak > 0) {
          const mercyState: MercyModeState = {
            active: s.mercyRecoveryDay > 0 && s.mercyRecoveryDay < 3,
            recoveryDay: s.mercyRecoveryDay,
            preBreakStreak: s.preBreakStreak,
          };
          streakState.mercyMode = mercyState;
          if (mercyState.active) {
            mercyModes[s.habitId] = mercyState;
          }
        }

        // Check detox protection before applying streak break
        const activeDetox = useDetoxStore.getState().activeSession;
        if (activeDetox && !completions[s.habitId]) {
          // Use full-day window for streak protection during active detox
          const habitWindowStart = dayStart;
          const habitWindowEnd = dayEnd;
          const sessionEnd = getSessionEndTime(activeDetox.startedAt, activeDetox.durationHours);
          if (isProtectedByDetox(habitWindowStart, habitWindowEnd, activeDetox.startedAt, sessionEnd)) {
            // Skip streak break — habit is protected during active detox session
            streakMap[s.habitId] = streakState;
            continue;
          }
        }

        // Detect streak breaks for habits without active mercy mode
        if (!mercyModes[s.habitId] && s.lastCompletedAt && !completions[s.habitId]) {
          const breakResult = detectStreakBreak(s.lastCompletedAt, now, s.currentCount);
          if (breakResult.broken && breakResult.mercyMode) {
            // Streak is broken -- make mercy mode available
            mercyModes[s.habitId] = breakResult.mercyMode;
            streakState.mercyMode = breakResult.mercyMode;
          }
        }

        streakMap[s.habitId] = streakState;
      }

      // Calculate daily progress
      const completed = Object.values(completions).filter(Boolean).length;

      set({
        habits: activeHabits,
        completions,
        streaks: streakMap,
        mercyModes,
        dailyProgress: { completed, total: activeHabits.length },
        loading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  // ─── New: Complete Habit ──────────────────────────────────────────

  completeHabit: async (habitId: string, userId: string) => {
    try {
      const state = get();
      const now = new Date().toISOString();
      const { dayStart, dayEnd } = getDayBoundaries();

      // 1. Idempotency check
      if (state.completions[habitId]) {
        return; // Already completed today
      }

      // Double-check against DB for race conditions
      const alreadyDone = await completionRepo.hasCompletionToday(habitId, dayStart, dayEnd);
      if (alreadyDone) {
        set((s) => ({
          completions: { ...s.completions, [habitId]: true },
        }));
        return;
      }

      // 2. Get current streak
      const currentStreakState: StreakState = state.streaks[habitId] || {
        currentCount: 0,
        longestCount: 0,
        multiplier: 1.0,
        lastCompletedAt: null,
        isRebuilt: false,
      };

      // 3. Process completion via streak engine
      const newStreakState = processCompletion(currentStreakState, now);

      // 4. Award XP via game store (before creating completion record so xpEarned is correct)
      const habit = state.habits.find(h => h.id === habitId);
      const baseXP = habit ? (habit.baseXp || getBaseXP(habit.type)) : getBaseXP('custom');
      // FRDY-01: Friday 2x XP stacks multiplicatively with streak multiplier (D-12).
      // Quest XP excluded (D-13) — see gameStore.updateQuestProgress which uses 1.0.
      const fridayBonus = isFriday() ? getFridayMultiplier() : 1.0;
      const effectiveMultiplier = combinedMultiplier(newStreakState.multiplier, fridayBonus);
      const xpResult = await useGameStore.getState().awardXP(
        userId,
        baseXP,
        effectiveMultiplier,
        'habit',
        habitId,
      );
      const xpEarned = xpResult?.cappedXP ?? 0;

      // 5. Create completion record with real XP
      await completionRepo.create({
        id: generateId(),
        habitId,
        completedAt: now,
        xpEarned,
        streakMultiplier: newStreakState.multiplier,
        createdAt: now,
      });

      // 6. Persist streak to DB
      await streakRepo.upsert(habitId, {
        currentCount: newStreakState.currentCount,
        longestCount: newStreakState.longestCount,
        multiplier: newStreakState.multiplier,
        lastCompletedAt: newStreakState.lastCompletedAt,
        isRebuilt: newStreakState.isRebuilt,
      });

      // 6a. Sync denormalized streak count to users table for buddy profiles
      // Privacy: streaks table is PRIVATE; users.current_streak_count is SYNCABLE
      await syncStreakToUser(userId, newStreakState.currentCount);

      // 6b. Handle mercy mode completion
      let updatedMercyModes = { ...state.mercyModes };
      if (newStreakState.mercyMode?.active) {
        const recovery = processRecovery(newStreakState.mercyMode);
        if (recovery.complete) {
          // Recovery complete -- restore partial streak
          const restoredState: StreakState = {
            ...newStreakState,
            currentCount: recovery.restoredStreak,
            isRebuilt: true,
            mercyMode: undefined,
          };
          await streakRepo.upsert(habitId, {
            currentCount: restoredState.currentCount,
            isRebuilt: true,
            rebuiltAt: now,
            mercyRecoveryDay: 0,
            preBreakStreak: 0,
          });
          delete updatedMercyModes[habitId];

          // Update local streak with restored values
          set((s) => ({
            streaks: { ...s.streaks, [habitId]: restoredState },
          }));
        } else {
          // Still recovering -- update mercy mode columns
          await streakRepo.updateMercyMode(
            habitId,
            recovery.updatedState.recoveryDay,
            recovery.updatedState.preBreakStreak,
          );
          updatedMercyModes[habitId] = recovery.updatedState;
        }
      }

      // 7. Update local state
      set((s) => {
        const newCompletions = { ...s.completions, [habitId]: true };
        const completedCount = Object.values(newCompletions).filter(Boolean).length;
        return {
          completions: newCompletions,
          streaks: { ...s.streaks, [habitId]: newStreakState },
          mercyModes: updatedMercyModes,
          dailyProgress: { completed: completedCount, total: s.habits.length },
        };
      });

      // 8. Title unlock check (non-fatal)
      await useGameStore.getState().checkTitles(userId);

      // 9. Quest progress update (non-fatal)
      const latestState = get();
      const newCompletions = { ...latestState.completions, [habitId]: true };
      const completedHabitIds = new Set(
        Object.entries(newCompletions)
          .filter(([, done]) => done)
          .map(([id]) => id)
      );

      // Check if all salah are complete today
      const salahTypes = ['salah_fajr', 'salah_dhuhr', 'salah_asr', 'salah_maghrib', 'salah_isha'];
      const salahHabits = latestState.habits.filter(h => salahTypes.includes(h.type));
      const allSalahComplete =
        salahHabits.length >= 5 && salahHabits.every(h => completedHabitIds.has(h.id));

      // Check if all habits are complete today
      const allHabitsComplete =
        latestState.habits.length > 0 &&
        latestState.habits.every(h => completedHabitIds.has(h.id));

      // Build current streaks snapshot
      const currentStreaks: Record<string, number> = {};
      for (const [hId, sState] of Object.entries(latestState.streaks)) {
        currentStreaks[hId] = sState.currentCount;
      }
      // Include just-updated streak for this habit
      currentStreaks[habitId] = newStreakState.currentCount;

      await useGameStore.getState().updateQuestProgress(userId, {
        habitType: habit?.type ?? 'custom',
        allSalahComplete,
        allHabitsComplete,
        currentStreaks,
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  // ─── New: Start Recovery (Mercy Mode) ─────────────────────────────

  startRecovery: async (habitId: string) => {
    try {
      const state = get();
      const existingMercy = state.mercyModes[habitId];

      if (!existingMercy) {
        // No broken streak to recover from
        return;
      }

      // Activate mercy mode recovery
      const activeMercy: MercyModeState = {
        active: true,
        recoveryDay: 0,
        preBreakStreak: existingMercy.preBreakStreak,
      };

      // Persist to DB
      await streakRepo.updateMercyMode(
        habitId,
        activeMercy.recoveryDay,
        activeMercy.preBreakStreak,
      );

      // Update streak state with mercy mode
      set((s) => ({
        mercyModes: { ...s.mercyModes, [habitId]: activeMercy },
        streaks: {
          ...s.streaks,
          [habitId]: {
            ...(s.streaks[habitId] || {
              currentCount: 0,
              longestCount: 0,
              multiplier: 1.0,
              lastCompletedAt: null,
              isRebuilt: false,
            }),
            mercyMode: activeMercy,
          },
        },
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  // ─── New: Reset Streak (Fresh Start) ──────────────────────────────

  resetStreak: async (habitId: string) => {
    try {
      // Reset in DB
      await streakRepo.resetStreak(habitId);

      // Get fresh state from startFreshReset
      const freshStreak = startFreshReset();

      // Clear mercy mode and update local state
      set((s) => {
        const newMercyModes = { ...s.mercyModes };
        delete newMercyModes[habitId];
        return {
          streaks: { ...s.streaks, [habitId]: freshStreak },
          mercyModes: newMercyModes,
        };
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  // ─── New: Update Habit ────────────────────────────────────────────

  updateHabit: async (habitId: string, data: Partial<Omit<NewHabit, 'id'>>) => {
    try {
      await habitRepo.update(habitId, data);
      set((s) => ({
        habits: s.habits.map((h) =>
          h.id === habitId ? { ...h, ...data, updatedAt: new Date().toISOString() } : h,
        ),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  // ─── New: Get Habits For Display ──────────────────────────────────

  getHabitsForDisplay: () => {
    const state = get();
    const habitsWithStatus: HabitWithStatus[] = state.habits.map((habit) => ({
      ...habit,
      completedToday: state.completions[habit.id] || false,
      streak: state.streaks[habit.id] || null,
      prayerWindow: null, // Populated by UI layer with prayer times service
    }));
    return sortHabitsForDisplay(habitsWithStatus);
  },
}));

// Register with bridge so gameStore can read without circular import
registerHabitStore(() => {
  const s = useHabitStore.getState();
  return { streaks: s.streaks, completions: s.completions };
});
