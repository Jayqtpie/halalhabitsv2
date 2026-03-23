/**
 * RpgDialogueBox — RPG text box with typewriter animation.
 *
 * Renders below the Skia Canvas (NOT inside Canvas — Skia cannot host RN views).
 * Text uses PressStart2P-Regular (hudXp token) for game aesthetic.
 *
 * Typewriter animation uses setInterval at 30ms/char (matches detox pattern —
 * NOT Reanimated worklet, which cannot update Text children across the JS bridge).
 *
 * Accessibility: AccessibilityInfo.isReduceMotionEnabled check —
 * when reduce motion is on, text is shown instantly without typewriter.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import { colors, typography, spacing, radius } from '../../tokens';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPEWRITER_INTERVAL_MS = 30;

// ─── Props ────────────────────────────────────────────────────────────────────

interface RpgDialogueBoxProps {
  /** The full text string to display */
  text: string;
  /** Whether the typewriter animation should play */
  isActive: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RpgDialogueBox({ text, isActive }: RpgDialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);

  // Check reduce motion preference once on mount
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });

    // Listen for changes (user can toggle in settings)
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setReduceMotion(enabled);
    });
    return () => subscription.remove();
  }, []);

  // Typewriter effect — resets whenever text changes
  useEffect(() => {
    // Instant reveal when reduce motion is on or animation is inactive
    if (!isActive || reduceMotion) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, TYPEWRITER_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [text, isActive, reduceMotion]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {displayedText || '...'}
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.surface,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  text: {
    fontSize: typography.hudXp.fontSize,    // 12px PressStart2P
    lineHeight: typography.hudXp.lineHeight,
    fontFamily: 'PressStart2P-Regular',     // hudXp token — game font
    fontWeight: '700',
    color: colors.dark.textPrimary,
    letterSpacing: typography.hudXp.letterSpacing,
  },
});
