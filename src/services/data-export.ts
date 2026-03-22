/**
 * Data Export Service — collect, export, and delete all user data.
 *
 * Privacy-first: export writes to local cache dir only.
 * User data deletion resets app to pre-onboarding state.
 *
 * No React imports — fully unit-testable.
 */
// Use legacy expo-file-system API (writeAsStringAsync + cacheDirectory)
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {
  habitRepo,
  completionRepo,
  streakRepo,
  xpRepo,
  titleRepo,
  questRepo,
  muhasabahRepo,
  syncQueueRepo,
} from '../db/repos';
import { useSettingsStore } from '../stores/settingsStore';
import { useGameStore } from '../stores/gameStore';
import { useHabitStore } from '../stores/habitStore';
import { useAuthStore } from '../stores/authStore';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { getDb } from '../db/client';

// ─── Types ────────────────────────────────────────────────────────────

export interface UserDataExport {
  exportedAt: string;
  version: string;
  habits: unknown[];
  completions: unknown[];
  streaks: unknown[];
  xp_ledger: unknown[];
  titles: unknown[];
  quests: unknown[];
  muhasabah: unknown[];
  settings: Record<string, unknown>;
}

// ─── collectAllUserData ────────────────────────────────────────────────

/**
 * Collect all user data from repos and stores.
 * Returns a structured object for export.
 */
export async function collectAllUserData(userId: string): Promise<UserDataExport> {
  const [habits, streaksList, xpLedger, titles, quests, muhasabah] =
    await Promise.all([
      habitRepo.getActive(userId),
      streakRepo.getAllForUser(userId),
      xpRepo.getByUser(userId),
      titleRepo.getUserTitles(userId),
      questRepo.getByUser(userId),
      muhasabahRepo.getByUserId(userId, 1000),
    ]);

  // Get all completions for all habits
  let completions: unknown[] = [];
  try {
    const now = new Date();
    const dayStart = new Date(now.getFullYear() - 5, 0, 1).toISOString();
    const dayEnd = new Date(now.getFullYear() + 1, 0, 1).toISOString();
    completions = await completionRepo.getAllForDate(userId, dayStart, dayEnd);
  } catch {
    // Fallback: empty completions if query fails
    completions = [];
  }

  const settingsState = useSettingsStore.getState();
  const settings: Record<string, unknown> = {
    prayerCalcMethod: settingsState.prayerCalcMethod,
    darkMode: settingsState.darkMode,
    soundEnabled: settingsState.soundEnabled,
    hapticEnabled: settingsState.hapticEnabled,
    arabicTermsEnabled: settingsState.arabicTermsEnabled,
    selectedNiyyahs: settingsState.selectedNiyyahs,
    characterPresetId: settingsState.characterPresetId,
    muhasabahReminderTime: settingsState.muhasabahReminderTime,
    muhasabahNotifEnabled: settingsState.muhasabahNotifEnabled,
    streakMilestonesEnabled: settingsState.streakMilestonesEnabled,
    questExpiringEnabled: settingsState.questExpiringEnabled,
    morningMotivationEnabled: settingsState.morningMotivationEnabled,
  };

  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    habits,
    completions,
    streaks: streaksList,
    xp_ledger: xpLedger,
    titles,
    quests,
    muhasabah,
    settings,
  };
}

// ─── exportUserData ───────────────────────────────────────────────────

/**
 * Collect all user data, write to local cache as JSON, and share via share sheet.
 */
export async function exportUserData(userId: string): Promise<void> {
  const data = await collectAllUserData(userId);
  const json = JSON.stringify(data, null, 2);

  const filePath = (FileSystem.cacheDirectory ?? 'file:///cache/') + 'halalhabits-export.json';

  await FileSystem.writeAsStringAsync(filePath, json);

  await Sharing.shareAsync(filePath, {
    mimeType: 'application/json',
    dialogTitle: 'Export HalalHabits Data',
    UTI: 'public.json',
  });
}

// ─── deleteAllUserData ────────────────────────────────────────────────

/**
 * Delete all user data from the database and reset all stores.
 * Sets onboardingComplete = false to restart onboarding flow.
 *
 * Order of deletion respects foreign key constraints:
 * completions -> streaks -> xp_ledger -> quests -> muhasabah ->
 * user_titles -> habits -> users -> settings store
 */
export async function deleteAllUserData(userId: string): Promise<void> {
  // If authenticated, delete server-side data first
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated && supabaseConfigured) {
    try {
      // Delete from all syncable tables on server
      const syncableTables = ['xp_ledger', 'user_titles', 'quests', 'habits', 'settings', 'users'];
      for (const table of syncableTables) {
        if (table === 'users') {
          await supabase.from(table).delete().eq('id', userId);
        } else {
          await supabase.from(table).delete().eq('user_id', userId);
        }
      }
    } catch {
      // Non-fatal: continue with local deletion even if server fails
    }
  }

  try {
    const db = getDb();

    // Delete via raw SQL using the underlying expo-sqlite client
    const rawDb = (db as any).$client;

    if (rawDb && typeof rawDb.runSync === 'function') {
      rawDb.runSync(
        `DELETE FROM habit_completions WHERE habit_id IN (SELECT id FROM habits WHERE user_id = ?)`,
        [userId],
      );
      rawDb.runSync(
        `DELETE FROM streaks WHERE habit_id IN (SELECT id FROM habits WHERE user_id = ?)`,
        [userId],
      );
      rawDb.runSync(`DELETE FROM xp_ledger WHERE user_id = ?`, [userId]);
      rawDb.runSync(`DELETE FROM quests WHERE user_id = ?`, [userId]);
      rawDb.runSync(`DELETE FROM muhasabah_entries WHERE user_id = ?`, [userId]);
      rawDb.runSync(`DELETE FROM user_titles WHERE user_id = ?`, [userId]);
      rawDb.runSync(`DELETE FROM habits WHERE user_id = ?`, [userId]);
      rawDb.runSync(`DELETE FROM users WHERE id = ?`, [userId]);
      rawDb.runSync(`DELETE FROM _zustand_store WHERE key = 'settings-storage'`);
    }
  } catch {
    // Non-fatal: continue with store resets even if DB deletion partially fails
  }

  // Reset game store
  useGameStore.getState().setLevel(1);
  useGameStore.getState().setTotalXP(0);
  useGameStore.getState().setTitles([]);
  useGameStore.getState().setActiveTitle(null);

  // Reset habit store
  useHabitStore.setState({
    habits: [],
    completions: {},
    streaks: {},
    mercyModes: {},
    dailyProgress: { completed: 0, total: 0 },
    loading: false,
    error: null,
  });

  // Clear sync queue
  try {
    await syncQueueRepo.clearAll();
  } catch {
    // Non-fatal
  }

  // Mark onboarding as incomplete — triggers redirect to onboarding
  useSettingsStore.getState().setOnboardingComplete(false);
}
