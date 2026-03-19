/**
 * Privacy Gate module.
 *
 * Table-level privacy classification and sync guard.
 * This is the structural guarantee that worship data (salah completion logs,
 * Muhasabah reflections, streaks, niyyah) never leaves the device.
 *
 * All 19 entities must have explicit classification. Unknown tables throw.
 * The assertSyncable function is the ONLY path for sync queue writes.
 *
 * @see blueprint/11-data-model.md for privacy justifications
 * @see FOUN-05 requirement
 */
import type { PrivacyLevel } from '../types/common';

/**
 * Privacy classification map for all 19 entities.
 *
 * PRIVATE (5): Worship data that never leaves the device
 * SYNCABLE (11): Profile/game data safe for cloud backup
 * LOCAL_ONLY (3): Infrastructure/ephemeral tables
 */
export const PRIVACY_MAP: Record<string, PrivacyLevel> = {
  // PRIVATE - worship data, sacred privacy
  habit_completions: 'PRIVATE',
  streaks: 'PRIVATE',
  muhasabah_entries: 'PRIVATE',
  niyyah: 'PRIVATE',
  boss_battles: 'PRIVATE',       // nafs archetype reveals personal struggle

  // SYNCABLE - profile and game data
  users: 'SYNCABLE',
  habits: 'SYNCABLE',
  xp_ledger: 'SYNCABLE',
  titles: 'SYNCABLE',
  user_titles: 'SYNCABLE',
  quests: 'SYNCABLE',
  settings: 'SYNCABLE',
  buddies: 'SYNCABLE',           // connection metadata both users need
  messages: 'SYNCABLE',          // offline cache + Supabase sync
  duo_quests: 'SYNCABLE',        // both buddies need to see quest progress
  shared_habits: 'SYNCABLE',     // both buddies need to see shared goal

  // LOCAL_ONLY - infrastructure
  sync_queue: 'LOCAL_ONLY',
  detox_sessions: 'LOCAL_ONLY',  // ephemeral session data
  _zustand_store: 'LOCAL_ONLY',  // Zustand persist infrastructure
} as const;

/**
 * Get the privacy classification for a table.
 * Throws if the table name is not in the classification map.
 * Every table MUST have explicit classification — no defaults.
 */
export function getPrivacyLevel(tableName: string): PrivacyLevel {
  const level = PRIVACY_MAP[tableName];
  if (!level) {
    throw new Error(
      `Unknown table: "${tableName}". All tables must have explicit privacy classification in PRIVACY_MAP.`
    );
  }
  return level;
}

/**
 * Check if a table's data is safe to sync to the cloud.
 * Returns true only for SYNCABLE tables.
 */
export function isSyncable(tableName: string): boolean {
  return getPrivacyLevel(tableName) === 'SYNCABLE';
}

/**
 * Assert that a table is safe to sync. Throws if not.
 * This is the guard function that MUST be called before any sync queue write.
 */
export function assertSyncable(tableName: string): void {
  const level = getPrivacyLevel(tableName);
  if (level !== 'SYNCABLE') {
    throw new Error(
      `PRIVACY VIOLATION: Attempted to sync "${tableName}" (classified as ${level}). ` +
      `Only SYNCABLE tables may be synced to the cloud.`
    );
  }
}

/**
 * Get all table names classified as PRIVATE.
 * Useful for the "Data Privacy" settings screen (FOUN-05).
 */
export function getPrivateTables(): string[] {
  return Object.entries(PRIVACY_MAP)
    .filter(([, level]) => level === 'PRIVATE')
    .map(([name]) => name);
}

/**
 * Get all table names classified as SYNCABLE.
 * Useful for the "Data Privacy" settings screen (FOUN-05).
 */
export function getSyncableTables(): string[] {
  return Object.entries(PRIVACY_MAP)
    .filter(([, level]) => level === 'SYNCABLE')
    .map(([name]) => name);
}
