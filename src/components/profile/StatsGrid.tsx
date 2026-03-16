/**
 * StatsGrid -- 3-column stats card row for profile screen.
 *
 * Cards: Total XP, Best Active Streak, Days Active.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../tokens';

interface StatsGridProps {
  totalXP: number;
  bestStreak: number;
  daysActive: number;
}

interface StatCardProps {
  label: string;
  value: string;
  accentColor?: string;
}

function StatCard({ label, value, accentColor }: StatCardProps) {
  return (
    <View
      style={[styles.card, accentColor ? { borderColor: accentColor } : undefined]}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, accentColor ? { color: accentColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

export function StatsGrid({ totalXP, bestStreak, daysActive }: StatsGridProps) {
  return (
    <View style={styles.container}>
      <StatCard
        label="Total XP"
        value={totalXP.toLocaleString()}
        accentColor={colors.dark.xp}
      />
      <StatCard
        label="Best Streak"
        value={`${bestStreak}d`}
        accentColor={colors.dark.primary}
      />
      <StatCard
        label="Days Active"
        value={`${daysActive}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.dark.surface,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  cardLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    color: colors.dark.textPrimary,
    textAlign: 'center',
  },
});
