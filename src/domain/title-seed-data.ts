/**
 * Title seed data -- All 26 Identity Titles from the blueprint.
 *
 * Source: blueprint/04-worldbuilding.md (Identity Titles section)
 *
 * Distribution:
 * - Common (10 titles, sortOrder 1-10): Achievable in first 1-2 weeks
 * - Rare (10 titles, sortOrder 11-20): Achievable in 1-3 months
 * - Legendary (6 titles, sortOrder 21-26): Achievable in 3+ months
 *
 * No React, no DB, no side effects.
 */

export interface TitleSeedEntry {
  /** Kebab-case slug used as ID */
  id: string;
  /** Display name */
  name: string;
  /** Rarity tier */
  rarity: 'common' | 'rare' | 'legendary';
  /** How this title is unlocked */
  unlockType:
    | 'onboarding'
    | 'total_completions'
    | 'habit_type_streak'
    | 'habit_streak'
    | 'level_reach'
    | 'quest_completions'
    | 'mercy_recoveries'
    | 'simultaneous_streaks'
    | 'muhasabah_streak'
    | 'habit_count'
    | 'detox_completions'
    | 'boss_defeats';
  /** Threshold value for the unlock condition */
  unlockValue: number;
  /**
   * Specific habit type required (for habit_type_streak unlocks).
   * null when not habit-type-specific.
   */
  unlockHabitType: string | null;
  /** Wise mentor voice copy displayed on unlock */
  flavorText: string;
  /** Sort order for display (1-26, grouped by rarity) */
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Common Titles (1-10) -- Achievable in first 1-2 weeks
// ---------------------------------------------------------------------------

const COMMON_TITLES: TitleSeedEntry[] = [
  {
    id: 'the-beginner',
    name: 'The Beginner',
    rarity: 'common',
    unlockType: 'onboarding',
    unlockValue: 1,
    unlockHabitType: null,
    flavorText: 'Every journey of a thousand miles begins with a single step.',
    sortOrder: 1,
  },
  {
    id: 'the-willing',
    name: 'The Willing',
    rarity: 'common',
    unlockType: 'total_completions',
    unlockValue: 1,
    unlockHabitType: null,
    flavorText: 'The intention has become action. This is where discipline begins.',
    sortOrder: 2,
  },
  {
    id: 'the-early-riser',
    name: 'The Early Riser',
    rarity: 'common',
    unlockType: 'habit_type_streak',
    unlockValue: 3,
    unlockHabitType: 'salah_fajr',
    flavorText: 'You chose dawn over comfort. Your discipline is stirring.',
    sortOrder: 3,
  },
  {
    id: 'the-reciter',
    name: 'The Reciter',
    rarity: 'common',
    unlockType: 'habit_type_streak',
    unlockValue: 3,
    unlockHabitType: 'quran',
    flavorText: 'The words find a home in the one who returns to them.',
    sortOrder: 4,
  },
  {
    id: 'the-rememberer',
    name: 'The Rememberer',
    rarity: 'common',
    unlockType: 'habit_type_streak',
    unlockValue: 5,
    unlockHabitType: 'dhikr',
    flavorText: 'Remembrance is the quiet foundation of a disciplined heart.',
    sortOrder: 5,
  },
  {
    id: 'the-seeker',
    name: 'The Seeker',
    rarity: 'common',
    unlockType: 'quest_completions',
    unlockValue: 5,
    unlockHabitType: null,
    flavorText: 'Curiosity and discipline walk the same road.',
    sortOrder: 6,
  },
  {
    id: 'the-reflector',
    name: 'The Reflector',
    rarity: 'common',
    unlockType: 'muhasabah_streak',
    unlockValue: 3,
    unlockHabitType: null,
    flavorText: 'The one who examines their day has already begun to improve it.',
    sortOrder: 7,
  },
  {
    id: 'the-builder',
    name: 'The Builder',
    rarity: 'common',
    unlockType: 'level_reach',
    unlockValue: 5,
    unlockHabitType: null,
    flavorText: 'The foundation is set. Now build.',
    sortOrder: 8,
  },
  {
    id: 'the-consistent',
    name: 'The Consistent',
    rarity: 'common',
    unlockType: 'habit_streak',
    unlockValue: 7,
    unlockHabitType: null,
    flavorText: 'Seven days of showing up. The habit is taking root.',
    sortOrder: 9,
  },
  {
    id: 'the-forged',
    name: 'The Forged',
    rarity: 'common',
    unlockType: 'habit_count',
    unlockValue: 3,
    unlockHabitType: null,
    flavorText: 'Your discipline is not accidental. You chose this path.',
    sortOrder: 10,
  },
];

// ---------------------------------------------------------------------------
// Rare Titles (11-20) -- Achievable in 1-3 months
// ---------------------------------------------------------------------------

const RARE_TITLES: TitleSeedEntry[] = [
  {
    id: 'the-steadfast',
    name: 'The Steadfast (Al-Sabir)',
    rarity: 'rare',
    unlockType: 'habit_type_streak',
    unlockValue: 40,
    unlockHabitType: 'salah_fajr',
    flavorText: 'Forty dawns. The sun rose and you rose with it. Steadfastness is yours.',
    sortOrder: 11,
  },
  {
    id: 'the-devoted-reader',
    name: 'The Devoted Reader',
    rarity: 'rare',
    unlockType: 'habit_type_streak',
    unlockValue: 30,
    unlockHabitType: 'quran',
    flavorText: 'A month of returning to the Book. The pages know your name.',
    sortOrder: 12,
  },
  {
    id: 'the-disciplined',
    name: 'The Disciplined',
    rarity: 'rare',
    unlockType: 'level_reach',
    unlockValue: 20,
    unlockHabitType: null,
    flavorText: 'Twenty levels of consistent effort. Your discipline speaks for itself.',
    sortOrder: 13,
  },
  {
    id: 'the-questmaster',
    name: 'The Questmaster',
    rarity: 'rare',
    unlockType: 'quest_completions',
    unlockValue: 50,
    unlockHabitType: null,
    flavorText: 'Fifty challenges accepted and conquered. The board respects your name.',
    sortOrder: 14,
  },
  {
    id: 'the-night-watchman',
    name: 'The Night Watchman (Qiyam al-Layl)',
    rarity: 'rare',
    unlockType: 'habit_type_streak',
    unlockValue: 15,
    unlockHabitType: 'tahajjud',
    flavorText: 'You seek the quiet hours when the world sleeps. That takes uncommon will.',
    sortOrder: 15,
  },
  {
    id: 'the-resilient',
    name: 'The Resilient',
    rarity: 'rare',
    unlockType: 'mercy_recoveries',
    unlockValue: 3,
    unlockHabitType: null,
    flavorText: 'Three falls, three returns. Resilience is not avoiding failure -- it is what comes after.',
    sortOrder: 16,
  },
  {
    id: 'the-fasting-warrior',
    name: 'The Fasting Warrior',
    rarity: 'rare',
    unlockType: 'habit_type_streak',
    unlockValue: 20,
    unlockHabitType: 'fasting',
    flavorText: 'Twenty fasts. Your body submits to your will, and your will submits to purpose.',
    sortOrder: 17,
  },
  {
    id: 'the-generous',
    name: 'The Generous (Al-Karim)',
    rarity: 'rare',
    unlockType: 'habit_type_streak',
    unlockValue: 25,
    unlockHabitType: 'sadaqah',
    flavorText: 'Generosity repeated becomes character. Your hands are learning to give.',
    sortOrder: 18,
  },
  {
    id: 'the-mindful',
    name: 'The Mindful',
    rarity: 'rare',
    unlockType: 'muhasabah_streak',
    unlockValue: 30,
    unlockHabitType: null,
    flavorText: 'Thirty nights of honest reflection. You know yourself better than most.',
    sortOrder: 19,
  },
  {
    id: 'the-all-rounder',
    name: 'The All-Rounder',
    rarity: 'rare',
    unlockType: 'simultaneous_streaks',
    unlockValue: 5,
    unlockHabitType: null,
    flavorText: 'Five disciplines, fourteen days, one consistent soul. Remarkable.',
    sortOrder: 20,
  },
  {
    id: 'the-unplugged',
    name: 'The Unplugged',
    rarity: 'rare',
    unlockType: 'detox_completions',
    unlockValue: 10,
    unlockHabitType: null,
    flavorText: 'Ten dungeons cleared. The noise no longer controls you.',
    sortOrder: 27,
  },
];

// ---------------------------------------------------------------------------
// Legendary Titles (21-26) -- Achievable in 3+ months
// ---------------------------------------------------------------------------

const LEGENDARY_TITLES: TitleSeedEntry[] = [
  {
    id: 'the-unbreakable',
    name: 'The Unbreakable',
    rarity: 'legendary',
    unlockType: 'habit_streak',
    unlockValue: 100,
    unlockHabitType: null,
    flavorText: 'One hundred days without breaking. Your word to yourself is iron.',
    sortOrder: 21,
  },
  {
    id: 'the-guardian-of-dawn',
    name: 'The Guardian of Dawn (Haaris al-Fajr)',
    rarity: 'legendary',
    unlockType: 'habit_type_streak',
    unlockValue: 100,
    unlockHabitType: 'salah_fajr',
    flavorText: 'One hundred dawns. You have become someone who rises. This is who you are now.',
    sortOrder: 22,
  },
  {
    id: 'the-scholar',
    name: 'The Scholar (Talib al-Ilm)',
    rarity: 'legendary',
    unlockType: 'level_reach',
    unlockValue: 50,
    unlockHabitType: null,
    flavorText: 'Fifty levels of accumulated discipline. You did not rush -- you endured.',
    sortOrder: 23,
  },
  {
    id: 'the-ascendant',
    name: 'The Ascendant',
    rarity: 'legendary',
    unlockType: 'level_reach',
    unlockValue: 75,
    unlockHabitType: null,
    flavorText: 'The heights are not for the talented. They are for the relentless.',
    sortOrder: 24,
  },
  {
    id: 'the-muhsin',
    name: 'The Muhsin (The Excellent)',
    rarity: 'legendary',
    unlockType: 'level_reach',
    unlockValue: 100,
    unlockHabitType: null,
    flavorText: 'The summit. Not because you were perfect, but because you never stopped climbing.',
    sortOrder: 25,
  },
  {
    id: 'the-fortress',
    name: 'The Fortress (Al-Husn)',
    rarity: 'legendary',
    unlockType: 'simultaneous_streaks',
    unlockValue: 5,
    unlockHabitType: null,
    flavorText: 'Five walls, ninety days each. You are a fortress of discipline.',
    sortOrder: 26,
  },
];

// ---------------------------------------------------------------------------
// Boss Arena Titles (28-30) -- Unlocked by defeating nafs boss archetypes
// ---------------------------------------------------------------------------

const BOSS_TITLES: TitleSeedEntry[] = [
  {
    id: 'the-challenger',
    name: 'The Challenger',
    rarity: 'rare',
    unlockType: 'boss_defeats',
    unlockValue: 1,
    unlockHabitType: null,
    flavorText: 'You faced the nafs and did not look away. That alone takes courage.',
    sortOrder: 28,
  },
  {
    id: 'the-warrior-of-nafs',
    name: 'The Warrior of Nafs',
    rarity: 'legendary',
    unlockType: 'boss_defeats',
    unlockValue: 3,
    unlockHabitType: null,
    flavorText: 'Three battles. Three victories. The nafs knows your name now, and it is afraid.',
    sortOrder: 29,
  },
  {
    id: 'the-conqueror-of-nafs',
    name: 'Conqueror of Nafs',
    rarity: 'legendary',
    unlockType: 'boss_defeats',
    unlockValue: 6,
    unlockHabitType: null,
    flavorText: 'All six nafs archetypes defeated. Your discipline is no longer in question.',
    sortOrder: 30,
  },
];

// ---------------------------------------------------------------------------
// Combined export (30 titles total: 10 common + 12 rare + 8 legendary)
// ---------------------------------------------------------------------------

export const TITLE_SEED_DATA: TitleSeedEntry[] = [
  ...COMMON_TITLES,
  ...RARE_TITLES,
  ...LEGENDARY_TITLES,
  ...BOSS_TITLES,
];
