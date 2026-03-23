/**
 * Title Engine -- Pure TypeScript module for evaluating Identity Title unlock conditions.
 *
 * No React, no DB, no side effects. Fully unit-testable.
 * Pattern: streak-engine.ts (pure functions, receives data, returns data)
 *
 * Usage:
 * 1. Build a PlayerStats snapshot from DB (one round-trip to avoid N+1 per title)
 * 2. Call checkTitleUnlocks(conditions, alreadyUnlocked, stats)
 * 3. Returns IDs of newly unlocked titles
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TitleCondition {
  /** Unique kebab-case identifier (matches TitleSeedEntry.id) */
  id: string;
  /** The type of unlock condition to evaluate */
  unlockType:
    | 'onboarding'
    | 'total_completions'
    | 'habit_type_streak'
    | 'habit_streak'
    | 'level_reach'
    | 'quest_completions'
    | 'mercy_recoveries'
    | 'simultaneous_streaks'
    | 'muhasabah_streak'
    | 'habit_count'
    | 'detox_completions'
    | 'boss_defeats';
  /** Numeric threshold for the condition */
  unlockValue: number;
  /** For habit_type_streak: the specific habit type required (null otherwise) */
  unlockHabitType: string | null;
}

export interface PlayerStats {
  /** Player's current level */
  currentLevel: number;
  /** Per-habit streak counts: habitId -> currentStreakCount */
  habitStreaks: Record<string, number>;
  /** Per-habit type mapping: habitId -> habitType (e.g., 'salah_fajr', 'quran', 'dhikr') */
  habitTypes: Record<string, string>;
  /** Total lifetime habit completions */
  totalCompletions: number;
  /** Total quest completions */
  questCompletions: number;
  /** Number of successful Mercy Mode recoveries */
  mercyRecoveries: number;
  /** Current Muhasabah consecutive-day streak */
  muhasabahStreak: number;
  /** Number of currently active habits */
  activeHabitCount: number;
  /** How many habits currently have a streak of 14+ consecutive days */
  simultaneousStreaks14: number;
  /** How many habits currently have a streak of 90+ consecutive days */
  simultaneousStreaks90: number;
  /** Total completed detox sessions */
  detoxCompletions: number;
  /** Total boss battles defeated */
  bossDefeats: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Evaluate whether a single title's unlock condition is met by the player's current stats.
 * Pure function -- no side effects, no DB access.
 */
function isTitleUnlocked(condition: TitleCondition, stats: PlayerStats): boolean {
  switch (condition.unlockType) {
    case 'onboarding':
      // Player has reached the app -- always considered unlocked
      return true;

    case 'total_completions':
      return stats.totalCompletions >= condition.unlockValue;

    case 'level_reach':
      return stats.currentLevel >= condition.unlockValue;

    case 'quest_completions':
      return stats.questCompletions >= condition.unlockValue;

    case 'mercy_recoveries':
      return stats.mercyRecoveries >= condition.unlockValue;

    case 'muhasabah_streak':
      return stats.muhasabahStreak >= condition.unlockValue;

    case 'habit_count':
      return stats.activeHabitCount >= condition.unlockValue;

    case 'habit_streak': {
      // Any single habit has a streak >= unlockValue
      return Object.values(stats.habitStreaks).some(
        streak => streak >= condition.unlockValue
      );
    }

    case 'habit_type_streak': {
      if (condition.unlockHabitType === null) return false;
      // At least one habit of the specified type has a streak >= unlockValue
      return Object.entries(stats.habitStreaks).some(([habitId, streak]) => {
        const habitType = stats.habitTypes[habitId];
        return habitType === condition.unlockHabitType && streak >= condition.unlockValue;
      });
    }

    case 'simultaneous_streaks':
      // Uses simultaneousStreaks14 (default for all simultaneous_streaks conditions)
      // The fortress title (90-day variant) uses simultaneousStreaks90
      // For simplicity: use simultaneousStreaks14 for the default threshold,
      // and simultaneousStreaks90 for the 90-day condition (sortOrder 26)
      return (
        stats.simultaneousStreaks14 >= condition.unlockValue ||
        stats.simultaneousStreaks90 >= condition.unlockValue
      );

    case 'detox_completions':
      return stats.detoxCompletions >= condition.unlockValue;

    case 'boss_defeats':
      return stats.bossDefeats >= condition.unlockValue;

    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Evaluate all title unlock conditions and return IDs of newly unlocked titles.
 *
 * @param conditions - All TitleCondition objects to evaluate
 * @param alreadyUnlocked - Set of title IDs the player already owns (skipped)
 * @param stats - Current player stats snapshot
 * @returns Array of title IDs that are newly unlocked
 */
export function checkTitleUnlocks(
  conditions: TitleCondition[],
  alreadyUnlocked: Set<string>,
  stats: PlayerStats,
): string[] {
  return conditions
    .filter(
      condition =>
        !alreadyUnlocked.has(condition.id) && isTitleUnlocked(condition, stats)
    )
    .map(condition => condition.id);
}
