/**
 * Home screen -- Full-screen game world HUD (Phase 5, Plan 02).
 *
 * Layer composition (bottom to top):
 *   1. HudScene       -- Skia Canvas: background PNG + day/night tint + character sprite
 *   2. SceneObjects   -- Invisible Pressable tap zones for quest board, prayer mat, journal
 *   3. HudStatBar     -- Translucent stat overlay: level + XP + streak + next prayer
 *   4. CelebrationManager -- Level-up and title-unlock overlays (from Phase 4)
 *   5. EnvironmentReveal  -- Fade-to-black unlock overlay on environment transitions
 *
 * Replaces PlaceholderScreen. The Home tab is now the game world.
 */
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../src/stores/gameStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useMuhasabahStore } from '../../src/stores/muhasabahStore';
import { HudScene } from '../../src/components/hud/HudScene';
import { SceneObjects } from '../../src/components/hud/SceneObjects';
import { HudStatBar } from '../../src/components/hud/HudStatBar';
import { EnvironmentReveal } from '../../src/components/hud/EnvironmentReveal';
import { CelebrationManager } from '../../src/components/game/CelebrationManager';
import { isMuhasabahTime } from '../../src/domain/muhasabah-engine';
import { getPrayerWindows } from '../../src/services/prayer-times';
import type { CalcMethodKey } from '../../src/types/habits';

const DEFAULT_USER_ID = 'default-user';

export default function HomeScreen() {
  const router = useRouter();

  const { currentLevel, loadGame } = useGameStore(
    useShallow((s) => ({
      currentLevel: s.currentLevel,
      loadGame: s.loadGame,
    })),
  );

  const { locationLat, locationLng, prayerCalcMethod } = useSettingsStore(
    useShallow((s) => ({
      locationLat: s.locationLat,
      locationLng: s.locationLng,
      prayerCalcMethod: s.prayerCalcMethod,
    })),
  );

  // Determine if Muhasabah journal should glow (after Isha time)
  const isAfterIsha = useMemo(() => {
    const now = new Date();
    if (locationLat === null || locationLng === null) {
      return isMuhasabahTime(null, now);
    }
    try {
      const windows = getPrayerWindows(
        locationLat,
        locationLng,
        now,
        prayerCalcMethod as CalcMethodKey,
        now,
      );
      const ishaWindow = windows.find((w) => w.name === 'isha') ?? null;
      return isMuhasabahTime(ishaWindow, now);
    } catch {
      return isMuhasabahTime(null, now);
    }
  }, [locationLat, locationLng, prayerCalcMethod]);

  // Load game state on mount (consistent with habits.tsx pattern)
  useEffect(() => {
    loadGame(DEFAULT_USER_ID);
  }, [loadGame]);

  const handleTapJournal = () => {
    useMuhasabahStore.getState().open();
  };

  return (
    <View style={styles.container}>
      {/* Layer 1: Pixel art scene (Skia Canvas) */}
      <HudScene level={currentLevel} />

      {/* Layer 2: Interactive tap zones */}
      <SceneObjects
        onTapQuestBoard={() => router.push('/(tabs)/quests')}
        onTapPrayerMat={() => router.push('/(tabs)/habits')}
        onTapJournal={handleTapJournal}
        showJournalGlow={isAfterIsha}
      />

      {/* Layer 3: HUD stat overlay */}
      <HudStatBar />

      {/* Layer 4: Celebration overlays (from Phase 4) */}
      <CelebrationManager />

      {/* Layer 5: Environment reveal on level threshold crossing */}
      <EnvironmentReveal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
