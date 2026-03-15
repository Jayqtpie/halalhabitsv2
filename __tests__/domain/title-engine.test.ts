import { checkTitleUnlocks } from '../../src/domain/title-engine';
import type { TitleCondition, PlayerStats } from '../../src/domain/title-engine';
import { TITLE_SEED_DATA } from '../../src/domain/title-seed-data';

// Helper to build a minimal PlayerStats object with overrides
function makeStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return {
    currentLevel: 1,
    habitStreaks: {},
    habitTypes: {},
    totalCompletions: 0,
    questCompletions: 0,
    mercyRecoveries: 0,
    muhasabahStreak: 0,
    activeHabitCount: 0,
    simultaneousStreaks14: 0,
    simultaneousStreaks90: 0,
    ...overrides,
  };
}

// Helper to build a TitleCondition
function makeCondition(overrides: Partial<TitleCondition> & { id: string }): TitleCondition {
  return {
    unlockType: 'total_completions',
    unlockValue: 1,
    unlockHabitType: null,
    ...overrides,
  };
}

// -----------------------------------------------------------------------
// checkTitleUnlocks
// -----------------------------------------------------------------------

describe('checkTitleUnlocks', () => {
  it('returns empty array when conditions list is empty', () => {
    const result = checkTitleUnlocks([], new Set(), makeStats());
    expect(result).toEqual([]);
  });

  it('returns empty array when all titles are already unlocked', () => {
    const condition = makeCondition({ id: 'the-willing', unlockType: 'total_completions', unlockValue: 1 });
    const stats = makeStats({ totalCompletions: 5 });
    const alreadyUnlocked = new Set(['the-willing']);
    const result = checkTitleUnlocks([condition], alreadyUnlocked, stats);
    expect(result).toEqual([]);
  });

  it('returns title ID when total_completions condition is met', () => {
    const condition = makeCondition({ id: 'the-willing', unlockType: 'total_completions', unlockValue: 1 });
    const stats = makeStats({ totalCompletions: 1 });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).toContain('the-willing');
  });

  it('does not return title ID when total_completions condition is not met', () => {
    const condition = makeCondition({ id: 'the-willing', unlockType: 'total_completions', unlockValue: 5 });
    const stats = makeStats({ totalCompletions: 3 });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).not.toContain('the-willing');
  });

  it('returns title ID when level_reach condition is met', () => {
    const condition = makeCondition({ id: 'the-builder', unlockType: 'level_reach', unlockValue: 5 });
    const stats = makeStats({ currentLevel: 5 });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).toContain('the-builder');
  });

  it('does not return title when level_reach not met', () => {
    const condition = makeCondition({ id: 'the-builder', unlockType: 'level_reach', unlockValue: 5 });
    const stats = makeStats({ currentLevel: 4 });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).not.toContain('the-builder');
  });

  it('returns title ID for habit_type_streak condition (e.g., 3 consecutive fajr)', () => {
    const condition = makeCondition({
      id: 'the-early-riser',
      unlockType: 'habit_type_streak',
      unlockValue: 3,
      unlockHabitType: 'salah_fajr',
    });
    const stats = makeStats({
      habitStreaks: { 'habit-fajr': 3 },
      habitTypes: { 'habit-fajr': 'salah_fajr' },
    });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).toContain('the-early-riser');
  });

  it('does not return title when habit_type_streak is below threshold', () => {
    const condition = makeCondition({
      id: 'the-early-riser',
      unlockType: 'habit_type_streak',
      unlockValue: 3,
      unlockHabitType: 'salah_fajr',
    });
    const stats = makeStats({
      habitStreaks: { 'habit-fajr': 2 },
      habitTypes: { 'habit-fajr': 'salah_fajr' },
    });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).not.toContain('the-early-riser');
  });

  it('skips already-unlocked titles', () => {
    const condition1 = makeCondition({ id: 'the-willing', unlockType: 'total_completions', unlockValue: 1 });
    const condition2 = makeCondition({ id: 'the-builder', unlockType: 'level_reach', unlockValue: 5 });
    const stats = makeStats({ totalCompletions: 10, currentLevel: 10 });
    const alreadyUnlocked = new Set(['the-willing']);
    const result = checkTitleUnlocks([condition1, condition2], alreadyUnlocked, stats);
    expect(result).not.toContain('the-willing');
    expect(result).toContain('the-builder');
  });

  it('returns multiple titles when multiple conditions are met simultaneously', () => {
    const cond1 = makeCondition({ id: 'the-willing', unlockType: 'total_completions', unlockValue: 1 });
    const cond2 = makeCondition({ id: 'the-builder', unlockType: 'level_reach', unlockValue: 5 });
    const stats = makeStats({ totalCompletions: 5, currentLevel: 5 });
    const result = checkTitleUnlocks([cond1, cond2], new Set(), stats);
    expect(result).toContain('the-willing');
    expect(result).toContain('the-builder');
  });

  it('handles simultaneous_streaks condition (14+ days)', () => {
    const condition = makeCondition({
      id: 'the-all-rounder',
      unlockType: 'simultaneous_streaks',
      unlockValue: 5,
    });
    const stats = makeStats({ simultaneousStreaks14: 5 });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).toContain('the-all-rounder');
  });

  it('does not unlock simultaneous_streaks when count is below threshold', () => {
    const condition = makeCondition({
      id: 'the-all-rounder',
      unlockType: 'simultaneous_streaks',
      unlockValue: 5,
    });
    const stats = makeStats({ simultaneousStreaks14: 4 });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).not.toContain('the-all-rounder');
  });

  it('handles quest_completions condition', () => {
    const condition = makeCondition({ id: 'the-seeker', unlockType: 'quest_completions', unlockValue: 5 });
    const stats = makeStats({ questCompletions: 5 });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).toContain('the-seeker');
  });

  it('handles mercy_recoveries condition', () => {
    const condition = makeCondition({ id: 'the-resilient', unlockType: 'mercy_recoveries', unlockValue: 3 });
    const stats = makeStats({ mercyRecoveries: 3 });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).toContain('the-resilient');
  });

  it('handles muhasabah_streak condition', () => {
    const condition = makeCondition({ id: 'the-reflector', unlockType: 'muhasabah_streak', unlockValue: 3 });
    const stats = makeStats({ muhasabahStreak: 3 });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).toContain('the-reflector');
  });

  it('handles habit_count condition', () => {
    const condition = makeCondition({ id: 'the-forged', unlockType: 'habit_count', unlockValue: 3 });
    const stats = makeStats({ activeHabitCount: 3 });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).toContain('the-forged');
  });

  it('handles onboarding condition (always unlocks when unlockValue >= 1)', () => {
    const condition = makeCondition({ id: 'the-beginner', unlockType: 'onboarding', unlockValue: 1 });
    // onboarding = the player has reached this state by being in the app
    const stats = makeStats({ totalCompletions: 0, currentLevel: 1 });
    const result = checkTitleUnlocks([condition], new Set(), stats);
    expect(result).toContain('the-beginner');
  });
});

// -----------------------------------------------------------------------
// TITLE_SEED_DATA validation
// -----------------------------------------------------------------------

describe('TITLE_SEED_DATA', () => {
  it('has exactly 26 entries', () => {
    expect(TITLE_SEED_DATA).toHaveLength(26);
  });

  it('has exactly 10 common titles', () => {
    const common = TITLE_SEED_DATA.filter(t => t.rarity === 'common');
    expect(common).toHaveLength(10);
  });

  it('has exactly 10 rare titles', () => {
    const rare = TITLE_SEED_DATA.filter(t => t.rarity === 'rare');
    expect(rare).toHaveLength(10);
  });

  it('has exactly 6 legendary titles', () => {
    const legendary = TITLE_SEED_DATA.filter(t => t.rarity === 'legendary');
    expect(legendary).toHaveLength(6);
  });

  it('all entries have required fields', () => {
    for (const title of TITLE_SEED_DATA) {
      expect(title).toHaveProperty('id');
      expect(title).toHaveProperty('name');
      expect(title).toHaveProperty('rarity');
      expect(title).toHaveProperty('unlockType');
      expect(title).toHaveProperty('unlockValue');
      expect(title).toHaveProperty('flavorText');
      expect(title).toHaveProperty('sortOrder');
      expect(typeof title.id).toBe('string');
      expect(title.id.length).toBeGreaterThan(0);
    }
  });

  it('all IDs are unique', () => {
    const ids = TITLE_SEED_DATA.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(26);
  });

  it('sortOrder is 1-26 with no duplicates', () => {
    const sortOrders = TITLE_SEED_DATA.map(t => t.sortOrder).sort((a, b) => a - b);
    for (let i = 0; i < 26; i++) {
      expect(sortOrders[i]).toBe(i + 1);
    }
  });

  it('common titles have sortOrder 1-10', () => {
    const common = TITLE_SEED_DATA.filter(t => t.rarity === 'common');
    const orders = common.map(t => t.sortOrder);
    for (const order of orders) {
      expect(order).toBeGreaterThanOrEqual(1);
      expect(order).toBeLessThanOrEqual(10);
    }
  });

  it('rare titles have sortOrder 11-20', () => {
    const rare = TITLE_SEED_DATA.filter(t => t.rarity === 'rare');
    const orders = rare.map(t => t.sortOrder);
    for (const order of orders) {
      expect(order).toBeGreaterThanOrEqual(11);
      expect(order).toBeLessThanOrEqual(20);
    }
  });

  it('legendary titles have sortOrder 21-26', () => {
    const legendary = TITLE_SEED_DATA.filter(t => t.rarity === 'legendary');
    const orders = legendary.map(t => t.sortOrder);
    for (const order of orders) {
      expect(order).toBeGreaterThanOrEqual(21);
      expect(order).toBeLessThanOrEqual(26);
    }
  });

  it('rarity values are only common, rare, or legendary', () => {
    const validRarities = new Set(['common', 'rare', 'legendary']);
    for (const title of TITLE_SEED_DATA) {
      expect(validRarities.has(title.rarity)).toBe(true);
    }
  });

  it('unlockType values are valid enum members', () => {
    const validTypes = new Set([
      'onboarding',
      'total_completions',
      'habit_type_streak',
      'habit_streak',
      'level_reach',
      'quest_completions',
      'mercy_recoveries',
      'simultaneous_streaks',
      'muhasabah_streak',
      'habit_count',
    ]);
    for (const title of TITLE_SEED_DATA) {
      expect(validTypes.has(title.unlockType)).toBe(true);
    }
  });

  it('seed data conditions can be used with checkTitleUnlocks', () => {
    // Test that seed data has the correct shape for checkTitleUnlocks
    const conditions: TitleCondition[] = TITLE_SEED_DATA.map(t => ({
      id: t.id,
      unlockType: t.unlockType as TitleCondition['unlockType'],
      unlockValue: t.unlockValue,
      unlockHabitType: t.unlockHabitType ?? null,
    }));

    // A player at level 100 with max stats should unlock all titles
    const maxStats: PlayerStats = {
      currentLevel: 100,
      habitStreaks: {
        'fajr-habit': 100,
        'quran-habit': 100,
        'dhikr-habit': 100,
        'tahajjud-habit': 100,
        'fasting-habit': 100,
      },
      habitTypes: {
        'fajr-habit': 'salah_fajr',
        'quran-habit': 'quran',
        'dhikr-habit': 'dhikr',
        'tahajjud-habit': 'tahajjud',
        'fasting-habit': 'fasting',
      },
      totalCompletions: 1000,
      questCompletions: 200,
      mercyRecoveries: 10,
      muhasabahStreak: 100,
      activeHabitCount: 10,
      simultaneousStreaks14: 10,
      simultaneousStreaks90: 10,
    };

    const result = checkTitleUnlocks(conditions, new Set(), maxStats);
    // At least some titles should unlock
    expect(result.length).toBeGreaterThan(0);
  });
});
