/**
 * Character preset picker for onboarding.
 *
 * Horizontal scroll of 4 scholar presets. Selected state has emerald border glow.
 * For MVP, character variants are represented by ID + color tint (same sprite).
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, fontFamilies, spacing } from '../../tokens';

const c = colors.dark;

// ─── Character Presets ─────────────────────────────────────────────────────

export interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  tintColor: string;
  emoji: string; // MVP placeholder — real Skia sprite asset in Phase 5+
}

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: 'scholar_01',
    name: 'The Seeker',
    description: 'Earnest in learning',
    tintColor: '#34D399', // emerald
    emoji: '📚',
  },
  {
    id: 'scholar_02',
    name: 'The Steadfast',
    description: 'Grounded in practice',
    tintColor: '#60A5FA', // sapphire
    emoji: '🏛️',
  },
  {
    id: 'scholar_03',
    name: 'The Devoted',
    description: 'Heart always present',
    tintColor: '#FBBF24', // gold
    emoji: '✨',
  },
  {
    id: 'scholar_04',
    name: 'The Traveler',
    description: 'Journey never ends',
    tintColor: '#C084FC', // violet
    emoji: '🌙',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────

interface CharacterPickerProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CharacterPicker({ selectedId, onSelect }: CharacterPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {CHARACTER_PRESETS.map((preset) => {
        const isSelected = selectedId === preset.id;
        return (
          <Pressable
            key={preset.id}
            style={({ pressed }) => [
              styles.card,
              isSelected ? styles.cardSelected : undefined,
              isSelected ? { borderColor: preset.tintColor } as object : undefined,
              pressed ? styles.cardPressed : undefined,
            ]}
            onPress={() => onSelect(preset.id)}
            accessibilityLabel={`Choose ${preset.name}: ${preset.description}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            {/* Character portrait placeholder */}
            <View style={[styles.portrait, { backgroundColor: `${preset.tintColor}22` }]}>
              <Text style={styles.portraitEmoji}>{preset.emoji}</Text>
            </View>

            {/* Selected glow ring */}
            {isSelected && (
              <View style={[styles.selectedRing, { borderColor: preset.tintColor }]} />
            )}

            <Text style={[styles.presetName, isSelected && { color: preset.tintColor }]}>
              {preset.name}
            </Text>
            <Text style={styles.presetDesc}>{preset.description}</Text>

            {isSelected && (
              <View style={[styles.checkmark, { backgroundColor: preset.tintColor }]}>
                <Text style={styles.checkmarkText}>{'✓'}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const CARD_WIDTH = 140;

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: c.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: c.border,
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.xs,
    // Min touch target: card is tall enough (>44px) with portrait + text
  },
  cardSelected: {
    borderWidth: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  portrait: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  portraitEmoji: {
    fontSize: 36,
  },
  selectedRing: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    height: 92,
    borderRadius: 12,
    borderWidth: 2,
    opacity: 0.4,
  },
  presetName: {
    fontSize: 10,
    fontFamily: fontFamilies.pixelFont,
    color: c.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  presetDesc: {
    fontSize: 11,
    fontFamily: fontFamilies.inter,
    color: c.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: fontFamilies.interBold,
  },
});
