/**
 * Habits tab -- daily habit completion screen.
 *
 * Layout:
 *   - MercyModeBanner: shown when any habit has active mercy mode
 *   - Header: "Today" in pixel font with current date
 *   - DailyProgressBar: X of Y complete
 *   - MercyModeRecoveryTracker: inline for habits mid-recovery
 *   - HabitList: sorted habit cards with tap-to-complete
 *   - FAB: "+" button for adding new habits
 *   - Modals: EditHabitSheet, HabitCalendar, CalcMethodPicker
 */
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { useRouter } from 'expo-router';
import { useHabitStore } from '../../src/stores/habitStore';
import { DailyProgressBar } from '../../src/components/habits/DailyProgressBar';
import { HabitList } from '../../src/components/habits/HabitList';
import { MercyModeBanner } from '../../src/components/habits/MercyModeBanner';
import { MercyModeRecoveryTracker } from '../../src/components/habits/MercyModeRecoveryTracker';
import { HabitCalendar } from '../../src/components/calendar/HabitCalendar';
import { EditHabitSheet } from '../../src/components/habits/EditHabitSheet';
import { CalcMethodPicker } from '../../src/components/prayer/CalcMethodPicker';
import { colors, typography, spacing, radius } from '../../src/tokens';
import type { Habit } from '../../src/types/database';

const DEFAULT_USER_ID = 'default-user';

export default function HabitsScreen() {
  const router = useRouter();

  // ── Store selectors ──────────────────────────────────────────────────
  const { dailyProgress, mercyModes, habits, streaks } = useHabitStore(
    useShallow((s) => ({
      dailyProgress: s.dailyProgress,
      mercyModes: s.mercyModes,
      habits: s.habits,
      streaks: s.streaks,
    })),
  );
  const loadDailyState = useHabitStore((s) => s.loadDailyState);
  const startRecovery = useHabitStore((s) => s.startRecovery);
  const resetStreak = useHabitStore((s) => s.resetStreak);

  // ── Modal states ─────────────────────────────────────────────────────
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [calendarHabitId, setCalendarHabitId] = useState<string | null>(null);
  const [showCalcPicker, setShowCalcPicker] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  useEffect(() => {
    loadDailyState(DEFAULT_USER_ID);
  }, [loadDailyState]);

  // ── Mercy Mode ───────────────────────────────────────────────────────
  const mercyEntries = useMemo(
    () => Object.entries(mercyModes),
    [mercyModes],
  );
  const activeMercyEntries = mercyEntries.filter(
    ([, state]) => state.active || state.recoveryDay === 0,
  );
  const firstMercyEntry = activeMercyEntries[0];
  const firstMercyHabit = firstMercyEntry
    ? habits.find((h) => h.id === firstMercyEntry[0])
    : null;

  // Habits that are mid-recovery (recoveryDay > 0 but < 3)
  const recoveringEntries = mercyEntries.filter(
    ([, state]) => state.active && state.recoveryDay > 0,
  );

  const handleStartRecovery = useCallback(() => {
    if (firstMercyEntry) {
      startRecovery(firstMercyEntry[0]);
    }
  }, [firstMercyEntry, startRecovery]);

  const handleStartFresh = useCallback(() => {
    if (firstMercyEntry) {
      resetStreak(firstMercyEntry[0]);
    }
  }, [firstMercyEntry, resetStreak]);

  const handleDismissBanner = useCallback(() => {
    setDismissedBanner(true);
  }, []);

  // ── Navigation ───────────────────────────────────────────────────────
  const handleAddHabit = useCallback(() => {
    try {
      router.push('/add-habit' as never);
    } catch {
      Alert.alert('Coming Soon', 'Habit presets will be available shortly.');
    }
  }, [router]);

  // ── Long-press actions ───────────────────────────────────────────────
  const handleLongPressHabit = useCallback(
    (habitId: string) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      Alert.alert(habit.name, undefined, [
        {
          text: 'View History',
          onPress: () => setCalendarHabitId(habitId),
        },
        {
          text: 'Edit',
          onPress: () => setEditingHabit(habit),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [habits],
  );

  // ── Calendar habit data ──────────────────────────────────────────────
  const calendarHabit = calendarHabitId
    ? habits.find((h) => h.id === calendarHabitId)
    : null;
  const calendarStreak = calendarHabitId
    ? streaks[calendarHabitId]
    : null;

  // Format today's date
  const today = new Date();
  const dateString = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mercy Mode Banner -- above everything when active */}
      {firstMercyHabit &&
        firstMercyEntry &&
        firstMercyEntry[1].recoveryDay === 0 &&
        !dismissedBanner && (
          <MercyModeBanner
            habitName={firstMercyHabit.name}
            mercyState={firstMercyEntry[1]}
            additionalCount={Math.max(0, activeMercyEntries.length - 1)}
            onStartRecovery={handleStartRecovery}
            onStartFresh={handleStartFresh}
            onDismiss={handleDismissBanner}
          />
        )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Today</Text>
            <Text style={styles.headerDate}>{dateString}</Text>
          </View>
          {/* Settings gear for calc method picker */}
          <Pressable
            style={styles.settingsButton}
            onPress={() => setShowCalcPicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Prayer settings"
          >
            <Text style={styles.settingsIcon}>{'⚙️'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Progress */}
      <DailyProgressBar
        completed={dailyProgress.completed}
        total={dailyProgress.total}
      />

      {/* Recovery trackers for habits mid-recovery */}
      {recoveringEntries.map(([habitId, mercyState]) => {
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return null;
        return (
          <MercyModeRecoveryTracker
            key={habitId}
            recoveryDay={mercyState.recoveryDay}
            habitName={habit.name}
            restoredStreak={
              mercyState.preBreakStreak
                ? Math.round(mercyState.preBreakStreak * 0.25)
                : undefined
            }
          />
        );
      })}

      {/* Habit List */}
      <View style={styles.listContainer}>
        <HabitList
          userId={DEFAULT_USER_ID}
          onLongPressHabit={handleLongPressHabit}
        />
      </View>

      {/* Floating Action Button */}
      <Pressable
        style={styles.fab}
        onPress={handleAddHabit}
        accessibilityRole="button"
        accessibilityLabel="Add new habit"
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Edit Habit Sheet */}
      <EditHabitSheet
        habit={editingHabit}
        visible={editingHabit !== null}
        onClose={() => setEditingHabit(null)}
      />

      {/* Calendar / History */}
      <HabitCalendar
        habitId={calendarHabitId ?? ''}
        habitName={calendarHabit?.name ?? ''}
        visible={calendarHabitId !== null}
        onClose={() => setCalendarHabitId(null)}
        currentStreak={calendarStreak?.currentCount ?? 0}
        longestStreak={calendarStreak?.longestCount ?? 0}
      />

      {/* Calc Method Picker */}
      <CalcMethodPicker
        visible={showCalcPicker}
        onClose={() => setShowCalcPicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: typography.headingLg.fontSize,
    lineHeight: typography.headingLg.lineHeight,
    fontFamily: typography.headingLg.fontFamily,
    fontWeight: typography.headingLg.fontWeight as '700',
    color: colors.dark.textPrimary,
  },
  headerDate: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  settingsIcon: {
    fontSize: 22,
  },
  listContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: colors.dark.textPrimary,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});
