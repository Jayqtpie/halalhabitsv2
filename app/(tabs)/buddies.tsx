/**
 * Buddy List Tab Screen
 *
 * Primary screen for the Buddy Connection System (BUDY-01, 02, 03, 05).
 * Per UI-SPEC S-01:
 *   - Search bar at top (debounced 300ms via useRef + setTimeout)
 *   - Pending Requests section when pendingIncoming.length > 0
 *   - My Buddies FlatList with pull-to-refresh
 *   - Empty state when no buddies and no pending
 *   - InviteCodeSheet, EnterCodeSheet, DiscoverabilitySheet modals
 *   - Heartbeat on mount via sendHeartbeat
 *   - Discoverability prompt on first visit
 *
 * Per project memory: do NOT add flex:1 to Modal children.
 * Per CLAUDE.md: No shame copy, privacy-first.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBuddyStore } from '../../src/stores/buddyStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { colors, typography, spacing, componentSpacing } from '../../src/tokens';
import { BuddyCard } from '../../src/components/buddy/BuddyCard';
import { PendingRequestCard } from '../../src/components/buddy/PendingRequestCard';
import { BuddyEmptyState } from '../../src/components/buddy/BuddyEmptyState';
import { InviteCodeSheet } from '../../src/components/buddy/InviteCodeSheet';
import { EnterCodeSheet } from '../../src/components/buddy/EnterCodeSheet';
import { DiscoverabilitySheet } from '../../src/components/buddy/DiscoverabilitySheet';
import type { Buddy } from '../../src/types/database';
import type { PublicBuddyProfile } from '../../src/db/repos/buddyRepo';
import type { EnterCodeResult } from '../../src/stores/buddyStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derive the partner's user ID from a buddy row.
 * buddy.userA is the initiator; buddy.userB is the recipient.
 * The "other" user is whichever is not the current user.
 */
function getBuddyUserId(buddy: Buddy, currentUserId: string): string {
  return buddy.userA === currentUserId ? buddy.userB : buddy.userA;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BuddiesScreen() {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.userId);

  // Store state
  const {
    accepted,
    pendingIncoming,
    loading,
    lastGeneratedCode,
    loadBuddies,
    generateInviteCode,
    enterCode,
    acceptRequest,
    declineRequest,
    searchUsers,
    sendHeartbeat,
  } = useBuddyStore();

  const { discoverabilityPrompted, setDiscoverabilityPrompted } = useSettingsStore();

  // ── Modal visibility ──────────────────────────────────────────────
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [showEnterCodeSheet, setShowEnterCodeSheet] = useState(false);
  const [showDiscoverabilitySheet, setShowDiscoverabilitySheet] = useState(false);

  // ── Search state ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PublicBuddyProfile[]>([]);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Profile cache — maps buddyUserId -> PublicBuddyProfile ────────
  // In a real app this would come from the store; for now we load lazily.
  const [profileCache] = useState<Map<string, PublicBuddyProfile>>(new Map());

  // ── Mount effects ──────────────────────────────────────────────────

  useEffect(() => {
    loadBuddies(userId);
    sendHeartbeat(userId);
  }, [userId]);

  // Show discoverability prompt once on first visit
  useEffect(() => {
    if (!discoverabilityPrompted) {
      // Small delay to let the tab screen settle before showing prompt
      const timer = setTimeout(() => {
        setShowDiscoverabilitySheet(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [discoverabilityPrompted]);

  // ── Search handling ────────────────────────────────────────────────

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      if (!text.trim()) {
        setSearchResults([]);
        return;
      }
      searchDebounceRef.current = setTimeout(async () => {
        const results = await searchUsers(text.trim());
        setSearchResults(results);
      }, 300);
    },
    [searchUsers],
  );

  // ── Pull-to-refresh ───────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    await loadBuddies(userId);
    await sendHeartbeat(userId);
  }, [userId, loadBuddies, sendHeartbeat]);

  // ── Invite code ────────────────────────────────────────────────────

  const handleGenerateCode = useCallback(async () => {
    await generateInviteCode(userId);
  }, [userId, generateInviteCode]);

  // ── Enter code ─────────────────────────────────────────────────────

  const handleEnterCode = useCallback(
    async (code: string): Promise<EnterCodeResult> => {
      return enterCode(code, userId);
    },
    [userId, enterCode],
  );

  // ── Accept / Decline ───────────────────────────────────────────────

  const handleAccept = useCallback(
    async (buddyId: string) => {
      await acceptRequest(buddyId, userId);
    },
    [userId, acceptRequest],
  );

  const handleDecline = useCallback(
    async (buddyId: string) => {
      await declineRequest(buddyId, userId);
    },
    [userId, declineRequest],
  );

  // ── Discoverability ────────────────────────────────────────────────

  const handleDiscoverabilityEnable = useCallback(async () => {
    setDiscoverabilityPrompted(true);
    setShowDiscoverabilitySheet(false);
    // Best-effort Supabase update (non-fatal if offline)
    try {
      const { supabase, supabaseConfigured } = await import('../../src/lib/supabase');
      if (supabaseConfigured) {
        await supabase.from('users').update({ is_discoverable: true }).eq('id', userId);
      }
    } catch {
      // Offline — no-op, user can toggle in Settings later
    }
  }, [userId, setDiscoverabilityPrompted]);

  const handleDiscoverabilityKeepPrivate = useCallback(() => {
    setDiscoverabilityPrompted(true);
    setShowDiscoverabilitySheet(false);
  }, [setDiscoverabilityPrompted]);

  // ── Derived state ──────────────────────────────────────────────────

  const isSearchActive = searchQuery.trim().length > 0;
  const hasBuddies = accepted.length > 0;
  const hasPending = pendingIncoming.length > 0;
  const showEmptyState = !hasBuddies && !hasPending && !isSearchActive;

  // ── Render helpers ─────────────────────────────────────────────────

  const renderBuddyCard = useCallback(
    ({ item }: { item: Buddy }) => {
      const partnerUserId = getBuddyUserId(item, userId);
      const profile = profileCache.get(partnerUserId);
      return (
        <BuddyCard
          buddy={item}
          buddyProfile={profile}
          onPress={() => router.push(`/buddy-profile/${partnerUserId}`)}
        />
      );
    },
    [userId, profileCache],
  );

  const renderSearchResult = useCallback(
    ({ item }: { item: PublicBuddyProfile }) => (
      <TouchableOpacity
        style={styles.searchResultRow}
        onPress={() => router.push(`/buddy-profile/${item.id}`)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`View profile of ${item.displayName}`}
      >
        <View style={styles.searchResultAvatar}>
          <Text style={styles.searchResultAvatarLetter}>
            {item.displayName.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultName} numberOfLines={1}>
            {item.displayName}
          </Text>
          <Text style={styles.searchResultLevel}>Level {item.currentLevel}</Text>
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search bar */}
      <View style={styles.searchBarWrap}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by username..."
          placeholderTextColor={colors.dark.textMuted}
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search buddies by username"
        />
      </View>

      {/* Search results */}
      {isSearchActive ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: componentSpacing.listItemGap }} />}
          ListEmptyComponent={
            <View style={styles.emptySearch}>
              <Text style={styles.emptySearchText}>
                {searchQuery.length < 2
                  ? 'Type at least 2 characters to search'
                  : 'No users found'}
              </Text>
            </View>
          }
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={colors.dark.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Empty state */}
          {showEmptyState && (
            <BuddyEmptyState
              onInvite={() => setShowInviteSheet(true)}
              onEnterCode={() => setShowEnterCodeSheet(true)}
            />
          )}

          {/* Pending Requests section */}
          {hasPending && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>
                Pending Requests ({pendingIncoming.length})
              </Text>
              <View style={styles.cardList}>
                {pendingIncoming.map((buddy) => (
                  <PendingRequestCard
                    key={buddy.id}
                    buddy={buddy}
                    displayName={profileCache.get(getBuddyUserId(buddy, userId))?.displayName}
                    onAccept={() => handleAccept(buddy.id)}
                    onDecline={() => handleDecline(buddy.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* My Buddies section */}
          {hasBuddies && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>
                My Buddies ({accepted.length}/20)
              </Text>
              <View style={styles.cardList}>
                {accepted.map((buddy) => {
                  const partnerUserId = getBuddyUserId(buddy, userId);
                  const profile = profileCache.get(partnerUserId);
                  return (
                    <BuddyCard
                      key={buddy.id}
                      buddy={buddy}
                      buddyProfile={profile}
                      onPress={() => router.push(`/buddy-profile/${partnerUserId}`)}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* Bottom action buttons (shown when there are buddies or pending, not empty state) */}
          {!showEmptyState && (
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => setShowInviteSheet(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Invite a Buddy"
              >
                <Text style={styles.inviteButtonText}>Invite a Buddy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.enterCodeButton}
                onPress={() => setShowEnterCodeSheet(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Enter Code"
              >
                <Text style={styles.enterCodeButtonText}>Enter Code</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom safe area padding */}
          <View style={{ height: insets.bottom + spacing.lg }} />
        </ScrollView>
      )}

      {/* Modals */}
      <InviteCodeSheet
        visible={showInviteSheet}
        onClose={() => setShowInviteSheet(false)}
        code={lastGeneratedCode}
        onGenerate={handleGenerateCode}
      />

      <EnterCodeSheet
        visible={showEnterCodeSheet}
        onClose={() => setShowEnterCodeSheet(false)}
        onSubmit={handleEnterCode}
      />

      <DiscoverabilitySheet
        visible={showDiscoverabilitySheet}
        onEnable={handleDiscoverabilityEnable}
        onKeepPrivate={handleDiscoverabilityKeepPrivate}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  searchBarWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    backgroundColor: colors.dark.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.bodyMd,
    color: colors.dark.textPrimary,
    minHeight: 44,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.headingMd,
    color: colors.dark.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  cardList: {
    gap: componentSpacing.listItemGap,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  inviteButton: {
    flex: 1,
    backgroundColor: colors.dark.primary,
    borderRadius: 10,
    paddingVertical: componentSpacing.buttonPaddingVertical,
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
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.dark.primary,
    borderRadius: 10,
    paddingVertical: componentSpacing.buttonPaddingVertical,
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
  // Search result row
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: componentSpacing.cardPadding,
    gap: spacing.sm,
    minHeight: 64,
  },
  searchResultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  searchResultAvatarLetter: {
    ...typography.headingMd,
    color: '#FFFFFF',
    lineHeight: undefined,
  },
  searchResultInfo: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  searchResultName: {
    ...typography.bodyMd,
    color: colors.dark.textPrimary,
  },
  searchResultLevel: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
  },
  emptySearch: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptySearchText: {
    ...typography.bodyMd,
    color: colors.dark.textMuted,
    textAlign: 'center',
  },
});
