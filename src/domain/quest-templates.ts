/**
 * Quest Templates -- Static pool of quest templates for the Quest Board system.
 *
 * Source: blueprint/05-feature-systems.md (Quest Board section) + Claude's content.
 *
 * Pool composition:
 * - 20 daily templates (25-50 XP, minLevel 1-5, expires at midnight local time)
 * - 8 weekly templates (100-200 XP, minLevel 5-8, expires at Sunday midnight)
 * - 3 stretch templates (300-500 XP, minLevel 8-10, expires at Sunday midnight)
 *
 * Quest Board locked until Level 5.
 * No repeat of same template within 7 days (enforced by selectQuestTemplates).
 *
 * No React, no DB, no side effects.
 */

import type { QuestTemplate } from './quest-engine';

// ---------------------------------------------------------------------------
// Daily Templates (20 total, 3 active per day, 25-50 XP)
// ---------------------------------------------------------------------------

const DAILY_TEMPLATES: QuestTemplate[] = [
  {
    id: 'daily-all-salah',
    type: 'daily',
    description: 'Complete all 5 salah today',
    targetType: 'all_salah',
    targetValue: 5,
    minLevel: 1,
    xpReward: 50,
  },
  {
    id: 'daily-3-habits',
    type: 'daily',
    description: 'Complete 3 habits today',
    targetType: 'any_completion',
    targetValue: 3,
    minLevel: 1,
    xpReward: 30,
  },
  {
    id: 'daily-5-habits',
    type: 'daily',
    description: 'Complete 5 habits today',
    targetType: 'any_completion',
    targetValue: 5,
    minLevel: 1,
    xpReward: 40,
  },
  {
    id: 'daily-quran-dhikr',
    type: 'daily',
    description: 'Complete your Quran reading and dhikr today',
    targetType: 'any_completion',
    targetValue: 2,
    minLevel: 1,
    xpReward: 35,
  },
  {
    id: 'daily-muhasabah',
    type: 'daily',
    description: 'Complete Muhasabah tonight',
    targetType: 'muhasabah',
    targetValue: 1,
    minLevel: 1,
    xpReward: 25,
  },
  {
    id: 'daily-first-habit-early',
    type: 'daily',
    description: 'Complete your first habit before 9 AM',
    targetType: 'any_completion',
    targetValue: 1,
    minLevel: 1,
    xpReward: 25,
  },
  {
    id: 'daily-quran-reading',
    type: 'daily',
    description: 'Complete a Quran reading session today',
    targetType: 'habit_type',
    targetValue: 1,
    targetHabitType: 'quran',
    minLevel: 1,
    xpReward: 30,
  },
  {
    id: 'daily-dhikr-session',
    type: 'daily',
    description: 'Complete a dhikr session today',
    targetType: 'habit_type',
    targetValue: 1,
    targetHabitType: 'dhikr',
    minLevel: 1,
    xpReward: 25,
  },
  {
    id: 'daily-4-habits',
    type: 'daily',
    description: 'Complete 4 habits today',
    targetType: 'any_completion',
    targetValue: 4,
    minLevel: 1,
    xpReward: 35,
  },
  {
    id: 'daily-complete-all',
    type: 'daily',
    description: 'Complete all your habits for the day',
    targetType: 'daily_complete_all',
    targetValue: 1,
    minLevel: 1,
    xpReward: 50,
  },
  {
    id: 'daily-morning-adhkar',
    type: 'daily',
    description: 'Complete morning adhkar today',
    targetType: 'habit_type',
    targetValue: 1,
    targetHabitType: 'adhkar',
    minLevel: 1,
    xpReward: 25,
  },
  {
    id: 'daily-2-habits',
    type: 'daily',
    description: 'Complete at least 2 habits today',
    targetType: 'any_completion',
    targetValue: 2,
    minLevel: 1,
    xpReward: 25,
  },
  {
    id: 'daily-fajr-bonus',
    type: 'daily',
    description: 'Complete Fajr prayer today',
    targetType: 'habit_type',
    targetValue: 1,
    targetHabitType: 'salah_fajr',
    minLevel: 1,
    xpReward: 30,
  },
  {
    id: 'daily-evening-adhkar',
    type: 'daily',
    description: 'Complete evening adhkar today',
    targetType: 'habit_type',
    targetValue: 1,
    targetHabitType: 'adhkar_evening',
    minLevel: 1,
    xpReward: 25,
  },
  {
    id: 'daily-3-habits-level2',
    type: 'daily',
    description: 'Complete 3 different habits today',
    targetType: 'any_completion',
    targetValue: 3,
    minLevel: 2,
    xpReward: 30,
  },
  {
    id: 'daily-dua-after-salah',
    type: 'daily',
    description: 'Complete dua after salah today',
    targetType: 'habit_type',
    targetValue: 1,
    targetHabitType: 'dua',
    minLevel: 2,
    xpReward: 25,
  },
  {
    id: 'daily-5-habits-level3',
    type: 'daily',
    description: 'Complete 5 habits before Maghrib',
    targetType: 'any_completion',
    targetValue: 5,
    minLevel: 3,
    xpReward: 45,
  },
  {
    id: 'daily-all-salah-level3',
    type: 'daily',
    description: 'Complete all salah prayers with focus',
    targetType: 'all_salah',
    targetValue: 5,
    minLevel: 3,
    xpReward: 50,
  },
  {
    id: 'daily-muhasabah-level4',
    type: 'daily',
    description: 'Reflect and complete Muhasabah tonight',
    targetType: 'muhasabah',
    targetValue: 1,
    minLevel: 4,
    xpReward: 30,
  },
  {
    id: 'daily-6-habits',
    type: 'daily',
    description: 'Complete 6 habits today',
    targetType: 'any_completion',
    targetValue: 6,
    minLevel: 5,
    xpReward: 50,
  },
];

// ---------------------------------------------------------------------------
// Weekly Templates (8 total, 2 active per week, 100-200 XP)
// ---------------------------------------------------------------------------

const WEEKLY_TEMPLATES: QuestTemplate[] = [
  {
    id: 'weekly-7-streak',
    type: 'weekly',
    description: 'Maintain a 7-day streak on any habit',
    targetType: 'streak_reach',
    targetValue: 7,
    minLevel: 5,
    xpReward: 150,
  },
  {
    id: 'weekly-20-completions',
    type: 'weekly',
    description: 'Log 20 total habit completions this week',
    targetType: 'total_completions',
    targetValue: 20,
    minLevel: 5,
    xpReward: 100,
  },
  {
    id: 'weekly-fajr-5-days',
    type: 'weekly',
    description: 'Complete Fajr prayer 5 days this week',
    targetType: 'habit_type',
    targetValue: 5,
    targetHabitType: 'salah_fajr',
    minLevel: 5,
    xpReward: 150,
  },
  {
    id: 'weekly-muhasabah-5-nights',
    type: 'weekly',
    description: 'Complete Muhasabah 5 nights this week',
    targetType: 'muhasabah',
    targetValue: 5,
    minLevel: 5,
    xpReward: 125,
  },
  {
    id: 'weekly-25-completions',
    type: 'weekly',
    description: 'Complete 25 habits this week',
    targetType: 'total_completions',
    targetValue: 25,
    minLevel: 5,
    xpReward: 125,
  },
  {
    id: 'weekly-all-salah-3-days',
    type: 'weekly',
    description: 'Complete all 5 salah for 3 days this week',
    targetType: 'all_salah',
    targetValue: 15,
    minLevel: 6,
    xpReward: 175,
  },
  {
    id: 'weekly-quran-7-days',
    type: 'weekly',
    description: 'Complete Quran reading every day this week',
    targetType: 'habit_type',
    targetValue: 7,
    targetHabitType: 'quran',
    minLevel: 7,
    xpReward: 200,
  },
  {
    id: 'weekly-daily-complete-3-days',
    type: 'weekly',
    description: 'Complete all your daily habits for 3 days this week',
    targetType: 'daily_complete_all',
    targetValue: 3,
    minLevel: 8,
    xpReward: 200,
  },
];

// ---------------------------------------------------------------------------
// Stretch Templates (3 total, 1 active per week, 300-500 XP)
// ---------------------------------------------------------------------------

const STRETCH_TEMPLATES: QuestTemplate[] = [
  {
    id: 'stretch-50-completions',
    type: 'stretch',
    description: 'Complete 50 total habit check-ins this week',
    targetType: 'total_completions',
    targetValue: 50,
    minLevel: 8,
    xpReward: 500,
  },
  {
    id: 'stretch-all-salah-5-days',
    type: 'stretch',
    description: 'Complete all 5 salah every day for a full week',
    targetType: 'all_salah',
    targetValue: 35,
    minLevel: 8,
    xpReward: 500,
  },
  {
    id: 'stretch-5-habits-week',
    type: 'stretch',
    description: 'Maintain streaks on 5 habits simultaneously for the full week',
    targetType: 'streak_reach',
    targetValue: 7,
    minLevel: 10,
    xpReward: 400,
  },
];

// ---------------------------------------------------------------------------
// Combined export (31 templates total: 20 daily + 8 weekly + 3 stretch)
// ---------------------------------------------------------------------------

export const QUEST_TEMPLATES: QuestTemplate[] = [
  ...DAILY_TEMPLATES,
  ...WEEKLY_TEMPLATES,
  ...STRETCH_TEMPLATES,
];
