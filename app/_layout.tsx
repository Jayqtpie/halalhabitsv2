/**
 * Root layout: font loading, migration execution, i18n provider.
 *
 * Shows splash screen while fonts load and migrations run.
 * Hydration gate: waits for settingsStore to rehydrate before rendering.
 * Stack.Protected guard routes new users through onboarding automatically.
 */
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { I18nextProvider } from 'react-i18next';
import * as SplashScreen from 'expo-splash-screen';
import i18n from '../src/i18n/config';
import { db } from '../src/db/client';
import migrations from '../src/db/migrations/migrations';
import { MuhasabahModal } from '../src/components/muhasabah/MuhasabahModal';
import { useSettingsStore } from '../src/stores/settingsStore';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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

  const appReady = fontsLoaded && !!migrationsComplete && hydrated;

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

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
