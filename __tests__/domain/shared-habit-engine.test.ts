/**
 * shared-habit-engine tests.
 * Verifies all pure domain functions for Shared Habit System logic.
 * No React, no DB, no side effects.
 *
 * Privacy Gate: salah and muhasabah habit types must be excluded from sharing.
 */

import {
  isEligibleForSharing,
  createSharedHabitProposal,
  calculateSharedStreak,
  canEndSharedHabit,
  WORSHIP_HABIT_TYPES,
} from '../../src/domain/shared-habit-engine';

// ---------------------------------------------------------------------------
// WORSHIP_HABIT_TYPES constant
// ---------------------------------------------------------------------------
describe('WORSHIP_HABIT_TYPES', () => {
  it('includes salah', () => {
    expect(WORSHIP_HABIT_TYPES).toContain('salah');
  });

  it('includes muhasabah', () => {
    expect(WORSHIP_HABIT_TYPES).toContain('muhasabah');
  });

  it('does not include custom', () => {
    expect(WORSHIP_HABIT_TYPES).not.toContain('custom');
  });
});

// ---------------------------------------------------------------------------
// isEligibleForSharing
// ---------------------------------------------------------------------------
describe('isEligibleForSharing', () => {
  it("returns false for 'salah' (Privacy Gate)", () => {
    expect(isEligibleForSharing('salah')).toBe(false);
  });

  it("returns false for 'muhasabah' (Privacy Gate)", () => {
    expect(isEligibleForSharing('muhasabah')).toBe(false);
  });

  it("returns true for 'custom'", () => {
    expect(isEligibleForSharing('custom')).toBe(true);
  });

  it("returns true for 'focus' (character habit)", () => {
    expect(isEligibleForSharing('focus')).toBe(true);
  });

  it("returns true for 'kindness' (character habit)", () => {
    expect(isEligibleForSharing('kindness')).toBe(true);
  });

  it("returns true for 'exercise'", () => {
    expect(isEligibleForSharing('exercise')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createSharedHabitProposal
// ---------------------------------------------------------------------------
describe('createSharedHabitProposal', () => {
  const validParams = {
    buddyPairId: 'pair-123',
    createdByUserId: 'user-456',
    habitType: 'custom',
    name: 'Read 10 pages',
  };

  it('returns a valid proposal object with status=proposed', () => {
    const proposal = createSharedHabitProposal(validParams);
    expect(proposal.status).toBe('proposed');
  });

  it('returns a proposal with the correct buddyPairId', () => {
    const proposal = createSharedHabitProposal(validParams);
    expect(proposal.buddyPairId).toBe('pair-123');
  });

  it('returns a proposal with the correct createdByUserId', () => {
    const proposal = createSharedHabitProposal(validParams);
    expect(proposal.createdByUserId).toBe('user-456');
  });

  it('returns a proposal with the correct habitType', () => {
    const proposal = createSharedHabitProposal(validParams);
    expect(proposal.habitType).toBe('custom');
  });

  it('returns a proposal with the correct name', () => {
    const proposal = createSharedHabitProposal(validParams);
    expect(proposal.name).toBe('Read 10 pages');
  });

  it("defaults targetFrequency to 'daily' when not provided", () => {
    const proposal = createSharedHabitProposal(validParams);
    expect(proposal.targetFrequency).toBe('daily');
  });

  it('accepts explicit targetFrequency', () => {
    const proposal = createSharedHabitProposal({ ...validParams, targetFrequency: 'weekly' });
    expect(proposal.targetFrequency).toBe('weekly');
  });

  it('includes createdAt timestamp', () => {
    const proposal = createSharedHabitProposal(validParams);
    expect(proposal.createdAt).toBeDefined();
    expect(typeof proposal.createdAt).toBe('string');
  });

  it('includes updatedAt timestamp', () => {
    const proposal = createSharedHabitProposal(validParams);
    expect(proposal.updatedAt).toBeDefined();
    expect(typeof proposal.updatedAt).toBe('string');
  });

  it("throws an error if habitType is 'salah' (Privacy Gate)", () => {
    expect(() =>
      createSharedHabitProposal({ ...validParams, habitType: 'salah' })
    ).toThrow();
  });

  it("throws an error if habitType is 'muhasabah' (Privacy Gate)", () => {
    expect(() =>
      createSharedHabitProposal({ ...validParams, habitType: 'muhasabah' })
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// calculateSharedStreak
// ---------------------------------------------------------------------------
describe('calculateSharedStreak', () => {
  it('returns 0 when there is no overlap', () => {
    const result = calculateSharedStreak(
      ['2026-03-25', '2026-03-24'],
      ['2026-03-23', '2026-03-22']
    );
    expect(result).toBe(0);
  });

  it('returns 2 when both arrays share 2 most-recent consecutive dates', () => {
    const result = calculateSharedStreak(
      ['2026-03-25', '2026-03-24'],
      ['2026-03-25', '2026-03-24', '2026-03-23']
    );
    expect(result).toBe(2);
  });

  it('returns 0 when either array is empty', () => {
    expect(calculateSharedStreak([], ['2026-03-25'])).toBe(0);
    expect(calculateSharedStreak(['2026-03-25'], [])).toBe(0);
    expect(calculateSharedStreak([], [])).toBe(0);
  });

  it('returns 1 when only most recent date is shared', () => {
    const result = calculateSharedStreak(
      ['2026-03-25'],
      ['2026-03-25', '2026-03-23']
    );
    expect(result).toBe(1);
  });

  it('returns full streak when all dates overlap consecutively', () => {
    const result = calculateSharedStreak(
      ['2026-03-25', '2026-03-24', '2026-03-23'],
      ['2026-03-25', '2026-03-24', '2026-03-23']
    );
    expect(result).toBe(3);
  });

  it('stops counting at first non-shared date in consecutive run', () => {
    // UserA has 3 days, userB missing 2026-03-24 — streak breaks after first date
    const result = calculateSharedStreak(
      ['2026-03-25', '2026-03-24', '2026-03-23'],
      ['2026-03-25', '2026-03-23']
    );
    // 2026-03-25 shared, 2026-03-24 not shared — streak stops at 1
    expect(result).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// canEndSharedHabit
// ---------------------------------------------------------------------------
describe('canEndSharedHabit', () => {
  it("returns true for 'active' (either player can end)", () => {
    expect(canEndSharedHabit('active')).toBe(true);
  });

  it("returns false for 'ended'", () => {
    expect(canEndSharedHabit('ended')).toBe(false);
  });

  it("returns true for 'proposed' (can decline a proposal)", () => {
    expect(canEndSharedHabit('proposed')).toBe(true);
  });

  it("returns false for an unknown status", () => {
    expect(canEndSharedHabit('unknown_status')).toBe(false);
  });
});
