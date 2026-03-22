/**
 * Domain types for Phase 3: Core Habit Loop
 *
 * Pure TypeScript types — no React imports.
 * Used by presets, prayer-times service, habit-sorter, stores, and screens.
 */
import type { Habit } from './database';

// ─── Prayer Types ────────────────────────────────────────────────────

/** The five daily obligatory prayers */
export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

/** A prayer time window with its current status */
export interface PrayerWindow {
  name: PrayerName;
  displayName: string;
  start: Date;
  end: Date;
  status: 'active' | 'upcoming' | 'passed';
}

// ─── Calculation Method Types ────────────────────────────────────────

/** Supported prayer time calculation methods */
export type CalcMethodKey =
  | 'ISNA'
  | 'MWL'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'MoonsightingCommittee';

/** Info for displaying a calculation method in a picker */
export interface CalcMethodInfo {
  key: CalcMethodKey;
  displayName: string;
  description: string;
}

/** All supported calculation methods with display info */
export const CALC_METHODS: CalcMethodInfo[] = [
  {
    key: 'ISNA',
    displayName: 'ISNA',
    description: 'Islamic Society of North America',
  },
  {
    key: 'MWL',
    displayName: 'MWL',
    description: 'Muslim World League',
  },
  {
    key: 'Egyptian',
    displayName: 'Egyptian',
    description: 'Egyptian General Authority of Survey',
  },
  {
    key: 'Karachi',
    displayName: 'Karachi',
    description: 'University of Islamic Sciences, Karachi',
  },
  {
    key: 'UmmAlQura',
    displayName: 'Umm al-Qura',
    description: 'Umm al-Qura University, Makkah',
  },
  {
    key: 'MoonsightingCommittee',
    displayName: 'Moonsighting Committee',
    description: 'Moonsighting Committee Worldwide',
  },
];

// ─── Preset Types ────────────────────────────────────────────────────

/** Categories for habit presets */
export type PresetCategory =
  | 'salah'
  | 'quran'
  | 'dhikr'
  | 'dua'
  | 'fasting'
  | 'character';

/** Difficulty tiers for habit XP calculation */
export type { DifficultyTier } from './common';

/** Shape of a preset habit definition */
export interface PresetHabit {
  key: string;
  name: string;
  category: PresetCategory;
  type: 'salah' | 'custom';
  frequency: 'daily' | 'specific_days';
  frequencyDays?: string; // JSON array of day numbers for specific_days
  icon: string;
  difficultyTier: DifficultyTier;
  baseXp: number;
  description: string;
}

// ─── Streak & Mercy Mode Types ───────────────────────────────────────

/** State of Mercy Mode for a habit */
export interface MercyModeState {
  active: boolean;
  recoveryDay: number; // 0-3
  preBreakStreak: number;
}

/** Streak state for a habit */
export interface StreakState {
  currentCount: number;
  longestCount: number;
  multiplier: number;
  lastCompletedAt: string | null; // ISO 8601
  isRebuilt: boolean;
  mercyMode?: MercyModeState;
}

// ─── Composite Types ─────────────────────────────────────────────────

/** Habit with runtime status for display in the daily list */
export type HabitWithStatus = Habit & {
  completedToday: boolean;
  streak: StreakState | null;
  prayerWindow: PrayerWindow | null;
};
