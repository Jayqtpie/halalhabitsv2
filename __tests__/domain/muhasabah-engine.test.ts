import {
  isMuhasabahTime,
  getClosingContent,
  CLOSING_CONTENT,
} from '../../src/domain/muhasabah-engine';

describe('muhasabah-engine', () => {
  describe('isMuhasabahTime', () => {
    it('returns false before 21:00 fallback when no Isha window', () => {
      const at2000 = new Date('2026-03-15T20:00:00');
      expect(isMuhasabahTime(null, at2000)).toBe(false);
    });

    it('returns true at 21:00 fallback when no Isha window', () => {
      const at2100 = new Date('2026-03-15T21:00:00');
      expect(isMuhasabahTime(null, at2100)).toBe(true);
    });

    it('returns true after 21:00 fallback when no Isha window', () => {
      const at2230 = new Date('2026-03-15T22:30:00');
      expect(isMuhasabahTime(null, at2230)).toBe(true);
    });

    it('returns false before Isha start when window provided', () => {
      const ishaStart = new Date('2026-03-15T20:30:00');
      const before = new Date('2026-03-15T20:29:00');
      expect(isMuhasabahTime({ start: ishaStart }, before)).toBe(false);
    });

    it('returns true at Isha start when window provided', () => {
      const ishaStart = new Date('2026-03-15T20:30:00');
      expect(isMuhasabahTime({ start: ishaStart }, ishaStart)).toBe(true);
    });

    it('returns true after Isha start when window provided', () => {
      const ishaStart = new Date('2026-03-15T20:30:00');
      const after = new Date('2026-03-15T21:00:00');
      expect(isMuhasabahTime({ start: ishaStart }, after)).toBe(true);
    });
  });

  describe('CLOSING_CONTENT', () => {
    it('has at least 5 entries', () => {
      expect(CLOSING_CONTENT.length).toBeGreaterThanOrEqual(5);
    });

    it('each entry has arabic, translation, and source fields', () => {
      for (const entry of CLOSING_CONTENT) {
        expect(entry.arabic).toBeTruthy();
        expect(entry.translation).toBeTruthy();
        expect(entry.source).toBeTruthy();
        expect(['ayah', 'hadith']).toContain(entry.type);
      }
    });
  });

  describe('getClosingContent', () => {
    it('returns first item for index 0', () => {
      expect(getClosingContent(0)).toEqual(CLOSING_CONTENT[0]);
    });

    it('wraps around when index equals length', () => {
      expect(getClosingContent(CLOSING_CONTENT.length)).toEqual(CLOSING_CONTENT[0]);
    });

    it('returns correct item for arbitrary index', () => {
      expect(getClosingContent(2)).toEqual(CLOSING_CONTENT[2]);
    });
  });
});
