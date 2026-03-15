/**
 * LevelBadge -- Compact single-line display of current level and active title.
 *
 * Format: "Lv 8 · The Steadfast" or just "Lv 8" if no active title.
 * Level text in Press Start 2P (pixel font), title in Inter.
 * Fits inside the header row next to the date display.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../stores/gameStore';
import { colors, typography, spacing } from '../../tokens';

export function LevelBadge() {
  const { currentLevel, activeTitle } = useGameStore(
    useShallow((s) => ({
      currentLevel: s.currentLevel,
      activeTitle: s.activeTitle,
    })),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.levelText}>Lv {currentLevel}</Text>
      {activeTitle ? (
        <>
          <Text style={styles.separator}> · </Text>
          <Text style={styles.titleText} numberOfLines={1}>
            {activeTitle.name}
          </Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    maxWidth: 180,
  },
  levelText: {
    fontSize: typography.hudLabel.fontSize,
    lineHeight: typography.hudLabel.lineHeight,
    fontFamily: typography.hudLabel.fontFamily,
    fontWeight: '700',
    color: colors.dark.xp,
  },
  separator: {
    fontSize: typography.bodySm.fontSize,
    color: colors.dark.textMuted,
  },
  titleText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    flexShrink: 1,
  },
});
