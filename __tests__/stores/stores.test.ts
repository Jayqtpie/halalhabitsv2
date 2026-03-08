/**
 * Tests for Zustand domain-split stores.
 *
 * sqliteStorage is mocked since it requires expo-sqlite runtime.
 * We test store initialization defaults and action methods.
 */

// Mock the sqliteStorage adapter before any imports
jest.mock('../../src/stores/sqliteStorage', () => ({
  sqliteStorage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock expo-sqlite so drizzle client doesn't crash in test
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
  })),
}));

import { useHabitStore } from '../../src/stores/habitStore';
import { useGameStore } from '../../src/stores/gameStore';
import { useUIStore } from '../../src/stores/uiStore';
import { useSettingsStore } from '../../src/stores/settingsStore';

describe('habitStore', () => {
  it('initializes with empty habits and loading=false', () => {
    const state = useHabitStore.getState();
    expect(state.habits).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe('gameStore', () => {
  it('initializes with level=1, totalXP=0, currentMultiplier=1.0, empty titles', () => {
    const state = useGameStore.getState();
    expect(state.currentLevel).toBe(1);
    expect(state.totalXP).toBe(0);
    expect(state.currentMultiplier).toBe(1.0);
    expect(state.titles).toEqual([]);
    expect(state.activeTitle).toBeNull();
    expect(state.loading).toBe(false);
  });
});

describe('uiStore', () => {
  it('initializes with no active modals or toasts', () => {
    const state = useUIStore.getState();
    expect(state.activeModal).toBeNull();
    expect(state.toastMessage).toBeNull();
    expect(state.toastType).toBeNull();
  });

  it('showModal sets activeModal', () => {
    useUIStore.getState().showModal('test-modal');
    expect(useUIStore.getState().activeModal).toBe('test-modal');
  });

  it('hideModal clears activeModal', () => {
    useUIStore.getState().showModal('test-modal');
    useUIStore.getState().hideModal();
    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it('showToast sets message and type', () => {
    useUIStore.getState().showToast('Test message', 'success');
    const state = useUIStore.getState();
    expect(state.toastMessage).toBe('Test message');
    expect(state.toastType).toBe('success');
  });

  it('hideToast clears toast state', () => {
    useUIStore.getState().showToast('Test message', 'error');
    useUIStore.getState().hideToast();
    const state = useUIStore.getState();
    expect(state.toastMessage).toBeNull();
    expect(state.toastType).toBeNull();
  });
});

describe('settingsStore', () => {
  it('initializes with correct default values', () => {
    const state = useSettingsStore.getState();
    expect(state.prayerCalcMethod).toBe('ISNA');
    expect(state.darkMode).toBe('auto');
    expect(state.soundEnabled).toBe(true);
    expect(state.hapticEnabled).toBe(true);
    expect(state.muhasabahReminderTime).toBe('21:00');
  });

  it('setPrayerCalcMethod updates the method', () => {
    useSettingsStore.getState().setPrayerCalcMethod('MWL');
    expect(useSettingsStore.getState().prayerCalcMethod).toBe('MWL');
  });

  it('setDarkMode updates the mode', () => {
    useSettingsStore.getState().setDarkMode('dark');
    expect(useSettingsStore.getState().darkMode).toBe('dark');
  });

  it('toggleSound flips soundEnabled', () => {
    const initial = useSettingsStore.getState().soundEnabled;
    useSettingsStore.getState().toggleSound();
    expect(useSettingsStore.getState().soundEnabled).toBe(!initial);
  });

  it('toggleHaptic flips hapticEnabled', () => {
    const initial = useSettingsStore.getState().hapticEnabled;
    useSettingsStore.getState().toggleHaptic();
    expect(useSettingsStore.getState().hapticEnabled).toBe(!initial);
  });
});
