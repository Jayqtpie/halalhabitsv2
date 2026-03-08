import { palette, colors } from '../../src/tokens/colors';
import { typography, fontFamilies } from '../../src/tokens/typography';
import { spacing, componentSpacing } from '../../src/tokens/spacing';
import { radius } from '../../src/tokens/radius';
import { duration, easing } from '../../src/tokens/motion';

describe('Design Token System', () => {
  describe('Color Palette (Primitives)', () => {
    it('exports emerald scale from 50 to 900', () => {
      expect(palette['emerald-50']).toBe('#ECFDF5');
      expect(palette['emerald-500']).toBe('#0D7C3D');
      expect(palette['emerald-900']).toBe('#1B4332');
    });

    it('exports sapphire scale', () => {
      expect(palette['sapphire-50']).toBe('#EFF6FF');
      expect(palette['sapphire-500']).toBe('#1B3A6B');
      expect(palette['sapphire-900']).toBe('#0F172A');
    });

    it('exports ruby scale', () => {
      expect(palette['ruby-300']).toBe('#FCA5A5');
      expect(palette['ruby-500']).toBe('#9B1B30');
    });

    it('exports gold scale', () => {
      expect(palette['gold-500']).toBe('#FFD700');
      expect(palette['gold-400']).toBe('#FBBF24');
    });

    it('exports surface/neutral scale', () => {
      expect(palette['surface-900']).toBe('#0F172A');
      expect(palette['surface-800']).toBe('#1E293B');
      expect(palette['surface-50']).toBe('#F8FAFC');
    });
  });

  describe('Semantic Colors (Dark + Light)', () => {
    const semanticKeys = [
      'background',
      'surface',
      'textPrimary',
      'textSecondary',
      'textMuted',
      'primary',
      'primaryPressed',
      'secondary',
      'error',
      'xp',
      'mercy',
      'border',
      'borderFocus',
      'success',
      'warning',
      'info',
    ];

    it('dark mode has all semantic keys', () => {
      for (const key of semanticKeys) {
        expect(colors.dark).toHaveProperty(key);
      }
    });

    it('light mode has all semantic keys', () => {
      for (const key of semanticKeys) {
        expect(colors.light).toHaveProperty(key);
      }
    });

    it('dark and light modes have identical key sets', () => {
      const darkKeys = Object.keys(colors.dark).sort();
      const lightKeys = Object.keys(colors.light).sort();
      expect(darkKeys).toEqual(lightKeys);
    });

    it('exports rarity colors', () => {
      expect(colors.dark.rarity).toBeDefined();
      expect(colors.dark.rarity.common).toBeDefined();
      expect(colors.dark.rarity.rare).toBeDefined();
      expect(colors.dark.rarity.legendary).toBeDefined();
    });

    it('exports HUD overlay tokens', () => {
      expect(colors.dark.hud).toBeDefined();
      expect(colors.dark.hud.overlayBg).toBeDefined();
      expect(colors.dark.hud.xpBarFill).toBeDefined();
    });
  });

  describe('Typography', () => {
    it('exports font families', () => {
      expect(fontFamilies.inter).toBe('Inter-Regular');
      expect(fontFamilies.interBold).toBe('Inter-Bold');
      expect(fontFamilies.interSemiBold).toBe('Inter-SemiBold');
      expect(fontFamilies.pixelFont).toBe('PressStart2P-Regular');
    });

    it('has all 10 type scale entries', () => {
      const expectedKeys = [
        'headingXl',
        'headingLg',
        'headingMd',
        'bodyLg',
        'bodyMd',
        'bodySm',
        'caption',
        'hudLevel',
        'hudXp',
        'hudLabel',
      ];
      for (const key of expectedKeys) {
        expect(typography).toHaveProperty(key);
      }
    });

    it('each entry has required properties', () => {
      const entry = typography.headingXl;
      expect(entry.fontSize).toBe(28);
      expect(entry.lineHeight).toBe(36);
      expect(entry.fontWeight).toBe('700');
      expect(entry.fontFamily).toBe('Inter-Bold');
      expect(entry.letterSpacing).toBe(-0.5);
    });

    it('HUD entries use pixel font', () => {
      expect(typography.hudLevel.fontFamily).toBe('PressStart2P-Regular');
      expect(typography.hudXp.fontFamily).toBe('PressStart2P-Regular');
      expect(typography.hudLabel.fontFamily).toBe('PressStart2P-Regular');
    });
  });

  describe('Spacing', () => {
    it('exports base spacing scale', () => {
      expect(spacing.xs).toBe(4);
      expect(spacing.sm).toBe(8);
      expect(spacing.md).toBe(16);
      expect(spacing.lg).toBe(24);
      expect(spacing.xl).toBe(32);
      expect(spacing.xxl).toBe(48);
    });

    it('all spacing values are multiples of 4', () => {
      for (const [key, value] of Object.entries(spacing)) {
        expect(value % 4).toBe(0);
      }
    });

    it('exports component spacing', () => {
      expect(componentSpacing.cardPadding).toBe(16);
      expect(componentSpacing.buttonPaddingVertical).toBe(12);
      expect(componentSpacing.buttonPaddingHorizontal).toBe(24);
    });
  });

  describe('Border Radius', () => {
    it('exports all radius tokens', () => {
      expect(radius.sm).toBe(4);
      expect(radius.md).toBe(8);
      expect(radius.lg).toBe(12);
      expect(radius.xl).toBe(16);
      expect(radius.full).toBe(9999);
    });
  });

  describe('Motion', () => {
    it('exports duration tokens', () => {
      expect(duration.instant).toBe(100);
      expect(duration.fast).toBe(200);
      expect(duration.normal).toBe(300);
      expect(duration.slow).toBe(500);
      expect(duration.celebration).toBe(800);
    });

    it('exports easing tokens', () => {
      expect(easing.default).toBe('ease-in-out');
      expect(easing.spring).toBeDefined();
      expect(easing.spring.damping).toBe(15);
      expect(easing.spring.stiffness).toBe(150);
    });
  });
});
