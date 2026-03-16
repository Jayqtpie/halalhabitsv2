/**
 * Onboarding Screen 5: Interactive HUD Tour.
 *
 * 3-step spotlight tour teaching navigation.
 * Skippable. On completion: sets onboardingComplete=true, navigates to tabs.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { HudTourOverlay } from '../../src/components/onboarding/HudTourOverlay';
import { colors, typography, fontFamilies, spacing } from '../../src/tokens';

const c = colors.dark;

// Simplified HUD preview elements for the tour background
function HudPreviewBackground() {
  return (
    <View style={styles.hudPreview}>
      {/* Top bar */}
      <View style={styles.hudTopBar}>
        <View style={styles.hudLevelBadge}>
          <Text style={styles.hudLevelText}>{'LVL 1'}</Text>
        </View>
        <View style={styles.hudXpBar}>
          <View style={[styles.hudXpFill, { width: '12%' }]} />
        </View>
        <View style={styles.hudXpLabel}>
          <Text style={styles.hudXpText}>{'0 XP'}</Text>
        </View>
      </View>

      {/* Center scene placeholder */}
      <View style={styles.hudScene}>
        <Text style={styles.hudSceneIcon}>{'🕌'}</Text>
        <Text style={styles.hudSceneLabel}>{'Quiet Study'}</Text>
      </View>

      {/* Bottom tab bar preview */}
      <View style={styles.hudTabBar}>
        <View style={styles.hudTab}>
          <Text style={styles.hudTabIcon}>{'🏠'}</Text>
          <Text style={styles.hudTabLabel}>{'Home'}</Text>
        </View>
        <View style={[styles.hudTab, styles.hudTabActive]}>
          <Text style={styles.hudTabIcon}>{'📋'}</Text>
          <Text style={styles.hudTabLabel}>{'Habits'}</Text>
        </View>
        <View style={styles.hudTab}>
          <Text style={styles.hudTabIcon}>{'⚔️'}</Text>
          <Text style={styles.hudTabLabel}>{'Quests'}</Text>
        </View>
        <View style={styles.hudTab}>
          <Text style={styles.hudTabIcon}>{'👤'}</Text>
          <Text style={styles.hudTabLabel}>{'Profile'}</Text>
        </View>
      </View>
    </View>
  );
}

export default function TourScreen() {
  const router = useRouter();
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);

  const [currentStep, setCurrentStep] = useState(0);

  const finishOnboarding = useCallback(() => {
    setOnboardingComplete(true);
    router.replace('/(tabs)');
  }, [setOnboardingComplete, router]);

  const handleNextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  return (
    <View style={styles.container}>
      {/* Step indicator */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{'5 / 5'}</Text>
        </View>
        <Text style={styles.heading}>{'Quick Tour'}</Text>
      </View>

      {/* HUD Preview Background */}
      <HudPreviewBackground />

      {/* Overlay Tour */}
      <HudTourOverlay
        currentStep={currentStep}
        onNextStep={handleNextStep}
        onSkip={finishOnboarding}
        onComplete={finishOnboarding}
      />
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
    paddingBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: 1,
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
  // HUD preview styles
  hudPreview: {
    flex: 1,
    backgroundColor: c.background,
  },
  hudTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  hudLevelBadge: {
    backgroundColor: c.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hudLevelText: {
    fontSize: 8,
    fontFamily: fontFamilies.pixelFont,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  hudXpBar: {
    flex: 1,
    height: 8,
    backgroundColor: c.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  hudXpFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  hudXpLabel: {
    minWidth: 40,
  },
  hudXpText: {
    fontSize: 8,
    fontFamily: fontFamilies.pixelFont,
    color: c.textMuted,
    letterSpacing: 0.5,
  },
  hudScene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  hudSceneIcon: {
    fontSize: 64,
  },
  hudSceneLabel: {
    fontSize: 10,
    fontFamily: fontFamilies.pixelFont,
    color: c.textMuted,
    letterSpacing: 1,
  },
  hudTabBar: {
    flexDirection: 'row',
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingBottom: 24,
    paddingTop: spacing.sm,
  },
  hudTab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  hudTabActive: {
    borderTopWidth: 2,
    borderTopColor: c.primary,
    marginTop: -1,
  },
  hudTabIcon: {
    fontSize: 20,
  },
  hudTabLabel: {
    fontSize: 8,
    fontFamily: fontFamilies.pixelFont,
    color: c.textMuted,
    letterSpacing: 0.5,
  },
});
