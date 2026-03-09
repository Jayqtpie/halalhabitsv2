/**
 * Streak Engine -- Pure TypeScript module for streak calculation,
 * break detection, Mercy Mode, and Salah Streak Shield logic.
 *
 * No React, no DB, no side effects. Fully unit-testable.
 */

// TODO: Consolidate with src/types/habits.ts when Plan 01 creates it
export interface MercyModeState {
  active: boolean;
  recoveryDay: number; // 0-3 (0 = not started, 3 = complete)
  preBreakStreak: number;
}

export interface StreakState {
  currentCount: number;
  longestCount: number;
  multiplier: number;
  lastCompletedAt: string | null; // ISO 8601
  isRebuilt: boolean;
  mercyMode?: MercyModeState;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Extract YYYY-MM-DD from an ISO string using local time. */
function getHabitDay(isoString: string): string {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Check if `current` is exactly 1 calendar day after `prev` (local time). */
function isNextDay(prev: string, current: string): boolean {
  const prevDay = getHabitDay(prev);
  const currentDay = getHabitDay(current);

  // Create dates at noon to avoid DST edge cases
  const prevDate = new Date(`${prevDay}T12:00:00`);
  const currentDate = new Date(`${currentDay}T12:00:00`);

  const diffMs = currentDate.getTime() - prevDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Returns true if lastCompletedAt falls on the same calendar day (local time)
 * as referenceDate.
 */
export function isCompletedToday(
  lastCompletedAt: string | null,
  referenceDate: string,
): boolean {
  if (lastCompletedAt === null) return false;
  return getHabitDay(lastCompletedAt) === getHabitDay(referenceDate);
}

/**
 * Process a habit completion. Pure function -- returns a new StreakState.
 *
 * - Same-day re-completion: idempotent (returns unchanged).
 * - First completion or gap: streak = 1, multiplier = 1.0.
 * - Consecutive day: streak + 1, multiplier + 0.1 (capped at 3.0).
 * - Updates longestCount when currentCount exceeds it.
 * - During mercy recovery: increments recoveryDay.
 */
export function processCompletion(
  currentStreak: StreakState,
  completionDate: string,
): StreakState {
  // Same-day idempotency
  if (currentStreak.lastCompletedAt && isCompletedToday(currentStreak.lastCompletedAt, completionDate)) {
    return currentStreak;
  }

  let newCount: number;
  let newMultiplier: number;

  if (currentStreak.lastCompletedAt && isNextDay(currentStreak.lastCompletedAt, completionDate)) {
    // Consecutive day
    newCount = currentStreak.currentCount + 1;
    newMultiplier = Math.min(3.0, +(currentStreak.multiplier + 0.1).toFixed(1));
  } else {
    // First completion or non-consecutive gap
    newCount = 1;
    newMultiplier = 1.0;
  }

  const newLongest = Math.max(currentStreak.longestCount, newCount);

  // Handle mercy mode recovery day increment
  let mercyMode = currentStreak.mercyMode;
  if (mercyMode?.active) {
    mercyMode = {
      ...mercyMode,
      recoveryDay: mercyMode.recoveryDay + 1,
    };
  }

  return {
    currentCount: newCount,
    longestCount: newLongest,
    multiplier: newMultiplier,
    lastCompletedAt: completionDate,
    isRebuilt: currentStreak.isRebuilt,
    mercyMode,
  };
}

/**
 * Detect whether the streak is broken based on the gap between
 * lastCompletedAt and currentDate.
 *
 * - null lastCompletedAt: no break (never started).
 * - Same day or yesterday: not broken.
 * - Gap > 1 calendar day: broken, returns MercyModeState.
 */
export function detectStreakBreak(
  lastCompletedAt: string | null,
  currentDate: string,
  currentCount: number,
): { broken: boolean; mercyMode?: MercyModeState } {
  if (lastCompletedAt === null) {
    return { broken: false };
  }

  const lastDay = getHabitDay(lastCompletedAt);
  const currentDay = getHabitDay(currentDate);

  // Same day
  if (lastDay === currentDay) {
    return { broken: false };
  }

  // Yesterday check
  if (isNextDay(lastCompletedAt, currentDate)) {
    return { broken: false };
  }

  // Gap > 1 day -- streak is broken
  return {
    broken: true,
    mercyMode: {
      active: true,
      recoveryDay: 0,
      preBreakStreak: currentCount,
    },
  };
}

/**
 * Process one recovery day in Mercy Mode.
 *
 * - Increments recoveryDay.
 * - On day 3: complete=true, restoredStreak = floor(preBreakStreak * 0.25).
 *   Minimum restored streak is 1 when preBreakStreak >= 4.
 * - On days 1-2: complete=false, restoredStreak=0.
 */
export function processRecovery(
  mercyState: MercyModeState,
): { complete: boolean; restoredStreak: number; updatedState: MercyModeState } {
  const nextDay = mercyState.recoveryDay + 1;
  const updatedState: MercyModeState = {
    ...mercyState,
    recoveryDay: nextDay,
  };

  if (nextDay >= 3) {
    const restored = Math.floor(mercyState.preBreakStreak * 0.25);
    return {
      complete: true,
      restoredStreak: restored,
      updatedState,
    };
  }

  return {
    complete: false,
    restoredStreak: 0,
    updatedState,
  };
}

/**
 * Fresh start -- reset streak to clean slate. Equally valid choice alongside
 * Mercy Mode recovery. No penalty; XP total is preserved elsewhere.
 */
export function startFreshReset(): StreakState {
  return {
    currentCount: 0,
    longestCount: 0,
    multiplier: 1.0,
    lastCompletedAt: null,
    isRebuilt: false,
  };
}

/**
 * Salah Streak Shield -- returns true if the completion time falls within
 * the prayer window [windowStart, windowEnd).
 *
 * Only applicable to salah-type habits.
 */
export function calculateStreakShieldBonus(
  completionTime: Date,
  windowStart: Date,
  windowEnd: Date,
): boolean {
  return completionTime.getTime() >= windowStart.getTime() &&
    completionTime.getTime() < windowEnd.getTime();
}
