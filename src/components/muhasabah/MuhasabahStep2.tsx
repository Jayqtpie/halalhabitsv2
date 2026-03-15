/**
 * MuhasabahStep2 — Highlight Pick
 *
 * "Which habit are you most grateful for today?"
 * Shows today's completed habits as tappable cards.
 * If no completions: warm message + Continue button (no shaming).
 * Adab: Skip always visible, no penalty, no shame.
 * MUHA-02: Reads today's completed habits from habitStore.
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useMuhasabahStore } from '../../stores/muhasabahStore';
import { useHabitStore } from '../../stores/habitStore';
import { colors } from '../../tokens/colors';
import { fontFamilies } from '../../tokens/typography';
import type { Habit } from '../../types/database';

const DEFAULT_USER_ID = 'default-user';
const c = colors.dark;

// ─── Component ─────────────────────────────────────────────────────────────

export function MuhasabahStep2() {
  const { close, setHighlight, nextStep } = useMuhasabahStore();
  const { habits, completions, loadHabits } = useHabitStore(
    useShallow((s) => ({ habits: s.habits, completions: s.completions, loadHabits: s.loadHabits })),
  );

  // Always refresh habits + completions when this step mounts
  // (user may open Muhasabah from Home without visiting Habits tab)
  useEffect(() => {
    loadHabits(DEFAULT_USER_ID);
  }, [loadHabits]);

  // Today's completed habits
  const completedHabits = habits.filter((h) => completions[h.id]);

  function handleSelect(habit: Habit) {
    setHighlight(habit.id);
    nextStep();
  }

  function handleContinueWithoutHighlight() {
    nextStep();
  }

  return (
    <View style={styles.container}>
      {/* Skip — always visible, no consequence */}
      <Pressable
        style={styles.skipButton}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="Skip evening reflection"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Header */}
      <Text style={styles.subtitle}>Muhasabah — Evening Reflection</Text>

      {/* Prompt */}
      <Text style={styles.prompt}>Which habit are you most{'\n'}grateful for today?</Text>

      {completedHabits.length === 0 ? (
        /* Empty state — warm, no shame */
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No habits completed today — and that's okay.{'\n'}Even small steps count.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}
            onPress={handleContinueWithoutHighlight}
            accessibilityRole="button"
            accessibilityLabel="Continue to next step"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
      ) : (
        /* Habit cards */
        <ScrollView
          style={styles.habitList}
          contentContainerStyle={styles.habitListContent}
          showsVerticalScrollIndicator={false}
        >
          {completedHabits.map((habit) => (
            <Pressable
              key={habit.id}
              style={({ pressed }) => [
                styles.habitCard,
                pressed && styles.habitCardPressed,
              ]}
              onPress={() => handleSelect(habit)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${habit.name} as your highlight`}
            >
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitChevron}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  skipText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 14,
    color: c.textSecondary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 11,
    lineHeight: 16,
    color: c.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  prompt: {
    fontFamily: fontFamilies.pixelFont,
    fontSize: 13,
    lineHeight: 22,
    color: c.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  habitList: {
    width: '100%',
    maxHeight: 320,
  },
  habitListContent: {
    gap: 10,
    paddingBottom: 16,
  },
  habitCard: {
    width: '100%',
    minHeight: 64,
    backgroundColor: c.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitCardPressed: {
    borderColor: c.primary,
    backgroundColor: 'rgba(13, 124, 61, 0.1)',
  },
  habitName: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 15,
    lineHeight: 22,
    color: c.textPrimary,
    flex: 1,
  },
  habitChevron: {
    fontFamily: fontFamilies.inter,
    fontSize: 22,
    color: c.textMuted,
    marginLeft: 12,
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
    paddingTop: 8,
  },
  emptyText: {
    fontFamily: fontFamilies.inter,
    fontSize: 15,
    lineHeight: 24,
    color: c.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  continueButton: {
    minHeight: 52,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: c.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonPressed: {
    backgroundColor: c.primaryPressed,
  },
  continueButtonText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
