/**
 * BossHpBar — Skia-rendered animated HP bar for the Boss battle Canvas.
 *
 * Rendered INSIDE the parent Skia Canvas (not its own Canvas).
 * Uses Reanimated withTiming shared value to animate the HP fill width.
 * Fill decreases left-to-right (boss HP draining as player deals damage).
 *
 * Spec (from 14-UI-SPEC.md):
 *   - Track height: 16px
 *   - Track width: canvasWidth - 64px (32px each side)
 *   - Background track: gold-500 (#FFD700) at opacity 0.25
 *   - Fill: ruby-600 (#DC2626) animated via withTiming 600ms easeOut
 *   - Border radius: 4px
 */
import React, { useEffect } from 'react';
import { RoundedRect } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';

// ─── Constants ────────────────────────────────────────────────────────────────

const TRACK_HEIGHT = 16;
const TRACK_PADDING = 32; // 32px each side

// ─── Props ────────────────────────────────────────────────────────────────────

interface BossHpBarProps {
  /** HP ratio from 0 to 1 */
  hpRatio: number;
  /** Width of the parent Canvas */
  canvasWidth: number;
  /** Y position from top of Canvas (default: 16) */
  y?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BossHpBar({ hpRatio, canvasWidth, y = 16 }: BossHpBarProps) {
  const trackWidth = canvasWidth - TRACK_PADDING * 2;
  const trackX = TRACK_PADDING;

  // Animated HP ratio
  const animatedHp = useSharedValue(hpRatio);

  useEffect(() => {
    animatedHp.value = withTiming(hpRatio, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
  }, [hpRatio, animatedHp]);

  // Derived fill width for Skia
  const fillWidth = useDerivedValue(() => animatedHp.value * trackWidth);

  return (
    <>
      {/* Background track — gold-500 at opacity 0.25 */}
      <RoundedRect
        x={trackX}
        y={y}
        width={trackWidth}
        height={TRACK_HEIGHT}
        r={4}
        color="rgba(255, 215, 0, 0.25)"
      />

      {/* HP fill — ruby-600 (#DC2626), animated width */}
      <RoundedRect
        x={trackX}
        y={y}
        width={fillWidth}
        height={TRACK_HEIGHT}
        r={4}
        color="#DC2626"
      />
    </>
  );
}
