import {
  selectQuestTemplates,
  evaluateQuestProgress,
  isRelevantToPlayer,
} from '../../src/domain/quest-engine';
import type { QuestTemplate } from '../../src/domain/quest-engine';
import { QUEST_TEMPLATES } from '../../src/domain/quest-templates';

// -----------------------------------------------------------------------
// Test data helpers
// -----------------------------------------------------------------------

function makeTemplate(overrides: Partial<QuestTemplate> & { id: string }): QuestTemplate {
  return {
    type: 'daily',
    description: 'Test quest',
    targetType: 'any_completion',
    targetValue: 3,
    minLevel: 1,
    xpReward: 30,
    ...overrides,
  };
}

const SAMPLE_DAILY_TEMPLATES: QuestTemplate[] = [
  makeTemplate({ id: 'daily-1', type: 'daily', targetType: 'any_completion', targetValue: 3, minLevel: 1, xpReward: 30 }),
  makeTemplate({ id: 'daily-2', type: 'daily', targetType: 'all_salah', targetValue: 5, minLevel: 1, xpReward: 50 }),
  makeTemplate({ id: 'daily-3', type: 'daily', targetType: 'any_completion', targetValue: 5, minLevel: 1, xpReward: 35 }),
  makeTemplate({ id: 'daily-4', type: 'daily', targetType: 'any_completion', targetValue: 2, minLevel: 1, xpReward: 25 }),
  makeTemplate({ id: 'daily-5', type: 'daily', targetType: 'any_completion', targetValue: 4, minLevel: 3, xpReward: 30 }),
  makeTemplate({ id: 'daily-6', type: 'daily', targetType: 'habit_type', targetType: 'habit_type', targetValue: 3, targetHabitType: 'quran', minLevel: 1, xpReward: 35 }),
];

const SAMPLE_WEEKLY_TEMPLATES: QuestTemplate[] = [
  makeTemplate({ id: 'weekly-1', type: 'weekly', targetType: 'streak_reach', targetValue: 7, minLevel: 5, xpReward: 150 }),
  makeTemplate({ id: 'weekly-2', type: 'weekly', targetType: 'any_completion', targetValue: 20, minLevel: 5, xpReward: 100 }),
  makeTemplate({ id: 'weekly-3', type: 'weekly', targetType: 'any_completion', targetValue: 25, minLevel: 5, xpReward: 125 }),
];

const SAMPLE_STRETCH_TEMPLATES: QuestTemplate[] = [
  makeTemplate({ id: 'stretch-1', type: 'stretch', targetType: 'total_completions', targetValue: 50, minLevel: 8, xpReward: 500 }),
  makeTemplate({ id: 'stretch-2', type: 'stretch', targetType: 'all_salah', targetValue: 35, minLevel: 8, xpReward: 400 }),
];

const ALL_SAMPLE_TEMPLATES = [
  ...SAMPLE_DAILY_TEMPLATES,
  ...SAMPLE_WEEKLY_TEMPLATES,
  ...SAMPLE_STRETCH_TEMPLATES,
];

// -----------------------------------------------------------------------
// selectQuestTemplates
// -----------------------------------------------------------------------

describe('selectQuestTemplates', () => {
  it('returns exactly 3 templates for daily type (count=3)', () => {
    const result = selectQuestTemplates(
      ALL_SAMPLE_TEMPLATES, 'daily', 3, 5, new Set(['salah', 'quran']), new Set()
    );
    expect(result).toHaveLength(3);
  });

  it('returns exactly 2 templates for weekly type (count=2)', () => {
    const result = selectQuestTemplates(
      ALL_SAMPLE_TEMPLATES, 'weekly', 2, 5, new Set(), new Set()
    );
    expect(result).toHaveLength(2);
  });

  it('returns exactly 1 template for stretch type (count=1)', () => {
    const result = selectQuestTemplates(
      ALL_SAMPLE_TEMPLATES, 'stretch', 1, 10, new Set(), new Set()
    );
    expect(result).toHaveLength(1);
  });

  it('excludes recently-used template IDs', () => {
    const recentlyUsed = new Set(['daily-1', 'daily-2', 'daily-3']);
    const result = selectQuestTemplates(
      ALL_SAMPLE_TEMPLATES, 'daily', 3, 5, new Set(), recentlyUsed
    );
    const resultIds = result.map(t => t.id);
    for (const id of recentlyUsed) {
      expect(resultIds).not.toContain(id);
    }
  });

  it('excludes templates with minLevel above player level', () => {
    // Player is level 1, only templates with minLevel <= 1 should appear
    const result = selectQuestTemplates(
      ALL_SAMPLE_TEMPLATES, 'daily', 3, 1, new Set(['salah', 'quran']), new Set()
    );
    for (const template of result) {
      expect(template.minLevel).toBeLessThanOrEqual(1);
    }
  });

  it('returns only templates of the requested type', () => {
    const result = selectQuestTemplates(ALL_SAMPLE_TEMPLATES, 'weekly', 2, 10, new Set(), new Set());
    for (const template of result) {
      expect(template.type).toBe('weekly');
    }
  });

  it('returns fewer than count when not enough eligible templates', () => {
    // Only 2 stretch templates available, requesting 3
    const result = selectQuestTemplates(
      ALL_SAMPLE_TEMPLATES, 'stretch', 3, 10, new Set(), new Set()
    );
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('returns empty array when no eligible templates exist', () => {
    // Player level 1, weekly templates require level 5
    const result = selectQuestTemplates(
      ALL_SAMPLE_TEMPLATES, 'weekly', 2, 1, new Set(), new Set()
    );
    expect(result).toHaveLength(0);
  });

  it('filters habit_type templates that do not match active habits', () => {
    // Template requires 'quran' habit type, player has no quran habits
    const quranTemplate = makeTemplate({
      id: 'quran-quest',
      type: 'daily',
      targetType: 'habit_type',
      targetValue: 3,
      targetHabitType: 'quran',
      minLevel: 1,
      xpReward: 35,
    });
    const result = selectQuestTemplates(
      [quranTemplate], 'daily', 1, 5, new Set(['salah']), new Set()
    );
    expect(result).toHaveLength(0);
  });

  it('includes habit_type templates when player has matching habit type', () => {
    const quranTemplate = makeTemplate({
      id: 'quran-quest',
      type: 'daily',
      targetType: 'habit_type',
      targetValue: 3,
      targetHabitType: 'quran',
      minLevel: 1,
      xpReward: 35,
    });
    const result = selectQuestTemplates(
      [quranTemplate], 'daily', 1, 5, new Set(['quran']), new Set()
    );
    expect(result).toHaveLength(1);
  });

  it('returns an array (not the same objects every time -- random selection)', () => {
    // Run multiple times and verify we get different results occasionally
    // (probabilistic test -- with 6 dailies and choosing 3, should vary)
    const runs = Array.from({ length: 10 }, () =>
      selectQuestTemplates(ALL_SAMPLE_TEMPLATES, 'daily', 3, 5, new Set(['salah', 'quran']), new Set())
        .map(t => t.id)
        .sort()
        .join(',')
    );
    const uniqueResults = new Set(runs);
    // With 6 eligible templates choose 3, there are C(6,3)=20 combos -- should vary
    expect(uniqueResults.size).toBeGreaterThan(1);
  });
});

// -----------------------------------------------------------------------
// evaluateQuestProgress
// -----------------------------------------------------------------------

describe('evaluateQuestProgress', () => {
  it('increments progress for any_completion type on any habit completion', () => {
    const quest = { targetType: 'any_completion', targetValue: 3, progress: 0 };
    const event = { habitType: 'salah', allSalahComplete: false, allHabitsComplete: false };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(1);
  });

  it('increments progress from existing non-zero progress', () => {
    const quest = { targetType: 'any_completion', targetValue: 3, progress: 1 };
    const event = { habitType: 'salah', allSalahComplete: false, allHabitsComplete: false };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(2);
  });

  it('clamps progress to targetValue (no overflow)', () => {
    const quest = { targetType: 'any_completion', targetValue: 3, progress: 3 };
    const event = { habitType: 'salah', allSalahComplete: false, allHabitsComplete: false };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(3); // clamped to targetValue
  });

  it('clamps progress at targetValue even when near completion', () => {
    const quest = { targetType: 'any_completion', targetValue: 3, progress: 2 };
    const event = { habitType: 'salah', allSalahComplete: false, allHabitsComplete: false };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(3); // completes
  });

  it('increments for all_salah quest only when all 5 salah are complete', () => {
    const quest = { targetType: 'all_salah', targetValue: 5, progress: 0 };
    const event = { habitType: 'salah', allSalahComplete: true, allHabitsComplete: false };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(5); // target met -- all salah complete
  });

  it('does NOT increment for all_salah quest when salah incomplete', () => {
    const quest = { targetType: 'all_salah', targetValue: 5, progress: 3 };
    const event = { habitType: 'salah', allSalahComplete: false, allHabitsComplete: false };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(3); // unchanged -- salah not all complete
  });

  it('returns unchanged progress when event does not match quest type', () => {
    const quest = { targetType: 'muhasabah', targetValue: 3, progress: 1, targetHabitType: null };
    const event = { habitType: 'salah', allSalahComplete: false, allHabitsComplete: false };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(1); // unchanged
  });

  it('increments for habit_type quest when habit type matches', () => {
    const quest = { targetType: 'habit_type', targetValue: 3, progress: 1, targetHabitType: 'quran' };
    const event = { habitType: 'quran', allSalahComplete: false, allHabitsComplete: false };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(2);
  });

  it('does NOT increment for habit_type quest when habit type does not match', () => {
    const quest = { targetType: 'habit_type', targetValue: 3, progress: 1, targetHabitType: 'quran' };
    const event = { habitType: 'dhikr', allSalahComplete: false, allHabitsComplete: false };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(1); // unchanged
  });

  it('increments for daily_complete_all when all habits complete', () => {
    const quest = { targetType: 'daily_complete_all', targetValue: 1, progress: 0 };
    const event = { habitType: 'salah', allSalahComplete: false, allHabitsComplete: true };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(1);
  });

  it('does not increment daily_complete_all when not all habits complete', () => {
    const quest = { targetType: 'daily_complete_all', targetValue: 1, progress: 0 };
    const event = { habitType: 'salah', allSalahComplete: false, allHabitsComplete: false };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(0);
  });

  it('increments for total_completions on any completion', () => {
    const quest = { targetType: 'total_completions', targetValue: 50, progress: 10 };
    const event = { habitType: 'dhikr', allSalahComplete: false, allHabitsComplete: false };
    const result = evaluateQuestProgress(quest, event);
    expect(result).toBe(11);
  });
});

// -----------------------------------------------------------------------
// isRelevantToPlayer
// -----------------------------------------------------------------------

describe('isRelevantToPlayer', () => {
  it('returns true for any_completion templates (always relevant)', () => {
    const template = makeTemplate({ id: 't1', targetType: 'any_completion' });
    expect(isRelevantToPlayer(template, new Set(['salah']))).toBe(true);
  });

  it('returns true for all_salah when player has no specific habit type required', () => {
    const template = makeTemplate({ id: 't1', targetType: 'all_salah' });
    expect(isRelevantToPlayer(template, new Set(['salah']))).toBe(true);
  });

  it('returns true for habit_type template when player has matching habit type', () => {
    const template = makeTemplate({ id: 't1', targetType: 'habit_type', targetHabitType: 'quran' });
    expect(isRelevantToPlayer(template, new Set(['quran', 'dhikr']))).toBe(true);
  });

  it('returns false for habit_type template when player has no matching habit type', () => {
    const template = makeTemplate({ id: 't1', targetType: 'habit_type', targetHabitType: 'quran' });
    expect(isRelevantToPlayer(template, new Set(['salah', 'dhikr']))).toBe(false);
  });

  it('returns true for non-habit-type templates regardless of active habits', () => {
    const template = makeTemplate({ id: 't1', targetType: 'streak_reach' });
    expect(isRelevantToPlayer(template, new Set())).toBe(true);
  });
});

// -----------------------------------------------------------------------
// QUEST_TEMPLATES pool validation
// -----------------------------------------------------------------------

describe('QUEST_TEMPLATES', () => {
  it('has exactly 31 total templates (20 daily + 8 weekly + 3 stretch)', () => {
    expect(QUEST_TEMPLATES).toHaveLength(31);
  });

  it('has exactly 20 daily templates', () => {
    const daily = QUEST_TEMPLATES.filter(t => t.type === 'daily');
    expect(daily).toHaveLength(20);
  });

  it('has exactly 8 weekly templates', () => {
    const weekly = QUEST_TEMPLATES.filter(t => t.type === 'weekly');
    expect(weekly).toHaveLength(8);
  });

  it('has exactly 3 stretch templates', () => {
    const stretch = QUEST_TEMPLATES.filter(t => t.type === 'stretch');
    expect(stretch).toHaveLength(3);
  });

  it('all templates have required fields', () => {
    for (const template of QUEST_TEMPLATES) {
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('type');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('targetType');
      expect(template).toHaveProperty('targetValue');
      expect(template).toHaveProperty('minLevel');
      expect(template).toHaveProperty('xpReward');
      expect(typeof template.id).toBe('string');
      expect(template.id.length).toBeGreaterThan(0);
    }
  });

  it('all template IDs are unique', () => {
    const ids = QUEST_TEMPLATES.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(31);
  });

  it('daily templates have xpReward in 25-50 range', () => {
    const daily = QUEST_TEMPLATES.filter(t => t.type === 'daily');
    for (const t of daily) {
      expect(t.xpReward).toBeGreaterThanOrEqual(25);
      expect(t.xpReward).toBeLessThanOrEqual(50);
    }
  });

  it('weekly templates have xpReward in 100-200 range', () => {
    const weekly = QUEST_TEMPLATES.filter(t => t.type === 'weekly');
    for (const t of weekly) {
      expect(t.xpReward).toBeGreaterThanOrEqual(100);
      expect(t.xpReward).toBeLessThanOrEqual(200);
    }
  });

  it('stretch templates have xpReward in 300-500 range', () => {
    const stretch = QUEST_TEMPLATES.filter(t => t.type === 'stretch');
    for (const t of stretch) {
      expect(t.xpReward).toBeGreaterThanOrEqual(300);
      expect(t.xpReward).toBeLessThanOrEqual(500);
    }
  });

  it('daily templates have minLevel of 1-5', () => {
    const daily = QUEST_TEMPLATES.filter(t => t.type === 'daily');
    for (const t of daily) {
      expect(t.minLevel).toBeGreaterThanOrEqual(1);
      expect(t.minLevel).toBeLessThanOrEqual(5);
    }
  });

  it('type values are only daily, weekly, or stretch', () => {
    const validTypes = new Set(['daily', 'weekly', 'stretch']);
    for (const t of QUEST_TEMPLATES) {
      expect(validTypes.has(t.type)).toBe(true);
    }
  });

  it('targetType values are valid enum members', () => {
    const validTargetTypes = new Set([
      'any_completion',
      'habit_type',
      'all_salah',
      'streak_reach',
      'daily_complete_all',
      'muhasabah',
      'total_completions',
    ]);
    for (const t of QUEST_TEMPLATES) {
      expect(validTargetTypes.has(t.targetType)).toBe(true);
    }
  });
});
