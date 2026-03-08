/**
 * Privacy Gate tests.
 * Verifies that ALL 13 entities have correct privacy classification
 * and that sync guards enforce the classifications.
 */
import {
  getPrivacyLevel,
  isSyncable,
  assertSyncable,
  PRIVACY_MAP,
  getPrivateTables,
  getSyncableTables,
} from '../../src/services/privacy-gate';

const PRIVATE_TABLES = [
  'habit_completions',
  'streaks',
  'muhasabah_entries',
  'niyyah',
] as const;

const SYNCABLE_TABLES = [
  'users',
  'habits',
  'xp_ledger',
  'titles',
  'user_titles',
  'quests',
  'settings',
] as const;

const LOCAL_ONLY_TABLES = ['sync_queue'] as const;

describe('Privacy Gate', () => {
  describe('PRIVACY_MAP completeness', () => {
    it('classifies exactly 12 entities (4 PRIVATE + 7 SYNCABLE + 1 LOCAL_ONLY)', () => {
      const allTables = [...PRIVATE_TABLES, ...SYNCABLE_TABLES, ...LOCAL_ONLY_TABLES];
      expect(Object.keys(PRIVACY_MAP)).toHaveLength(allTables.length);

      for (const table of allTables) {
        expect(PRIVACY_MAP).toHaveProperty(table);
      }
    });
  });

  describe('getPrivacyLevel', () => {
    it.each(PRIVATE_TABLES)('classifies %s as PRIVATE', (table) => {
      expect(getPrivacyLevel(table)).toBe('PRIVATE');
    });

    it.each(SYNCABLE_TABLES)('classifies %s as SYNCABLE', (table) => {
      expect(getPrivacyLevel(table)).toBe('SYNCABLE');
    });

    it('classifies sync_queue as LOCAL_ONLY', () => {
      expect(getPrivacyLevel('sync_queue')).toBe('LOCAL_ONLY');
    });

    it('throws on unknown table name', () => {
      expect(() => getPrivacyLevel('unknown_table')).toThrow('Unknown table');
      expect(() => getPrivacyLevel('unknown_table')).toThrow('unknown_table');
    });
  });

  describe('isSyncable', () => {
    it.each(SYNCABLE_TABLES)('returns true for %s', (table) => {
      expect(isSyncable(table)).toBe(true);
    });

    it.each(PRIVATE_TABLES)('returns false for %s', (table) => {
      expect(isSyncable(table)).toBe(false);
    });

    it('returns false for sync_queue (LOCAL_ONLY)', () => {
      expect(isSyncable('sync_queue')).toBe(false);
    });
  });

  describe('assertSyncable', () => {
    it.each(PRIVATE_TABLES)('throws PRIVACY VIOLATION for %s', (table) => {
      expect(() => assertSyncable(table)).toThrow('PRIVACY VIOLATION');
      expect(() => assertSyncable(table)).toThrow(table);
      expect(() => assertSyncable(table)).toThrow('PRIVATE');
    });

    it.each(SYNCABLE_TABLES)('does NOT throw for %s', (table) => {
      expect(() => assertSyncable(table)).not.toThrow();
    });

    it('throws for sync_queue (LOCAL_ONLY)', () => {
      expect(() => assertSyncable('sync_queue')).toThrow('PRIVACY VIOLATION');
      expect(() => assertSyncable('sync_queue')).toThrow('LOCAL_ONLY');
    });
  });

  describe('getPrivateTables', () => {
    it('returns exactly 4 private tables', () => {
      const privateTables = getPrivateTables();
      expect(privateTables).toHaveLength(4);
      for (const table of PRIVATE_TABLES) {
        expect(privateTables).toContain(table);
      }
    });
  });

  describe('getSyncableTables', () => {
    it('returns exactly 7 syncable tables', () => {
      const syncableTables = getSyncableTables();
      expect(syncableTables).toHaveLength(7);
      for (const table of SYNCABLE_TABLES) {
        expect(syncableTables).toContain(table);
      }
    });
  });
});
