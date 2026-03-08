/**
 * HalalHabits Design Tokens: Spacing
 *
 * Base unit: 4px. All values are multiples of 4.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Component-level spacing presets from blueprint.
 * All values remain multiples of 4.
 */
export const componentSpacing = {
  cardPadding: 16,
  buttonPaddingVertical: 12,
  buttonPaddingHorizontal: 24,
  listItemPaddingVertical: 12,
  listItemPaddingHorizontal: 16,
  listItemGap: 8,
  sectionHeaderPaddingBottom: 8,
  sectionHeaderMarginTop: 24,
  tabBarPaddingVertical: 8,
  hudCardPadding: 12,
  hudCardGap: 8,
  modalPadding: 24,
  modalElementGap: 16,
} as const;
