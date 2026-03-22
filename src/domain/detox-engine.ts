/**
 * Detox Engine — Pure TypeScript module for Dopamine Detox Dungeon logic.
 *
 * No React, no DB, no side effects. Fully unit-testable.
 *
 * All functions operate on primitive values or plain objects.
 * Callers are responsible for passing correct boundary values (dayStart, weekStart, etc.).
 */

const MS_PER_HOUR = 3600000;

// ---------------------------------------------------------------------------
// calculateDetoxXP
// ---------------------------------------------------------------------------

/**
 * Calculate base XP earned for completing a detox session.
 *
 * - Deep variant: always 300 XP regardless of duration
 * - Daily variant: 50 + (clampedHours - 2) * 25
 *   where clampedHours = clamp(durationHours, 2, 6)
 *   Yields: 2h=50, 3h=75, 4h=100, 5h=125, 6h=150
 */
export function calculateDetoxXP(variant: 'daily' | 'deep', durationHours: number): number {
  if (variant === 'deep') {
    return 300;
  }
  const clampedHours = Math.min(Math.max(durationHours, 2), 6);
  return 50 + (clampedHours - 2) * 25;
}

// ---------------------------------------------------------------------------
// calculateEarlyExitPenalty
// ---------------------------------------------------------------------------

/**
 * Calculate XP penalty for abandoning a session before completion.
 *
 * penalty = round(baseXP * remainingFraction)
 * remainingFraction = max(0, (totalMs - elapsedMs) / totalMs)
 *
 * Exits exactly at or after the end time yield 0 penalty.
 */
export function calculateEarlyExitPenalty(
  startedAt: string,
  durationHours: number,
  baseXP: number,
  now: string,
): number {
  const startMs = new Date(startedAt).getTime();
  const totalMs = durationHours * MS_PER_HOUR;
  const elapsedMs = new Date(now).getTime() - startMs;
  const remainingFraction = Math.max(0, (totalMs - elapsedMs) / totalMs);
  return Math.round(baseXP * remainingFraction);
}

// ---------------------------------------------------------------------------
// isProtectedByDetox
// ---------------------------------------------------------------------------

/**
 * Determine if a habit window overlaps with an active detox session.
 *
 * Uses HH:MM string comparison (lexicographic, valid for same-day times).
 * Overlap condition: habitStart < sessionEnd && habitEnd > sessionStart
 *
 * A habit whose window ends exactly when the session starts is NOT protected.
 */
export function isProtectedByDetox(
  habitWindowStart: string,
  habitWindowEnd: string,
  sessionStart: string,
  sessionEnd: string,
): boolean {
  return habitWindowStart < sessionEnd && habitWindowEnd > sessionStart;
}

// ---------------------------------------------------------------------------
// isDeepVariantAvailableThisWeek
// ---------------------------------------------------------------------------

/**
 * Determine if the deep variant is available this week.
 *
 * Rules:
 * - No sessions this week => true
 * - 1 session with status 'abandoned' => true (re-entry allowed)
 * - 1 session with status 'completed' or 'active' => false
 * - 2+ sessions => false (regardless of status)
 *
 * Caller passes only deep sessions for the current week.
 */
export function isDeepVariantAvailableThisWeek(
  existingDeepSessions: Array<{ status: string }>,
): boolean {
  if (existingDeepSessions.length === 0) return true;
  if (existingDeepSessions.length >= 2) return false;
  // Exactly 1 session — only re-entry is allowed for abandoned
  return existingDeepSessions[0].status === 'abandoned';
}

// ---------------------------------------------------------------------------
// getRemainingMs
// ---------------------------------------------------------------------------

/**
 * Get milliseconds remaining in an active session.
 * Returns 0 if the session has already ended (clamped, never negative).
 */
export function getRemainingMs(startedAt: string, durationHours: number): number {
  const endMs = new Date(startedAt).getTime() + durationHours * MS_PER_HOUR;
  return Math.max(0, endMs - Date.now());
}

// ---------------------------------------------------------------------------
// canStartSession
// ---------------------------------------------------------------------------

/**
 * Determine if a new session can be started given existing sessions.
 *
 * Rules (same for both variants — caller scopes the list appropriately):
 * - If any session is 'active' => false (session already in progress)
 * - If any session is 'completed' => false (already done for this period)
 * - 0 sessions => true
 * - 1 session with 'abandoned' => true (1 retry allowed)
 * - 2+ sessions => false (max retries exhausted)
 *
 * For daily: caller passes today's sessions.
 * For deep: caller passes this week's deep sessions.
 */
export function canStartSession(
  _variant: 'daily' | 'deep',
  existingSessions: Array<{ status: string }>,
): boolean {
  // Block if any session is active or completed
  if (existingSessions.some(s => s.status === 'active')) return false;
  if (existingSessions.some(s => s.status === 'completed')) return false;

  // Count: 0 => allowed, 1 abandoned => retry allowed, 2+ => exhausted
  return existingSessions.length < 2;
}

// ---------------------------------------------------------------------------
// getSessionEndTime
// ---------------------------------------------------------------------------

/**
 * Calculate the ISO timestamp when a session will end.
 */
export function getSessionEndTime(startedAt: string, durationHours: number): string {
  return new Date(new Date(startedAt).getTime() + durationHours * MS_PER_HOUR).toISOString();
}
