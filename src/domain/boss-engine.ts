/**
 * Boss Engine — Pure TypeScript domain logic for Nafs Boss Arena.
 * No React, no DB, no side effects.
 *
 * All functions operate on primitive values or plain objects.
 * Callers are responsible for passing correct values (level, timestamps, etc.).
 */

import type { ArchetypeId } from './boss-content';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailyLogEntry {
  day: number;
  date: string;
  habitsCompleted: number;
  totalHabits: number;
  damage: number;
  healing: number;
  hpAfter: number;
}

// ---------------------------------------------------------------------------
// canStartBattle
// ---------------------------------------------------------------------------

/**
 * Check if a player is eligible to start a boss battle.
 *
 * Rules:
 * - Player must be level 10 or above
 * - No active battle in progress
 * - Cooldown period must have expired since last battle
 */
export function canStartBattle(
  currentLevel: number,
  activeBattle: { status: string } | null,
  lastBattleEndedAt: string | null,
  now: string,
  cooldownDays: number,
): boolean {
  if (currentLevel < 10) return false;
  if (activeBattle?.status === 'active') return false;
  if (!lastBattleEndedAt) return true;
  const elapsed = new Date(now).getTime() - new Date(lastBattleEndedAt).getTime();
  return elapsed >= cooldownDays * 86400000;
}

// ---------------------------------------------------------------------------
// calculateBossMaxHp
// ---------------------------------------------------------------------------

/**
 * Calculate the maximum HP for a boss given the player's level at battle start.
 *
 * Formula: 100 + (playerLevel - 10) * 15
 * Level 10 -> 100 HP, Level 20 -> 250 HP, Level 30 -> 400 HP
 */
export function calculateBossMaxHp(playerLevel: number): number {
  return 100 + (playerLevel - 10) * 15;
}

// ---------------------------------------------------------------------------
// calculateBossXpReward
// ---------------------------------------------------------------------------

/**
 * Calculate the full XP reward for defeating a boss given the player's level.
 *
 * Scales from 200 to 500 XP, clamped at both ends.
 * Formula: clamp(200 + (playerLevel - 10) * 15, 200, 500)
 */
export function calculateBossXpReward(playerLevel: number): number {
  return Math.min(Math.max(200 + (playerLevel - 10) * 15, 200), 500);
}

// ---------------------------------------------------------------------------
// getMaxDays
// ---------------------------------------------------------------------------

/**
 * Get the maximum number of days allowed for a boss battle.
 *
 * Base 7 days. Reduces at higher levels for increased challenge.
 * Level 20+ -> 6 days, Level 30+ -> 5 days
 */
export function getMaxDays(playerLevel: number): number {
  return playerLevel >= 30 ? 5 : playerLevel >= 20 ? 6 : 7;
}

// ---------------------------------------------------------------------------
// calculateDailyDamage
// ---------------------------------------------------------------------------

/**
 * Calculate damage dealt to the boss today based on habit completion ratio.
 *
 * Formula: round(bossMaxHp * 0.20 * (habitsCompleted / totalHabits))
 * Max daily damage = 20% of boss HP (5 perfect days to win at minimum)
 * Returns 0 if totalHabits is 0 (guard against division by zero).
 */
export function calculateDailyDamage(
  habitsCompleted: number,
  totalHabits: number,
  bossMaxHp: number,
): number {
  if (totalHabits === 0) return 0;
  return Math.round(bossMaxHp * 0.20 * (habitsCompleted / totalHabits));
}

// ---------------------------------------------------------------------------
// calculateDailyHealing
// ---------------------------------------------------------------------------

/**
 * Calculate how much HP the boss heals today from missed habits.
 *
 * Formula: round(bossMaxHp * 0.10 * (habitsMissed / totalHabits))
 * If mercyModeActive: healing is halved (more forgiving for struggling players)
 * Returns 0 if totalHabits is 0.
 */
export function calculateDailyHealing(
  habitsMissed: number,
  totalHabits: number,
  bossMaxHp: number,
  mercyModeActive: boolean,
): number {
  if (totalHabits === 0) return 0;
  let healing = Math.round(bossMaxHp * 0.10 * (habitsMissed / totalHabits));
  if (mercyModeActive) {
    healing = Math.round(healing * 0.5);
  }
  return healing;
}

// ---------------------------------------------------------------------------
// applyDailyOutcome
// ---------------------------------------------------------------------------

/**
 * Apply the day's damage and healing to the boss, clamped between 0 and bossMaxHp.
 *
 * Formula: clamp(currentHp - damage + healing, 0, bossMaxHp)
 */
export function applyDailyOutcome(
  currentHp: number,
  bossMaxHp: number,
  damage: number,
  healing: number,
): number {
  return Math.min(Math.max(currentHp - damage + healing, 0), bossMaxHp);
}

// ---------------------------------------------------------------------------
// calculatePartialXp
// ---------------------------------------------------------------------------

/**
 * Calculate partial XP earned when a battle ends before the boss is defeated.
 *
 * Rewards players proportional to the damage they dealt.
 * damageDealt = bossMaxHp - bossHp (current HP at escape)
 * partialXp = round(fullXpReward * (damageDealt / bossMaxHp))
 */
export function calculatePartialXp(
  fullXpReward: number,
  bossMaxHp: number,
  bossHp: number,
): number {
  const damageDealt = bossMaxHp - bossHp;
  return Math.round(fullXpReward * (damageDealt / bossMaxHp));
}

// ---------------------------------------------------------------------------
// getBossDialoguePhase
// ---------------------------------------------------------------------------

/**
 * Determine which dialogue phase to show based on current battle state.
 *
 * Priority order:
 * 1. defeated -> battle is over
 * 2. intro -> first day of battle
 * 3. player_winning -> boss HP ratio below 50%
 * 4. taunt -> otherwise (boss is healthy and taunting)
 */
export function getBossDialoguePhase(
  isFirstDay: boolean,
  bossHpRatio: number,
  battleStatus: 'active' | 'defeated' | 'escaped',
): 'intro' | 'taunt' | 'player_winning' | 'defeated' {
  if (battleStatus === 'defeated') return 'defeated';
  if (isFirstDay) return 'intro';
  if (bossHpRatio < 0.5) return 'player_winning';
  return 'taunt';
}

// ---------------------------------------------------------------------------
// suggestArchetype
// ---------------------------------------------------------------------------

/**
 * Suggest a boss archetype based on the player's habit completion history.
 *
 * Uses simple heuristics to map miss patterns to archetypes.
 * Returns 'procrastinator' as a safe fallback when no data is available.
 */
export function suggestArchetype(
  habitCompletionRates: Record<string, number>,
  recentMissPatterns: string[],
): ArchetypeId {
  // If no data, return the safe default
  if (
    Object.keys(habitCompletionRates).length === 0 &&
    recentMissPatterns.length === 0
  ) {
    return 'procrastinator';
  }

  // Calculate overall completion rate
  const rates = Object.values(habitCompletionRates);
  if (rates.length === 0) return 'procrastinator';

  const avgRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;

  // Very low completion overall -> procrastinator (delay pattern)
  if (avgRate < 0.3) return 'procrastinator';

  // High miss rate on morning habits -> distractor (attention fragmented early)
  const morningMisses = recentMissPatterns.filter(id => id.includes('morning') || id.includes('fajr')).length;
  if (morningMisses > recentMissPatterns.length * 0.5 && recentMissPatterns.length > 0) {
    return 'distractor';
  }

  // Medium-low rates -> doubter (inconsistency from self-doubt)
  if (avgRate < 0.5) return 'doubter';

  // Default fallback
  return 'procrastinator';
}
