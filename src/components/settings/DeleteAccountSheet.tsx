/**
 * DeleteAccountSheet — two-step destructive confirmation modal.
 *
 * Copy follows adab-safe guidelines:
 *   - "Delete Everything" (not "Confirm") for legibility beyond color
 *   - "Keep My Account" (not "Cancel") — specific, respectful label
 *   - No shame language. No streak-loss framing.
 *
 * On confirm: calls deleteAccount(userId), then navigates to onboarding.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../../tokens';
import { useAuthStore } from '../../stores/authStore';
import { deleteAccount } from '../../services/auth-service';

interface DeleteAccountSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

export function DeleteAccountSheet({ visible, onDismiss }: DeleteAccountSheetProps) {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await deleteAccount(userId);
    setLoading(false);

    if (error) {
      Alert.alert(
        'Could Not Delete Account',
        'Something went wrong. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    } else {
      onDismiss();
      router.replace('/(onboarding)' as any);
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

        <Text style={styles.title}>Delete Everything?</Text>
        <Text style={styles.body}>
          This permanently erases your account and all progress on this device and our servers. Your journey cannot be recovered.
        </Text>

        {/* Destructive action */}
        <Pressable
          style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Delete Everything"
          accessibilityHint="Permanently deletes your account and all data"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete Everything</Text>
          )}
        </Pressable>

        {/* Cancel — "Keep My Account" per UI-SPEC */}
        <Pressable
          style={styles.keepButton}
          onPress={onDismiss}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Keep My Account"
        >
          <Text style={styles.keepButtonText}>Keep My Account</Text>
        </Pressable>
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
    fontFamily: 'Inter-Bold',
    color: colors.dark.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: colors.dark.error,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  keepButton: {
    backgroundColor: colors.dark.background,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  keepButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: 'Inter-SemiBold',
    color: colors.dark.textPrimary,
    fontWeight: '600',
  },
});
