/**
 * Buddy Engine — Pure TypeScript module for Buddy Connection System logic.
 *
 * No React, no DB, no side effects. Fully unit-testable.
 *
 * All functions operate on primitive values or plain objects.
 * Downstream plans (buddyRepo, buddyStore) consume these functions.
 */

import * as Crypto from 'expo-crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Invite codes expire after 48 hours. */
export const INVITE_CODE_EXPIRY_MS = 48 * 60 * 60 * 1000;

/** Maximum concurrent pending outbound buddy requests. */
export const MAX_PENDING_OUTBOUND = 10;

/** Maximum number of buddies a user can have. */
export const MAX_BUDDIES = 20;

/**
 * Charset for invite codes. Excludes ambiguous characters:
 * 0/O, 1/I/L to prevent confusion when sharing codes verbally or visually.
 */
const INVITE_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// ---------------------------------------------------------------------------
// generateInviteCode
// ---------------------------------------------------------------------------

/**
 * Generate a short invite code in HH-XXXXX format.
 *
 * Uses expo-crypto Crypto.getRandomValues for cryptographic randomness.
 * Each byte is mapped to the charset via modulo.
 *
 * @returns string e.g. 'HH-A7K3P'
 */
export function generateInviteCode(): string {
  const bytes = new Uint8Array(5);
  Crypto.getRandomValues(bytes);
  const code = Array.from(bytes)
    .map(b => INVITE_CODE_CHARSET[b % INVITE_CODE_CHARSET.length])
    .join('');
  return `HH-${code}`;
}

// ---------------------------------------------------------------------------
// isInviteCodeExpired
// ---------------------------------------------------------------------------

/**
 * Determine if an invite code has expired (older than 48 hours).
 *
 * @param createdAt - ISO 8601 timestamp string when the code was created
 * @returns true if the code is older than INVITE_CODE_EXPIRY_MS
 */
export function isInviteCodeExpired(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() > INVITE_CODE_EXPIRY_MS;
}

// ---------------------------------------------------------------------------
// canSendRequest
// ---------------------------------------------------------------------------

/**
 * Determine if a user can send a new buddy request.
 *
 * Rate-limited to MAX_PENDING_OUTBOUND concurrent pending requests.
 *
 * @param pendingOutboundCount - number of current pending outbound requests
 * @returns true if a new request can be sent
 */
export function canSendRequest(pendingOutboundCount: number): boolean {
  return pendingOutboundCount < MAX_PENDING_OUTBOUND;
}

// ---------------------------------------------------------------------------
// canAddBuddy
// ---------------------------------------------------------------------------

/**
 * Determine if a user can add a new buddy.
 *
 * Capped at MAX_BUDDIES accepted connections.
 *
 * @param currentBuddyCount - number of currently accepted buddies
 * @returns true if the user can add another buddy
 */
export function canAddBuddy(currentBuddyCount: number): boolean {
  return currentBuddyCount < MAX_BUDDIES;
}

// ---------------------------------------------------------------------------
// getStatusTransition
// ---------------------------------------------------------------------------

/** Valid buddy status values. */
type BuddyStatus = 'pending' | 'accepted' | 'blocked_by_a' | 'blocked_by_b' | 'removed';

/** Valid actions that can be taken on a buddy relationship. */
type BuddyAction = 'accept' | 'decline' | 'remove' | 'block';

/**
 * Enforce the buddy status state machine.
 *
 * Returns the next status given the current status, the action, and (for
 * block actions) which side is taking the action.
 *
 * Returns null for invalid transitions (e.g. trying to accept a removed buddy).
 *
 * Valid transitions:
 * - pending  + accept  => accepted
 * - pending  + decline => removed
 * - accepted + remove  => removed
 * - accepted + block   + side 'a' => blocked_by_a
 * - accepted + block   + side 'b' => blocked_by_b
 *
 * @param currentStatus - current buddy relationship status
 * @param action - action being taken
 * @param side - 'a' or 'b' (required for block actions)
 * @returns next status string, or null if the transition is invalid
 */
export function getStatusTransition(
  currentStatus: string,
  action: BuddyAction,
  side?: 'a' | 'b',
): BuddyStatus | null {
  if (currentStatus === 'pending') {
    if (action === 'accept') return 'accepted';
    if (action === 'decline') return 'removed';
  }

  if (currentStatus === 'accepted') {
    if (action === 'remove') return 'removed';
    if (action === 'block') {
      if (side === 'a') return 'blocked_by_a';
      if (side === 'b') return 'blocked_by_b';
    }
  }

  // All other combinations are invalid
  return null;
}

// ---------------------------------------------------------------------------
// isBlocked
// ---------------------------------------------------------------------------

/**
 * Determine if a buddy relationship is in a blocked state.
 *
 * Works regardless of which party initiated the block.
 *
 * @param status - buddy relationship status
 * @returns true if status is blocked_by_a or blocked_by_b
 */
export function isBlocked(status: string): boolean {
  return status.startsWith('blocked_by_');
}

// ---------------------------------------------------------------------------
// getBuddyId
// ---------------------------------------------------------------------------

/**
 * Get the other user's ID in a buddy pair.
 *
 * Buddy pairs store both user IDs (userA, userB). Given the current user's ID,
 * returns the ID of the other party.
 *
 * @param userA - the user_a column value from the buddies table
 * @param userB - the user_b column value from the buddies table
 * @param currentUserId - the authenticated user's ID
 * @returns the other user's ID
 */
export function getBuddyId(userA: string, userB: string, currentUserId: string): string {
  return currentUserId === userA ? userB : userA;
}

// ---------------------------------------------------------------------------
// getBlockerSide
// ---------------------------------------------------------------------------

/**
 * Determine which side ('a' or 'b') a given user occupies in the buddy pair.
 *
 * Used when blocking to determine which status value to write
 * (blocked_by_a vs blocked_by_b).
 *
 * @param userA - the user_a column value from the buddies table
 * @param userB - the user_b column value from the buddies table
 * @param blockerId - the ID of the user initiating the block
 * @returns 'a' if blocker is userA, 'b' if blocker is userB
 */
export function getBlockerSide(userA: string, userB: string, blockerId: string): 'a' | 'b' {
  return blockerId === userA ? 'a' : 'b';
}
