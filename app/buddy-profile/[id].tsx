/**
 * Buddy Profile Screen — /buddy-profile/[id]
 *
 * Displays a buddy's public RPG character sheet: avatar, identity title,
 * stat grid (Level, XP Total, Current Streak, Days Connected), online status,
 * and a three-dot menu for Remove / Block actions.
 *
 * Privacy: Only public progress data (XP, level, streak, title) is shown.
 * Worship details (salah logs, Muhasabah entries) are never exposed here.
 * Privacy notice "Only public progress is shared" is always visible.
 *
 * Per D-09: feels like viewing a friend's RPG character sheet.
 * Per D-04: blocking is silent — no indication to the blocked user.
 * Per D-08: push navigation from buddy list.
 * Per D-10: remove/block via three-dot menu with ConfirmActionSheet.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBuddyStore } from '../../src/stores/buddyStore';
import { useAuthStore } from '../../src/stores/authStore';
import { getBuddyId } from '../../src/domain/buddy-engine';
import { TITLE_SEED_DATA } from '../../src/domain/title-seed-data';
import { BuddyProfileCard } from '../../src/components/buddy/BuddyProfileCard';
import { OnlineStatusDot, type OnlineStatus } from '../../src/components/buddy/OnlineStatusDot';
import { ConfirmActionSheet } from '../../src/components/buddy/ConfirmActionSheet';
import { colors, palette } from '../../src/tokens/colors';
import { typography } from '../../src/tokens/typography';
import { componentSpacing, spacing } from '../../src/tokens/spacing';
import type { PublicBuddyProfile } from '../../src/db/repos/buddyRepo';
import type { Buddy } from '../../src/types/database';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive a consistent avatar background color from a display name. */
function avatarColorFromName(name: string): string {
  const COLORS = [
    palette['emerald-800'],
    palette['sapphire-800'],
    palette['ruby-500'],
    palette['gold-700'],
    palette['surface-700'],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffff;
  }
  return COLORS[hash % COLORS.length];
}

/** Resolve activeTitleId to a display name. Falls back to "Adventurer". */
function resolveTitleName(activeTitleId: string | null): string {
  if (!activeTitleId) return 'Adventurer';
  const entry = TITLE_SEED_DATA.find((t) => t.id === activeTitleId);
  return entry?.name ?? 'Adventurer';
}

/** Format a number with comma thousands separators. */
function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** Compute days connected from acceptedAt timestamp. */
function computeDaysConnected(acceptedAt: string | null): number {
  if (!acceptedAt) return 0;
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(acceptedAt).getTime()) / (24 * 60 * 60 * 1000)),
  );
}

/** Determine online status from lastActiveAt ISO timestamp (15-minute window). */
function computeOnlineStatus(lastActiveAt: string | null): { status: OnlineStatus; label: string } {
  if (!lastActiveAt) return { status: 'offline', label: 'Offline' };
  const diffMs = Date.now() - new Date(lastActiveAt).getTime();
  if (diffMs <= 15 * 60 * 1000) {
    return { status: 'online', label: 'Online' };
  }
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return { status: 'offline', label: `Active ${diffHours}h ago` };
  }
  const diffDays = Math.floor(diffHours / 24);
  return { status: 'offline', label: `Active ${diffDays}d ago` };
}

// ---------------------------------------------------------------------------
// Screen Component
// ---------------------------------------------------------------------------

type ActionSheet = 'remove' | 'block' | null;

export default function BuddyProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const userId = useAuthStore((s) => s.userId);
  const accepted = useBuddyStore((s) => s.accepted);
  const getBuddyProfile = useBuddyStore((s) => s.getBuddyProfile);
  const removeBuddy = useBuddyStore((s) => s.removeBuddy);
  const blockBuddy = useBuddyStore((s) => s.blockBuddy);

  const [profile, setProfile] = useState<PublicBuddyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [actionSheet, setActionSheet] = useState<ActionSheet>(null);

  // Find the buddy row from the accepted list using the route param id
  const buddyRow: Buddy | undefined = accepted.find((b) => b.id === id);

  // Resolve the other user's ID from the buddy pair
  const buddyUserId = buddyRow
    ? getBuddyId(buddyRow.userA, buddyRow.userB, userId)
    : null;

  // ---------------------------------------------------------------------------
  // Load profile on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!buddyUserId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await getBuddyProfile(buddyUserId);
        if (!cancelled) setProfile(result);
      } catch {
        // Graceful degradation — profile stays null, we show local data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [buddyUserId, getBuddyProfile]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleRemoveConfirm = useCallback(async () => {
    if (!buddyRow) return;
    setActionSheet(null);
    await removeBuddy(buddyRow.id, userId);
    router.back();
  }, [buddyRow, userId, removeBuddy]);

  const handleBlockConfirm = useCallback(async () => {
    if (!buddyRow) return;
    setActionSheet(null);
    await blockBuddy(buddyRow.id, userId, buddyRow);
    router.back();
  }, [buddyRow, userId, blockBuddy]);

  // ---------------------------------------------------------------------------
  // Derived display values
  // ---------------------------------------------------------------------------

  const displayName = profile?.displayName ?? buddyUserId ?? 'Buddy';
  const currentLevel = profile?.currentLevel ?? 1;
  const totalXp = profile?.totalXp ?? 0;
  const currentStreakCount = profile?.currentStreakCount ?? 0;
  const activeTitleId = profile?.activeTitleId ?? null;
  const lastActiveAt = profile?.lastActiveAt ?? null;

  const titleName = resolveTitleName(activeTitleId);
  const daysConnected = computeDaysConnected(buddyRow?.acceptedAt ?? null);
  const { status: onlineStatus, label: onlineLabel } = computeOnlineStatus(lastActiveAt);
  const avatarBg = avatarColorFromName(displayName);
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.headerName} numberOfLines={1}>
          {displayName}
        </Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setMenuVisible(true)}
          accessibilityLabel="Buddy actions menu"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.headerIcon}>{'...'}</Text>
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={colors.dark.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </View>
          </View>

          {/* Identity Title */}
          <Text style={styles.identityTitle}>{titleName}</Text>

          {/* Online Status */}
          <View style={styles.statusRow}>
            <OnlineStatusDot status={onlineStatus} label={onlineLabel} />
          </View>

          {/* Stats Grid — 2x2 */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statCell}>
                <BuddyProfileCard label="Level" value={currentLevel} />
              </View>
              <View style={styles.statCell}>
                <BuddyProfileCard
                  label="Total XP"
                  value={formatNumber(totalXp)}
                  valueColor={colors.dark.xp}
                />
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCell}>
                <BuddyProfileCard label="Current Streak" value={currentStreakCount} />
              </View>
              <View style={styles.statCell}>
                <BuddyProfileCard label="Connected" value={`${daysConnected} days`} />
              </View>
            </View>
          </View>

          {/* Privacy Notice */}
          <Text style={styles.privacyNotice}>Only public progress is shared</Text>
        </ScrollView>
      )}

      {/* Three-dot action menu (simple modal dropdown) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)} />
        <View style={[styles.menuSheet, { top: insets.top + 56 }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              setActionSheet('remove');
            }}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${displayName}`}
          >
            <Text style={styles.menuItemText}>Remove</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              setActionSheet('block');
            }}
            accessibilityRole="button"
            accessibilityLabel={`Block ${displayName}`}
          >
            <Text style={[styles.menuItemText, styles.menuItemDestructive]}>Block</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Remove confirmation */}
      <ConfirmActionSheet
        visible={actionSheet === 'remove'}
        title={`Remove ${displayName}?`}
        body="You can always reconnect later."
        confirmLabel="Remove"
        onConfirm={handleRemoveConfirm}
        onCancel={() => setActionSheet(null)}
      />

      {/* Block confirmation */}
      <ConfirmActionSheet
        visible={actionSheet === 'block'}
        title={`Block ${displayName}?`}
        body="They won't be able to find or message you."
        confirmLabel="Block"
        onConfirm={handleBlockConfirm}
        onCancel={() => setActionSheet(null)}
        destructive
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    minHeight: 56,
  },
  headerBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    ...typography.bodyMd,
    color: colors.dark.textPrimary,
    fontWeight: '700',
  },
  headerName: {
    flex: 1,
    ...typography.headingMd,
    color: colors.dark.textPrimary,
    textAlign: 'center',
  },

  // Loading
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },

  // Avatar
  avatarSection: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    ...typography.headingXl,
    color: '#FFFFFF',
    lineHeight: undefined,
  },

  // Identity Title
  identityTitle: {
    ...typography.hudXp,
    color: colors.dark.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  // Online Status
  statusRow: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },

  // Stats Grid
  statsGrid: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCell: {
    flex: 1,
  },

  // Privacy Notice
  privacyNotice: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Three-dot dropdown menu
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuSheet: {
    position: 'absolute',
    right: spacing.md,
    backgroundColor: colors.dark.surface,
    borderRadius: 10,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  menuItemText: {
    ...typography.bodyMd,
    color: colors.dark.textPrimary,
  },
  menuItemDestructive: {
    color: colors.dark.error,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.dark.border,
  },
});
