/**
 * DungeonClearedFanfare — Full-screen celebration overlay for completing a
 * Dopamine Detox Dungeon session.
 *
 * Renders as an absolute-positioned View (NOT a React Native Modal) with
 * a semi-transparent dark backdrop. Follows the LevelUpOverlay pattern.
 *
 * Features:
 *   - ZoomIn spring animation on mount (damping: 15, stiffness: 150)
 *   - "Dungeon Cleared!" heading in XP gold
 *   - XP count-up animation (0 → earned over 800ms via state-based counter)
 *   - Mentor praise line in textSecondary
 *   - Haptic burst: 3× Heavy at 0ms / 100ms / 180ms
 *   - "Continue Journey" button — never auto-dismiss
 *
 * Reduced motion:
 *   - Spring skipped (scale set to 1 immediately)
 *   - XP count-up skipped (shows final value immediately)
 *
 * XP count-up technique: state-based interval (not Reanimated per-tick) to
 * avoid the Reanimated worklet ↔ JS bridge issue with Text children.
 *
 * Source: UI-SPEC Component 6, CONTEXT.md D-12
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, duration, easing } from '../../tokens';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DungeonClearedFanfareProps {
  visible: boolean;
  /** XP earned from the completed session */
  xpEarned: number;
  /** Called when player taps "Continue Journey" */
  onDismiss: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Count-up: update every ~16ms (~60fps) for 800ms total
const COUNT_UP_STEPS = 50;
const COUNT_UP_INTERVAL = Math.floor(duration.celebration / COUNT_UP_STEPS); // ~16ms

// ─── Component ───────────────────────────────────────────────────────────────

export function DungeonClearedFanfare({
  visible,
  xpEarned,
  onDismiss,
}: DungeonClearedFanfareProps) {
  // ZoomIn spring scale
  const scale = useSharedValue(0.85);

  // State-based XP counter for display (avoids Reanimated worklet ↔ JS Text issue)
  const [displayXP, setDisplayXP] = useState(0);

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
    if (!visible) {
      // Reset for next show
      scale.value = 0.85;
      setDisplayXP(0);
      return;
    }

    // ── Haptic burst (matches LevelUpOverlay pattern) ─────────────────────
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const t1 = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    const t2 = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 180);

    // ── ZoomIn spring animation ───────────────────────────────────────────
    if (reduceMotionRef.current) {
      // Skip spring — instant appear
      scale.value = 1;
    } else {
      scale.value = withSpring(1, {
        damping: easing.spring.damping,    // 15
        stiffness: easing.spring.stiffness, // 150
      });
    }

    // ── XP count-up ───────────────────────────────────────────────────────
    if (reduceMotionRef.current) {
      // Skip count-up — show final value immediately
      setDisplayXP(xpEarned);
    } else {
      let step = 0;
      countUpTimerRef.current = setInterval(() => {
        step += 1;
        const progress = step / COUNT_UP_STEPS;
        setDisplayXP(Math.round(xpEarned * Math.min(progress, 1)));
        if (step >= COUNT_UP_STEPS) {
          if (countUpTimerRef.current) clearInterval(countUpTimerRef.current);
          setDisplayXP(xpEarned);
        }
      }, COUNT_UP_INTERVAL);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (countUpTimerRef.current) clearInterval(countUpTimerRef.current);
    };
  }, [visible, xpEarned]); // eslint-disable-line react-hooks/exhaustive-deps

  // Card animated style: ZoomIn spring scale + opacity
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: Math.min(1, (scale.value - 0.85) / 0.15), // fade in from 85% → 100%
  }));

  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <Animated.View style={[styles.card, cardAnimatedStyle]}>
        {/* "Dungeon Cleared!" heading */}
        <Text style={styles.heading}>Dungeon Cleared!</Text>

        {/* XP count-up display */}
        <Text style={styles.xpDisplay}>{`+${displayXP} XP`}</Text>

        {/* Mentor praise line */}
        <Text style={styles.mentorLine}>
          {`Your discipline cut through the noise. ${xpEarned} XP earned.`}
        </Text>

        {/* Continue Journey button — never auto-dismiss */}
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.continueButtonPressed,
          ]}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Continue Journey"
        >
          <Text style={styles.continueButtonText}>Continue Journey</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.92)', // UI-SPEC fanfare backdrop
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50, // Z-index scale: Fanfare overlay = 50 (above all)
  },

  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.xp, // gold border
    // XP gold glow shadow
    shadowColor: colors.dark.xp,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    width: 320,
    maxWidth: '90%',
  },

  /** "Dungeon Cleared!" — headingXl 28px Inter-Bold, XP gold */
  heading: {
    fontSize: typography.headingXl.fontSize,
    lineHeight: typography.headingXl.lineHeight,
    fontFamily: typography.headingXl.fontFamily,
    fontWeight: '700',
    color: colors.dark.xp, // #FFD700
    letterSpacing: typography.headingXl.letterSpacing,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  /** XP count-up number: headingXl, gold with glow */
  xpDisplay: {
    fontSize: typography.headingXl.fontSize,
    lineHeight: typography.headingXl.lineHeight,
    fontFamily: typography.headingXl.fontFamily,
    fontWeight: '700',
    color: colors.dark.xp, // #FFD700
    letterSpacing: typography.headingXl.letterSpacing,
    textAlign: 'center',
    marginBottom: spacing.md,
    // Gold glow
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  /** Mentor praise: bodyMd 15px Inter-Regular, textSecondary */
  mentorLine: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary, // #94A3B8
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },

  /** Full-width primary CTA — accent fill, min 44px height */
  continueButton: {
    backgroundColor: colors.dark.primary, // #0D7C3D
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4, // 12px (buttonPaddingVertical)
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },

  continueButtonPressed: {
    backgroundColor: colors.dark.primaryPressed,
  },

  continueButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
