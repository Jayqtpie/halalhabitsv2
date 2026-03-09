/**
 * HabitCard -- individual habit card with icon, name, streak, time window,
 * and tap-to-complete button.
 *
 * Completion triggers a scale pulse on the checkmark, a brief emerald glow
 * on the card border, and haptic feedback (if enabled in settings).
 *
 * Completed cards show a dimmed state. Streak uses "momentum" framing per
 * STRK-05 (never "streak" or "perfection").
 *
 * Prayer time windows are informational only -- users can always complete.
 */
import React, { useCallback } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  View,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../../stores/settingsStore';
import { PrayerTimeWindow } from '../prayer/PrayerTimeWindow';
import type { HabitWithStatus } from '../../types/habits';
import { colors, palette, typography, spacing, radius, duration } from '../../tokens';

interface HabitCardProps {
  habit: HabitWithStatus;
  onComplete: (habitId: string) => void;
  onLongPress?: (habitId: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HabitCard({ habit, onComplete, onLongPress }: HabitCardProps) {
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const completed = habit.completedToday;

  // ── Animations ──────────────────────────────────────────────────────
  const checkScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(13, 124, 61, ${glowOpacity.value})`,
    borderWidth: glowOpacity.value > 0 ? 2 : 1,
  }));

  const handleComplete = useCallback(() => {
    if (completed) return;

    // Scale pulse on checkmark: 1.0 -> 1.3 -> 1.0
    checkScale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 300 }),
      withSpring(1.0, { damping: 12, stiffness: 200 }),
    );

    // Brief emerald glow on card border
    glowOpacity.value = withSequence(
      withTiming(0.8, { duration: duration.fast }),
      withTiming(0, { duration: duration.normal }),
    );

    // Haptic pulse
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onComplete(habit.id);
  }, [completed, hapticEnabled, habit.id, onComplete, checkScale, glowOpacity]);

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      if (hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      onLongPress(habit.id);
    }
  }, [hapticEnabled, habit.id, onLongPress]);

  // ── Streak Display ──────────────────────────────────────────────────
  const streakCount = habit.streak?.currentCount ?? 0;

  /**
   * Streak Shield: purely visual indicator shown when a salah habit is
   * completed within its prayer window. XP bonus calculation is Phase 4.
   */
  const showStreakShield =
    completed &&
    habit.prayerWindow?.status === 'active' &&
    habit.type === 'salah';

  return (
    <AnimatedPressable
      entering={FadeIn.duration(duration.normal)}
      exiting={FadeOut.duration(duration.fast)}
      layout={Layout.springify()}
      style={[
        styles.card,
        completed && styles.cardCompleted,
        glowAnimatedStyle,
      ]}
      onPress={handleComplete}
      onLongPress={handleLongPress}
      accessibilityRole="button"
      accessibilityLabel={`${habit.name}${completed ? ', completed' : ''}`}
      accessibilityHint={completed ? undefined : 'Double tap to complete this habit'}
    >
      {/* Left: Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{habit.icon || '+'}</Text>
      </View>

      {/* Center: Name, time window, streak */}
      <View style={styles.centerContent}>
        <Text
          style={[styles.habitName, completed && styles.textCompleted]}
          numberOfLines={1}
        >
          {habit.name}
        </Text>
        <PrayerTimeWindow prayerWindow={habit.prayerWindow} />
        <View style={styles.metaRow}>
          {streakCount > 0 && (
            <Text style={styles.streakText}>
              {streakCount}-day momentum
            </Text>
          )}
          {showStreakShield && (
            <View style={styles.shieldBadge}>
              <Text style={styles.shieldIcon}>{'🛡️'}</Text>
              <Text style={styles.shieldText}>Streak Shield</Text>
            </View>
          )}
        </View>
      </View>

      {/* Right: Completion circle */}
      <Animated.View style={[styles.checkContainer, checkAnimatedStyle]}>
        <View
          style={[
            styles.checkCircle,
            completed && styles.checkCircleComplete,
          ]}
        >
          {completed && <Text style={styles.checkMark}>{'✓'}</Text>}
        </View>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 72,
  },
  cardCompleted: {
    opacity: 0.55,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.dark.backgroundDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  habitName: {
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    fontFamily: typography.bodyLg.fontFamily,
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  textCompleted: {
    color: colors.dark.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  streakText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.xp,
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  shieldIcon: {
    fontSize: 11,
  },
  shieldText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: palette['emerald-400'],
  },
  checkContainer: {
    marginLeft: spacing.sm,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.dark.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleComplete: {
    backgroundColor: colors.dark.success,
    borderColor: colors.dark.success,
  },
  checkMark: {
    color: colors.dark.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
