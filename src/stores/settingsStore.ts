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
import type { PrayerName } from '../types/habits';

// ─── Prayer Reminder Config ───────────────────────────────────────────

export interface PrayerReminderConfig {
  enabled: boolean;
  leadMinutes: number;
  followUpEnabled: boolean;
}

const DEFAULT_PRAYER_REMINDERS: Record<PrayerName, PrayerReminderConfig> = {
  fajr: { enabled: true, leadMinutes: 10, followUpEnabled: true },
  dhuhr: { enabled: true, leadMinutes: 10, followUpEnabled: true },
  asr: { enabled: true, leadMinutes: 10, followUpEnabled: true },
  maghrib: { enabled: true, leadMinutes: 10, followUpEnabled: true },
  isha: { enabled: true, leadMinutes: 10, followUpEnabled: true },
};

// ─── Settings State Interface ─────────────────────────────────────────

interface SettingsState {
  // ── Existing fields ────────────────────────────────────────────────
  prayerCalcMethod: string;
  darkMode: DarkMode;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  muhasabahReminderTime: string;
  locationLat: number | null;
  locationLng: number | null;
  locationName: string | null;

  // ── Phase 6: Onboarding ────────────────────────────────────────────
  onboardingComplete: boolean;
  /** Not persisted — set to true when store rehydrates from storage */
  hydrated: boolean;
  selectedNiyyahs: string[];
  characterPresetId: string | null;

  // ── Phase 6: App settings ──────────────────────────────────────────
  arabicTermsEnabled: boolean;

  // ── Phase 6: Notification preferences ─────────────────────────────
  prayerReminders: Record<PrayerName, PrayerReminderConfig>;
  muhasabahNotifEnabled: boolean;
  streakMilestonesEnabled: boolean;
  questExpiringEnabled: boolean;
  morningMotivationEnabled: boolean;

  // ── Existing setters ──────────────────────────────────────────────
  setPrayerCalcMethod: (method: string) => void;
  setDarkMode: (mode: DarkMode) => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  setMuhasabahReminderTime: (time: string) => void;
  setLocation: (lat: number, lng: number, name?: string) => void;

  // ── Phase 6 setters ───────────────────────────────────────────────
  setOnboardingComplete: (value: boolean) => void;
  setSelectedNiyyahs: (niyyahs: string[]) => void;
  setCharacterPresetId: (id: string | null) => void;
  toggleArabicTerms: () => void;
  setPrayerReminder: (prayer: PrayerName, config: Partial<PrayerReminderConfig>) => void;
  setMuhasabahNotifEnabled: (enabled: boolean) => void;
  toggleStreakMilestones: () => void;
  toggleQuestExpiring: () => void;
  toggleMorningMotivation: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // ── Existing defaults ──────────────────────────────────────────
      prayerCalcMethod: 'ISNA',
      darkMode: 'auto' as DarkMode,
      soundEnabled: true,
      hapticEnabled: true,
      muhasabahReminderTime: '21:00',
      locationLat: null,
      locationLng: null,
      locationName: null,

      // ── Phase 6 defaults ───────────────────────────────────────────
      onboardingComplete: false,
      hydrated: false,
      selectedNiyyahs: [],
      characterPresetId: null,
      arabicTermsEnabled: true,
      prayerReminders: DEFAULT_PRAYER_REMINDERS,
      muhasabahNotifEnabled: true,
      streakMilestonesEnabled: false,
      questExpiringEnabled: false,
      morningMotivationEnabled: false,

      // ── Existing setters ───────────────────────────────────────────
      setPrayerCalcMethod: (method) => set({ prayerCalcMethod: method }),
      setDarkMode: (mode) => set({ darkMode: mode }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleHaptic: () => set((state) => ({ hapticEnabled: !state.hapticEnabled })),
      setMuhasabahReminderTime: (time) => set({ muhasabahReminderTime: time }),
      setLocation: (lat, lng, name) =>
        set({ locationLat: lat, locationLng: lng, locationName: name ?? null }),

      // ── Phase 6 setters ────────────────────────────────────────────
      setOnboardingComplete: (value) => set({ onboardingComplete: value }),
      setSelectedNiyyahs: (niyyahs) => set({ selectedNiyyahs: niyyahs }),
      setCharacterPresetId: (id) => set({ characterPresetId: id }),
      toggleArabicTerms: () => set((state) => ({ arabicTermsEnabled: !state.arabicTermsEnabled })),
      setPrayerReminder: (prayer, config) =>
        set((state) => ({
          prayerReminders: {
            ...state.prayerReminders,
            [prayer]: { ...state.prayerReminders[prayer], ...config },
          },
        })),
      setMuhasabahNotifEnabled: (enabled) => set({ muhasabahNotifEnabled: enabled }),
      toggleStreakMilestones: () =>
        set((state) => ({ streakMilestonesEnabled: !state.streakMilestonesEnabled })),
      toggleQuestExpiring: () =>
        set((state) => ({ questExpiringEnabled: !state.questExpiringEnabled })),
      toggleMorningMotivation: () =>
        set((state) => ({ morningMotivationEnabled: !state.morningMotivationEnabled })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => sqliteStorage),
      partialize: (state) => ({
        // Existing persisted fields
        prayerCalcMethod: state.prayerCalcMethod,
        darkMode: state.darkMode,
        soundEnabled: state.soundEnabled,
        hapticEnabled: state.hapticEnabled,
        muhasabahReminderTime: state.muhasabahReminderTime,
        locationLat: state.locationLat,
        locationLng: state.locationLng,
        locationName: state.locationName,
        // Phase 6 persisted fields (hydrated is NOT persisted)
        onboardingComplete: state.onboardingComplete,
        selectedNiyyahs: state.selectedNiyyahs,
        characterPresetId: state.characterPresetId,
        arabicTermsEnabled: state.arabicTermsEnabled,
        prayerReminders: state.prayerReminders,
        muhasabahNotifEnabled: state.muhasabahNotifEnabled,
        streakMilestonesEnabled: state.streakMilestonesEnabled,
        questExpiringEnabled: state.questExpiringEnabled,
        morningMotivationEnabled: state.morningMotivationEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
    },
  ),
);
