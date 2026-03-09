/**
 * Tests for Islamic habit presets
 */
import {
  HABIT_PRESETS,
  PRESET_CATEGORIES,
  getPresetsByCategory,
  getPresetByKey,
} from '../../src/domain/presets';
import type { PresetCategory } from '../../src/types/habits';

describe('HABIT_PRESETS', () => {
  it('contains approximately 15 presets', () => {
    expect(HABIT_PRESETS.length).toBeGreaterThanOrEqual(14);
    expect(HABIT_PRESETS.length).toBeLessThanOrEqual(16);
  });

  it('each preset has all required fields', () => {
    for (const preset of HABIT_PRESETS) {
      expect(preset).toHaveProperty('key');
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('category');
      expect(preset).toHaveProperty('type');
      expect(preset).toHaveProperty('frequency');
      expect(preset).toHaveProperty('icon');
      expect(preset).toHaveProperty('difficultyTier');
      expect(preset).toHaveProperty('baseXp');
      expect(preset).toHaveProperty('description');
      expect(typeof preset.key).toBe('string');
      expect(typeof preset.baseXp).toBe('number');
      expect(preset.baseXp).toBeGreaterThan(0);
    }
  });

  it('has unique keys for all presets', () => {
    const keys = HABIT_PRESETS.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('salah category has exactly 5 presets', () => {
    const salahPresets = HABIT_PRESETS.filter((p) => p.category === 'salah');
    expect(salahPresets).toHaveLength(5);
  });

  it('all salah presets have type="salah"', () => {
    const salahPresets = HABIT_PRESETS.filter((p) => p.category === 'salah');
    for (const p of salahPresets) {
      expect(p.type).toBe('salah');
    }
  });

  it('fajr has highest base XP among salah (50)', () => {
    const fajr = HABIT_PRESETS.find((p) => p.key === 'fajr');
    expect(fajr).toBeDefined();
    expect(fajr!.baseXp).toBe(50);
  });

  it('covers all 6 categories', () => {
    const categories = new Set(HABIT_PRESETS.map((p) => p.category));
    expect(categories).toContain('salah');
    expect(categories).toContain('quran');
    expect(categories).toContain('dhikr');
    expect(categories).toContain('dua');
    expect(categories).toContain('fasting');
    expect(categories).toContain('character');
  });
});

describe('PRESET_CATEGORIES', () => {
  it('has 6 categories', () => {
    expect(PRESET_CATEGORIES).toHaveLength(6);
  });

  it('each category has key, displayName, and icon', () => {
    for (const cat of PRESET_CATEGORIES) {
      expect(cat).toHaveProperty('key');
      expect(cat).toHaveProperty('displayName');
      expect(cat).toHaveProperty('icon');
    }
  });
});

describe('getPresetsByCategory', () => {
  it('returns only salah presets for salah category', () => {
    const salah = getPresetsByCategory('salah');
    expect(salah).toHaveLength(5);
    for (const p of salah) {
      expect(p.category).toBe('salah');
    }
  });

  it('returns quran presets for quran category', () => {
    const quran = getPresetsByCategory('quran');
    expect(quran.length).toBeGreaterThanOrEqual(2);
    for (const p of quran) {
      expect(p.category).toBe('quran');
    }
  });

  it('returns empty array for unknown category', () => {
    const result = getPresetsByCategory('nonexistent' as PresetCategory);
    expect(result).toHaveLength(0);
  });
});

describe('getPresetByKey', () => {
  it('finds preset by key', () => {
    const fajr = getPresetByKey('fajr');
    expect(fajr).toBeDefined();
    expect(fajr!.name).toBe('Fajr');
  });

  it('returns undefined for unknown key', () => {
    const result = getPresetByKey('nonexistent');
    expect(result).toBeUndefined();
  });
});
