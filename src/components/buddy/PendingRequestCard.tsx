/**
 * PendingRequestCard — buddy card variant for incoming pending requests.
 *
 * Shows avatar, username, and Accept / Decline action buttons.
 * Per D-05: pending requests section at top of buddy list.
 *
 * Accept button: emerald background (#0D7C3D), white text.
 * Decline button: transparent background, muted text.
 *
 * Both buttons meet 44px minimum touch target.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { componentSpacing, spacing } from '../../tokens/spacing';
import type { Buddy } from '../../types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingRequestCardProps {
  buddy: Buddy;
  /** Display name of the requesting user (resolved from buddyProfile) */
  displayName?: string;
  onAccept: () => void;
  onDecline: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PendingRequestCard({
  buddy,
  displayName,
  onAccept,
  onDecline,
}: PendingRequestCardProps) {
  const name = displayName ?? 'Unknown User';
  const avatarLetter = name.charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.card}>
      {/* Top row: avatar + name */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{avatarLetter}</Text>
        </View>
        <View style={styles.nameWrap}>
          <Text style={styles.username} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.requestLabel}>wants to connect</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.acceptButton, pressed && { opacity: 0.8 }]}
          onPress={onAccept}
          accessibilityRole="button"
          accessibilityLabel={`Accept buddy request from ${name}`}
        >
          <Text style={styles.acceptText}>Accept Request</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.declineButton, pressed && { opacity: 0.6 }]}
          onPress={onDecline}
          accessibilityRole="button"
          accessibilityLabel={`Decline buddy request from ${name}`}
        >
          <Text style={styles.declineText}>Decline Request</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: componentSpacing.cardPadding,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: {
    ...typography.headingMd,
    color: '#FFFFFF',
    lineHeight: undefined,
  },
  nameWrap: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  username: {
    ...typography.bodyMd,
    color: colors.dark.textPrimary,
  },
  requestLabel: {
    ...typography.bodySm,
    color: colors.dark.textMuted,
  },
  actions: {
    gap: spacing.xs,
  },
  acceptButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  acceptText: {
    ...typography.bodyMd,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  declineButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  declineText: {
    ...typography.bodyMd,
    color: colors.dark.textMuted,
  },
});
