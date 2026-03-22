/**
 * Friday Engine -- Pure TypeScript module for Friday Power-Ups detection and helpers.
 *
 * No React, no DB, no side effects. Fully unit-testable.
 * Pattern: streak-engine.ts (pure functions, receives data, returns data)
 *
 * Key behaviors:
 * - isFriday: checks if a Date falls on Friday (local device time)
 * - getFridayMultiplier: returns the 2x XP multiplier constant
 * - combinedMultiplier: stacks streak and friday multipliers multiplicatively
 * - getAlKahfExpiry: calculates Maghrib-based quest expiry with midnight fallback
 * - getWeekNumber: stable ISO week number for copy rotation
 */

import type { getPrayerWindows } from '../services/prayer-times';

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Returns true if the given Date falls on a Friday (local device time).
 * Uses getDay() === 5 (Sunday = 0, Monday = 1, ..., Friday = 5, Saturday = 6).
 *
 * @param now - Date to check (defaults to current time)
 */
export function isFriday(now: Date = new Date()): boolean {
  return now.getDay() === 5;
}

/**
 * Returns the Friday XP multiplier constant: 2.0.
 *
 * Applied to habit completions only — NOT to quest XP rewards.
 * Quest path must pass 1.0 to combinedMultiplier to exclude Friday bonus.
 */
export function getFridayMultiplier(): number {
  return 2.0;
}

/**
 * Combines a streak multiplier with the Friday multiplier multiplicatively.
 *
 * Examples:
 *   combinedMultiplier(1.0, 2.0) => 2.0  (no streak, Friday active)
 *   combinedMultiplier(1.5, 2.0) => 3.0  (streak bonus + Friday)
 *   combinedMultiplier(3.0, 2.0) => 6.0  (max streak + Friday)
 *   combinedMultiplier(1.5, 1.0) => 1.5  (quest path — Friday excluded)
 *
 * @param streakMultiplier - Current streak-based multiplier (e.g. 1.0 to 3.0)
 * @param fridayMultiplier - Friday multiplier (2.0) or 1.0 for quest path
 */
export function combinedMultiplier(streakMultiplier: number, fridayMultiplier: number): number {
  return streakMultiplier * fridayMultiplier;
}

/**
 * Returns a stable ISO week number for a given date.
 *
 * Same week = same number. Different week = different number.
 * Used for stable Friday message rotation: same message persists for entire week.
 *
 * Formula: days since epoch, shifted by 4 (epoch was Thursday), divided by 7.
 *
 * @param now - Date to compute week number for (defaults to current time)
 */
export function getWeekNumber(now: Date = new Date()): number {
  return Math.floor((now.getTime() / 86400000 + 4) / 7);
}

/**
 * Calculates when the Al-Kahf quest expires.
 *
 * Primary: Maghrib time (from prayer times service) — quest expires at sunset.
 * Fallback: Next midnight — when no location is available or Maghrib not found.
 *
 * @param lat - Device latitude (null if no location permission granted)
 * @param lng - Device longitude (null if no location permission granted)
 * @param today - The date to calculate expiry for (typically today)
 * @param calcMethod - Prayer calculation method key (e.g. 'ISNA', 'MWL')
 * @param getPrayerWindowsFn - Injected prayer times function (for testability)
 * @returns ISO string representing expiry time
 */
export function getAlKahfExpiry(
  lat: number | null,
  lng: number | null,
  today: Date,
  calcMethod: string,
  getPrayerWindowsFn: typeof getPrayerWindows,
): string {
  // If no location available, fall back to next midnight
  if (lat === null || lng === null) {
    return nextMidnight(today).toISOString();
  }

  const windows = getPrayerWindowsFn(lat, lng, today, calcMethod as any);
  const maghrib = windows.find(w => w.name === 'maghrib');

  if (maghrib) {
    return maghrib.start.toISOString();
  }

  // Fallback: next midnight (Maghrib not found in prayer windows)
  return nextMidnight(today).toISOString();
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Returns a Date representing the start of the next calendar day (midnight). */
function nextMidnight(from: Date): Date {
  const midnight = new Date(from);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight;
}
