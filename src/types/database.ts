/**
 * TypeScript types inferred from Drizzle schema.
 *
 * InferSelectModel = type returned by SELECT queries
 * InferInsertModel = type required for INSERT operations
 *
 * These types flow into the DAO/repository layer for type-safe queries.
 */
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type {
  users,
  habits,
  habitCompletions,
  streaks,
  xpLedger,
  titles,
  userTitles,
  quests,
  muhasabahEntries,
  settings,
  niyyah,
  syncQueue,
} from '../db/schema';

// ─── User ────────────────────────────────────────────────────────────
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// ─── Habit ───────────────────────────────────────────────────────────
export type Habit = InferSelectModel<typeof habits>;
export type NewHabit = InferInsertModel<typeof habits>;

// ─── Habit Completion ────────────────────────────────────────────────
export type HabitCompletion = InferSelectModel<typeof habitCompletions>;
export type NewHabitCompletion = InferInsertModel<typeof habitCompletions>;

// ─── Streak ──────────────────────────────────────────────────────────
export type Streak = InferSelectModel<typeof streaks>;
export type NewStreak = InferInsertModel<typeof streaks>;

// ─── XP Ledger ───────────────────────────────────────────────────────
export type XPLedger = InferSelectModel<typeof xpLedger>;
export type NewXPLedger = InferInsertModel<typeof xpLedger>;

// ─── Title ───────────────────────────────────────────────────────────
export type Title = InferSelectModel<typeof titles>;
export type NewTitle = InferInsertModel<typeof titles>;

// ─── User Title ──────────────────────────────────────────────────────
export type UserTitle = InferSelectModel<typeof userTitles>;
export type NewUserTitle = InferInsertModel<typeof userTitles>;

// ─── Quest ───────────────────────────────────────────────────────────
export type Quest = InferSelectModel<typeof quests>;
export type NewQuest = InferInsertModel<typeof quests>;

// ─── Muhasabah Entry ─────────────────────────────────────────────────
export type MuhasabahEntry = InferSelectModel<typeof muhasabahEntries>;
export type NewMuhasabahEntry = InferInsertModel<typeof muhasabahEntries>;

// ─── Settings ────────────────────────────────────────────────────────
export type Settings = InferSelectModel<typeof settings>;
export type NewSettings = InferInsertModel<typeof settings>;

// ─── Niyyah ──────────────────────────────────────────────────────────
export type Niyyah = InferSelectModel<typeof niyyah>;
export type NewNiyyah = InferInsertModel<typeof niyyah>;

// ─── Sync Queue ──────────────────────────────────────────────────────
export type SyncQueueItem = InferSelectModel<typeof syncQueue>;
export type NewSyncQueueItem = InferInsertModel<typeof syncQueue>;
