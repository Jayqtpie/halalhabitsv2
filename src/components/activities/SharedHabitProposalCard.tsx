/**
 * SharedHabitProposalCard
 *
 * Displays an incoming shared habit proposal from a buddy.
 * The buddy has proposed a habit they want to do together.
 * Player can accept (activates the shared habit) or decline (ends the proposal).
 *
 * Visual identity: gold-700 left border indicates incoming social action.
 * Accept = emerald filled button, Decline = subtle text button per design spec.
 * Per CLAUDE.md: No shame copy. Declining is framed neutrally.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, palette } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { componentSpacing, spacing } from '../../tokens/spacing';
import type { SharedHabit } from '../../types/database';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SharedHabitProposalCardProps {
  proposal: SharedHabit;
  fromName: string;
  onAccept: () => void;
  onDecline: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SharedHabitProposalCard({
  proposal,
  fromName,
  onAccept,
  onDecline,
}: SharedHabitProposalCardProps) {
  return (
    <View style={styles.card}>
      {/* Gold left border — indicates incoming proposal */}
      <View style={styles.accentBar} />

      <View style={styles.content}>
        {/* Proposal description */}
        <Text style={styles.proposalText} numberOfLines={3}>
          <Text style={styles.fromName}>{fromName}</Text>
          <Text style={styles.proposalVerb}> wants to share: </Text>
          <Text style={styles.habitName}>{proposal.name}</Text>
        </Text>

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={onAccept}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Accept shared habit proposal: ${proposal.name}`}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.declineButton}
            onPress={onDecline}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Decline shared habit proposal: ${proposal.name}`}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  accentBar: {
    width: 4,
    backgroundColor: palette['gold-700'],
  },
  content: {
    flex: 1,
    paddingHorizontal: componentSpacing.cardPadding,
    paddingVertical: componentSpacing.cardPadding,
    gap: spacing.sm,
    minWidth: 0,
  },
  proposalText: {
    ...typography.bodyMd,
    color: colors.dark.textPrimary,
    flexShrink: 1,
  },
  fromName: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  proposalVerb: {
    color: colors.dark.textSecondary,
  },
  habitName: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: palette['emerald-400'],
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  acceptButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  acceptButtonText: {
    ...typography.bodySm,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  declineButton: {
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  declineButtonText: {
    ...typography.bodySm,
    color: colors.dark.textMuted,
  },
});
