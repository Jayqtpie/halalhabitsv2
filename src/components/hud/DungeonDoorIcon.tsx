/**
 * DungeonDoorIcon — HUD overlay tap target for Dopamine Detox Dungeon.
 *
 * Rendered as a React Native View sibling outside the Skia Canvas
 * (same pattern as FridayMessageBanner — Canvas cannot host RN views).
 *
 * States:
 *   idle (no active session):  static emerald glow ring at 60% opacity
 *   active (session running):  glow ring pulses 0.4-1.0 over 2000ms loop
 *                              + DetoxCountdownTimer badge below icon
 *
 * Touch target: visual 32x32, hit slop 6px all sides (total ≥44px).
 *
 * Accessibility:
 *   accessibilityLabel = "Dopamine Detox Dungeon — tap to enter"
 *   Reduced motion: skips pulse animation, static opacity 0.8
 *
 * Source: UI-SPEC Component 1, CONTEXT.md D-04, D-06
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { DetoxCountdownTimer } from '../detox/DetoxCountdownTimer';
import { colors, typography, spacing, radius } from '../../tokens';
import type { DetoxSession } from '../../types/database';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DungeonDoorIconProps {
  /** Active detox session, if any */
  activeSession: DetoxSession | null;
  /** Called when the icon is tapped — opens DungeonSheet */
  onPress: () => void;
  /** Called when the countdown timer reaches zero */
  onSessionComplete?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DungeonDoorIcon({
  activeSession,
  onPress,
  onSessionComplete,
}: DungeonDoorIconProps) {
  const glowOpacity = useSharedValue(0.6);
  const reduceMotionRef = useRef(false);

  const isActive = activeSession !== null && activeSession.status === 'active';

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        reduceMotionRef.current = enabled;
        startGlowAnimation(enabled, isActive);
      })
      .catch(() => {
        startGlowAnimation(false, isActive);
      });
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  function startGlowAnimation(reduceMotion: boolean, active: boolean) {
    if (reduceMotion) {
      // Skip animation — static opacity
      glowOpacity.value = 0.8;
      return;
    }
    if (active) {
      // Pulse glow 0.4 → 1.0 over 2000ms, looping
      glowOpacity.value = withRepeat(
        withTiming(1.0, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true, // reverse on each cycle (0.4 → 1.0 → 0.4 ...)
      );
    } else {
      // Static 60% opacity when tappable but no session
      glowOpacity.value = withTiming(0.6, { duration: 200 });
    }
  }

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={onPress}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityLabel="Dopamine Detox Dungeon — tap to enter"
        accessibilityRole="button"
        accessibilityHint="Opens the Dopamine Detox Dungeon"
        style={({ pressed }) => [
          styles.iconContainer,
          pressed && styles.iconContainerPressed,
        ]}
      >
        {/* Glow ring (animated) */}
        <Animated.View style={[styles.glowRing, glowAnimatedStyle]} />

        {/* Icon body: placeholder pixel-art dungeon gate representation */}
        <View style={styles.doorIcon}>
          {/* Arch structure */}
          <View style={styles.doorArch} />
          {/* Door planks suggestion */}
          <View style={styles.doorPlanks}>
            <View style={styles.doorPlankLeft} />
            <View style={styles.doorPlankRight} />
          </View>
        </View>

        {/* "D" label for pixel-art dungeon gate (placeholder until real PNG asset) */}
        <Text style={styles.doorLabel} aria-hidden>
          {'[D]'}
        </Text>
      </Pressable>

      {/* Countdown badge — only shown during active session */}
      {isActive && activeSession && (
        <View style={styles.countdownBadge}>
          <DetoxCountdownTimer
            startedAt={activeSession.startedAt}
            durationHours={activeSession.durationHours}
            variant="hud"
            onComplete={onSessionComplete}
          />
        </View>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const ICON_SIZE = 32;
const GLOW_EXTRA = 4; // glow ring extends 4px beyond icon edges

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },

  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    // Minimum touch target via hitSlop prop — visual stays 32x32
  },

  iconContainerPressed: {
    opacity: 0.8,
  },

  /** Glow ring: border drawn around icon, animated opacity */
  glowRing: {
    position: 'absolute',
    width: ICON_SIZE + GLOW_EXTRA * 2,
    height: ICON_SIZE + GLOW_EXTRA * 2,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.dark.primary, // '#0D7C3D' emerald
    // Opacity controlled by Reanimated shared value
  },

  /** Placeholder dungeon door icon (View-based) */
  doorIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    backgroundColor: '#1A1410', // dungeon stone
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#3D2E1E', // stone border
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  doorArch: {
    position: 'absolute',
    top: spacing.xs,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#C8621A', // torch amber accent for arch
  },

  doorPlanks: {
    flexDirection: 'row',
    width: '70%',
    height: 12,
    marginBottom: 2,
    gap: 2,
  },

  doorPlankLeft: {
    flex: 1,
    backgroundColor: '#3D2E1E',
    borderRadius: 1,
  },

  doorPlankRight: {
    flex: 1,
    backgroundColor: '#3D2E1E',
    borderRadius: 1,
  },

  /** "[D]" text fallback label */
  doorLabel: {
    position: 'absolute',
    fontSize: 8,
    fontFamily: typography.hudLabel.fontFamily,
    color: colors.dark.textSecondary,
    opacity: 0, // Hidden — only the View-based icon is visible
  },

  /** Countdown pill badge below the icon */
  countdownBadge: {
    marginTop: spacing.xs,
    backgroundColor: 'rgba(15, 23, 42, 0.80)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#3D2E1E',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
