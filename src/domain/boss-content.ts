/**
 * Boss Content — Archetype data for Nafs Boss Arena.
 *
 * No React, no DB, no side effects. Pure data module.
 *
 * 6 boss archetypes representing internal spiritual struggles (nafs).
 * Tone: respectful, adab-safe — these are parts of the self every believer wrestles with.
 * All dialogue strings sourced from blueprint/15-content-pack.md.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ArchetypeId =
  | 'procrastinator'
  | 'distractor'
  | 'doubter'
  | 'glutton'
  | 'comparer'
  | 'perfectionist';

export interface BossDialogue {
  intro: string;
  taunt: string;
  playerWinning: string;
  defeated: string;
}

export interface BossArchetype {
  id: ArchetypeId;
  name: string;
  arabicName: string;
  lore: string;
  dialogue: BossDialogue;
}

// ---------------------------------------------------------------------------
// BOSS_ARCHETYPES
// ---------------------------------------------------------------------------

export const BOSS_ARCHETYPES: Record<ArchetypeId, BossArchetype> = {
  procrastinator: {
    id: 'procrastinator',
    name: 'The Procrastinator',
    arabicName: 'Al-Musawwif',
    lore:
      'A shapeless entity that grows larger the longer it is ignored, simply blocking the path forward and expanding to fill available space. Defeating it reveals that action alone dissolves procrastination.',
    dialogue: {
      intro:
        "Tomorrow seems like a better day, doesn't it? But tomorrow, I'll say the same thing. I always do.",
      taunt: 'Just five more minutes. Then five more after that. Time is my favorite weapon.',
      playerWinning:
        "Wait -- you're actually doing it now? That wasn't supposed to happen.",
      defeated: 'You chose action over delay. I have no power over the one who begins.',
    },
  },

  distractor: {
    id: 'distractor',
    name: 'The Distractor',
    arabicName: 'Al-Mulhi',
    lore:
      'A fast-moving, fragmented entity made of flickering screens and notification bells that splits into smaller copies when cornered. It represents the nafs that pulls attention away from what matters — the endless scroll, the next notification.',
    dialogue: {
      intro: 'Oh, you were about to start? Let me show you something interesting first...',
      taunt:
        "There's always something more exciting than discipline. Don't you want to check?",
      playerWinning:
        'How are you still focused? Most people would have looked away by now.',
      defeated: "Your attention held firm. I couldn't pull you away. Well done.",
    },
  },

  doubter: {
    id: 'doubter',
    name: 'The Doubter',
    arabicName: 'Al-Mushakkik',
    lore:
      "A mirror-like entity that reflects a distorted version of the player, whispering that you cannot maintain this and you will fail again. It does not deal damage directly — it debuffs confidence by showing exaggerated failures.",
    dialogue: {
      intro:
        "Does any of this really matter? You'll probably quit in a week anyway.",
      taunt: "Other people are better at this than you. Why bother competing?",
      playerWinning:
        "Still going? I thought for sure the doubt would stop you by now.",
      defeated:
        'Your actions silenced me. Doubt cannot survive in the face of consistency.',
    },
  },

  glutton: {
    id: 'glutton',
    name: 'The Glutton',
    arabicName: 'Al-Sharah',
    lore:
      "A creature of excess that hoards and consumes, growing heavier but more powerful. It represents the nafs that overindulges — too much food, too much entertainment, too much comfort. Discipline in moderation is the key to defeating it.",
    dialogue: {
      intro: "Why deny yourself? There's always more to consume. Comfort is your right.",
      taunt:
        'One more scroll. One more bite. One more hour. Moderation is for the weak.',
      playerWinning:
        'You chose enough over more? That discipline is rare.',
      defeated:
        'You found contentment in less. Excess has no hold on the disciplined.',
    },
  },

  comparer: {
    id: 'comparer',
    name: 'The Comparer',
    arabicName: 'Al-Muqarin',
    lore:
      "A twin entity that always appears as better than the player — higher level, shinier title, longer streak. It represents the nafs that measures self-worth by comparison, the spiritual poison of hasad (envy). It cannot be beaten by matching it — only by consistently completing your own goals.",
    dialogue: {
      intro: "Look at how disciplined everyone else is. You're so far behind.",
      taunt:
        "They started after you and they're already ahead. What does that say about you?",
      playerWinning:
        "Wait, you're not even looking at anyone else? That's... unexpected.",
      defeated: 'You ran your own race. Comparison lost its grip on you today.',
    },
  },

  perfectionist: {
    id: 'perfectionist',
    name: 'The Perfectionist',
    arabicName: 'Al-Kamali',
    lore:
      'An all-or-nothing entity that shatters progress at the first imperfection. It demands flawlessness and punishes any deviation. Defeating it means embracing imperfect consistency over paralysis.',
    dialogue: {
      intro:
        "If you can't do it perfectly, why do it at all? One missed day ruins everything.",
      taunt:
        "You already missed one. The streak is broken. Might as well stop entirely.",
      playerWinning:
        "You came back after a miss? That's not how all-or-nothing works.",
      defeated:
        "Imperfect progress defeated me. You chose 'good enough' over 'nothing at all.'",
    },
  },
};
