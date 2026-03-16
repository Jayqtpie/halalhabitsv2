/**
 * Onboarding Screen 2: Choose Your Scholar.
 *
 * Character preset picker + optional skin/outfit customization.
 * Selected character ID is stored in settingsStore.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { CharacterPicker, CHARACTER_PRESETS } from '../../src/components/onboarding/CharacterPicker';
import { colors, typography, fontFamilies, spacing } from '../../src/tokens';

const c = colors.dark;

// Skin tone and outfit options (MVP: stored as part of customization descriptor)
const SKIN_TONES = [
  { id: 'tone_1', color: '#FFDBB4' },
  { id: 'tone_2', color: '#C68642' },
  { id: 'tone_3', color: '#8D5524' },
  { id: 'tone_4', color: '#4A2912' },
];

const OUTFIT_COLORS = [
  { id: 'emerald', color: '#0D7C3D' },
  { id: 'sapphire', color: '#1B3A6B' },
  { id: 'gold', color: '#D97706' },
  { id: 'violet', color: '#7C3AED' },
];

export default function CharacterScreen() {
  const router = useRouter();
  const setCharacterPresetId = useSettingsStore((s) => s.setCharacterPresetId);
  const existingId = useSettingsStore((s) => s.characterPresetId);

  // Default to first preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    existingId ?? CHARACTER_PRESETS[0].id,
  );
  const [selectedSkinTone, setSelectedSkinTone] = useState('tone_2');
  const [selectedOutfit, setSelectedOutfit] = useState('emerald');

  const handleContinue = () => {
    // Encode customization into the preset ID string for MVP
    const fullId = `${selectedPresetId}|skin:${selectedSkinTone}|outfit:${selectedOutfit}`;
    setCharacterPresetId(fullId);
    router.push('/(onboarding)/niyyah' as never);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{'2 / 5'}</Text>
        </View>
        <Text style={styles.heading}>{'Choose Your Scholar'}</Text>
        <Text style={styles.subheading}>{'Who begins this journey with you?'}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Character Picker */}
        <CharacterPicker
          selectedId={selectedPresetId}
          onSelect={setSelectedPresetId}
        />

        {/* Customization Section */}
        <View style={styles.customSection}>
          <Text style={styles.customLabel}>{'Skin Tone'}</Text>
          <View style={styles.swatchRow}>
            {SKIN_TONES.map((tone) => (
              <Pressable
                key={tone.id}
                style={({ pressed }) => [
                  styles.swatch,
                  { backgroundColor: tone.color } as object,
                  selectedSkinTone === tone.id ? styles.swatchSelected : undefined,
                  pressed ? styles.swatchPressed : undefined,
                ]}
                onPress={() => setSelectedSkinTone(tone.id)}
                accessibilityLabel={`Skin tone ${tone.id}`}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedSkinTone === tone.id }}
              />
            ))}
          </View>

          <Text style={[styles.customLabel, { marginTop: spacing.md }]}>{'Outfit Color'}</Text>
          <View style={styles.swatchRow}>
            {OUTFIT_COLORS.map((outfit) => (
              <Pressable
                key={outfit.id}
                style={({ pressed }) => [
                  styles.swatch,
                  { backgroundColor: outfit.color } as object,
                  selectedOutfit === outfit.id ? styles.swatchSelected : undefined,
                  pressed ? styles.swatchPressed : undefined,
                ]}
                onPress={() => setSelectedOutfit(outfit.id)}
                accessibilityLabel={`${outfit.id} outfit`}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedOutfit === outfit.id }}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed ? styles.continueButtonPressed : undefined]}
          onPress={handleContinue}
          accessibilityLabel="Continue to niyyah selection"
          accessibilityRole="button"
        >
          <Text style={styles.continueButtonText}>{'Continue'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepIndicator: {
    backgroundColor: c.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border,
  },
  stepText: {
    fontSize: 10,
    fontFamily: fontFamilies.pixelFont,
    color: c.textMuted,
    letterSpacing: 1,
  },
  heading: {
    fontSize: typography.headingLg.fontSize,
    fontFamily: fontFamilies.pixelFont,
    color: c.textPrimary,
    textAlign: 'center',
    lineHeight: typography.headingLg.lineHeight,
  },
  subheading: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: c.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  customSection: {
    paddingHorizontal: spacing.xl,
  },
  customLabel: {
    fontSize: 10,
    fontFamily: fontFamilies.pixelFont,
    color: c.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: c.primary,
    // Scale up slightly to indicate selection
    transform: [{ scale: 1.1 }],
  },
  swatchPressed: {
    opacity: 0.8,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
    paddingTop: spacing.md,
  },
  continueButton: {
    backgroundColor: c.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonPressed: {
    backgroundColor: c.primaryPressed,
  },
  continueButtonText: {
    fontSize: typography.bodyLg.fontSize,
    fontFamily: fontFamilies.interBold,
    color: '#FFFFFF',
  },
});
