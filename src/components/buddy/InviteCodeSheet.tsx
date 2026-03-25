/**
 * InviteCodeSheet — bottom sheet for invite code generation and sharing.
 *
 * Per UI-SPEC S-03:
 *   - headingMd: "Share Your Invite Code"
 *   - Large monospace code display (headingXl, 28px)
 *   - bodySm: "Expires in {time}" computed from code creation time
 *   - "Share Code" CTA (emerald, full-width) — native share sheet
 *   - "or tap code to copy" — copies to clipboard via expo-clipboard
 *
 * Per project memory: do NOT add flex:1 to Modal children.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Share,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { spacing, componentSpacing } from '../../tokens/spacing';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InviteCodeSheetProps {
  visible: boolean;
  onClose: () => void;
  /** The invite code to display (null while generating) */
  code: string | null;
  /** Called when sheet opens and needs to generate a new code */
  onGenerate: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compute "Expires in Xh Ym" text. Codes expire 48h from creation. */
function computeExpiry(code: string | null): string {
  if (!code) return '';
  // Codes are single-use — we show a fixed 48h window from generation.
  // Since we don't track creation time here, show a static label.
  return 'Expires in 48 hours';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InviteCodeSheet({ visible, onClose, code, onGenerate }: InviteCodeSheetProps) {
  const [copied, setCopied] = useState(false);

  // Generate code when sheet opens with no code
  useEffect(() => {
    if (visible && !code) {
      onGenerate();
    }
  }, [visible, code, onGenerate]);

  // Reset copied state when sheet closes
  useEffect(() => {
    if (!visible) {
      setCopied(false);
    }
  }, [visible]);

  const handleShare = useCallback(async () => {
    if (!code) return;
    try {
      await Share.share({
        message: `Join me on HalalHabits! Use code: ${code}`,
      });
    } catch {
      // User cancelled or share failed — no-op
    }
  }, [code]);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

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
        <Text style={styles.heading}>Share Your Invite Code</Text>

        {/* Code display */}
        <Pressable
          style={styles.codeContainer}
          onPress={handleCopy}
          accessibilityRole="button"
          accessibilityLabel={code ? `Invite code ${code}, tap to copy` : 'Generating code'}
        >
          {code ? (
            <Text style={styles.codeText}>{code}</Text>
          ) : (
            <Text style={styles.codeLoading}>Generating...</Text>
          )}
        </Pressable>

        {/* Expiry label */}
        {code && (
          <Text style={styles.expiry}>{computeExpiry(code)}</Text>
        )}

        {/* Share button */}
        <TouchableOpacity
          style={[styles.shareButton, !code && styles.shareButtonDisabled]}
          onPress={handleShare}
          disabled={!code}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Share Code"
        >
          <Text style={styles.shareButtonText}>Share Code</Text>
        </TouchableOpacity>

        {/* Copy fallback */}
        <TouchableOpacity
          onPress={handleCopy}
          disabled={!code}
          accessibilityRole="button"
          accessibilityLabel="Tap code to copy"
          style={styles.copyLinkContainer}
        >
          <Text style={[styles.copyLink, !code && { opacity: 0.5 }]}>
            {copied ? 'Copied!' : 'or tap code to copy'}
          </Text>
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
  codeContainer: {
    backgroundColor: colors.dark.background,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    width: '100%',
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: colors.dark.textPrimary,
    letterSpacing: 4,
    textAlign: 'center',
  },
  codeLoading: {
    ...typography.bodyMd,
    color: colors.dark.textMuted,
    textAlign: 'center',
  },
  expiry: {
    ...typography.bodySm,
    color: colors.dark.textMuted,
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: 10,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareButtonText: {
    ...typography.bodyMd,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  copyLinkContainer: {
    paddingVertical: spacing.xs,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyLink: {
    ...typography.bodySm,
    color: colors.dark.primary,
    textDecorationLine: 'underline',
  },
});
