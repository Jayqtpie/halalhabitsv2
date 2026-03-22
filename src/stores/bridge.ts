/**
 * Cross-store bridge — breaks circular dependency between gameStore and habitStore.
 *
 * habitStore registers itself here on creation. gameStore reads via getHabitStoreState()
 * instead of dynamically importing habitStore.
 */
import type { StreakState } from '../types/habits';

interface HabitStoreSnapshot {
  streaks: Record<string, StreakState>;
  completions: Record<string, boolean>;
}

type HabitStoreGetter = () => HabitStoreSnapshot;

let _getHabitStoreState: HabitStoreGetter | null = null;

/** Called by habitStore at creation time to register its getState function. */
export function registerHabitStore(getter: HabitStoreGetter) {
  _getHabitStoreState = getter;
}

/** Called by gameStore to read habitStore state without importing it. */
export function getHabitStoreState(): HabitStoreSnapshot {
  if (!_getHabitStoreState) {
    return { streaks: {}, completions: {} };
  }
  return _getHabitStoreState();
}
