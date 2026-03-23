/**
 * Tests for boss-content.ts
 * Validates all 6 boss archetypes have complete, adab-safe dialogue and lore data.
 */

import { BOSS_ARCHETYPES, type ArchetypeId } from '../../src/domain/boss-content';

const EXPECTED_ARCHETYPE_IDS: ArchetypeId[] = [
  'procrastinator',
  'distractor',
  'doubter',
  'glutton',
  'comparer',
  'perfectionist',
];

describe('BOSS_ARCHETYPES', () => {
  it('has exactly 6 entries', () => {
    expect(Object.keys(BOSS_ARCHETYPES).length).toBe(6);
  });

  it('contains all expected archetype IDs', () => {
    for (const id of EXPECTED_ARCHETYPE_IDS) {
      expect(BOSS_ARCHETYPES).toHaveProperty(id);
    }
  });

  describe.each(EXPECTED_ARCHETYPE_IDS)('archetype: %s', (archetypeId) => {
    it('has a non-empty name', () => {
      expect(BOSS_ARCHETYPES[archetypeId].name.length).toBeGreaterThan(0);
    });

    it('has a non-empty arabicName', () => {
      expect(BOSS_ARCHETYPES[archetypeId].arabicName.length).toBeGreaterThan(0);
    });

    it('has a non-empty lore string', () => {
      expect(BOSS_ARCHETYPES[archetypeId].lore.length).toBeGreaterThan(0);
    });

    it('has intro dialogue with length >= 10', () => {
      expect(BOSS_ARCHETYPES[archetypeId].dialogue.intro.length).toBeGreaterThanOrEqual(10);
    });

    it('has taunt dialogue with length >= 10', () => {
      expect(BOSS_ARCHETYPES[archetypeId].dialogue.taunt.length).toBeGreaterThanOrEqual(10);
    });

    it('has playerWinning dialogue with length >= 10', () => {
      expect(BOSS_ARCHETYPES[archetypeId].dialogue.playerWinning.length).toBeGreaterThanOrEqual(10);
    });

    it('has defeated dialogue with length >= 10', () => {
      expect(BOSS_ARCHETYPES[archetypeId].dialogue.defeated.length).toBeGreaterThanOrEqual(10);
    });

    it('contains no shame language in any dialogue string', () => {
      const shamePattern = /you failed|you're bad|shameful/i;
      const { intro, taunt, playerWinning, defeated } = BOSS_ARCHETYPES[archetypeId].dialogue;
      expect(intro).not.toMatch(shamePattern);
      expect(taunt).not.toMatch(shamePattern);
      expect(playerWinning).not.toMatch(shamePattern);
      expect(defeated).not.toMatch(shamePattern);
    });
  });
});

describe('Glutton archetype specific content', () => {
  it('has the correct intro line', () => {
    expect(BOSS_ARCHETYPES.glutton.dialogue.intro).toContain('Why deny yourself');
  });

  it('has arabicName Al-Sharah', () => {
    expect(BOSS_ARCHETYPES.glutton.arabicName).toBe('Al-Sharah');
  });
});
