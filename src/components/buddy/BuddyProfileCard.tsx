/**
 * BuddyProfileCard — stat card for the 2x2 grid on the buddy profile screen.
 *
 * Displays a single stat (value + label) in a surface-coloured card.
 * Optional color override for the value text (e.g. gold for XP Total).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { componentSpacing } from '../../tokens/spacing';

interface BuddyProfileCardProps {
  label: string;
  value: string | number;
  /** Override color for the value text. Defaults to textPrimary. */
  valueColor?: string;
  /** Optional icon node rendered above the value. */
  icon?: React.ReactNode;
}

export function BuddyProfileCard({ label, value, valueColor, icon }: BuddyProfileCardProps) {
  return (
    <View style={styles.card}>
      {icon != null && <View style={styles.iconWrap}>{icon}</View>}
      <Text
        style={[styles.value, valueColor != null ? { color: valueColor } : undefined]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: componentSpacing.cardPadding,
    alignItems: 'center',
    justifyContent: 'center',
    // Each card takes ~half of parent minus gap — caller controls width via flex
    minHeight: 80,
  },
  iconWrap: {
    marginBottom: 4,
  },
  value: {
    ...typography.headingMd,
    color: colors.dark.textPrimary,
    textAlign: 'center',
  },
  label: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
