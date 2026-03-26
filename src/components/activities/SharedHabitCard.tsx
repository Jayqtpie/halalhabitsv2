/**
 * SharedHabitCard
 *
 * Displays a single active shared habit between the current user and a buddy.
 * Per D-14: Shows shared streak ONLY — not individual completion data from either player.
 * Per D-04: Either player can end a shared habit unilaterally.
 *
 * Privacy: No individual progress is exposed. Only the aggregate shared streak is shown.
 * Per CLAUDE.md: No shame copy — ending a habit is framed neutrally.
 * Per project memory: no flex:1 in Modal children.
 */
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, palette } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { componentSpacing, spacing } from '../../tokens/spacing';
import type { SharedHabit } from '../../types/database';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SharedHabitCardProps {
  sharedHabit: SharedHabit;
  buddyName: string;
  sharedStreak: number;
  onEnd: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SharedHabitCard({ sharedHabit, buddyName, sharedStreak, onEnd }: SharedHabitCardProps) {
  const handleEndPress = () => {
    Alert.alert(
      'End Shared Habit',
      `Are you sure you want to end "${sharedHabit.name}"? This can't be undone.`,
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'End Habit',
          style: 'destructive',
          onPress: onEnd,
        },
      ],
    );
  };

  const streakLabel = sharedStreak === 1 ? 'day' : 'days';

  return (
    <View style={styles.card}>
      {/* Left accent bar (emerald = active) */}
      <View style={styles.accentBar} />

      <View style={styles.content}>
        <View style={styles.infoSection}>
          {/* Habit name */}
          <Text style={styles.habitName} numberOfLines={2}>
            {sharedHabit.name}
          </Text>

          {/* Buddy attribution */}
          <Text style={styles.buddyLine}>with {buddyName}</Text>

          {/* Shared streak — per D-14: aggregate only */}
          <View style={styles.streakRow}>
            <Text style={styles.streakValue}>{sharedStreak}</Text>
            <Text style={styles.streakLabel}>{` ${streakLabel} shared`}</Text>
          </View>
        </View>

        {/* End button — unilateral per D-04 */}
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`End shared habit: ${sharedHabit.name}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  accentBar: {
    width: 4,
    backgroundColor: palette['emerald-500'],
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: componentSpacing.cardPadding,
    paddingVertical: componentSpacing.cardPadding,
    gap: spacing.sm,
  },
  infoSection: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  habitName: {
    ...typography.bodyMd,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  buddyLine: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  streakValue: {
    ...typography.bodyMd,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: palette['emerald-400'],
  },
  streakLabel: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
  },
  endButton: {
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    flexShrink: 0,
  },
  endButtonText: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
});
