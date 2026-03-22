/**
 * DetoxShieldBadge — small inline badge displayed on HabitCards during
 * an active Dopamine Detox session.
 *
 * Shows "PROTECTED" in PressStart2P pixel font (hudLabel token, 10px) with
 * emerald primary fill tint, indicating the habit streak is protected while
 * the player is inside the dungeon.
 *
 * Stateless visual component — caller is responsible for conditional rendering.
 * Accessibility label provided for screen readers.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../tokens';

// ─── Component ───────────────────────────────────────────────────────────────

export function DetoxShieldBadge() {
  return (
    <View
      style={styles.badge}
      accessibilityLabel="Habit streak protected during detox session"
      accessible={true}
    >
      <Text style={styles.label}>PROTECTED</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13,124,61,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    // Ensure min tap target affordance via parent wrapping if needed
    // This badge itself is non-interactive
  },
  label: {
    fontSize: typography.hudLabel.fontSize,
    lineHeight: typography.hudLabel.lineHeight,
    fontFamily: typography.hudLabel.fontFamily,
    fontWeight: '700',
    letterSpacing: typography.hudLabel.letterSpacing,
    color: colors.dark.primary,
  },
});
