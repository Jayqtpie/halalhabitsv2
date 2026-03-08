/**
 * User preferences state management with SQLite-backed persistence.
 *
 * This is the ONLY store that uses persist middleware.
 * Settings are user preferences (not worship data), so they are safe to persist.
 *
 * Usage with useShallow for multi-field selectors:
 *   const { darkMode, soundEnabled } = useSettingsStore(useShallow(s => ({ darkMode: s.darkMode, soundEnabled: s.soundEnabled })));
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sqliteStorage } from './sqliteStorage';
import type { DarkMode } from '../types/common';

interface SettingsState {
  prayerCalcMethod: string;
  darkMode: DarkMode;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  muhasabahReminderTime: string;
  setPrayerCalcMethod: (method: string) => void;
  setDarkMode: (mode: DarkMode) => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  setMuhasabahReminderTime: (time: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      prayerCalcMethod: 'ISNA',
      darkMode: 'auto' as DarkMode,
      soundEnabled: true,
      hapticEnabled: true,
      muhasabahReminderTime: '21:00',

      setPrayerCalcMethod: (method) => set({ prayerCalcMethod: method }),
      setDarkMode: (mode) => set({ darkMode: mode }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleHaptic: () => set((state) => ({ hapticEnabled: !state.hapticEnabled })),
      setMuhasabahReminderTime: (time) => set({ muhasabahReminderTime: time }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => sqliteStorage),
      partialize: (state) => ({
        prayerCalcMethod: state.prayerCalcMethod,
        darkMode: state.darkMode,
        soundEnabled: state.soundEnabled,
        hapticEnabled: state.hapticEnabled,
        muhasabahReminderTime: state.muhasabahReminderTime,
      }),
    },
  ),
);
