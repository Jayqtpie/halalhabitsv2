# Phase 16: Shared Activities & Duo Quests - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Buddy pairs can track shared habits together and complete cooperative duo quests that reward both players individually and with bonus XP upon joint completion. This phase covers: shared habit proposal/acceptance, duo quest catalog (templates + custom), inactivity/timeout handling for duo quests, and a dedicated Activities sub-tab inside the buddy screen. It does NOT include messaging (Phase 17) or buddy connection mechanics (Phase 15, complete).

</domain>

<decisions>
## Implementation Decisions

### Shared Habit Proposal Flow
- **D-01:** Shared habits are proposed from the buddy profile screen. Tap buddy -> profile -> 'Propose Shared Habit'. Consistent entry point with duo quests.
- **D-02:** Eligible habit types are any non-worship habit — custom Habit Forge habits + character habits (focus, kindness, etc). Salah and Muhasabah are excluded per Privacy Gate.
- **D-03:** Buddy receives an in-app notification (badge on buddy tab) with accept/decline. Consistent with buddy request pattern from Phase 15.
- **D-04:** Either player can end a shared habit unilaterally. The other player keeps it as a personal habit if they want.

### Duo Quest Catalog & Creation
- **D-05:** Duo quests support both template-based (pre-built curated catalog) AND player-created custom quests. Templates follow existing quest-engine pattern. Custom quests allow player-written title, description, and target.
- **D-06:** Custom duo quest text (title/description) is filtered client-side using leo-profanity before creation. No server-side Edge Function required for quest text.
- **D-07:** Duo quests are started from the buddy profile screen — tap buddy -> profile -> 'Start Duo Quest' -> pick from catalog or create custom.
- **D-08:** Up to 3 active duo quests per buddy pair at once.

### Inactivity & Timeout Handling
- **D-09:** At 48 hours of partner inactivity, duo quest card shows a yellow warning banner: 'Paused — waiting for [buddy]'. Active player can still view their own progress. Gentle, no shame.
- **D-10:** At 72 hours, active player can exit with partial XP proportional to their own completion percentage (e.g., 60% done = 60% of individual XP). No bonus XP since quest wasn't jointly completed.
- **D-11:** Inactivity handling applies only to duo quests (which have expiry dates). Shared habits are ongoing with no timeout — if a buddy stops, the shared streak simply stalls.

### Progress Display & Privacy
- **D-12:** Shared habits and duo quests are visible in a dedicated 'Activities' sub-tab inside the buddy screen. Buddy screen gets two sub-tabs: 'Buddies' (existing list) and 'Activities' (all shared habits + duo quests across all buddies).
- **D-13:** Duo quest progress card shows a single combined progress bar with aggregate completion % (e.g., 'Team progress: 65%'), quest title, time remaining, and XP reward. Does NOT show who completed what. Warm mentor copy.
- **D-14:** Shared habit progress shows shared streak count only — how many days BOTH players completed the habit. 'Shared streak: 5 days'. Doesn't reveal individual completion per day.

### Claude's Discretion
- Duo quest template content and XP values (following XP economy model from Phase 11)
- Activities sub-tab navigation implementation within Expo Router
- Shared habit card and duo quest card component styling within modern pixel revival aesthetic
- Proposal/accept confirmation dialog design
- How custom quest creation form is laid out

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & Data Layer
- `src/db/schema.ts` lines 288-329 — `shared_habits` and `duo_quests` table definitions with all columns and indexes
- `.planning/phases/11-schema-privacy-gate-foundation/11-CONTEXT.md` — Schema design decisions, privacy classifications, XP economy model
- `src/services/privacy-gate.ts` — Both tables classified as SYNCABLE
- `src/domain/xp-economy-v2.md` — XP economy model with duo quest reward ranges

### Existing Infrastructure
- `src/domain/quest-engine.ts` — Solo quest engine pattern (template-based quests)
- `src/domain/quest-templates.ts` — Quest template format to follow for duo quest templates
- `src/stores/buddyStore.ts` — Buddy store pattern (no persist middleware, SQLite via repo)
- `src/db/repos/buddyRepo.ts` — Buddy repository pattern for SQL operations
- `src/domain/buddy-engine.ts` — Buddy domain engine pattern

### Buddy UI (Phase 15)
- `.planning/phases/15-buddy-connection-system/15-CONTEXT.md` — Buddy list, profile screen, connection flow decisions
- Buddy profile screen — entry point for both shared habits and duo quests

### Requirements
- `.planning/REQUIREMENTS.md` lines 54-59 — DUOQ-01 through DUOQ-05

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/db/schema.ts` — `sharedHabits` and `duoQuests` tables already defined with all columns and indexes
- `src/domain/quest-engine.ts` + `src/domain/quest-templates.ts` — Quest template pattern to extend for duo quest templates
- `src/stores/buddyStore.ts` — Store pattern for social features (no persist, SQLite-backed)
- `src/db/repos/buddyRepo.ts` — Repository pattern for buddy-scoped SQL queries
- `src/domain/buddy-engine.ts` — Domain engine pattern for buddy-related business logic
- `src/components/ui/CustomTabBar.tsx` — Tab bar component (for Activities sub-tab)

### Established Patterns
- Domain engine (pure TS functions) -> Repository (SQL) -> Store (Zustand) -> UI components
- Privacy Gate classification for all tables
- Sync queue enqueue for SYNCABLE data
- Buddy tab with badge notification system (Phase 15)

### Integration Points
- Buddy profile screen: add 'Propose Shared Habit' and 'Start Duo Quest' buttons
- Buddy screen: add 'Activities' sub-tab alongside existing buddy list
- gameStore: XP award integration for duo quest completion and bonus XP
- habitStore: shared habit completion tracking integration
- Sync engine: shared_habits and duo_quests are SYNCABLE

</code_context>

<specifics>
## Specific Ideas

- Entry point for both features is buddy profile — keeps social actions grouped per-buddy
- Yellow warning banner for paused quests — gentle, no shame copy
- Warm mentor copy on progress cards (e.g., 'Working together!')
- Shared streak display: 'Shared streak: 5 days' — motivating without exposing individual data
- Leo-profanity filter for custom quest text (already in stack for Phase 17)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 16-shared-activities-duo-quests*
*Context gathered: 2026-03-26*
