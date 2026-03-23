/**
 * ArchetypeCard — individual archetype selection card for the Arena gallery.
 *
 * Shows archetype name (Inter-Bold 20px), Arabic title (Inter-Regular 13px),
 * lore blurb (max 2 lines), and optional "Recommended" badge.
 * Selected state: 2px solid emerald border + backgroundDeep fill.
 * Accessibility: accessibilityRole="button", accessibilityLabel.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, componentSpacing, radius } from '../../tokens';
import type { BossArchetype } from '../../domain/boss-content';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArchetypeCardProps {
  archetype: BossArchetype;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ArchetypeCard({ archetype, isSelected, isRecommended, onSelect }: ArchetypeCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isSelected ? styles.cardSelected : styles.cardUnselected,
        pressed && styles.cardPressed,
      ]}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`${archetype.name} - ${archetype.arabicName}`}
      accessibilityState={{ selected: isSelected }}
    >
      {/* Header row: name + recommended badge */}
      <View style={styles.headerRow}>
        <Text style={styles.archetypeName} numberOfLines={1}>
          {archetype.name}
        </Text>
        {isRecommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        )}
      </View>

      {/* Arabic title */}
      <Text style={styles.arabicName}>{archetype.arabicName}</Text>

      {/* Lore blurb */}
      <Text style={styles.lore} numberOfLines={2} ellipsizeMode="tail">
        {archetype.lore}
      </Text>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.lg,
    padding: componentSpacing.cardPadding,
    gap: spacing.xs,
  },
  cardUnselected: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.dark.primary,
    backgroundColor: colors.dark.backgroundDeep,
  },
  cardPressed: {
    opacity: 0.7,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },

  archetypeName: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    flex: 1,
  },

  arabicName: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
  },

  lore: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary,
  },

  // Recommended badge: emerald-900 bg, emerald-400 text, emerald-500 border
  recommendedBadge: {
    backgroundColor: '#1B4332', // palette.emerald-900
    borderWidth: 1,
    borderColor: colors.dark.primary, // emerald-500
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  recommendedText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: '#34D399', // palette.emerald-400
  },
});
