/**
 * DuoQuestDetailSheet
 *
 * Modal sheet showing full duo quest detail with progress and inactivity handling.
 *
 * Privacy (DUOQ-05, D-13):
 *   - Progress display is aggregate only — no individual partner progress exposed
 *   - "Mark Progress" advances the current user's own progress without revealing
 *     what the partner has done
 *
 * Per D-09/D-10: InactivityBanner shown when partner is inactive.
 * Per project memory: no flex:1 in Modal children (collapses layout).
 */
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDuoQuestStore } from '../../stores/duoQuestStore';
import { getAggregateProgress, calculatePartialXP } from '../../domain/duo-quest-engine';
import { InactivityBanner } from './InactivityBanner';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { componentSpacing, spacing } from '../../tokens/spacing';
import type { DuoQuest } from '../../types/database';
import type { InactivityStatus } from '../../domain/duo-quest-engine';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DuoQuestDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  quest: DuoQuest;
  buddyName: string;
  /** Current user's side in this quest ('a' or 'b'). */
  side: 'a' | 'b';
  userId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format time remaining from an expiresAt ISO timestamp. */
function formatTimeRemaining(expiresAt: string | null): string {
  if (!expiresAt) return '';
  const msLeft = new Date(expiresAt).getTime() - Date.now();
  if (msLeft <= 0) return 'Expired';
  const hoursLeft = Math.floor(msLeft / (60 * 60 * 1000));
  if (hoursLeft < 24) return `${hoursLeft}h remaining`;
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
  return `${daysLeft} days remaining`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DuoQuestDetailSheet({
  visible,
  onClose,
  quest,
  buddyName,
  side,
  userId,
}: DuoQuestDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { recordMyProgress, checkInactivityStatus, exitQuest } = useDuoQuestStore();

  const [loading, setLoading] = useState(false);
  const [inactivityStatus, setInactivityStatus] = useState<InactivityStatus>('ok');

  // Load inactivity status when sheet opens
  React.useEffect(() => {
    if (!visible) return;
    void checkInactivityStatus(quest.id, side).then(setInactivityStatus);
  }, [visible, quest.id, side, checkInactivityStatus]);

  // Per D-13: aggregate progress only, never individual
  const { percentage, totalProgress, totalTarget } = getAggregateProgress(quest);
  const progressFill = Math.min(100, Math.max(0, percentage));

  // Current player's progress (own data only, no partner exposure)
  const myProgress = side === 'a' ? quest.userAProgress : quest.userBProgress;
  const myCompleted = side === 'a' ? quest.userACompleted : quest.userBCompleted;

  // Partial XP for exit scenario (D-10)
  const { individualXP: partialXP } = calculatePartialXP({
    xpRewardEach: quest.xpRewardEach,
    userProgress: myProgress,
    targetValue: quest.targetValue,
  });

  const timeRemaining = formatTimeRemaining(quest.expiresAt);

  const handleMarkProgress = async () => {
    if (myCompleted) return;
    setLoading(true);
    try {
      await recordMyProgress(quest.id, side, userId);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Quest?',
      `You'll receive ${partialXP} XP for your progress so far. This quest will end for both players.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit Quest',
          style: 'destructive',
          onPress: async () => {
            await exitQuest(quest.id, side, userId);
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet — no flex:1 per project memory constraint */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        {/* Handle */}
        <View style={styles.handle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.content}
        >
          {/* Title + Buddy */}
          <Text style={styles.title}>{quest.title}</Text>
          <Text style={styles.buddyLabel}>with {buddyName}</Text>

          {/* Description */}
          {quest.description ? (
            <Text style={styles.description}>{quest.description}</Text>
          ) : null}

          {/* Large combined progress bar — aggregate only per D-13 */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressFill}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              Team progress: {percentage}% ({totalProgress}/{totalTarget})
            </Text>
          </View>

          {/* Your progress section — own progress only, no partner exposure */}
          <View style={styles.myProgressSection}>
            <Text style={styles.sectionLabel}>Your Progress</Text>
            <Text style={styles.myProgressText}>
              {myCompleted
                ? 'Your part is done!'
                : `${myProgress} / ${quest.targetValue} completed`}
            </Text>

            {/* Mark Progress button — disabled if already completed */}
            <TouchableOpacity
              style={[styles.markProgressBtn, myCompleted && styles.markProgressBtnDone]}
              onPress={() => void handleMarkProgress()}
              disabled={myCompleted || loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Mark my progress"
            >
              <Text style={[styles.markProgressText, myCompleted && styles.markProgressTextDone]}>
                {myCompleted ? 'Part Complete' : loading ? 'Saving...' : 'Mark Progress'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time remaining */}
          {timeRemaining ? (
            <Text style={styles.timeText}>{timeRemaining}</Text>
          ) : null}

          {/* XP breakdown */}
          <View style={styles.xpBreakdown}>
            <Text style={styles.xpLabel}>XP Breakdown</Text>
            <Text style={styles.xpLine}>
              Individual: <Text style={styles.xpValue}>{quest.xpRewardEach} XP</Text>
            </Text>
            <Text style={styles.xpLine}>
              Bonus:{' '}
              <Text style={styles.xpValue}>{quest.xpRewardBonus} XP</Text>
              <Text style={styles.xpNote}> (when both complete)</Text>
            </Text>
          </View>

          {/* Inactivity banner (D-09/D-10) */}
          {inactivityStatus !== 'ok' && (
            <InactivityBanner
              status={inactivityStatus}
              buddyName={buddyName}
              onExit={handleExit}
              partialXP={partialXP}
            />
          )}
        </ScrollView>

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  // No flex:1 on sheet per project memory constraint
  sheet: {
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.sm,
    paddingHorizontal: componentSpacing.modalPadding,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.dark.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  content: {
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...typography.headingMd,
    color: colors.dark.textPrimary,
  },
  buddyLabel: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
  },
  description: {
    ...typography.bodyMd,
    color: colors.dark.textSecondary,
    lineHeight: 22,
  },
  progressSection: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: colors.dark.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.dark.primary,
    borderRadius: 6,
  },
  progressLabel: {
    ...typography.bodyMd,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  myProgressSection: {
    backgroundColor: colors.dark.background,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    ...typography.bodySm,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  myProgressText: {
    ...typography.bodyMd,
    color: colors.dark.textPrimary,
  },
  markProgressBtn: {
    backgroundColor: colors.dark.primary,
    borderRadius: 10,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  markProgressBtnDone: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  markProgressText: {
    ...typography.bodyMd,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  markProgressTextDone: {
    color: colors.dark.textMuted,
  },
  timeText: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  xpBreakdown: {
    backgroundColor: colors.dark.background,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  xpLabel: {
    ...typography.bodySm,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  xpLine: {
    ...typography.bodyMd,
    color: colors.dark.textPrimary,
  },
  xpValue: {
    color: colors.dark.xp,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  xpNote: {
    ...typography.bodySm,
    color: colors.dark.textMuted,
  },
  closeBtn: {
    marginTop: spacing.sm,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    minHeight: 48,
    justifyContent: 'center',
  },
  closeBtnText: {
    ...typography.bodyMd,
    color: colors.dark.textSecondary,
  },
});
