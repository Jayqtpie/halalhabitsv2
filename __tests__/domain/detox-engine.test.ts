/**
 * detox-engine tests.
 * Verifies all pure domain functions for Dopamine Detox Dungeon logic.
 * No React, no DB, no side effects.
 */

import {
  calculateDetoxXP,
  calculateEarlyExitPenalty,
  isProtectedByDetox,
  isDeepVariantAvailableThisWeek,
  getRemainingMs,
  canStartSession,
  getSessionEndTime,
} from '../../src/domain/detox-engine';

// ---------------------------------------------------------------------------
// calculateDetoxXP
// ---------------------------------------------------------------------------
describe('calculateDetoxXP', () => {
  describe('daily variant', () => {
    it('returns 50 XP for 2 hours', () => {
      expect(calculateDetoxXP('daily', 2)).toBe(50);
    });

    it('returns 100 XP for 4 hours', () => {
      expect(calculateDetoxXP('daily', 4)).toBe(100);
    });

    it('returns 150 XP for 6 hours', () => {
      expect(calculateDetoxXP('daily', 6)).toBe(150);
    });

    it('clamps to minimum 2h (50 XP) for 1 hour', () => {
      expect(calculateDetoxXP('daily', 1)).toBe(50);
    });

    it('clamps to maximum 6h (150 XP) for 8 hours', () => {
      expect(calculateDetoxXP('daily', 8)).toBe(150);
    });

    it('returns 75 XP for 3 hours', () => {
      expect(calculateDetoxXP('daily', 3)).toBe(75);
    });
  });

  describe('deep variant', () => {
    it('returns 300 XP for 8 hours deep session', () => {
      expect(calculateDetoxXP('deep', 8)).toBe(300);
    });

    it('returns 300 XP for 6 hours deep session', () => {
      expect(calculateDetoxXP('deep', 6)).toBe(300);
    });

    it('always returns 300 regardless of duration', () => {
      expect(calculateDetoxXP('deep', 4)).toBe(300);
      expect(calculateDetoxXP('deep', 12)).toBe(300);
    });
  });
});

// ---------------------------------------------------------------------------
// calculateEarlyExitPenalty
// ---------------------------------------------------------------------------
describe('calculateEarlyExitPenalty', () => {
  const MS_PER_HOUR = 3600000;

  it('returns full penalty (100) when exiting immediately (0% complete)', () => {
    const startedAt = '2026-01-01T10:00:00.000Z';
    const now = startedAt; // exactly at start
    expect(calculateEarlyExitPenalty(startedAt, 4, 100, now)).toBe(100);
  });

  it('returns 50% penalty when exiting at 50% completion', () => {
    const startedAt = '2026-01-01T10:00:00.000Z';
    const nowMs = new Date(startedAt).getTime() + 2 * MS_PER_HOUR; // 2h into 4h session
    const now = new Date(nowMs).toISOString();
    expect(calculateEarlyExitPenalty(startedAt, 4, 100, now)).toBe(50);
  });

  it('returns 0 penalty when session fully elapsed', () => {
    const startedAt = '2026-01-01T10:00:00.000Z';
    const nowMs = new Date(startedAt).getTime() + 4 * MS_PER_HOUR; // exactly at end
    const now = new Date(nowMs).toISOString();
    expect(calculateEarlyExitPenalty(startedAt, 4, 100, now)).toBe(0);
  });

  it('returns 0 penalty when now is after session end', () => {
    const startedAt = '2026-01-01T10:00:00.000Z';
    const nowMs = new Date(startedAt).getTime() + 5 * MS_PER_HOUR; // past end
    const now = new Date(nowMs).toISOString();
    expect(calculateEarlyExitPenalty(startedAt, 4, 100, now)).toBe(0);
  });

  it('returns 25% penalty when exiting at 75% completion', () => {
    const startedAt = '2026-01-01T10:00:00.000Z';
    const nowMs = new Date(startedAt).getTime() + 3 * MS_PER_HOUR; // 3h into 4h session
    const now = new Date(nowMs).toISOString();
    expect(calculateEarlyExitPenalty(startedAt, 4, 100, now)).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// isProtectedByDetox
// ---------------------------------------------------------------------------
describe('isProtectedByDetox', () => {
  it('returns true when habit window is inside session (overlap)', () => {
    // habit 10:00–12:00, session 09:00–13:00
    expect(isProtectedByDetox('10:00', '12:00', '09:00', '13:00')).toBe(true);
  });

  it('returns false when habit window is after session (no overlap)', () => {
    // habit 10:00–12:00, session 14:00–16:00
    expect(isProtectedByDetox('10:00', '12:00', '14:00', '16:00')).toBe(false);
  });

  it('returns false when evening habit does not overlap morning session', () => {
    // habit 20:00–21:00, session 09:00–11:00
    expect(isProtectedByDetox('20:00', '21:00', '09:00', '11:00')).toBe(false);
  });

  it('returns true when habit window partially overlaps session start', () => {
    // habit 08:00–10:00, session 09:00–13:00 (overlap at 09:00–10:00)
    expect(isProtectedByDetox('08:00', '10:00', '09:00', '13:00')).toBe(true);
  });

  it('returns true when habit window partially overlaps session end', () => {
    // habit 12:00–14:00, session 09:00–13:00 (overlap at 12:00–13:00)
    expect(isProtectedByDetox('12:00', '14:00', '09:00', '13:00')).toBe(true);
  });

  it('returns false when habit ends exactly when session starts (adjacent, no overlap)', () => {
    // habit 08:00–09:00, session 09:00–13:00
    expect(isProtectedByDetox('08:00', '09:00', '09:00', '13:00')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isDeepVariantAvailableThisWeek
// ---------------------------------------------------------------------------
describe('isDeepVariantAvailableThisWeek', () => {
  it('returns true when no existing deep sessions', () => {
    expect(isDeepVariantAvailableThisWeek([])).toBe(true);
  });

  it('returns true when existing session is abandoned (re-entry allowed)', () => {
    expect(isDeepVariantAvailableThisWeek([{ status: 'abandoned' }])).toBe(true);
  });

  it('returns false when existing session is completed', () => {
    expect(isDeepVariantAvailableThisWeek([{ status: 'completed' }])).toBe(false);
  });

  it('returns false when existing session is active', () => {
    expect(isDeepVariantAvailableThisWeek([{ status: 'active' }])).toBe(false);
  });

  it('returns false when there are 2+ sessions regardless of status', () => {
    expect(isDeepVariantAvailableThisWeek([{ status: 'abandoned' }, { status: 'abandoned' }])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRemainingMs
// ---------------------------------------------------------------------------
describe('getRemainingMs', () => {
  const MS_PER_HOUR = 3600000;

  it('returns approximately half duration at midpoint', () => {
    const now = Date.now();
    const startedAt = new Date(now - 2 * MS_PER_HOUR).toISOString(); // started 2h ago
    const remaining = getRemainingMs(startedAt, 4); // 4h session
    // Should be approximately 2 hours remaining (within 5 seconds tolerance)
    expect(remaining).toBeGreaterThan(2 * MS_PER_HOUR - 5000);
    expect(remaining).toBeLessThanOrEqual(2 * MS_PER_HOUR);
  });

  it('returns 0 when session has ended', () => {
    const startedAt = new Date(Date.now() - 5 * 3600000).toISOString(); // started 5h ago
    expect(getRemainingMs(startedAt, 4)).toBe(0); // 4h session ended 1h ago
  });

  it('returns full duration for brand-new session', () => {
    const startedAt = new Date().toISOString();
    const remaining = getRemainingMs(startedAt, 4);
    expect(remaining).toBeGreaterThan(4 * MS_PER_HOUR - 5000);
    expect(remaining).toBeLessThanOrEqual(4 * MS_PER_HOUR);
  });
});

// ---------------------------------------------------------------------------
// canStartSession
// ---------------------------------------------------------------------------
describe('canStartSession', () => {
  describe('daily variant', () => {
    it('returns true with no existing sessions', () => {
      expect(canStartSession('daily', [])).toBe(true);
    });

    it('returns true with 1 abandoned session (1 retry allowed)', () => {
      expect(canStartSession('daily', [{ status: 'abandoned' }])).toBe(true);
    });

    it('returns false with 2 abandoned sessions (max retries reached)', () => {
      expect(canStartSession('daily', [{ status: 'abandoned' }, { status: 'abandoned' }])).toBe(false);
    });

    it('returns false when a session is active', () => {
      expect(canStartSession('daily', [{ status: 'active' }])).toBe(false);
    });

    it('returns false when a session is completed', () => {
      expect(canStartSession('daily', [{ status: 'completed' }])).toBe(false);
    });
  });

  describe('deep variant', () => {
    it('returns true with no existing weekly deep sessions', () => {
      expect(canStartSession('deep', [])).toBe(true);
    });

    it('returns true with 1 abandoned weekly deep session (re-entry)', () => {
      expect(canStartSession('deep', [{ status: 'abandoned' }])).toBe(true);
    });

    it('returns false when deep session is completed', () => {
      expect(canStartSession('deep', [{ status: 'completed' }])).toBe(false);
    });

    it('returns false when deep session is active', () => {
      expect(canStartSession('deep', [{ status: 'active' }])).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// getSessionEndTime
// ---------------------------------------------------------------------------
describe('getSessionEndTime', () => {
  it('returns startedAt + 4 hours as ISO string', () => {
    const startedAt = '2026-01-01T10:00:00.000Z';
    const expected = '2026-01-01T14:00:00.000Z';
    expect(getSessionEndTime(startedAt, 4)).toBe(expected);
  });

  it('returns startedAt + 2 hours as ISO string', () => {
    const startedAt = '2026-01-01T08:30:00.000Z';
    const expected = '2026-01-01T10:30:00.000Z';
    expect(getSessionEndTime(startedAt, 2)).toBe(expected);
  });

  it('returns startedAt + 8 hours for deep session', () => {
    const startedAt = '2026-01-01T00:00:00.000Z';
    const expected = '2026-01-01T08:00:00.000Z';
    expect(getSessionEndTime(startedAt, 8)).toBe(expected);
  });
});
