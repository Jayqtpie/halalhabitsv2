/**
 * ActivitiesTab
 *
 * Content component for the "Activities" sub-tab in the Buddy screen (D-12).
 * Loads and displays:
 *   1. Incoming shared habit proposals (SharedHabitProposalCard)
 *   2. Active shared habits with shared streak (SharedHabitCard)
 *   3. Duo Quests placeholder (actual cards in Plan 05)
 *
 * Privacy (D-05/D-14):
 *   - Shared streak shows aggregate only — not individual completion data per D-14
 *   - getAggregateProgress returns no userA/userB keys by design (Phase 16 decision)
 *
 * Per CLAUDE.md: No shame copy, no addiction dark patterns.
 * Per project memory: Pull-to-refresh keeps the UI snappy.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSharedHabitStore } from '../../stores/sharedHabitStore';
import { useDuoQuestStore } from '../../stores/duoQuestStore';
import { useAuthStore } from '../../stores/authStore';
import { checkInactivity, type InactivityStatus } from '../../domain/duo-quest-engine';
import { SharedHabitCard } from './SharedHabitCard';
import { SharedHabitProposalCard } from './SharedHabitProposalCard';
import { DuoQuestCard } from './DuoQuestCard';
import { DuoQuestDetailSheet } from './DuoQuestDetailSheet';
import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { componentSpacing, spacing } from '../../tokens/spacing';
import type { SharedHabit, DuoQuest } from '../../types/database';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ActivitiesTabProps {
  userId: string;
  buddyPairIds: string[];
  /** Map from buddy pair ID to buddy display name for shared habit cards. */
  buddyProfiles: Map<string, { name: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Look up a buddy's display name by the shared habit's buddyPairId.
 * Falls back to "Buddy" if not in the profile map.
 */
function getBuddyNameForHabit(
  habit: SharedHabit,
  buddyProfiles: Map<string, { name: string }>,
): string {
  return buddyProfiles.get(habit.buddyPairId)?.name ?? 'Buddy';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActivitiesTab({ userId, buddyPairIds, buddyProfiles }: ActivitiesTabProps) {
  const {
    activeSharedHabits,
    proposals,
    loading: sharedLoading,
    loadSharedHabits,
    acceptProposal,
    declineProposal,
    endSharedHabit,
    getSharedStreak,
  } = useSharedHabitStore();

  const { activeQuests, completedQuests, loading: questLoading, loadAllDuoQuests, exitQuest } = useDuoQuestStore();

  // Detail sheet state
  const [selectedQuest, setSelectedQuest] = useState<DuoQuest | null>(null);
  // Collapsed completed quests
  const [showCompleted, setShowCompleted] = useState(false);

  const loading = sharedLoading || questLoading;

  // ── Load on mount ──────────────────────────────────────────────────────

  useEffect(() => {
    if (buddyPairIds.length === 0) return;
    void loadSharedHabits(buddyPairIds, userId);
    void loadAllDuoQuests(buddyPairIds);
  }, [buddyPairIds.join(','), userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pull-to-refresh ────────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    if (buddyPairIds.length === 0) return;
    await Promise.all([
      loadSharedHabits(buddyPairIds, userId),
      loadAllDuoQuests(buddyPairIds),
    ]);
  }, [buddyPairIds, userId, loadSharedHabits, loadAllDuoQuests]);

  // ── Action handlers ────────────────────────────────────────────────────

  const handleAccept = useCallback(
    async (proposalId: string) => {
      await acceptProposal(proposalId, userId, buddyPairIds);
    },
    [userId, buddyPairIds, acceptProposal],
  );

  const handleDecline = useCallback(
    async (proposalId: string) => {
      await declineProposal(proposalId, userId, buddyPairIds);
    },
    [userId, buddyPairIds, declineProposal],
  );

  const handleEnd = useCallback(
    async (habitId: string) => {
      await endSharedHabit(habitId, userId, buddyPairIds);
    },
    [userId, buddyPairIds, endSharedHabit],
  );

  // ── Derived state ──────────────────────────────────────────────────────

  const hasProposals = proposals.length > 0;
  const hasSharedHabits = activeSharedHabits.length > 0;
  const hasActiveQuests = activeQuests.length > 0;
  const hasCompletedQuests = completedQuests.length > 0;
  const isEmpty = !hasProposals && !hasSharedHabits && !hasActiveQuests;

  /** Determine current user's side in a quest (creator is 'a'). */
  const getSide = (quest: DuoQuest): 'a' | 'b' =>
    quest.createdByUserId === userId ? 'a' : 'b';

  /** Get buddy name for a quest from buddy pair profiles. */
  const getQuestBuddyName = (quest: DuoQuest): string =>
    buddyProfiles.get(quest.buddyPairId)?.name ?? 'Buddy';

  /** Pure inactivity check from timestamps — no async needed. */
  const getInactivityStatus = (quest: DuoQuest): InactivityStatus =>
    checkInactivity(quest.updatedAt);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
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
      {isEmpty && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No shared activities yet</Text>
          <Text style={styles.emptySubtitle}>
            Visit a buddy's profile to start one.
          </Text>
        </View>
      )}

      {/* Proposals section */}
      {hasProposals && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Proposals</Text>
          <View style={styles.cardList}>
            {proposals.map((proposal) => (
              <SharedHabitProposalCard
                key={proposal.id}
                proposal={proposal}
                fromName={getBuddyNameForHabit(proposal, buddyProfiles)}
                onAccept={() => void handleAccept(proposal.id)}
                onDecline={() => void handleDecline(proposal.id)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Shared Habits section */}
      {hasSharedHabits && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Shared Habits</Text>
          <View style={styles.cardList}>
            {activeSharedHabits.map((habit) => {
              // Per D-14: show shared streak only (aggregate of both players' dates)
              // getSharedStreak requires both players' completion date arrays.
              // In the offline-first v1, we pass empty arrays as a graceful default —
              // actual date hydration is wired in a future sync plan.
              const sharedStreak = getSharedStreak(habit.id, [], []);
              return (
                <SharedHabitCard
                  key={habit.id}
                  sharedHabit={habit}
                  buddyName={getBuddyNameForHabit(habit, buddyProfiles)}
                  sharedStreak={sharedStreak}
                  onEnd={() => void handleEnd(habit.id)}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* Duo Quests section — real cards per Plan 05 */}
      {hasActiveQuests && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Duo Quests</Text>
          <View style={styles.cardList}>
            {activeQuests.map((quest) => (
              <DuoQuestCard
                key={quest.id}
                quest={quest}
                buddyName={getQuestBuddyName(quest)}
                onPress={() => setSelectedQuest(quest)}
                onExit={() => void exitQuest(quest.id, getSide(quest), userId)}
                inactivityStatus={getInactivityStatus(quest)}
                side={getSide(quest)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Completed Quests (collapsed) */}
      {hasCompletedQuests && (
        <View style={styles.section}>
          <TouchableOpacity onPress={() => setShowCompleted(!showCompleted)}>
            <Text style={styles.sectionHeader}>
              Completed Quests ({completedQuests.length}) {showCompleted ? '▾' : '▸'}
            </Text>
          </TouchableOpacity>
          {showCompleted && (
            <View style={styles.cardList}>
              {completedQuests.map((quest) => (
                <DuoQuestCard
                  key={quest.id}
                  quest={quest}
                  buddyName={getQuestBuddyName(quest)}
                  onPress={() => setSelectedQuest(quest)}
                  inactivityStatus="ok"
                  side={getSide(quest)}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Bottom padding */}
      <View style={{ height: spacing.xl }} />

      {/* Duo Quest detail sheet */}
      {selectedQuest && (
        <DuoQuestDetailSheet
          visible={!!selectedQuest}
          onClose={() => setSelectedQuest(null)}
          quest={selectedQuest}
          buddyName={getQuestBuddyName(selectedQuest)}
          side={getSide(selectedQuest)}
          userId={userId}
        />
      )}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.bodyMd,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.bodySm,
    color: colors.dark.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.bodyMd,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  cardList: {
    gap: componentSpacing.listItemGap,
  },
});
