/**
 * Habits tab -- daily habit completion screen.
 *
 * Layout:
 *   - Header: "Today" in pixel font with current date
 *   - DailyProgressBar: X of Y complete
 *   - HabitList: sorted habit cards with tap-to-complete
 *   - FAB: "+" button for adding new habits
 */
import React, { useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { useRouter } from 'expo-router';
import { useHabitStore } from '../../src/stores/habitStore';
import { DailyProgressBar } from '../../src/components/habits/DailyProgressBar';
import { HabitList } from '../../src/components/habits/HabitList';
import { colors, typography, spacing, radius } from '../../src/tokens';

const DEFAULT_USER_ID = 'default-user';

export default function HabitsScreen() {
  const router = useRouter();
  const dailyProgress = useHabitStore(
    useShallow((s) => s.dailyProgress),
  );
  const loadDailyState = useHabitStore((s) => s.loadDailyState);

  useEffect(() => {
    loadDailyState(DEFAULT_USER_ID);
  }, [loadDailyState]);

  const handleAddHabit = useCallback(() => {
    // Navigate to preset library / add-habit screen
    try {
      router.push('/add-habit' as never);
    } catch {
      Alert.alert('Coming Soon', 'Habit presets will be available shortly.');
    }
  }, [router]);

  // Format today's date
  const today = new Date();
  const dateString = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today</Text>
        <Text style={styles.headerDate}>{dateString}</Text>
      </View>

      {/* Progress */}
      <DailyProgressBar
        completed={dailyProgress.completed}
        total={dailyProgress.total}
      />

      {/* Habit List */}
      <View style={styles.listContainer}>
        <HabitList userId={DEFAULT_USER_ID} />
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
