/**
 * HalalHabits Design Tokens: Typography
 *
 * Font families and 10-entry type scale from blueprint/08-ui-design-tokens.md.
 */

export const fontFamilies = {
  inter: 'Inter-Regular',
  interBold: 'Inter-Bold',
  interSemiBold: 'Inter-SemiBold',
  pixelFont: 'PressStart2P-Regular',
} as const;

interface TypeStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: string;
  fontFamily: string;
  letterSpacing: number;
}

export const typography: Record<string, TypeStyle> & {
  headingXl: TypeStyle;
  headingLg: TypeStyle;
  headingMd: TypeStyle;
  bodyLg: TypeStyle;
  bodyMd: TypeStyle;
  bodySm: TypeStyle;
  caption: TypeStyle;
  hudLevel: TypeStyle;
  hudXp: TypeStyle;
  hudLabel: TypeStyle;
} = {
  headingXl: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    fontFamily: fontFamilies.interBold,
    letterSpacing: -0.5,
  },
  headingLg: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: fontFamilies.interBold,
    letterSpacing: -0.5,
  },
  headingMd: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: fontFamilies.interSemiBold,
    letterSpacing: -0.5,
  },
  bodyLg: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
    fontFamily: fontFamilies.inter,
    letterSpacing: 0,
  },
  bodyMd: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: fontFamilies.inter,
    letterSpacing: 0,
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: fontFamilies.inter,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: fontFamilies.inter,
    letterSpacing: 0.5,
  },
  hudLevel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: fontFamilies.pixelFont,
    letterSpacing: 1,
  },
  hudXp: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: fontFamilies.pixelFont,
    letterSpacing: 1,
  },
  hudLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: fontFamilies.pixelFont,
    letterSpacing: 1,
  },
} as const;
