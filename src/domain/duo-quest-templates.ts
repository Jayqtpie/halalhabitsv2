/**
 * Duo Quest Templates -- Curated catalog of duo quest challenges.
 *
 * No React, no DB, no side effects. Fully unit-testable.
 *
 * All templates follow the XP economy model:
 * - xpRewardEach: 50-150 (individual reward)
 * - xpRewardBonus: additional XP when BOTH players complete
 * - durationDays: how long the quest runs before expiry
 *
 * These are shared challenges — not worship-private activities.
 * Salah and muhasabah must never appear here (Privacy Gate, D-02).
 */

// ---------------------------------------------------------------------------
// DuoQuestTemplate interface
// ---------------------------------------------------------------------------

/**
 * A curated template for creating a duo quest between two buddies.
 * Extends the base quest template pattern with duo-specific fields.
 */
export interface DuoQuestTemplate {
  /** Unique kebab-case identifier */
  id: string;
  /** Player-facing quest title */
  title: string;
  /** Player-facing quest description */
  description: string;
  /** What kind of completion counts toward the quest */
  targetType: 'completion_count' | 'consecutive_days';
  /** Number of completions required from each player */
  targetValue: number;
  /** How many days the quest runs (from creation to expiry) */
  durationDays: number;
  /** XP awarded to each player individually on completion */
  xpRewardEach: number;
  /** Bonus XP awarded to each player when BOTH complete (on top of individual) */
  xpRewardBonus: number;
}

// ---------------------------------------------------------------------------
// DUO_QUEST_TEMPLATES catalog
// ---------------------------------------------------------------------------

/**
 * Curated catalog of 8 duo quest templates.
 *
 * All templates are suitable for sharing (no worship-private habits).
 * XP values: individual rewards 50-150, bonus rewards 30-60.
 *
 * Templates are designed to be welcoming, not competitive — both players
 * succeed together, and partial effort is still honored via partial XP.
 */
export const DUO_QUEST_TEMPLATES: DuoQuestTemplate[] = [
  {
    id: 'read-together',
    title: 'Read Together',
    description: 'Read for at least 20 minutes each day for 7 days.',
    targetType: 'completion_count',
    targetValue: 7,
    durationDays: 10,
    xpRewardEach: 75,
    xpRewardBonus: 40,
  },
  {
    id: 'hydration-challenge',
    title: 'Hydration Challenge',
    description: 'Drink 8 glasses of water each day for 5 days.',
    targetType: 'completion_count',
    targetValue: 5,
    durationDays: 7,
    xpRewardEach: 60,
    xpRewardBonus: 30,
  },
  {
    id: 'morning-routine',
    title: 'Morning Routine',
    description: 'Complete your morning habits for 5 days straight.',
    targetType: 'completion_count',
    targetValue: 5,
    durationDays: 7,
    xpRewardEach: 80,
    xpRewardBonus: 45,
  },
  {
    id: 'gratitude-week',
    title: 'Gratitude Week',
    description: 'Log something you are grateful for each day for 7 days.',
    targetType: 'completion_count',
    targetValue: 7,
    durationDays: 10,
    xpRewardEach: 70,
    xpRewardBonus: 35,
  },
  {
    id: 'exercise-buddies',
    title: 'Exercise Buddies',
    description: 'Exercise at least 5 times this week — hold each other accountable.',
    targetType: 'completion_count',
    targetValue: 5,
    durationDays: 7,
    xpRewardEach: 90,
    xpRewardBonus: 50,
  },
  {
    id: 'screen-free-evenings',
    title: 'Screen-Free Evenings',
    description: 'No screens after 9pm for 5 days. Rest your mind together.',
    targetType: 'completion_count',
    targetValue: 5,
    durationDays: 7,
    xpRewardEach: 100,
    xpRewardBonus: 55,
  },
  {
    id: 'early-bird-challenge',
    title: 'Early Bird Challenge',
    description: 'Wake up before Fajr for 3 consecutive days. Rise together.',
    targetType: 'consecutive_days',
    targetValue: 3,
    durationDays: 5,
    xpRewardEach: 120,
    xpRewardBonus: 60,
  },
  {
    id: 'dhikr-together',
    title: 'Dhikr Together',
    description: 'Complete your dhikr habit each day for 7 days.',
    targetType: 'completion_count',
    targetValue: 7,
    durationDays: 10,
    xpRewardEach: 75,
    xpRewardBonus: 40,
  },
];
