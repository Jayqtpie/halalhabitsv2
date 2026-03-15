/**
 * QuestLockedState -- Shown when player level < 5.
 *
 * Displays lock icon, unlock message, XP progress toward Level 5,
 * and encouraging copy. No shame language (adab-safe).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../tokens';
import { xpForLevel } from '../../domain/xp-engine';

interface QuestLockedStateProps {
  currentLevel: number;
  currentXP: number;
}

export function QuestLockedState({ currentLevel, currentXP }: QuestLockedStateProps) {
  const xpAtLevel5 = xpForLevel(5);
  const progressPercent = xpAtLevel5 > 0 ? Math.min(1, currentXP / xpAtLevel5) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.lockIcon}>
        <Text style={styles.lockSymbol}>&#128274;</Text>
      </View>

      <Text style={styles.heading}>Quest Board</Text>
      <Text style={styles.subheading}>Unlocks at Level 5</Text>

      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>Currently Lv {currentLevel}</Text>
      </View>

      {/* XP progress toward Level 5 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progressPercent * 100}%` }]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {currentXP.toLocaleString()} / {xpAtLevel5.toLocaleString()} XP to Level 5
        </Text>
      </View>

      <Text style={styles.encouragement}>
        Keep building your discipline. You're getting closer.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  lockIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.dark.surface,
    borderWidth: 2,
    borderColor: colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  lockSymbol: {
    fontSize: 32,
  },
  heading: {
    fontSize: typography.headingLg.fontSize,
    lineHeight: typography.headingLg.lineHeight,
    fontFamily: typography.headingLg.fontFamily,
    fontWeight: '700' as const,
    color: colors.dark.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subheading: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  levelBadge: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.primary,
    marginBottom: spacing.lg,
  },
  levelText: {
    fontSize: 11,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700' as const,
    letterSpacing: typography.headingMd.letterSpacing,
    color: colors.dark.primary,
  },
  progressContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.dark.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.dark.primary,
    borderRadius: radius.sm,
  },
  progressLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  encouragement: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: 22,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
