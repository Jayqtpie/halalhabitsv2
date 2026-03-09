/**
 * DailyProgressBar -- shows "X of Y complete" with an emerald progress bar.
 *
 * When all habits are complete, the bar turns gold with a celebratory message.
 * Uses design tokens exclusively.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../tokens';

interface DailyProgressBarProps {
  completed: number;
  total: number;
}

export function DailyProgressBar({ completed, total }: DailyProgressBarProps) {
  const allComplete = total > 0 && completed >= total;
  const progress = total > 0 ? completed / total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        <Text style={[styles.label, allComplete && styles.labelComplete]}>
          {allComplete ? 'All complete!' : `${completed} of ${total} complete`}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(progress * 100, 100)}%` as unknown as number,
              backgroundColor: allComplete
                ? colors.dark.xp
                : colors.dark.success,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary,
  },
  labelComplete: {
    color: colors.dark.xp,
    fontFamily: typography.bodyMd.fontFamily,
    fontWeight: '600',
  },
  barBackground: {
    height: 8,
    backgroundColor: colors.dark.surface,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
