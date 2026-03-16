/**
 * Starter pack selector component.
 *
 * Renders STARTER_PACKS as 3 vertical cards. One selectable at a time.
 * Selected card has emerald border + checkmark.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { StarterPack } from '../../domain/starter-packs';
import { colors, fontFamilies, spacing } from '../../tokens';

const c = colors.dark;

// Pack icons for visual variety
const PACK_ICONS: Record<string, string> = {
  'beginner-path': '🌱',
  'salah-focus': '🕌',
  'full-discipline': '⚔️',
};

// Habit count display names
function formatHabitCount(count: number): string {
  return count === 1 ? '1 habit' : `${count} habits`;
}

interface StarterPackSelectorProps {
  packs: StarterPack[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function StarterPackSelector({ packs, selectedId, onSelect }: StarterPackSelectorProps) {
  return (
    <View style={styles.container}>
      {packs.map((pack) => {
        const isSelected = selectedId === pack.id;
        return (
          <Pressable
            key={pack.id}
            style={({ pressed }) => [
              styles.card,
              isSelected && styles.cardSelected,
              pressed && styles.cardPressed,
            ]}
            onPress={() => onSelect(pack.id)}
            accessibilityLabel={`${pack.name}: ${pack.description}. ${formatHabitCount(pack.habitKeys.length)}.`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.packIcon}>{PACK_ICONS[pack.id] ?? '📋'}</Text>
            </View>

            <View style={styles.cardMiddle}>
              <Text style={[styles.packName, isSelected && styles.packNameSelected]}>
                {pack.name}
              </Text>
              <Text style={styles.packDescription}>{pack.description}</Text>
              <View style={styles.countTag}>
                <Text style={styles.countText}>{formatHabitCount(pack.habitKeys.length)}</Text>
              </View>
            </View>

            <View style={styles.cardRight}>
              <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </View>

            {isSelected && <View style={styles.selectedAccent} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: c.border,
    padding: spacing.md,
    gap: spacing.md,
    minHeight: 80,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: c.primary,
    backgroundColor: `${c.primary}11`,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardLeft: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${c.primary}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packIcon: {
    fontSize: 24,
  },
  cardMiddle: {
    flex: 1,
    gap: 4,
  },
  packName: {
    fontSize: 12,
    fontFamily: fontFamilies.pixelFont,
    color: c.textPrimary,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  packNameSelected: {
    color: c.primary,
  },
  packDescription: {
    fontSize: 13,
    fontFamily: fontFamilies.inter,
    color: c.textSecondary,
    lineHeight: 18,
  },
  countTag: {
    alignSelf: 'flex-start',
    backgroundColor: c.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: c.border,
    marginTop: 4,
  },
  countText: {
    fontSize: 10,
    fontFamily: fontFamilies.interSemiBold,
    color: c.textMuted,
  },
  cardRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: c.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: c.primary,
  },
  selectedAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: c.primary,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
});
