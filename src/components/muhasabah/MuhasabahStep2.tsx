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
import { View, Text, Pressable, ScrollView, Image, StyleSheet } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useMuhasabahStore } from '../../stores/muhasabahStore';
import { useHabitStore } from '../../stores/habitStore';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../tokens/colors';
import { fontFamilies } from '../../tokens/typography';
import type { Habit } from '../../types/database';

// Pixel art icon map — same as HabitCard (keyed by habit.category)
const HABIT_ICONS: Record<string, ImageSourcePropType> = {
  salah:     require('../../../assets/icons/habit-salah.png'),
  quran:     require('../../../assets/icons/habit-quran.png'),
  dhikr:     require('../../../assets/icons/habit-dhikr.png'),
  fasting:   require('../../../assets/icons/habit-fasting.png'),
  dua:       require('../../../assets/icons/habit-dua.png'),
  character: require('../../../assets/icons/habit-custom.png'),
  custom:    require('../../../assets/icons/habit-custom.png'),
};

const c = colors.dark;

// ─── Component ─────────────────────────────────────────────────────────────

export function MuhasabahStep2() {
  const { close, setHighlight, nextStep } = useMuhasabahStore();
  const { habits, completions, loadDailyState } = useHabitStore(
    useShallow((s) => ({ habits: s.habits, completions: s.completions, loadDailyState: s.loadDailyState })),
  );

  // Refresh habits + completions when this step mounts
  useEffect(() => {
    loadDailyState(useAuthStore.getState().userId);
  }, [loadDailyState]);

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
              <Image
                source={HABIT_ICONS[habit.category] ?? HABIT_ICONS.custom}
                style={styles.habitIcon}
                resizeMode="contain"
              />
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitChevron}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Continue — always visible, advances without selecting a highlight */}
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
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
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
  habitIcon: {
    width: 32,
    height: 32,
    marginRight: 14,
  },
  habitName: {
    fontFamily: fontFamilies.pixelFont,
    fontSize: 11,
    lineHeight: 18,
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
    marginTop: 24,
    width: '100%',
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
