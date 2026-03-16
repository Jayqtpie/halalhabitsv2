/**
 * Tests for data-export service.
 *
 * Mocks expo-file-system, expo-sharing, and the repo/store layer.
 * Verifies: collectAllUserData structure, exportUserData calls FS+Sharing,
 * deleteAllUserData clears stores.
 */

// Mock expo modules before imports
jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock repos — using actual method names from the repos
jest.mock('../../src/db/repos', () => ({
  habitRepo: {
    getActive: jest.fn().mockResolvedValue([
      { id: 'h1', name: 'Fajr', type: 'salah_fajr', userId: 'local-user' },
    ]),
  },
  completionRepo: {
    getAllForDate: jest.fn().mockResolvedValue([
      { id: 'c1', habitId: 'h1', completedAt: '2026-01-01T00:00:00Z', xpEarned: 50 },
    ]),
  },
  streakRepo: {
    getAllForUser: jest.fn().mockResolvedValue([
      { habitId: 'h1', currentCount: 5, longestCount: 10, multiplier: 1.5 },
    ]),
  },
  xpRepo: {
    getByUser: jest.fn().mockResolvedValue([
      { id: 'x1', userId: 'local-user', amount: 50, sourceType: 'habit', earnedAt: '2026-01-01' },
    ]),
  },
  titleRepo: {
    getUserTitles: jest.fn().mockResolvedValue([
      { titleId: 'the-seeker', userId: 'local-user', earnedAt: '2026-01-01' },
    ]),
  },
  questRepo: {
    getByUser: jest.fn().mockResolvedValue([
      { id: 'q1', userId: 'local-user', type: 'daily', status: 'completed' },
    ]),
  },
  muhasabahRepo: {
    getByUserId: jest.fn().mockResolvedValue([
      { id: 'm1', userId: 'local-user', createdAt: '2026-01-01', prompt1Text: 'Reflection' },
    ]),
  },
}));

// Mock DB client (for deleteAllUserData)
jest.mock('../../src/db/client', () => ({
  getDb: jest.fn().mockReturnValue({
    $client: {
      execSync: jest.fn(),
    },
  }),
}));

// Mock stores
const mockSetOnboardingComplete = jest.fn();
const mockSetLevel = jest.fn();
const mockSetTotalXP = jest.fn();
const mockSetTitles = jest.fn();
const mockSetActiveTitle = jest.fn();

jest.mock('../../src/stores/gameStore', () => ({
  useGameStore: {
    getState: () => ({
      setLevel: mockSetLevel,
      setTotalXP: mockSetTotalXP,
      setTitles: mockSetTitles,
      setActiveTitle: mockSetActiveTitle,
    }),
  },
}));

jest.mock('../../src/stores/habitStore', () => ({
  useHabitStore: {
    setState: jest.fn(),
    getState: () => ({
      habits: [],
      completions: {},
      streaks: {},
    }),
  },
}));

jest.mock('../../src/stores/settingsStore', () => ({
  useSettingsStore: {
    getState: () => ({
      prayerCalcMethod: 'ISNA',
      darkMode: 'auto',
      soundEnabled: true,
      hapticEnabled: true,
      arabicTermsEnabled: true,
      selectedNiyyahs: ['strengthen-salah'],
      characterPresetId: null,
      muhasabahReminderTime: '21:00',
      muhasabahNotifEnabled: true,
      streakMilestonesEnabled: false,
      questExpiringEnabled: false,
      morningMotivationEnabled: false,
      onboardingComplete: true,
      setOnboardingComplete: mockSetOnboardingComplete,
    }),
  },
}));

import * as FileSystem from 'expo-file-system/legacy';
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

    it('includes exportedAt and version fields', async () => {
      const data = await collectAllUserData(USER_ID);
      expect(data).toHaveProperty('exportedAt');
      expect(data).toHaveProperty('version');
      expect(data.version).toBe('1.0');
    });

    it('includes habit data as array', async () => {
      const data = await collectAllUserData(USER_ID);
      expect(Array.isArray(data.habits)).toBe(true);
      expect(data.habits.length).toBeGreaterThan(0);
    });

    it('includes settings as object with required fields', async () => {
      const data = await collectAllUserData(USER_ID);
      expect(typeof data.settings).toBe('object');
      expect(data.settings).not.toBeNull();
      expect(data.settings).toHaveProperty('prayerCalcMethod');
      expect(data.settings).toHaveProperty('arabicTermsEnabled');
      expect(data.settings).toHaveProperty('selectedNiyyahs');
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

    it('exported JSON contains all required keys', async () => {
      await exportUserData(USER_ID);
      const content = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(content);
      expect(parsed).toHaveProperty('habits');
      expect(parsed).toHaveProperty('completions');
      expect(parsed).toHaveProperty('streaks');
      expect(parsed).toHaveProperty('xp_ledger');
      expect(parsed).toHaveProperty('titles');
      expect(parsed).toHaveProperty('quests');
      expect(parsed).toHaveProperty('muhasabah');
      expect(parsed).toHaveProperty('settings');
    });
  });

  describe('deleteAllUserData', () => {
    it('calls setOnboardingComplete(false) to reset app to onboarding', async () => {
      await deleteAllUserData(USER_ID);
      expect(mockSetOnboardingComplete).toHaveBeenCalledWith(false);
    });

    it('resets game store to level 1', async () => {
      await deleteAllUserData(USER_ID);
      expect(mockSetLevel).toHaveBeenCalledWith(1);
      expect(mockSetTotalXP).toHaveBeenCalledWith(0);
    });

    it('does not throw on successful deletion', async () => {
      await expect(deleteAllUserData(USER_ID)).resolves.not.toThrow();
    });
  });
});
