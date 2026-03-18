/**
 * MergeChoiceSheet — modal bottom sheet for account creation merge decision.
 *
 * Two options:
 *   - "Keep My Progress" → signUp(email, password, keepProgress=true)
 *   - "Start Fresh"      → signUp(email, password, keepProgress=false)
 *
 * Props:
 *   email, password  — credentials to pass to signUp
 *   onSuccess(userId) — called after signUp completes
 *   onError(msg)      — called on error
 *   onDismiss         — close the sheet without signing up
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '../../tokens';
import { signUp } from '../../services/auth-service';

interface MergeChoiceSheetProps {
  visible: boolean;
  email: string;
  password: string;
  onSuccess: (userId: string) => void;
  onError: (message: string) => void;
  onDismiss: () => void;
}

export function MergeChoiceSheet({
  visible,
  email,
  password,
  onSuccess,
  onError,
  onDismiss,
}: MergeChoiceSheetProps) {
  const [loading, setLoading] = useState(false);

  const handleChoice = async (keepProgress: boolean) => {
    setLoading(true);
    const { userId, error } = await signUp(email, password, keepProgress);
    setLoading(false);

    if (error) {
      onError(error);
    } else if (userId) {
      onSuccess(userId);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={onDismiss} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Back Up Your Progress?</Text>
        <Text style={styles.body}>
          You've built discipline worth keeping. Choose how you'd like to start your account.
        </Text>

        {/* Keep My Progress option */}
        <Pressable
          style={[styles.option, styles.optionPrimary]}
          onPress={() => handleChoice(true)}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Keep My Progress"
        >
          <Text style={styles.optionPrimaryLabel}>Keep My Progress</Text>
          <Text style={styles.optionDesc}>
            Your habits, streaks, and XP carry over to your new account.
          </Text>
        </Pressable>

        {/* Start Fresh option */}
        <Pressable
          style={[styles.option, styles.optionSecondary]}
          onPress={() => handleChoice(false)}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Start Fresh"
        >
          <Text style={styles.optionSecondaryLabel}>Start Fresh</Text>
          <Text style={styles.optionDescMuted}>
            Begin your journey clean. Your local data stays on this device.
          </Text>
        </Pressable>

        {loading && (
          <ActivityIndicator
            color={colors.dark.primary}
            style={styles.loader}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24, // modalPadding
    gap: 16, // modalElementGap
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dark.border,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: 'Inter-SemiBold',
    color: colors.dark.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  body: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  option: {
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 72,
    justifyContent: 'center',
  },
  optionPrimary: {
    backgroundColor: colors.dark.primary,
  },
  optionSecondary: {
    backgroundColor: colors.dark.background,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  optionPrimaryLabel: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionSecondaryLabel: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: 'Inter-SemiBold',
    color: colors.dark.textPrimary,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: 'rgba(255,255,255,0.75)',
  },
  optionDescMuted: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textMuted,
  },
  loader: {
    marginTop: spacing.sm,
  },
});
