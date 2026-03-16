/**
 * Onboarding Screen 3: Set Your Niyyah.
 *
 * Multi-select up to 3 intentions (motivations). Seasonal options shown
 * automatically based on current Hijri month. Requires at least 1 selection.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { getAvailableNiyyahOptions } from '../../src/domain/niyyah-options';
import { NiyyahSelector } from '../../src/components/onboarding/NiyyahSelector';
import { colors, typography, fontFamilies, spacing } from '../../src/tokens';

const c = colors.dark;

const MAX_SELECTIONS = 3;

export default function NiyyahScreen() {
  const router = useRouter();
  const setSelectedNiyyahs = useSettingsStore((s) => s.setSelectedNiyyahs);
  const existingNiyyahs = useSettingsStore((s) => s.selectedNiyyahs);

  const [selectedIds, setSelectedIds] = useState<string[]>(existingNiyyahs);

  // Get seasonally-filtered options
  const availableOptions = getAvailableNiyyahOptions();

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_SELECTIONS) {
        return prev; // Max reached — ignore
      }
      return [...prev, id];
    });
  };

  const handleContinue = () => {
    if (selectedIds.length === 0) return; // Guard: require at least 1
    setSelectedNiyyahs(selectedIds);
    router.push('/(onboarding)/habits' as never);
  };

  const canContinue = selectedIds.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{'3 / 5'}</Text>
        </View>
        <Text style={styles.heading}>{'Set Your Niyyah'}</Text>
        <Text style={styles.subheading}>
          {'What brings you here?'}
        </Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {`${selectedIds.length} / ${MAX_SELECTIONS} selected`}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>{'PICK UP TO 3'}</Text>

        <NiyyahSelector
          options={availableOptions}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          maxSelections={MAX_SELECTIONS}
        />

        <Text style={styles.niyyahNote}>
          {'Your intention is between you and Allah. This helps us personalize your journey.'}
        </Text>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !canContinue ? styles.continueButtonDisabled : undefined,
            pressed && canContinue ? styles.continueButtonPressed : undefined,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
          accessibilityLabel="Continue to habit selection"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
        >
          <Text style={[styles.continueButtonText, !canContinue && styles.continueButtonTextDisabled]}>
            {'Continue'}
          </Text>
        </Pressable>
        {!canContinue && (
          <Text style={styles.requirementText}>{'Select at least one intention to continue'}</Text>
        )}
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
  countBadge: {
    backgroundColor: c.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
  },
  countText: {
    fontSize: 11,
    fontFamily: fontFamilies.interSemiBold,
    color: c.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: fontFamilies.pixelFont,
    color: c.textMuted,
    letterSpacing: 2,
  },
  niyyahNote: {
    fontSize: typography.bodySm.fontSize,
    fontFamily: typography.bodySm.fontFamily,
    color: c.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
    paddingTop: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: c.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  continueButtonPressed: {
    backgroundColor: c.primaryPressed,
  },
  continueButtonText: {
    fontSize: typography.bodyLg.fontSize,
    fontFamily: fontFamilies.interBold,
    color: '#FFFFFF',
  },
  continueButtonTextDisabled: {
    color: c.textMuted,
  },
  requirementText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: c.textMuted,
    textAlign: 'center',
  },
});
