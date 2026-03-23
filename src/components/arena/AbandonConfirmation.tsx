/**
 * AbandonConfirmation — two-tap confirmation modal for abandoning a boss battle.
 *
 * Sibling Modal pattern (same as EarlyExitConfirmation.tsx).
 * Shows partial XP earned and damage dealt so far — positive XP framing,
 * no shame or guilt copy (adab-safe per Mercy Mode contract).
 *
 * Two buttons:
 *   - "Yes, Abandon" — ruby-500 background, destructive but earns partial XP
 *   - "Keep Fighting" — emerald border, preferred positive action
 *
 * All touch targets meet 52px height (exceeds 44px minimum).
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface AbandonConfirmationProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Percentage of boss HP dealt so far (0–100) */
  damagePercent: number;
  /** XP that will be awarded on abandon */
  partialXp: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AbandonConfirmation({
  visible,
  onConfirm,
  onCancel,
  damagePercent,
  partialXp,
}: AbandonConfirmationProps) {
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
          {/* Heading */}
          <Text style={styles.title}>Abandon Battle</Text>

          {/* Body — partial XP framing, no guilt */}
          <Text style={styles.body}>
            If you abandon now, you&apos;ll earn partial XP for the damage dealt. Are you sure?
          </Text>

          {/* XP preview */}
          <Text style={styles.xpPreview}>
            You&apos;ve dealt {damagePercent}% damage — {partialXp} XP earned
          </Text>

          {/* Button stack */}
          <View style={styles.buttonStack}>
            <Pressable
              style={styles.confirmButton}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="Yes, Abandon"
              android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
            >
              <Text style={styles.confirmButtonText}>Yes, Abandon</Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Keep Fighting"
              android_ripple={{ color: 'rgba(13,124,61,0.2)' }}
            >
              <Text style={styles.cancelButtonText}>Keep Fighting</Text>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
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

  xpPreview: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.xp, // gold-500
  },

  buttonStack: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  // "Yes, Abandon" — ruby-500 background, white text, destructive
  confirmButton: {
    height: 52,
    backgroundColor: colors.dark.error, // ruby-500 #9B1B30
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
  },
  confirmButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },

  // "Keep Fighting" — emerald border, emerald text, surface background
  cancelButton: {
    height: 52,
    backgroundColor: colors.dark.surface,
    borderWidth: 1.5,
    borderColor: colors.dark.primary, // emerald-500
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
  },
  cancelButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.primary, // emerald-500
  },
});
