/**
 * Tests for habit sorting logic
 */
import { sortHabitsForDisplay } from '../../src/domain/habit-sorter';
import type { HabitWithStatus } from '../../src/types/habits';

/**
 * Helper to create a minimal HabitWithStatus for testing.
 * Only the fields used by the sorter need real values.
 */
function makeHabit(overrides: {
  name: string;
  type: string;
  presetKey?: string | null;
  sortOrder?: number;
  completedToday?: boolean;
}): HabitWithStatus {
  return {
    id: overrides.name,
    userId: 'user-1',
    name: overrides.name,
    type: overrides.type,
    presetKey: overrides.presetKey ?? null,
    category: overrides.type === 'salah' ? 'salah' : 'custom',
    frequency: 'daily',
    frequencyDays: null,
    timeWindowStart: null,
    timeWindowEnd: null,
    difficultyTier: 'medium',
    baseXp: 30,
    status: 'active',
    sortOrder: overrides.sortOrder ?? 0,
    icon: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    completedToday: overrides.completedToday ?? false,
    streak: null,
    prayerWindow: null,
  } as HabitWithStatus;
}

describe('sortHabitsForDisplay', () => {
  it('places salah habits before non-salah', () => {
    const habits = [
      makeHabit({ name: 'Quran Reading', type: 'custom', sortOrder: 0 }),
      makeHabit({ name: 'Fajr', type: 'salah', presetKey: 'fajr' }),
    ];

    const sorted = sortHabitsForDisplay(habits);
    expect(sorted[0].name).toBe('Fajr');
    expect(sorted[1].name).toBe('Quran Reading');
  });

  it('orders salah habits in Fajr -> Isha chronological order', () => {
    const habits = [
      makeHabit({ name: 'Isha', type: 'salah', presetKey: 'isha' }),
      makeHabit({ name: 'Fajr', type: 'salah', presetKey: 'fajr' }),
      makeHabit({ name: 'Maghrib', type: 'salah', presetKey: 'maghrib' }),
      makeHabit({ name: 'Asr', type: 'salah', presetKey: 'asr' }),
      makeHabit({ name: 'Dhuhr', type: 'salah', presetKey: 'dhuhr' }),
    ];

    const sorted = sortHabitsForDisplay(habits);
    expect(sorted.map((h) => h.name)).toEqual([
      'Fajr',
      'Dhuhr',
      'Asr',
      'Maghrib',
      'Isha',
    ]);
  });

  it('orders non-salah habits by sortOrder', () => {
    const habits = [
      makeHabit({ name: 'Charity', type: 'custom', sortOrder: 3 }),
      makeHabit({ name: 'Quran', type: 'custom', sortOrder: 1 }),
      makeHabit({ name: 'Dhikr', type: 'custom', sortOrder: 2 }),
    ];

    const sorted = sortHabitsForDisplay(habits);
    expect(sorted.map((h) => h.name)).toEqual(['Quran', 'Dhikr', 'Charity']);
  });

  it('sinks completed habits below uncompleted within each group', () => {
    const habits = [
      makeHabit({ name: 'Fajr', type: 'salah', presetKey: 'fajr', completedToday: true }),
      makeHabit({ name: 'Dhuhr', type: 'salah', presetKey: 'dhuhr', completedToday: false }),
      makeHabit({ name: 'Asr', type: 'salah', presetKey: 'asr', completedToday: false }),
    ];

    const sorted = sortHabitsForDisplay(habits);
    // Uncompleted salah first (Dhuhr, Asr), then completed (Fajr)
    expect(sorted[0].name).toBe('Dhuhr');
    expect(sorted[1].name).toBe('Asr');
    expect(sorted[2].name).toBe('Fajr');
  });

  it('handles mixed salah and non-salah with completions correctly', () => {
    const habits = [
      makeHabit({ name: 'Quran', type: 'custom', sortOrder: 1, completedToday: false }),
      makeHabit({ name: 'Fajr', type: 'salah', presetKey: 'fajr', completedToday: true }),
      makeHabit({ name: 'Dhuhr', type: 'salah', presetKey: 'dhuhr', completedToday: false }),
      makeHabit({ name: 'Charity', type: 'custom', sortOrder: 2, completedToday: true }),
    ];

    const sorted = sortHabitsForDisplay(habits);
    // Expected order:
    // 1. Uncompleted salah (Dhuhr)
    // 2. Uncompleted non-salah (Quran)
    // 3. Completed salah (Fajr)
    // 4. Completed non-salah (Charity)
    expect(sorted.map((h) => h.name)).toEqual([
      'Dhuhr',
      'Quran',
      'Fajr',
      'Charity',
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(sortHabitsForDisplay([])).toEqual([]);
  });
});
