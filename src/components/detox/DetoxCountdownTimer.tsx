/**
 * DetoxCountdownTimer — drift-resistant countdown timer for Dopamine Detox Dungeon.
 *
 * Uses wall-clock delta (getRemainingMs from detox-engine) recalculated every
 * second via setInterval. Does NOT use Reanimated per-tick — numbers update in
 * place for performance (matches UI-SPEC Active Session Timer interaction contract).
 *
 * Two variants:
 *   'hud'   — PressStart2P pixel font at 16px (hudLevel token), for HUD overlay
 *   'sheet' — Inter-Bold at 28px (headingXl token), large legible display in sheet
 *
 * Calls onComplete when remaining time reaches 0.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { getRemainingMs } from '../../domain/detox-engine';
import { colors, typography } from '../../tokens';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Format milliseconds as HH:MM:SS string.
 * Clamps to 00:00:00 if ms is negative.
 */
function formatHHMMSS(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface DetoxCountdownTimerProps {
  /** ISO timestamp when the session started */
  startedAt: string;
  /** Session duration in hours */
  durationHours: number;
  /** Rendering context: 'hud' = pixel font HUD overlay, 'sheet' = Inter-Bold sheet display */
  variant: 'hud' | 'sheet';
  /** Called when remaining time reaches 0 */
  onComplete?: () => void;
}

export function DetoxCountdownTimer({
  startedAt,
  durationHours,
  variant,
  onComplete,
}: DetoxCountdownTimerProps) {
  const [remainingMs, setRemainingMs] = useState<number>(() =>
    getRemainingMs(startedAt, durationHours)
  );
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Track whether we've already fired onComplete to prevent duplicate calls
  const completedRef = useRef(false);

  useEffect(() => {
    // Reset completed flag when session changes
    completedRef.current = false;

    const interval = setInterval(() => {
      const remaining = getRemainingMs(startedAt, durationHours);
      setRemainingMs(remaining);

      if (remaining === 0 && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, durationHours]);

  const timeString = formatHHMMSS(remainingMs);
  const isHud = variant === 'hud';

  return (
    <View style={styles.container}>
      <Text
        style={isHud ? styles.timerHud : styles.timerSheet}
        accessibilityLabel={`Time remaining: ${timeString}`}
        accessibilityLiveRegion="none"
      >
        {timeString}
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // HUD variant: PressStart2P pixel font (16px), for game overlay
  timerHud: {
    fontSize: typography.hudLevel.fontSize,
    lineHeight: typography.hudLevel.lineHeight,
    fontFamily: typography.hudLevel.fontFamily,
    fontWeight: '700',
    letterSpacing: typography.hudLevel.letterSpacing,
    color: colors.dark.textPrimary,
  },

  // Sheet variant: Inter-Bold (28px headingXl), large legible display
  timerSheet: {
    fontSize: typography.headingXl.fontSize,
    lineHeight: typography.headingXl.lineHeight,
    fontFamily: typography.headingXl.fontFamily,
    fontWeight: '700',
    letterSpacing: typography.headingXl.letterSpacing,
    color: colors.dark.textPrimary,
  },
});
