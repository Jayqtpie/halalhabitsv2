/**
 * Habit sorting logic for the daily list display.
 *
 * Sort order:
 * 1. Uncompleted salah habits in Fajr -> Isha chronological order
 * 2. Uncompleted non-salah habits by sortOrder
 * 3. Completed salah habits in Fajr -> Isha chronological order
 * 4. Completed non-salah habits by sortOrder
 *
 * Pure TypeScript, no React imports. Fully unit-testable.
 */
import type { HabitWithStatus, PrayerName } from '../types/habits';

/** Chronological prayer order for sorting */
const SALAH_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/**
 * Determine if a habit is a salah habit.
 * Checks type field first, falls back to presetKey matching a prayer name.
 */
function isSalahHabit(habit: HabitWithStatus): boolean {
  if (habit.type === 'salah') return true;
  if (habit.presetKey) {
    return SALAH_ORDER.includes(habit.presetKey as PrayerName);
  }
  return false;
}

/**
 * Get the chronological sort index for a salah habit.
 * Returns the position in SALAH_ORDER (0-4), or 999 if not found.
 */
function getSalahSortIndex(habit: HabitWithStatus): number {
  const key = habit.presetKey as PrayerName;
  const index = SALAH_ORDER.indexOf(key);
  return index >= 0 ? index : 999;
}

/**
 * Sort habits for display in the daily list.
 *
 * Groups:
 * 1. Uncompleted salah (Fajr -> Isha)
 * 2. Uncompleted non-salah (by sortOrder)
 * 3. Completed salah (Fajr -> Isha)
 * 4. Completed non-salah (by sortOrder)
 */
export function sortHabitsForDisplay(habits: HabitWithStatus[]): HabitWithStatus[] {
  if (habits.length === 0) return [];

  // Partition into 4 groups
  const uncompletedSalah: HabitWithStatus[] = [];
  const uncompletedOther: HabitWithStatus[] = [];
  const completedSalah: HabitWithStatus[] = [];
  const completedOther: HabitWithStatus[] = [];

  for (const habit of habits) {
    const salah = isSalahHabit(habit);
    if (habit.completedToday) {
      if (salah) completedSalah.push(habit);
      else completedOther.push(habit);
    } else {
      if (salah) uncompletedSalah.push(habit);
      else uncompletedOther.push(habit);
    }
  }

  // Sort salah groups by prayer chronological order
  uncompletedSalah.sort((a, b) => getSalahSortIndex(a) - getSalahSortIndex(b));
  completedSalah.sort((a, b) => getSalahSortIndex(a) - getSalahSortIndex(b));

  // Sort non-salah groups by sortOrder
  uncompletedOther.sort((a, b) => a.sortOrder - b.sortOrder);
  completedOther.sort((a, b) => a.sortOrder - b.sortOrder);

  return [
    ...uncompletedSalah,
    ...uncompletedOther,
    ...completedSalah,
    ...completedOther,
  ];
}
