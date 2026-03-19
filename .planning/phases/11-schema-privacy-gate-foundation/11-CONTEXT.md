# Phase 11: Schema & Privacy Gate Foundation - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

All v2.0 database tables exist, Privacy Gate correctly classifies every new table, and the XP economy model is validated before any feature ships. No feature UI or game logic — just the data layer foundation that Phases 12-17 build on.

</domain>

<decisions>
## Implementation Decisions

### Table Schema Design

#### buddies
- Single-row pair model: one row per buddy relationship, user_a = inviter, user_b = invitee
- Status column with values: pending, accepted, blocked_by_a, blocked_by_b
- Columns: id, user_a, user_b, status, invite_code, created_at, accepted_at, updated_at
- FK references to users.id for both user_a and user_b

#### boss_battles
- Single row per battle with JSON daily_log column (array of per-day results)
- No separate battle_days table — the battle is one entity
- Columns: id, user_id, archetype, boss_hp, boss_max_hp, current_day, max_days (5-7), daily_log (JSON), status (active/won/lost/abandoned), mercy_mode (boolean), started_at, ended_at, updated_at

#### detox_sessions
- Single table for both daily and weekly_deep variants, distinguished by variant column
- Columns: id, user_id, variant (daily/weekly_deep), duration_hours (2-8), status (active/completed/exited_early), xp_earned, xp_penalty, started_at (wall-clock timestamp for background survival), ended_at, created_at

#### messages
- Local SQLite cache + Supabase sync (offline-first, matching existing architecture)
- Columns: id, buddy_pair_id (FK to buddies), sender_id (FK to users), content, status (sent/delivered/failed/filtered), created_at, synced_at

#### shared_habits & duo_quests
- Schema details deferred to Claude's discretion during planning (follow Drizzle patterns from existing tables)
- Both follow the same local-write + sync-queue-enqueue pattern as other SYNCABLE tables

### XP Economy Balance
- All v2.0 XP sources (boss, detox, friday) are subject to the same soft daily cap as existing sources
- Friday 2x multiplier doubles base XP before cap check — does not bypass the cap
- Boss defeat XP (200-500) awarded as lump sum on the day the boss is defeated, subject to daily cap
- Detox completion XP (50-150 daily, 300 weekly deep) awarded on session completion, subject to daily cap
- Economy doc must model worst-case daily scenarios: regular day, Friday, Friday + boss defeat + detox completion — proving the cap limits output at every level
- New xp_ledger sourceType values: 'boss_defeat', 'detox_completion', 'friday_bonus', 'duo_quest'

### Privacy Classifications
- buddies: SYNCABLE (both users need to see the connection)
- messages: SYNCABLE (offline cache + Supabase sync)
- duo_quests: SYNCABLE (both buddies need to see quest progress)
- shared_habits: SYNCABLE (both buddies need to see shared goal)
- boss_battles: PRIVATE (nafs archetype reveals personal struggle — never synced)
- detox_sessions: LOCAL_ONLY (ephemeral session data, no persistence needed after completion)
- Detox XP still syncs through xp_ledger (SYNCABLE) with sourceType 'detox_completion' — session details stay local, only the reward amount syncs
- Add an auto-validation test: reads all table names from schema.ts and asserts each has a PRIVACY_MAP entry — catches future tables that forget classification

### Migration Strategy
- Drizzle push for development (no migration files yet — no production users exist)
- Add 6 tables to schema.ts, drizzle-kit push creates them on next app launch
- Proper migration files deferred until before App Store submission
- Create Supabase .sql migration files for the 4 SYNCABLE tables (buddies, messages, duo_quests, shared_habits) with RLS policies — ready to deploy when Supabase project is created
- Phase 11 does NOT create repos (CRUD files) for the new tables — each feature phase (12-17) creates repos when it needs them

### Claude's Discretion
- Exact column types and indexes for shared_habits and duo_quests tables
- Supabase RLS policy specifics (buddy-pair scoping patterns)
- XP economy doc format and level of simulation detail beyond worst-case scenarios
- Whether to add TypeScript type definitions for new tables in types/database.ts now or defer to feature phases

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & Data Model
- `src/db/schema.ts` — Existing 13 Drizzle table definitions, pattern to follow for new tables
- `src/types/common.ts` — PrivacyLevel type and shared enums
- `src/types/database.ts` — Database row types (NewXPLedger, etc.)

### Privacy Gate
- `src/services/privacy-gate.ts` — PRIVACY_MAP with 12 current entries, assertSyncable guard
- `__tests__/services/privacy-gate.test.ts` — Existing Privacy Gate tests to extend

### XP Economy
- `src/domain/xp-engine.ts` — Soft daily cap, streak multiplier, level curve (pure TS, no React)
- `src/stores/gameStore.ts` — XP award flow (calls xp-engine, writes xp_ledger)
- `src/stores/habitStore.ts` — XP_MAP for base XP by habit type

### Sync Infrastructure
- `src/services/sync-engine.ts` — Flush queue pattern, assertSyncable guard usage
- `src/db/repos/syncQueueRepo.ts` — Sync queue enqueue pattern for SYNCABLE tables

### Requirements
- `.planning/REQUIREMENTS.md` — FOUN-01, FOUN-02, FOUN-03 (Phase 11 requirements)
- `.planning/ROADMAP.md` — Phase 11 success criteria (3 items)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `privacy-gate.ts`: PRIVACY_MAP record + assertSyncable/isSyncable/getPrivacyLevel functions — extend with 6 new entries
- `schema.ts`: Drizzle sqliteTable pattern with indexes, FK references — follow for new tables
- `xp-engine.ts`: calculateXP() with soft daily cap — model new sources against this
- `sync-engine.ts`: flushQueue() with assertSyncable guard — new SYNCABLE tables automatically protected

### Established Patterns
- All tables use TEXT primary keys (UUIDs)
- Timestamps stored as ISO 8601 TEXT strings
- FK references via `.references(() => table.id)`
- Indexes named `idx_{table}_{columns}`
- Privacy classification comments above each table definition in schema.ts
- Repos follow `src/db/repos/{table}Repo.ts` naming

### Integration Points
- `PRIVACY_MAP` in privacy-gate.ts — add 6 entries
- `schema.ts` — add 6 table definitions
- `drizzle.config.ts` — may need update if schema export changes
- Supabase migrations in `supabase/migrations/` directory (Phase 7 pattern)
- `PrivacyLevel` type in common.ts already supports all three levels

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Key constraint: this phase is purely foundational. No UI, no game logic, no feature behavior. Just tables, privacy classifications, and the economy proof.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 11-schema-privacy-gate-foundation*
*Context gathered: 2026-03-19*
