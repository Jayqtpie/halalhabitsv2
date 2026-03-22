/**
 * FridayBoostBadge — Gold "2xXP" chip shown in HudStatBar on Fridays.
 * Fades in on mount (300ms), fades out at midnight with "Friday boost ended" text.
 * Per FRDY-02: HUD displays active Jumu'ah boost indicator on Fridays.
 */
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { isFriday } from '../../domain/friday-engine';
import { colors, typography, spacing, radius } from '../../tokens';

export function FridayBoostBadge() {
  const opacity = useSharedValue(0);
  const [boostEnded, setBoostEnded] = useState(false);

  useEffect(() => {
    // Fade in on mount
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });

    // Check every 60s if Friday has ended (D-15)
    const interval = setInterval(() => {
      if (!isFriday()) {
        opacity.value = withTiming(0, { duration: 600 });
        setTimeout(() => setBoostEnded(true), 600);
        clearInterval(interval);
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (boostEnded) {
    return (
      <Animated.View style={[styles.badge, animatedStyle]}>
        <Text style={styles.endedText}>Friday boost ended</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[styles.badge, animatedStyle]}
      accessibilityLabel="Jumu'ah 2x XP boost active"
    >
      <Text style={styles.badgeText}>2xXP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13,124,61,0.15)',
    borderWidth: 1,
    borderColor: colors.dark.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: typography.hudLabel.fontSize,
    fontFamily: 'PressStart2P-Regular',
    fontWeight: '700',
    lineHeight: typography.hudLabel.lineHeight,
    letterSpacing: 1,
    color: colors.dark.xp,
  },
  endedText: {
    fontSize: typography.bodySm.fontSize,
    fontFamily: typography.bodySm.fontFamily,
    lineHeight: typography.bodySm.lineHeight,
    color: colors.dark.textSecondary,
  },
});
