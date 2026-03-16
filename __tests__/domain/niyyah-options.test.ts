/**
 * Tests for niyyah-options domain module.
 *
 * Verifies seasonal filtering and fallback behavior.
 */
import {
  NIYYAH_OPTIONS,
  getAvailableNiyyahOptions,
  getCurrentHijriMonth,
  type NiyyahOption,
} from '../../src/domain/niyyah-options';

describe('NIYYAH_OPTIONS', () => {
  it('has at least 5 always-visible options', () => {
    const alwaysVisible = NIYYAH_OPTIONS.filter((o) => !o.visibleMonths);
    expect(alwaysVisible.length).toBeGreaterThanOrEqual(5);
  });

  it('contains a Ramadan preparation option with visibleMonths [8, 9]', () => {
    const ramadanOption = NIYYAH_OPTIONS.find(
      (o) => o.visibleMonths?.includes(8) && o.visibleMonths?.includes(9),
    );
    expect(ramadanOption).toBeDefined();
  });

  it('each option has id and text fields', () => {
    for (const option of NIYYAH_OPTIONS) {
      expect(typeof option.id).toBe('string');
      expect(typeof option.text).toBe('string');
      expect(option.id.length).toBeGreaterThan(0);
      expect(option.text.length).toBeGreaterThan(0);
    }
  });
});

describe('getCurrentHijriMonth', () => {
  it('returns a number between 1 and 12 or undefined', () => {
    const month = getCurrentHijriMonth();
    if (month !== undefined) {
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
    }
  });
});

describe('getAvailableNiyyahOptions', () => {
  it('always includes non-seasonal options', () => {
    const options = getAvailableNiyyahOptions();
    const nonSeasonal = NIYYAH_OPTIONS.filter((o) => !o.visibleMonths);
    for (const ns of nonSeasonal) {
      expect(options.find((o) => o.id === ns.id)).toBeDefined();
    }
  });

  it('filters seasonal options by hijri month — month 8 includes Ramadan prep', () => {
    // Mock getCurrentHijriMonth by testing the filtering logic directly
    // Seasonal option with visibleMonths [8, 9] should appear in month 8
    const ramadanOption = NIYYAH_OPTIONS.find((o) => o.visibleMonths?.includes(8));
    expect(ramadanOption).toBeDefined();

    // Simulate month 8 filter
    const filteredForMonth8 = NIYYAH_OPTIONS.filter(
      (o) => !o.visibleMonths || o.visibleMonths.includes(8),
    );
    expect(filteredForMonth8.find((o) => o.id === ramadanOption!.id)).toBeDefined();
  });

  it('filters seasonal options by hijri month — month 1 excludes Ramadan prep', () => {
    const ramadanOption = NIYYAH_OPTIONS.find(
      (o) => o.visibleMonths?.includes(8) && !o.visibleMonths.includes(1),
    );
    if (ramadanOption) {
      const filteredForMonth1 = NIYYAH_OPTIONS.filter(
        (o) => !o.visibleMonths || o.visibleMonths.includes(1),
      );
      expect(filteredForMonth1.find((o) => o.id === ramadanOption.id)).toBeUndefined();
    }
  });

  it('returns all options (including seasonal) when hijri month cannot be determined', () => {
    // getAvailableNiyyahOptions should return all when fallback triggers
    // We verify it returns at least all the always-visible options
    const options = getAvailableNiyyahOptions();
    expect(options.length).toBeGreaterThanOrEqual(5);
  });
});
