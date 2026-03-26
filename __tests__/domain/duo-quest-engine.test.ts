/**
 * duo-quest-engine tests.
 * Verifies all pure domain functions for Duo Quest System logic.
 * No React, no DB, no side effects.
 *
 * Key behaviors:
 * - Max 3 active duo quests per buddy pair
 * - Aggregate progress never reveals individual contributions
 * - Inactivity thresholds: 48h warning, 72h exit eligibility
 * - Partial XP is proportional with no bonus
 * - Status state machine (active/paused/completed/exited)
 * - DUO_QUEST_TEMPLATES has 8+ templates within XP range 50-150
 */

import {
  canCreateDuoQuest,
  createDuoQuest,
  recordProgress,
  getAggregateProgress,
  checkInactivity,
  calculatePartialXP,
  getDuoQuestStatusTransition,
  isQuestComplete,
  MAX_ACTIVE_DUO_QUESTS,
  INACTIVITY_WARNING_MS,
  INACTIVITY_EXIT_MS,
} from '../../src/domain/duo-quest-engine';

import { DUO_QUEST_TEMPLATES } from '../../src/domain/duo-quest-templates';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
describe('Constants', () => {
  it('MAX_ACTIVE_DUO_QUESTS equals 3', () => {
    expect(MAX_ACTIVE_DUO_QUESTS).toBe(3);
  });

  it('INACTIVITY_WARNING_MS equals 48h in milliseconds', () => {
    expect(INACTIVITY_WARNING_MS).toBe(48 * 60 * 60 * 1000);
  });

  it('INACTIVITY_EXIT_MS equals 72h in milliseconds', () => {
    expect(INACTIVITY_EXIT_MS).toBe(72 * 60 * 60 * 1000);
  });
});

// ---------------------------------------------------------------------------
// canCreateDuoQuest
// ---------------------------------------------------------------------------
describe('canCreateDuoQuest', () => {
  it('returns true when 0 active quests exist', () => {
    expect(canCreateDuoQuest(0)).toBe(true);
  });

  it('returns true when 2 active quests exist (under max)', () => {
    expect(canCreateDuoQuest(2)).toBe(true);
  });

  it('returns false when 3 active quests exist (at max)', () => {
    expect(canCreateDuoQuest(3)).toBe(false);
  });

  it('returns false when 4 active quests exist (over max)', () => {
    expect(canCreateDuoQuest(4)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createDuoQuest
// ---------------------------------------------------------------------------
describe('createDuoQuest', () => {
  const validParams = {
    buddyPairId: 'pair-123',
    createdByUserId: 'user-456',
    title: 'Read Together',
    description: 'Read daily for 7 days',
    xpRewardEach: 100,
    xpRewardBonus: 50,
    targetType: 'completion_count' as const,
    targetValue: 5,
    durationDays: 7,
  };

  it("returns a quest with status='active'", () => {
    const quest = createDuoQuest(validParams);
    expect(quest.status).toBe('active');
  });

  it('returns a quest with the correct buddyPairId', () => {
    const quest = createDuoQuest(validParams);
    expect(quest.buddyPairId).toBe('pair-123');
  });

  it('returns a quest with the correct createdByUserId', () => {
    const quest = createDuoQuest(validParams);
    expect(quest.createdByUserId).toBe('user-456');
  });

  it('returns a quest with userAProgress=0', () => {
    const quest = createDuoQuest(validParams);
    expect(quest.userAProgress).toBe(0);
  });

  it('returns a quest with userBProgress=0', () => {
    const quest = createDuoQuest(validParams);
    expect(quest.userBProgress).toBe(0);
  });

  it('returns a quest with userACompleted=false', () => {
    const quest = createDuoQuest(validParams);
    expect(quest.userACompleted).toBe(false);
  });

  it('returns a quest with userBCompleted=false', () => {
    const quest = createDuoQuest(validParams);
    expect(quest.userBCompleted).toBe(false);
  });

  it('returns a quest with expiresAt approximately durationDays from now', () => {
    const before = Date.now();
    const quest = createDuoQuest(validParams);
    const after = Date.now();

    const expiresAt = new Date(quest.expiresAt).getTime();
    const expectedDelta = 7 * 24 * 60 * 60 * 1000;

    expect(expiresAt - before).toBeGreaterThanOrEqual(expectedDelta - 1000);
    expect(expiresAt - after).toBeLessThanOrEqual(expectedDelta + 1000);
  });

  it('returns a quest with correct title and description', () => {
    const quest = createDuoQuest(validParams);
    expect(quest.title).toBe('Read Together');
    expect(quest.description).toBe('Read daily for 7 days');
  });

  it('returns a quest with correct xpRewardEach and xpRewardBonus', () => {
    const quest = createDuoQuest(validParams);
    expect(quest.xpRewardEach).toBe(100);
    expect(quest.xpRewardBonus).toBe(50);
  });

  it('includes createdAt and updatedAt timestamps', () => {
    const quest = createDuoQuest(validParams);
    expect(typeof quest.createdAt).toBe('string');
    expect(typeof quest.updatedAt).toBe('string');
  });

  it('works without optional xpRewardBonus (defaults to 0)', () => {
    const paramsNoBonus = { ...validParams, xpRewardBonus: undefined };
    const quest = createDuoQuest(paramsNoBonus);
    expect(quest.xpRewardBonus).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// recordProgress
// ---------------------------------------------------------------------------
describe('recordProgress', () => {
  const baseQuest = {
    userAProgress: 0,
    userBProgress: 0,
    userACompleted: false,
    userBCompleted: false,
    targetValue: 5,
  };

  it("increments userAProgress by 1 when side='a'", () => {
    const result = recordProgress(baseQuest, 'a', 1);
    expect(result.userAProgress).toBe(1);
    expect(result.userBProgress).toBe(0);
  });

  it("increments userBProgress by 1 when side='b'", () => {
    const result = recordProgress(baseQuest, 'b', 1);
    expect(result.userBProgress).toBe(1);
    expect(result.userAProgress).toBe(0);
  });

  it('clamps userAProgress to targetValue (no exceed)', () => {
    const almostDone = { ...baseQuest, userAProgress: 4 };
    const result = recordProgress(almostDone, 'a', 5); // would overshoot
    expect(result.userAProgress).toBe(5);
  });

  it('sets userACompleted=true when userAProgress reaches targetValue', () => {
    const almostDone = { ...baseQuest, userAProgress: 4 };
    const result = recordProgress(almostDone, 'a', 1);
    expect(result.userACompleted).toBe(true);
  });

  it('sets userBCompleted=true when userBProgress reaches targetValue', () => {
    const almostDone = { ...baseQuest, userBProgress: 4 };
    const result = recordProgress(almostDone, 'b', 1);
    expect(result.userBCompleted).toBe(true);
  });

  it('does not set userACompleted when progress is below targetValue', () => {
    const result = recordProgress(baseQuest, 'a', 3);
    expect(result.userACompleted).toBe(false);
  });

  it('defaults increment to 1 if not provided', () => {
    const result = recordProgress(baseQuest, 'a');
    expect(result.userAProgress).toBe(1);
  });

  it('does not mutate the original quest object', () => {
    const original = { ...baseQuest };
    recordProgress(baseQuest, 'a', 1);
    expect(baseQuest.userAProgress).toBe(original.userAProgress);
  });
});

// ---------------------------------------------------------------------------
// getAggregateProgress
// ---------------------------------------------------------------------------
describe('getAggregateProgress', () => {
  it('returns correct totalProgress, totalTarget, and percentage', () => {
    const result = getAggregateProgress({ userAProgress: 3, userBProgress: 2, targetValue: 5 });
    expect(result.totalProgress).toBe(5);
    expect(result.totalTarget).toBe(10);
    expect(result.percentage).toBe(50);
  });

  it('returns 0% when both players have no progress', () => {
    const result = getAggregateProgress({ userAProgress: 0, userBProgress: 0, targetValue: 5 });
    expect(result.percentage).toBe(0);
    expect(result.totalProgress).toBe(0);
  });

  it('returns 100% when both players have completed', () => {
    const result = getAggregateProgress({ userAProgress: 5, userBProgress: 5, targetValue: 5 });
    expect(result.percentage).toBe(100);
  });

  it('never exposes individual progress per side (no userA/userB keys in return)', () => {
    const result = getAggregateProgress({ userAProgress: 3, userBProgress: 2, targetValue: 5 });
    expect(result).not.toHaveProperty('userAProgress');
    expect(result).not.toHaveProperty('userBProgress');
  });

  it('returns correct aggregate when one player has no progress', () => {
    const result = getAggregateProgress({ userAProgress: 3, userBProgress: 0, targetValue: 5 });
    expect(result.totalProgress).toBe(3);
    expect(result.totalTarget).toBe(10);
    expect(result.percentage).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// checkInactivity
// ---------------------------------------------------------------------------
describe('checkInactivity', () => {
  it("returns 'ok' when partner last active 24h ago (within 48h)", () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(checkInactivity(twentyFourHoursAgo)).toBe('ok');
  });

  it("returns 'ok' when partner last active just now", () => {
    const now = new Date().toISOString();
    expect(checkInactivity(now)).toBe('ok');
  });

  it("returns 'warning' when partner inactive 48-72h (exactly 50h)", () => {
    const fiftyHoursAgo = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString();
    expect(checkInactivity(fiftyHoursAgo)).toBe('warning');
  });

  it("returns 'warning' when partner inactive exactly 48h+1ms", () => {
    const fortyEightHoursOneMs = new Date(Date.now() - (48 * 60 * 60 * 1000 + 1)).toISOString();
    expect(checkInactivity(fortyEightHoursOneMs)).toBe('warning');
  });

  it("returns 'exit_eligible' when partner inactive 72h+", () => {
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000 - 1000).toISOString();
    expect(checkInactivity(seventyTwoHoursAgo)).toBe('exit_eligible');
  });

  it("returns 'exit_eligible' when partner inactive 5 days ago", () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(checkInactivity(fiveDaysAgo)).toBe('exit_eligible');
  });

  it('accepts an optional now parameter for deterministic testing', () => {
    const referenceNow = new Date('2026-03-26T12:00:00Z');
    const fiftyHoursBeforeReference = new Date(
      referenceNow.getTime() - 50 * 60 * 60 * 1000
    ).toISOString();
    expect(checkInactivity(fiftyHoursBeforeReference, referenceNow)).toBe('warning');
  });
});

// ---------------------------------------------------------------------------
// calculatePartialXP
// ---------------------------------------------------------------------------
describe('calculatePartialXP', () => {
  it('returns proportional individualXP (60% of 100 = 60 for 3/5)', () => {
    const result = calculatePartialXP({ xpRewardEach: 100, userProgress: 3, targetValue: 5 });
    expect(result.individualXP).toBe(60);
  });

  it('returns 0 bonusXP on partial exit (no bonus per D-10)', () => {
    const result = calculatePartialXP({ xpRewardEach: 100, userProgress: 3, targetValue: 5 });
    expect(result.bonusXP).toBe(0);
  });

  it('returns 0 individualXP when userProgress is 0', () => {
    const result = calculatePartialXP({ xpRewardEach: 100, userProgress: 0, targetValue: 5 });
    expect(result.individualXP).toBe(0);
  });

  it('returns full individualXP when userProgress equals targetValue', () => {
    const result = calculatePartialXP({ xpRewardEach: 100, userProgress: 5, targetValue: 5 });
    expect(result.individualXP).toBe(100);
  });

  it('floors the XP result (no decimals)', () => {
    // 1/3 of 100 = 33.33... -> should floor to 33
    const result = calculatePartialXP({ xpRewardEach: 100, userProgress: 1, targetValue: 3 });
    expect(result.individualXP).toBe(33);
  });

  it('works with different xpRewardEach values', () => {
    const result = calculatePartialXP({ xpRewardEach: 75, userProgress: 4, targetValue: 7 });
    // 4/7 * 75 = 42.857... -> floor = 42
    expect(result.individualXP).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// getDuoQuestStatusTransition
// ---------------------------------------------------------------------------
describe('getDuoQuestStatusTransition', () => {
  it("returns 'completed' for active + complete", () => {
    expect(getDuoQuestStatusTransition('active', 'complete')).toBe('completed');
  });

  it("returns 'paused' for active + pause", () => {
    expect(getDuoQuestStatusTransition('active', 'pause')).toBe('paused');
  });

  it("returns 'active' for paused + resume", () => {
    expect(getDuoQuestStatusTransition('paused', 'resume')).toBe('active');
  });

  it("returns 'exited' for active + exit", () => {
    expect(getDuoQuestStatusTransition('active', 'exit')).toBe('exited');
  });

  it("returns null for completed + complete (invalid transition)", () => {
    expect(getDuoQuestStatusTransition('completed', 'complete')).toBeNull();
  });

  it("returns null for exited + resume (invalid transition)", () => {
    expect(getDuoQuestStatusTransition('exited', 'resume')).toBeNull();
  });

  it("returns null for completed + pause (invalid transition)", () => {
    expect(getDuoQuestStatusTransition('completed', 'pause')).toBeNull();
  });

  it("returns 'exited' for paused + exit", () => {
    expect(getDuoQuestStatusTransition('paused', 'exit')).toBe('exited');
  });
});

// ---------------------------------------------------------------------------
// isQuestComplete
// ---------------------------------------------------------------------------
describe('isQuestComplete', () => {
  it('returns true when both players have completed', () => {
    expect(isQuestComplete({ userACompleted: true, userBCompleted: true })).toBe(true);
  });

  it('returns false when only user A has completed', () => {
    expect(isQuestComplete({ userACompleted: true, userBCompleted: false })).toBe(false);
  });

  it('returns false when only user B has completed', () => {
    expect(isQuestComplete({ userACompleted: false, userBCompleted: true })).toBe(false);
  });

  it('returns false when neither player has completed', () => {
    expect(isQuestComplete({ userACompleted: false, userBCompleted: false })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DUO_QUEST_TEMPLATES
// ---------------------------------------------------------------------------
describe('DUO_QUEST_TEMPLATES', () => {
  it('has at least 6 templates', () => {
    expect(DUO_QUEST_TEMPLATES.length).toBeGreaterThanOrEqual(6);
  });

  it('has at least 8 templates (target catalog size)', () => {
    expect(DUO_QUEST_TEMPLATES.length).toBeGreaterThanOrEqual(8);
  });

  it('all templates have xpRewardEach between 50-150', () => {
    for (const template of DUO_QUEST_TEMPLATES) {
      expect(template.xpRewardEach).toBeGreaterThanOrEqual(50);
      expect(template.xpRewardEach).toBeLessThanOrEqual(150);
    }
  });

  it('all templates have a unique id', () => {
    const ids = DUO_QUEST_TEMPLATES.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all templates have required fields (id, title, description, targetType, targetValue, durationDays, xpRewardEach)', () => {
    for (const template of DUO_QUEST_TEMPLATES) {
      expect(template.id).toBeDefined();
      expect(template.title).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.targetType).toBeDefined();
      expect(template.targetValue).toBeGreaterThan(0);
      expect(template.durationDays).toBeGreaterThan(0);
      expect(template.xpRewardEach).toBeGreaterThan(0);
    }
  });

  it('all templates have xpRewardBonus >= 0', () => {
    for (const template of DUO_QUEST_TEMPLATES) {
      expect(template.xpRewardBonus).toBeGreaterThanOrEqual(0);
    }
  });

  it('includes a "Read Together" type template', () => {
    const readTemplate = DUO_QUEST_TEMPLATES.find(t => t.id === 'read-together');
    expect(readTemplate).toBeDefined();
  });
});
