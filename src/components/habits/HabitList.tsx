/**
 * HabitList -- sorted list of HabitCards consuming store data.
 *
 * Renders habits from getHabitsForDisplay() which sorts:
 *   1. Uncompleted salah (prayer order)
 *   2. Uncompleted other (sort order)
 *   3. Completed salah (prayer order)
 *   4. Completed other (sort order)
 *
 * Handles empty state, loading state, and pull-to-refresh.
 */
import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useHabitStore } from '../../stores/habitStore';
import { HabitCard } from './HabitCard';
import type { HabitWithStatus } from '../../types/habits';
import { colors, typography, spacing } from '../../tokens';

interface HabitListProps {
  userId: string;
  onLongPressHabit?: (habitId: string) => void;
  onAddHabit?: () => void;
  /** Optional: called with screen position for XP float label placement */
  onCompleteWithPosition?: (habitId: string, x: number, y: number) => void;
}

export function HabitList({ userId, onLongPressHabit, onAddHabit, onCompleteWithPosition }: HabitListProps) {
  const { loading, habits } = useHabitStore(
    useShallow((s) => ({ loading: s.loading, habits: s.habits })),
  );
  const getHabitsForDisplay = useHabitStore((s) => s.getHabitsForDisplay);
  const completeHabit = useHabitStore((s) => s.completeHabit);
  const loadDailyState = useHabitStore((s) => s.loadDailyState);

  const displayHabits = getHabitsForDisplay();

  const handleComplete = useCallback(
    (habitId: string) => {
      completeHabit(habitId, userId);
    },
    [completeHabit, userId],
  );

  const handleRefresh = useCallback(() => {
    loadDailyState(userId);
  }, [loadDailyState, userId]);

  const renderItem = useCallback(
    ({ item }: { item: HabitWithStatus }) => (
      <HabitCard
        habit={item}
        onComplete={handleComplete}
        onLongPress={onLongPressHabit}
        onCompleteWithPosition={onCompleteWithPosition}
      />
    ),
    [handleComplete, onLongPressHabit, onCompleteWithPosition],
  );

  const keyExtractor = useCallback((item: HabitWithStatus) => item.id, []);

  // ── Loading State ───────────────────────────────────────────────────
  if (loading && habits.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.dark.primary} />
      </View>
    );
  }

  // ── Empty State ─────────────────────────────────────────────────────
  if (!loading && displayHabits.length === 0) {
    return (
      <Pressable style={styles.centered} onPress={onAddHabit}>
        <Text style={styles.emptyIcon}>+</Text>
        <Text style={styles.emptyTitle}>Your journey begins</Text>
        <Text style={styles.emptyBody}>
          Tap to add your first habit.{'\n'}
          Every step forward builds discipline.
        </Text>
      </Pressable>
    );
  }

  // ── Habit List ──────────────────────────────────────────────────────
  return (
    <FlatList
      data={displayHabits}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
          tintColor={colors.dark.primary}
          colors={[colors.dark.primary]}
          progressBackgroundColor={colors.dark.surface}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + spacing.xl, // Room for FAB
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.dark.primary,
    marginBottom: spacing.md,
    fontWeight: '300',
  },
  emptyTitle: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    color: colors.dark.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textMuted,
    textAlign: 'center',
  },
});
