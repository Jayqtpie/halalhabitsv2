/**
 * EnvironmentReveal -- Fade-to-black overlay shown when player unlocks a new environment.
 *
 * Triggered by a level_up celebration that crosses an environment boundary
 * (levels 6, 12, 20). Sequence:
 *   1. Fade to black (400ms)
 *   2. Hold: show "New Area Unlocked" + environment name (800ms)
 *   3. Fade out (1200ms)
 *   4. Haptic + consumeCelebration
 *
 * Uses StyleSheet.absoluteFillObject (same pattern as LevelUpOverlay, Phase 4).
 * Does NOT use React Navigation modal.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../stores/gameStore';
import { getEnvironmentForLevel, ENVIRONMENT_NAMES, isEnvironmentTransition } from '../../domain/hud-environment';
import { colors, typography, spacing } from '../../tokens';
import type { LevelUpCelebration } from '../../stores/gameStore';

function triggerRevealHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

interface RevealOverlayProps {
  celebration: LevelUpCelebration;
  onComplete: () => void;
}

function RevealOverlay({ celebration, onComplete }: RevealOverlayProps) {
  const opacity = useSharedValue(0);
  const newEnvId = getEnvironmentForLevel(celebration.level);
  const envName = ENVIRONMENT_NAMES[newEnvId];
  const hasCompleted = useRef(false);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 400 }),        // fade to black
      withDelay(800, withTiming(1, { duration: 0 })), // hold
      withTiming(0, { duration: 1200 }),       // fade out
    );

    // Fire haptic at reveal moment (when fade-in completes)
    const hapticTimer = setTimeout(() => {
      runOnJS(triggerRevealHaptic)();
    }, 400);

    // Call onComplete after full animation
    const completeTimer = setTimeout(() => {
      if (!hasCompleted.current) {
        hasCompleted.current = true;
        onComplete();
      }
    }, 400 + 800 + 1200 + 100);

    return () => {
      clearTimeout(hapticTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.overlay, animStyle]}>
      <Text style={styles.unlockLabel}>New Area Unlocked</Text>
      <Text style={styles.envName}>{envName}</Text>
    </Animated.View>
  );
}

export function EnvironmentReveal() {
  const { pendingCelebrations, consumeCelebration } = useGameStore(
    useShallow((s) => ({
      pendingCelebrations: s.pendingCelebrations,
      consumeCelebration: s.consumeCelebration,
    })),
  );

  // Find the first level_up celebration that crosses an environment boundary
  const revealCelebration = pendingCelebrations.find(
    (c): c is LevelUpCelebration =>
      c.type === 'level_up' &&
      isEnvironmentTransition(c.level - 1, c.level),
  );

  if (!revealCelebration) return null;

  return (
    <RevealOverlay
      celebration={revealCelebration}
      onComplete={() => consumeCelebration()}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 998, // Below CelebrationManager (999) but above everything else
  },
  unlockLabel: {
    fontSize: typography.hudLabel.fontSize,
    fontFamily: typography.hudLabel.fontFamily,
    lineHeight: typography.hudLabel.lineHeight,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  envName: {
    fontSize: typography.headingMd.fontSize,
    fontFamily: typography.headingMd.fontFamily,
    lineHeight: typography.headingMd.lineHeight,
    color: colors.dark.xp,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
