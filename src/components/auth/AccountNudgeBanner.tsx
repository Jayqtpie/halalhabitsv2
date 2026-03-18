/**
 * AccountNudgeBanner — non-blocking bottom banner nudging guests to create an account.
 *
 * Appears after the first milestone (title unlock or level-up) when the user
 * has no account. Uses Mercy Orange to signal warmth, not warning.
 *
 * Animation:
 *   - Enter: translateY from +80 to 0, 250ms, ease-out
 *   - Exit:  translateY from 0 to +80, 200ms, ease-in
 *
 * On dismiss: calls setNudgeDismissed(true) — never reappears.
 *
 * Props:
 *   titleName      — the unlocked title name to show in body copy
 *   onCreateAccount — navigate to create-account screen
 *   onDismiss       — dismiss the banner (also sets store flag)
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '../../tokens';
import { useAuthStore } from '../../stores/authStore';

interface AccountNudgeBannerProps {
  titleName: string;
  onCreateAccount: () => void;
  onDismiss: () => void;
}

export function AccountNudgeBanner({
  titleName,
  onCreateAccount,
  onDismiss,
}: AccountNudgeBannerProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const nudgeDismissed = useAuthStore((s) => s.nudgeDismissed);

  const translateY = useSharedValue(80);

  // Animate in on mount
  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (isAuthenticated || nudgeDismissed) {
    return null;
  }

  const handleDismiss = () => {
    translateY.value = withTiming(80, {
      duration: 200,
      easing: Easing.in(Easing.ease),
    });
    // Call dismiss after exit animation
    setTimeout(() => {
      useAuthStore.getState().setNudgeDismissed(true);
      onDismiss();
    }, 210);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Left accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.content}>
        <Text style={styles.bannerTitle}>Your progress is safe — for now.</Text>
        <Text style={styles.bannerBody}>
          You've earned {titleName}. Create a free account to back up your discipline across devices.
        </Text>
        <Pressable
          style={styles.ctaButton}
          onPress={onCreateAccount}
          accessibilityRole="button"
          accessibilityLabel="Keep My Progress — create a free account"
        >
          <Text style={styles.ctaText}>Keep My Progress</Text>
        </Pressable>
      </View>

      {/* Dismiss button */}
      <Pressable
        style={styles.dismissButton}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss banner"
        hitSlop={8}
      >
        <Text style={styles.dismissIcon}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.dark.surface,
    // Mercy orange at 15% opacity tint via borderLeftColor accent
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 179, 71, 0.3)',
    // Subtle mercy tint on surface-800
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
    backgroundColor: colors.dark.mercy,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  bannerTitle: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.mercy,
    fontWeight: '600',
  },
  bannerBody: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textPrimary,
  },
  ctaButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dismissButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  dismissIcon: {
    fontSize: 16,
    color: colors.dark.textMuted,
    lineHeight: 20,
  },
});
