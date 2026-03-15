/**
 * XPFloatLabel -- Floating XP reward number that rises from a habit card on completion.
 *
 * Renders at an absolute position on screen, animates upward 80px while fading out
 * over 1.2s total duration. Format: "15 x 1.5x = +22 XP" (shows cappedXP).
 *
 * Must be rendered in a root-level overlay container (NOT inside FlatList).
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { typography, colors } from '../../tokens';

interface XPFloatLabelProps {
  xpText: string;
  startX: number;
  startY: number;
  onDone: () => void;
}

export function XPFloatLabel({ xpText, startX, startY, onDone }: XPFloatLabelProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Float up 80px over 1200ms
    translateY.value = withTiming(-80, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });

    // Hold visible for 600ms, then fade out over 600ms
    opacity.value = withDelay(
      600,
      withTiming(0, { duration: 600 }, (finished) => {
        if (finished) {
          runOnJS(onDone)();
        }
      }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { left: startX, top: startY },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Text style={styles.xpText}>{xpText}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  xpText: {
    fontSize: 13,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.xp,
    // Text shadow for readability on any background
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
