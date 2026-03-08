/**
 * HalalHabits Design Tokens: Motion
 *
 * Duration and easing curves from blueprint/08-ui-design-tokens.md.
 */

export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  celebration: 800,
  scene: 2000,
} as const;

export const easing = {
  default: 'ease-in-out' as const,
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)' as const,
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)' as const,
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)' as const,
  spring: {
    damping: 15,
    stiffness: 150,
  },
} as const;
