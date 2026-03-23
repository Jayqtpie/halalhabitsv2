/**
 * ArenaGateIcon — HUD overlay tap target for Nafs Boss Arena.
 *
 * Rendered as a React Native View sibling outside the Skia Canvas
 * (same pattern as DungeonDoorIcon — Canvas cannot host RN views).
 *
 * States:
 *   idle (no active battle):  static icon at 70% opacity, no badge
 *   active (battle running):  emerald ring pulses 0.4-1.0 over 800ms loop
 *                              + ruby-500 HP dot badge (12px circle)
 *
 * Touch target: visual 32x32, hit slop 6px all sides (total ≥44px).
 *
 * Accessibility:
 *   accessibilityLabel = "Boss Arena — battle active" | "Boss Arena"
 *   Reduced motion: skips pulse animation, static emerald ring at opacity 1.0
 *
 * Source: 14-UI-SPEC.md HUD Arena Gate Icon spec, PLAN 14-05 Task 1
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
import { useRouter } from 'expo-router';
import { useBossStore } from '../../stores/bossStore';
import { colors, typography, spacing, radius } from '../../tokens';

// ─── Component ───────────────────────────────────────────────────────────────

export function ArenaGateIcon() {
  const router = useRouter();

  // Read battle state from boss store
  const activeBattle = useBossStore((s) => s.activeBattle);
  const battleActive = activeBattle !== null && activeBattle.status === 'active';

  // Animated opacity for the emerald ring pulse
  const ringOpacity = useSharedValue(battleActive ? 0.4 : 0.7);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        reduceMotionRef.current = enabled;
        startRingAnimation(enabled, battleActive);
      })
      .catch(() => {
        startRingAnimation(false, battleActive);
      });
  }, [battleActive]); // eslint-disable-line react-hooks/exhaustive-deps

  function startRingAnimation(reduceMotion: boolean, active: boolean) {
    if (reduceMotion) {
      // Reduced motion: static opacity — ring at full 1.0 if active, else 0.7
      ringOpacity.value = active ? 1.0 : 0.7;
      return;
    }
    if (active) {
      // Pulse 0.4 → 1.0 over 800ms, looping (per UI-SPEC)
      ringOpacity.value = withRepeat(
        withTiming(1.0, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true, // reverse on each cycle (0.4 → 1.0 → 0.4 ...)
      );
    } else {
      // Static 70% opacity in idle state
      ringOpacity.value = withTiming(0.7, { duration: 200 });
    }
  }

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => router.push('/arena')}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityLabel={battleActive ? 'Boss Arena — battle active' : 'Boss Arena'}
        accessibilityRole="button"
        accessibilityHint="Opens the Nafs Boss Arena"
        style={({ pressed }) => [
          styles.iconContainer,
          pressed && styles.iconContainerPressed,
        ]}
      >
        {/* Emerald ring (animated during active battle) */}
        <Animated.View
          style={[
            styles.glowRing,
            battleActive && styles.glowRingActive,
            ringAnimatedStyle,
          ]}
        />

        {/* Icon body: pixel-art arena gate placeholder */}
        <View style={[styles.gateIcon, !battleActive && styles.gateIconIdle]}>
          {/* Crossed swords suggestion: two diagonal bars */}
          <View style={styles.swordLeft} />
          <View style={styles.swordRight} />
          {/* Arena arch structure */}
          <View style={styles.gateArch} />
        </View>

        {/* "[A]" label for arena gate (placeholder until real PNG asset) */}
        <Text style={styles.gateLabel} aria-hidden>
          {'[A]'}
        </Text>

        {/* Ruby HP dot badge — only shown during active battle */}
        {battleActive && <View style={styles.hpDotBadge} />}
      </Pressable>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const ICON_SIZE = 32;
const GLOW_EXTRA = 4; // glow ring extends 4px beyond icon edges
const HP_DOT_SIZE = 12;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    height: ICON_SIZE + GLOW_EXTRA * 2,
  },

  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    // Minimum touch target via hitSlop — visual stays 32x32
  },

  iconContainerPressed: {
    opacity: 0.8,
  },

  /** Emerald glow ring: border drawn around icon, animated opacity */
  glowRing: {
    position: 'absolute',
    width: ICON_SIZE + GLOW_EXTRA * 2,
    height: ICON_SIZE + GLOW_EXTRA * 2,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.dark.primary, // '#0D7C3D' emerald
    opacity: 0.7, // idle default; overridden by Reanimated in active state
  },

  glowRingActive: {
    // In active state the opacity is animated; initial value set by Reanimated
    borderColor: colors.dark.primary,
  },

  /** Placeholder arena gate icon (View-based) */
  gateIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    backgroundColor: '#1A1410', // arena stone
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#3D2E1E', // stone border
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  /** Idle: reduced opacity until battle starts */
  gateIconIdle: {
    opacity: 0.7,
  },

  /** Left diagonal sword element */
  swordLeft: {
    position: 'absolute',
    width: 2,
    height: 16,
    backgroundColor: '#C8A21A', // gold blade
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },

  /** Right diagonal sword element */
  swordRight: {
    position: 'absolute',
    width: 2,
    height: 16,
    backgroundColor: '#C8A21A', // gold blade
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },

  /** Arena arch at bottom of icon */
  gateArch: {
    position: 'absolute',
    bottom: 2,
    width: 18,
    height: 8,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderWidth: 1,
    borderColor: '#9B1B30', // ruby arena frame
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },

  /** "[A]" text fallback label (hidden visually) */
  gateLabel: {
    position: 'absolute',
    fontSize: 8,
    fontFamily: typography.hudLabel.fontFamily,
    color: colors.dark.textSecondary,
    opacity: 0, // Hidden — only the View-based icon is visible
  },

  /** Ruby HP dot badge — top-right corner of icon */
  hpDotBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: HP_DOT_SIZE,
    height: HP_DOT_SIZE,
    borderRadius: HP_DOT_SIZE / 2,
    backgroundColor: '#9B1B30', // ruby-500 per UI-SPEC
    borderWidth: 1.5,
    borderColor: '#0F172A', // surface-900 — separation from icon
  },

  /** HUD label below icon for active battle (pixel font) */
  hudCardPadding: {
    paddingHorizontal: spacing.sm, // 8px — hudCardPadding per UI-SPEC
  },
});
