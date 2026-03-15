/**
 * XPProgressBar -- Persistent XP progress bar displayed below DailyProgressBar.
 *
 * Reads totalXP, currentLevel, xpToNext from gameStore.
 * Animates fill on XP gain (800ms cubic ease-out).
 * On level-up: fills to 100%, holds briefly, then resets and fills to new progress.
 *
 * Format: "Lv 8  [bar]  340/680 XP"
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../stores/gameStore';
import { xpForLevel } from '../../domain/xp-engine';
import { colors, typography, spacing, radius } from '../../tokens';

export function XPProgressBar() {
  const { totalXP, currentLevel, xpToNext } = useGameStore(
    useShallow((s) => ({
      totalXP: s.totalXP,
      currentLevel: s.currentLevel,
      xpToNext: s.xpToNext,
    })),
  );

  // XP within current level
  const levelStartXP = xpForLevel(currentLevel);
  const xpInLevel = Math.max(0, totalXP - levelStartXP);
  const targetProgress = xpToNext > 0 ? Math.min(1, xpInLevel / xpToNext) : 0;

  // Track previous level to detect level-ups
  const prevLevelRef = useRef(currentLevel);
  const fillProgress = useSharedValue(targetProgress);

  useEffect(() => {
    const didLevelUp = currentLevel > prevLevelRef.current;
    prevLevelRef.current = currentLevel;

    if (didLevelUp) {
      // Level-up sequence: fill to 100% -> hold 200ms -> instant reset -> fill to new progress
      fillProgress.value = withSequence(
        withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
        withDelay(
          200,
          withTiming(0, { duration: 0 }),
        ),
        withTiming(targetProgress, { duration: 600, easing: Easing.out(Easing.cubic) }),
      );
    } else {
      fillProgress.value = withTiming(targetProgress, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [totalXP, currentLevel, targetProgress]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%` as `${number}%`,
  }));

  return (
    <View style={styles.container}>
      {/* Level label */}
      <Text style={styles.levelText}>Lv {currentLevel}</Text>

      {/* Progress bar track */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, animatedFillStyle]} />
      </View>

      {/* XP numbers */}
      <Text style={styles.xpText}>
        {xpInLevel}/{xpToNext} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  levelText: {
    fontSize: typography.hudLabel.fontSize,
    lineHeight: typography.hudLabel.lineHeight,
    fontFamily: typography.hudLabel.fontFamily,
    fontWeight: '700',
    color: colors.dark.xp,
    minWidth: 32,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.dark.surface,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.dark.xp,
    borderRadius: radius.full,
  },
  xpText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    minWidth: 64,
    textAlign: 'right',
  },
});
