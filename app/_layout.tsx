/**
 * Root layout: font loading, migration execution, i18n provider.
 *
 * Shows splash screen while fonts load and migrations run.
 * Hydration gate: waits for settingsStore to rehydrate before rendering.
 * Stack.Protected guard routes new users through onboarding automatically.
 *
 * Notification wiring (Phase 6, Plan 04):
 * - setNotificationHandler: show alerts in foreground (module-level, runs once)
 * - Startup reschedule: after appReady, reschedules today's notifications if
 *   permissions are granted and location is set.
 * - Tap listener: prayer tap -> habits tab; Muhasabah tap -> opens modal.
 */
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { I18nextProvider } from 'react-i18next';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useShallow } from 'zustand/react/shallow';
import i18n from '../src/i18n/config';
import { db } from '../src/db/client';
import migrations from '../src/db/migrations/migrations';
import { MuhasabahModal } from '../src/components/muhasabah/MuhasabahModal';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useMuhasabahStore } from '../src/stores/muhasabahStore';
import * as NotificationService from '../src/services/notification-service';
import type { CalcMethodKey } from '../src/types/habits';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// ── Foreground notification handler ─────────────────────────────────────────
// Set once at module level so it's in effect before any notification fires.
// shouldSetBadge: false — adab-safe, no guilt-inducing red badge counters.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'PressStart2P-Regular': require('../assets/fonts/PressStart2P-Regular.ttf'),
  });

  const { success: migrationsComplete, error: migrationError } = useMigrations(db, migrations);

  // Hydration gate: wait for settingsStore to rehydrate from SQLite
  // hydrated is set to true in onRehydrateStorage callback (not persisted)
  const hydrated = useSettingsStore((s) => s.hydrated);
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  // Notification-relevant settings read together for reschedule effect
  const { locationLat, locationLng, prayerCalcMethod, prayerReminders, muhasabahNotifEnabled, muhasabahReminderTime, streakMilestonesEnabled, questExpiringEnabled, morningMotivationEnabled } =
    useSettingsStore(
      useShallow((s) => ({
        locationLat: s.locationLat,
        locationLng: s.locationLng,
        prayerCalcMethod: s.prayerCalcMethod,
        prayerReminders: s.prayerReminders,
        muhasabahNotifEnabled: s.muhasabahNotifEnabled,
        muhasabahReminderTime: s.muhasabahReminderTime,
        streakMilestonesEnabled: s.streakMilestonesEnabled,
        questExpiringEnabled: s.questExpiringEnabled,
        morningMotivationEnabled: s.morningMotivationEnabled,
      })),
    );

  const appReady = fontsLoaded && !!migrationsComplete && hydrated;

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  // ── Startup notification reschedule ───────────────────────────────────────
  // Runs once after appReady. Handles the Android reboot case where OS clears
  // all scheduled notifications, and the iOS daily refresh (today-only strategy).
  // Only schedules when location is set — prayer times require coordinates.
  useEffect(() => {
    if (!appReady) return;
    if (locationLat === null || locationLng === null) return;

    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') return;

        await NotificationService.rescheduleAll(
          locationLat,
          locationLng,
          prayerCalcMethod as CalcMethodKey,
          {
            prayerReminders,
            muhasabahNotifEnabled,
            muhasabahReminderTime,
            streakMilestonesEnabled,
            questExpiringEnabled,
            morningMotivationEnabled,
          },
        );
      } catch (error) {
        // Non-fatal: app works without notifications
        console.warn('[layout] notification reschedule failed:', error);
      }
    })();
    // Re-runs whenever relevant settings change (location, prayer prefs, muhasabah time)
  }, [
    appReady,
    locationLat,
    locationLng,
    prayerCalcMethod,
    prayerReminders,
    muhasabahNotifEnabled,
    muhasabahReminderTime,
    streakMilestonesEnabled,
    questExpiringEnabled,
    morningMotivationEnabled,
  ]);

  // ── Notification tap listener ─────────────────────────────────────────────
  // Registered once. Routes users to the correct screen when tapping a notification.
  // Prayer reminders -> Habits tab (where salah cards are)
  // Muhasabah reminder -> opens MuhasabahModal via store
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const title = response.notification.request.content.title ?? '';
      const body = response.notification.request.content.body ?? '';
      const combined = `${title} ${body}`.toLowerCase();

      // Route based on notification content keywords
      // Muhasabah copy always includes "reflect" or "muhasabah" patterns
      if (combined.includes('reflect') || combined.includes('journal') || combined.includes('evening')) {
        useMuhasabahStore.getState().open();
      } else {
        // Default: prayer reminders, streak milestones, quest expiry all go to habits
        router.push('/(tabs)/habits' as any);
      }
    });

    return () => subscription.remove();
  }, [router]);

  if (migrationError) {
    throw migrationError;
  }

  // Keep splash visible until app is fully ready (fonts + migrations + store hydration)
  if (!appReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Onboarding group: protected — only shown when onboardingComplete is false */}
        <Stack.Protected guard={!onboardingComplete}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Main tabs: protected — only shown when onboarding is complete */}
        <Stack.Protected guard={onboardingComplete}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Settings screens — card presentation for later plans */}
        <Stack.Screen name="settings" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="prayer-reminders" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="your-data" options={{ headerShown: false, presentation: 'card' }} />
      </Stack>

      {/* MuhasabahModal overlays all screens — mounted outside Stack navigator, zIndex: 100 */}
      <MuhasabahModal />
    </I18nextProvider>
  );
}
