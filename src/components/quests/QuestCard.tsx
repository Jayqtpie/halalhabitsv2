/**
 * QuestCard -- Individual quest row with progress bar, XP badge,
 * and completed trophy state.
 *
 * Auto-track design: no accept button.
 * Completed state: checkmark + emerald "Completed! +XP" text + emerald border glow.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../tokens';
import type { Quest } from '../../types/database';

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const isCompleted = quest.status === 'completed';
  const progressPercent = quest.targetValue > 0
    ? Math.min(1, quest.progress / quest.targetValue)
    : 0;

  const accessibilityLabel = isCompleted
    ? `${quest.description}. Completed. Earned ${quest.xpReward} XP.`
    : `${quest.description}. Progress: ${quest.progress} of ${quest.targetValue}.`;

  return (
    <View
      style={[styles.card, isCompleted && styles.cardCompleted]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="none"
    >
      {/* Header row: description + XP badge */}
      <View style={styles.headerRow}>
        <Text
          style={[styles.description, isCompleted && styles.descriptionCompleted]}
          numberOfLines={2}
        >
          {quest.description}
        </Text>
        <View style={[styles.xpBadge, isCompleted && styles.xpBadgeCompleted]}>
          <Text style={[styles.xpBadgeText, isCompleted && styles.xpBadgeTextCompleted]}>
            +{quest.xpReward} XP
          </Text>
        </View>
      </View>

      {isCompleted ? (
        /* Completed trophy state */
        <View style={styles.completedRow}>
          <Text style={styles.checkmark}>&#10003;</Text>
          <Text style={styles.completedText}>
            Completed! +{quest.xpReward} XP
          </Text>
        </View>
      ) : (
        /* Progress bar + count */
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progressPercent * 100}%` }]}
            />
          </View>
          <Text style={styles.progressCount}>
            {quest.progress}/{quest.targetValue}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  cardCompleted: {
    borderColor: colors.dark.primary,
    shadowColor: colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textPrimary,
    flex: 1,
  },
  descriptionCompleted: {
    color: colors.dark.textSecondary,
  },
  xpBadge: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.dark.border,
    flexShrink: 0,
  },
  xpBadgeCompleted: {
    borderColor: colors.dark.primary,
  },
  xpBadgeText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.textSecondary,
  },
  xpBadgeTextCompleted: {
    color: colors.dark.primary,
  },
  progressSection: {
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
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkmark: {
    fontSize: 16,
    color: colors.dark.primary,
    fontWeight: '700',
  },
  completedText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.primary,
    fontWeight: '600',
  },
});
