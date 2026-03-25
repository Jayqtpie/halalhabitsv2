/**
 * ConfirmActionSheet — reusable confirmation bottom sheet for remove/block actions.
 *
 * Per D-10: buddy profile includes Remove and Block actions.
 * Per project memory: do NOT add flex:1 to children inside a Modal.
 *
 * Copywriting contract (from UI-SPEC):
 *   Remove: title="Remove {username}?", body="You can always reconnect later."
 *   Block:  title="Block {username}?",  body="They won't be able to find or message you." (destructive=true)
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { componentSpacing, spacing } from '../../tokens/spacing';

interface ConfirmActionSheetProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** When true, the confirm button uses the error/destructive color (#9B1B30). */
  destructive?: boolean;
}

export function ConfirmActionSheet({
  visible,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmActionSheetProps) {
  const confirmBg = destructive ? colors.dark.error : colors.dark.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      {/* Backdrop — tap to cancel */}
      <Pressable style={styles.backdrop} onPress={onCancel} />

      {/* Sheet */}
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

        <View style={styles.buttonStack}>
          {/* Confirm */}
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: confirmBg }]}
            onPress={onConfirm}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
          >
            <Text style={styles.confirmLabel}>{confirmLabel}</Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: componentSpacing.modalPadding,
    // No flex:1 — avoids Modal layout collapse (per project memory)
  },
  title: {
    ...typography.headingMd,
    color: colors.dark.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodyMd,
    color: colors.dark.textSecondary,
    marginBottom: componentSpacing.modalElementGap,
    lineHeight: 22,
  },
  buttonStack: {
    gap: spacing.sm,
  },
  confirmButton: {
    borderRadius: 10,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  confirmLabel: {
    ...typography.bodyMd,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: componentSpacing.buttonPaddingVertical,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelLabel: {
    ...typography.bodyMd,
    color: colors.dark.textMuted,
  },
});
