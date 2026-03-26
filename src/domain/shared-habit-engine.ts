/**
 * Shared Habit Engine -- Pure TypeScript module for Shared Habit domain logic.
 *
 * No React, no DB, no side effects. Fully unit-testable.
 *
 * Privacy Gate (D-02): Worship habits (salah, muhasabah) cannot be shared.
 * These are private acts of worship and must never be exposed to buddies.
 *
 * All functions operate on primitive values or plain objects.
 * Downstream plans (sharedHabitRepo, buddyStore) consume these functions.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Habit types classified as private worship acts per the Privacy Gate (D-02).
 * These types are EXCLUDED from sharing — they cannot be proposed as shared habits.
 *
 * Salah: obligatory prayer (private, between worshipper and Allah)
 * Muhasabah: evening self-reflection (private, personal accountability)
 */
export const WORSHIP_HABIT_TYPES = ['salah', 'muhasabah'] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape for a new shared habit proposal (matches NewSharedHabit from schema). */
export interface SharedHabitProposal {
  buddyPairId: string;
  createdByUserId: string;
  habitType: string;
  name: string;
  targetFrequency: 'daily' | 'weekly';
  status: 'proposed' | 'active' | 'ended';
  createdAt: string;
  updatedAt: string;
}

/** Parameters for creating a shared habit proposal. */
export interface CreateSharedHabitParams {
  buddyPairId: string;
  createdByUserId: string;
  habitType: string;
  name: string;
  targetFrequency?: 'daily' | 'weekly';
}

// ---------------------------------------------------------------------------
// isEligibleForSharing
// ---------------------------------------------------------------------------

/**
 * Determine if a habit type is eligible for sharing with a buddy.
 *
 * Enforces the Privacy Gate (D-02): salah and muhasabah are private worship
 * acts and must never be shared. All other habit types are eligible.
 *
 * @param habitType - The habit type string to check
 * @returns true if the habit can be shared, false if it is a private worship type
 */
export function isEligibleForSharing(habitType: string): boolean {
  return !(WORSHIP_HABIT_TYPES as readonly string[]).includes(habitType);
}

// ---------------------------------------------------------------------------
// createSharedHabitProposal
// ---------------------------------------------------------------------------

/**
 * Create a new shared habit proposal between two buddies.
 *
 * Enforces the Privacy Gate: throws if habitType is a worship type.
 * Returns a proposal-shaped object ready for persistence.
 *
 * @param params - Proposal parameters (buddyPairId, createdByUserId, habitType, name, targetFrequency?)
 * @returns SharedHabitProposal object with status='proposed' and timestamps filled
 * @throws Error if habitType is not eligible for sharing (salah, muhasabah)
 */
export function createSharedHabitProposal(params: CreateSharedHabitParams): SharedHabitProposal {
  const { buddyPairId, createdByUserId, habitType, name, targetFrequency = 'daily' } = params;

  if (!isEligibleForSharing(habitType)) {
    throw new Error(
      `Habit type '${habitType}' cannot be shared. Worship habits are private per the Privacy Gate.`
    );
  }

  const now = new Date().toISOString();

  return {
    buddyPairId,
    createdByUserId,
    habitType,
    name,
    targetFrequency,
    status: 'proposed',
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// calculateSharedStreak
// ---------------------------------------------------------------------------

/**
 * Calculate the shared streak between two players.
 *
 * A shared streak is the count of consecutive days (counting backward from
 * the most recent date) where BOTH players completed the habit.
 *
 * Per D-14: shared streak = "how many consecutive days BOTH players completed"
 *
 * Algorithm:
 * 1. Build a Set from each player's completion dates
 * 2. Find intersection (dates present in both)
 * 3. Sort descending (most recent first)
 * 4. Count consecutive dates (each day must be exactly 1 day before the previous)
 *
 * @param userADates - ISO date strings (YYYY-MM-DD) of User A's completions
 * @param userBDates - ISO date strings (YYYY-MM-DD) of User B's completions
 * @returns Number of consecutive shared days counting backward from most recent
 */
export function calculateSharedStreak(userADates: string[], userBDates: string[]): number {
  if (userADates.length === 0 || userBDates.length === 0) {
    return 0;
  }

  const setA = new Set(userADates);
  const setB = new Set(userBDates);

  // Find dates present in both sets
  const sharedDates: string[] = [];
  for (const date of setA) {
    if (setB.has(date)) {
      sharedDates.push(date);
    }
  }

  if (sharedDates.length === 0) {
    return 0;
  }

  // Sort descending (most recent first)
  sharedDates.sort((a, b) => b.localeCompare(a));

  // Count consecutive run from most recent date
  let streak = 1;
  for (let i = 1; i < sharedDates.length; i++) {
    const prev = new Date(sharedDates[i - 1]);
    const curr = new Date(sharedDates[i]);

    // Check if curr is exactly 1 day before prev
    const diffMs = prev.getTime() - curr.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (diffMs === oneDayMs) {
      streak++;
    } else {
      break; // Gap found — streak ends
    }
  }

  return streak;
}

// ---------------------------------------------------------------------------
// canEndSharedHabit
// ---------------------------------------------------------------------------

/**
 * Determine if a shared habit can be ended given its current status.
 *
 * Per D-04: either player can end a shared habit at any time while active.
 * A proposed habit can also be declined (ended) before it's accepted.
 * An already-ended habit cannot be ended again.
 *
 * @param status - Current status of the shared habit
 * @returns true if the shared habit can be ended/declined
 */
export function canEndSharedHabit(status: string): boolean {
  return status === 'active' || status === 'proposed';
}
