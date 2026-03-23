# Phase 14: Nafs Boss Arena - Research

**Researched:** 2026-03-23
**Domain:** Multi-day RPG boss battle system — Pure TypeScript domain engine, Zustand store, SQLite repo, Skia battle scene, Expo Router navigation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Battle Entry & Navigation**
- D-01: HUD icon (pixel-art arena gate/sword) + dedicated Arena screen. HUD icon shows active battle status and quick actions; tapping opens a full Arena screen with archetype gallery, lore, and battle history
- D-02: App suggests an archetype based on player's habit patterns (e.g., many missed deadlines -> Procrastinator) but player can override and choose any archetype
- D-03: During an active battle, full HUD theme swap to a battle arena aesthetic (dark tones, boss silhouette in background, battle-themed elements) — mirrors the detox dungeon pattern
- D-04: Boss battles and detox sessions can coexist. They operate on different timescales (days vs hours). When both active, detox dungeon theme takes visual priority; boss arena theme returns when detox ends

**Daily Battle Mechanics**
- D-05: Percentage-based damage — each day, boss loses HP proportional to habits completed vs total habits. Complete all habits = maximum daily damage
- D-06: Counter-attacks heal boss HP — missed habits cause boss HP to regenerate (proportional to misses). Boss cannot exceed max HP
- D-07: Mercy Mode halves boss healing rate — when Mercy Mode is active, counter-attack healing is reduced by 50%
- D-08: If player doesn't defeat boss within the battle window, boss escapes with partial XP awarded based on damage dealt (e.g., dealt 60% damage = 60% of reward XP). No shame. Can challenge again later

**Visual Battle Scene**
- D-09: Full Skia canvas battle scene on the Arena screen — boss character sprite, animated HP bar, arena background, and hit/counter-attack animations. RPG-style layout
- D-10: Boss dialogue presented via classic RPG text box at the bottom of the Skia scene with typewriter text animation. Matches the 16-bit aesthetic
- D-11: Boss dialogue pacing: intro (battle start), daily taunt (one line when opening Arena each day — taunt or "player winning" based on HP), and defeat message. Maps to the 4 dialogue phases in content-pack

**Archetype Roster & Content**
- D-12: 6 archetypes total — The Procrastinator (Al-Musawwif), The Distractor (Al-Mulhi), The Doubter (Al-Mushakkik), The Glutton (Al-Sharah), The Comparer (Al-Muqarin), The Perfectionist. Combines worldbuilding + content-pack rosters
- D-13: 4 new dialogue strings needed for The Glutton (intro, taunt, player winning, defeated) — matching content-pack format and adab safety rails
- D-14: Boss difficulty and XP scale with player level at battle start. Higher level = tougher boss (more HP) = more XP reward (200-500 range). Always challenging regardless of when you fight
- D-15: 3-day cooldown between battles — prevents boss-grinding and gives habit streaks time to recover
- D-16: Tiered boss Identity Title — one title with progression: defeat 1 boss = "Challenger", 3 = "Warrior", all 6 = "Conqueror of Nafs". Progressive accomplishment across the whole boss system

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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BOSS-01 | User can initiate a boss battle at Level 10+ against one of 5 nafs archetypes | Level gate from gameStore.currentLevel; archetype selection flow; boss-engine.ts canStartBattle() |
| BOSS-02 | Boss battles last 5-7 days with HP that decreases from daily habit completions | dailyLog JSON column in boss_battles; boss-engine daily damage formula; wall-clock timestamp pattern from detox |
| BOSS-03 | Each boss archetype has unique dialogue (intro, taunt, player winning, defeated messages) | 20 strings in blueprint/15-content-pack.md + 4 new Glutton strings; boss-content.ts data file |
| BOSS-04 | Boss counter-attacks (HP heals) when user misses habits on active battle days | boss-engine healBoss(); called from habitStore.endOfDay or bossStore.processDailyReset |
| BOSS-05 | Defeating a boss awards 200-500 XP and contributes to boss-specific Identity Title | gameStore.awardXP('boss_defeat'); title-engine 'boss_defeats' unlock type (new); title-seed-data 3 tiered entries |
| BOSS-06 | Mercy Mode reduces boss counter-attack severity during active Mercy Mode | settingsStore.mercyModeActive read in boss-engine.healBoss(); 50% reduction per D-07 |
| BOSS-07 | Boss battle screen renders with Skia/Skottie animations (HP bar, hit effects, phase transitions) | Skia Canvas on ArenaScreen; FilterMode.Nearest for pixel art; Reanimated withTiming for HP bar; Reanimated or withRepeat for hit flash |
| BOSS-08 | Boss battle state persists across app kills and device restarts (SQLite wall-clock timestamps) | boss_battles table already exists in schema; bossRepo layer; bossStore.loadActiveBattle on app launch |
</phase_requirements>

---

## Summary

Phase 14 implements the Nafs Boss Arena — a multi-day RPG boss system where players battle personified nafs struggles through daily habit consistency. The system is architecturally identical to the Dopamine Detox Dungeon (Phase 13) at the structural level: a pure TypeScript domain engine, a Zustand store without persist, a SQLite repository, and a full-screen Skia scene. The key differences are that boss battles span days (not hours), damage is calculated from daily habit completion ratios, and the battle scene is a full RPG-style Arena screen (not a bottom sheet).

The SQLite schema is already in place (`boss_battles` table, `BossBattle` / `NewBossBattle` types, `boss_defeat` XP source). All Privacy Gate classifications are confirmed PRIVATE. The title system requires two additions: a new `boss_defeats` unlock type in title-engine.ts and three new tiered title entries in title-seed-data.ts (Challenger at 1 defeat, Warrior at 3, Conqueror of Nafs at 6). The title-engine's PlayerStats interface needs a `bossDefeats: number` field and a corresponding stat query in gameStore.checkTitles.

The visual layer uses Skia Canvas on the Arena screen for the boss sprite, animated HP bar, and hit effects — the same approach as the HUD scene. The HUD receives a new arena gate icon (parallel to DungeonDoorIcon) that shows active battle status and opens the Arena screen. The HUD theme swap during a boss battle follows the dungeon theme precedent exactly: conditional Skia layers and overlays driven by a boolean derived from bossStore state.

**Primary recommendation:** Model boss-engine.ts exactly on detox-engine.ts (pure functions, no React, no DB, dependency-injected inputs). Model bossStore.ts on detoxStore.ts (Zustand without persist, data in SQLite via bossRepo). The Arena screen is a full-screen tab or modal route, not a bottom sheet — it hosts its own Skia Canvas rather than reusing HudScene.

---

## Project Constraints (from CLAUDE.md)

- Adab Safety Rails (all 8 hard constraints apply — particularly no shame copy on boss escape, no spiritual judgment)
- Boss battles classified PRIVATE (confirmed in privacy-gate.ts line 29) — bossRepo MUST NEVER call assertSyncable or syncQueueRepo
- Architecture: Pure TypeScript domain engine (no React imports), Zustand without persist, SQLite via Drizzle, Skia + Reanimated, Expo Router
- Read ui-ux-pro-max skill before any Arena screen UI decisions
- XP is effort-based — boss defeat XP signals "you showed up", never spiritual quality
- No public boss leaderboards (riya risk)
- Dialogue copy must be reverent — all 4 Glutton strings must match the content-pack tone established in blueprint/15-content-pack.md

---

## Standard Stack

### Core (all already installed — zero new dependencies for this phase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @shopify/react-native-skia | Already installed | Skia Canvas for boss battle scene, HP bar, hit animations | Established HUD rendering engine; FilterMode.Nearest for pixel art |
| react-native-reanimated | Already installed | HP bar withTiming, hit flash withSequence, typewriter timing via setInterval (not worklet) | Reanimated v3 shared values drive all Skia animated props |
| zustand | Already installed | bossStore — boss lifecycle state | Pattern established by detoxStore, gameStore |
| drizzle-orm | Already installed | bossRepo — CRUD on boss_battles table | All repos use Drizzle; schema and types already defined |
| expo-router | Already installed | ArenaScreen route + HUD icon navigation | Existing router; Arena screen needs new route file |
| expo-haptics | Already installed | Hit/counter-attack haptic feedback | Used in gameStore quest completion; same pattern |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-notifications | Already installed | Optional: notify player that daily reset processed boss damage | Only if planner includes daily recap notification |

**Installation:** No new packages required for Phase 14.

**Version verification:** All packages are existing project dependencies — versions confirmed from node_modules already present.

---

## Architecture Patterns

### Domain Layer: boss-engine.ts

Follows detox-engine.ts exactly: pure TypeScript, no React imports, no DB, no side effects. All functions receive primitive values or plain objects; callers provide boundary values.

**Key functions to implement:**

```typescript
// Source: mirrors detox-engine.ts structure

/** Check if player is eligible to start a boss battle */
export function canStartBattle(
  currentLevel: number,          // must be >= 10
  activeBattle: { status: string } | null,
  lastBattleEndedAt: string | null,
  now: string,                   // ISO timestamp injected by caller
  cooldownDays: number,          // 3, injected so it's testable
): boolean

/** Calculate max HP for a boss given player level at battle start */
export function calculateBossMaxHp(playerLevel: number): number
// Example curve: base 100 + (playerLevel - 10) * 15
// Level 10 -> 100 HP, Level 20 -> 250 HP, Level 30 -> 400 HP

/** Calculate full-day XP reward given player level */
export function calculateBossXpReward(playerLevel: number): number
// Scales 200-500 range: clamp(200 + (playerLevel - 10) * 15, 200, 500)

/** Calculate damage dealt today based on completion ratio */
export function calculateDailyDamage(
  habitsCompleted: number,
  totalHabits: number,
  bossMaxHp: number,
): number
// damage = round(bossMaxHp * 0.20 * (habitsCompleted / totalHabits))
// Max daily damage = 20% of boss HP (5 perfect days to win at minimum)

/** Calculate healing from missed habits */
export function calculateDailyHealing(
  habitsMissed: number,
  totalHabits: number,
  bossMaxHp: number,
  mercyModeActive: boolean,
): number
// healing = round(bossMaxHp * 0.10 * (habitsMissed / totalHabits))
// If mercyModeActive: healing * 0.5
// Boss cannot heal above bossMaxHp

/** Apply daily outcome — returns updated HP */
export function applyDailyOutcome(
  currentHp: number,
  bossMaxHp: number,
  damage: number,
  healing: number,
): number
// newHp = clamp(currentHp - damage + healing, 0, bossMaxHp)

/** Calculate partial XP on boss escape */
export function calculatePartialXp(
  fullXpReward: number,
  bossMaxHp: number,
  bossHp: number,       // current HP at time of escape
): number
// damageDealt = bossMaxHp - bossHp
// fraction = damageDealt / bossMaxHp
// partialXp = round(fullXpReward * fraction)

/** Determine which dialogue phase to show */
export function getBossDialoguePhase(
  isFirstDay: boolean,
  bossHpRatio: number,  // bossHp / bossMaxHp
  battleStatus: 'active' | 'defeated' | 'escaped',
): 'intro' | 'taunt' | 'player_winning' | 'defeated'
// intro -> isFirstDay
// defeated -> battleStatus === 'defeated'
// player_winning -> bossHpRatio < 0.5
// taunt -> otherwise

/** Suggest archetype based on habit completion history */
export function suggestArchetype(
  habitCompletionRates: Record<string, number>, // habitId -> rate (0-1)
  recentMissPatterns: string[],                 // recent habit IDs that missed most
): ArchetypeId
```

### Repository Layer: bossRepo.ts

Follows detoxRepo.ts exactly. NEVER imports assertSyncable or syncQueueRepo — boss_battles is PRIVATE.

**Required methods:**

```typescript
export const bossRepo = {
  // Create a new boss battle record
  create(data: NewBossBattle): Promise<BossBattle[]>

  // Get the active battle for a user (status='active')
  getActiveBattle(userId: string): Promise<BossBattle | null>

  // Get the most recent completed/escaped battle (for cooldown check)
  getLastBattle(userId: string): Promise<BossBattle | null>

  // Get all battles for a user (battle history / archetype gallery)
  getAllBattles(userId: string): Promise<BossBattle[]>

  // Update HP, currentDay, and dailyLog after each daily outcome
  updateDailyOutcome(
    id: string,
    bossHp: number,
    currentDay: number,
    dailyLog: string,  // JSON serialized DailyLogEntry[]
    updatedAt: string,
  ): Promise<BossBattle[]>

  // Mark battle as defeated
  defeat(id: string, endedAt: string): Promise<BossBattle[]>

  // Mark battle as escaped (boss window closed)
  escape(id: string, endedAt: string): Promise<BossBattle[]>

  // Count total defeated battles for title system
  getDefeatedCount(userId: string): Promise<number>

  // Count unique archetypes defeated (for Conqueror of Nafs title)
  getDefeatedArchetypes(userId: string): Promise<string[]>
}
```

### Store Layer: bossStore.ts

Follows detoxStore.ts exactly — no persist middleware, data lives in SQLite.

**Store interface:**

```typescript
interface BossState {
  activeBattle: BossBattle | null;
  loading: boolean;

  loadActiveBattle: (userId: string) => Promise<void>;
  startBattle: (archetype: ArchetypeId, playerLevel: number, userId: string) => Promise<boolean>;
  processDailyOutcome: (userId: string, habitsCompleted: number, totalHabits: number) => Promise<void>;
  endBattle: (userId: string) => Promise<void>; // check defeat or escape
  canStart: (userId: string) => Promise<boolean>;
  getSuggestedArchetype: (userId: string) => Promise<ArchetypeId>;
}
```

**Key orchestration in startBattle:**
1. Check level gate (currentLevel >= 10) from gameStore
2. Check cooldown via bossRepo.getLastBattle + canStartBattle()
3. Calculate bossMaxHp via calculateBossMaxHp(playerLevel)
4. Calculate fullXpReward via calculateBossXpReward(playerLevel)
5. Write to bossRepo.create()
6. Update bossStore state

**Key orchestration in processDailyOutcome (called when day changes during active battle):**
1. Get today's habit completion count from habitStore/habitRepo
2. Calculate damage and healing via boss-engine
3. Apply outcome via applyDailyOutcome
4. Update DB via bossRepo.updateDailyOutcome (append to dailyLog JSON)
5. Check if boss HP <= 0 → call defeat flow
6. Check if currentDay >= maxDays → call escape flow

**defeat flow:**
1. bossRepo.defeat()
2. gameStore.awardXP(userId, fullXpReward, 1.0, 'boss_defeat', battleId)
3. gameStore.checkTitles(userId)
4. set({ activeBattle: null })

**escape flow:**
1. Calculate partialXp via calculatePartialXp
2. bossRepo.escape()
3. gameStore.awardXP(userId, partialXp, 1.0, 'boss_defeat', battleId) — same source type, partial amount
4. set({ activeBattle: null })

### Content Layer: boss-content.ts

Data-only file — no logic, no React. Maps archetype IDs to dialogue strings and lore.

```typescript
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
  name: string;          // e.g., "The Procrastinator"
  arabicName: string;    // e.g., "Al-Musawwif"
  lore: string;          // from blueprint/04-worldbuilding.md
  dialogue: BossDialogue;
  habitPatterns: string[]; // habit IDs/types that map to this archetype for suggestion
}

export const BOSS_ARCHETYPES: Record<ArchetypeId, BossArchetype> = { ... }
```

Source for dialogue strings: blueprint/15-content-pack.md lines 153-202 (20 pre-written strings covering 5 archetypes). The Glutton needs 4 new strings (D-13). The Perfectionist strings are already in the content pack.

### Title System Extension

**New unlock type:** `boss_defeats` — needs to be added to:
1. `TitleCondition.unlockType` union in title-engine.ts
2. `TitleSeedEntry.unlockType` union in title-seed-data.ts
3. `isTitleUnlocked` switch in title-engine.ts
4. `PlayerStats.bossDefeats: number` in title-engine.ts
5. `gameStore.checkTitles` — add `bossRepo.getDefeatedCount(userId)` query

**Three new title entries** (sortOrder 28, 29, 30 — appended after The Unplugged at 27):

```typescript
// Challenger — defeat 1 boss
{
  id: 'the-challenger',
  name: 'The Challenger',
  rarity: 'rare',
  unlockType: 'boss_defeats',
  unlockValue: 1,
  unlockHabitType: null,
  flavorText: 'You faced the nafs and did not look away. That alone takes courage.',
  sortOrder: 28,
}

// Warrior — defeat 3 bosses
{
  id: 'the-warrior',
  name: 'The Warrior of Nafs',
  rarity: 'legendary',
  unlockType: 'boss_defeats',
  unlockValue: 3,
  unlockHabitType: null,
  flavorText: 'Three battles. Three victories. The nafs knows your name now, and it is afraid.',
  sortOrder: 29,
}

// Conqueror of Nafs — defeat all 6
{
  id: 'the-conqueror-of-nafs',
  name: 'Conqueror of Nafs',
  rarity: 'legendary',
  unlockType: 'boss_defeats',
  unlockValue: 6,
  unlockHabitType: null,
  flavorText: 'All six nafs archetypes defeated. Your discipline is no longer in question.',
  sortOrder: 30,
}
```

### Navigation: ArenaScreen Route

Arena is a full screen — not a bottom sheet. Options:

1. **New tab route** (`app/(tabs)/arena.tsx`): Adds a 5th tab. Not preferred — current tab bar has 4 tabs and adding a 5th clutters the nav.
2. **Modal route** (`app/arena.tsx`): Pushed via `router.push('/arena')` from HUD icon. Renders full-screen with back navigation. This is the standard Expo Router pattern for full-screen overlays.
3. **Stack route**: Same as modal but slides in. Both work.

**Recommendation (Claude's discretion):** Modal route at `app/arena.tsx`. The Arena icon on the HUD calls `router.push('/arena')`. The Arena screen manages its own Skia Canvas for the battle scene. This avoids cluttering the tab bar and keeps the "entering a different space" feel.

### HUD Integration: ArenaGateIcon component

Follows DungeonDoorIcon pattern exactly:

- Rendered as RN View sibling outside Canvas (Canvas cannot host RN views)
- Positioned absolute, top-left corner of HUD (DungeonDoorIcon is top-right)
- Shows battle status: idle (static glow), active (pulse animation), cooldown (dimmed)
- Tapping opens Arena screen via router.push('/arena')
- HUD theme swap (D-03): bossActive boolean drives additional Skia layers in HudScene, identical to dungeonActive pattern
- Coexistence (D-04): dungeonActive takes theme priority; boss theme renders when dungeonActive is false

**HudScene additions:**
```typescript
// Conditional arena theme layers (added after existing dungeon layers)
// Boss arena palette: deep navy/crimson instead of dungeon stone/amber
const ARENA_DARK_TINT = 'rgba(10, 10, 30, 0.35)';   // deep navy overlay
const ARENA_CRIMSON   = '#8B1A1A';                    // boss energy color

// Active condition: bossActive && !dungeonActive
// Layers added to Canvas: arena tint rect + crimson accent rects (pillars or energy lines)
```

### Skia Battle Scene (ArenaScreen)

The Arena screen hosts its own Skia Canvas — it does NOT reuse HudScene. This Canvas is the boss battle scene:

```
Canvas layout (RPG vertical split):
┌─────────────────────────────────────────┐
│  Arena background PNG (dark arena art)  │
│                                         │
│  Boss sprite (center, large)            │
│  Boss HP bar (below sprite)             │
│  HP bar fill animated with withTiming   │
│                                         │
│  Hit flash overlay (opacity pulse)      │
│                                         │
│  [Day indicator] [Battle status]        │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ RPG TEXT BOX                        │ │
│ │ "Tomorrow seems like a better day,  │ │
│ │  doesn't it? But tomorrow..."       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

RN Views overlaid on Canvas (outside Canvas, absolute positioned):
- Archetype name and Arabic name (Text)
- HP fraction text ("78 / 100 HP")
- CTA button ("Complete Today's Battle" or day status)
- Close/back button

**HP bar animation pattern:**
```typescript
// On Arena screen mount or HP update:
const hpBarWidth = useSharedValue(previousHpRatio * maxBarWidth);
useEffect(() => {
  hpBarWidth.value = withTiming(currentHpRatio * maxBarWidth, { duration: 800 });
}, [currentHpRatio]);
```

**Typewriter animation for dialogue:**
```typescript
// State-based setInterval — NOT Reanimated (matches detox XP count-up pattern)
// Text children cannot use worklet values
const [displayedText, setDisplayedText] = useState('');
useEffect(() => {
  let i = 0;
  const interval = setInterval(() => {
    setDisplayedText(fullText.slice(0, i + 1));
    i++;
    if (i >= fullText.length) clearInterval(interval);
  }, 35); // ~35ms per char = ~100 chars in 3.5 seconds
  return () => clearInterval(interval);
}, [fullText]);
```

**Hit flash animation:**
```typescript
// withSequence for snap-then-fade hit effect
hitOpacity.value = withSequence(
  withTiming(0.7, { duration: 50 }),  // flash in
  withTiming(0.0, { duration: 300 }), // fade out
);
```

### Archetype Gallery (idle state of Arena screen)

When no battle is active, ArenaScreen shows:
1. Archetype cards (6 cards, scrollable horizontal list)
2. Suggested archetype highlighted (from suggestArchetype)
3. Each card: boss art placeholder, name, Arabic name, lore snippet, "Challenge" CTA
4. Recent battle history below (defeated checkmarks, escape icons)
5. Cooldown timer if applicable (D-15: 3-day cooldown)

### Daily Reset Timing

Boss battles span days, not hours. The daily damage/healing calculation must trigger once per calendar day. Options:

1. **On Arena screen open:** When player opens Arena, check if a new day has started since last update (compare `updatedAt` date vs today's date). If yes, process yesterday's outcome.
2. **On app foreground:** In bossStore.loadActiveBattle, check if date has advanced.
3. **Background task:** Not recommended — unreliable on iOS.

**Recommendation (Claude's discretion):** Option 1 + Option 2 combined — process daily outcome in `loadActiveBattle` (called on app launch) by comparing `updatedAt` date to today. This matches the detox pattern of detecting expired sessions in `loadActiveSession`. No background tasks needed.

```typescript
// In bossStore.loadActiveBattle:
const lastUpdate = new Date(battle.updatedAt);
const today = new Date();
const daysDiff = Math.floor((today - lastUpdate) / 86400000);
if (daysDiff >= 1 && battle.status === 'active') {
  // Process each missed day (if app was closed for multiple days)
  for (let d = 0; d < daysDiff; d++) {
    await processOneMissedDay(userId, battle);
  }
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Typewriter text animation | Custom character-by-character animator | `setInterval` + `useState` (already proven in detox XP count-up) | Worklet limitation: Text children cannot consume Reanimated shared values directly |
| HP bar animation | Raw JS interval updates | `useSharedValue` + `withTiming` driving Skia `Rect` width | Skia Rect accepts shared values directly — smooth 60fps without JS bridge per-tick |
| Boss state persistence | Custom serialization | Drizzle `boss_battles` table (already exists in schema.ts) | Table, types, and Privacy Gate classification already defined |
| Boss content data | Dynamic content generation | `boss-content.ts` static data file | Islamic content MUST be hand-curated; no AI generation; 24 strings already written in blueprint |
| Title unlock evaluation | Custom title condition checks | `checkTitleUnlocks` in title-engine.ts (extend, don't duplicate) | The engine handles all unlock types; adding `boss_defeats` type is a 3-line addition |
| Habit completion counts | Direct DB query in domain engine | habitStore bridge pattern (getHabitStoreState) | Domain engine stays pure; existing bridge pattern used in gameStore.checkTitles |

**Key insight:** The schema, types, Privacy Gate, and XP source type for boss battles were pre-built in Phase 11. Phase 14 builds on a foundation that is already in place.

---

## Common Pitfalls

### Pitfall 1: Canvas Text Children and Reanimated Worklets
**What goes wrong:** Typewriter animation written as `useAnimatedStyle` or worklet-driven `Text` crashes or shows empty text.
**Why it happens:** React Native Text components cannot directly consume Reanimated worklet-computed string values. Strings must be computed in JS thread state.
**How to avoid:** Use `useState` + `setInterval` for character-by-character reveal. This is already the established pattern (detox XP count-up uses `state-based setInterval` per STATE.md annotation).
**Warning signs:** If typewriter code uses `useAnimatedProps` on a Text component with string children.

### Pitfall 2: Daily Reset Race Condition
**What goes wrong:** If `processDailyOutcome` is called multiple times on the same calendar day (app opened twice), boss HP double-updates.
**Why it happens:** `loadActiveBattle` is called on every app launch. Without a guard, two foreground events on the same day each process an outcome.
**How to avoid:** Compare `battle.updatedAt` date (YYYY-MM-DD) to today before processing. Only process if date is strictly older than today. Write `updatedAt` atomically with the HP update in `bossRepo.updateDailyOutcome`.
**Warning signs:** Boss HP drops twice in one day.

### Pitfall 3: HP Exceeding bossMaxHp After Healing
**What goes wrong:** Counter-attack healing pushes bossHp above bossMaxHp.
**Why it happens:** D-06 says "boss cannot exceed max HP" but naive addition ignores the cap.
**How to avoid:** `applyDailyOutcome` must clamp: `newHp = clamp(currentHp - damage + healing, 0, bossMaxHp)`. Unit test this boundary.
**Warning signs:** Boss HP in dailyLog shows > bossMaxHp.

### Pitfall 4: Boss Battle Theme Competing with Dungeon Theme
**What goes wrong:** Both dungeon and boss themes activate simultaneously, stacking Skia layers unexpectedly.
**Why it happens:** HudScene checks `dungeonActive` and `bossActive` independently.
**How to avoid:** Per D-04, dungeon theme takes visual priority. The condition for arena theme is `bossActive && !dungeonActive`. HudScene must evaluate both stores and apply the correct theme layer stack — never both simultaneously.
**Warning signs:** Double dark overlay on HUD during coexistent sessions.

### Pitfall 5: title-seed-data Seeding Happens Once (idempotent guard)
**What goes wrong:** New title entries (Challenger, Warrior, Conqueror) don't appear for existing users who already ran `gameStore.loadGame` before Phase 14.
**Why it happens:** `titleRepo.count() === 0` guard only seeds on first run. After Phase 11, titles table already has 27 entries.
**How to avoid:** Change seeding strategy: seed each title individually using `INSERT OR IGNORE` (Drizzle's `.onConflictDoNothing()`) rather than skipping the whole seed if count > 0. OR add a migration step that inserts only the new IDs. The planner must address this — the existing idempotent guard by count will not insert the 3 new boss titles for existing installs.
**Warning signs:** Missing title entries in the titles table for users who ran the app before Phase 14.

### Pitfall 6: privacyGate and bossRepo Must Never Sync
**What goes wrong:** A developer imports `syncQueueRepo` or calls `assertSyncable` in bossRepo.
**Why it happens:** Copy-paste from a SYNCABLE repo (buddyRepo pattern from future Phase 15).
**How to avoid:** bossRepo must follow detoxRepo's pattern: no syncQueueRepo import, no assertSyncable call. Add a privacy invariant test (same pattern as `detoxRepo.test.ts`).
**Warning signs:** Sync queue contains boss_battle entries.

### Pitfall 7: Archetype Suggestion with Insufficient Habit Data
**What goes wrong:** `suggestArchetype` throws or returns a random archetype for new users with no completion history.
**Why it happens:** Completion rate data is empty for new users.
**How to avoid:** `suggestArchetype` must have a safe fallback default (return 'procrastinator' if no signal). Document that suggestion improves after 7+ days of data.
**Warning signs:** Crash on first Arena screen open for new players.

### Pitfall 8: dailyLog JSON Serialization
**What goes wrong:** dailyLog column (TEXT in SQLite) parsed incorrectly or grows unbounded.
**Why it happens:** dailyLog is stored as a JSON string (TEXT column). Direct concatenation instead of parse-then-push.
**How to avoid:** Always `JSON.parse(battle.dailyLog)` before appending, then `JSON.stringify` before writing. Max 7 entries (maxDays). Validate in bossRepo.
**Warning signs:** dailyLog is `"[object Object]"` or is a raw string instead of array.

---

## Code Examples

### boss-engine.ts — canStartBattle (pure function pattern)
```typescript
// Source: mirrors detox-engine.ts canStartSession
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
  const lastEnd = new Date(lastBattleEndedAt).getTime();
  const nowMs = new Date(now).getTime();
  const cooldownMs = cooldownDays * 86400000;
  return nowMs - lastEnd >= cooldownMs;
}
```

### bossRepo.ts — privacy invariant (same as detoxRepo)
```typescript
// Source: mirrors detoxRepo.ts
// NO import of syncQueueRepo
// NO call to assertSyncable
import { eq, and, desc, count } from 'drizzle-orm';
import { getDb } from '../client';
import { bossBattles } from '../schema';
import type { NewBossBattle } from '../../types/database';

export const bossRepo = {
  async create(data: NewBossBattle) {
    return getDb().insert(bossBattles).values(data).returning();
  },
  async getActiveBattle(userId: string) {
    const rows = await getDb()
      .select().from(bossBattles)
      .where(and(eq(bossBattles.userId, userId), eq(bossBattles.status, 'active')));
    return rows[0] ?? null;
  },
  // ... etc
}
```

### HudScene — arena theme integration (extends dungeon pattern)
```typescript
// Source: mirrors HudScene.tsx dungeonActive pattern
const activeBattle = useBossStore((s) => s.activeBattle);
const bossActive = activeBattle !== null && activeBattle.status === 'active';
const arenaThemeActive = bossActive && !dungeonActive; // D-04: dungeon takes priority

// In Canvas JSX (after dungeon layers):
{arenaThemeActive && (
  <Rect x={0} y={0} width={screenW} height={screenH} color={ARENA_DARK_TINT} />
)}
```

### title-engine.ts — adding boss_defeats case
```typescript
// Add to TitleCondition.unlockType union:
| 'boss_defeats'

// Add to PlayerStats interface:
bossDefeats: number;

// Add to isTitleUnlocked switch:
case 'boss_defeats':
  return stats.bossDefeats >= condition.unlockValue;
```

### DailyLog entry type
```typescript
interface DailyLogEntry {
  day: number;           // 1-7
  date: string;          // YYYY-MM-DD
  habitsCompleted: number;
  totalHabits: number;
  damage: number;
  healing: number;
  hpAfter: number;
}
// Stored as JSON.stringify(DailyLogEntry[]) in boss_battles.daily_log TEXT column
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Boss battles as a standalone mini-game | Boss battles wired into existing habit/XP/title pipeline | Phase 11 schema design | No isolated state machine needed; reuse existing awardXP, checkTitles flows |
| Bottom sheet UI for all game features | Arena screen as a dedicated full-screen route | Phase 13 established DungeonSheet pattern; Arena is intentionally fuller | Arena gets its own Skia Canvas, not a Modal fragment |
| Skia Canvas with RN Text inside | RN Views overlaid as siblings outside Canvas | Phase 5 HUD, confirmed Phase 13 | Boss HP text, dialogue text must be RN Text, NOT Skia Text for i18n/accessibility |

**Current patterns locked by prior phases:**
- Typewriter text: `setInterval` + `useState` (not Reanimated worklet)
- HP bar animation: Reanimated `useSharedValue` + `withTiming` driving Skia `Rect`
- Store hydration on app launch: `loadActiveBattle` in `useEffect` (same as `loadActiveSession`)
- Boss state: `PRIVATE` — no sync, no assertSyncable

---

## Open Questions

1. **Daily outcome trigger — what if player never opens Arena for 3+ days?**
   - What we know: `loadActiveBattle` is called on app launch, which catches day advances.
   - What's unclear: If player doesn't open the app for 3 days, all 3 days of missed habits need to be processed. The multi-day loop in `loadActiveBattle` handles this, but what habit completion data is available for days the app wasn't opened?
   - Recommendation: For days the app was closed, treat as "0 habits completed" (worst case). Record in dailyLog with `habitsCompleted: 0`. This is unambiguously non-shaming and honest. The planner should explicitly decide this.

2. **Tiered title — single title row or 3 separate rows?**
   - What we know: D-16 specifies "one title with progression." The existing title system is not truly tiered (no upgrade-in-place).
   - What's unclear: Does "one title" mean one displayed title that updates its name/flavor, or three separate titles unlocked progressively?
   - Recommendation: Three separate title entries (Challenger, Warrior, Conqueror of Nafs) using the existing unlock system. The "progression" is that players naturally unlock each as defeat count increases. This requires zero changes to title infrastructure beyond adding the new unlock type. The planner should confirm.

3. **Seeding existing users with new titles**
   - What we know: The current `titleRepo.count() === 0` guard will skip seeding entirely for existing users.
   - What's unclear: Is the solution an INSERT OR IGNORE migration, or does the planner add a separate seed migration step?
   - Recommendation: Change `titleRepo.seedTitles` to use Drizzle's `.onConflictDoNothing()`. This makes it safe to call always, not just when count is 0. The planner must address this.

4. **Archetype suggestion algorithm complexity**
   - What we know: D-02 locks the suggestion feature; Claude has discretion over the algorithm.
   - What's unclear: How much habit history to query, and how to handle archetypes already defeated.
   - Recommendation: Simple heuristic — compute miss rate per habit category over last 14 days. Map highest-miss category to archetype. If that archetype is already defeated, suggest next-highest. Pure function, testable.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 14 is a code-only phase using all packages already installed in the project. No new npm packages, no new external services, no new CLIs required.

---

## Validation Architecture

`nyquist_validation` is enabled (config.json: `"nyquist_validation": true`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest (jest-expo ~54.0.17) |
| Config file | `jest.config.js` (existing) |
| Quick run command | `npx jest --testPathPattern="boss" --no-coverage` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| BOSS-01 | canStartBattle() returns false for level < 10, true for level >= 10 | unit | `npx jest --testPathPattern="boss-engine" --no-coverage` | Wave 0 |
| BOSS-01 | canStartBattle() returns false during active battle | unit | same | Wave 0 |
| BOSS-01 | canStartBattle() returns false within 3-day cooldown | unit | same | Wave 0 |
| BOSS-02 | calculateDailyDamage() correct for 100% and 0% completion | unit | same | Wave 0 |
| BOSS-02 | dailyLog JSON round-trips without corruption | unit | `npx jest --testPathPattern="bossRepo" --no-coverage` | Wave 0 |
| BOSS-02 | loadActiveBattle processes multiple missed days correctly | unit | `npx jest --testPathPattern="bossStore" --no-coverage` | Wave 0 |
| BOSS-03 | getBossDialoguePhase() returns correct phase for all conditions | unit | `npx jest --testPathPattern="boss-engine" --no-coverage` | Wave 0 |
| BOSS-03 | All 6 archetypes have all 4 dialogue strings defined | unit | `npx jest --testPathPattern="boss-content" --no-coverage` | Wave 0 |
| BOSS-04 | calculateDailyHealing() correct for misses | unit | `npx jest --testPathPattern="boss-engine" --no-coverage` | Wave 0 |
| BOSS-04 | applyDailyOutcome() clamps HP between 0 and bossMaxHp | unit | same | Wave 0 |
| BOSS-05 | calculateBossXpReward() stays in 200-500 range for levels 10-30 | unit | same | Wave 0 |
| BOSS-05 | boss_defeats unlock type evaluates correctly in title-engine | unit | `npx jest --testPathPattern="title-engine" --no-coverage` | ❌ Wave 0 (extend existing) |
| BOSS-06 | calculateDailyHealing() halves when mercyMode=true | unit | `npx jest --testPathPattern="boss-engine" --no-coverage` | Wave 0 |
| BOSS-07 | ArenaScreen renders without crash | smoke | manual | — |
| BOSS-08 | bossRepo never imports assertSyncable or syncQueueRepo | privacy invariant | `npx jest --testPathPattern="bossRepo" --no-coverage` | Wave 0 |
| BOSS-08 | calculatePartialXp() returns proportional XP on escape | unit | `npx jest --testPathPattern="boss-engine" --no-coverage` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern="boss" --no-coverage`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `__tests__/domain/boss-engine.test.ts` — covers BOSS-01, BOSS-02, BOSS-03, BOSS-04, BOSS-05, BOSS-06, BOSS-08 (pure domain functions)
- [ ] `__tests__/db/bossRepo.test.ts` — covers BOSS-08 (privacy invariant + module exports)
- [ ] `__tests__/stores/bossStore.test.ts` — covers BOSS-02 (multi-day processing logic)
- [ ] `__tests__/domain/boss-content.test.ts` — covers BOSS-03 (all 6 archetypes have 4 dialogue strings each)
- [ ] Extend `__tests__/domain/title-engine.test.ts` — add boss_defeats unlock type case (BOSS-05)

---

## Sources

### Primary (HIGH confidence)

- `src/db/schema.ts` lines 233-251 — boss_battles table definition (verified exact column names)
- `src/types/database.ts` lines 83-85 — BossBattle and NewBossBattle types
- `src/types/common.ts` line 43 — `boss_defeat` XP source type confirmed
- `src/services/privacy-gate.ts` line 29 — boss_battles PRIVATE classification confirmed
- `src/domain/detox-engine.ts` — authoritative pattern source for boss-engine.ts
- `src/stores/detoxStore.ts` — authoritative pattern source for bossStore.ts
- `src/db/repos/detoxRepo.ts` — authoritative pattern source for bossRepo.ts
- `src/components/hud/HudScene.tsx` — confirmed dungeon theme integration pattern
- `src/components/hud/DungeonDoorIcon.tsx` — confirmed HUD icon pattern
- `src/domain/title-engine.ts` — confirmed PlayerStats interface and unlock type switch
- `src/domain/title-seed-data.ts` — confirmed sortOrder 27 as last entry (Unplugged)
- `blueprint/15-content-pack.md` lines 153-202 — 20 pre-written dialogue strings for 5 archetypes
- `blueprint/04-worldbuilding.md` lines 147-166 — 6 archetype lore descriptions
- `blueprint/03-game-design-bible.md` lines 428-432 — XP range 200-500 confirmed
- `.planning/STATE.md` — detox-engine typewriter and XP count-up patterns documented

### Secondary (MEDIUM confidence)

- CONTEXT.md decisions D-01 through D-16 — user-locked decisions verified against existing code for compatibility

### Tertiary (LOW confidence)

None — all findings grounded in existing codebase and blueprints.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified as already installed; no new dependencies
- Architecture patterns: HIGH — directly derived from detox dungeon (Phase 13) which is complete and verified
- Domain formulas: MEDIUM — HP/damage/healing math recommended by Claude's discretion; planner should review the exact numbers
- Pitfalls: HIGH — most derived from actual STATE.md annotations from prior phases
- Title seeding issue: HIGH — the count-based guard is a real gap that will affect existing installs

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (stable stack, 30-day window)
