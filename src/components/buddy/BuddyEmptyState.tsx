/**
 * BuddyEmptyState — shown when a user has no buddies and no pending requests.
 *
 * Per D-07 and UI-SPEC S-01:
 *   - 120x120px pixel-art placeholder (gray rounded rect — real asset in future phase)
 *   - headingXl: "Accountability starts with one connection"
 *   - bodyMd: "Invite a friend or enter their code to get started"
 *   - Two CTAs: "Invite a Buddy" (emerald filled), "Enter Code" (emerald outlined)
 *
 * Warm mentor voice. No shame copy.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { spacing, componentSpacing } from '../../tokens/spacing';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuddyEmptyStateProps {
  onInvite: () => void;
  onEnterCode: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BuddyEmptyState({ onInvite, onEnterCode }: BuddyEmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* Pixel-art placeholder illustration */}
      <View
        style={styles.illustration}
        accessibilityLabel="Two characters standing together"
        accessibilityRole="image"
      >
        {/* Left character */}
        <View style={styles.characterLeft} />
        {/* Right character */}
        <View style={styles.characterRight} />
      </View>

      {/* Heading */}
      <Text style={styles.heading}>
        Accountability starts with one connection
      </Text>

      {/* Body */}
      <Text style={styles.body}>
        Invite a friend or enter their code to get started
      </Text>

      {/* CTAs */}
      <View style={styles.buttonStack}>
        <Pressable
          style={({ pressed }) => [styles.inviteButton, pressed && { opacity: 0.8 }]}
          onPress={onInvite}
          accessibilityRole="button"
          accessibilityLabel="Invite a Buddy"
        >
          <Text style={styles.inviteButtonText}>Invite a Buddy</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.enterCodeButton, pressed && { opacity: 0.7 }]}
          onPress={onEnterCode}
          accessibilityRole="button"
          accessibilityLabel="Enter Code"
        >
          <Text style={styles.enterCodeButtonText}>Enter Code</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: componentSpacing.modalElementGap,
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: colors.dark.surface,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  // Pixel-art placeholder characters (gray rounded rects)
  characterLeft: {
    width: 32,
    height: 56,
    backgroundColor: colors.dark.textMuted,
    borderRadius: 4,
    opacity: 0.6,
  },
  characterRight: {
    width: 32,
    height: 64,
    backgroundColor: colors.dark.textSecondary,
    borderRadius: 4,
    opacity: 0.6,
  },
  heading: {
    ...typography.headingXl,
    color: colors.dark.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  body: {
    ...typography.bodyMd,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonStack: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  inviteButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  inviteButtonText: {
    ...typography.bodyMd,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  enterCodeButton: {
    borderWidth: 1.5,
    borderColor: colors.dark.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  enterCodeButtonText: {
    ...typography.bodyMd,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: colors.dark.primary,
  },
});
