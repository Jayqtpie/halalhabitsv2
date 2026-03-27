/**
 * DuoQuestCard
 *
 * Card component for a single duo quest in the Activities tab.
 *
 * Privacy (DUOQ-05, D-13):
 *   - Shows ONLY aggregate combined progress — never individual userA/userB values
 *   - Uses getAggregateProgress from domain engine for display
 *   - Combined progress bar (single bar), aggregate %, no individual breakdown
 *
 * Per D-13: single combined progress bar, aggregate % only.
 * Per D-09/D-10: inactivity banner rendered below card when status is not 'ok'.
 * Per project CLAUDE.md: no shame copy, no addiction dark patterns.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAggregateProgress, calculatePartialXP } from '../../domain/duo-quest-engine';
import { InactivityBanner } from './InactivityBanner';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { componentSpacing, spacing } from '../../tokens/spacing';
import type { DuoQuest } from '../../types/database';
import type { InactivityStatus } from '../../domain/duo-quest-engine';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DuoQuestCardProps {
  quest: DuoQuest;
  buddyName: string;
  onPress: () => void;
  onExit?: () => void;
  inactivityStatus: InactivityStatus;
  /** Current player's side in this quest (for partial XP calculation). */
  side: 'a' | 'b';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a future ISO timestamp as "X days left" or "Expired". */
function formatTimeRemaining(expiresAt: string | null): string {
  if (!expiresAt) return '';
  const msLeft = new Date(expiresAt).getTime() - Date.now();
  if (msLeft <= 0) return 'Expired';
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
  if (daysLeft === 1) return '1 day left';
  return `${daysLeft} days left`;
}

/** Warm copy based on progress — no shame, always encouraging. */
function getEncouragementCopy(percentage: number): string {
  if (percentage >= 100) return 'Quest complete!';
  if (percentage >= 75) return 'Almost there!';
  if (percentage >= 50) return 'Halfway there!';
  if (percentage > 0) return 'Working together!';
  return 'Just getting started!';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DuoQuestCard({ quest, buddyName, onPress, onExit, inactivityStatus, side }: DuoQuestCardProps) {
  // Per D-13: aggregate progress only — never expose individual player data
  const { percentage, totalProgress, totalTarget } = getAggregateProgress(quest);

  const timeRemaining = formatTimeRemaining(quest.expiresAt);
  const encouragement = getEncouragementCopy(percentage);

  // Calculate partial XP for exit button in InactivityBanner
  const userProgress = side === 'a' ? quest.userAProgress : quest.userBProgress;
  const { individualXP: partialXP } = calculatePartialXP({
    xpRewardEach: quest.xpRewardEach,
    userProgress,
    targetValue: quest.targetValue,
  });

  // Progress bar fill width percentage (0-100)
  const progressFill = Math.min(100, Math.max(0, percentage));

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Duo quest: ${quest.title} with ${buddyName}. Team progress: ${percentage}%`}
    >
      {/* Quest title */}
      <Text style={styles.title} numberOfLines={1}>
        {quest.title}
      </Text>

      {/* Buddy name */}
      <Text style={styles.buddyLabel}>
        with {buddyName}
      </Text>

      {/* Combined progress bar — single bar, aggregate only per D-13 */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressFill}%` }]} />
      </View>

      {/* Aggregate progress text — never individual */}
      <Text style={styles.progressText}>
        Team progress: {percentage}%
        {'  '}
        <Text style={styles.progressRaw}>({totalProgress}/{totalTarget})</Text>
      </Text>

      {/* Footer row: time + XP reward */}
      <View style={styles.footer}>
        {timeRemaining ? (
          <Text style={styles.timeText}>{timeRemaining}</Text>
        ) : null}
        <Text style={styles.xpText}>
          {quest.xpRewardEach} XP + {quest.xpRewardBonus} bonus
        </Text>
      </View>

      {/* Warm encouragement copy at bottom */}
      <Text style={styles.encouragement}>{encouragement}</Text>

      {/* Inactivity banner below card when partner is inactive (D-09/D-10) */}
      {inactivityStatus !== 'ok' && (
        <InactivityBanner
          status={inactivityStatus}
          buddyName={buddyName}
          onExit={onExit}
          partialXP={partialXP}
        />
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: 14,
    padding: componentSpacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyMd,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  buddyLabel: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.dark.background,
    borderRadius: 4,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.dark.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.bodySm,
    color: colors.dark.textPrimary,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginTop: 2,
  },
  progressRaw: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  timeText: {
    ...typography.caption,
    color: colors.dark.textSecondary,
  },
  xpText: {
    ...typography.caption,
    color: colors.dark.xp,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  encouragement: {
    ...typography.caption,
    color: colors.dark.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
