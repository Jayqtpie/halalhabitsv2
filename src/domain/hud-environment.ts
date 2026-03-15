/**
 * HUD Environment domain module.
 *
 * Pure TypeScript — no React imports. Maps player level to one of 4
 * environment zones that the Home HUD scene displays.
 *
 * Level thresholds:
 *   Levels 1-5   → Quiet Study (default start)
 *   Levels 6-11  → Growing Garden (~1 week consistent discipline)
 *   Levels 12-19 → Scholar's Courtyard (~3-4 weeks consistent)
 *   Level 20+    → Living Sanctuary (aspirational, month 2-3)
 */

export type EnvironmentId =
  | 'quiet_study'
  | 'growing_garden'
  | 'scholars_courtyard'
  | 'living_sanctuary';

/**
 * Return the EnvironmentId for a given player level.
 */
export function getEnvironmentForLevel(level: number): EnvironmentId {
  if (level >= 20) return 'living_sanctuary';
  if (level >= 12) return 'scholars_courtyard';
  if (level >= 6) return 'growing_garden';
  return 'quiet_study';
}

/**
 * Human-readable display names for each environment.
 */
export const ENVIRONMENT_NAMES: Record<EnvironmentId, string> = {
  quiet_study: 'Quiet Study',
  growing_garden: 'Growing Garden',
  scholars_courtyard: "Scholar's Courtyard",
  living_sanctuary: 'Living Sanctuary',
};

/**
 * Environment thresholds for detecting transitions (used by EnvironmentReveal).
 * Returns true if the level crosses an environment boundary.
 */
export function isEnvironmentTransition(fromLevel: number, toLevel: number): boolean {
  return getEnvironmentForLevel(fromLevel) !== getEnvironmentForLevel(toLevel);
}
