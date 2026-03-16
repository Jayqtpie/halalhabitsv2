/**
 * Interactive HUD tour overlay component.
 *
 * 3 spotlight steps with tooltip bubbles teaching navigation.
 * Skippable via "Skip" button. Uses Reanimated for fade transitions.
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, fontFamilies, spacing, typography } from '../../tokens';

const c = colors.dark;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Tour Step Definitions ─────────────────────────────────────────────────

export interface TourStep {
  id: string;
  title: string;
  description: string;
  spotlightArea: { x: number; y: number; width: number; height: number };
  tooltipPosition: 'above' | 'below';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'habits',
    title: 'Your Daily Habits',
    description: 'Tap here to track your daily habits and build discipline.',
    spotlightArea: {
      x: SCREEN_WIDTH * 0.05,
      y: SCREEN_HEIGHT * 0.5,
      width: SCREEN_WIDTH * 0.4,
      height: 60,
    },
    tooltipPosition: 'above',
  },
  {
    id: 'quests',
    title: 'Quest Board',
    description: 'Complete quests for bonus XP and rare rewards.',
    spotlightArea: {
      x: SCREEN_WIDTH * 0.5,
      y: SCREEN_HEIGHT * 0.5,
      width: SCREEN_WIDTH * 0.4,
      height: 60,
    },
    tooltipPosition: 'above',
  },
  {
    id: 'ready',
    title: "You're Ready",
    description: 'Your journey of a thousand miles begins with a single step. Go.',
    spotlightArea: {
      x: SCREEN_WIDTH * 0.25,
      y: SCREEN_HEIGHT * 0.4,
      width: SCREEN_WIDTH * 0.5,
      height: 80,
    },
    tooltipPosition: 'below',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────

interface HudTourOverlayProps {
  currentStep: number;
  onNextStep: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function HudTourOverlay({
  currentStep,
  onNextStep,
  onSkip,
  onComplete,
}: HudTourOverlayProps) {
  const step = TOUR_STEPS[currentStep];
  const tooltipOpacity = useSharedValue(1);

  const animatedTooltip = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
  }));

  const handleNext = useCallback(() => {
    // Fade out, advance, fade in
    tooltipOpacity.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) }, () => {
      tooltipOpacity.value = withTiming(1, { duration: 300, easing: Easing.in(Easing.ease) });
    });

    if (currentStep >= TOUR_STEPS.length - 1) {
      onComplete();
    } else {
      onNextStep();
    }
  }, [currentStep, onComplete, onNextStep, tooltipOpacity]);

  const isLastStep = currentStep >= TOUR_STEPS.length - 1;
  const spotlightY = step.spotlightArea.y;
  const isTooltipAbove = step.tooltipPosition === 'above';

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Dark overlay background */}
      <View style={styles.dimLayer} pointerEvents="none" />

      {/* Spotlight removed — dim layer can't be cut through without SVG masks.
         Tooltips are self-explanatory without highlighting. */}

      {/* Skip button */}
      <Pressable
        style={({ pressed }) => [styles.skipButton, pressed ? styles.skipButtonPressed : undefined]}
        onPress={onSkip}
        accessibilityLabel="Skip tour"
        accessibilityRole="button"
      >
        <Text style={styles.skipText}>{'Skip'}</Text>
      </Pressable>

      {/* Tooltip */}
      <Animated.View
        style={[
          styles.tooltip,
          animatedTooltip as object,
          isTooltipAbove
            ? { bottom: SCREEN_HEIGHT - spotlightY + spacing.md } as object
            : { top: spotlightY + step.spotlightArea.height + spacing.md } as object,
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.tooltipContent}>
          <Text style={styles.tooltipStep}>
            {`${currentStep + 1} / ${TOUR_STEPS.length}`}
          </Text>
          <Text style={styles.tooltipTitle}>{step.title}</Text>
          <Text style={styles.tooltipDesc}>{step.description}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.nextButton, pressed ? styles.nextButtonPressed : undefined]}
          onPress={handleNext}
          accessibilityLabel={isLastStep ? 'Start your journey' : 'Next tip'}
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? "Let's go!" : 'Next'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  dimLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 17, 32, 0.85)',
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonPressed: {
    opacity: 0.6,
  },
  skipText: {
    fontSize: 14,
    fontFamily: fontFamilies.interSemiBold,
    color: c.textMuted,
  },
  tooltip: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: c.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.primary,
    padding: spacing.lg,
    gap: spacing.md,
    // Glow
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tooltipContent: {
    gap: spacing.sm,
  },
  tooltipStep: {
    fontSize: 9,
    fontFamily: fontFamilies.pixelFont,
    color: c.primary,
    letterSpacing: 1,
  },
  tooltipTitle: {
    fontSize: 13,
    fontFamily: fontFamilies.pixelFont,
    color: c.textPrimary,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  tooltipDesc: {
    fontSize: typography.bodyMd.fontSize,
    fontFamily: typography.bodyMd.fontFamily,
    color: c.textSecondary,
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: c.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  nextButtonPressed: {
    backgroundColor: c.primaryPressed,
  },
  nextButtonText: {
    fontSize: 14,
    fontFamily: fontFamilies.interBold,
    color: '#FFFFFF',
  },
});
