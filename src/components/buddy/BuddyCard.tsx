/**
 * BuddyCard — pressable row component for buddy list entries.
 *
 * Shows: avatar circle (44x44) with first-letter fallback, username,
 * online status dot, and streak count.
 *
 * Per D-05: simple vertical list of buddy cards — avatar/initial,
 * username, online status dot, streak count.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { OnlineStatusDot } from './OnlineStatusDot';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { componentSpacing, spacing } from '../../tokens/spacing';
import type { Buddy } from '../../types/database';
import type { PublicBuddyProfile } from '../../db/repos/buddyRepo';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuddyCardProps {
  buddy: Buddy;
  buddyProfile?: PublicBuddyProfile;
  onPress: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ONLINE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

function computeStatus(lastActiveAt: string | null): { status: 'online' | 'offline'; label: string } {
  if (!lastActiveAt) {
    return { status: 'offline', label: 'Offline' };
  }
  const diffMs = Date.now() - new Date(lastActiveAt).getTime();
  if (diffMs < ONLINE_THRESHOLD_MS) {
    return { status: 'online', label: 'Online' };
  }
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffMinutes < 60) return { status: 'offline', label: `Active ${diffMinutes}m ago` };
  if (diffHours < 24) return { status: 'offline', label: `Active ${diffHours}h ago` };
  return { status: 'offline', label: `Active ${diffDays}d ago` };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BuddyCard({ buddy, buddyProfile, onPress }: BuddyCardProps) {
  const displayName = buddyProfile?.displayName ?? 'Unknown';
  const streakCount = buddyProfile?.currentStreakCount ?? 0;
  const lastActiveAt = buddyProfile?.lastActiveAt ?? null;
  const { status, label } = computeStatus(lastActiveAt);

  // First letter of display name for avatar fallback
  const avatarLetter = displayName.charAt(0).toUpperCase() || '?';

  const statusText = status === 'online' ? 'online' : 'offline';
  const accessibilityLabel = `${displayName}, ${statusText}, streak ${streakCount}`;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Avatar circle */}
      <View style={styles.avatar}>
        <Text style={styles.avatarLetter}>{avatarLetter}</Text>
      </View>

      {/* Info section */}
      <View style={styles.info}>
        <Text style={styles.username} numberOfLines={1}>
          {displayName}
        </Text>
        <OnlineStatusDot status={status} label={label} />
      </View>

      {/* Streak count */}
      <View style={styles.streak}>
        <Text style={styles.streakCount}>{streakCount}</Text>
        <Text style={styles.streakLabel}>streak</Text>
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: componentSpacing.cardPadding,
    gap: spacing.sm,
    minHeight: 72,
  },
  cardPressed: {
    opacity: 0.7,
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
  info: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  username: {
    ...typography.bodyMd,
    color: colors.dark.textPrimary,
  },
  streak: {
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 44,
  },
  streakCount: {
    ...typography.headingMd,
    color: colors.dark.xp,
    textAlign: 'center',
  },
  streakLabel: {
    ...typography.bodySm,
    color: colors.dark.textMuted,
    textAlign: 'center',
  },
});
