/**
 * XP Engine -- Pure TypeScript module for XP calculation, level derivation,
 * soft daily cap, and streak multiplier application.
 *
 * No React, no DB, no side effects. Fully unit-testable.
 *
 * XP Formula: per-level costs are taken from the authoritative blueprint
 * simulation table (blueprint/03-game-design-bible.md) for levels 1-10.
 * For levels 11+, the formula floor(40 * level^1.85) is used with
 * adjustments to maintain monotonic increase.
 *
 * Key invariants:
 * - xpForLevel(5) === 915 (blueprint requirement)
 * - xpForLevel(10) === 7232 (blueprint requirement)
 * - xpToNextLevel is monotonically increasing
 * - levelForXP and xpForLevel are inverse functions
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface XPResult {
  /** Base XP before multiplier */
  baseXP: number;
  /** Streak multiplier applied */
  multiplier: number;
  /** XP after multiplier, before soft daily cap */
  earnedXP: number;
  /** XP after soft daily cap -- THIS is what UI displays */
  cappedXP: number;
  /** Updated daily total after this award */
  dailyTotalAfter: number;
  /** New cumulative XP total */
  newTotalXP: number;
  /** Level after this XP award */
  newLevel: number;
  /** Whether this award caused a level-up */
  didLevelUp: boolean;
  /** Level before this XP award */
  previousLevel: number;
}

// ---------------------------------------------------------------------------
// Blueprint per-level XP costs (authoritative from simulation table)
// Source: blueprint/03-game-design-bible.md, XP Simulation Table
//
// These are the exact per-level costs (XP to advance FROM level N to N+1).
// Derived from: cumulative[N+1] - cumulative[N] for adjacent blueprint entries.
// ---------------------------------------------------------------------------
const BLUEPRINT_PER_LEVEL: Record<number, number> = {
  1: 40,
  2: 137,
  3: 278,
  4: 460,
  5: 681,
  6: 938,
  7: 1230,
  8: 1555,
  9: 1913,
  10: 2302,
};

/** Cache of computed xpToNextLevel values for levels 11+. */
const XP_TO_NEXT_CACHE: Map<number, number> = new Map();

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * XP required to advance FROM a given level to level+1 (per-level cost).
 *
 * Levels 1-10: exact blueprint simulation table values.
 * Levels 11+: formula floor(40 * level^1.85), ensuring monotonic increase
 *             from the previous level's cost.
 */
export function xpToNextLevel(level: number): number {
  if (BLUEPRINT_PER_LEVEL[level] !== undefined) {
    return BLUEPRINT_PER_LEVEL[level];
  }

  const cached = XP_TO_NEXT_CACHE.get(level);
  if (cached !== undefined) return cached;

  const result = Math.floor(40 * Math.pow(level, 1.85));
  XP_TO_NEXT_CACHE.set(level, result);
  return result;
}

/**
 * Cumulative XP required to REACH a given level (total from level 1).
 *
 * - Level 1 returns 0 (starting level, no XP required)
 * - Level 2 returns 40
 * - Level 5 returns exactly 915 (blueprint requirement)
 * - Level 10 returns exactly 7232 (blueprint requirement)
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;

  let total = 0;
  for (let l = 1; l < level; l++) {
    total += xpToNextLevel(l);
  }
  return total;
}

/**
 * Derive current level from total accumulated XP.
 * Uses binary search over the level range 1-100.
 *
 * Returns the highest level for which xpForLevel(level) <= totalXP.
 */
export function levelForXP(totalXP: number): number {
  if (totalXP <= 0) return 1;

  let lo = 1;
  let hi = 100;

  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (xpForLevel(mid) <= totalXP) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  return lo;
}

/**
 * Apply the soft daily XP cap.
 *
 * Above 500 XP earned in a day, additional XP yields 50% of face value.
 * This is invisible to the player -- the UI always shows cappedXP.
 *
 * @param earnedXP - XP earned from this action (after multiplier)
 * @param dailyTotal - XP already earned today before this action
 * @returns cappedXP - the actual XP to credit
 */
export function applySoftCap(earnedXP: number, dailyTotal: number): number {
  const CAP = 500;

  if (dailyTotal >= CAP) {
    // Already over cap: all new XP at 50%
    return Math.floor(earnedXP * 0.5);
  }

  const headroom = CAP - dailyTotal;

  if (earnedXP <= headroom) {
    // Entirely below cap: full value
    return earnedXP;
  }

  // Straddles the cap boundary
  const belowCap = headroom;
  const aboveCap = earnedXP - headroom;
  return belowCap + Math.floor(aboveCap * 0.5);
}

/**
 * Calculate the full XP result for a habit completion.
 *
 * @param baseXP - The habit's base XP value
 * @param multiplier - The streak multiplier (1.0 to 3.0)
 * @param currentTotalXP - Player's current cumulative XP total
 * @param dailyTotalXP - XP already earned today (for soft cap calculation)
 * @returns XPResult with all computed fields
 */
export function calculateXP(
  baseXP: number,
  multiplier: number,
  currentTotalXP: number,
  dailyTotalXP: number,
): XPResult {
  const earnedXP = Math.floor(baseXP * multiplier);
  const cappedXP = applySoftCap(earnedXP, dailyTotalXP);
  const newTotalXP = currentTotalXP + cappedXP;

  const previousLevel = levelForXP(currentTotalXP);
  const newLevel = levelForXP(newTotalXP);

  return {
    baseXP,
    multiplier,
    earnedXP,
    cappedXP,
    dailyTotalAfter: dailyTotalXP + cappedXP,
    newTotalXP,
    newLevel,
    didLevelUp: newLevel > previousLevel,
    previousLevel,
  };
}
