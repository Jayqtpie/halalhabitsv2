import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../tokens';

/**
 * Pixel-art gear icon rendered with Views (no vector icon dependency).
 * 16x16 logical pixels scaled to 32x32 display points.
 */
export function PixelGearIcon({ size = 32, color = colors.textSecondary }: { size?: number; color?: string }) {
  const px = size / 16;

  // Gear shape defined as [row, col] pairs on a 16x16 grid
  const pixels: [number, number][] = [
    // Top teeth
    [1, 6], [1, 7], [1, 8], [1, 9],
    // Upper body
    [2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10],
    // Left tooth row 3
    [3, 3], [3, 4], [3, 5], [3, 6], [3, 9], [3, 10], [3, 11], [3, 12],
    // Row 4
    [4, 3], [4, 4], [4, 5], [4, 10], [4, 11], [4, 12],
    // Row 5 - outer ring
    [5, 2], [5, 3], [5, 4], [5, 5], [5, 10], [5, 11], [5, 12], [5, 13],
    // Row 6 - ring + center hole
    [6, 2], [6, 3], [6, 5], [6, 6], [6, 9], [6, 10], [6, 12], [6, 13],
    // Row 7 - ring + center hole
    [7, 1], [7, 2], [7, 3], [7, 5], [7, 10], [7, 12], [7, 13], [7, 14],
    // Row 8 - ring + center hole
    [8, 1], [8, 2], [8, 3], [8, 5], [8, 10], [8, 12], [8, 13], [8, 14],
    // Row 9 - ring + center hole
    [9, 2], [9, 3], [9, 5], [9, 6], [9, 9], [9, 10], [9, 12], [9, 13],
    // Row 10 - outer ring
    [10, 2], [10, 3], [10, 4], [10, 5], [10, 10], [10, 11], [10, 12], [10, 13],
    // Row 11
    [11, 3], [11, 4], [11, 5], [11, 10], [11, 11], [11, 12],
    // Row 12
    [12, 3], [12, 4], [12, 5], [12, 6], [12, 9], [12, 10], [12, 11], [12, 12],
    // Lower body
    [13, 5], [13, 6], [13, 7], [13, 8], [13, 9], [13, 10],
    // Bottom teeth
    [14, 6], [14, 7], [14, 8], [14, 9],
  ];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {pixels.map(([row, col]) => (
        <View
          key={`${row}-${col}`}
          style={{
            position: 'absolute',
            left: col * px,
            top: row * px,
            width: px,
            height: px,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
