/**
 * EarlyExitConfirmation — modal dialog shown when player taps "Exit Early"
 * during an active Dopamine Detox session.
 *
 * Uses compassionate mentor voice — no shame copy, no guilt framing.
 * "Keep Going" is the visually dominant choice (right position, accent fill).
 * "Exit Dungeon" is destructive outline (left position).
 *
 * XP penalty amount is shown in error color (#9B1B30).
 * Body copy uses warm compassion tone as specified in UI-SPEC Copywriting Contract.
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, componentSpacing, radius } from '../../tokens';

// ─── Component ───────────────────────────────────────────────────────────────

interface EarlyExitConfirmationProps {
  visible: boolean;
  /** XP penalty amount if player exits now */
  penaltyXP: number;
  /** Called when player confirms they want to exit early */
  onConfirmExit: () => void;
  /** Called when player chooses to keep going */
  onCancel: () => void;
}

export function EarlyExitConfirmation({
  visible,
  penaltyXP,
  onConfirmExit,
  onCancel,
}: EarlyExitConfirmationProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal={true}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {/* Title */}
          <Text style={styles.title}>Leave the Dungeon Early?</Text>

          {/* Body — compassionate mentor voice */}
          <Text style={styles.body}>
            Leaving now costs{' '}
            <Text style={styles.penaltyAmount}>{penaltyXP} XP</Text>
            {', but your courage in starting still counts. Your habit streaks are already protected for this window.'}
          </Text>

          {/* Button row: Exit (left, destructive) + Keep Going (right, dominant) */}
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.exitButton}
              onPress={onConfirmExit}
              accessibilityRole="button"
              accessibilityLabel="Exit Dungeon"
              android_ripple={{ color: 'rgba(155,27,48,0.2)' }}
            >
              <Text style={styles.exitButtonText}>Exit Dungeon</Text>
            </Pressable>

            <Pressable
              style={styles.keepGoingButton}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Keep Going"
              android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
            >
              <Text style={styles.keepGoingButtonText}>Keep Going</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.lg,
    padding: componentSpacing.modalPadding,
    width: '100%',
    gap: componentSpacing.modalElementGap,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },

  title: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },

  body: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary,
  },

  penaltyAmount: {
    color: colors.dark.error,
    fontWeight: '700',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  // Exit Dungeon — destructive outline (left, secondary visual weight)
  exitButton: {
    flex: 1,
    minHeight: 44,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    fontWeight: '600',
    color: colors.dark.error,
  },

  // Keep Going — accent fill (right, visually dominant per D-09)
  keepGoingButton: {
    flex: 1,
    minHeight: 44,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepGoingButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
});
