/**
 * Prayer times service — adhan-js wrapper returning typed PrayerWindow arrays.
 *
 * Pure TypeScript, no React imports. Fully unit-testable.
 * Uses the adhan library to calculate accurate prayer times based on
 * coordinates and calculation method.
 */
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import type { PrayerWindow, PrayerName, CalcMethodKey } from '../types/habits';

// ─── Calculation Method Mapping ──────────────────────────────────────

/**
 * Maps CalcMethodKey to adhan CalculationParameters factory functions.
 * Each method returns a CalculationParameters object configured for that authority.
 */
const CALC_METHOD_MAP: Record<CalcMethodKey, () => ReturnType<typeof CalculationMethod.NorthAmerica>> = {
  ISNA: () => CalculationMethod.NorthAmerica(),
  MWL: () => CalculationMethod.MuslimWorldLeague(),
  Egyptian: () => CalculationMethod.Egyptian(),
  Karachi: () => CalculationMethod.Karachi(),
  UmmAlQura: () => CalculationMethod.UmmAlQura(),
  MoonsightingCommittee: () => CalculationMethod.MoonsightingCommittee(),
};

// ─── Prayer Display Names ────────────────────────────────────────────

const PRAYER_DISPLAY_NAMES: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

/** Ordered list of prayer names for iteration */
const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Calculate prayer times for given coordinates and date, returning 5 PrayerWindow objects.
 *
 * Each window has a start time (prayer adhan), end time (next prayer's adhan),
 * and a status based on the current time.
 *
 * Isha's end time is next day's Fajr.
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @param date - Date to calculate for
 * @param method - Calculation method key
 * @param now - Optional current time for status determination (defaults to Date.now())
 */
export function getPrayerWindows(
  lat: number,
  lng: number,
  date: Date,
  method: CalcMethodKey,
  now?: Date,
): PrayerWindow[] {
  const coordinates = new Coordinates(lat, lng);
  const params = CALC_METHOD_MAP[method]();
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  const currentTime = now ?? new Date();

  // Extract start times for all 5 prayers
  const startTimes: Record<PrayerName, Date> = {
    fajr: prayerTimes.fajr,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
  };

  // Calculate next Fajr for Isha end time
  const nextFajr = getNextFajr(lat, lng, date, method);

  // Build windows
  const windows: PrayerWindow[] = PRAYER_ORDER.map((name, index) => {
    const start = startTimes[name];
    // End time = next prayer's start, or next Fajr for Isha
    const end =
      index < PRAYER_ORDER.length - 1
        ? startTimes[PRAYER_ORDER[index + 1]]
        : nextFajr;

    // Determine status
    let status: PrayerWindow['status'];
    if (currentTime >= end) {
      status = 'passed';
    } else if (currentTime >= start) {
      status = 'active';
    } else {
      status = 'upcoming';
    }

    return {
      name,
      displayName: PRAYER_DISPLAY_NAMES[name],
      start,
      end,
      status,
    };
  });

  return windows;
}

/**
 * Calculate next day's Fajr time (used as Isha's end boundary).
 */
export function getNextFajr(
  lat: number,
  lng: number,
  date: Date,
  method: CalcMethodKey,
): Date {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const coordinates = new Coordinates(lat, lng);
  const params = CALC_METHOD_MAP[method]();
  const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);

  return tomorrowTimes.fajr;
}

/**
 * Format a Date as a human-readable time string (e.g., "5:30 AM").
 */
export function formatPrayerTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}
