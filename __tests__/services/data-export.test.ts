/**
 * Tests for data-export service.
 *
 * Mocks expo-file-system, expo-sharing, and the repo/store layer.
 * Verifies: collectAllUserData structure, exportUserData calls FS+Sharing,
 * deleteAllUserData clears stores.
 */

// Mock expo modules before imports
jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock repos
jest.mock('../../src/db/repos', () => ({
  habitRepo: {
    getActive: jest.fn().mockResolvedValue([
      { id: 'h1', name: 'Fajr', type: 'salah_fajr', userId: 'local-user' },
    ]),
    deleteAll: jest.fn().mockResolvedValue(undefined),
  },
  completionRepo: {
    getAll: jest.fn().mockResolvedValue([
      { id: 'c1', habitId: 'h1', completedAt: '2026-01-01T00:00:00Z', xpEarned: 50 },
    ]),
    deleteAll: jest.fn().mockResolvedValue(undefined),
  },
  streakRepo: {
    getAllForUser: jest.fn().mockResolvedValue([
      { habitId: 'h1', currentCount: 5, longestCount: 10, multiplier: 1.5 },
    ]),
    deleteAll: jest.fn().mockResolvedValue(undefined),
  },
  xpRepo: {
    getAllForUser: jest.fn().mockResolvedValue([
      { id: 'x1', userId: 'local-user', amount: 50, sourceType: 'habit', earnedAt: '2026-01-01' },
    ]),
    deleteAll: jest.fn().mockResolvedValue(undefined),
  },
  titleRepo: {
    getUserTitles: jest.fn().mockResolvedValue([
      { titleId: 'the-seeker', userId: 'local-user', earnedAt: '2026-01-01' },
    ]),
    deleteAll: jest.fn().mockResolvedValue(undefined),
  },
  questRepo: {
    getAll: jest.fn().mockResolvedValue([
      { id: 'q1', userId: 'local-user', type: 'daily', status: 'completed' },
    ]),
    deleteAll: jest.fn().mockResolvedValue(undefined),
  },
  muhasabahRepo: {
    getAll: jest.fn().mockResolvedValue([
      { id: 'm1', userId: 'local-user', createdAt: '2026-01-01', content: 'Reflection' },
    ]),
    deleteAll: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock stores
const mockGameStoreReset = jest.fn();
const mockHabitStoreReset = jest.fn();
const mockSettingsStoreReset = jest.fn();
const mockSetOnboardingComplete = jest.fn();

jest.mock('../../src/stores/gameStore', () => ({
  useGameStore: {
    getState: () => ({
      setLevel: jest.fn(),
      setTotalXP: jest.fn(),
      setTitles: jest.fn(),
      setActiveTitle: jest.fn(),
    }),
  },
}));

jest.mock('../../src/stores/habitStore', () => ({
  useHabitStore: {
    getState: () => ({
      habits: [],
      completions: {},
      streaks: {},
    }),
    setState: mockHabitStoreReset,
  },
}));

jest.mock('../../src/stores/settingsStore', () => ({
  useSettingsStore: {
    getState: () => ({
      prayerCalcMethod: 'ISNA',
      darkMode: 'auto',
      soundEnabled: true,
      arabicTermsEnabled: true,
      onboardingComplete: true,
      selectedNiyyahs: ['strengthen-salah'],
      setOnboardingComplete: mockSetOnboardingComplete,
    }),
  },
}));

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { collectAllUserData, exportUserData, deleteAllUserData } from '../../src/services/data-export';

const USER_ID = 'local-user';

describe('data-export service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('collectAllUserData', () => {
    it('returns object with all required keys', async () => {
      const data = await collectAllUserData(USER_ID);

      expect(data).toHaveProperty('habits');
      expect(data).toHaveProperty('completions');
      expect(data).toHaveProperty('streaks');
      expect(data).toHaveProperty('xp_ledger');
      expect(data).toHaveProperty('titles');
      expect(data).toHaveProperty('quests');
      expect(data).toHaveProperty('muhasabah');
      expect(data).toHaveProperty('settings');
    });

    it('includes habit data in correct shape', async () => {
      const data = await collectAllUserData(USER_ID);
      expect(Array.isArray(data.habits)).toBe(true);
      expect(data.habits.length).toBeGreaterThan(0);
    });

    it('includes settings as object', async () => {
      const data = await collectAllUserData(USER_ID);
      expect(typeof data.settings).toBe('object');
      expect(data.settings).not.toBeNull();
    });
  });

  describe('exportUserData', () => {
    it('calls FileSystem.writeAsStringAsync with JSON content', async () => {
      await exportUserData(USER_ID);

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);
      const [filePath, content] = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0];
      expect(filePath).toContain('halalhabits-export.json');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('calls Sharing.shareAsync after writing file', async () => {
      await exportUserData(USER_ID);

      expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
      const [shareArg, options] = (Sharing.shareAsync as jest.Mock).mock.calls[0];
      expect(shareArg).toContain('halalhabits-export.json');
      expect(options?.mimeType).toBe('application/json');
    });
  });

  describe('deleteAllUserData', () => {
    it('calls setOnboardingComplete(false) to reset app to onboarding', async () => {
      await deleteAllUserData(USER_ID);
      expect(mockSetOnboardingComplete).toHaveBeenCalledWith(false);
    });

    it('does not throw on successful deletion', async () => {
      await expect(deleteAllUserData(USER_ID)).resolves.not.toThrow();
    });
  });
});
