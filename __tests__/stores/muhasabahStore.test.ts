/**
 * muhasabahStore tests.
 * Verifies flow state, draft management, submit, and the MUHA-04 invariant
 * (close never deducts XP).
 */

// Mock dependencies before imports
jest.mock('../../src/db/repos', () => ({
  muhasabahRepo: {
    create: jest.fn().mockResolvedValue([{ id: 'test-entry' }]),
  },
}));

jest.mock('../../src/db/client', () => ({
  db: {},
}));

jest.mock('../../src/utils/uuid', () => ({
  generateId: () => 'mock-uuid',
}));

const mockAwardXP = jest.fn().mockResolvedValue({ newTotalXP: 100, newLevel: 2 });

jest.mock('../../src/stores/gameStore', () => ({
  useGameStore: {
    getState: () => ({
      awardXP: mockAwardXP,
    }),
  },
}));

import { useMuhasabahStore } from '../../src/stores/muhasabahStore';
import { muhasabahRepo } from '../../src/db/repos';

describe('muhasabahStore', () => {
  beforeEach(() => {
    // Reset store state
    useMuhasabahStore.setState({
      isOpen: false,
      currentStep: 0,
      todayEntry: {},
      loading: false,
      closingContentIndex: 0,
    });
    jest.clearAllMocks();
  });

  describe('open()', () => {
    it('sets isOpen=true and currentStep=0', () => {
      useMuhasabahStore.getState().open();
      const state = useMuhasabahStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.currentStep).toBe(0);
    });
  });

  describe('close()', () => {
    it('resets all state', () => {
      // First open and modify
      useMuhasabahStore.getState().open();
      useMuhasabahStore.getState().setMoodRating(4);

      // Then close
      useMuhasabahStore.getState().close();
      const state = useMuhasabahStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.currentStep).toBe(0);
      expect(state.todayEntry).toEqual({});
    });

    it('does NOT deduct XP (MUHA-04 invariant)', () => {
      useMuhasabahStore.getState().open();
      useMuhasabahStore.getState().close();

      // awardXP should never be called with negative values on close
      expect(mockAwardXP).not.toHaveBeenCalled();
    });
  });

  describe('draft setters', () => {
    it('setMoodRating sets todayEntry.moodRating', () => {
      useMuhasabahStore.getState().setMoodRating(3);
      expect(useMuhasabahStore.getState().todayEntry.moodRating).toBe(3);
    });

    it('setHighlight sets todayEntry.highlightHabitId', () => {
      useMuhasabahStore.getState().setHighlight('habit-id-1');
      expect(useMuhasabahStore.getState().todayEntry.highlightHabitId).toBe('habit-id-1');
    });

    it('setFocusIntent sets todayEntry.focusIntent', () => {
      useMuhasabahStore.getState().setFocusIntent('momentum');
      expect(useMuhasabahStore.getState().todayEntry.focusIntent).toBe('momentum');
    });
  });

  describe('nextStep()', () => {
    it('advances 0→1→2', () => {
      useMuhasabahStore.getState().nextStep();
      expect(useMuhasabahStore.getState().currentStep).toBe(1);

      useMuhasabahStore.getState().nextStep();
      expect(useMuhasabahStore.getState().currentStep).toBe(2);
    });

    it('does not advance past 2', () => {
      useMuhasabahStore.setState({ currentStep: 2 });
      useMuhasabahStore.getState().nextStep();
      expect(useMuhasabahStore.getState().currentStep).toBe(2);
    });
  });

  describe('submit()', () => {
    it('calls muhasabahRepo.create and gameStore.awardXP', async () => {
      useMuhasabahStore.getState().open();
      useMuhasabahStore.getState().setMoodRating(4);
      useMuhasabahStore.getState().setHighlight('habit-1');
      useMuhasabahStore.getState().setFocusIntent('momentum');

      await useMuhasabahStore.getState().submit('user-1');

      expect(muhasabahRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          prompt1Response: '4',
          xpEarned: 12,
        }),
      );

      expect(mockAwardXP).toHaveBeenCalledWith('user-1', 12, 1.0, 'muhasabah');
    });

    it('sets currentStep to closing after success', async () => {
      useMuhasabahStore.getState().open();
      await useMuhasabahStore.getState().submit('user-1');
      expect(useMuhasabahStore.getState().currentStep).toBe('closing');
    });

    it('sets loading=false after completion', async () => {
      useMuhasabahStore.getState().open();
      await useMuhasabahStore.getState().submit('user-1');
      expect(useMuhasabahStore.getState().loading).toBe(false);
    });
  });
});
