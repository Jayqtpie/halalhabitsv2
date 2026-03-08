/**
 * Drizzle ORM schema definitions for all 13 HalalHabits entities
 * plus the _zustand_store utility table.
 *
 * Privacy classifications are enforced by the Privacy Gate module
 * (src/services/privacy-gate.ts), not at the schema level.
 *
 * @see blueprint/11-data-model.md for entity specifications
 */
import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

// ─── Users ───────────────────────────────────────────────────────────
// Privacy: SYNCABLE
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  activeTitleId: text('active_title_id'),
  currentLevel: integer('current_level').notNull().default(1),
  totalXp: integer('total_xp').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ([
  index('idx_user_level').on(table.currentLevel),
]));

// ─── Habits ──────────────────────────────────────────────────────────
// Privacy: SYNCABLE
export const habits = sqliteTable('habits', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  type: text('type').notNull(),
  presetKey: text('preset_key'),
  category: text('category').notNull(),
  frequency: text('frequency').notNull(),
  frequencyDays: text('frequency_days'),
  timeWindowStart: text('time_window_start'),
  timeWindowEnd: text('time_window_end'),
  difficultyTier: text('difficulty_tier').notNull().default('medium'),
  baseXp: integer('base_xp').notNull(),
  status: text('status').notNull().default('active'),
  sortOrder: integer('sort_order').notNull().default(0),
  icon: text('icon'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ([
  index('idx_habit_user_status').on(table.userId, table.status),
  index('idx_habit_user_sort').on(table.userId, table.sortOrder),
]));

// ─── Habit Completions ───────────────────────────────────────────────
// Privacy: PRIVATE - worship data, never leaves device
export const habitCompletions = sqliteTable('habit_completions', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').notNull().references(() => habits.id),
  completedAt: text('completed_at').notNull(),
  xpEarned: integer('xp_earned').notNull(),
  streakMultiplier: real('streak_multiplier').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ([
  index('idx_completion_habit_date').on(table.habitId, table.completedAt),
  index('idx_completion_date').on(table.completedAt),
]));

// ─── Streaks ─────────────────────────────────────────────────────────
// Privacy: PRIVATE - reveals worship consistency patterns
export const streaks = sqliteTable('streaks', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').notNull().references(() => habits.id),
  currentCount: integer('current_count').notNull().default(0),
  longestCount: integer('longest_count').notNull().default(0),
  lastCompletedAt: text('last_completed_at'),
  multiplier: real('multiplier').notNull().default(1.0),
  isRebuilt: integer('is_rebuilt', { mode: 'boolean' }).notNull().default(false),
  rebuiltAt: text('rebuilt_at'),
  updatedAt: text('updated_at').notNull(),
}, (table) => ([
  uniqueIndex('idx_streak_habit').on(table.habitId),
]));

// ─── XP Ledger ───────────────────────────────────────────────────────
// Privacy: SYNCABLE - aggregated effort score, decoupled from worship source
export const xpLedger = sqliteTable('xp_ledger', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(),
  sourceType: text('source_type').notNull(),
  sourceId: text('source_id'),
  earnedAt: text('earned_at').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ([
  index('idx_xp_user_date').on(table.userId, table.earnedAt),
  index('idx_xp_user').on(table.userId),
]));

// ─── Titles ──────────────────────────────────────────────────────────
// Privacy: SYNCABLE - game seed data
export const titles = sqliteTable('titles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  rarity: text('rarity').notNull(),
  unlockType: text('unlock_type').notNull(),
  unlockValue: integer('unlock_value').notNull(),
  unlockHabitType: text('unlock_habit_type'),
  flavorText: text('flavor_text').notNull(),
  sortOrder: integer('sort_order').notNull(),
}, (table) => ([
  index('idx_title_rarity').on(table.rarity),
]));

// ─── User Titles ─────────────────────────────────────────────────────
// Privacy: SYNCABLE - game profile achievements
export const userTitles = sqliteTable('user_titles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  titleId: text('title_id').notNull().references(() => titles.id),
  earnedAt: text('earned_at').notNull(),
}, (table) => ([
  uniqueIndex('idx_usertitle_user_title').on(table.userId, table.titleId),
  index('idx_usertitle_user').on(table.userId),
]));

// ─── Quests ──────────────────────────────────────────────────────────
// Privacy: SYNCABLE
export const quests = sqliteTable('quests', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  description: text('description').notNull(),
  xpReward: integer('xp_reward').notNull(),
  targetType: text('target_type').notNull(),
  targetValue: integer('target_value').notNull(),
  targetHabitId: text('target_habit_id'),
  progress: integer('progress').notNull().default(0),
  status: text('status').notNull().default('available'),
  expiresAt: text('expires_at').notNull(),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
}, (table) => ([
  index('idx_quest_user_status').on(table.userId, table.status),
  index('idx_quest_expires').on(table.expiresAt),
]));

// ─── Muhasabah Entries ───────────────────────────────────────────────
// Privacy: PRIVATE - deeply personal self-reflection, most private data
export const muhasabahEntries = sqliteTable('muhasabah_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  prompt1Text: text('prompt_1_text').notNull(),
  prompt1Response: text('prompt_1_response'),
  prompt2Text: text('prompt_2_text'),
  prompt2Response: text('prompt_2_response'),
  prompt3Text: text('prompt_3_text'),
  prompt3Response: text('prompt_3_response'),
  tomorrowIntention: text('tomorrow_intention'),
  xpEarned: integer('xp_earned').notNull().default(0),
  createdAt: text('created_at').notNull(),
}, (table) => ([
  index('idx_muhasabah_user_date').on(table.userId, table.createdAt),
]));

// ─── Settings ────────────────────────────────────────────────────────
// Privacy: SYNCABLE - preferences, no sensitive content
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  prayerCalcMethod: text('prayer_calc_method').notNull().default('ISNA'),
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  locationName: text('location_name'),
  ishaEndTime: text('isha_end_time').notNull().default('midnight'),
  notificationPrayers: integer('notification_prayers', { mode: 'boolean' }).notNull().default(true),
  notificationMuhasabah: integer('notification_muhasabah', { mode: 'boolean' }).notNull().default(true),
  notificationQuests: integer('notification_quests', { mode: 'boolean' }).notNull().default(false),
  notificationTitles: integer('notification_titles', { mode: 'boolean' }).notNull().default(true),
  muhasabahReminderTime: text('muhasabah_reminder_time').notNull().default('21:00'),
  darkMode: text('dark_mode').notNull().default('auto'),
  soundEnabled: integer('sound_enabled', { mode: 'boolean' }).notNull().default(true),
  hapticEnabled: integer('haptic_enabled', { mode: 'boolean' }).notNull().default(true),
  updatedAt: text('updated_at').notNull(),
}, (table) => ([
  uniqueIndex('idx_settings_user').on(table.userId),
]));

// ─── Niyyah ──────────────────────────────────────────────────────────
// Privacy: PRIVATE - personal spiritual intention
export const niyyah = sqliteTable('niyyah', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  text: text('text').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ([
  uniqueIndex('idx_niyyah_user').on(table.userId),
]));

// ─── Sync Queue ──────────────────────────────────────────────────────
// Privacy: LOCAL_ONLY - infrastructure, never synced
export const syncQueue = sqliteTable('sync_queue', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  operation: text('operation').notNull(),
  payload: text('payload').notNull(),
  createdAt: text('created_at').notNull(),
  syncedAt: text('synced_at'),
}, (table) => ([
  index('idx_sync_entity').on(table.entityType, table.entityId),
]));

// ─── Zustand Store ───────────────────────────────────────────────────
// Utility table for Zustand persist storage adapter
export const zustandStore = sqliteTable('_zustand_store', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
