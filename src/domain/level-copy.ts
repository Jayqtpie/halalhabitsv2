/**
 * Level-up copy module -- Returns mentor voice copy for level-up celebrations.
 *
 * Milestone levels (5, 10, 20, 50) have locked strings from the blueprint.
 * All other levels return range-appropriate copy following the wise mentor voice:
 * encouraging, never boastful, reverent, and grounded.
 *
 * Source: 04-CONTEXT.md locked decisions + Claude's discretion for non-milestone levels.
 * No React, no DB, no side effects.
 */

/**
 * Returns the mentor voice copy for a level-up at the given level.
 *
 * @param level - The level the player just reached
 * @returns The copy string to display in the level-up celebration overlay
 */
export function getLevelUpCopy(level: number): string {
  // Milestone copy -- locked from CONTEXT.md
  if (level === 5) return 'Your discipline grows stronger.';
  if (level === 10) return 'A new horizon opens before you.';
  if (level === 20) return 'Consistency is becoming your nature.';
  if (level === 50) return 'Few have walked this far. MashaAllah.';

  // Range copy -- Claude's discretion, wise mentor voice
  if (level <= 3) return 'The journey has begun. Keep going.';
  if (level <= 7) return 'Momentum is building. You can feel it.';
  if (level <= 15) return 'Your path is becoming clear.';
  if (level <= 25) return 'Discipline is becoming habit.';
  if (level <= 40) return 'The effort compounds. Your consistency is remarkable.';
  if (level <= 75) return 'The mountain bows to the persistent.';
  return 'You walk where few dare to tread.';
}
