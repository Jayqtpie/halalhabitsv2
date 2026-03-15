/**
 * MuhasabahStep1 — Mood Rating
 *
 * "How was your discipline today?" — 5-emoji scale.
 * Adab: Skip always visible, calls close() with no penalty, no shame.
 * MUHA-04: No guilt framing, no confirmation on skip.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, AccessibilityInfo } from 'react-native';
import { useMuhasabahStore } from '../../stores/muhasabahStore';
import { colors } from '../../tokens/colors';
import { typography, fontFamilies } from '../../tokens/typography';

const c = colors.dark;

// ─── Emoji Options ─────────────────────────────────────────────────────────

const MOOD_OPTIONS = [
  { rating: 1 as const, emoji: '😔', label: 'Struggled' },
  { rating: 2 as const, emoji: '😐', label: 'Okay' },
  { rating: 3 as const, emoji: '🙂', label: 'Good' },
  { rating: 4 as const, emoji: '😊', label: 'Great' },
  { rating: 5 as const, emoji: '✨', label: 'Excellent' },
];

// ─── Component ─────────────────────────────────────────────────────────────

export function MuhasabahStep1() {
  const { close, setMoodRating, nextStep } = useMuhasabahStore();

  function handleSelect(rating: 1 | 2 | 3 | 4 | 5) {
    setMoodRating(rating);
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
      <Text style={styles.prompt}>How was your{'\n'}discipline today?</Text>

      {/* Emoji row */}
      <View style={styles.emojiRow} accessibilityRole="radiogroup">
        {MOOD_OPTIONS.map(({ rating, emoji, label }) => (
          <Pressable
            key={rating}
            style={({ pressed }) => [
              styles.emojiButton,
              pressed && styles.emojiButtonPressed,
            ]}
            onPress={() => handleSelect(rating)}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityHint={`Rate your discipline ${rating} out of 5`}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.emojiLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>
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
    fontSize: 14,
    lineHeight: 24,
    color: c.textPrimary,
    textAlign: 'center',
    marginBottom: 48,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  emojiButton: {
    width: 56,
    height: 72,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  emojiButtonPressed: {
    borderColor: c.primary,
    backgroundColor: 'rgba(13, 124, 61, 0.12)',
  },
  emoji: {
    fontSize: 32,
    lineHeight: 40,
  },
  emojiLabel: {
    fontFamily: fontFamilies.inter,
    fontSize: 10,
    lineHeight: 14,
    color: c.textMuted,
    textAlign: 'center',
  },
});
