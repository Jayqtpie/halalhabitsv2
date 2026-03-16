/**
 * StreakBars -- Horizontal bar chart of habit streaks.
 *
 * Shows current streak for each habit as a proportional bar.
 * Best streak highlighted with gold accent.
 * Empty state when no habits have streaks.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../tokens';
import type { StreakState } from '../../types/habits';

interface HabitStreak {
  habitId: string;
  habitName: string;
  streak: StreakState | null;
}

interface StreakBarsProps {
  habitStreaks: HabitStreak[];
}

export function StreakBars({ habitStreaks }: StreakBarsProps) {
  const habitsWithStreaks = habitStreaks.filter((h) => h.streak && h.streak.currentCount > 0);

  if (habitsWithStreaks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Complete habits to start building streaks</Text>
        <Text style={styles.emptySubtext}>Your consistency will be shown here</Text>
      </View>
    );
  }

  const maxStreak = Math.max(...habitsWithStreaks.map((h) => h.streak!.currentCount));
  const bestStreakHabitId = habitsWithStreaks.find(
    (h) => h.streak!.currentCount === maxStreak
  )?.habitId;

  return (
    <View style={styles.container}>
      {habitsWithStreaks.map((item) => {
        const count = item.streak!.currentCount;
        const proportion = maxStreak > 0 ? count / maxStreak : 0;
        const isBest = item.habitId === bestStreakHabitId;

        return (
          <View
            key={item.habitId}
            style={styles.barRow}
            accessibilityLabel={`${item.habitName}: ${count} day streak`}
          >
            <Text style={styles.habitName} numberOfLines={1}>
              {item.habitName}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${proportion * 100}%` },
                  isBest && styles.barFillBest,
                ]}
              />
            </View>
            <Text style={[styles.streakCount, isBest && styles.streakCountBest]}>
              {count}d
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  habitName: {
    width: 100,
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.dark.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.dark.primary,
    borderRadius: 5,
  },
  barFillBest: {
    backgroundColor: colors.dark.xp,
  },
  streakCount: {
    width: 32,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textSecondary,
    textAlign: 'right',
  },
  streakCountBest: {
    color: colors.dark.xp,
  },
  emptyContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textMuted,
    textAlign: 'center',
  },
});
