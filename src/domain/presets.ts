/**
 * Islamic habit preset definitions.
 *
 * ~15 presets across 6 categories. Pure data — no React imports.
 * Used during onboarding and habit creation to offer curated habits.
 */
import type { PresetHabit, PresetCategory } from '../types/habits';

// ─── Preset Categories ───────────────────────────────────────────────

export const PRESET_CATEGORIES: {
  key: PresetCategory;
  displayName: string;
  icon: string;
}[] = [
  { key: 'salah', displayName: 'Salah', icon: '🕌' },
  { key: 'quran', displayName: "Qur'an", icon: '📖' },
  { key: 'dhikr', displayName: 'Dhikr', icon: '📿' },
  { key: 'dua', displayName: "Du'a", icon: '🤲' },
  { key: 'fasting', displayName: 'Fasting', icon: '🌙' },
  { key: 'character', displayName: 'Character', icon: '💎' },
];

// ─── Habit Presets ───────────────────────────────────────────────────

export const HABIT_PRESETS: PresetHabit[] = [
  // ── Salah (5) ──────────────────────────────────────────────────────
  {
    key: 'fajr',
    name: 'Fajr',
    category: 'salah',
    type: 'salah',
    frequency: 'daily',
    icon: '🌅',
    difficultyTier: 'hard',
    baseXp: 50,
    description: 'The dawn prayer — waking for Fajr builds the strongest discipline.',
  },
  {
    key: 'dhuhr',
    name: 'Dhuhr',
    category: 'salah',
    type: 'salah',
    frequency: 'daily',
    icon: '☀️',
    difficultyTier: 'medium',
    baseXp: 30,
    description: 'The midday prayer — a moment of stillness in a busy day.',
  },
  {
    key: 'asr',
    name: 'Asr',
    category: 'salah',
    type: 'salah',
    frequency: 'daily',
    icon: '🌤️',
    difficultyTier: 'medium',
    baseXp: 30,
    description: 'The afternoon prayer — guarding the middle prayer.',
  },
  {
    key: 'maghrib',
    name: 'Maghrib',
    category: 'salah',
    type: 'salah',
    frequency: 'daily',
    icon: '🌇',
    difficultyTier: 'medium',
    baseXp: 30,
    description: 'The sunset prayer — marking the transition of the day.',
  },
  {
    key: 'isha',
    name: 'Isha',
    category: 'salah',
    type: 'salah',
    frequency: 'daily',
    icon: '🌃',
    difficultyTier: 'medium',
    baseXp: 35,
    description: 'The night prayer — closing the day with remembrance.',
  },

  // ── Quran (2) ──────────────────────────────────────────────────────
  {
    key: 'daily-reading',
    name: "Qur'an Reading",
    category: 'quran',
    type: 'custom',
    frequency: 'daily',
    icon: '📖',
    difficultyTier: 'medium',
    baseXp: 25,
    description: 'Read from the Quran daily — even a few ayat carry immense reward.',
  },
  {
    key: 'memorization',
    name: "Qur'an Memorization",
    category: 'quran',
    type: 'custom',
    frequency: 'daily',
    icon: '🧠',
    difficultyTier: 'hard',
    baseXp: 30,
    description: 'Memorize new ayat or review what you have learned.',
  },

  // ── Dhikr (2) ──────────────────────────────────────────────────────
  {
    key: 'morning-adhkar',
    name: 'Morning Adhkar',
    category: 'dhikr',
    type: 'custom',
    frequency: 'daily',
    icon: '🌄',
    difficultyTier: 'easy',
    baseXp: 15,
    description: 'Start your day with the morning remembrances.',
  },
  {
    key: 'evening-adhkar',
    name: 'Evening Adhkar',
    category: 'dhikr',
    type: 'custom',
    frequency: 'daily',
    icon: '🌆',
    difficultyTier: 'easy',
    baseXp: 15,
    description: 'Close your day with the evening remembrances.',
  },

  // ── Dua (1) ────────────────────────────────────────────────────────
  {
    key: 'daily-dua',
    name: "Daily Du'a",
    category: 'dua',
    type: 'custom',
    frequency: 'daily',
    icon: '🤲',
    difficultyTier: 'easy',
    baseXp: 15,
    description: "Make personal du'a — speak to Allah in your own words.",
  },

  // ── Fasting (2) ────────────────────────────────────────────────────
  {
    key: 'monday-thursday',
    name: 'Monday & Thursday Fast',
    category: 'fasting',
    type: 'custom',
    frequency: 'specific_days',
    frequencyDays: '[1,4]', // Monday=1, Thursday=4
    icon: '🌙',
    difficultyTier: 'hard',
    baseXp: 30,
    description: 'Fast on Monday and Thursday — a beloved sunnah of the Prophet (peace be upon him).',
  },
  {
    key: 'white-days',
    name: 'White Days Fast',
    category: 'fasting',
    type: 'custom',
    frequency: 'specific_days',
    frequencyDays: '[13,14,15]', // 13th, 14th, 15th of lunar month
    icon: '🌕',
    difficultyTier: 'hard',
    baseXp: 30,
    description: 'Fast on the 13th, 14th, and 15th of each lunar month.',
  },

  // ── Character (3) ──────────────────────────────────────────────────
  {
    key: 'gratitude',
    name: 'Gratitude',
    category: 'character',
    type: 'custom',
    frequency: 'daily',
    icon: '🙏',
    difficultyTier: 'easy',
    baseXp: 15,
    description: 'Reflect on blessings and express shukr (gratitude) today.',
  },
  {
    key: 'patience',
    name: 'Patience',
    category: 'character',
    type: 'custom',
    frequency: 'daily',
    icon: '🪨',
    difficultyTier: 'medium',
    baseXp: 20,
    description: 'Practice sabr (patience) — respond with calm when tested.',
  },
  {
    key: 'charity',
    name: 'Charity',
    category: 'character',
    type: 'custom',
    frequency: 'daily',
    icon: '💝',
    difficultyTier: 'medium',
    baseXp: 20,
    description: 'Give sadaqah — even a smile or kind word counts.',
  },
];

// ─── Query Functions ─────────────────────────────────────────────────

/** Get all presets in a given category */
export function getPresetsByCategory(category: PresetCategory): PresetHabit[] {
  return HABIT_PRESETS.filter((p) => p.category === category);
}

/** Find a single preset by its unique key */
export function getPresetByKey(key: string): PresetHabit | undefined {
  return HABIT_PRESETS.find((p) => p.key === key);
}
