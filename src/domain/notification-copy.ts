/**
 * Notification copy — all title/body text for scheduled notifications.
 *
 * Adab safety rules:
 * - Wise mentor voice: invitational, never shame-based
 * - FORBIDDEN words: missed, forgot, failed, shame, disappointed
 * - Prayer follow-ups: always "still open" / "still time" framing
 * - Streak milestones: celebratory, mashallah tone
 *
 * Pure TypeScript — no React imports.
 */
import type { PrayerName } from '../types/habits';

// ─── Prayer Reminder Copy ─────────────────────────────────────────────

const PRAYER_DISPLAY: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

const PRAYER_REMINDER_BODIES: Record<PrayerName, string> = {
  fajr: 'The dawn prayer begins. Rise and begin your day with remembrance.',
  dhuhr: 'Midday has arrived — a moment of stillness awaits you.',
  asr: 'The afternoon prayer window is open. Step away and pray.',
  maghrib: 'The sun has set. The Maghrib window is open.',
  isha: 'Evening has come. Close your day with the night prayer.',
};

const PRAYER_FOLLOW_UP_BODIES: Record<PrayerName, string> = {
  fajr: 'The Fajr window is still open. There is still time to pray.',
  dhuhr: 'The Dhuhr window is still open — a few minutes is all you need.',
  asr: 'The Asr window is still open. Your prayer is ready for you.',
  maghrib: 'Maghrib is still open. Step away now and pray.',
  isha: 'The Isha window is still open. Close your day in prayer.',
};

/** Returns the notification title for a prayer reminder */
export function getPrayerReminderTitle(name: PrayerName): string {
  return `Time for ${PRAYER_DISPLAY[name]}`;
}

/** Returns the notification body for a prayer reminder */
export function getPrayerReminderBody(name: PrayerName): string {
  return PRAYER_REMINDER_BODIES[name];
}

/** Returns the notification title for a prayer follow-up */
export function getFollowUpTitle(name: PrayerName): string {
  return `${PRAYER_DISPLAY[name]} window is still open`;
}

/** Returns the notification body for a prayer follow-up */
export function getFollowUpBody(name: PrayerName): string {
  return PRAYER_FOLLOW_UP_BODIES[name];
}

// ─── Muhasabah Reminder Copy ──────────────────────────────────────────

/** Returns the Muhasabah daily reflection notification title */
export function getMuhasabahTitle(): string {
  return 'Your evening reflection awaits';
}

/** Returns the Muhasabah daily reflection notification body */
export function getMuhasabahBody(): string {
  return 'A few minutes of muhasabah (self-reflection) to close your day with intention.';
}

// ─── Morning Motivation Copy ──────────────────────────────────────────

const MORNING_LINES: string[] = [
  'Your discipline grows stronger each morning. Begin with bismillah.',
  '"Indeed, with hardship comes ease." (Quran 94:6) — Your consistency builds ease.',
  'The Prophet (peace be upon him) said: Deeds most beloved to Allah are those done consistently.',
  'Each small act of worship, done daily, carries immense weight. Begin now.',
  'Your morning adhkar are a shield. Start your day with remembrance.',
  'Discipline is a form of gratitude — using the time Allah gave you with intention.',
  '"Whoever wakes up safely, with good health and provision — it is as if the world was granted to them." Begin well.',
];

let morningLineIndex = 0;

/** Returns a rotating morning motivation line */
export function getMorningMotivation(): string {
  const line = MORNING_LINES[morningLineIndex % MORNING_LINES.length];
  morningLineIndex = (morningLineIndex + 1) % MORNING_LINES.length;
  return line;
}

// ─── Streak Milestone Copy ────────────────────────────────────────────

/** Returns a celebratory streak milestone notification body */
export function getStreakMilestoneBody(count: number, habitName: string): string {
  if (count >= 100) {
    return `MashaAllah! ${count} days of ${habitName}. Your dedication is an inspiration.`;
  }
  if (count >= 30) {
    return `SubhanAllah — ${count} days of ${habitName}. You have built something real.`;
  }
  if (count >= 14) {
    return `MashaAllah! ${count}-day streak for ${habitName}. Your consistency is growing.`;
  }
  return `MashaAllah! ${count} days of ${habitName}. Keep going — you are building discipline.`;
}

// ─── Quest Expiring Copy ──────────────────────────────────────────────

/** Returns a quest expiring notification body */
export function getQuestExpiringBody(questName: string, timeLeft: string): string {
  return `"${questName}" is still within reach — ${timeLeft} remaining. Press forward.`;
}
