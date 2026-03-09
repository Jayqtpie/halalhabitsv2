/**
 * Tests for prayer-times service
 *
 * Uses adhan library to calculate prayer times for given coordinates.
 * Tests verify correct window structure, status determination, and formatting.
 */
import {
  getPrayerWindows,
  getNextFajr,
  formatPrayerTime,
} from '../../src/services/prayer-times';
import type { CalcMethodKey } from '../../src/types/habits';

// NYC coordinates for consistent test data
const NYC_LAT = 40.7128;
const NYC_LNG = -74.006;
const TEST_DATE = new Date(2026, 2, 9); // March 9, 2026

describe('getPrayerWindows', () => {
  it('returns exactly 5 prayer windows', () => {
    const windows = getPrayerWindows(NYC_LAT, NYC_LNG, TEST_DATE, 'ISNA');
    expect(windows).toHaveLength(5);
  });

  it('returns prayers in Fajr -> Isha order', () => {
    const windows = getPrayerWindows(NYC_LAT, NYC_LNG, TEST_DATE, 'ISNA');
    const names = windows.map((w) => w.name);
    expect(names).toEqual(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);
  });

  it('each window has correct display names', () => {
    const windows = getPrayerWindows(NYC_LAT, NYC_LNG, TEST_DATE, 'ISNA');
    const displayNames = windows.map((w) => w.displayName);
    expect(displayNames).toEqual(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']);
  });

  it('each window has valid start and end Date objects', () => {
    const windows = getPrayerWindows(NYC_LAT, NYC_LNG, TEST_DATE, 'ISNA');
    for (const w of windows) {
      expect(w.start).toBeInstanceOf(Date);
      expect(w.end).toBeInstanceOf(Date);
      expect(w.start.getTime()).not.toBeNaN();
      expect(w.end.getTime()).not.toBeNaN();
      expect(w.end.getTime()).toBeGreaterThan(w.start.getTime());
    }
  });

  it('each prayer start == previous prayer end (contiguous windows)', () => {
    const windows = getPrayerWindows(NYC_LAT, NYC_LNG, TEST_DATE, 'ISNA');
    for (let i = 1; i < windows.length; i++) {
      expect(windows[i].start.getTime()).toBe(windows[i - 1].end.getTime());
    }
  });

  it('all 6 calculation methods produce valid (non-NaN) times', () => {
    const methods: CalcMethodKey[] = [
      'ISNA',
      'MWL',
      'Egyptian',
      'Karachi',
      'UmmAlQura',
      'MoonsightingCommittee',
    ];
    for (const method of methods) {
      const windows = getPrayerWindows(NYC_LAT, NYC_LNG, TEST_DATE, method);
      expect(windows).toHaveLength(5);
      for (const w of windows) {
        expect(w.start.getTime()).not.toBeNaN();
        expect(w.end.getTime()).not.toBeNaN();
      }
    }
  });

  it('determines status correctly based on current time', () => {
    const windows = getPrayerWindows(NYC_LAT, NYC_LNG, TEST_DATE, 'ISNA');
    // Get Dhuhr start time and set "now" to that time
    const dhuhrStart = windows[1].start;
    const midDhuhr = new Date(
      dhuhrStart.getTime() + (windows[1].end.getTime() - dhuhrStart.getTime()) / 2
    );

    const windowsAtDhuhr = getPrayerWindows(
      NYC_LAT,
      NYC_LNG,
      TEST_DATE,
      'ISNA',
      midDhuhr
    );

    // Fajr should be passed
    expect(windowsAtDhuhr[0].status).toBe('passed');
    // Dhuhr should be active
    expect(windowsAtDhuhr[1].status).toBe('active');
    // Asr should be upcoming
    expect(windowsAtDhuhr[2].status).toBe('upcoming');
  });
});

describe('getNextFajr', () => {
  it('returns a Date after today Isha', () => {
    const windows = getPrayerWindows(NYC_LAT, NYC_LNG, TEST_DATE, 'ISNA');
    const ishaStart = windows[4].start;
    const nextFajr = getNextFajr(NYC_LAT, NYC_LNG, TEST_DATE, 'ISNA');
    expect(nextFajr).toBeInstanceOf(Date);
    expect(nextFajr.getTime()).toBeGreaterThan(ishaStart.getTime());
  });
});

describe('formatPrayerTime', () => {
  it('returns a human-readable time string', () => {
    const date = new Date(2026, 2, 9, 5, 30, 0);
    const formatted = formatPrayerTime(date);
    // Should contain hour and minute
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    // Should contain AM or PM
    expect(formatted).toMatch(/AM|PM/i);
  });

  it('formats noon correctly', () => {
    const noon = new Date(2026, 2, 9, 12, 0, 0);
    const formatted = formatPrayerTime(noon);
    expect(formatted).toMatch(/12:00/);
    expect(formatted).toMatch(/PM/i);
  });
});
