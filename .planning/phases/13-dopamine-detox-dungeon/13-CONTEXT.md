# Phase 13: Dopamine Detox Dungeon - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Players can voluntarily enter a timed anti-doomscrolling challenge ("dungeon"), earn XP for completing it, and have their habit streaks protected during an active session. From ROADMAP.md: DTOX-01 through DTOX-06. This phase builds the detoxRepo, domain logic (detox-engine), detoxStore, and all UI (HUD dungeon door, dungeon sheet, active session HUD theme, completion fanfare).

</domain>

<decisions>
## Implementation Decisions

### Dungeon Entry & Navigation
- **D-01:** Entry point is a pixel dungeon door icon on the HUD — tapping opens a bottom sheet with duration selection and session controls
- **D-02:** Duration selection uses preset chip buttons (2hr, 4hr, 6hr, 8hr) — no slider or custom input
- **D-03:** Daily vs Deep variants presented via a toggle at the top of the dungeon sheet — "Daily" shows 2-6hr presets, "Deep" shows 6-8hr presets. Deep badge shows "once per week" and greys out if already used this week
- **D-04:** Dungeon door icon is pixel art style (dungeon gate) that glows when tappable — fits the HUD game-world aesthetic

### Active Session Experience
- **D-05:** During an active session, the HUD transforms into a full dungeon theme — stone walls, torches, different color palette. The entire game-world scene reflects "in dungeon" state
- **D-06:** A countdown timer appears near the dungeon door on the HUD; opening the dungeon sheet shows full timer + progress details
- **D-07:** When the player backgrounds the app and returns, a brief "Welcome back" toast shows ("Still in the dungeon — X hours remaining") then the timer resumes from the stored startedAt timestamp
- **D-08:** A push notification fires when the detox timer completes while the app is backgrounded — celebratory tone: "Dungeon cleared! You earned X XP"

### Early Exit & Penalties
- **D-09:** Early exit confirmation uses compassionate mentor voice: "Leaving the dungeon early? You'll lose X XP, but your courage in trying still counts. Exit or keep going?"
- **D-10:** XP penalty is proportional to time remaining — exit at 50% complete = lose 50% of potential XP reward. Fair and intuitive scaling
- **D-11:** Player gets one retry per day if they exit early — the penalty from the first attempt still applies. Daily dungeon allows one re-entry; weekly deep allows one re-entry per week

### Completion & Streak Protection
- **D-12:** Dungeon completion triggers a full "Dungeon Cleared!" fanfare screen — XP award animation, dungeon crumbling/opening visual, mentor praise. HUD transitions back from dungeon theme to normal
- **D-13:** Habit cards show a visible shield/dungeon icon during an active session indicating "protected — no penalty while in dungeon"
- **D-14:** Streak protection only covers habits whose completion window overlaps with the detox session — starting a 2hr detox at 10am does NOT protect evening habits
- **D-15:** A detox-specific Identity Title should exist (e.g., "Dungeon Master" or "The Unplugged") that progresses with completed detox sessions — gives long-term motivation

### Claude's Discretion
- Exact dungeon theme pixel art design and color palette (stone walls, torches, etc.)
- Timer UI layout within the dungeon sheet
- Welcome-back toast animation and duration
- Push notification scheduling implementation (Expo Notifications)
- Detox title name, rarity tier, and progression thresholds
- XP penalty rounding behavior for partial hours
- Dungeon-cleared fanfare animation specifics (Skia/Reanimated)
- How the shield indicator looks on habit cards

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Detox Dungeon spec
- `blueprint/05-feature-systems.md` lines 441-447 — Dopamine Detox Dungeon mechanics, economy impact, honor-system philosophy

### XP Economy
- `src/domain/xp-economy-v2.md` — Detox XP caps and worst-case daily analysis
- `src/domain/xp-engine.ts` — Core XP calculation with multiplier parameter and soft cap

### Schema & Data Layer
- `src/db/schema.ts` lines 253-268 — detoxSessions table (already defined in Phase 11)
- `src/types/database.ts` — DetoxSession and NewDetoxSession types
- `src/types/common.ts` line 44 — 'detox_completion' sourceType already registered
- `src/services/privacy-gate.ts` line 46 — detox_sessions classified as LOCAL_ONLY

### Integration Points
- `src/stores/gameStore.ts` — awardXP() orchestration, day detection helpers
- `src/domain/streak-engine.ts` — Streak calculation logic (needs detox protection hook)
- `src/components/hud/HudScene.tsx` — Main HUD rendering (dungeon door + dungeon theme integration)
- `src/components/hud/HudStatBar.tsx` — Current level/XP display area
- `src/services/prayer-times.ts` — Prayer window times (for determining which habits overlap with detox session)

### Identity Titles
- `src/domain/title-engine.ts` — Title evaluation logic
- `src/domain/title-seed-data.ts` — 26 existing titles with rarity tiers and conditions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `detoxSessions` table in schema.ts — fully defined with all needed columns (variant, duration_hours, status, xp_earned, xp_penalty, started_at, ended_at)
- `DetoxSession` / `NewDetoxSession` types in database.ts — ready to use
- `'detox_completion'` sourceType in common.ts — XP ledger integration point exists
- Privacy Gate already classifies detox_sessions as LOCAL_ONLY
- Existing notification patterns in the app (prayer reminders, quest completions) for push notification implementation
- HudScene.tsx Skia canvas for dungeon theme rendering

### Established Patterns
- Repo pattern: existing repos (habitRepo, questRepo, etc.) follow consistent CRUD + query patterns with Drizzle ORM
- Store pattern: Zustand stores with domain-split architecture (habitStore, gameStore, etc.)
- Domain engine pattern: pure TypeScript functions (streak-engine, quest-engine, xp-engine) — detox-engine should follow this
- XP award flow: store action -> domain calculation -> xpRepo.insert -> xp_ledger entry
- Friday engine (friday-engine.ts) shows pattern for time-based feature logic

### Integration Points
- gameStore.awardXP() — detox completion XP flows through here
- streak-engine.ts — needs a new "isProtectedByDetox()" check
- HudScene.tsx — dungeon door icon + full theme swap during active session
- No existing detoxRepo, detoxStore, or detox-engine — all created fresh this phase

</code_context>

<specifics>
## Specific Ideas

- The HUD should fully transform into a dungeon scene during active sessions — this is a dramatic, immersive feature, not a subtle overlay
- Compassionate mentor voice on early exit — consistent with app's no-shame philosophy and existing mentor personality
- "Dungeon Cleared!" fanfare should feel like beating a level in a game — full screen, XP animation, satisfying
- Streak protection with visible shield icons gives the player confidence their habits are safe — reduces anxiety about starting a detox
- The daily/deep toggle keeps the UI clean while clearly distinguishing the two variants
- One retry per day balances forgiveness with commitment — doesn't let players game the system

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 13-dopamine-detox-dungeon*
*Context gathered: 2026-03-22*
