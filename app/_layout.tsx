/**
 * Root layout: font loading, migration execution, i18n provider.
 *
 * Shows splash screen while fonts load and migrations run.
 * Throws on migration error to surface issues early.
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

  useEffect(() => {
    if (fontsLoaded && migrationsComplete) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, migrationsComplete]);

  if (migrationError) {
    throw migrationError;
  }

  if (!fontsLoaded || !migrationsComplete) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </I18nextProvider>
  );
}
