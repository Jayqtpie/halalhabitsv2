/**
 * buddy-engine tests.
 * Verifies all pure domain functions for Buddy Connection System logic.
 * No React, no DB, no side effects.
 */

// Mock expo-crypto so tests run in Node (no native module needed)
jest.mock('expo-crypto', () => ({
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
}));

import {
  generateInviteCode,
  isInviteCodeExpired,
  canSendRequest,
  canAddBuddy,
  getStatusTransition,
  isBlocked,
  getBuddyId,
  getBlockerSide,
  INVITE_CODE_EXPIRY_MS,
  MAX_PENDING_OUTBOUND,
  MAX_BUDDIES,
} from '../../src/domain/buddy-engine';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
describe('Constants', () => {
  it('INVITE_CODE_EXPIRY_MS equals 48 * 60 * 60 * 1000 (172800000)', () => {
    expect(INVITE_CODE_EXPIRY_MS).toBe(172800000);
  });

  it('MAX_PENDING_OUTBOUND equals 10', () => {
    expect(MAX_PENDING_OUTBOUND).toBe(10);
  });

  it('MAX_BUDDIES equals 20', () => {
    expect(MAX_BUDDIES).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// generateInviteCode
// ---------------------------------------------------------------------------
describe('generateInviteCode', () => {
  it('returns a string matching /^HH-[A-Z0-9]{4,5}$/', () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^HH-[A-Z0-9]{4,5}$/);
  });

  it('returns code with HH- prefix', () => {
    const code = generateInviteCode();
    expect(code.startsWith('HH-')).toBe(true);
  });

  it('generates different codes on repeated calls (uses randomness)', () => {
    const codes = new Set(Array.from({ length: 10 }, () => generateInviteCode()));
    // At minimum, most calls should produce unique codes
    expect(codes.size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// isInviteCodeExpired
// ---------------------------------------------------------------------------
describe('isInviteCodeExpired', () => {
  it('returns true for an old date (2020-01-01)', () => {
    expect(isInviteCodeExpired('2020-01-01T00:00:00.000Z')).toBe(true);
  });

  it('returns false for a date just created (now)', () => {
    expect(isInviteCodeExpired(new Date().toISOString())).toBe(false);
  });

  it('returns true for a date 49 hours ago', () => {
    const fortyNineHoursAgo = new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString();
    expect(isInviteCodeExpired(fortyNineHoursAgo)).toBe(true);
  });

  it('returns false for a date 47 hours ago (within 48h window)', () => {
    const fortySevenHoursAgo = new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString();
    expect(isInviteCodeExpired(fortySevenHoursAgo)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// canSendRequest
// ---------------------------------------------------------------------------
describe('canSendRequest', () => {
  it('returns true when 9 pending outbound requests exist', () => {
    expect(canSendRequest(9)).toBe(true);
  });

  it('returns false when 10 pending outbound requests exist (at cap)', () => {
    expect(canSendRequest(10)).toBe(false);
  });

  it('returns false when 11 pending outbound requests exist (over cap)', () => {
    expect(canSendRequest(11)).toBe(false);
  });

  it('returns true when 0 pending outbound requests exist', () => {
    expect(canSendRequest(0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// canAddBuddy
// ---------------------------------------------------------------------------
describe('canAddBuddy', () => {
  it('returns true when 19 buddies exist (under cap)', () => {
    expect(canAddBuddy(19)).toBe(true);
  });

  it('returns false when 20 buddies exist (at cap)', () => {
    expect(canAddBuddy(20)).toBe(false);
  });

  it('returns false when 21 buddies exist (over cap)', () => {
    expect(canAddBuddy(21)).toBe(false);
  });

  it('returns true when 0 buddies exist', () => {
    expect(canAddBuddy(0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getStatusTransition
// ---------------------------------------------------------------------------
describe('getStatusTransition', () => {
  it("returns 'accepted' when pending + accept", () => {
    expect(getStatusTransition('pending', 'accept')).toBe('accepted');
  });

  it("returns 'removed' when pending + decline", () => {
    expect(getStatusTransition('pending', 'decline')).toBe('removed');
  });

  it("returns 'removed' when accepted + remove", () => {
    expect(getStatusTransition('accepted', 'remove')).toBe('removed');
  });

  it("returns 'blocked_by_a' when accepted + block + side 'a'", () => {
    expect(getStatusTransition('accepted', 'block', 'a')).toBe('blocked_by_a');
  });

  it("returns 'blocked_by_b' when accepted + block + side 'b'", () => {
    expect(getStatusTransition('accepted', 'block', 'b')).toBe('blocked_by_b');
  });

  it("returns null when removed + accept (invalid transition)", () => {
    expect(getStatusTransition('removed', 'accept')).toBeNull();
  });

  it("returns null for an invalid transition from blocked_by_a", () => {
    expect(getStatusTransition('blocked_by_a', 'accept')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isBlocked
// ---------------------------------------------------------------------------
describe('isBlocked', () => {
  it("returns true for 'blocked_by_a'", () => {
    expect(isBlocked('blocked_by_a')).toBe(true);
  });

  it("returns true for 'blocked_by_b'", () => {
    expect(isBlocked('blocked_by_b')).toBe(true);
  });

  it("returns false for 'accepted'", () => {
    expect(isBlocked('accepted')).toBe(false);
  });

  it("returns false for 'pending'", () => {
    expect(isBlocked('pending')).toBe(false);
  });

  it("returns false for 'removed'", () => {
    expect(isBlocked('removed')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getBuddyId
// ---------------------------------------------------------------------------
describe('getBuddyId', () => {
  it('returns user-b-id when current user is user-a', () => {
    expect(getBuddyId('user-a-id', 'user-b-id', 'user-a-id')).toBe('user-b-id');
  });

  it('returns user-a-id when current user is user-b', () => {
    expect(getBuddyId('user-a-id', 'user-b-id', 'user-b-id')).toBe('user-a-id');
  });
});

// ---------------------------------------------------------------------------
// getBlockerSide
// ---------------------------------------------------------------------------
describe('getBlockerSide', () => {
  it("returns 'a' when the blocker is user-a", () => {
    expect(getBlockerSide('user-a-id', 'user-b-id', 'user-a-id')).toBe('a');
  });

  it("returns 'b' when the blocker is user-b", () => {
    expect(getBlockerSide('user-a-id', 'user-b-id', 'user-b-id')).toBe('b');
  });
});
