# Phase 14: Nafs Boss Arena - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 14-nafs-boss-arena
**Areas discussed:** Battle entry & flow, Daily battle mechanics, Visual battle scene, Archetype roster & content

---

## Battle Entry & Flow

| Option | Description | Selected |
|--------|-------------|----------|
| HUD icon (like Detox) | A pixel-art arena gate/sword icon on the HUD, tapping opens a bottom sheet with archetype selection and battle controls | |
| Dedicated Arena screen | A full screen accessible from navigation with archetype gallery and battle history | |
| HUD icon + Arena screen | HUD icon shows active battle status; tapping opens full Arena screen with archetype gallery, lore, and battle history | :heavy_check_mark: |

**User's choice:** HUD icon + Arena screen
**Notes:** Best of both — quick status on HUD, full detail on dedicated screen

| Option | Description | Selected |
|--------|-------------|----------|
| Player chooses | Player browses all archetypes and picks which nafs to fight | |
| Suggested + override | App suggests based on habit patterns but player can override | :heavy_check_mark: |
| Random rotation | Archetypes rotate on a schedule | |

**User's choice:** Suggested + override
**Notes:** Personalized feel with full player control

| Option | Description | Selected |
|--------|-------------|----------|
| Full HUD theme swap | Entire game-world scene changes to battle arena aesthetic | :heavy_check_mark: |
| Subtle HUD overlay | Normal HUD with battle status bar/widget | |
| Boss icon + badge only | Arena icon shows active state, rest unchanged | |

**User's choice:** Full HUD theme swap
**Notes:** Mirrors detox dungeon pattern for consistency

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, independent | Both can be active, detox theme takes priority during overlap | :heavy_check_mark: |
| No, one at a time | Starting one pauses the other | |

**User's choice:** Yes, independent
**Notes:** Different timescales (days vs hours) make coexistence natural

---

## Daily Battle Mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| Percentage-based | Boss loses HP proportional to habits completed vs total habits | :heavy_check_mark: |
| Fixed per habit | Each habit completion deals fixed damage amount | |
| Threshold tiers | Damage in tiers based on completion percentage | |

**User's choice:** Percentage-based
**Notes:** Simple, scales with any habit count

| Option | Description | Selected |
|--------|-------------|----------|
| Boss heals HP | Missed habits cause boss HP to regenerate | :heavy_check_mark: |
| Boss deals 'damage' (extra days) | Missed days extend battle duration | |
| Reduced damage only | Missing means less damage, no active healing | |

**User's choice:** Boss heals HP
**Notes:** Clear consequence, boss can't exceed max HP

| Option | Description | Selected |
|--------|-------------|----------|
| Halve healing | Boss heals at 50% rate during Mercy Mode | :heavy_check_mark: |
| No healing, just reduced damage | Boss doesn't heal during Mercy Mode days | |
| Grace day | One free miss per battle with no counter-attack | |

**User's choice:** Halve healing
**Notes:** Meaningful reduction without removing consequence

| Option | Description | Selected |
|--------|-------------|----------|
| Boss escapes, partial XP | Battle ends, partial XP based on damage dealt | :heavy_check_mark: |
| Battle extends (max 10 days) | Continues up to hard cap | |
| Boss wins, no XP, cooldown | Lost battle, no reward | |

**User's choice:** Boss escapes, partial XP
**Notes:** Keeps experience positive, consistent with Mercy Mode philosophy

---

## Visual Battle Scene

| Option | Description | Selected |
|--------|-------------|----------|
| Full Skia battle scene | Skia canvas with boss sprite, HP bar, arena background, animations | :heavy_check_mark: |
| Card-based RPG layout | Modern mobile UI with boss card and pixel-art accents | |
| Bottom sheet (like Detox) | Boss battle in bottom sheet from HUD icon | |

**User's choice:** Full Skia battle scene
**Notes:** RPG-style layout, richest visual experience

| Option | Description | Selected |
|--------|-------------|----------|
| RPG text box | Classic pixel-art text box at bottom of Skia scene with typewriter animation | :heavy_check_mark: |
| Speech bubble overlay | Speech bubble from boss sprite as React Native overlay | |
| Toast/banner | Brief banner at top of screen | |

**User's choice:** RPG text box
**Notes:** Matches the 16-bit aesthetic perfectly

| Option | Description | Selected |
|--------|-------------|----------|
| Intro + daily + defeat | Boss speaks at battle start, daily when opening Arena, and on defeat | :heavy_check_mark: |
| Intro + defeat only | Boss speaks at start and defeat only | |
| Every interaction | Boss comments whenever Arena is opened | |

**User's choice:** Intro + daily + defeat
**Notes:** Maps to the 4 dialogue phases in content-pack (intro, taunt, player winning, defeated)

---

## Archetype Roster & Content

| Option | Description | Selected |
|--------|-------------|----------|
| Content Pack set (Perfectionist) | 5 archetypes from content-pack, all dialogue ready | |
| Worldbuilding set (Glutton) | 5 archetypes from worldbuilding, needs new Glutton dialogue | |
| Use all 6 | Both Glutton AND Perfectionist for 6 total archetypes | :heavy_check_mark: |

**User's choice:** Use all 6
**Notes:** More variety, needs 4 new dialogue strings for The Glutton

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, tiered difficulty | Each archetype has fixed difficulty rating and XP reward | |
| All equal difficulty | All bosses same HP and XP | |
| Scaling with player level | Difficulty and XP scale with player level at battle start | :heavy_check_mark: |

**User's choice:** Scaling with player level
**Notes:** Always challenging regardless of when player fights

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate re-challenge | Start new battle right after one ends | |
| 3-day cooldown | Short rest between battles | :heavy_check_mark: |
| Weekly cooldown | One battle per week maximum | |

**User's choice:** 3-day cooldown
**Notes:** Prevents grinding, gives streaks time to recover

| Option | Description | Selected |
|--------|-------------|----------|
| One title per archetype | 6 new titles, one per boss | |
| Single 'Boss Slayer' title | One title progressing with total defeats | |
| Tiered boss title | One title with progression tiers (Challenger/Warrior/Conqueror of Nafs) | :heavy_check_mark: |

**User's choice:** Tiered boss title
**Notes:** Progressive accomplishment across the whole system

---

## Claude's Discretion

- Boss HP formula and level-based scaling curve
- Daily damage/healing percentage math
- Arena screen Skia scene composition and layout
- Boss sprite visuals and animation effects
- HUD battle theme palette
- Archetype suggestion algorithm
- RPG text box styling and typewriter speed
- Partial XP rounding, cooldown UI
- Tiered title thresholds
- The Glutton's 4 dialogue strings

## Deferred Ideas

None -- discussion stayed within phase scope
