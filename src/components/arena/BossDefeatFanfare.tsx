/**
 * BossDefeatFanfare — Full-screen celebration overlay for defeating a Nafs Boss.
 *
 * Renders as an absolute-positioned View (NOT a React Native Modal) with
 * a semi-transparent dark backdrop. Follows the DungeonClearedFanfare pattern.
 *
 * Features:
 *   - Opacity fade-in animation on mount (withTiming 0 → 1, 300ms easeOut)
 *   - "Boss Defeated!" heading in XP gold (#FFD700)
 *   - Archetype display name (from BOSS_ARCHETYPES lookup) in textPrimary
 *   - XP count-up animation (0 → xpAwarded over ~900ms via state-based counter)
 *   - Haptic feedback: notificationAsync(Success) on mount
 *   - Tap-to-dismiss anywhere on overlay — calls clearCelebration()
 *
 * Reads state from bossStore directly — no props required.
 * Renders nothing when pendingDefeatCelebration is null.
 *
 * Reduced motion:
 *   - Fade-in skipped (overlay appears instantly at opacity 1)
 *   - XP count-up skipped (shows final value immediately)
 *
 * XP count-up technique: state-based interval (not Reanimated per-tick) to
 * avoid the Reanimated worklet ↔ JS bridge issue with Text children.
 *
 * Z-index: 30 (celebration layer per UI-SPEC z-index contract).
 *
 * Source: 14-UI-SPEC.md BossDefeatFanfare spec, PLAN 14-05 Task 2
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useBossStore } from '../../stores/bossStore';
import { BOSS_ARCHETYPES } from '../../domain/boss-content';
import { colors, typography, spacing, radius } from '../../tokens';

// ─── Component ───────────────────────────────────────────────────────────────

export function BossDefeatFanfare() {
  // Read celebration state from bossStore directly (no props needed)
  const celebration = useBossStore((s) => s.pendingDefeatCelebration);

  // Overlay fade-in opacity
  const overlayOpacity = useSharedValue(0);

  // State-based XP counter for display (avoids Reanimated worklet ↔ JS Text issue)
  const [displayXp, setDisplayXp] = useState(0);

  const reduceMotionRef = useRef(false);
  const countUpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        reduceMotionRef.current = enabled;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!celebration) {
      // Reset for next show
      overlayOpacity.value = 0;
      setDisplayXp(0);
      if (countUpTimerRef.current) clearInterval(countUpTimerRef.current);
      return;
    }

    const target = celebration.xpAwarded;

    // ── Haptic feedback ───────────────────────────────────────────────────
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // ── Fade-in animation ─────────────────────────────────────────────────
    if (reduceMotionRef.current) {
      // Reduced motion: instant appear
      overlayOpacity.value = 1;
    } else {
      overlayOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    }

    // ── XP count-up ───────────────────────────────────────────────────────
    if (reduceMotionRef.current) {
      // Reduced motion: show final value immediately
      setDisplayXp(target);
    } else {
      const step = Math.ceil(target / 30); // 30 steps over ~900ms (30ms interval)
      let current = 0;
      countUpTimerRef.current = setInterval(() => {
        current = Math.min(current + step, target);
        setDisplayXp(current);
        if (current >= target) {
          if (countUpTimerRef.current) clearInterval(countUpTimerRef.current);
        }
      }, 30);
    }

    return () => {
      if (countUpTimerRef.current) clearInterval(countUpTimerRef.current);
    };
  }, [celebration]); // eslint-disable-line react-hooks/exhaustive-deps

  // Overlay animated style: fade-in
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // Render nothing when no pending celebration
  if (!celebration) return null;

  // Look up archetype display name from BOSS_ARCHETYPES
  const archetypeName = BOSS_ARCHETYPES[celebration.archetype]?.name ?? 'Unknown Nafs';

  function handleDismiss() {
    useBossStore.getState().clearCelebration();
  }

  return (
    <Pressable
      style={styles.backdrop}
      onPress={handleDismiss}
      accessibilityRole="button"
      accessibilityLabel="Dismiss boss defeat celebration"
      accessibilityHint="Tap to continue"
    >
      <Animated.View style={[styles.contentContainer, overlayAnimatedStyle]}>
        {/* "Boss Defeated!" heading — headingXl 28px, gold */}
        <Text style={styles.heading}>{'Boss Defeated!'}</Text>

        {/* Archetype display name — headingMd 20px, textPrimary */}
        <Text style={styles.archetypeName}>{archetypeName}</Text>

        {/* XP count-up display — headingXl 28px, gold */}
        <Text style={styles.xpDisplay}>{`+${displayXp} XP`}</Text>

        {/* Mentor wisdom line — bodyMd, textSecondary */}
        <Text style={styles.wisdomLine}>
          {"Your discipline conquered the nafs. Keep going."}
        </Text>

        {/* Tap-to-dismiss hint */}
        <Text style={styles.dismissHint}>Tap anywhere to continue</Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  /** Full-screen pressable backdrop */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30, // Z-index 30: celebration layer per UI-SPEC
  },

  /** Centered content container — animated opacity */
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    width: '100%',
    maxWidth: 360,
  },

  /** "Boss Defeated!" — headingXl 28px Inter-Bold, gold-500 */
  heading: {
    fontSize: typography.headingXl.fontSize,
    lineHeight: typography.headingXl.lineHeight,
    fontFamily: typography.headingXl.fontFamily,
    fontWeight: '700',
    color: '#FFD700', // gold-500 per UI-SPEC
    letterSpacing: typography.headingXl.letterSpacing,
    textAlign: 'center',
    marginBottom: spacing.sm,
    // Gold glow
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },

  /** Archetype display name — headingMd 20px Inter-Bold, textPrimary */
  archetypeName: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary, // #F1F5F9
    letterSpacing: typography.headingMd.letterSpacing,
    textAlign: 'center',
    marginBottom: spacing.md,
    opacity: 0.85,
  },

  /** XP count-up: headingXl 28px, gold with glow */
  xpDisplay: {
    fontSize: typography.headingXl.fontSize,
    lineHeight: typography.headingXl.lineHeight,
    fontFamily: typography.headingXl.fontFamily,
    fontWeight: '700',
    color: '#FFD700', // gold-500 per UI-SPEC
    letterSpacing: typography.headingXl.letterSpacing,
    textAlign: 'center',
    marginBottom: spacing.md,
    // Gold glow
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  /** Mentor wisdom line — bodyMd 16px Inter-Regular, textSecondary */
  wisdomLine: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary, // #94A3B8
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },

  /** Dismiss hint — bodySm 13px, textMuted at reduced opacity */
  dismissHint: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textMuted,
    textAlign: 'center',
    opacity: 0.5,
    marginTop: spacing.sm,
  },
});
