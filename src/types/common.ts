/**
 * Shared type definitions for HalalHabits.
 * These types are used across the entire application.
 */

/** Privacy classification for data sync decisions */
export type PrivacyLevel = 'PRIVATE' | 'SYNCABLE' | 'LOCAL_ONLY';

/** Categories of habits the user can track */
export type HabitCategory =
  | 'salah'
  | 'worship'
  | 'dhikr'
  | 'fasting'
  | 'character'
  | 'custom';

/** How often a habit recurs */
export type HabitFrequency = 'daily' | 'weekly';

/** XP difficulty tiers for habits */
export type DifficultyTier = 'easy' | 'medium' | 'hard' | 'intense';

/** Current status of a habit */
export type HabitStatus = 'active' | 'paused' | 'archived';

/** Types of quests available */
export type QuestType = 'daily' | 'weekly' | 'stretch' | 'recovery';

/** Quest progress status */
export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'expired';

/** Rarity tiers for Identity Titles */
export type TitleRarity = 'common' | 'rare' | 'legendary';

/** Sources that can generate XP */
export type XPSourceType =
  | 'habit'
  | 'quest'
  | 'muhasabah'
  | 'mercy_recovery'
  | 'milestone'
  | 'boss_defeat'
  | 'detox_completion'
  | 'friday_bonus'
  | 'duo_quest';

/** User dark mode preference */
export type DarkMode = 'auto' | 'dark' | 'light';

/** Operations tracked in the sync queue */
export type SyncQueueOperation = 'INSERT' | 'UPDATE' | 'DELETE';
