/**
 * Quest Board screen -- tab toggle between Quests and Titles views.
 *
 * Quests tab: locked state (Level < 5) or quest sections (Daily, Weekly, Stretch).
 * Titles tab: full title browser with rarity groups, progress bars, equip action.
 *
 * Auto-track design: no accept buttons. Expired quests silently not shown.
 * Completed quests remain visible as mini-trophies until reset.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../src/stores/gameStore';
import { useHabitStore } from '../../src/stores/habitStore';
import { useAuthStore } from '../../src/stores/authStore';
import { QuestBoardHeader } from '../../src/components/quests/QuestBoardHeader';
import { QuestSection } from '../../src/components/quests/QuestSection';
import { QuestLockedState } from '../../src/components/quests/QuestLockedState';
import { TitleGrid } from '../../src/components/quests/TitleGrid';
import { AlKahfQuestCard } from '../../src/components/quests/AlKahfQuestCard';
import { isFriday } from '../../src/domain/friday-engine';
import { colors, typography, spacing } from '../../src/tokens';
import { titleRepo } from '../../src/db/repos';
import type { Title, Quest } from '../../src/types/database';
import type { PlayerStats } from '../../src/domain/title-engine';

export default function QuestsScreen() {
  const [activeTab, setActiveTab] = useState<'quests' | 'titles'>('quests');
  const [allTitles, setAllTitles] = useState<Title[]>([]);
  const [titlesLoading, setTitlesLoading] = useState(false);

  // Game store selectors
  const {
    currentLevel,
    totalXP,
    quests,
    titles: userTitles,
    activeTitle,
    loading,
    loadGame,
    generateQuests,
    equipTitle,
  } = useGameStore(
    useShallow((s) => ({
      currentLevel: s.currentLevel,
      totalXP: s.totalXP,
      quests: s.quests,
      titles: s.titles,
      activeTitle: s.activeTitle,
      loading: s.loading,
      loadGame: s.loadGame,
      generateQuests: s.generateQuests,
      equipTitle: s.equipTitle,
    }))
  );

  // Habit store for playerStats (title progress display)
  const { streaks, completions } = useHabitStore(
    useShallow((s) => ({
      streaks: s.streaks,
      completions: s.completions,
    }))
  );

  const userId = useAuthStore((s) => s.userId);

  // Load game data on mount
  useEffect(() => {
    loadGame(userId).catch((e) =>
      console.warn('[QuestsScreen] loadGame error:', e)
    );
  }, [loadGame, userId]);

  // Generate/refresh quests on focus
  useFocusEffect(
    useCallback(() => {
      if (currentLevel >= 5) {
        generateQuests(userId).catch((e) =>
          console.warn('[QuestsScreen] generateQuests error:', e)
        );
      }
    }, [currentLevel, generateQuests, userId])
  );

  // Load all title definitions when switching to titles tab
  useEffect(() => {
    if (activeTab === 'titles' && allTitles.length === 0) {
      setTitlesLoading(true);
      titleRepo.getAll()
        .then(setAllTitles)
        .catch((e) => console.warn('[QuestsScreen] titleRepo.getAll error:', e))
        .finally(() => setTitlesLoading(false));
    }
  }, [activeTab, allTitles.length]);

  // ── Quests tab: group by type ──────────────────────────────────────────────

  const dailyQuests: Quest[] = quests.filter(q => q.type === 'daily');
  const weeklyQuests: Quest[] = quests.filter(q => q.type === 'weekly');
  const stretchQuests: Quest[] = quests.filter(q => q.type === 'stretch');

  // Friday-only: Al-Kahf quest (templateId === 'friday-alkahf')
  const alkahfQuest = quests.find(q => q.templateId === 'friday-alkahf');

  // ── Titles tab: build data ─────────────────────────────────────────────────

  const unlockedTitleIds = new Set(userTitles.map(ut => ut.titleId));
  const activeTitleId = activeTitle?.id ?? null;

  // Partial PlayerStats for progress display (best effort from available store state)
  const habitStreakMap: Record<string, number> = {};
  const habitTypeMap: Record<string, string> = {};
  for (const [habitId, streakState] of Object.entries(streaks)) {
    habitStreakMap[habitId] = streakState.currentCount;
  }

  const streakValues = Object.values(habitStreakMap);
  const simultaneousStreaks14 = streakValues.filter(s => s >= 14).length;
  const simultaneousStreaks90 = streakValues.filter(s => s >= 90).length;

  const playerStats: Partial<PlayerStats> = {
    currentLevel,
    habitStreaks: habitStreakMap,
    habitTypes: habitTypeMap,
    totalCompletions: Object.values(completions).filter(Boolean).length,
    questCompletions: quests.filter(q => q.status === 'completed').length,
    mercyRecoveries: 0,
    muhasabahStreak: 0,
    activeHabitCount: Object.keys(habitStreakMap).length,
    simultaneousStreaks14,
    simultaneousStreaks90,
  };

  const handleEquipTitle = useCallback(
    (titleId: string) => {
      equipTitle(userId, titleId).catch((e) =>
        console.warn('[QuestsScreen] equipTitle error:', e)
      );
    },
    [equipTitle, userId]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading && quests.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.dark.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Tab toggle always visible */}
      <QuestBoardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Quests tab */}
      {activeTab === 'quests' && (
        currentLevel < 5 ? (
          <QuestLockedState currentLevel={currentLevel} currentXP={totalXP} />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isFriday() && alkahfQuest && (
              <AlKahfQuestCard quest={alkahfQuest} />
            )}
            <QuestSection title="Daily Quests" quests={dailyQuests} />
            <QuestSection title="Weekly Quests" quests={weeklyQuests} />
            {currentLevel >= 8 && (
              <QuestSection title="Stretch Quests" quests={stretchQuests} />
            )}
          </ScrollView>
        )
      )}

      {/* Titles tab */}
      {activeTab === 'titles' && (
        titlesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.dark.primary} />
          </View>
        ) : allTitles.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyText}>No titles available yet.</Text>
          </View>
        ) : (
          <TitleGrid
            allTitles={allTitles}
            unlockedTitleIds={unlockedTitleIds}
            activeTitleId={activeTitleId}
            playerStats={playerStats}
            onEquipTitle={handleEquipTitle}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary,
  },
});
