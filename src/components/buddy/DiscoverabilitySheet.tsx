/**
 * DiscoverabilitySheet — one-time bottom sheet for discoverability opt-in.
 *
 * Per D-11 and UI-SPEC S-05:
 * Shown once on first buddy tab visit (if discoverability not yet set).
 *
 *   - headingMd: "Want others to find you?"
 *   - bodyMd: "When enabled, other players can search for you by username.
 *             You can change this anytime in Settings."
 *   - "Enable Search" button (emerald filled)
 *   - "Keep Private" button (gray outlined)
 *
 * Privacy-first: defaults to not discoverable. Both actions dismiss the sheet
 * and save preference to prevent re-showing.
 *
 * Per project memory: do NOT add flex:1 to Modal children.
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { spacing, componentSpacing } from '../../tokens/spacing';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiscoverabilitySheetProps {
  visible: boolean;
  onEnable: () => void;
  onKeepPrivate: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DiscoverabilitySheet({
  visible,
  onEnable,
  onKeepPrivate,
}: DiscoverabilitySheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onKeepPrivate}
      statusBarTranslucent
    >
      {/* Backdrop — tap to keep private (privacy-first default) */}
      <Pressable style={styles.backdrop} onPress={onKeepPrivate} />

      {/* Sheet — NO flex:1 per project memory */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Heading */}
        <Text style={styles.heading}>Want others to find you?</Text>

        {/* Body */}
        <Text style={styles.body}>
          When enabled, other players can search for you by username. You can change this anytime in Settings.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonStack}>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={onEnable}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Enable Search"
          >
            <Text style={styles.enableButtonText}>Enable Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.privateButton}
            onPress={onKeepPrivate}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Keep Private"
          >
            <Text style={styles.privateButtonText}>Keep Private</Text>
          </TouchableOpacity>
        </View>
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
    gap: componentSpacing.modalElementGap,
    // No flex:1 — avoids Modal layout collapse (per project memory)
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dark.textMuted,
    opacity: 0.4,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  heading: {
    ...typography.headingMd,
    color: colors.dark.textPrimary,
  },
  body: {
    ...typography.bodyMd,
    color: colors.dark.textSecondary,
    lineHeight: 22,
  },
  buttonStack: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  enableButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: 10,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  enableButtonText: {
    ...typography.bodyMd,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  privateButton: {
    borderWidth: 1.5,
    borderColor: colors.dark.textMuted,
    borderRadius: 10,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  privateButtonText: {
    ...typography.bodyMd,
    color: colors.dark.textSecondary,
  },
});
