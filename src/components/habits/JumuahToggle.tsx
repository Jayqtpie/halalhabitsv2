/**
 * JumuahToggle -- Friday-only honor-system toggle for Jumu'ah (Friday prayer) attendance.
 *
 * Rendered as an inline footer row appended inside the Dhuhr HabitCard on Fridays.
 * This is NOT a separate card — it is a secondary row below the Dhuhr habit row,
 * inside the card boundary.
 *
 * Honor-system: no external verification, no XP gating. The toggle is purely
 * a personal acknowledgment. Toggling ON fires haptic feedback.
 *
 * Adab safety:
 *   - No guilt copy, no shame framing
 *   - "Attended Jumu'ah prayer today?" — honor system, invitational
 *   - No data leaves device (local component state only)
 *
 * Accessibility: accessibilityRole="checkbox" on the toggle, correct accessibilityState.
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, palette, typography, spacing, radius } from '../../tokens';

// ─── Component ───────────────────────────────────────────────────────────────

interface JumuahToggleProps {
  /** Whether Jumu'ah attendance has been confirmed */
  isToggled: boolean;
  /** Called with the new toggled state when user taps */
  onToggle: (isToggled: boolean) => void;
}

export function JumuahToggle({ isToggled, onToggle }: JumuahToggleProps) {
  const handleToggle = useCallback(() => {
    const newState = !isToggled;

    if (newState) {
      // Haptic feedback on toggle ON only
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    onToggle(newState);
  }, [isToggled, onToggle]);

  return (
    <View style={styles.container}>
      {/* "Jumu'ah" badge pill */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{"Jumu'ah"}</Text>
      </View>

      {/* Label */}
      <Text style={styles.label} numberOfLines={1}>
        {"Attended Jumu'ah prayer today?"}
      </Text>

      {/* Toggle circle */}
      <Pressable
        onPress={handleToggle}
        style={[styles.toggleCircle, isToggled && styles.toggleCircleActive]}
        accessibilityRole="checkbox"
        accessibilityLabel={"Jumu'ah prayer attended"}
        accessibilityState={{ checked: isToggled }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isToggled && (
          <Text style={styles.checkMark}>{'✓'}</Text>
        )}
      </Pressable>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const EMERALD = palette['emerald-400']; // #34D399

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(52,211,153,0.08)',
    gap: spacing.sm,
  },

  // Badge pill
  badge: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderColor: EMERALD,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: EMERALD,
  },

  // Label
  label: {
    flex: 1,
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textPrimary,
  },

  // Toggle
  toggleCircle: {
    width: 32,
    height: 32,
    borderRadius: 16, // full circle
    borderWidth: 2,
    borderColor: colors.dark.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toggleCircleActive: {
    backgroundColor: EMERALD,
    borderColor: EMERALD,
  },
  checkMark: {
    color: colors.dark.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
