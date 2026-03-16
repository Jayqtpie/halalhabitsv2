/**
 * TrophyCase -- Identity Titles grid for profile screen.
 *
 * Adapted from TitleGrid for the profile context.
 * Shows all titles in a vertical list grouped by rarity.
 * Earned titles glow with rarity-colored border.
 * Locked titles show at 0.3 opacity with unlock hint on tap.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../tokens';
import { TITLE_SEED_DATA } from '../../domain/title-seed-data';

type Rarity = 'common' | 'rare' | 'legendary';

const RARITY_ORDER: Rarity[] = ['common', 'rare', 'legendary'];

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  legendary: 'Legendary',
};

const RARITY_COLORS: Record<Rarity, string> = {
  common: colors.dark.rarity.common.text,
  rare: colors.dark.rarity.rare.text,
  legendary: colors.dark.rarity.legendary.text,
};

const RARITY_GLOW: Record<Rarity, string> = {
  common: colors.dark.rarity.common.glow,
  rare: colors.dark.rarity.rare.glow,
  legendary: colors.dark.rarity.legendary.glow,
};

/** Get a short hint about how to unlock this title */
function getUnlockHint(titleId: string): string {
  const seed = TITLE_SEED_DATA.find((t) => t.id === titleId);
  if (!seed) return 'Keep completing habits';

  switch (seed.unlockType) {
    case 'onboarding':
      return 'Complete onboarding';
    case 'total_completions':
      return `Complete ${seed.unlockValue} habits`;
    case 'level_reach':
      return `Reach Level ${seed.unlockValue}`;
    case 'habit_type_streak':
      return `${seed.unlockValue}-day ${seed.unlockHabitType?.replace(/_/g, ' ') ?? 'habit'} streak`;
    case 'habit_streak':
      return `${seed.unlockValue}-day streak on any habit`;
    case 'quest_completions':
      return `Complete ${seed.unlockValue} quests`;
    case 'mercy_recoveries':
      return `${seed.unlockValue} Mercy Mode recoveries`;
    case 'muhasabah_streak':
      return `${seed.unlockValue}-day Muhasabah streak`;
    case 'habit_count':
      return `Track ${seed.unlockValue} habits`;
    case 'simultaneous_streaks':
      return `${seed.unlockValue} habits with long streaks simultaneously`;
    default:
      return 'Keep building discipline';
  }
}

interface TitleItemProps {
  titleId: string;
  name: string;
  rarity: Rarity;
  isUnlocked: boolean;
  flavorText?: string | null;
}

function TitleItem({ titleId, name, rarity, isUnlocked, flavorText }: TitleItemProps) {
  const [expanded, setExpanded] = useState(false);
  const rarityColor = RARITY_COLORS[rarity];
  const rarityGlow = RARITY_GLOW[rarity];

  return (
    <Pressable
      style={[
        styles.titleItem,
        isUnlocked && { borderColor: rarityGlow, shadowColor: rarityGlow },
        !isUnlocked && styles.titleItemLocked,
      ]}
      onPress={() => !isUnlocked && setExpanded((v) => !v)}
      accessibilityRole="button"
      accessibilityLabel={
        isUnlocked
          ? `${name}, ${rarity} title unlocked`
          : `${name}, ${rarity} title, locked. Tap for hint.`
      }
    >
      <View style={styles.titleRow}>
        <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
        <Text
          style={[
            styles.titleName,
            isUnlocked ? { color: colors.dark.textPrimary } : { color: colors.dark.textSecondary },
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
        {!isUnlocked && (
          <Text style={styles.lockIcon}>🔒</Text>
        )}
      </View>

      {/* Locked: show hint on tap */}
      {!isUnlocked && expanded && (
        <Text style={styles.unlockHint}>{getUnlockHint(titleId)}</Text>
      )}

      {/* Unlocked: show flavor text */}
      {isUnlocked && flavorText && (
        <Text style={styles.flavorText}>{flavorText}</Text>
      )}
    </Pressable>
  );
}

interface TrophyCaseProps {
  unlockedTitleIds: Set<string>;
}

export function TrophyCase({ unlockedTitleIds }: TrophyCaseProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeading}>Identity Titles</Text>

      {RARITY_ORDER.map((rarity) => {
        const titlesInRarity = TITLE_SEED_DATA.filter((t) => t.rarity === rarity).sort(
          (a, b) => a.sortOrder - b.sortOrder
        );

        return (
          <View key={rarity} style={styles.rarityGroup}>
            <View style={styles.rarityHeader}>
              <Text style={[styles.rarityLabel, { color: RARITY_COLORS[rarity] }]}>
                {RARITY_LABELS[rarity].toUpperCase()}
              </Text>
              <Text style={styles.rarityCount}>
                {titlesInRarity.filter((t) => unlockedTitleIds.has(t.id)).length}/
                {titlesInRarity.length}
              </Text>
            </View>

            {titlesInRarity.map((title) => (
              <TitleItem
                key={title.id}
                titleId={title.id}
                name={title.name}
                rarity={title.rarity as Rarity}
                isUnlocked={unlockedTitleIds.has(title.id)}
                flavorText={title.flavorText}
              />
            ))}
          </View>
        );
      })}
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
  rarityGroup: {
    marginBottom: spacing.lg,
  },
  rarityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.xs,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  rarityLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: typography.headingMd.fontFamily,
    letterSpacing: 1,
  },
  rarityCount: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textSecondary,
  },
  titleItem: {
    backgroundColor: colors.dark.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.border,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  titleItemLocked: {
    opacity: 0.4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  titleName: {
    flex: 1,
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
  },
  lockIcon: {
    fontSize: 12,
  },
  unlockHint: {
    marginTop: spacing.sm,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textMuted,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  flavorText: {
    marginTop: spacing.xs,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textMuted,
    fontStyle: 'italic',
  },
});
