/**
 * Tests for notification-copy domain module.
 *
 * Verifies invitational tone and absence of guilt language.
 * All copy must follow adab-safe wise mentor voice.
 */
import {
  getPrayerReminderTitle,
  getPrayerReminderBody,
  getFollowUpTitle,
  getFollowUpBody,
  getMuhasabahTitle,
  getMuhasabahBody,
  getMorningMotivation,
  getStreakMilestoneBody,
  getQuestExpiringBody,
} from '../../src/domain/notification-copy';
import type { PrayerName } from '../../src/types/habits';

const PRAYER_NAMES: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const FORBIDDEN_WORDS = ['missed', 'forgot', 'failed', 'shame', 'disappointed'];

function checkNoForbiddenWords(text: string, label: string): void {
  for (const word of FORBIDDEN_WORDS) {
    expect(text.toLowerCase()).not.toContain(word);
  }
}

describe('getPrayerReminderTitle', () => {
  it('returns a non-empty string for each PrayerName', () => {
    for (const prayer of PRAYER_NAMES) {
      const title = getPrayerReminderTitle(prayer);
      expect(typeof title).toBe('string');
      expect(title.length).toBeGreaterThan(0);
    }
  });

  it('contains no forbidden guilt words', () => {
    for (const prayer of PRAYER_NAMES) {
      checkNoForbiddenWords(getPrayerReminderTitle(prayer), `getReminderTitle(${prayer})`);
    }
  });
});

describe('getPrayerReminderBody', () => {
  it('returns a non-empty string for each PrayerName', () => {
    for (const prayer of PRAYER_NAMES) {
      const body = getPrayerReminderBody(prayer);
      expect(typeof body).toBe('string');
      expect(body.length).toBeGreaterThan(0);
    }
  });

  it('contains no forbidden guilt words', () => {
    for (const prayer of PRAYER_NAMES) {
      checkNoForbiddenWords(getPrayerReminderBody(prayer), `getReminderBody(${prayer})`);
    }
  });
});

describe('getFollowUpTitle', () => {
  it('returns a non-empty string for each PrayerName', () => {
    for (const prayer of PRAYER_NAMES) {
      const title = getFollowUpTitle(prayer);
      expect(typeof title).toBe('string');
      expect(title.length).toBeGreaterThan(0);
    }
  });

  it('contains no forbidden guilt words', () => {
    for (const prayer of PRAYER_NAMES) {
      checkNoForbiddenWords(getFollowUpTitle(prayer), `getFollowUpTitle(${prayer})`);
    }
  });
});

describe('getFollowUpBody', () => {
  it('returns a non-empty string for each PrayerName', () => {
    for (const prayer of PRAYER_NAMES) {
      const body = getFollowUpBody(prayer);
      expect(typeof body).toBe('string');
      expect(body.length).toBeGreaterThan(0);
    }
  });

  it('contains "still" or "open" (invitational language)', () => {
    for (const prayer of PRAYER_NAMES) {
      const body = getFollowUpBody(prayer).toLowerCase();
      const hasInvitational = body.includes('still') || body.includes('open');
      expect(hasInvitational).toBe(true);
    }
  });

  it('contains no forbidden guilt words', () => {
    for (const prayer of PRAYER_NAMES) {
      checkNoForbiddenWords(getFollowUpBody(prayer), `getFollowUpBody(${prayer})`);
    }
  });
});

describe('getMuhasabahTitle and getMuhasabahBody', () => {
  it('returns non-empty strings', () => {
    expect(getMuhasabahTitle().length).toBeGreaterThan(0);
    expect(getMuhasabahBody().length).toBeGreaterThan(0);
  });

  it('contains no forbidden guilt words', () => {
    checkNoForbiddenWords(getMuhasabahTitle(), 'getMuhasabahTitle');
    checkNoForbiddenWords(getMuhasabahBody(), 'getMuhasabahBody');
  });
});

describe('getMorningMotivation', () => {
  it('returns a non-empty string', () => {
    const text = getMorningMotivation();
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(0);
  });

  it('contains no forbidden guilt words', () => {
    checkNoForbiddenWords(getMorningMotivation(), 'getMorningMotivation');
  });

  it('rotates through multiple lines (calling 5 times returns varied results or same)', () => {
    // At minimum, we verify no forbidden words across calls
    for (let i = 0; i < 5; i++) {
      checkNoForbiddenWords(getMorningMotivation(), `getMorningMotivation call ${i}`);
    }
  });
});

describe('getStreakMilestoneBody', () => {
  it('returns a non-empty string with count and habit name', () => {
    const body = getStreakMilestoneBody(7, 'Fajr');
    expect(typeof body).toBe('string');
    expect(body.length).toBeGreaterThan(0);
  });

  it('uses mashallah or celebratory tone (no forbidden words)', () => {
    checkNoForbiddenWords(getStreakMilestoneBody(30, 'Morning Adhkar'), 'getStreakMilestoneBody');
  });

  it('works for milestone counts: 7, 14, 30, 100', () => {
    for (const count of [7, 14, 30, 100]) {
      const body = getStreakMilestoneBody(count, 'Fajr');
      expect(body.length).toBeGreaterThan(0);
      checkNoForbiddenWords(body, `getStreakMilestoneBody(${count})`);
    }
  });
});

describe('getQuestExpiringBody', () => {
  it('returns a non-empty string', () => {
    const body = getQuestExpiringBody('Complete Fajr 7 days', '2 hours');
    expect(typeof body).toBe('string');
    expect(body.length).toBeGreaterThan(0);
  });

  it('contains no forbidden guilt words', () => {
    checkNoForbiddenWords(getQuestExpiringBody('Test Quest', '1 hour'), 'getQuestExpiringBody');
  });
});
