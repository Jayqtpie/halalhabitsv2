/**
 * LevelUpOverlay -- Full-screen level-up celebration overlay.
 *
 * Renders as an absolute-positioned View (NOT a React Native Modal) with
 * a semi-transparent dark backdrop. Animated entry via ZoomIn spring.
 *
 * Shows: large level number with glow, mentor copy text, optional bundled
 * title unlocks, and a "Continue" button (not auto-dismiss per locked decision).
 *
 * Haptic burst on mount: 3x impactAsync(Heavy) with 100ms/80ms delays.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../tokens';

interface LevelUpOverlayProps {
  level: number;
  copy: string;
  unlockedTitles: string[];
  onContinue: () => void;
}

export function LevelUpOverlay({ level, copy, unlockedTitles, onContinue }: LevelUpOverlayProps) {
  useEffect(() => {
    // Heavy haptic burst: 3 impacts with short delays
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const t1 = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    const t2 = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 180);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <View style={styles.backdrop}>
      <Animated.View
        entering={ZoomIn.duration(350).springify()}
        style={styles.card}
      >
        {/* Level number with glow */}
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>LEVEL UP</Text>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>

        {/* Mentor copy */}
        <Text style={styles.copyText}>{copy}</Text>

        {/* Bundled title unlocks (if any) */}
        {unlockedTitles.length > 0 && (
          <View style={styles.titlesSection}>
            <Text style={styles.titlesSectionLabel}>Title{unlockedTitles.length > 1 ? 's' : ''} Unlocked</Text>
            {unlockedTitles.map((titleId) => (
              <View key={titleId} style={styles.titleBadge}>
                <Text style={styles.titleBadgeText}>{titleId.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Continue button */}
        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && styles.continueButtonPressed]}
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.xp,
    // Gold glow shadow
    shadowColor: colors.dark.xp,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    width: 320,
    maxWidth: '90%',
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelLabel: {
    fontSize: typography.hudLabel.fontSize,
    lineHeight: typography.hudLabel.lineHeight,
    fontFamily: typography.hudLabel.fontFamily,
    fontWeight: '700',
    color: colors.dark.textSecondary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  levelNumber: {
    fontSize: 56,
    fontFamily: typography.headingXl.fontFamily,
    fontWeight: '700',
    color: colors.dark.xp,
    // Glow effect
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  copyText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  titlesSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  titlesSectionLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleBadge: {
    backgroundColor: colors.dark.backgroundDeep,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.dark.xp,
  },
  titleBadgeText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.xp,
    textTransform: 'capitalize',
  },
  continueButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  continueButtonPressed: {
    backgroundColor: colors.dark.primaryPressed,
  },
  continueButtonText: {
    fontSize: typography.hudLabel.fontSize,
    lineHeight: typography.hudLabel.lineHeight,
    fontFamily: typography.hudLabel.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    letterSpacing: 1,
  },
});
