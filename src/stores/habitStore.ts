/**
 * Habit domain state management.
 *
 * Read cache for habit data stored in SQLite via habitRepo.
 * NO persist middleware - habit data lives in SQLite via repository layer.
 *
 * Usage with useShallow for multi-field selectors:
 *   const { habits, loading } = useHabitStore(useShallow(s => ({ habits: s.habits, loading: s.loading })));
 */
import { create } from 'zustand';
import type { Habit, NewHabit } from '../types/database';
import { habitRepo } from '../db/repos';

interface HabitState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  loadHabits: (userId: string) => Promise<void>;
  addHabit: (habit: NewHabit) => Promise<void>;
  archiveHabit: (habitId: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  loading: false,
  error: null,

  loadHabits: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const habits = await habitRepo.getActive(userId);
      set({ habits, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addHabit: async (habit: NewHabit) => {
    try {
      const [created] = await habitRepo.create(habit);
      set((state) => ({ habits: [...state.habits, created] }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  archiveHabit: async (habitId: string) => {
    try {
      await habitRepo.archive(habitId);
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== habitId),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
