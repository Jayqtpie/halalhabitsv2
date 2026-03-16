/**
 * Tests for starter-packs domain module.
 *
 * Verifies bundle count, habit key validity, and bundle size constraints.
 */
import { STARTER_PACKS, type StarterPack } from '../../src/domain/starter-packs';
import { HABIT_PRESETS } from '../../src/domain/presets';

describe('STARTER_PACKS', () => {
  it('has exactly 3 starter packs', () => {
    expect(STARTER_PACKS).toHaveLength(3);
  });

  it('each pack has id, name, description, and habitKeys', () => {
    for (const pack of STARTER_PACKS) {
      expect(typeof pack.id).toBe('string');
      expect(typeof pack.name).toBe('string');
      expect(typeof pack.description).toBe('string');
      expect(Array.isArray(pack.habitKeys)).toBe(true);
    }
  });

  it('each pack has between 3 and 5 habits', () => {
    for (const pack of STARTER_PACKS) {
      expect(pack.habitKeys.length).toBeGreaterThanOrEqual(3);
      expect(pack.habitKeys.length).toBeLessThanOrEqual(5);
    }
  });

  it('all habitKeys in every pack resolve to real presets', () => {
    const validKeys = new Set(HABIT_PRESETS.map((p) => p.key));
    for (const pack of STARTER_PACKS) {
      for (const key of pack.habitKeys) {
        expect(validKeys.has(key)).toBe(true);
      }
    }
  });

  it('contains a "Beginner Path" pack', () => {
    const beginner = STARTER_PACKS.find((p) => p.name === 'Beginner Path');
    expect(beginner).toBeDefined();
  });

  it('contains a "Salah Focus" pack', () => {
    const salah = STARTER_PACKS.find((p) => p.name === 'Salah Focus');
    expect(salah).toBeDefined();
  });

  it('contains a "Full Discipline" pack', () => {
    const full = STARTER_PACKS.find((p) => p.name === 'Full Discipline');
    expect(full).toBeDefined();
  });

  it('Salah Focus pack contains all 5 prayer habits', () => {
    const salah = STARTER_PACKS.find((p) => p.name === 'Salah Focus');
    expect(salah).toBeDefined();
    const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (const key of prayerKeys) {
      expect(salah!.habitKeys).toContain(key);
    }
  });

  it('has no duplicate habitKeys within a single pack', () => {
    for (const pack of STARTER_PACKS) {
      const unique = new Set(pack.habitKeys);
      expect(unique.size).toBe(pack.habitKeys.length);
    }
  });
});
