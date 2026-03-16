/**
 * Niyyah (intention) options for onboarding.
 *
 * Users select their motivations for building Islamic discipline.
 * Seasonal options only appear during relevant Hijri months.
 *
 * Pure data — no React imports.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface NiyyahOption {
  id: string;
  text: string;
  /** If set, option only shows when current Hijri month is in this list */
  visibleMonths?: number[];
}

// ─── Niyyah Options ──────────────────────────────────────────────────

export const NIYYAH_OPTIONS: NiyyahOption[] = [
  // Always-visible options
  {
    id: 'strengthen-salah',
    text: 'Strengthen my salah',
  },
  {
    id: 'build-discipline',
    text: 'Build daily discipline',
  },
  {
    id: 'grow-closer',
    text: 'Grow closer to Allah',
  },
  {
    id: 'break-bad-habits',
    text: 'Break bad habits',
  },
  {
    id: 'find-consistency',
    text: 'Find consistency in my worship',
  },
  {
    id: 'improve-character',
    text: 'Improve my character (akhlaq)',
  },
  {
    id: 'learn-quran',
    text: "Reconnect with the Qur'an",
  },
  // Seasonal: Sha'ban (8) and Ramadan (9)
  {
    id: 'prepare-ramadan',
    text: 'Prepare for Ramadan',
    visibleMonths: [8, 9],
  },
];

// ─── Hijri Month Helper ───────────────────────────────────────────────

/**
 * Returns the current Hijri month number (1–12) using Intl.DateTimeFormat.
 * Falls back to undefined if the Islamic calendar is not available,
 * which causes getAvailableNiyyahOptions to show all options.
 */
export function getCurrentHijriMonth(): number | undefined {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric' });
    const parts = formatter.formatToParts(new Date());
    const monthPart = parts.find((p) => p.type === 'month');
    if (!monthPart) return undefined;
    const month = parseInt(monthPart.value, 10);
    if (isNaN(month) || month < 1 || month > 12) return undefined;
    return month;
  } catch {
    return undefined;
  }
}

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Returns niyyah options available for the current Hijri month.
 *
 * - Always-visible options (no visibleMonths) are always returned.
 * - Seasonal options appear only when the current month matches.
 * - If Hijri month cannot be determined, all options are returned (fail-open).
 */
export function getAvailableNiyyahOptions(): NiyyahOption[] {
  const currentMonth = getCurrentHijriMonth();

  // Fail-open: if month unknown, show everything
  if (currentMonth === undefined) {
    return NIYYAH_OPTIONS;
  }

  return NIYYAH_OPTIONS.filter(
    (option) => !option.visibleMonths || option.visibleMonths.includes(currentMonth),
  );
}
