# Phase 14: Nafs Boss Arena - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Players at Level 10+ can battle personified nafs struggles in multi-day boss fights. 6 archetypes, each with unique dialogue, deal damage through daily habit completions and receive counter-attacks for missed habits. Battles last 5-7 days, award scaling XP (200-500), and contribute toward a tiered boss Identity Title. From ROADMAP.md: BOSS-01 through BOSS-08.

</domain>

<decisions>
## Implementation Decisions

### Battle Entry & Navigation
- **D-01:** HUD icon (pixel-art arena gate/sword) + dedicated Arena screen. HUD icon shows active battle status and quick actions; tapping opens a full Arena screen with archetype gallery, lore, and battle history
- **D-02:** App suggests an archetype based on player's habit patterns (e.g., many missed deadlines -> Procrastinator) but player can override and choose any archetype
- **D-03:** During an active battle, full HUD theme swap to a battle arena aesthetic (dark tones, boss silhouette in background, battle-themed elements) — mirrors the detox dungeon pattern
- **D-04:** Boss battles and detox sessions can coexist. They operate on different timescales (days vs hours). When both active, detox dungeon theme takes visual priority; boss arena theme returns when detox ends

### Daily Battle Mechanics
- **D-05:** Percentage-based damage — each day, boss loses HP proportional to habits completed vs total habits. Complete all habits = maximum daily damage
- **D-06:** Counter-attacks heal boss HP — missed habits cause boss HP to regenerate (proportional to misses). Boss cannot exceed max HP
- **D-07:** Mercy Mode halves boss healing rate — when Mercy Mode is active, counter-attack healing is reduced by 50%
- **D-08:** If player doesn't defeat boss within the battle window, boss escapes with partial XP awarded based on damage dealt (e.g., dealt 60% damage = 60% of reward XP). No shame. Can challenge again later

### Visual Battle Scene
- **D-09:** Full Skia canvas battle scene on the Arena screen — boss character sprite, animated HP bar, arena background, and hit/counter-attack animations. RPG-style layout
- **D-10:** Boss dialogue presented via classic RPG text box at the bottom of the Skia scene with typewriter text animation. Matches the 16-bit aesthetic
- **D-11:** Boss dialogue pacing: intro (battle start), daily taunt (one line when opening Arena each day — taunt or "player winning" based on HP), and defeat message. Maps to the 4 dialogue phases in content-pack

### Archetype Roster & Content
- **D-12:** 6 archetypes total — The Procrastinator (Al-Musawwif), The Distractor (Al-Mulhi), The Doubter (Al-Mushakkik), The Glutton (Al-Sharah), The Comparer (Al-Muqarin), The Perfectionist. Combines worldbuilding + content-pack rosters
- **D-13:** 4 new dialogue strings needed for The Glutton (intro, taunt, player winning, defeated) — matching content-pack format and adab safety rails
- **D-14:** Boss difficulty and XP scale with player level at battle start. Higher level = tougher boss (more HP) = more XP reward (200-500 range). Always challenging regardless of when you fight
- **D-15:** 3-day cooldown between battles — prevents boss-grinding and gives habit streaks time to recover
- **D-16:** Tiered boss Identity Title — one title with progression: defeat 1 boss = "Challenger", 3 = "Warrior", all 6 = "Conqueror of Nafs". Progressive accomplishment across the whole boss system

### Claude's Discretion
- Boss HP formula and scaling curve (exact numbers for level-based scaling)
- Daily damage calculation specifics (percentage-to-HP math)
- Counter-attack healing percentage per missed habit
- Arena screen layout and Skia scene composition
- Boss sprite visual design and animation specifics
- HUD battle theme palette and elements
- Archetype suggestion algorithm (which habit patterns map to which boss)
- RPG text box styling and typewriter animation speed
- Hit/counter-attack animation effects
- Partial XP rounding on boss escape
- Cooldown timer UI presentation
- Tiered title unlock thresholds (how many defeats per tier)
- The Glutton dialogue content (following content-pack tone)
- Arena screen navigation (how it connects to existing nav structure)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Boss Archetypes & Lore
- `blueprint/04-worldbuilding.md` lines 147-166 — Enemy and Boss Archetypes section with full lore descriptions for 5 archetypes (Procrastinator, Distractor, Doubter, Glutton, Comparer)

### Boss Dialogue Content
- `blueprint/15-content-pack.md` lines 153-202 — Section 3: Boss Encounter Messages (20 pre-written strings for 5 archetypes: Procrastinator, Distractor, Doubter, Perfectionist, Comparer)

### Boss Economy & Mechanics
- `blueprint/03-game-design-bible.md` lines 428-432 — Boss Progression economy spec (200-500 XP, multi-day turn-based, unlock thresholds)
- `blueprint/05-feature-systems.md` lines 433-437 — Nafs Boss Arena feature system overview

### Existing Schema & Types
- `src/db/schema.ts` lines 235-251 — boss_battles table definition (archetype, bossHp, bossMaxHp, currentDay, maxDays, dailyLog, status, mercyMode, startedAt, endedAt)
- `src/types/database.ts` lines 84-85 — BossBattle and NewBossBattle types (inferred from schema)
- `src/types/common.ts` line 43 — `boss_defeat` XP source type
- `src/services/privacy-gate.ts` line 29 — boss_battles classified as PRIVATE (never synced)

### Patterns to Follow
- `src/domain/detox-engine.ts` — Pure TypeScript domain engine pattern (no React, no DB, no side effects)
- `src/stores/detoxStore.ts` — Store without persist middleware (data lives in SQLite)
- `src/domain/title-seed-data.ts` — Title seed data format for adding tiered boss title
- `src/stores/gameStore.ts` — Game orchestration pattern (awardXP -> checkTitles -> pendingCelebrations)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **detox-engine.ts pattern:** Pure TypeScript domain engine — boss-engine.ts should follow same structure (no React, no DB, fully unit-testable)
- **detoxStore.ts pattern:** Zustand store without persist middleware — bossStore should follow same pattern (data in SQLite via repo layer)
- **gameStore.ts orchestration:** awardXP/checkTitles/pendingCelebrations pipeline — boss defeat hooks into this existing flow
- **title-engine.ts + title-seed-data.ts:** Title system ready for new tiered boss title entry
- **hud-environment.ts:** HUD environment/theme system — boss battle theme extends this
- **DungeonSheet/DetoxCountdownTimer:** Bottom sheet + timer components as reference patterns for Arena UI

### Established Patterns
- Domain engines are pure TypeScript functions, no React imports
- Stores use Zustand without persist, SQLite repos handle persistence
- Privacy Gate enforces PRIVATE classification on boss_battles (no sync)
- XP sources are typed in common.ts — `boss_defeat` already defined
- Celebrations queue via gameStore.pendingCelebrations for level-ups and title unlocks

### Integration Points
- **gameStore:** Boss defeat XP flows through existing awardXP pipeline
- **habitStore:** Daily habit completion counts feed boss damage calculation
- **settingsStore:** Mercy Mode state read for counter-attack reduction
- **HUD scene (Skia canvas):** Boss battle theme overlays/replaces normal environment
- **Navigation:** Arena screen needs route in Expo Router
- **title-seed-data.ts:** New tiered boss title entries added

</code_context>

<specifics>
## Specific Ideas

- Full HUD theme swap during active battle mirrors the detox dungeon pattern — creates a distinct "you're in a fight" atmosphere
- RPG text box with typewriter animation for boss dialogue is a strong 16-bit aesthetic choice — should feel like a classic SNES boss encounter
- Archetype suggestion based on habit patterns adds personalization but player retains full control
- The 6th archetype (Glutton from worldbuilding) rounds out the roster — needs 4 new dialogue strings written in the same reverent tone as existing content
- Coexistence with detox sessions is important — players shouldn't have to choose between a multi-day boss fight and a few-hour detox session
- Partial XP on boss escape keeps the experience positive — every battle attempt has value, consistent with Mercy Mode philosophy

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-nafs-boss-arena*
*Context gathered: 2026-03-23*
