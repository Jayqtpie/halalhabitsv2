/**
 * Quest Engine -- Pure TypeScript module for quest template selection and progress evaluation.
 *
 * No React, no DB, no side effects. Fully unit-testable.
 * Pattern: streak-engine.ts (pure functions, receives data, returns data)
 *
 * Key behaviors:
 * - selectQuestTemplates: filters by type, level, relevance, no-repeat; shuffles and takes count
 * - evaluateQuestProgress: increments progress based on completion event, clamped to targetValue
 * - isRelevantToPlayer: checks habit_type templates have matching habits in player's active set
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuestTemplate {
  /** Unique kebab-case identifier */
  id: string;
  /** Quest duration type */
  type: 'daily' | 'weekly' | 'stretch';
  /** Player-facing description */
  description: string;
  /** What kind of action advances this quest */
  targetType:
    | 'any_completion'
    | 'habit_type'
    | 'all_salah'
    | 'streak_reach'
    | 'daily_complete_all'
    | 'muhasabah'
    | 'total_completions'
    | 'alkahf_sections';
  /** Completion threshold */
  targetValue: number;
  /** For habit_type quests: the specific habit type required */
  targetHabitType?: string;
  /** Minimum player level required to receive this template */
  minLevel: number;
  /** XP awarded on completion */
  xpReward: number;
}

export interface QuestProgressEvent {
  /** Type of habit that was just completed */
  habitType: string;
  /** Whether all 5 salah prayers have been completed for today */
  allSalahComplete: boolean;
  /** Whether all active habits have been completed for today */
  allHabitsComplete: boolean;
  /** Current per-habit streak counts (for streak_reach evaluation) */
  currentStreaks?: Record<string, number>;
  /** Number of completions in this event (default: 1) */
  completionCount?: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Fisher-Yates shuffle -- returns a new array with elements in random order.
 * Pure function (creates a copy, does not mutate the input).
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Check if a quest template is relevant to a player based on their active habit types.
 *
 * Non-habit_type templates are always relevant.
 * habit_type templates are only relevant if the player has at least one
 * active habit of the required type.
 *
 * @param template - The quest template to evaluate
 * @param activeHabitTypes - Set of habit type strings the player currently has active
 * @returns true if the template is relevant to this player
 */
export function isRelevantToPlayer(
  template: QuestTemplate,
  activeHabitTypes: Set<string>,
): boolean {
  if (template.targetType !== 'habit_type') {
    return true; // Non-habit-type quests are always relevant
  }

  if (!template.targetHabitType) {
    return true; // No specific type required
  }

  return activeHabitTypes.has(template.targetHabitType);
}

/**
 * Select quest templates for the Quest Board.
 *
 * Applies filters in order:
 * 1. Matches requested type (daily/weekly/stretch)
 * 2. minLevel <= playerLevel (level-gated)
 * 3. Not in recentlyUsedIds (no-repeat within 7 days)
 * 4. Relevant to player's active habit types
 *
 * Then shuffles the eligible pool and returns up to `count` templates.
 *
 * @param pool - Full quest template pool to select from
 * @param type - Quest type to select
 * @param count - Number of templates to return
 * @param playerLevel - Player's current level (for minLevel filtering)
 * @param activeHabitTypes - Player's active habit types (for relevance filtering)
 * @param recentlyUsedIds - Template IDs used within the last 7 days (excluded)
 * @returns Selected quest templates (may be fewer than count if not enough eligible)
 */
export function selectQuestTemplates(
  pool: QuestTemplate[],
  type: 'daily' | 'weekly' | 'stretch',
  count: number,
  playerLevel: number,
  activeHabitTypes: Set<string>,
  recentlyUsedIds: Set<string>,
): QuestTemplate[] {
  const eligible = pool.filter(
    template =>
      template.type === type &&
      template.minLevel <= playerLevel &&
      !recentlyUsedIds.has(template.id) &&
      isRelevantToPlayer(template, activeHabitTypes)
  );

  return shuffle(eligible).slice(0, count);
}

/**
 * Evaluate quest progress for a completion event.
 *
 * Returns the new progress value (clamped to targetValue, never exceeds it).
 * Returns unchanged progress when the event type does not match the quest's targetType.
 *
 * @param quest - The quest being evaluated (targetType, targetValue, targetHabitType?, progress)
 * @param event - The completion event that just occurred
 * @returns New progress value (integer, 0 to targetValue)
 */
export function evaluateQuestProgress(
  quest: {
    targetType: string;
    targetValue: number;
    targetHabitType?: string | null;
    progress: number;
  },
  event: QuestProgressEvent,
): number {
  const { targetType, targetValue, progress } = quest;
  const clamp = (value: number) => Math.min(value, targetValue);

  switch (targetType) {
    case 'any_completion':
      // Any habit completion advances this quest
      return clamp(progress + 1);

    case 'total_completions':
      // Count every completion (same as any_completion for per-event tracking)
      return clamp(progress + (event.completionCount ?? 1));

    case 'habit_type': {
      // Only matching habit type advances this quest
      if (!quest.targetHabitType || event.habitType !== quest.targetHabitType) {
        return progress; // unchanged
      }
      return clamp(progress + 1);
    }

    case 'all_salah':
      // Advances when all 5 salah are complete for the day
      if (!event.allSalahComplete) {
        return progress; // unchanged -- not all complete yet
      }
      // Set progress to targetValue when all salah complete
      return targetValue;

    case 'daily_complete_all':
      // Advances when all habits for the day are complete
      if (!event.allHabitsComplete) {
        return progress; // unchanged
      }
      return clamp(progress + 1);

    case 'muhasabah':
      // Muhasabah completion is tracked separately, not via habit completion events
      // This handler is for when a muhasabah event fires (habitType === 'muhasabah')
      if (event.habitType !== 'muhasabah') {
        return progress; // unchanged
      }
      return clamp(progress + 1);

    case 'streak_reach': {
      // Quest completes when any habit reaches the target streak length
      // Checked via currentStreaks if provided
      if (!event.currentStreaks) {
        return progress; // cannot evaluate without streak data
      }
      const hasStreak = Object.values(event.currentStreaks).some(
        streak => streak >= targetValue
      );
      return hasStreak ? targetValue : progress;
    }

    case 'alkahf_sections':
      // Al-Kahf section completion -- progress manually reported via UI taps
      return clamp(progress + (event.completionCount ?? 1));

    default:
      return progress; // unknown type -- unchanged
  }
}
