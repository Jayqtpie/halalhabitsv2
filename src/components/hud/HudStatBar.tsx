/**
 * HudStatBar -- Translucent stat overlay at the bottom of the Home HUD.
 *
 * Shows left to right: LevelBadge | XPProgressBar | streak count | PrayerCountdown.
 *
 * Platform-aware blur:
 *   iOS:     BlurView intensity={60} tint="dark" (native frosted glass)
 *   Android: View with rgba(0,0,0,0.75) background (expo-blur BlurTargetView complexity avoided)
 *
 * Positioned absolutely over the Skia Canvas layer.
 */
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { LevelBadge } from '../game/LevelBadge';
import { XPProgressBar } from '../game/XPProgressBar';
import { PrayerCountdown } from './PrayerCountdown';
import { useHabitStore } from '../../stores/habitStore';
import { colors, typography, spacing, radius } from '../../tokens';

function BestStreakDisplay() {
  const { streaks } = useHabitStore(
    useShallow((s) => ({ streaks: s.streaks })),
  );

  const bestStreak = Math.max(
    0,
    ...Object.values(streaks).map((s) => s.currentCount),
  );

  if (bestStreak === 0) return null;

  return (
    <View style={styles.streakContainer}>
      <Text style={styles.streakEmoji}>🔥</Text>
      <Text style={styles.streakText} numberOfLines={1}>
        {bestStreak}d
      </Text>
    </View>
  );
}

export function HudStatBar() {
  const insets = useSafeAreaInsets();
  const containerStyle = [
    styles.container,
    { paddingBottom: insets.bottom + 8 },
  ];

  const content = (
    <View style={styles.row}>
      <LevelBadge />
      <View style={styles.divider} />
      <View style={styles.xpBarContainer}>
        <XPProgressBar />
      </View>
      <View style={styles.divider} />
      <BestStreakDisplay />
      <View style={styles.divider} />
      <PrayerCountdown />
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={60}
        tint="dark"
        style={containerStyle}
      >
        {content}
      </BlurView>
    );
  }

  // Android fallback: solid semi-transparent background
  return (
    <View style={[containerStyle, styles.androidBackground]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  androidBackground: {
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  xpBarContainer: {
    flex: 1,
    minWidth: 80,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  streakEmoji: {
    fontSize: 12,
    lineHeight: 16,
  },
  streakText: {
    fontSize: typography.caption.fontSize,
    fontFamily: typography.caption.fontFamily,
    lineHeight: typography.caption.lineHeight,
    color: colors.dark.xp,
  },
});
