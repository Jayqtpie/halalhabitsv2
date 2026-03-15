/**
 * Muhasabah flow state management.
 *
 * Manages the 3-step evening reflection flow: mood → highlight → focus → closing.
 * NO persist middleware — data lives in SQLite via muhasabahRepo.
 *
 * Privacy: All Muhasabah data is PRIVATE (never synced).
 * Adab: close() resets state with NO XP deduction and NO shame flags (MUHA-04).
 */
import { create } from 'zustand';
import { muhasabahRepo } from '../db/repos';
import { generateId } from '../utils/uuid';
import { getClosingContent } from '../domain/muhasabah-engine';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MuhasabahDraft {
  moodRating?: 1 | 2 | 3 | 4 | 5;
  highlightHabitId?: string;
  focusIntent?: 'momentum' | 'try_harder' | 'rest';
}

export interface MuhasabahState {
  isOpen: boolean;
  currentStep: 0 | 1 | 2 | 'closing';
  todayEntry: MuhasabahDraft;
  loading: boolean;
  closingContentIndex: number;

  open: () => void;
  close: () => void;
  setMoodRating: (rating: 1 | 2 | 3 | 4 | 5) => void;
  setHighlight: (habitId: string) => void;
  setFocusIntent: (intent: 'momentum' | 'try_harder' | 'rest') => void;
  nextStep: () => void;
  submit: (userId: string) => Promise<void>;
}

// ─── Store ───────────────────────────────────────────────────────────────────

let closingCounter = 0;

export const useMuhasabahStore = create<MuhasabahState>((set, get) => ({
  isOpen: false,
  currentStep: 0,
  todayEntry: {},
  loading: false,
  closingContentIndex: 0,

  open: () => set({ isOpen: true, currentStep: 0, todayEntry: {}, loading: false }),

  // MUHA-04: close() resets with NO XP deduction, NO shame state
  close: () => set({ isOpen: false, currentStep: 0, todayEntry: {}, loading: false }),

  setMoodRating: (rating) =>
    set((s) => ({ todayEntry: { ...s.todayEntry, moodRating: rating } })),

  setHighlight: (habitId) =>
    set((s) => ({ todayEntry: { ...s.todayEntry, highlightHabitId: habitId } })),

  setFocusIntent: (intent) =>
    set((s) => ({ todayEntry: { ...s.todayEntry, focusIntent: intent } })),

  nextStep: () =>
    set((s) => {
      const next = s.currentStep === 0 ? 1 : s.currentStep === 1 ? 2 : s.currentStep;
      return { currentStep: next };
    }),

  submit: async (userId: string) => {
    const state = get();
    if (state.loading) return;
    set({ loading: true });

    try {
      const now = new Date().toISOString();
      const entry = {
        id: generateId(),
        userId,
        prompt1Text: 'How was your discipline today?',
        prompt1Response: String(state.todayEntry.moodRating ?? ''),
        prompt2Text: 'What was your highlight?',
        prompt2Response: state.todayEntry.highlightHabitId ?? '',
        prompt3Text: 'What is your focus for tomorrow?',
        prompt3Response: state.todayEntry.focusIntent ?? '',
        tomorrowIntention: state.todayEntry.focusIntent ?? '',
        xpEarned: 12,
        createdAt: now,
      };

      await muhasabahRepo.create(entry);

      // Lazy require to avoid circular dependency (same pattern as checkTitles → habitStore)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useGameStore } = require('./gameStore');
      await useGameStore.getState().awardXP(userId, 12, 1.0, 'muhasabah');

      const idx = closingCounter++;
      set({ currentStep: 'closing', loading: false, closingContentIndex: idx });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));
