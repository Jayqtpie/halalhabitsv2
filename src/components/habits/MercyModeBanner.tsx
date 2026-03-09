/**
 * MercyModeBanner -- compassionate streak-break notification.
 *
 * Appears at the top of the habits tab when any habit has an active mercy mode.
 * Uses exact locked copy: "Your momentum paused. The door of tawbah is always open."
 *
 * NO shame, NO guilt, NO urgency. This is a door opening, not a warning.
 * "Start fresh" is presented as equally valid to "Begin Recovery".
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import type { MercyModeState } from '../../types/habits';
import {
  colors,
  palette,
  typography,
  fontFamilies,
  spacing,
  radius,
  duration,
} from '../../tokens';

const c = colors.dark;

interface MercyModeBannerProps {
  habitName: string;
  mercyState: MercyModeState;
  /** How many additional habits are also in mercy mode */
  additionalCount?: number;
  onStartRecovery: () => void;
  onStartFresh: () => void;
  onDismiss: () => void;
}

export function MercyModeBanner({
  habitName,
  mercyState,
  additionalCount = 0,
  onStartRecovery,
  onStartFresh,
  onDismiss,
}: MercyModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss();
  }, [onDismiss]);

  if (dismissed) return null;

  // If recovery is already in progress, don't show the initial banner
  if (mercyState.recoveryDay > 0) return null;

  const nameDisplay =
    additionalCount > 0
      ? `${habitName} (and ${additionalCount} more)`
      : habitName;

  return (
    <Animated.View
      entering={SlideInUp.duration(duration.normal).springify()}
      style={styles.banner}
    >
      {/* Dismiss button */}
      <Pressable
        style={styles.dismissButton}
        onPress={handleDismiss}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Dismiss banner"
      >
        <Text style={styles.dismissText}>{'x'}</Text>
      </Pressable>

      {/* Habit name */}
      <Text style={styles.habitLabel}>{nameDisplay}</Text>

      {/* Locked copy -- exact per decision */}
      <Text style={styles.message}>
        Your momentum paused. The door of tawbah is always open.
      </Text>

      {/* Actions -- both equally prominent */}
      <View style={styles.actions}>
        <Pressable
          style={styles.recoveryButton}
          onPress={onStartRecovery}
          accessibilityRole="button"
          accessibilityLabel="Begin recovery for this habit"
        >
          <Text style={styles.recoveryButtonText}>Begin Recovery</Text>
        </Pressable>

        <Pressable
          style={styles.freshButton}
          onPress={onStartFresh}
          accessibilityRole="button"
          accessibilityLabel="Start fresh with a clean streak"
        >
          <Text style={styles.freshButtonText}>Start fresh</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: 'rgba(255, 179, 71, 0.08)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 71, 0.25)',
    padding: spacing.md,
  },
  dismissButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 14,
    color: c.textMuted,
    fontFamily: fontFamilies.inter,
  },
  habitLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: c.mercy,
    marginBottom: spacing.xs,
    paddingRight: spacing.lg, // avoid overlap with dismiss
  },
  message: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: c.textPrimary,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recoveryButton: {
    backgroundColor: c.primary,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  recoveryButtonText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: '#FFFFFF',
  },
  freshButton: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.textMuted,
  },
  freshButtonText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: c.textSecondary,
  },
});
