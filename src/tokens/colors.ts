/**
 * HalalHabits Design Tokens: Colors
 *
 * Two-tier system: primitives (palette) + semantic (colors.dark / colors.light).
 * All hex values sourced from blueprint/08-ui-design-tokens.md.
 */

// ---------------------------------------------------------------------------
// Tier 1: Palette Primitives
// ---------------------------------------------------------------------------

export const palette = {
  // Emerald (Primary)
  'emerald-50': '#ECFDF5',
  'emerald-100': '#D1FAE5',
  'emerald-200': '#A7F3D0',
  'emerald-300': '#6EE7B7',
  'emerald-400': '#34D399',
  'emerald-500': '#0D7C3D',
  'emerald-600': '#059669',
  'emerald-700': '#047857',
  'emerald-800': '#065F46',
  'emerald-900': '#1B4332',

  // Sapphire (Secondary)
  'sapphire-50': '#EFF6FF',
  'sapphire-100': '#DBEAFE',
  'sapphire-300': '#93C5FD',
  'sapphire-400': '#60A5FA',
  'sapphire-500': '#1B3A6B',
  'sapphire-600': '#2563EB',
  'sapphire-800': '#1E3A5F',
  'sapphire-900': '#0F172A',

  // Ruby (Alerts, Streaks)
  'ruby-300': '#FCA5A5',
  'ruby-400': '#F87171',
  'ruby-500': '#9B1B30',
  'ruby-600': '#DC2626',

  // Gold (XP, Rewards, Legendary)
  'gold-300': '#FDE68A',
  'gold-400': '#FBBF24',
  'gold-500': '#FFD700',
  'gold-600': '#D97706',
  'gold-700': '#B45309',

  // Neutrals / Surfaces
  'surface-50': '#F8FAFC',
  'surface-100': '#F1F5F9',
  'surface-700': '#334155',
  'surface-800': '#1E293B',
  'surface-850': '#172033',
  'surface-900': '#0F172A',
  'surface-950': '#0B1120',

  // Text
  'text-primary': '#F1F5F9',
  'text-secondary': '#94A3B8',
  'text-muted': '#64748B',

  // Borders
  'border-default': '#1E293B',
  'border-focus': '#0D7C3D',

  // Semantic stand-alone
  mercy: '#FFB347',
} as const;

// ---------------------------------------------------------------------------
// Tier 2: Semantic Colors (dark = primary/default)
// ---------------------------------------------------------------------------

interface RarityColors {
  glow: string;
  badge: string;
  text: string;
}

interface HudColors {
  overlayBg: string;
  overlayBorder: string;
  xpBarBg: string;
  xpBarFill: string;
  xpBarGlow: string;
}

interface SemanticColorSet {
  background: string;
  backgroundDeep: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryPressed: string;
  secondary: string;
  error: string;
  xp: string;
  mercy: string;
  border: string;
  borderFocus: string;
  success: string;
  warning: string;
  info: string;
  rarity: {
    common: RarityColors;
    rare: RarityColors;
    legendary: RarityColors;
  };
  hud: HudColors;
}

const dark: SemanticColorSet = {
  background: palette['surface-900'],
  backgroundDeep: palette['surface-950'],
  surface: palette['surface-800'],
  textPrimary: palette['text-primary'],
  textSecondary: palette['text-secondary'],
  textMuted: palette['text-muted'],
  primary: palette['emerald-500'],
  primaryPressed: palette['emerald-600'],
  secondary: palette['sapphire-500'],
  error: palette['ruby-500'],
  xp: palette['gold-500'],
  mercy: palette.mercy,
  border: palette['border-default'],
  borderFocus: palette['border-focus'],
  success: palette['emerald-500'],
  warning: palette['gold-500'],
  info: palette['sapphire-500'],
  rarity: {
    common: {
      glow: palette['emerald-500'],
      badge: palette['emerald-900'],
      text: palette['emerald-400'],
    },
    rare: {
      glow: palette['sapphire-500'],
      badge: palette['sapphire-800'],
      text: palette['sapphire-400'],
    },
    legendary: {
      glow: palette['gold-500'],
      badge: palette['gold-700'],
      text: palette['gold-400'],
    },
  },
  hud: {
    overlayBg: 'rgba(15, 23, 42, 0.75)',
    overlayBorder: 'rgba(30, 41, 59, 0.5)',
    xpBarBg: palette['surface-800'],
    xpBarFill: palette['gold-500'],
    xpBarGlow: 'rgba(255, 215, 0, 0.3)',
  },
};

const light: SemanticColorSet = {
  background: palette['surface-50'],
  backgroundDeep: '#FFFFFF',
  surface: palette['surface-100'],
  textPrimary: palette['surface-900'],
  textSecondary: palette['surface-700'],
  textMuted: palette['text-muted'],
  primary: palette['emerald-500'],
  primaryPressed: palette['emerald-600'],
  secondary: palette['sapphire-500'],
  error: palette['ruby-500'],
  xp: palette['gold-600'],
  mercy: palette.mercy,
  border: '#E2E8F0',
  borderFocus: palette['border-focus'],
  success: palette['emerald-500'],
  warning: palette['gold-600'],
  info: palette['sapphire-600'],
  rarity: {
    common: {
      glow: palette['emerald-500'],
      badge: palette['emerald-50'],
      text: palette['emerald-700'],
    },
    rare: {
      glow: palette['sapphire-500'],
      badge: palette['sapphire-50'],
      text: palette['sapphire-600'],
    },
    legendary: {
      glow: palette['gold-500'],
      badge: palette['gold-300'],
      text: palette['gold-700'],
    },
  },
  hud: {
    overlayBg: 'rgba(248, 250, 252, 0.85)',
    overlayBorder: 'rgba(226, 232, 240, 0.5)',
    xpBarBg: '#E2E8F0',
    xpBarFill: palette['gold-500'],
    xpBarGlow: 'rgba(255, 215, 0, 0.2)',
  },
};

export const colors = { dark, light } as const;
