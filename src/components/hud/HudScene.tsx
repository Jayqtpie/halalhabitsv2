/**
 * HudScene -- Full-screen Skia Canvas rendering the pixel art game world.
 *
 * Layer order (bottom to top inside Canvas):
 *   1. Background PNG (environment based on player level)
 *   2. Stone tint (Skia Rect, dungeon mode only, #1A1410 @ 30%)
 *   3. DayNightOverlay (time-based tint Rect; swapped to dungeon shadow during dungeon mode)
 *   4. TorchLeft / TorchRight (Skia Circle, dungeon mode only, flickering amber)
 *   5. CharacterSprite (animated 4-frame idle)
 *
 * Uses FilterMode.Nearest sampling for crisp pixel art (HUD-02).
 * Guards useImage results -- returns null while assets load.
 *
 * HUD overlays (FridayMessageBanner, DungeonDoorIcon, WelcomeBackToast) are
 * rendered as siblings to Canvas, NOT inside it (Skia Canvas does not support
 * React Native views).
 *
 * Dungeon theme integration (DTOX-03, D-05):
 *   - Reads activeSession from useDetoxStore
 *   - When dungeonActive: adds stone tint + torch flicker layers to Canvas
 *   - Renders DungeonDoorIcon (HUD entry point) and WelcomeBackToast outside Canvas
 *   - Opens DungeonSheet on door icon press
 *   - Triggers DungeonClearedFanfare on session completion
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Canvas,
  Image,
  useImage,
  FilterMode,
  MipmapMode,
  Rect,
  Circle,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { getEnvironmentForLevel } from '../../domain/hud-environment';
import type { EnvironmentId } from '../../domain/hud-environment';
import { DayNightOverlay } from './DayNightOverlay';
import { CharacterSprite } from './CharacterSprite';
import { isFriday } from '../../domain/friday-engine';
import { FridayMessageBanner } from './FridayMessageBanner';
import { DungeonDoorIcon } from './DungeonDoorIcon';
import { WelcomeBackToast } from './WelcomeBackToast';
import { DungeonSheet } from '../detox/DungeonSheet';
import { DungeonClearedFanfare } from '../detox/DungeonClearedFanfare';
import { useDetoxStore } from '../../stores/detoxStore';
import { useAuthStore } from '../../stores/authStore';

// Require map for environment backgrounds -- static requires for Metro bundler
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ENVIRONMENT_IMAGES: Record<EnvironmentId, number> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  quiet_study: require('../../../assets/environments/quiet-study.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  growing_garden: require('../../../assets/environments/growing-garden.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  scholars_courtyard: require('../../../assets/environments/scholars-courtyard.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  living_sanctuary: require('../../../assets/environments/living-sanctuary.png') as number,
};

// ─── Dungeon theme colors (UI-SPEC Dungeon Theme Palette) ─────────────────────
const DUNGEON_STONE_TINT = 'rgba(26, 20, 16, 0.30)'; // #1A1410 @ 30% opacity
const DUNGEON_SHADOW    = 'rgba(0, 0, 0, 0.65)';     // DayNightOverlay replacement
const TORCH_AMBER       = '#C8621A';                  // Torch flicker element

// ─── Props ────────────────────────────────────────────────────────────────────

interface HudSceneProps {
  level: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HudScene({ level }: HudSceneProps) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const environmentId = getEnvironmentForLevel(level);
  const bg = useImage(ENVIRONMENT_IMAGES[environmentId]);

  // ── Friday banner state ────────────────────────────────────────────────────
  const [fridayFirstOpen, setFridayFirstOpen] = useState(true);

  // ── Dungeon sheet / fanfare state ─────────────────────────────────────────
  const [dungeonSheetVisible, setDungeonSheetVisible] = useState(false);
  const [showFanfare, setShowFanfare] = useState(false);
  const [fanfareXP, setFanfareXP] = useState(0);

  // ── Detox store ───────────────────────────────────────────────────────────
  const activeSession = useDetoxStore((s) => s.activeSession);
  const completeSession = useDetoxStore((s) => s.completeSession);
  const userId = useAuthStore((s) => s.userId);

  const dungeonActive = activeSession !== null && activeSession.status === 'active';

  // ── Torch flicker animations ───────────────────────────────────────────────
  // Two Reanimated shared values for per-torch opacity; offset by 200ms
  const torchLeftOpacity  = useSharedValue(0.8);
  const torchRightOpacity = useSharedValue(0.8);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        reduceMotionRef.current = enabled;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!dungeonActive) {
      // Reset torch opacities when dungeon mode is off
      torchLeftOpacity.value  = 0.8;
      torchRightOpacity.value = 0.8;
      return;
    }

    if (reduceMotionRef.current) {
      // Reduced motion: static opacity
      torchLeftOpacity.value  = 0.8;
      torchRightOpacity.value = 0.8;
      return;
    }

    // Torch 1: flicker 0.6 → 1.0 over 400ms, looping
    torchLeftOpacity.value = withRepeat(
      withTiming(1.0, {
        duration: 400,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    // Torch 2: same but starts at different phase (offset via initial value)
    torchRightOpacity.value = 0.6; // start at opposite phase
    setTimeout(() => {
      torchRightOpacity.value = withRepeat(
        withTiming(1.0, {
          duration: 400,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    }, 200); // 200ms offset creates phase difference between torches
  }, [dungeonActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Session complete handler ───────────────────────────────────────────────
  async function handleSessionComplete() {
    if (!userId) return;
    try {
      const xpEarned = await completeSession(userId);
      setFanfareXP(xpEarned);
      setShowFanfare(true);
    } catch (e) {
      console.warn('[HudScene] handleSessionComplete error:', e);
    }
  }

  // ── Background loads asynchronously -- render nothing until ready ──────────
  if (!bg) return null;

  // Character spawn position (center-bottom area of scene)
  const charX = screenW * 0.45;
  const charY = screenH * 0.52;

  // Torch positions (left and right sides of canvas)
  const torchLeftX  = screenW * 0.15;
  const torchRightX = screenW * 0.85;
  const torchY      = screenH * 0.4;
  const TORCH_RADIUS = 6;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Canvas
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {/* Layer 1: Environment background */}
        <Image
          image={bg}
          x={0}
          y={0}
          width={screenW}
          height={screenH}
          fit="cover"
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
        />

        {/* Layer 2 (dungeon only): Stone wall tint — warm near-black overlay */}
        {dungeonActive && (
          <Rect
            x={0}
            y={0}
            width={screenW}
            height={screenH}
            color={DUNGEON_STONE_TINT}
          />
        )}

        {/* Layer 3: Day/night tint overlay */}
        {/* When dungeon active, replaced by solid dungeon shadow */}
        {dungeonActive ? (
          <Rect
            x={0}
            y={0}
            width={screenW}
            height={screenH}
            color={DUNGEON_SHADOW}
          />
        ) : (
          <DayNightOverlay />
        )}

        {/* Layer 4 (dungeon only): Flickering torches */}
        {dungeonActive && (
          <>
            <Circle
              cx={torchLeftX}
              cy={torchY}
              r={TORCH_RADIUS}
              color={TORCH_AMBER}
              opacity={torchLeftOpacity}
            />
            <Circle
              cx={torchRightX}
              cy={torchY}
              r={TORCH_RADIUS}
              color={TORCH_AMBER}
              opacity={torchRightOpacity}
            />
          </>
        )}

        {/* Layer 5: Animated character sprite */}
        <CharacterSprite x={charX} y={charY} />
      </Canvas>

      {/* FRDY-04: Friday message banner — rendered outside Canvas as React Native overlay */}
      {isFriday() && (
        <FridayMessageBanner
          isFirstOpen={fridayFirstOpen}
          onDismiss={() => setFridayFirstOpen(false)}
        />
      )}

      {/* DTOX dungeon door entry point — top-right corner of HUD, below status bar */}
      <View style={[styles.dungeonDoorContainer, { top: insets.top + 8 }]}>
        <DungeonDoorIcon
          activeSession={activeSession}
          onPress={() => setDungeonSheetVisible(true)}
          onSessionComplete={handleSessionComplete}
        />
      </View>

      {/* DTOX welcome-back toast (appears on app foreground during active session) */}
      <WelcomeBackToast activeSession={activeSession} />

      {/* DTOX dungeon sheet (opens on door icon tap) */}
      <DungeonSheet
        visible={dungeonSheetVisible}
        onClose={() => setDungeonSheetVisible(false)}
        userId={userId}
      />

      {/* DTOX dungeon cleared fanfare (plays on session completion) */}
      {showFanfare && (
        <DungeonClearedFanfare
          visible={showFanfare}
          xpEarned={fanfareXP}
          onDismiss={() => setShowFanfare(false)}
        />
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  dungeonDoorContainer: {
    position: 'absolute',
    // top is set dynamically with safe area insets
    right: 16,
    zIndex: 10,
  },
});
