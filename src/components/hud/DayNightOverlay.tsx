/**
 * DayNightOverlay -- Skia Rect with time-based tint for day/night cycle.
 *
 * Renders inside a Skia Canvas. Tint color transitions based on local time
 * using Skia interpolateColors (NOT Reanimated interpolateColor -- incompatible).
 *
 * Time stops (0-1 over 24h):
 *   0.00 midnight -> deep indigo
 *   0.22 dawn     -> golden
 *   0.42 day      -> no tint
 *   0.75 evening  -> warm orange
 *   0.92 night    -> indigo
 *   1.00 midnight -> deep indigo (wrap)
 */
import React, { useEffect } from 'react';
import { Rect, interpolateColors } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width: screenW, height: screenH } = Dimensions.get('window');

const TIME_STOPS = [0, 0.22, 0.42, 0.75, 0.92, 1];
const TINT_COLORS = [
  'rgba(20,15,60,0.55)',
  'rgba(255,180,80,0.20)',
  'rgba(0,0,0,0.00)',
  'rgba(255,100,40,0.25)',
  'rgba(20,15,80,0.50)',
  'rgba(20,15,60,0.55)',
];

function getTimeProgress(): number {
  const now = new Date();
  return (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
}

export function DayNightOverlay() {
  const timeProgress = useSharedValue(getTimeProgress());

  useEffect(() => {
    const interval = setInterval(() => {
      timeProgress.value = getTimeProgress();
    }, 60_000);
    return () => clearInterval(interval);
  }, [timeProgress]);

  const tintColor = useDerivedValue(() =>
    interpolateColors(timeProgress.value, TIME_STOPS, TINT_COLORS),
  );

  return <Rect x={0} y={0} width={screenW} height={screenH} color={tintColor} />;
}
