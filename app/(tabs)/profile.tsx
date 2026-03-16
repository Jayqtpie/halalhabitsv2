/**
 * Profile tab -- RPG character sheet.
 *
 * Shows: character sprite, active title, level + XP bar,
 * stats grid, trophy case, streak bars, niyyah display.
 *
 * Top-right gear icon navigates to settings.
 * "Your Data" link navigates to data management.
 */
import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../src/stores/gameStore';
import { useHabitStore } from '../../src/stores/habitStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { ProfileHeader } from '../../src/components/profile/ProfileHeader';
import { StatsGrid } from '../../src/components/profile/StatsGrid';
import { TrophyCase } from '../../src/components/profile/TrophyCase';
import { StreakBars } from '../../src/components/profile/StreakBars';
import { NiyyahDisplay } from '../../src/components/profile/NiyyahDisplay';
import { colors, typography, spacing } from '../../src/tokens';
import { xpForLevel, xpToNextLevel } from '../../src/domain/xp-engine';

const USER_ID = 'local-user';

export default function ProfileScreen() {
  const router = useRouter();

  const { currentLevel, totalXP, xpToNext, activeTitle, titles, equipTitle, setActiveTitle } = useGameStore(
    useShallow((s) => ({
      currentLevel: s.currentLevel,
      totalXP: s.totalXP,
      xpToNext: s.xpToNext,
      activeTitle: s.activeTitle,
      titles: s.titles,
      equipTitle: s.equipTitle,
      setActiveTitle: s.setActiveTitle,
    }))
  );

  const { habits, streaks } = useHabitStore(
    useShallow((s) => ({
      habits: s.habits,
      streaks: s.streaks,
    }))
  );

  const { selectedNiyyahs, characterPresetId } = useSettingsStore(
    useShallow((s) => ({
      selectedNiyyahs: s.selectedNiyyahs,
      characterPresetId: s.characterPresetId,
    }))
  );

  // Load game data on mount
  useEffect(() => {
    useGameStore.getState().loadGame(USER_ID);
    useHabitStore.getState().loadDailyState(USER_ID);
  }, []);

  // Compute XP progress within current level
  const xpAtCurrentLevel = xpForLevel(currentLevel);
  const xpCostForCurrentLevel = xpToNextLevel(currentLevel);
  const xpEarnedThisLevel = totalXP - xpAtCurrentLevel;
  const xpProgress = xpCostForCurrentLevel > 0
    ? Math.min(1, xpEarnedThisLevel / xpCostForCurrentLevel)
    : 1;

  // Compute unlocked title IDs set
  const unlockedTitleIds = new Set(titles.map((t) => t.titleId));

  // Compute best streak across all habits
  const bestStreak = habits.length > 0
    ? Math.max(0, ...habits.map((h) => streaks[h.id]?.currentCount ?? 0))
    : 0;

  // Compute days active: find oldest habit creation date
  const daysActive = (() => {
    if (habits.length === 0) return 1;
    const oldest = habits.reduce((min, h) =>
      h.createdAt < min ? h.createdAt : min, habits[0].createdAt
    );
    const diffMs = Date.now() - new Date(oldest).getTime();
    return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
  })();

  const handleEquipTitle = useCallback((titleId: string) => {
    equipTitle(USER_ID, titleId);
  }, [equipTitle]);

  const handleUnequipTitle = useCallback(async () => {
    const { userRepo } = await import('../../src/db/repos/userRepo');
    await userRepo.setActiveTitle(USER_ID, null);
    setActiveTitle(null);
  }, [setActiveTitle]);

  // Build habit streak list for StreakBars
  const habitStreaks = habits.map((h) => ({
    habitId: h.id,
    habitName: h.name,
    streak: streaks[h.id] ?? null,
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Profile</Text>
        <View style={styles.topBarActions}>
          <Pressable
            style={styles.dataLink}
            onPress={() => router.push('/your-data' as any)}
            accessibilityRole="link"
            accessibilityLabel="Your Data"
            hitSlop={8}
          >
            <Text style={styles.dataLinkText}>Your Data</Text>
          </Pressable>
          <Pressable
            style={styles.gearButton}
            onPress={() => router.push('/settings' as any)}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            hitSlop={8}
          >
            <Text style={styles.gearIcon}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header: sprite, title, level, XP bar */}
        <ProfileHeader
          characterPresetId={characterPresetId}
          activeTitle={activeTitle?.name ?? null}
          currentLevel={currentLevel}
          totalXP={totalXP}
          xpToNext={xpToNext}
        />

        {/* Stats Grid */}
        <View style={styles.section}>
          <StatsGrid
            totalXP={totalXP}
            bestStreak={bestStreak}
            daysActive={daysActive}
          />
        </View>

        {/* Streak Bars */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Active Streaks</Text>
          <StreakBars habitStreaks={habitStreaks} />
        </View>

        {/* Niyyah Display */}
        <View style={styles.section}>
          <NiyyahDisplay selectedNiyyahs={selectedNiyyahs} />
        </View>

        {/* Trophy Case */}
        <View style={styles.section}>
          <TrophyCase
            unlockedTitleIds={unlockedTitleIds}
            activeTitleId={activeTitle?.id ?? null}
            onEquipTitle={handleEquipTitle}
            onUnequipTitle={handleUnequipTitle}
          />
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  screenTitle: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    color: colors.dark.textPrimary,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dataLink: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  dataLinkText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.secondary,
    textDecorationLine: 'underline',
  },
  gearButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearIcon: {
    fontSize: 22,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeading: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    color: colors.dark.textPrimary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  bottomPad: {
    height: spacing.xxl,
  },
});
