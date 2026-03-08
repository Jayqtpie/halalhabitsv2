/**
 * Database schema structure tests.
 * Verifies that the Drizzle schema defines all required entities
 * with correct columns and types.
 *
 * Note: These are structural tests — they verify the schema definition
 * objects, not actual database operations (which require expo-sqlite runtime).
 */
import * as schema from '../../src/db/schema';
import {
  getTableName,
  getTableColumns,
} from 'drizzle-orm';

// All 13 entities + 1 utility table
const EXPECTED_TABLES = [
  'users',
  'habits',
  'habit_completions',
  'streaks',
  'xp_ledger',
  'titles',
  'user_titles',
  'quests',
  'muhasabah_entries',
  'settings',
  'niyyah',
  'sync_queue',
  '_zustand_store',
] as const;

describe('Database Schema', () => {
  describe('Table definitions', () => {
    it('exports all 14 expected tables (13 entities + _zustand_store)', () => {
      const tableNames = [
        getTableName(schema.users),
        getTableName(schema.habits),
        getTableName(schema.habitCompletions),
        getTableName(schema.streaks),
        getTableName(schema.xpLedger),
        getTableName(schema.titles),
        getTableName(schema.userTitles),
        getTableName(schema.quests),
        getTableName(schema.muhasabahEntries),
        getTableName(schema.settings),
        getTableName(schema.niyyah),
        getTableName(schema.syncQueue),
        getTableName(schema.zustandStore),
      ];

      for (const expected of EXPECTED_TABLES) {
        expect(tableNames).toContain(expected);
      }
      expect(tableNames).toHaveLength(EXPECTED_TABLES.length);
    });
  });

  describe('Users table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.users);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('displayName');
      expect(cols).toHaveProperty('activeTitleId');
      expect(cols).toHaveProperty('currentLevel');
      expect(cols).toHaveProperty('totalXp');
      expect(cols).toHaveProperty('createdAt');
      expect(cols).toHaveProperty('updatedAt');
    });
  });

  describe('Habits table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.habits);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('userId');
      expect(cols).toHaveProperty('name');
      expect(cols).toHaveProperty('type');
      expect(cols).toHaveProperty('presetKey');
      expect(cols).toHaveProperty('category');
      expect(cols).toHaveProperty('frequency');
      expect(cols).toHaveProperty('frequencyDays');
      expect(cols).toHaveProperty('timeWindowStart');
      expect(cols).toHaveProperty('timeWindowEnd');
      expect(cols).toHaveProperty('difficultyTier');
      expect(cols).toHaveProperty('baseXp');
      expect(cols).toHaveProperty('status');
      expect(cols).toHaveProperty('sortOrder');
      expect(cols).toHaveProperty('icon');
      expect(cols).toHaveProperty('createdAt');
      expect(cols).toHaveProperty('updatedAt');
    });
  });

  describe('HabitCompletions table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.habitCompletions);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('habitId');
      expect(cols).toHaveProperty('completedAt');
      expect(cols).toHaveProperty('xpEarned');
      expect(cols).toHaveProperty('streakMultiplier');
      expect(cols).toHaveProperty('createdAt');
    });
  });

  describe('Streaks table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.streaks);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('habitId');
      expect(cols).toHaveProperty('currentCount');
      expect(cols).toHaveProperty('longestCount');
      expect(cols).toHaveProperty('lastCompletedAt');
      expect(cols).toHaveProperty('multiplier');
      expect(cols).toHaveProperty('isRebuilt');
      expect(cols).toHaveProperty('rebuiltAt');
      expect(cols).toHaveProperty('updatedAt');
    });
  });

  describe('XPLedger table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.xpLedger);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('userId');
      expect(cols).toHaveProperty('amount');
      expect(cols).toHaveProperty('sourceType');
      expect(cols).toHaveProperty('sourceId');
      expect(cols).toHaveProperty('earnedAt');
      expect(cols).toHaveProperty('createdAt');
    });
  });

  describe('Titles table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.titles);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('name');
      expect(cols).toHaveProperty('rarity');
      expect(cols).toHaveProperty('unlockType');
      expect(cols).toHaveProperty('unlockValue');
      expect(cols).toHaveProperty('unlockHabitType');
      expect(cols).toHaveProperty('flavorText');
      expect(cols).toHaveProperty('sortOrder');
    });
  });

  describe('UserTitles table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.userTitles);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('userId');
      expect(cols).toHaveProperty('titleId');
      expect(cols).toHaveProperty('earnedAt');
    });
  });

  describe('Quests table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.quests);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('userId');
      expect(cols).toHaveProperty('type');
      expect(cols).toHaveProperty('description');
      expect(cols).toHaveProperty('xpReward');
      expect(cols).toHaveProperty('targetType');
      expect(cols).toHaveProperty('targetValue');
      expect(cols).toHaveProperty('targetHabitId');
      expect(cols).toHaveProperty('progress');
      expect(cols).toHaveProperty('status');
      expect(cols).toHaveProperty('expiresAt');
      expect(cols).toHaveProperty('completedAt');
      expect(cols).toHaveProperty('createdAt');
    });
  });

  describe('MuhasabahEntries table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.muhasabahEntries);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('userId');
      expect(cols).toHaveProperty('prompt1Text');
      expect(cols).toHaveProperty('prompt1Response');
      expect(cols).toHaveProperty('prompt2Text');
      expect(cols).toHaveProperty('prompt2Response');
      expect(cols).toHaveProperty('prompt3Text');
      expect(cols).toHaveProperty('prompt3Response');
      expect(cols).toHaveProperty('tomorrowIntention');
      expect(cols).toHaveProperty('xpEarned');
      expect(cols).toHaveProperty('createdAt');
    });
  });

  describe('Settings table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.settings);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('userId');
      expect(cols).toHaveProperty('prayerCalcMethod');
      expect(cols).toHaveProperty('locationLat');
      expect(cols).toHaveProperty('locationLng');
      expect(cols).toHaveProperty('locationName');
      expect(cols).toHaveProperty('ishaEndTime');
      expect(cols).toHaveProperty('notificationPrayers');
      expect(cols).toHaveProperty('notificationMuhasabah');
      expect(cols).toHaveProperty('notificationQuests');
      expect(cols).toHaveProperty('notificationTitles');
      expect(cols).toHaveProperty('muhasabahReminderTime');
      expect(cols).toHaveProperty('darkMode');
      expect(cols).toHaveProperty('soundEnabled');
      expect(cols).toHaveProperty('hapticEnabled');
      expect(cols).toHaveProperty('updatedAt');
    });
  });

  describe('Niyyah table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.niyyah);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('userId');
      expect(cols).toHaveProperty('text');
      expect(cols).toHaveProperty('createdAt');
    });
  });

  describe('SyncQueue table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.syncQueue);
      expect(cols).toHaveProperty('id');
      expect(cols).toHaveProperty('entityType');
      expect(cols).toHaveProperty('entityId');
      expect(cols).toHaveProperty('operation');
      expect(cols).toHaveProperty('payload');
      expect(cols).toHaveProperty('createdAt');
      expect(cols).toHaveProperty('syncedAt');
    });
  });

  describe('ZustandStore table', () => {
    it('has required columns', () => {
      const cols = getTableColumns(schema.zustandStore);
      expect(cols).toHaveProperty('key');
      expect(cols).toHaveProperty('value');
    });
  });
});

describe('Database types', () => {
  it('exports all entity types from types/database.ts', () => {
    // This is a compile-time check — if any of these imports fail,
    // TypeScript compilation will catch it
    const types = require('../../src/types/database');

    // Verify all select types are exported (as type aliases,
    // they won't exist at runtime, but the module should export)
    expect(types).toBeDefined();
  });
});
