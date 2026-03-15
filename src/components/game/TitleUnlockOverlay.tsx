/**
 * TitleUnlockOverlay -- Full-screen title unlock celebration overlay.
 *
 * Renders as absolute-positioned View (NOT Modal) with semi-transparent backdrop.
 * Shows title name, rarity badge (color-coded), and flavor text.
 * "Equip" (primary) and "Later" (ghost secondary) buttons.
 *
 * Haptic: notificationAsync(Success) on mount.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Title } from '../../types/database';
import { colors, typography, spacing, radius } from '../../tokens';

interface TitleUnlockOverlayProps {
  title: Title;
  onEquip: () => void;
  onLater: () => void;
}

type Rarity = 'common' | 'rare' | 'legendary';

function getRarityColors(rarity: string) {
  const r = rarity as Rarity;
  if (r === 'legendary') {
    return {
      badge: colors.dark.rarity.legendary.badge,
      text: colors.dark.rarity.legendary.text,
      glow: colors.dark.rarity.legendary.glow,
      label: 'LEGENDARY',
    };
  }
  if (r === 'rare') {
    return {
      badge: colors.dark.rarity.rare.badge,
      text: colors.dark.rarity.rare.text,
      glow: colors.dark.rarity.rare.glow,
      label: 'RARE',
    };
  }
  // common (default)
  return {
    badge: colors.dark.rarity.common.badge,
    text: colors.dark.rarity.common.text,
    glow: colors.dark.rarity.common.glow,
    label: 'COMMON',
  };
}

export function TitleUnlockOverlay({ title, onEquip, onLater }: TitleUnlockOverlayProps) {
  const rarity = getRarityColors(title.rarity);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.backdrop}>
      <Animated.View
        entering={ZoomIn.duration(350).springify()}
        style={[styles.card, { borderColor: rarity.glow, shadowColor: rarity.glow }]}
      >
        {/* Title unlock label */}
        <Text style={styles.unlockLabel}>Title Unlocked</Text>

        {/* Rarity badge */}
        <View style={[styles.rarityBadge, { backgroundColor: rarity.badge }]}>
          <Text style={[styles.rarityText, { color: rarity.text }]}>{rarity.label}</Text>
        </View>

        {/* Title name */}
        <Text style={[styles.titleName, { color: rarity.text }]}>{title.name}</Text>

        {/* Flavor text */}
        {title.flavorText ? (
          <Text style={styles.flavorText}>{title.flavorText}</Text>
        ) : null}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [styles.laterButton, pressed && styles.laterButtonPressed]}
            onPress={onLater}
            accessibilityRole="button"
            accessibilityLabel="Equip later"
          >
            <Text style={styles.laterButtonText}>Later</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.equipButton, pressed && styles.equipButtonPressed]}
            onPress={onEquip}
            accessibilityRole="button"
            accessibilityLabel="Equip this title"
          >
            <Text style={styles.equipButtonText}>Equip</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
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
    // Shadow set dynamically per rarity
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    width: 320,
    maxWidth: '90%',
  },
  unlockLabel: {
    fontSize: typography.hudLabel.fontSize,
    lineHeight: typography.hudLabel.lineHeight,
    fontFamily: typography.hudLabel.fontFamily,
    fontWeight: '700',
    color: colors.dark.textSecondary,
    letterSpacing: 2,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  rarityBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  rarityText: {
    fontSize: 10,
    fontFamily: typography.hudLabel.fontFamily,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  titleName: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
    // Glow effect handled by rarity color contrast
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  flavorText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.xs,
  },
  laterButton: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.dark.textMuted,
    minHeight: 44,
  },
  laterButtonPressed: {
    borderColor: colors.dark.textSecondary,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  laterButtonText: {
    fontSize: typography.hudLabel.fontSize,
    lineHeight: typography.hudLabel.lineHeight,
    fontFamily: typography.hudLabel.fontFamily,
    fontWeight: '700',
    color: colors.dark.textSecondary,
    letterSpacing: 1,
  },
  equipButton: {
    flex: 2,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.primary,
    minHeight: 44,
  },
  equipButtonPressed: {
    backgroundColor: colors.dark.primaryPressed,
  },
  equipButtonText: {
    fontSize: typography.hudLabel.fontSize,
    lineHeight: typography.hudLabel.lineHeight,
    fontFamily: typography.hudLabel.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    letterSpacing: 1,
  },
});
