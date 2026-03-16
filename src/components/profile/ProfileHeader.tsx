/**
 * ProfileHeader -- Character sprite, active title, level, and XP bar.
 *
 * The "hero" area of the RPG character sheet.
 * Uses RN Image (not Skia) since we're outside a Skia Canvas.
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../tokens';

interface ProfileHeaderProps {
  characterPresetId: string | null;
  activeTitle: string | null;
  currentLevel: number;
  totalXP: number;
  xpToNext: number;
}

export function ProfileHeader({
  characterPresetId,
  activeTitle,
  currentLevel,
  totalXP,
  xpToNext,
}: ProfileHeaderProps) {
  // XP within current level = totalXP modulo the cumulative XP at current level
  // We compute progress as xpToNext - remaining, where remaining = xpToNext - (xpEarnedThisLevel)
  // For display purposes: xpToNext is the cost to reach next level
  // We need xpAtCurrentLevel to compute progress. Approximate: show totalXP and xpToNext.
  // A simpler approach: the bar represents "how far into this level"
  // We'll pass xpProgress computed outside or use a reasonable default.
  const xpProgress = xpToNext > 0 ? Math.min(1, (totalXP % xpToNext) / xpToNext) : 1;

  return (
    <View style={styles.container}>
      {/* Character Sprite using RN Image */}
      <View style={styles.spriteContainer} accessibilityLabel="Character sprite">
        <Image
          source={require('../../../assets/sprites/character-idle.png')}
          style={styles.sprite}
          resizeMode="contain"
        />
      </View>

      {/* Active Identity Title */}
      {activeTitle ? (
        <Text style={styles.titleText} accessibilityRole="text">
          {activeTitle}
        </Text>
      ) : (
        <Text style={styles.titleTextEmpty} accessibilityRole="text">
          No title equipped
        </Text>
      )}

      {/* Level display */}
      <Text style={styles.levelText} accessibilityRole="text">
        Level {currentLevel}
      </Text>

      {/* XP Progress bar */}
      <View style={styles.xpBarContainer} accessibilityLabel={`XP progress: ${totalXP} total XP`}>
        <View style={styles.xpBarTrack}>
          <View style={[styles.xpBarFill, { width: `${Math.min(100, xpProgress * 100)}%` }]} />
        </View>
        <Text style={styles.xpLabel}>{totalXP.toLocaleString()} XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  spriteContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.dark.surface,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.dark.primary,
  },
  sprite: {
    width: 48,
    height: 48,
  },
  titleText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.rarity.rare.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  titleTextEmpty: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textMuted,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  levelText: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    color: colors.dark.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  xpBarContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  xpBarTrack: {
    width: '80%',
    height: 8,
    backgroundColor: colors.dark.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.dark.xp,
    borderRadius: 4,
  },
  xpLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.textSecondary,
  },
});
