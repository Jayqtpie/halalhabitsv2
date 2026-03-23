/**
 * Tests for boss-engine.ts
 * Validates all pure domain functions for Nafs Boss Arena logic.
 */

import {
  canStartBattle,
  calculateBossMaxHp,
  calculateBossXpReward,
  calculateDailyDamage,
  calculateDailyHealing,
  applyDailyOutcome,
  calculatePartialXp,
  getBossDialoguePhase,
  suggestArchetype,
  getMaxDays,
  type DailyLogEntry,
} from '../../src/domain/boss-engine';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const now = '2026-03-23T12:00:00Z';
const twoDaysAgo = '2026-03-21T12:00:00Z';
const fourDaysAgo = '2026-03-19T12:00:00Z';

// ---------------------------------------------------------------------------
// canStartBattle
// ---------------------------------------------------------------------------

describe('canStartBattle', () => {
  it('returns false when level is below 10', () => {
    expect(canStartBattle(9, null, null, now, 3)).toBe(false);
  });

  it('returns true when level is exactly 10 and no prior battle', () => {
    expect(canStartBattle(10, null, null, now, 3)).toBe(true);
  });

  it('returns true when level is above 10 and no prior battle', () => {
    expect(canStartBattle(25, null, null, now, 3)).toBe(true);
  });

  it('returns false when there is an active battle', () => {
    expect(canStartBattle(10, { status: 'active' }, null, now, 3)).toBe(false);
  });

  it('returns false when last battle ended 2 days ago (within 3-day cooldown)', () => {
    expect(canStartBattle(10, null, twoDaysAgo, now, 3)).toBe(false);
  });

  it('returns true when last battle ended 4 days ago (cooldown expired)', () => {
    expect(canStartBattle(10, null, fourDaysAgo, now, 3)).toBe(true);
  });

  it('returns true when battle is not active (e.g., status defeated) and cooldown expired', () => {
    expect(canStartBattle(10, { status: 'defeated' }, fourDaysAgo, now, 3)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// calculateBossMaxHp
// ---------------------------------------------------------------------------

describe('calculateBossMaxHp', () => {
  it('returns 100 at level 10', () => {
    expect(calculateBossMaxHp(10)).toBe(100);
  });

  it('returns 250 at level 20', () => {
    expect(calculateBossMaxHp(20)).toBe(250);
  });

  it('returns 400 at level 30', () => {
    expect(calculateBossMaxHp(30)).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// calculateBossXpReward
// ---------------------------------------------------------------------------

describe('calculateBossXpReward', () => {
  it('returns 200 at level 10', () => {
    expect(calculateBossXpReward(10)).toBe(200);
  });

  it('returns 500 at level 30', () => {
    expect(calculateBossXpReward(30)).toBe(500);
  });

  it('returns 500 at level 50 (clamped at max)', () => {
    expect(calculateBossXpReward(50)).toBe(500);
  });

  it('returns at least 200 even for low levels', () => {
    expect(calculateBossXpReward(10)).toBeGreaterThanOrEqual(200);
  });

  it('returns at most 500 for any level', () => {
    expect(calculateBossXpReward(100)).toBeLessThanOrEqual(500);
  });
});

// ---------------------------------------------------------------------------
// calculateDailyDamage
// ---------------------------------------------------------------------------

describe('calculateDailyDamage', () => {
  it('returns 20 for 100% completion (5/5 habits, maxHp=100)', () => {
    expect(calculateDailyDamage(5, 5, 100)).toBe(20);
  });

  it('returns 0 for 0 habits completed', () => {
    expect(calculateDailyDamage(0, 5, 100)).toBe(0);
  });

  it('returns 12 for 60% completion (3/5 habits, maxHp=100)', () => {
    expect(calculateDailyDamage(3, 5, 100)).toBe(12);
  });

  it('returns 0 when totalHabits is 0 (guard against division by zero)', () => {
    expect(calculateDailyDamage(0, 0, 100)).toBe(0);
  });

  it('caps at 20% of bossMaxHp per day', () => {
    expect(calculateDailyDamage(5, 5, 250)).toBe(50); // 20% of 250
  });
});

// ---------------------------------------------------------------------------
// calculateDailyHealing
// ---------------------------------------------------------------------------

describe('calculateDailyHealing', () => {
  it('returns 6 for 60% missed without mercy mode (3/5 habits, maxHp=100)', () => {
    expect(calculateDailyHealing(3, 5, 100, false)).toBe(6);
  });

  it('halves healing when mercyModeActive is true', () => {
    expect(calculateDailyHealing(3, 5, 100, true)).toBe(3);
  });

  it('returns 0 when totalHabits is 0', () => {
    expect(calculateDailyHealing(0, 0, 100, false)).toBe(0);
  });

  it('returns 10 for 100% missed without mercy', () => {
    expect(calculateDailyHealing(5, 5, 100, false)).toBe(10);
  });

  it('returns 5 for 100% missed with mercy', () => {
    expect(calculateDailyHealing(5, 5, 100, true)).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// applyDailyOutcome
// ---------------------------------------------------------------------------

describe('applyDailyOutcome', () => {
  it('returns 65 for typical outcome (currentHp=80, maxHp=100, damage=20, healing=5)', () => {
    expect(applyDailyOutcome(80, 100, 20, 5)).toBe(65);
  });

  it('clamps to 0 when damage exceeds current HP', () => {
    expect(applyDailyOutcome(5, 100, 20, 0)).toBe(0);
  });

  it('clamps to bossMaxHp when healing would exceed it', () => {
    expect(applyDailyOutcome(95, 100, 0, 10)).toBe(100);
  });

  it('returns exact value when no clamping needed', () => {
    expect(applyDailyOutcome(50, 100, 10, 5)).toBe(45);
  });
});

// ---------------------------------------------------------------------------
// calculatePartialXp
// ---------------------------------------------------------------------------

describe('calculatePartialXp', () => {
  it('returns 300 when 40% HP remains (60% damage dealt), fullXp=500, maxHp=100', () => {
    expect(calculatePartialXp(500, 100, 40)).toBe(300);
  });

  it('returns 0 when boss is at full HP (no damage dealt)', () => {
    expect(calculatePartialXp(200, 100, 100)).toBe(0);
  });

  it('returns full reward when boss HP is 0', () => {
    expect(calculatePartialXp(500, 100, 0)).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// getBossDialoguePhase
// ---------------------------------------------------------------------------

describe('getBossDialoguePhase', () => {
  it('returns intro on first day regardless of HP ratio', () => {
    expect(getBossDialoguePhase(true, 1.0, 'active')).toBe('intro');
  });

  it('returns taunt when boss HP is above 50% and not first day', () => {
    expect(getBossDialoguePhase(false, 0.8, 'active')).toBe('taunt');
  });

  it('returns player_winning when boss HP ratio is below 50%', () => {
    expect(getBossDialoguePhase(false, 0.3, 'active')).toBe('player_winning');
  });

  it('returns defeated when battle status is defeated', () => {
    expect(getBossDialoguePhase(false, 0.0, 'defeated')).toBe('defeated');
  });

  it('returns defeated even if isFirstDay when status is defeated', () => {
    expect(getBossDialoguePhase(true, 1.0, 'defeated')).toBe('defeated');
  });

  it('returns taunt when HP is exactly 50%', () => {
    // 0.5 is NOT below 0.5, so returns taunt
    expect(getBossDialoguePhase(false, 0.5, 'active')).toBe('taunt');
  });
});

// ---------------------------------------------------------------------------
// suggestArchetype
// ---------------------------------------------------------------------------

describe('suggestArchetype', () => {
  it('returns procrastinator as safe fallback when no data provided', () => {
    expect(suggestArchetype({}, [])).toBe('procrastinator');
  });

  it('returns a valid ArchetypeId', () => {
    const validIds = [
      'procrastinator',
      'distractor',
      'doubter',
      'glutton',
      'comparer',
      'perfectionist',
    ];
    const result = suggestArchetype({}, []);
    expect(validIds).toContain(result);
  });
});

// ---------------------------------------------------------------------------
// getMaxDays
// ---------------------------------------------------------------------------

describe('getMaxDays', () => {
  it('returns value between 5 and 7 at level 10', () => {
    const days = getMaxDays(10);
    expect(days).toBeGreaterThanOrEqual(5);
    expect(days).toBeLessThanOrEqual(7);
  });

  it('returns 7 at level 10', () => {
    expect(getMaxDays(10)).toBe(7);
  });

  it('returns 6 at level 20', () => {
    expect(getMaxDays(20)).toBe(6);
  });

  it('returns 5 at level 30', () => {
    expect(getMaxDays(30)).toBe(5);
  });

  it('returns 5 at level 50 (max difficulty)', () => {
    expect(getMaxDays(50)).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// DailyLogEntry type shape test
// ---------------------------------------------------------------------------

describe('DailyLogEntry interface', () => {
  it('can create a valid DailyLogEntry object', () => {
    const entry: DailyLogEntry = {
      day: 1,
      date: '2026-03-23',
      habitsCompleted: 4,
      totalHabits: 5,
      damage: 16,
      healing: 2,
      hpAfter: 82,
    };
    expect(entry.day).toBe(1);
    expect(entry.habitsCompleted).toBe(4);
    expect(entry.hpAfter).toBe(82);
  });
});
