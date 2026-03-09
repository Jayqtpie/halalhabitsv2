import {
  processCompletion,
  detectStreakBreak,
  processRecovery,
  startFreshReset,
  calculateStreakShieldBonus,
  isCompletedToday,
} from '../../src/domain/streak-engine';
import type { StreakState, MercyModeState } from '../../src/domain/streak-engine';

// Helper to create a clean StreakState for tests
function makeStreak(overrides: Partial<StreakState> = {}): StreakState {
  return {
    currentCount: 0,
    longestCount: 0,
    multiplier: 1.0,
    lastCompletedAt: null,
    isRebuilt: false,
    ...overrides,
  };
}

describe('processCompletion', () => {
  it('first completion sets streak to 1 and multiplier to 1.0', () => {
    const streak = makeStreak();
    const result = processCompletion(streak, '2025-01-15T12:00:00.000Z');

    expect(result.currentCount).toBe(1);
    expect(result.multiplier).toBe(1.0);
    expect(result.lastCompletedAt).toBe('2025-01-15T12:00:00.000Z');
  });

  it('consecutive day increments streak and adds 0.1 to multiplier', () => {
    const streak = makeStreak({
      currentCount: 3,
      longestCount: 3,
      multiplier: 1.2,
      lastCompletedAt: '2025-01-15T12:00:00.000Z',
    });
    const result = processCompletion(streak, '2025-01-16T09:00:00.000Z');

    expect(result.currentCount).toBe(4);
    expect(result.multiplier).toBeCloseTo(1.3);
  });

  it('same-day re-completion is idempotent (no change)', () => {
    const streak = makeStreak({
      currentCount: 5,
      longestCount: 5,
      multiplier: 1.4,
      lastCompletedAt: '2025-01-15T12:00:00.000Z',
    });
    const result = processCompletion(streak, '2025-01-15T18:00:00.000Z');

    expect(result.currentCount).toBe(5);
    expect(result.multiplier).toBeCloseTo(1.4);
    expect(result.lastCompletedAt).toBe('2025-01-15T12:00:00.000Z');
  });

  it('non-consecutive day (gap > 1) resets streak to 1 and multiplier to 1.0', () => {
    const streak = makeStreak({
      currentCount: 10,
      longestCount: 10,
      multiplier: 2.0,
      lastCompletedAt: '2025-01-10T12:00:00.000Z',
    });
    const result = processCompletion(streak, '2025-01-15T12:00:00.000Z');

    expect(result.currentCount).toBe(1);
    expect(result.multiplier).toBe(1.0);
  });

  it('multiplier caps at 3.0', () => {
    const streak = makeStreak({
      currentCount: 25,
      longestCount: 25,
      multiplier: 2.9,
      lastCompletedAt: '2025-01-15T12:00:00.000Z',
    });
    // Next consecutive day: multiplier would go to 3.0
    const result1 = processCompletion(streak, '2025-01-16T12:00:00.000Z');
    expect(result1.multiplier).toBeCloseTo(3.0);

    // Another consecutive day: multiplier stays at 3.0
    const result2 = processCompletion(result1, '2025-01-17T12:00:00.000Z');
    expect(result2.multiplier).toBeCloseTo(3.0);
  });

  it('updates longestCount when currentCount exceeds it', () => {
    const streak = makeStreak({
      currentCount: 5,
      longestCount: 5,
      multiplier: 1.4,
      lastCompletedAt: '2025-01-15T12:00:00.000Z',
    });
    const result = processCompletion(streak, '2025-01-16T12:00:00.000Z');

    expect(result.currentCount).toBe(6);
    expect(result.longestCount).toBe(6);
  });

  it('does not decrease longestCount after gap reset', () => {
    const streak = makeStreak({
      currentCount: 3,
      longestCount: 10,
      multiplier: 1.2,
      lastCompletedAt: '2025-01-10T12:00:00.000Z',
    });
    const result = processCompletion(streak, '2025-01-15T12:00:00.000Z');

    expect(result.currentCount).toBe(1);
    expect(result.longestCount).toBe(10); // unchanged
  });

  it('increments recoveryDay during mercy mode recovery', () => {
    const streak = makeStreak({
      currentCount: 0,
      longestCount: 10,
      multiplier: 1.0,
      lastCompletedAt: '2025-01-14T12:00:00.000Z',
      mercyMode: {
        active: true,
        recoveryDay: 1,
        preBreakStreak: 10,
      },
    });
    const result = processCompletion(streak, '2025-01-15T12:00:00.000Z');

    expect(result.mercyMode?.recoveryDay).toBe(2);
  });
});

describe('detectStreakBreak', () => {
  it('returns broken=true when gap is more than 1 calendar day', () => {
    const result = detectStreakBreak('2025-01-13T12:00:00.000Z', '2025-01-15T12:00:00.000Z', 5);

    expect(result.broken).toBe(true);
    expect(result.mercyMode).toBeDefined();
    expect(result.mercyMode?.active).toBe(true);
    expect(result.mercyMode?.preBreakStreak).toBe(5);
    expect(result.mercyMode?.recoveryDay).toBe(0);
  });

  it('returns broken=false when last completion was yesterday', () => {
    const result = detectStreakBreak('2025-01-14T23:00:00.000Z', '2025-01-15T08:00:00.000Z', 5);

    expect(result.broken).toBe(false);
    expect(result.mercyMode).toBeUndefined();
  });

  it('returns broken=false when last completion was today', () => {
    const result = detectStreakBreak('2025-01-15T08:00:00.000Z', '2025-01-15T18:00:00.000Z', 5);

    expect(result.broken).toBe(false);
  });

  it('returns broken=false when lastCompletedAt is null (no prior completions)', () => {
    const result = detectStreakBreak(null, '2025-01-15T12:00:00.000Z', 0);

    expect(result.broken).toBe(false);
  });
});

describe('processRecovery', () => {
  it('day 1 and 2: complete=false, restoredStreak=0', () => {
    const mercy: MercyModeState = { active: true, recoveryDay: 0, preBreakStreak: 20 };

    const day1 = processRecovery(mercy);
    expect(day1.complete).toBe(false);
    expect(day1.restoredStreak).toBe(0);
    expect(day1.updatedState.recoveryDay).toBe(1);

    const day2 = processRecovery(day1.updatedState);
    expect(day2.complete).toBe(false);
    expect(day2.restoredStreak).toBe(0);
    expect(day2.updatedState.recoveryDay).toBe(2);
  });

  it('day 3: complete=true, restoredStreak = floor(preBreakStreak * 0.25)', () => {
    const mercy: MercyModeState = { active: true, recoveryDay: 2, preBreakStreak: 20 };

    const result = processRecovery(mercy);
    expect(result.complete).toBe(true);
    expect(result.restoredStreak).toBe(5); // floor(20 * 0.25) = 5
  });

  it('minimum restored streak is 1 when preBreakStreak >= 4', () => {
    const mercy: MercyModeState = { active: true, recoveryDay: 2, preBreakStreak: 4 };

    const result = processRecovery(mercy);
    expect(result.complete).toBe(true);
    expect(result.restoredStreak).toBe(1); // floor(4 * 0.25) = 1
  });

  it('restored streak is 0 when preBreakStreak < 4', () => {
    // floor(3 * 0.25) = 0, and since preBreakStreak < 4, minimum doesn't apply
    const mercy: MercyModeState = { active: true, recoveryDay: 2, preBreakStreak: 2 };

    const result = processRecovery(mercy);
    expect(result.complete).toBe(true);
    expect(result.restoredStreak).toBe(0); // floor(2 * 0.25) = 0
  });
});

describe('startFreshReset', () => {
  it('returns clean StreakState with all values reset', () => {
    const result = startFreshReset();

    expect(result.currentCount).toBe(0);
    expect(result.longestCount).toBe(0);
    expect(result.multiplier).toBe(1.0);
    expect(result.lastCompletedAt).toBeNull();
    expect(result.isRebuilt).toBe(false);
    expect(result.mercyMode).toBeUndefined();
  });
});

describe('calculateStreakShieldBonus', () => {
  it('returns true when completion time is within prayer window', () => {
    const completionTime = new Date('2025-01-15T06:30:00.000Z');
    const windowStart = new Date('2025-01-15T06:00:00.000Z');
    const windowEnd = new Date('2025-01-15T07:30:00.000Z');

    expect(calculateStreakShieldBonus(completionTime, windowStart, windowEnd)).toBe(true);
  });

  it('returns false when completion time is outside prayer window', () => {
    const completionTime = new Date('2025-01-15T08:00:00.000Z');
    const windowStart = new Date('2025-01-15T06:00:00.000Z');
    const windowEnd = new Date('2025-01-15T07:30:00.000Z');

    expect(calculateStreakShieldBonus(completionTime, windowStart, windowEnd)).toBe(false);
  });

  it('returns true at exact window start, false at exact window end', () => {
    const windowStart = new Date('2025-01-15T06:00:00.000Z');
    const windowEnd = new Date('2025-01-15T07:30:00.000Z');

    expect(calculateStreakShieldBonus(windowStart, windowStart, windowEnd)).toBe(true);
    expect(calculateStreakShieldBonus(windowEnd, windowStart, windowEnd)).toBe(false);
  });
});

describe('isCompletedToday', () => {
  it('returns true when lastCompletedAt is same calendar day as reference', () => {
    expect(isCompletedToday('2025-01-15T08:00:00.000Z', '2025-01-15T20:00:00.000Z')).toBe(true);
  });

  it('returns false when lastCompletedAt is different calendar day', () => {
    expect(isCompletedToday('2025-01-14T23:00:00.000Z', '2025-01-15T01:00:00.000Z')).toBe(false);
  });

  it('returns false when lastCompletedAt is null', () => {
    expect(isCompletedToday(null, '2025-01-15T12:00:00.000Z')).toBe(false);
  });
});
