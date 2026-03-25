/**
 * EnterCodeSheet — bottom sheet for buddy code entry.
 *
 * Per UI-SPEC S-04:
 *   - headingMd: "Enter Buddy Code"
 *   - TextInput: centered, large monospace, auto-uppercase, max 7 chars (HH-XXXX)
 *   - "Send Request" button: emerald, disabled until valid /^HH-[A-Z0-9]{4,5}$/
 *   - Error states: bodySm, destructive color, solution-focused copy
 *
 * Error copy per UI-SPEC:
 *   not_found: "Code not found — check for typos and try again"
 *   expired: "Code has expired — ask your buddy to share a new invite"
 *   rate_limited: "You have 10 pending requests. Wait for responses before sending more."
 *   max_buddies: "You've reached the 20 buddy limit. Remove a connection to add more."
 *   blocked: "Unable to connect with this user."
 *
 * Per project memory: do NOT add flex:1 to Modal children.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { spacing, componentSpacing } from '../../tokens/spacing';
import type { EnterCodeResult } from '../../stores/buddyStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnterCodeSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<EnterCodeResult>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CODE_PATTERN = /^HH-[A-Z0-9]{4,5}$/;

const ERROR_MESSAGES: Record<string, string> = {
  not_found: 'Code not found — check for typos and try again',
  expired: 'Code has expired — ask your buddy to share a new invite',
  rate_limited: 'You have 10 pending requests. Wait for responses before sending more.',
  max_buddies: "You've reached the 20 buddy limit. Remove a connection to add more.",
  blocked: 'Unable to connect with this user.',
  already_connected: 'You are already connected with this user.',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function EnterCodeSheet({ visible, onClose, onSubmit }: EnterCodeSheetProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset state when sheet is opened
  useEffect(() => {
    if (visible) {
      setInput('');
      setError(null);
      setSubmitting(false);
      setSuccess(false);
    }
  }, [visible]);

  const handleChangeText = useCallback((text: string) => {
    const upper = text.toUpperCase();
    setInput(upper);
    setError(null);
  }, []);

  const isValid = CODE_PATTERN.test(input);

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await onSubmit(input);
      if (result === 'success') {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setError(ERROR_MESSAGES[result] ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [isValid, submitting, input, onSubmit, onClose]);

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

      {/* Sheet — NO flex:1 per project memory */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Heading */}
        <Text style={styles.heading}>Enter Buddy Code</Text>

        {/* Code input */}
        <TextInput
          style={styles.codeInput}
          value={input}
          onChangeText={handleChangeText}
          placeholder="HH-XXXX"
          placeholderTextColor={colors.dark.textMuted}
          autoCapitalize="characters"
          maxLength={7}
          keyboardType="default"
          autoCorrect={false}
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
          accessibilityLabel="Enter buddy invite code"
          editable={!submitting && !success}
        />

        {/* Error message */}
        {error != null && (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        )}

        {/* Success indicator */}
        {success && (
          <Text style={styles.successText} accessibilityRole="alert">
            Request sent! Waiting for them to accept.
          </Text>
        )}

        {/* Send Request button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!isValid || submitting || success) && styles.sendButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isValid || submitting || success}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Send Request"
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    paddingBottom: componentSpacing.modalPadding + (Platform.OS === 'ios' ? 20 : 0),
    alignItems: 'center',
    gap: componentSpacing.modalElementGap,
    // No flex:1 — avoids Modal layout collapse (per project memory)
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dark.textMuted,
    opacity: 0.4,
    marginBottom: spacing.sm,
  },
  heading: {
    ...typography.headingMd,
    color: colors.dark.textPrimary,
    textAlign: 'center',
  },
  codeInput: {
    width: '100%',
    backgroundColor: colors.dark.background,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: colors.dark.textPrimary,
    letterSpacing: 4,
    textAlign: 'center',
    minHeight: 64,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  errorText: {
    ...typography.bodySm,
    color: colors.dark.error,
    textAlign: 'center',
    width: '100%',
  },
  successText: {
    ...typography.bodySm,
    color: colors.dark.success,
    textAlign: 'center',
    width: '100%',
  },
  sendButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: 10,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    ...typography.bodyMd,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
