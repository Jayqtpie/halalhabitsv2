/**
 * Onboarding Screen 1: Welcome splash.
 *
 * Full-screen entry point. Pixel art title with RPG intro tone.
 * Single CTA navigates to character selection.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { colors, typography, fontFamilies, spacing } from '../../src/tokens';

const c = colors.dark;

export default function WelcomeScreen() {
  const router = useRouter();

  // Fade-in for title, tagline, and button — staggered
  const titleOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    buttonOpacity.value = withDelay(1000, withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  return (
    <View style={styles.container}>
      {/* Decorative top accent */}
      <View style={styles.topAccent} />

      <View style={styles.content}>
        {/* Icon placeholder */}
        <Animated.View style={[styles.iconContainer, titleStyle as object]}>
          <Text style={styles.iconText}>{'☪'}</Text>
        </Animated.View>

        {/* Pixel art title */}
        <Animated.Text style={[styles.title, titleStyle as object]}>
          {'HalalHabits'}
        </Animated.Text>

        {/* Edition badge */}
        <Animated.View style={[styles.badge, taglineStyle as object]}>
          <Text style={styles.badgeText}>{'FERRARI 16-BIT EDITION'}</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, taglineStyle as object]}>
          {'Your discipline journey begins'}
        </Animated.Text>

        <Animated.Text style={[styles.subTagline, taglineStyle as object]}>
          {'Build the habits of a scholar.\nOne day at a time.'}
        </Animated.Text>
      </View>

      {/* CTA Button */}
      <Animated.View style={[styles.buttonContainer, buttonStyle as object]}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed ? styles.ctaButtonPressed : null] as object}
          onPress={() => router.push('/(onboarding)/character' as never)}
          accessibilityLabel="Begin Your Journey"
          accessibilityRole="button"
        >
          <Text style={styles.ctaButtonText}>{'Begin Your Journey'}</Text>
        </Pressable>
        <Text style={styles.ctaSubtext}>{'Takes about 2 minutes'}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  topAccent: {
    width: '100%',
    height: 3,
    backgroundColor: c.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: c.surface,
    borderWidth: 2,
    borderColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    lineHeight: 32,
    fontFamily: fontFamilies.pixelFont,
    color: c.textPrimary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: c.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: fontFamilies.pixelFont,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    fontFamily: typography.bodyLg.fontFamily,
    color: c.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subTagline: {
    fontSize: typography.bodyMd.fontSize,
    fontFamily: typography.bodyMd.fontFamily,
    color: c.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  ctaButton: {
    backgroundColor: c.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    // Min touch target 44px — paddingVertical 16 + text height > 44px
  },
  ctaButtonPressed: {
    backgroundColor: c.primaryPressed,
  },
  ctaButtonText: {
    fontSize: typography.bodyLg.fontSize,
    fontFamily: fontFamilies.interBold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ctaSubtext: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: c.textMuted,
  },
});
