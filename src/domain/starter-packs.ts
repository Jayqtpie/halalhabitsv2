/**
 * Starter habit bundles for onboarding.
 *
 * Three curated bundles to help new users begin their discipline journey.
 * All habitKeys are validated against the preset library.
 *
 * Pure data — no React imports.
 */
import { HABIT_PRESETS } from './presets';

// ─── Types ───────────────────────────────────────────────────────────

export interface StarterPack {
  id: string;
  name: string;
  description: string;
  habitKeys: string[];
}

// ─── Starter Packs ───────────────────────────────────────────────────

export const STARTER_PACKS: StarterPack[] = [
  {
    id: 'beginner-path',
    name: 'Beginner Path',
    description: 'Three gentle habits to build your morning foundation.',
    habitKeys: ['fajr', 'morning-adhkar', 'daily-reading'],
  },
  {
    id: 'salah-focus',
    name: 'Salah Focus',
    description: 'All five daily prayers — the pillar of your discipline.',
    habitKeys: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'],
  },
  {
    id: 'full-discipline',
    name: 'Full Discipline',
    description: 'A balanced program spanning prayer, remembrance, and recitation.',
    habitKeys: ['fajr', 'daily-reading', 'morning-adhkar', 'daily-dua', 'evening-adhkar'],
  },
];

// ─── Runtime Validation ───────────────────────────────────────────────

// Validate all keys at module load time (will throw in dev if keys are wrong)
const validKeys = new Set(HABIT_PRESETS.map((p) => p.key));

for (const pack of STARTER_PACKS) {
  for (const key of pack.habitKeys) {
    if (!validKeys.has(key)) {
      throw new Error(
        `[starter-packs] Invalid habitKey "${key}" in pack "${pack.name}". ` +
          `Valid keys: ${[...validKeys].join(', ')}`,
      );
    }
  }
}
