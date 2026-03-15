/**
 * HudScene -- Full-screen Skia Canvas rendering the pixel art game world.
 *
 * Layer order (bottom to top inside Canvas):
 *   1. Background PNG (environment based on player level)
 *   2. DayNightOverlay (time-based tint Rect)
 *   3. CharacterSprite (animated 4-frame idle)
 *
 * Uses FilterMode.Nearest sampling for crisp pixel art (HUD-02).
 * Guards useImage results -- returns null while assets load.
 */
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Canvas, Image, useImage, FilterMode, MipmapMode } from '@shopify/react-native-skia';
import { getEnvironmentForLevel } from '../../domain/hud-environment';
import type { EnvironmentId } from '../../domain/hud-environment';
import { DayNightOverlay } from './DayNightOverlay';
import { CharacterSprite } from './CharacterSprite';

const { width: screenW, height: screenH } = Dimensions.get('window');

// Require map for environment backgrounds -- static requires for Metro bundler
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ENVIRONMENT_IMAGES: Record<EnvironmentId, number> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  quiet_study: require('../../../assets/environments/quiet-study.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  growing_garden: require('../../../assets/environments/growing-garden.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  scholars_courtyard: require('../../../assets/environments/scholars-courtyard.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  living_sanctuary: require('../../../assets/environments/living-sanctuary.png') as number,
};

// Character spawn position (center-bottom area of scene)
const CHAR_X = screenW * 0.45;
const CHAR_Y = screenH * 0.52;

interface HudSceneProps {
  level: number;
}

export function HudScene({ level }: HudSceneProps) {
  const environmentId = getEnvironmentForLevel(level);
  const bg = useImage(ENVIRONMENT_IMAGES[environmentId]);

  // Background loads asynchronously -- render nothing until ready
  if (!bg) return null;

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {/* Layer 1: Environment background */}
      <Image
        image={bg}
        x={0}
        y={0}
        width={screenW}
        height={screenH}
        fit="cover"
        sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
      />

      {/* Layer 2: Day/night tint overlay */}
      <DayNightOverlay />

      {/* Layer 3: Animated character sprite */}
      <CharacterSprite x={CHAR_X} y={CHAR_Y} />
    </Canvas>
  );
}
