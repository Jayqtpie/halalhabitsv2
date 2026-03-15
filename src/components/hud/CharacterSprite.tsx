/**
 * CharacterSprite -- 4-frame idle animation using manual frame cycling.
 *
 * Simpler than Atlas for 4 frames. Clips the spritesheet to show one
 * frame at a time, cycling via Reanimated withRepeat + Easing.steps.
 *
 * Spritesheet format: horizontal strip, 4 frames, each FRAME_W x FRAME_H px.
 *
 * IMPORTANT: Do NOT use animated transform on a Skia Group (Android perf
 * regression per Skia GitHub issue #3327). Position via x/y props directly.
 */
import React, { useEffect } from 'react';
import { Image, Group, useImage } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

const FRAME_W = 32;
const FRAME_H = 48;
const FRAME_COUNT = 4;

interface CharacterSpriteProps {
  x: number;
  y: number;
}

export function CharacterSprite({ x, y }: CharacterSpriteProps) {
  const spriteSheet = useImage(require('../../../assets/sprites/character-idle.png'));

  const frame = useSharedValue(0);

  useEffect(() => {
    frame.value = withRepeat(
      withTiming(FRAME_COUNT, {
        duration: 800,
        easing: Easing.steps(FRAME_COUNT, false),
      }),
      -1,
      false,
    );
  }, [frame]);

  const clipRect = useDerivedValue(() => ({
    x: Math.floor(frame.value % FRAME_COUNT) * FRAME_W,
    y: 0,
    width: FRAME_W,
    height: FRAME_H,
  }));

  if (!spriteSheet) return null;

  return (
    <Group clip={clipRect} transform={[{ translateX: x }, { translateY: y }]}>
      <Image
        image={spriteSheet}
        x={-clipRect.value.x}
        y={0}
        width={FRAME_W * FRAME_COUNT}
        height={FRAME_H}
        sampling={{ filter: 0, mipmap: 0 }}
      />
    </Group>
  );
}
