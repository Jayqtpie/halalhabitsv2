/**
 * MuhasabahStep3 — Tomorrow's Focus
 *
 * "What's your intention for tomorrow?" — 3 tappable focus cards.
 * On selection: calls setFocusIntent(intent) then submit(userId).
 * Shows loading state during async submit. Handles error with retry.
 * Adab: Skip always visible, no penalty, no shame.
 * MUHA-01: Completes the 3-tap flow.
 */
import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useMuhasabahStore } from '../../stores/muhasabahStore';
import { useHabitStore } from '../../stores/habitStore';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../tokens/colors';
import { fontFamilies } from '../../tokens/typography';

const c = colors.dark;

// ─── Focus Options ──────────────────────────────────────────────────────────

type FocusIntent = 'momentum' | 'try_harder' | 'rest';

interface FocusOption {
  intent: FocusIntent;
  label: (highlightName?: string) => string;
  description: string;
}

const FOCUS_OPTIONS: FocusOption[] = [
  {
    intent: 'momentum',
    label: () => 'Keep the momentum',
    description: "Stay consistent with what's working",
  },
  {
    intent: 'try_harder',
    label: (name) => (name ? `Try harder on ${name}` : 'Try harder tomorrow'),
    description: 'Push a little more on what matters',
  },
  {
    intent: 'rest',
    label: () => 'Rest and recover',
    description: 'Recharge — consistency needs recovery',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────

export function MuhasabahStep3() {
  const { close, setFocusIntent, submit, todayEntry, loading } = useMuhasabahStore(
    useShallow((s) => ({
      close: s.close,
      setFocusIntent: s.setFocusIntent,
      submit: s.submit,
      todayEntry: s.todayEntry,
      loading: s.loading,
    })),
  );

  const { habits } = useHabitStore(useShallow((s) => ({ habits: s.habits })));

  const [error, setError] = useState<string | null>(null);

  // Resolve the highlighted habit name for "try_harder" label
  const highlightedHabit = todayEntry.highlightHabitId
    ? habits.find((h) => h.id === todayEntry.highlightHabitId)
    : undefined;
  const highlightName = highlightedHabit?.name;

  async function handleSelect(intent: FocusIntent) {
    if (loading) return;
    setError(null);
    setFocusIntent(intent);
    try {
      await submit(useAuthStore.getState().userId);
    } catch (err) {
      setError('Something went wrong. Tap to try again.');
    }
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
        disabled={loading}
      >
        <Text style={[styles.skipText, loading && styles.skipTextDisabled]}>Skip</Text>
      </Pressable>

      {/* Header */}
      <Text style={styles.subtitle}>Muhasabah — Evening Reflection</Text>

      {/* Prompt */}
      <Text style={styles.prompt}>What's your intention{'\n'}for tomorrow?</Text>

      {/* Loading spinner */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={c.primary} />
          <Text style={styles.loadingText}>Saving reflection...</Text>
        </View>
      )}

      {/* Error state */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Focus option cards */}
      {!loading && (
        <View style={styles.optionList}>
          {FOCUS_OPTIONS.map(({ intent, label, description }) => (
            <Pressable
              key={intent}
              style={({ pressed }) => [
                styles.optionCard,
                pressed && styles.optionCardPressed,
              ]}
              onPress={() => handleSelect(intent)}
              accessibilityRole="button"
              accessibilityLabel={label(highlightName)}
              accessibilityHint={description}
              disabled={loading}
            >
              <Text style={styles.optionLabel}>{label(highlightName)}</Text>
              <Text style={styles.optionDescription}>{description}</Text>
            </Pressable>
          ))}
        </View>
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
  skipTextDisabled: {
    color: c.textMuted,
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
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  loadingText: {
    fontFamily: fontFamilies.inter,
    fontSize: 13,
    color: c.textMuted,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: 'rgba(155, 27, 48, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: c.error,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  errorText: {
    fontFamily: fontFamilies.inter,
    fontSize: 13,
    color: c.error,
    textAlign: 'center',
  },
  optionList: {
    width: '100%',
    gap: 12,
  },
  optionCard: {
    width: '100%',
    minHeight: 80,
    backgroundColor: c.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  optionCardPressed: {
    borderColor: c.primary,
    backgroundColor: 'rgba(13, 124, 61, 0.1)',
  },
  optionLabel: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 15,
    lineHeight: 22,
    color: c.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontFamily: fontFamilies.inter,
    fontSize: 12,
    lineHeight: 18,
    color: c.textMuted,
  },
});
