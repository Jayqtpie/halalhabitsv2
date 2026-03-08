/**
 * Game/XP domain state management.
 *
 * Read cache for game progression data stored in SQLite.
 * NO persist middleware - game data lives in SQLite via repository layer.
 *
 * Usage with useShallow for multi-field selectors:
 *   const { currentLevel, totalXP } = useGameStore(useShallow(s => ({ currentLevel: s.currentLevel, totalXP: s.totalXP })));
 */
import { create } from 'zustand';
import type { Title, UserTitle } from '../types/database';

interface GameState {
  currentLevel: number;
  totalXP: number;
  currentMultiplier: number;
  titles: UserTitle[];
  activeTitle: Title | null;
  loading: boolean;
  setLevel: (level: number) => void;
  setTotalXP: (xp: number) => void;
  setMultiplier: (multiplier: number) => void;
  setTitles: (titles: UserTitle[]) => void;
  setActiveTitle: (title: Title | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentLevel: 1,
  totalXP: 0,
  currentMultiplier: 1.0,
  titles: [],
  activeTitle: null,
  loading: false,

  setLevel: (level) => set({ currentLevel: level }),
  setTotalXP: (xp) => set({ totalXP: xp }),
  setMultiplier: (multiplier) => set({ currentMultiplier: multiplier }),
  setTitles: (titles) => set({ titles }),
  setActiveTitle: (title) => set({ activeTitle: title }),
}));
