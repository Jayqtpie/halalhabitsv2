/**
 * FridayMessageBanner — Overlay showing Friday hadith message on first Friday open.
 * Positioned at top of HudScene, auto-dismisses after 8s.
 * Per FRDY-04, D-02: integrated into HUD game world as overlay, not modal/toast.
 */
import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getWeekNumber } from '../../domain/friday-engine';
import { getFridayMessage } from '../../domain/notification-copy';
import { colors, typography, spacing, radius } from '../../tokens';

interface FridayMessageBannerProps {
  isFirstOpen: boolean;
  onDismiss: () => void;
}

export function FridayMessageBanner({ isFirstOpen, onDismiss }: FridayMessageBannerProps) {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const dismissedRef = useRef(false);

  const weekNum = getWeekNumber();
  const { text, source } = getFridayMessage(weekNum);

  useEffect(() => {
    // Fade in on mount
    opacity.value = withTiming(1, { duration: 300 });

    if (isFirstOpen) {
      // Auto-dismiss after 8s with 400ms fade out
      opacity.value = withDelay(8000, withTiming(0, { duration: 400 }));
      const timer = setTimeout(() => {
        if (!dismissedRef.current) {
          dismissedRef.current = true;
          onDismiss();
        }
      }, 8400); // 8000ms delay + 400ms fade
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isFirstOpen, onDismiss, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  function handlePress() {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    opacity.value = withTiming(0, { duration: 400 });
    setTimeout(onDismiss, 400);
  }

  if (isFirstOpen) {
    return (
      <Animated.View
        style={[
          styles.banner,
          { top: insets.top + spacing.md },
          animatedStyle,
        ]}
        accessibilityRole="alert"
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
          <Text style={styles.messageText}>{text}</Text>
          {source ? (
            <Text style={styles.attributionText}>({source})</Text>
          ) : null}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Condensed pill variant (isFirstOpen=false)
  return (
    <Animated.View
      style={[
        styles.pill,
        { top: insets.top + spacing.md },
        animatedStyle,
      ]}
      accessibilityLiveRegion="polite"
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
        <View style={styles.pillRow}>
          <Text style={styles.pillText} numberOfLines={1}>
            {source ? `${text} (${source})` : text}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.dark.hud.overlayBg,
    borderWidth: 1,
    borderColor: colors.dark.hud.overlayBorder,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  messageText: {
    fontSize: typography.bodyMd.fontSize,
    fontFamily: typography.bodyMd.fontFamily,
    lineHeight: typography.bodyMd.lineHeight,
    color: colors.dark.textPrimary,
  },
  attributionText: {
    marginTop: spacing.xs,
    fontSize: typography.caption.fontSize,
    fontFamily: typography.caption.fontFamily,
    lineHeight: typography.caption.lineHeight,
    color: colors.dark.xp,
  },
  pill: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.dark.hud.overlayBg,
    borderWidth: 1,
    borderColor: colors.dark.hud.overlayBorder,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    flex: 1,
    fontSize: typography.bodySm.fontSize,
    fontFamily: typography.bodySm.fontFamily,
    lineHeight: typography.bodySm.lineHeight,
    color: colors.dark.textPrimary,
  },
});
