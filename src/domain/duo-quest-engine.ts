/**
 * Duo Quest Engine -- Pure TypeScript module for Duo Quest domain logic.
 *
 * No React, no DB, no side effects. Fully unit-testable.
 *
 * Key behaviors:
 * - Max 3 active duo quests per buddy pair (D-08)
 * - Aggregate progress never reveals individual player contributions (D-05, D-13)
 * - Inactivity detection: 48h warning, 72h exit eligibility (D-09, D-10)
 * - Partial XP on exit: proportional individual, no bonus (D-10)
 * - Status state machine: active/paused/completed/exited
 *
 * All functions operate on primitive values or plain objects.
 * Downstream plans (duoQuestRepo, buddyStore) consume these functions.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Maximum number of active duo quests a buddy pair can have simultaneously.
 * Per D-08: prevents overcommitment and keeps focus.
 */
export const MAX_ACTIVE_DUO_QUESTS = 3;

/**
 * Milliseconds of partner inactivity before a warning is shown.
 * Per D-09: warn after 48 hours of no progress from the partner.
 */
export const INACTIVITY_WARNING_MS = 48 * 60 * 60 * 1000;

/**
 * Milliseconds of partner inactivity before exit eligibility triggers.
 * Per D-10: after 72 hours inactive, the other player may exit with partial XP.
 */
export const INACTIVITY_EXIT_MS = 72 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of a new duo quest ready for persistence (matches NewDuoQuest from schema). */
export interface NewDuoQuestData {
  buddyPairId: string;
  createdByUserId: string;
  title: string;
  description: string;
  xpRewardEach: number;
  xpRewardBonus: number;
  targetType: string;
  targetValue: number;
  userAProgress: number;
  userBProgress: number;
  userACompleted: boolean;
  userBCompleted: boolean;
  status: 'active' | 'paused' | 'completed' | 'exited';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Parameters for creating a new duo quest. */
export interface CreateDuoQuestParams {
  buddyPairId: string;
  createdByUserId: string;
  title: string;
  description: string;
  xpRewardEach: number;
  xpRewardBonus?: number;
  targetType: string;
  targetValue: number;
  durationDays: number;
}

/** Minimal quest fields needed for progress tracking. */
export interface QuestProgressFields {
  userAProgress: number;
  userBProgress: number;
  userACompleted: boolean;
  userBCompleted: boolean;
  targetValue: number;
}

/** Result of aggregate progress calculation (never exposes individual data). */
export interface AggregateProgress {
  /** Combined progress from both players */
  totalProgress: number;
  /** Combined target (targetValue × 2) */
  totalTarget: number;
  /** Percentage complete (0-100, integer) */
  percentage: number;
}

/** Inactivity status of a partner. */
export type InactivityStatus = 'ok' | 'warning' | 'exit_eligible';

/** Duo quest status values. */
type DuoQuestStatus = 'active' | 'paused' | 'completed' | 'exited';

// ---------------------------------------------------------------------------
// canCreateDuoQuest
// ---------------------------------------------------------------------------

/**
 * Determine if a new duo quest can be created for a buddy pair.
 *
 * Per D-08: a buddy pair is limited to MAX_ACTIVE_DUO_QUESTS (3) concurrent
 * active quests to prevent overcommitment.
 *
 * @param activeQuestCount - Number of currently active duo quests for the pair
 * @returns true if a new quest can be created
 */
export function canCreateDuoQuest(activeQuestCount: number): boolean {
  return activeQuestCount < MAX_ACTIVE_DUO_QUESTS;
}

// ---------------------------------------------------------------------------
// createDuoQuest
// ---------------------------------------------------------------------------

/**
 * Create a new duo quest record.
 *
 * Returns a data object ready for persistence with all progress at 0,
 * status='active', and expiresAt set to now + durationDays.
 *
 * @param params - Duo quest parameters
 * @returns NewDuoQuestData object ready for persistence
 */
export function createDuoQuest(params: CreateDuoQuestParams): NewDuoQuestData {
  const {
    buddyPairId,
    createdByUserId,
    title,
    description,
    xpRewardEach,
    xpRewardBonus = 0,
    targetType,
    targetValue,
    durationDays,
  } = params;

  const now = new Date();
  const nowIso = now.toISOString();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    buddyPairId,
    createdByUserId,
    title,
    description,
    xpRewardEach,
    xpRewardBonus,
    targetType,
    targetValue,
    userAProgress: 0,
    userBProgress: 0,
    userACompleted: false,
    userBCompleted: false,
    status: 'active',
    expiresAt,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

// ---------------------------------------------------------------------------
// recordProgress
// ---------------------------------------------------------------------------

/**
 * Record a progress increment for one side of a duo quest.
 *
 * Returns a new object (does not mutate) with:
 * - Progress incremented and clamped to targetValue
 * - Completed flag set to true when progress reaches targetValue
 *
 * @param quest - Current quest progress fields
 * @param side - Which player made progress ('a' or 'b')
 * @param increment - How much to increment (defaults to 1)
 * @returns Updated quest fields (new object, original is not mutated)
 */
export function recordProgress(
  quest: QuestProgressFields,
  side: 'a' | 'b',
  increment: number = 1,
): QuestProgressFields {
  const updated = { ...quest };

  if (side === 'a') {
    updated.userAProgress = Math.min(quest.userAProgress + increment, quest.targetValue);
    updated.userACompleted = updated.userAProgress >= quest.targetValue;
  } else {
    updated.userBProgress = Math.min(quest.userBProgress + increment, quest.targetValue);
    updated.userBCompleted = updated.userBProgress >= quest.targetValue;
  }

  return updated;
}

// ---------------------------------------------------------------------------
// getAggregateProgress
// ---------------------------------------------------------------------------

/**
 * Calculate aggregate progress for a duo quest.
 *
 * Per D-05 and D-13: aggregate view only — never reveals which side contributed
 * what. Returns combined totals and percentage.
 *
 * @param quest - Quest with userAProgress, userBProgress, and targetValue
 * @returns AggregateProgress with totalProgress, totalTarget, and percentage
 */
export function getAggregateProgress(quest: {
  userAProgress: number;
  userBProgress: number;
  targetValue: number;
}): AggregateProgress {
  const totalProgress = quest.userAProgress + quest.userBProgress;
  const totalTarget = quest.targetValue * 2;
  const percentage = totalTarget === 0 ? 0 : Math.round((totalProgress / totalTarget) * 100);

  return {
    totalProgress,
    totalTarget,
    percentage,
  };
}

// ---------------------------------------------------------------------------
// checkInactivity
// ---------------------------------------------------------------------------

/**
 * Check the inactivity status of a partner based on their last progress timestamp.
 *
 * Per D-09/D-10:
 * - 'ok': partner was active within 48 hours
 * - 'warning': partner inactive 48-72 hours (show gentle nudge)
 * - 'exit_eligible': partner inactive 72+ hours (exit with partial XP available)
 *
 * @param partnerLastProgressAt - ISO timestamp of partner's last progress update
 * @param now - Optional Date for deterministic testing (defaults to Date.now())
 * @returns InactivityStatus: 'ok' | 'warning' | 'exit_eligible'
 */
export function checkInactivity(
  partnerLastProgressAt: string,
  now?: Date,
): InactivityStatus {
  const referenceTime = now ? now.getTime() : Date.now();
  const lastActiveTime = new Date(partnerLastProgressAt).getTime();
  const inactiveMs = referenceTime - lastActiveTime;

  if (inactiveMs >= INACTIVITY_EXIT_MS) {
    return 'exit_eligible';
  }

  if (inactiveMs > INACTIVITY_WARNING_MS) {
    return 'warning';
  }

  return 'ok';
}

// ---------------------------------------------------------------------------
// calculatePartialXP
// ---------------------------------------------------------------------------

/**
 * Calculate partial XP awarded when a player exits a duo quest early.
 *
 * Per D-10: proportional individual XP based on progress, zero bonus XP.
 * The bonus XP is only awarded when BOTH players fully complete the quest.
 *
 * @param params - xpRewardEach, userProgress, targetValue
 * @returns { individualXP, bonusXP } where bonusXP is always 0 on partial exit
 */
export function calculatePartialXP(params: {
  xpRewardEach: number;
  userProgress: number;
  targetValue: number;
}): { individualXP: number; bonusXP: number } {
  const { xpRewardEach, userProgress, targetValue } = params;

  if (targetValue === 0) {
    return { individualXP: 0, bonusXP: 0 };
  }

  const ratio = userProgress / targetValue;
  const individualXP = Math.floor(xpRewardEach * ratio);

  return {
    individualXP,
    bonusXP: 0, // No bonus on partial/early exit (D-10)
  };
}

// ---------------------------------------------------------------------------
// getDuoQuestStatusTransition
// ---------------------------------------------------------------------------

/**
 * Enforce the duo quest status state machine.
 *
 * Returns the next status given the current status and action.
 * Returns null for invalid transitions.
 *
 * Valid transitions:
 * - active + complete => completed
 * - active + pause    => paused
 * - active + exit     => exited
 * - paused + resume   => active
 * - paused + exit     => exited
 *
 * Terminal states (no transitions allowed):
 * - completed, exited
 *
 * @param current - Current quest status
 * @param action - Action to take ('complete' | 'pause' | 'resume' | 'exit')
 * @returns Next status string, or null if the transition is invalid
 */
export function getDuoQuestStatusTransition(
  current: string,
  action: string,
): DuoQuestStatus | null {
  if (current === 'active') {
    if (action === 'complete') return 'completed';
    if (action === 'pause') return 'paused';
    if (action === 'exit') return 'exited';
  }

  if (current === 'paused') {
    if (action === 'resume') return 'active';
    if (action === 'exit') return 'exited';
  }

  // Terminal states (completed, exited) and all unknown combinations are invalid
  return null;
}

// ---------------------------------------------------------------------------
// isQuestComplete
// ---------------------------------------------------------------------------

/**
 * Determine if a duo quest is fully complete (both players have finished).
 *
 * A duo quest requires BOTH players to individually complete their share.
 * One player finishing is not enough.
 *
 * @param quest - Quest with userACompleted and userBCompleted flags
 * @returns true only when both players have completed
 */
export function isQuestComplete(quest: {
  userACompleted: boolean;
  userBCompleted: boolean;
}): boolean {
  return quest.userACompleted && quest.userBCompleted;
}
