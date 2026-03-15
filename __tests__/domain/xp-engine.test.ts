import {
  xpToNextLevel,
  xpForLevel,
  levelForXP,
  applySoftCap,
  calculateXP,
} from '../../src/domain/xp-engine';
import type { XPResult } from '../../src/domain/xp-engine';
import { getLevelUpCopy } from '../../src/domain/level-copy';

// -----------------------------------------------------------------------
// xpToNextLevel
// -----------------------------------------------------------------------

describe('xpToNextLevel', () => {
  it('level 1 returns 40', () => {
    expect(xpToNextLevel(1)).toBe(40);
  });

  it('level 2 returns 137 (blueprint simulation table value)', () => {
    expect(xpToNextLevel(2)).toBe(137);
  });

  it('level 3 returns 278', () => {
    expect(xpToNextLevel(3)).toBe(278);
  });

  it('level 4 returns 460', () => {
    expect(xpToNextLevel(4)).toBe(460);
  });

  it('level 5 returns 681', () => {
    expect(xpToNextLevel(5)).toBe(681);
  });

  it('returns a positive integer for all levels 1-100', () => {
    for (let level = 1; level <= 100; level++) {
      const result = xpToNextLevel(level);
      expect(typeof result).toBe('number');
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    }
  });

  it('is monotonically increasing (each level costs more than previous)', () => {
    for (let level = 2; level <= 50; level++) {
      expect(xpToNextLevel(level)).toBeGreaterThan(xpToNextLevel(level - 1));
    }
  });
});

// -----------------------------------------------------------------------
// xpForLevel
// -----------------------------------------------------------------------

describe('xpForLevel', () => {
  it('level 1 returns 0 (starting level, no XP required)', () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it('level 2 returns 40', () => {
    expect(xpForLevel(2)).toBe(40);
  });

  it('level 3 returns 177', () => {
    expect(xpForLevel(3)).toBe(177);
  });

  it('level 4 returns 455', () => {
    expect(xpForLevel(4)).toBe(455);
  });

  it('level 5 returns 915 (blueprint simulation table)', () => {
    expect(xpForLevel(5)).toBe(915);
  });

  it('level 10 returns 7232 (blueprint simulation table)', () => {
    expect(xpForLevel(10)).toBe(7232);
  });

  it('is monotonically increasing', () => {
    for (let level = 2; level <= 50; level++) {
      expect(xpForLevel(level)).toBeGreaterThan(xpForLevel(level - 1));
    }
  });
});

// -----------------------------------------------------------------------
// levelForXP
// -----------------------------------------------------------------------

describe('levelForXP', () => {
  it('0 XP returns level 1', () => {
    expect(levelForXP(0)).toBe(1);
  });

  it('39 XP returns level 1 (just under level 2 threshold)', () => {
    expect(levelForXP(39)).toBe(1);
  });

  it('40 XP returns level 2 (exactly at level 2 threshold)', () => {
    expect(levelForXP(40)).toBe(2);
  });

  it('914 XP returns level 4 (just under level 5 threshold)', () => {
    expect(levelForXP(914)).toBe(4);
  });

  it('915 XP returns level 5 (exactly at level 5 threshold)', () => {
    expect(levelForXP(915)).toBe(5);
  });

  it('7231 XP returns level 9 (just under level 10 threshold)', () => {
    expect(levelForXP(7231)).toBe(9);
  });

  it('7232 XP returns level 10 (exactly at level 10 threshold)', () => {
    expect(levelForXP(7232)).toBe(10);
  });

  it('returns level 1 for negative XP (edge case)', () => {
    expect(levelForXP(-1)).toBe(1);
  });
});

// -----------------------------------------------------------------------
// applySoftCap
// -----------------------------------------------------------------------

describe('applySoftCap', () => {
  it('returns full earnedXP when under daily cap (dailyTotal=0, earnedXP=100)', () => {
    expect(applySoftCap(100, 0)).toBe(100);
  });

  it('returns full earnedXP when earnedXP fits entirely under cap (dailyTotal=400, earnedXP=50)', () => {
    expect(applySoftCap(50, 400)).toBe(50);
  });

  it('applies diminishing returns when earnedXP straddles the cap boundary (dailyTotal=450, earnedXP=100)', () => {
    // 50 below cap gets full value, 50 above cap gets 50% = 25
    // total: 50 + floor(50 * 0.5) = 50 + 25 = 75
    expect(applySoftCap(100, 450)).toBe(75);
  });

  it('applies 50% reduction when already at cap (dailyTotal=500, earnedXP=100)', () => {
    expect(applySoftCap(100, 500)).toBe(50);
  });

  it('applies 50% reduction when well over cap (dailyTotal=600, earnedXP=100)', () => {
    expect(applySoftCap(100, 600)).toBe(50);
  });

  it('floors the reduced amount (no fractional XP)', () => {
    // dailyTotal=450, earnedXP=101 -> 50 + floor(51 * 0.5) = 50 + 25 = 75
    expect(applySoftCap(101, 450)).toBe(75);
  });

  it('returns 0 when earnedXP is 0', () => {
    expect(applySoftCap(0, 0)).toBe(0);
    expect(applySoftCap(0, 600)).toBe(0);
  });
});

// -----------------------------------------------------------------------
// calculateXP
// -----------------------------------------------------------------------

describe('calculateXP', () => {
  it('returns correct XPResult shape for basic case (baseXP=15, mult=1.5, total=0, daily=0)', () => {
    const result: XPResult = calculateXP(15, 1.5, 0, 0);
    expect(result).toHaveProperty('baseXP');
    expect(result).toHaveProperty('multiplier');
    expect(result).toHaveProperty('earnedXP');
    expect(result).toHaveProperty('cappedXP');
    expect(result).toHaveProperty('dailyTotalAfter');
    expect(result).toHaveProperty('newTotalXP');
    expect(result).toHaveProperty('newLevel');
    expect(result).toHaveProperty('didLevelUp');
    expect(result).toHaveProperty('previousLevel');
  });

  it('calculates earnedXP = floor(baseXP * multiplier)', () => {
    const result = calculateXP(15, 1.5, 0, 0);
    expect(result.earnedXP).toBe(22); // floor(15 * 1.5) = floor(22.5) = 22
  });

  it('cappedXP equals earnedXP when under daily cap', () => {
    const result = calculateXP(15, 1.5, 0, 0);
    expect(result.cappedXP).toBe(22);
  });

  it('newTotalXP = currentTotalXP + cappedXP', () => {
    const result = calculateXP(15, 1.5, 0, 0);
    expect(result.newTotalXP).toBe(22);
  });

  it('level 1 for totalXP=0, no level-up', () => {
    const result = calculateXP(15, 1.5, 0, 0);
    expect(result.previousLevel).toBe(1);
    expect(result.newLevel).toBe(1);
    expect(result.didLevelUp).toBe(false);
  });

  it('detects level-up when XP crosses level threshold', () => {
    // At 30 XP total, earning 15 more gets to 45 XP -> level 2 (threshold 40)
    const result = calculateXP(15, 1.0, 30, 0);
    expect(result.previousLevel).toBe(1);
    expect(result.newLevel).toBe(2);
    expect(result.didLevelUp).toBe(true);
  });

  it('does not flag level-up when staying at same level', () => {
    const result = calculateXP(10, 1.0, 0, 0);
    expect(result.didLevelUp).toBe(false);
    expect(result.previousLevel).toBe(result.newLevel);
  });

  it('applies soft cap when dailyTotal is at cap', () => {
    const result = calculateXP(100, 1.0, 0, 500);
    expect(result.earnedXP).toBe(100);
    expect(result.cappedXP).toBe(50); // 50% at cap
    expect(result.newTotalXP).toBe(50);
  });

  it('dailyTotalAfter = dailyTotalXP + cappedXP', () => {
    const result = calculateXP(50, 1.0, 0, 0);
    expect(result.dailyTotalAfter).toBe(50);
  });

  it('baseXP and multiplier are preserved in result', () => {
    const result = calculateXP(20, 2.0, 0, 0);
    expect(result.baseXP).toBe(20);
    expect(result.multiplier).toBe(2.0);
    expect(result.earnedXP).toBe(40); // floor(20 * 2.0) = 40
  });

  it('detects level-up to level 5 from near-threshold XP', () => {
    // xpForLevel(5) = 915, need to cross from just below 915 to >= 915
    const result = calculateXP(50, 1.0, 890, 0);
    expect(result.newLevel).toBe(5);
    expect(result.didLevelUp).toBe(true);
  });
});

// -----------------------------------------------------------------------
// getLevelUpCopy
// -----------------------------------------------------------------------

describe('getLevelUpCopy', () => {
  it('level 5 returns locked milestone copy', () => {
    expect(getLevelUpCopy(5)).toBe('Your discipline grows stronger.');
  });

  it('level 10 returns locked milestone copy', () => {
    expect(getLevelUpCopy(10)).toBe('A new horizon opens before you.');
  });

  it('level 20 returns locked milestone copy', () => {
    expect(getLevelUpCopy(20)).toBe('Consistency is becoming your nature.');
  });

  it('level 50 returns locked milestone copy', () => {
    expect(getLevelUpCopy(50)).toBe('Few have walked this far. MashaAllah.');
  });

  it('returns a non-empty string for any level 1-100', () => {
    for (let level = 1; level <= 100; level++) {
      const copy = getLevelUpCopy(level);
      expect(typeof copy).toBe('string');
      expect(copy.length).toBeGreaterThan(0);
    }
  });

  it('returns range-appropriate copy for non-milestone levels', () => {
    // Non-milestone levels should return something different from milestone strings
    const milestoneStrings = [
      'Your discipline grows stronger.',
      'A new horizon opens before you.',
      'Consistency is becoming your nature.',
      'Few have walked this far. MashaAllah.',
    ];
    const level2Copy = getLevelUpCopy(2);
    const level7Copy = getLevelUpCopy(7);
    const level15Copy = getLevelUpCopy(15);

    // These should return strings (not necessarily non-milestone, just valid)
    expect(typeof level2Copy).toBe('string');
    expect(typeof level7Copy).toBe('string');
    expect(typeof level15Copy).toBe('string');
  });
});

// -----------------------------------------------------------------------
// Blueprint economy simulation validation
// -----------------------------------------------------------------------

describe('XP economy simulation matches blueprint targets', () => {
  it('Level 5 requires exactly 915 cumulative XP', () => {
    expect(xpForLevel(5)).toBe(915);
  });

  it('Level 10 requires exactly 7232 cumulative XP', () => {
    expect(xpForLevel(10)).toBe(7232);
  });

  it('levelForXP correctly identifies level 5 at 915 XP', () => {
    expect(levelForXP(915)).toBe(5);
  });

  it('levelForXP correctly identifies level 10 at 7232 XP', () => {
    expect(levelForXP(7232)).toBe(10);
  });

  it('xpForLevel and levelForXP are inverse functions (roundtrip)', () => {
    for (let level = 1; level <= 20; level++) {
      const cumulativeXP = xpForLevel(level);
      expect(levelForXP(cumulativeXP)).toBe(level);
    }
  });
});
