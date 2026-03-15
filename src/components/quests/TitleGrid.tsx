/**
 * TitleGrid -- Rarity-grouped title browser with progress bars.
 *
 * Grouped by rarity: Common, Rare, Legendary.
 * Each group shows unlocked/total count.
 * Unlocked titles can be equipped (one active at a time).
 * Locked titles show greyed name with progress bar on tap.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SectionList,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../tokens';
import { TITLE_SEED_DATA } from '../../domain/title-seed-data';
import type { Title } from '../../types/database';
import type { PlayerStats } from '../../domain/title-engine';

interface TitleGridProps {
  allTitles: Title[];
  unlockedTitleIds: Set<string>;
  activeTitleId: string | null;
  playerStats: Partial<PlayerStats>;
  onEquipTitle: (titleId: string) => void;
}

type Rarity = 'common' | 'rare' | 'legendary';

interface TitleSection {
  title: string;
  rarity: Rarity;
  data: Title[];
  unlockedCount: number;
  totalCount: number;
}

/** Derive progress toward a title unlock condition from playerStats */
function getTitleProgress(
  titleId: string,
  playerStats: Partial<PlayerStats>,
): { current: number; target: number; label: string } | null {
  const seed = TITLE_SEED_DATA.find(t => t.id === titleId);
  if (!seed) return null;

  const stats = playerStats;
  switch (seed.unlockType) {
    case 'onboarding':
      return null; // Always unlocked after onboarding

    case 'total_completions': {
      const current = stats.totalCompletions ?? 0;
      return { current, target: seed.unlockValue, label: `Complete ${seed.unlockValue} habits` };
    }

    case 'level_reach': {
      const current = stats.currentLevel ?? 1;
      return { current, target: seed.unlockValue, label: `Reach Level ${seed.unlockValue}` };
    }

    case 'habit_type_streak': {
      // Find best streak for the required habit type
      const habitTypes = stats.habitTypes ?? {};
      const habitStreaks = stats.habitStreaks ?? {};
      const relevantStreaks = Object.entries(habitTypes)
        .filter(([, type]) => type === seed.unlockHabitType)
        .map(([id]) => habitStreaks[id] ?? 0);
      const current = relevantStreaks.length > 0 ? Math.max(...relevantStreaks) : 0;
      const habitTypeName = seed.unlockHabitType?.replace(/_/g, ' ') ?? 'habit';
      return {
        current,
        target: seed.unlockValue,
        label: `${seed.unlockValue} consecutive ${habitTypeName}`,
      };
    }

    case 'habit_streak': {
      const habitStreaks = stats.habitStreaks ?? {};
      const bestStreak = Object.values(habitStreaks).length > 0
        ? Math.max(...Object.values(habitStreaks))
        : 0;
      return { current: bestStreak, target: seed.unlockValue, label: `${seed.unlockValue}-day streak on any habit` };
    }

    case 'quest_completions': {
      const current = stats.questCompletions ?? 0;
      return { current, target: seed.unlockValue, label: `Complete ${seed.unlockValue} quests` };
    }

    case 'mercy_recoveries': {
      const current = stats.mercyRecoveries ?? 0;
      return { current, target: seed.unlockValue, label: `${seed.unlockValue} Mercy Mode recoveries` };
    }

    case 'muhasabah_streak': {
      const current = stats.muhasabahStreak ?? 0;
      return { current, target: seed.unlockValue, label: `${seed.unlockValue}-day reflection (Muhasabah) streak` };
    }

    case 'habit_count': {
      const current = stats.activeHabitCount ?? 0;
      return { current, target: seed.unlockValue, label: `Track ${seed.unlockValue} habits` };
    }

    case 'simultaneous_streaks': {
      // unlockValue = 5 habits, checked against 14-day (rare) or 90-day (legendary)
      const seed_ = TITLE_SEED_DATA.find(t => t.id === titleId);
      const isLegendary = seed_?.rarity === 'legendary';
      const current = isLegendary ? (stats.simultaneousStreaks90 ?? 0) : (stats.simultaneousStreaks14 ?? 0);
      const dayCount = isLegendary ? 90 : 14;
      return {
        current,
        target: seed.unlockValue,
        label: `${seed.unlockValue} habits with ${dayCount}+ day streaks simultaneously`,
      };
    }

    default:
      return null;
  }
}

function RarityBadge({ rarity }: { rarity: Rarity }) {
  const rarityColors: Record<Rarity, string> = {
    common: colors.dark.rarity.common.text,
    rare: colors.dark.rarity.rare.text,
    legendary: colors.dark.rarity.legendary.text,
  };

  return (
    <View style={[styles.rarityDot, { backgroundColor: rarityColors[rarity] }]} />
  );
}

function TitleRow({
  title,
  isUnlocked,
  isActive,
  playerStats,
  onEquip,
}: {
  title: Title;
  isUnlocked: boolean;
  isActive: boolean;
  playerStats: Partial<PlayerStats>;
  onEquip: (titleId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const progress = getTitleProgress(title.id, playerStats);
  const rarity = title.rarity as Rarity;

  const progressPercent = progress && progress.target > 0
    ? Math.min(1, progress.current / progress.target)
    : 0;

  return (
    <Pressable
      style={[
        styles.titleRow,
        isActive && styles.titleRowActive,
        !isUnlocked && styles.titleRowLocked,
      ]}
      onPress={() => !isUnlocked && setExpanded(v => !v)}
      accessibilityLabel={isUnlocked
        ? `${title.name}, ${rarity} title${isActive ? ', currently equipped' : ''}`
        : `${title.name}, ${rarity} title, locked`}
      accessibilityRole="button"
    >
      {/* Row: rarity dot + name + equip button */}
      <View style={styles.titleMainRow}>
        <RarityBadge rarity={rarity} />
        <Text
          style={[
            styles.titleName,
            isUnlocked ? styles.titleNameUnlocked : styles.titleNameLocked,
            isActive && styles.titleNameActive,
          ]}
          numberOfLines={1}
        >
          {title.name}
        </Text>
        {isUnlocked && !isActive && (
          <Pressable
            style={styles.equipButton}
            onPress={() => onEquip(title.id)}
            accessibilityLabel={`Equip ${title.name}`}
            accessibilityRole="button"
          >
            <Text style={styles.equipButtonText}>Equip</Text>
          </Pressable>
        )}
        {isActive && (
          <View style={styles.equippedBadge}>
            <Text style={styles.equippedBadgeText}>Equipped</Text>
          </View>
        )}
      </View>

      {/* Locked title: show progress on tap */}
      {!isUnlocked && progress && expanded && (
        <View style={styles.progressExpanded}>
          <Text style={styles.progressLabel}>{progress.label}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progressPercent * 100}%` }]}
              />
            </View>
            <Text style={styles.progressCount}>
              {progress.current}/{progress.target}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export function TitleGrid({
  allTitles,
  unlockedTitleIds,
  activeTitleId,
  playerStats,
  onEquipTitle,
}: TitleGridProps) {
  const rarityOrder: Rarity[] = ['common', 'rare', 'legendary'];

  const sections: TitleSection[] = rarityOrder.map((rarity) => {
    const titlesInRarity = allTitles
      .filter(t => t.rarity === rarity)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const unlockedCount = titlesInRarity.filter(t => unlockedTitleIds.has(t.id)).length;
    return {
      title: rarity.charAt(0).toUpperCase() + rarity.slice(1),
      rarity,
      data: titlesInRarity,
      unlockedCount,
      totalCount: titlesInRarity.length,
    };
  });

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: getRarityTextColor(section.rarity) }]}>
            {section.title}
          </Text>
          <Text style={styles.sectionCount}>
            {section.unlockedCount}/{section.totalCount}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TitleRow
          title={item}
          isUnlocked={unlockedTitleIds.has(item.id)}
          isActive={item.id === activeTitleId}
          playerStats={playerStats}
          onEquip={onEquipTitle}
        />
      )}
      stickySectionHeadersEnabled={false}
    />
  );
}

function getRarityTextColor(rarity: Rarity): string {
  const map: Record<Rarity, string> = {
    common: colors.dark.rarity.common.text,
    rare: colors.dark.rarity.rare.text,
    legendary: colors.dark.rarity.legendary.text,
  };
  return map[rarity];
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 11,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.textSecondary,
  },
  titleRow: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  titleRowActive: {
    borderColor: colors.dark.primary,
    shadowColor: colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  titleRowLocked: {
    opacity: 0.65,
  },
  titleMainRow: {
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
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    flex: 1,
  },
  titleNameUnlocked: {
    color: colors.dark.textPrimary,
  },
  titleNameLocked: {
    color: colors.dark.textSecondary,
  },
  titleNameActive: {
    color: colors.dark.primary,
  },
  equipButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minHeight: 32,
    justifyContent: 'center',
  },
  equipButtonText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.background,
    fontWeight: '600' as const,
  },
  equippedBadge: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.dark.primary,
    minHeight: 32,
    justifyContent: 'center',
  },
  equippedBadgeText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.primary,
  },
  progressExpanded: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  progressLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.dark.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.dark.primary,
    borderRadius: radius.sm,
  },
  progressCount: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.textSecondary,
    minWidth: 36,
    textAlign: 'right',
  },
});
