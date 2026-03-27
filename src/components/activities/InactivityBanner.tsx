/**
 * InactivityBanner
 *
 * Displays a gentle non-shame warning when a buddy has been inactive on a duo quest.
 *
 * Per D-09: show yellow warning after 48h inactivity ("Paused - waiting for [buddy]")
 * Per D-10: show exit option with partial XP after 72h inactivity
 *
 * Adab compliance: No shame copy — partner pause is framed neutrally, exit is framed
 * as "exit with partial XP" not as punishment or failure.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, palette } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import type { InactivityStatus } from '../../domain/duo-quest-engine';

// ─── Props ────────────────────────────────────────────────────────────────────

interface InactivityBannerProps {
  status: InactivityStatus;
  buddyName: string;
  onExit?: () => void;
  /** Partial XP to display on the exit button when status is 'exit_eligible'. */
  partialXP?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InactivityBanner({ status, buddyName, onExit, partialXP = 0 }: InactivityBannerProps) {
  // 'ok' status renders nothing — no banner needed
  if (status === 'ok') return null;

  const isExitEligible = status === 'exit_eligible';

  return (
    <View style={styles.banner}>
      <View style={styles.row}>
        <Text style={styles.bannerText}>
          {isExitEligible
            ? `${buddyName} hasn't been active in a while. You can exit with your progress.`
            : `Paused — waiting for ${buddyName}`}
        </Text>
      </View>

      {isExitEligible && onExit && (
        <TouchableOpacity
          style={styles.exitButton}
          onPress={onExit}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Exit quest and claim ${partialXP} XP`}
        >
          <Text style={styles.exitButtonText}>
            Exit with {partialXP} XP
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

// Warm gold background at 15% opacity per D-09
const BANNER_BG = `${palette['gold-700']}26`; // 26 hex = ~15% opacity

const styles = StyleSheet.create({
  banner: {
    backgroundColor: BANNER_BG,
    borderRadius: 10,
    padding: 12,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: `${palette['gold-700']}40`,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bannerText: {
    ...typography.bodySm,
    color: palette['gold-700'],
    flex: 1,
    lineHeight: 20,
  },
  exitButton: {
    backgroundColor: `${palette['gold-700']}33`,
    borderRadius: 8,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${palette['gold-700']}60`,
    alignSelf: 'flex-start',
  },
  exitButtonText: {
    ...typography.bodySm,
    color: palette['gold-700'],
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
});
