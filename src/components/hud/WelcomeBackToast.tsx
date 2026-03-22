/**
 * WelcomeBackToast — Overlay shown when the app returns to foreground during
 * an active Dopamine Detox session.
 *
 * Rendered as a React Native View sibling outside the Skia Canvas
 * (same pattern as FridayMessageBanner — Canvas cannot host RN views).
 *
 * Behaviour:
 *   - Listens for AppState 'change' event
 *   - When app becomes 'active' AND detoxStore.activeSession is set:
 *     fade in (300ms) → display 3s → fade out (300ms)
 *   - Shows: "Still in the dungeon — [X]h [Y]m remaining"
 *
 * Reduced motion: instant show/hide (no fade animation).
 *
 * Source: UI-SPEC Component 5, CONTEXT.md D-07
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AppState,
  AppStateStatus,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRemainingMs } from '../../domain/detox-engine';
import { colors, typography, spacing, radius } from '../../tokens';
import type { DetoxSession } from '../../types/database';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Format remaining milliseconds as "[X]h [Y]m" string.
 * Only shows minutes if hours > 0. Shows "< 1m" if below 60s.
 */
function formatRemainingTime(ms: number): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes === 0) return '< 1m';
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WelcomeBackToastProps {
  /** Active detox session — if null the toast never shows */
  activeSession: DetoxSession | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

const DISPLAY_DURATION_MS = 3000;
const FADE_DURATION_MS = 300;

export function WelcomeBackToast({ activeSession }: WelcomeBackToastProps) {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const visibleRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        reduceMotionRef.current = enabled;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [activeSession]); // eslint-disable-line react-hooks/exhaustive-deps

  function showToast() {
    if (visibleRef.current) return; // Already showing — don't re-trigger
    visibleRef.current = true;

    if (reduceMotionRef.current) {
      // Instant show (no animation)
      opacity.value = 1;
    } else {
      opacity.value = withTiming(1, { duration: FADE_DURATION_MS });
    }

    // Schedule auto-dismiss
    dismissTimerRef.current = setTimeout(() => {
      dismissToast();
    }, DISPLAY_DURATION_MS);
  }

  function dismissToast() {
    if (!visibleRef.current) return;

    if (reduceMotionRef.current) {
      opacity.value = 0;
      visibleRef.current = false;
    } else {
      opacity.value = withTiming(0, { duration: FADE_DURATION_MS }, () => {
        runOnJS(markDismissed)();
      });
    }
  }

  function markDismissed() {
    visibleRef.current = false;
  }

  function handleAppStateChange(nextState: AppStateStatus) {
    if (nextState === 'active' && activeSession && activeSession.status === 'active') {
      // App returned to foreground with an active session — show toast
      showToast();
    }
  }

  // Compute remaining time message from active session
  const remainingText = React.useMemo(() => {
    if (!activeSession) return '';
    const ms = getRemainingMs(activeSession.startedAt, activeSession.durationHours);
    const formatted = formatRemainingTime(ms);
    return `Still in the dungeon — ${formatted} remaining`;
  }, [activeSession]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    // Prevent interaction when invisible
    pointerEvents: opacity.value > 0 ? 'auto' : 'none',
  }));

  if (!activeSession) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { top: insets.top + 80 },
        animatedStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.toastText}>{remainingText}</Text>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.dark.surface, // #1E293B
    borderWidth: 1,
    borderColor: colors.dark.border, // #334155
    borderRadius: radius.lg, // 12px
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: spacing.sm, // 8px
    alignItems: 'center',
    zIndex: 10,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  toastText: {
    fontSize: typography.bodyMd.fontSize, // 15px
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily, // Inter-Regular
    color: colors.dark.textPrimary,
    textAlign: 'center',
  },
});
