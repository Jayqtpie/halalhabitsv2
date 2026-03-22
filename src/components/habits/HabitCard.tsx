/**
 * HabitCard -- individual habit card with icon, name, streak, time window,
 * and tap-to-complete button.
 *
 * Completion triggers a scale pulse on the checkmark, a brief emerald glow
 * on the card border, and haptic feedback (if enabled in settings).
 *
 * Completed cards show a dimmed state. Streak uses "momentum" framing per
 * STRK-05 (never "streak" or "perfection").
 *
 * Prayer time windows are informational only -- users can always complete.
 *
 * Icon rendering: pixel art PNGs via React Native Image (not Skia -- this
 * component is a standard RN view, not inside a Skia Canvas). Icons are
 * rendered at 32x32 matching the source PNG size for crisp pixel art.
 *
 * Icon design intent (for future asset creation with pixel art tool):
 *   habit-salah.png   — Mihrab arch / prayer rug silhouette (emerald tones)
 *   habit-quran.png   — Open book with gold star (sapphire blue + gold)
 *   habit-dhikr.png   — Tasbih beads in a loop (violet / amethyst)
 *   habit-fasting.png — Crescent moon + stars (deep blue / golden)
 *   habit-dua.png     — Raised open hands (warm amber)
 *   habit-custom.png  — 4-pointed sparkle star (bright gold)
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  View,
  Animated,
  Image,
  type ImageSourcePropType,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../../stores/settingsStore';
import { PrayerTimeWindow } from '../prayer/PrayerTimeWindow';
import type { HabitWithStatus } from '../../types/habits';
import { colors, palette, typography, spacing, radius, duration } from '../../tokens';
import { isFriday } from '../../domain/friday-engine';
import { JumuahToggle } from './JumuahToggle';

// ── Pixel art icon map ───────────────────────────────────────────────────────
// Keyed by habit.category (PresetCategory) with 'custom' as fallback.
// Uses React Native Image — NOT Skia Image (this component is a standard RN view).
// Render at 32x32 matching source PNG size for crisp pixel art (no upscaling blur).
const HABIT_ICONS: Record<string, ImageSourcePropType> = {
  salah:     require('../../../assets/icons/habit-salah.png'),
  quran:     require('../../../assets/icons/habit-quran.png'),
  dhikr:     require('../../../assets/icons/habit-dhikr.png'),
  fasting:   require('../../../assets/icons/habit-fasting.png'),
  dua:       require('../../../assets/icons/habit-dua.png'),
  character: require('../../../assets/icons/habit-custom.png'), // character habits use generic icon
  custom:    require('../../../assets/icons/habit-custom.png'),
};

interface HabitCardProps {
  habit: HabitWithStatus;
  onComplete: (habitId: string) => void;
  onLongPress?: (habitId: string) => void;
  /** Optional: called with screen position of the card center for XP float label */
  onCompleteWithPosition?: (habitId: string, x: number, y: number) => void;
}

export function HabitCard({ habit, onComplete, onLongPress, onCompleteWithPosition }: HabitCardProps) {
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const completed = habit.completedToday;

  // Friday-only: Jumu'ah toggle for Dhuhr slot
  const isDhuhr = habit.type === 'salah_dhuhr';
  const [jumuahToggled, setJumuahToggled] = useState(false);

  // Ref for measuring card position
  const cardRef = useRef<View>(null);

  // ── Animations (RN Animated) ────────────────────────────────────────
  const checkScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const handleComplete = useCallback(() => {
    if (completed) return;

    // Scale pulse on checkmark: 1.0 -> 1.3 -> 1.0
    Animated.sequence([
      Animated.spring(checkScale, {
        toValue: 1.3,
        damping: 8,
        stiffness: 300,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1.0,
        damping: 12,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Brief emerald glow on card border
    Animated.sequence([
      Animated.timing(glowOpacity, {
        toValue: 0.8,
        duration: duration.fast,
        useNativeDriver: false,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: duration.normal,
        useNativeDriver: false,
      }),
    ]).start();

    // Haptic pulse
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Measure card position for XP float label
    if (onCompleteWithPosition && cardRef.current) {
      cardRef.current.measureInWindow((x, y, _width, height) => {
        // Position float at top-center of card
        onCompleteWithPosition(habit.id, x + 60, y + height * 0.3);
      });
    }

    onComplete(habit.id);
  }, [completed, hapticEnabled, habit.id, onComplete, onCompleteWithPosition, checkScale, glowOpacity]);

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      if (hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      onLongPress(habit.id);
    }
  }, [hapticEnabled, habit.id, onLongPress]);

  // ── Streak Display ──────────────────────────────────────────────────
  const streakCount = habit.streak?.currentCount ?? 0;

  /**
   * Streak Shield: purely visual indicator shown when a salah habit is
   * completed within its prayer window. XP bonus calculation is Phase 4.
   */
  const showStreakShield =
    completed &&
    habit.prayerWindow?.status === 'active' &&
    habit.type === 'salah';

  // Interpolate glow opacity to border color
  const glowBorderColor = glowOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(13, 124, 61, 0)', 'rgba(13, 124, 61, 1)'],
  });
  const glowBorderWidth = glowOpacity.interpolate({
    inputRange: [0, 0.01, 1],
    outputRange: [1, 2, 2],
  });

  return (
    <Animated.View
      ref={cardRef}
      style={[
        styles.card,
        completed && styles.cardCompleted,
        { borderColor: glowBorderColor, borderWidth: glowBorderWidth },
      ]}
    >
      <Pressable
        style={styles.cardInner}
        onPress={handleComplete}
        onLongPress={handleLongPress}
        accessibilityRole="button"
        accessibilityLabel={`${habit.name}${completed ? ', completed' : ''}`}
        accessibilityHint={completed ? undefined : 'Double tap to complete this habit'}
      >
        {/* Left: Pixel art icon */}
        <View style={styles.iconContainer}>
          <Image
            source={HABIT_ICONS[habit.category] ?? HABIT_ICONS.custom}
            style={styles.icon}
            resizeMode="contain"
            accessibilityLabel={`${habit.name} icon`}
          />
        </View>

        {/* Center: Name, time window, streak */}
        <View style={styles.centerContent}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.habitName, completed && styles.textCompleted]}
              numberOfLines={1}
            >
              {habit.name}
            </Text>
            {isDhuhr && isFriday() && (
              <View style={styles.jumuahInlineBadge}>
                <Text style={styles.jumuahInlineBadgeText}>{"Jumu'ah"}</Text>
              </View>
            )}
          </View>
          <PrayerTimeWindow prayerWindow={habit.prayerWindow} />
          <View style={styles.metaRow}>
            {streakCount > 0 && (
              <Text style={styles.streakText}>
                {streakCount}-day momentum
              </Text>
            )}
            {showStreakShield && (
              <View style={styles.shieldBadge}>
                <Text style={styles.shieldIcon}>{'🛡️'}</Text>
                <Text style={styles.shieldText}>Streak Shield</Text>
              </View>
            )}
          </View>
        </View>

        {/* Right: Completion circle */}
        <Animated.View style={[styles.checkContainer, { transform: [{ scale: checkScale }] }]}>
          <View
            style={[
              styles.checkCircle,
              completed && styles.checkCircleComplete,
            ]}
          >
            {completed && <Text style={styles.checkMark}>{'✓'}</Text>}
          </View>
        </Animated.View>
      </Pressable>

      {/* Friday-only: Jumu'ah toggle below Dhuhr card */}
      {isDhuhr && isFriday() && (
        <JumuahToggle
          isToggled={jumuahToggled}
          onToggle={(toggled) => {
            setJumuahToggled(toggled);
          }}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 72,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  cardCompleted: {
    opacity: 0.55,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.dark.backgroundDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    width: 32,
    height: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  jumuahInlineBadge: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderColor: palette['emerald-400'],
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    flexShrink: 0,
  },
  jumuahInlineBadgeText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: palette['emerald-400'],
  },
  habitName: {
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    fontFamily: typography.bodyLg.fontFamily,
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  textCompleted: {
    color: colors.dark.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  streakText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.xp,
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  shieldIcon: {
    fontSize: 11,
  },
  shieldText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: palette['emerald-400'],
  },
  checkContainer: {
    marginLeft: spacing.sm,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.dark.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleComplete: {
    backgroundColor: colors.dark.success,
    borderColor: colors.dark.success,
  },
  checkMark: {
    color: colors.dark.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
