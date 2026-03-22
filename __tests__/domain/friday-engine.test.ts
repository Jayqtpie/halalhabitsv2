/**
 * Tests for friday-engine domain module.
 *
 * Verifies: isFriday detection, multiplier constants,
 * combined multiplier stacking, Al-Kahf expiry calculation,
 * and week-stable message rotation.
 *
 * All functions are pure TypeScript — no React, no DB.
 */
import {
  isFriday,
  getFridayMultiplier,
  combinedMultiplier,
  getAlKahfExpiry,
  getWeekNumber,
} from '../../src/domain/friday-engine';
import type { PrayerWindow } from '../../src/types/habits';

// ---------------------------------------------------------------------------
// isFriday
// ---------------------------------------------------------------------------

describe('isFriday', () => {
  it('returns true for a Friday date', () => {
    // 2026-03-27 is a Friday
    expect(isFriday(new Date('2026-03-27T10:00:00'))).toBe(true);
  });

  it('returns false for a Saturday date', () => {
    // 2026-03-28 is a Saturday
    expect(isFriday(new Date('2026-03-28T10:00:00'))).toBe(false);
  });

  it('returns false for a Thursday date', () => {
    // 2026-03-26 is a Thursday
    expect(isFriday(new Date('2026-03-26T10:00:00'))).toBe(false);
  });

  it('returns false for a Sunday date', () => {
    // 2026-03-29 is a Sunday
    expect(isFriday(new Date('2026-03-29T10:00:00'))).toBe(false);
  });

  it('returns false for a Wednesday date', () => {
    // 2026-03-25 is a Wednesday
    expect(isFriday(new Date('2026-03-25T10:00:00'))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getFridayMultiplier
// ---------------------------------------------------------------------------

describe('getFridayMultiplier', () => {
  it('returns 2.0', () => {
    expect(getFridayMultiplier()).toBe(2.0);
  });

  it('returns a number', () => {
    expect(typeof getFridayMultiplier()).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// combinedMultiplier
// ---------------------------------------------------------------------------

describe('combinedMultiplier', () => {
  it('returns 2.0 when streak multiplier is 1.0 and friday is 2.0', () => {
    expect(combinedMultiplier(1.0, 2.0)).toBe(2.0);
  });

  it('returns 3.0 when streak multiplier is 1.5 and friday is 2.0', () => {
    expect(combinedMultiplier(1.5, 2.0)).toBe(3.0);
  });

  it('returns 6.0 when streak multiplier is 3.0 and friday is 2.0 (max case)', () => {
    expect(combinedMultiplier(3.0, 2.0)).toBe(6.0);
  });

  it('returns product of any two values', () => {
    expect(combinedMultiplier(2.5, 1.5)).toBeCloseTo(3.75);
  });
});

// ---------------------------------------------------------------------------
// getAlKahfExpiry
// ---------------------------------------------------------------------------

describe('getAlKahfExpiry', () => {
  const today = new Date('2026-03-27T10:00:00'); // A Friday

  it('returns Maghrib time when valid lat/lng provided', () => {
    const maghribTime = new Date('2026-03-27T19:45:00');
    const mockPrayerWindows = jest.fn().mockReturnValue([
      { name: 'fajr', start: new Date('2026-03-27T05:30:00'), end: new Date('2026-03-27T07:00:00') },
      { name: 'dhuhr', start: new Date('2026-03-27T12:15:00'), end: new Date('2026-03-27T15:00:00') },
      { name: 'asr', start: new Date('2026-03-27T15:30:00'), end: new Date('2026-03-27T19:45:00') },
      { name: 'maghrib', start: maghribTime, end: new Date('2026-03-27T21:00:00') },
      { name: 'isha', start: new Date('2026-03-27T21:00:00'), end: new Date('2026-03-28T05:30:00') },
    ] as PrayerWindow[]);

    const expiry = getAlKahfExpiry(40.7128, -74.0060, today, 'ISNA', mockPrayerWindows);
    expect(expiry).toBe(maghribTime.toISOString());
    expect(mockPrayerWindows).toHaveBeenCalledWith(40.7128, -74.0060, today, 'ISNA');
  });

  it('returns next midnight when lat is null', () => {
    const mockPrayerWindows = jest.fn();
    const expiry = getAlKahfExpiry(null, -74.0060, today, 'ISNA', mockPrayerWindows);
    expect(mockPrayerWindows).not.toHaveBeenCalled();
    const parsed = new Date(expiry);
    // Should be next day at midnight
    expect(parsed.getDate()).toBe(today.getDate() + 1);
    expect(parsed.getHours()).toBe(0);
    expect(parsed.getMinutes()).toBe(0);
    expect(parsed.getSeconds()).toBe(0);
  });

  it('returns next midnight when lng is null', () => {
    const mockPrayerWindows = jest.fn();
    const expiry = getAlKahfExpiry(40.7128, null, today, 'ISNA', mockPrayerWindows);
    expect(mockPrayerWindows).not.toHaveBeenCalled();
    const parsed = new Date(expiry);
    expect(parsed.getHours()).toBe(0);
    expect(parsed.getMinutes()).toBe(0);
  });

  it('falls back to next midnight when no maghrib found in prayer windows', () => {
    const mockPrayerWindows = jest.fn().mockReturnValue([
      { name: 'fajr', start: new Date('2026-03-27T05:30:00'), end: new Date('2026-03-27T07:00:00') },
    ] as PrayerWindow[]);

    const expiry = getAlKahfExpiry(40.7128, -74.0060, today, 'ISNA', mockPrayerWindows);
    const parsed = new Date(expiry);
    expect(parsed.getHours()).toBe(0);
    expect(parsed.getMinutes()).toBe(0);
  });

  it('returns an ISO string', () => {
    const mockPrayerWindows = jest.fn();
    const expiry = getAlKahfExpiry(null, null, today, 'ISNA', mockPrayerWindows);
    // ISO strings end with Z
    expect(expiry).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

// ---------------------------------------------------------------------------
// getWeekNumber
// ---------------------------------------------------------------------------

describe('getWeekNumber', () => {
  it('returns the same week number for all dates within the same ISO week', () => {
    // Week of 2026-03-23 (Monday) to 2026-03-27 (Friday)
    const monday = new Date('2026-03-23T10:00:00');
    const wednesday = new Date('2026-03-25T10:00:00');
    const friday = new Date('2026-03-27T10:00:00');

    expect(getWeekNumber(monday)).toBe(getWeekNumber(wednesday));
    expect(getWeekNumber(wednesday)).toBe(getWeekNumber(friday));
  });

  it('returns different week numbers for dates in different weeks', () => {
    const thisWeekFriday = new Date('2026-03-27T10:00:00');
    const nextWeekFriday = new Date('2026-04-03T10:00:00');

    expect(getWeekNumber(thisWeekFriday)).not.toBe(getWeekNumber(nextWeekFriday));
  });

  it('returns a number', () => {
    expect(typeof getWeekNumber(new Date())).toBe('number');
  });

  it('increments by 1 for consecutive weeks', () => {
    const week1 = new Date('2026-03-27T10:00:00');
    const week2 = new Date('2026-04-03T10:00:00');
    expect(getWeekNumber(week2) - getWeekNumber(week1)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Quest XP exclusion (conceptual documentation test)
// ---------------------------------------------------------------------------

describe('questXP excluded from Friday multiplier', () => {
  it('getFridayMultiplier() returns 2.0 — applied only to habit XP, not quest XP', () => {
    // The exclusion is enforced at the call site (gameStore/xpEngine),
    // not in friday-engine itself. This test documents the contract:
    // quest path always uses multiplier 1.0 regardless of day.
    const multiplier = getFridayMultiplier();
    expect(multiplier).toBe(2.0);
    // Caller is responsible for NOT passing this to quest XP calculation
  });

  it('combinedMultiplier uses 1.0 for quest path (not 2.0)', () => {
    // On quest completion path: combinedMultiplier(streakMult, 1.0)
    const questPathResult = combinedMultiplier(1.5, 1.0);
    expect(questPathResult).toBe(1.5); // Not multiplied by Friday bonus
  });
});
