/**
 * NiyyahDisplay -- Read-only niyyah chips for profile screen.
 *
 * Shows selected niyyahs as styled chips (same style as onboarding, read-only).
 * Renders nothing if no niyyahs selected.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../tokens';
import { NIYYAH_OPTIONS } from '../../domain/niyyah-options';

interface NiyyahDisplayProps {
  selectedNiyyahs: string[];
}

export function NiyyahDisplay({ selectedNiyyahs }: NiyyahDisplayProps) {
  if (selectedNiyyahs.length === 0) return null;

  const niyyahItems = selectedNiyyahs
    .map((id) => NIYYAH_OPTIONS.find((n) => n.id === id))
    .filter(Boolean) as (typeof NIYYAH_OPTIONS)[number][];

  if (niyyahItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>Your Niyyah</Text>
      <View style={styles.chipsRow}>
        {niyyahItems.map((niyyah) => (
          <View key={niyyah.id} style={styles.chip} accessibilityRole="text">
            <Text style={styles.chipText}>{niyyah.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
  sectionHeading: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    color: colors.dark.textPrimary,
    marginBottom: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.dark.surface,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.primary,
  },
  chipText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.primary,
  },
});
