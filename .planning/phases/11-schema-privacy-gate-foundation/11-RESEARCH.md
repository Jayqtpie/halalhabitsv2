# Phase 11: Schema & Privacy Gate Foundation - Research

**Researched:** 2026-03-19
**Domain:** Drizzle ORM schema extension, Privacy Gate classification, XP economy modeling
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Table Schema Design**
- buddies: single-row pair model; columns: id, user_a, user_b, status (pending/accepted/blocked_by_a/blocked_by_b), invite_code, created_at, accepted_at, updated_at; FK to users.id for both user_a and user_b
- boss_battles: single row per battle with JSON daily_log; columns: id, user_id, archetype, boss_hp, boss_max_hp, current_day, max_days (5-7), daily_log (JSON), status (active/won/lost/abandoned), mercy_mode (boolean), started_at, ended_at, updated_at; NO separate battle_days table
- detox_sessions: single table for both daily/weekly_deep variants; columns: id, user_id, variant (daily/weekly_deep), duration_hours (2-8), status (active/completed/exited_early), xp_earned, xp_penalty, started_at, ended_at, created_at
- messages: columns: id, buddy_pair_id (FK to buddies), sender_id (FK to users), content, status (sent/delivered/failed/filtered), created_at, synced_at
- shared_habits and duo_quests: deferred to Claude's discretion during planning, following Drizzle patterns from existing tables; both use local-write + sync-queue-enqueue pattern

**XP Economy Balance**
- All v2.0 XP sources subject to same soft daily cap (500 XP threshold, 50% above)
- Friday 2x multiplier doubles base XP before cap check — does not bypass the cap
- Boss defeat XP (200-500) awarded as lump sum on defeat day, subject to daily cap
- Detox completion XP (50-150 daily, 300 weekly deep) awarded on session completion, subject to daily cap
- Economy doc must model worst-case: regular day, Friday, Friday + boss defeat + detox completion
- New xp_ledger sourceType values: 'boss_defeat', 'detox_completion', 'friday_bonus', 'duo_quest'

**Privacy Classifications**
- buddies: SYNCABLE
- messages: SYNCABLE
- duo_quests: SYNCABLE
- shared_habits: SYNCABLE
- boss_battles: PRIVATE
- detox_sessions: LOCAL_ONLY
- Detox XP syncs through xp_ledger (SYNCABLE) with sourceType 'detox_completion' — session details stay local
- Add auto-validation test: reads all table names from schema.ts and asserts each has a PRIVACY_MAP entry

**Migration Strategy**
- Drizzle push for development (no migration files yet — no production users)
- Add 6 tables to schema.ts, drizzle-kit push creates them on next app launch
- Proper migration files deferred until before App Store submission
- Create Supabase .sql migration files for 4 SYNCABLE tables (buddies, messages, duo_quests, shared_habits) with RLS policies
- Phase 11 does NOT create repos for new tables — each feature phase creates them

### Claude's Discretion
- Exact column types and indexes for shared_habits and duo_quests tables
- Supabase RLS policy specifics (buddy-pair scoping patterns)
- XP economy doc format and level of simulation detail beyond worst-case scenarios
- Whether to add TypeScript type definitions for new tables in types/database.ts now or defer to feature phases

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | Privacy Gate updated with 6 new table classifications (buddies, messages, duo_quests, shared_habits = SYNCABLE; boss_battles = PRIVATE; detox_sessions = LOCAL_ONLY) | privacy-gate.ts PRIVACY_MAP pattern documented; existing test structure to extend; auto-validation test pattern identified |
| FOUN-02 | 6 new SQLite tables created via Drizzle migration (buddies, messages, duo_quests, shared_habits, boss_battles, detox_sessions) | Drizzle sqliteTable patterns fully documented from schema.ts; FK, index, uniqueIndex patterns confirmed; JSON column storage via text() confirmed |
| FOUN-03 | XP economy model accounts for all v2.0 sources with daily cap preventing hyperinflation | applySoftCap() function behavior fully mapped; worst-case scenario math modeled; existing sourceType enum in common.ts must be extended |
</phase_requirements>

---

## Summary

Phase 11 is a pure data-layer phase: no UI, no feature logic. Its three jobs are (1) extend schema.ts with 6 new Drizzle table definitions, (2) extend the Privacy Gate's PRIVACY_MAP with 6 new classifications and add an auto-validation test, and (3) produce an XP economy document proving the soft daily cap prevents hyperinflation across all v2.0 reward scenarios.

The codebase already has a mature, consistent pattern for all three jobs. Schema.ts has 13 tables following identical conventions (text UUIDs, ISO 8601 TEXT timestamps, typed index names, FK via `.references()`). The Privacy Gate has a clean PRIVACY_MAP with 12 entries and an `assertSyncable()` guard that throws on any unknown table — making it safe by default. The XP engine has `applySoftCap()` with a well-defined 500 XP threshold and 50% reduction above the cap.

The main planning risk is getting the test extension right. The existing `privacy-gate.test.ts` hardcodes exact table counts (12 entities, 4 PRIVATE, 7 SYNCABLE, 1 LOCAL_ONLY) — those assertions must be updated to 18, 5, 11, 2 respectively. Adding the new `boss_battles` (PRIVATE) and `detox_sessions` (LOCAL_ONLY) entries means the count tests need surgical updates. The auto-validation test (schema table names vs PRIVACY_MAP keys) is new infrastructure that will prevent future regressions.

**Primary recommendation:** Work in three sequential tasks — (1) extend schema.ts with all 6 tables in one edit, (2) extend privacy-gate.ts + update all tests in one edit, (3) write the economy document. Do not interleave them.

---

## Standard Stack

### Core (already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | existing | SQLite table definitions, query builder | Project standard since Phase 2 |
| drizzle-kit | existing | `drizzle-kit push` for schema sync in dev | Used for all previous migrations |
| expo-sqlite | existing | SQLite runtime on device | Project standard; WatermelonDB was rejected in Phase 2 spike |

### No New Dependencies

This phase requires zero new npm packages. All work is additive edits to existing files.

**Version verification:** Not applicable — no new packages.

---

## Architecture Patterns

### Established Schema Conventions (from schema.ts — HIGH confidence)

Every table in the project follows these rules without exception:

```
// ─── TableName ───────────────────────────────────────────────────────
// Privacy: [LEVEL]
export const tableName = sqliteTable('snake_case_name', {
  id: text('id').primaryKey(),                          // UUID as TEXT
  userId: text('user_id').notNull().references(() => users.id),   // FK pattern
  someText: text('column_name').notNull(),
  someBoolean: integer('col', { mode: 'boolean' }).notNull().default(false),
  someJson: text('json_col').notNull(),                  // JSON stored as TEXT
  someTimestamp: text('created_at').notNull(),           // ISO 8601 TEXT
}, (table) => ([
  index('idx_{table}_{columns}').on(table.colA, table.colB),     // index naming
]));
```

Key rules from existing code:
- `text('id').primaryKey()` — all PKs are TEXT UUIDs
- `text('col_name')` — timestamps stored as ISO 8601 strings, NOT integer epoch
- `integer('col', { mode: 'boolean' })` — booleans stored as INTEGER 0/1
- JSON arrays/objects stored as `text()` and parsed in the repo layer
- FK: `.references(() => targetTable.id)` — no string table names
- Index names: `idx_{tablename}_{columns}` — e.g., `idx_buddy_user_a`, `idx_boss_user`
- `uniqueIndex()` for unique constraints, `index()` for non-unique
- Privacy comment line directly above each `export const` definition

### Pattern: Drizzle Push (Development Migration)

No migration file is created. Instead:
```bash
npx drizzle-kit push
```

This is the Phase 11 migration strategy for all 6 new SQLite tables. The dev database already has 13 tables; push adds the 6 new ones non-destructively.

### Pattern: PRIVACY_MAP Extension

Current map has 12 entries. After Phase 11 it will have 18:

```typescript
// Source: src/services/privacy-gate.ts
export const PRIVACY_MAP: Record<string, PrivacyLevel> = {
  // PRIVATE (5 after phase 11) - worship data, sacred privacy
  habit_completions: 'PRIVATE',
  streaks: 'PRIVATE',
  muhasabah_entries: 'PRIVATE',
  niyyah: 'PRIVATE',
  boss_battles: 'PRIVATE',       // NEW — nafs archetype reveals personal struggle

  // SYNCABLE (11 after phase 11) - profile and game data
  users: 'SYNCABLE',
  habits: 'SYNCABLE',
  xp_ledger: 'SYNCABLE',
  titles: 'SYNCABLE',
  user_titles: 'SYNCABLE',
  quests: 'SYNCABLE',
  settings: 'SYNCABLE',
  buddies: 'SYNCABLE',           // NEW
  messages: 'SYNCABLE',          // NEW
  duo_quests: 'SYNCABLE',        // NEW
  shared_habits: 'SYNCABLE',     // NEW

  // LOCAL_ONLY (2 after phase 11) - infrastructure or ephemeral
  sync_queue: 'LOCAL_ONLY',
  detox_sessions: 'LOCAL_ONLY',  // NEW — ephemeral session data
} as const;
```

### Pattern: Privacy Gate Test Extension

The existing test file hardcodes counts — these must be updated:

| Assertion | Before | After Phase 11 |
|-----------|--------|----------------|
| Total PRIVACY_MAP entries | 12 | 18 |
| PRIVATE tables count | 4 | 5 |
| SYNCABLE tables count | 7 | 11 |
| LOCAL_ONLY tables count | 1 | 2 |

The test arrays `PRIVATE_TABLES`, `SYNCABLE_TABLES`, `LOCAL_ONLY_TABLES` in the test file must each gain new entries.

### New Pattern: Auto-Validation Test

The CONTEXT.md requires a test that reads all table names from schema.ts and asserts each has a PRIVACY_MAP entry. Implementation approach:

```typescript
// __tests__/services/privacy-gate.test.ts (new describe block)
import * as schema from '../../src/db/schema';
import { PRIVACY_MAP } from '../../src/services/privacy-gate';

describe('PRIVACY_MAP completeness (auto-validation)', () => {
  it('every exported sqliteTable in schema.ts has a PRIVACY_MAP entry', () => {
    // Filter schema exports to only those that are Drizzle table objects
    // Drizzle tables have a ._.name property
    const tableNames = Object.values(schema)
      .filter((v): v is { _: { name: string } } =>
        typeof v === 'object' && v !== null && '_' in v && typeof (v as any)._.name === 'string'
      )
      .map((t) => t._.name);

    for (const tableName of tableNames) {
      expect(PRIVACY_MAP).toHaveProperty(tableName);
    }
  });
});
```

Note: The `_zustand_store` table is exported from schema.ts but does NOT need a PRIVACY_MAP entry (it's Zustand infrastructure). The test should exclude it or PRIVACY_MAP should include it as LOCAL_ONLY. Planner should decide — recommend adding `_zustand_store: 'LOCAL_ONLY'` to PRIVACY_MAP to make the auto-validation clean.

### Pattern: Supabase Migration for SYNCABLE Tables

Follows the same pattern as `supabase/migrations/20260317_schema.sql` and `20260317_rls.sql`. All 4 SYNCABLE tables need:
1. A `CREATE TABLE IF NOT EXISTS public.{table}` definition
2. RLS enabled: `ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY`
3. CRUD policies scoped to auth.uid()

**Buddy-pair scoping** for messages, duo_quests, shared_habits is more complex than existing single-user policies. The buddy pair tables need policies that check BOTH user_a and user_b columns:

```sql
-- buddies: user can see rows where they are user_a OR user_b
CREATE POLICY "Buddies: select own" ON public.buddies
  FOR SELECT TO authenticated
  USING (
    (select auth.uid())::text = user_a OR
    (select auth.uid())::text = user_b
  );

-- messages: user can see messages in their buddy pairs
-- Requires a subquery or join to buddies table
CREATE POLICY "Messages: select own buddy messages" ON public.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.buddies b
      WHERE b.id = buddy_pair_id
        AND (
          (select auth.uid())::text = b.user_a OR
          (select auth.uid())::text = b.user_b
        )
    )
  );
```

### Pattern: XP Economy Document

This is a new artifact type: a markdown document (not code) that proves the cap math. It lives in the phase directory or a docs folder. Format:

```
## XP Sources Summary
[table of all sources with base XP values]

## Soft Daily Cap Mechanics
[applySoftCap() behavior documented]

## Scenario Modeling
### Regular Day (no multiplier boosts)
### Friday (2x multiplier day)
### Friday + Boss Defeat + Detox Completion (worst case)
[for each: show raw XP, post-cap XP, at various player levels]

## Conclusion
[proof that cap prevents hyperinflation at every level]
```

### XP Source: Friday 2x Multiplier

From CONTEXT.md: the Friday multiplier doubles base XP before the cap check. This means it feeds into `calculateXP()` as an elevated multiplier, not a separate award. Example:

```
salah_fajr base = 50 XP, streak multiplier = 1.5x
Normal day: earnedXP = floor(50 * 1.5) = 75 XP
Friday: earnedXP = floor(50 * 1.5 * 2) = 150 XP (before cap)
```

The Friday multiplier stacks multiplicatively with the streak multiplier.

### XP Economy Worst-Case Math

Using existing `applySoftCap(earnedXP, dailyTotal)` from xp-engine.ts:
- CAP threshold = 500 XP
- Above 500: 50% yield

Worst-case scenario (Friday + boss defeat + max detox):

| Action | Base XP | After multiplier | After cap (approx, starting day at 0) |
|--------|---------|-----------------|---------------------------------------|
| 5x salah (Fri 2x, streak 2x) | 110 | 440 | 440 (under cap) |
| Quran (Fri 2x, streak 2x) | 20 | 80 | 80 (total 520 → 60 at half) |
| Boss defeat lump sum | 500 | 500 | ~250 (entirely above cap at this point) |
| Weekly deep detox | 300 | 300 | 150 (entirely above cap) |
| **Total awarded** | — | — | **~980 XP (worst case)** |

The cap does its job — raw value of ~1,320 XP is reduced to ~980 XP. At level 20, `xpToNextLevel(20)` ≈ 11,000 XP, so even worst-case doesn't single-handedly power through levels. The economy document must prove this with actual numbers from the xp-engine formulas.

### XPSourceType Extension

`src/types/common.ts` currently defines:
```typescript
export type XPSourceType = 'habit' | 'quest' | 'muhasabah' | 'mercy_recovery' | 'milestone';
```

Phase 11 must add: `'boss_defeat' | 'detox_completion' | 'friday_bonus' | 'duo_quest'`

This is a TypeScript union type — adding values is non-breaking. The xp_ledger `source_type` column stores this as TEXT in SQLite, so no migration needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON storage for daily_log | Custom serialization | Drizzle `text()` column + JSON.parse/stringify in repo | Drizzle SQLite doesn't have a JSON column type; text is correct |
| Soft daily cap | New cap logic | Existing `applySoftCap()` in xp-engine.ts | Already tested, handles boundary cases correctly |
| Privacy enforcement | New guards | Existing `assertSyncable()` in privacy-gate.ts | The guard is the contract; don't duplicate it |
| Schema completeness check | Reflection at runtime | Test that reads schema exports | Tests run at build time, no production overhead |
| Buddy-pair RLS | Custom auth middleware | Supabase policy EXISTS subquery | RLS is the correct enforcement layer for Supabase |

---

## Common Pitfalls

### Pitfall 1: Hardcoded Count Assertions in Test File
**What goes wrong:** The existing `privacy-gate.test.ts` asserts `toHaveLength(12)`, `toHaveLength(4)`, `toHaveLength(7)`, `toHaveLength(1)`. Adding new entries without updating these causes immediate test failures.
**Why it happens:** The tests were written when the table set was closed.
**How to avoid:** Update all four count assertions in the same edit that adds PRIVACY_MAP entries. Don't touch one without the other.
**Warning signs:** Test output "Expected length: 12, Received length: 18"

### Pitfall 2: Missing `_zustand_store` in Auto-Validation Test
**What goes wrong:** schema.ts exports `zustandStore` for the `_zustand_store` table, but PRIVACY_MAP doesn't have `_zustand_store`. The auto-validation test would fail unless handled.
**Why it happens:** The Zustand utility table was never classified because it predates the auto-validation concept.
**How to avoid:** Either (a) add `_zustand_store: 'LOCAL_ONLY'` to PRIVACY_MAP (recommended), or (b) exclude `_zustand_store` explicitly in the auto-validation test. Option (a) is cleaner.
**Warning signs:** Auto-validation test fails with "Expected PRIVACY_MAP to have property '_zustand_store'"

### Pitfall 3: FK Reference Direction for buddies Table
**What goes wrong:** boss_battles and detox_sessions reference `users.id` directly; buddies has TWO FK columns to the same table. Drizzle handles this fine but the FK syntax must be explicit for both.
**Why it happens:** Two FKs to the same parent table is unusual; easy to only wire one.
**How to avoid:** Both `user_a` and `user_b` columns need `.references(() => users.id)`.

### Pitfall 4: Boolean Storage for mercy_mode
**What goes wrong:** SQLite has no native boolean. If `mercy_mode` is declared as `integer('mercy_mode').notNull().default(0)` without `{ mode: 'boolean' }`, it returns 0/1 integers instead of true/false in TypeScript.
**Why it happens:** The `{ mode: 'boolean' }` option is easy to forget.
**How to avoid:** Follow the exact pattern from schema.ts: `integer('mercy_mode', { mode: 'boolean' }).notNull().default(false)`.

### Pitfall 5: XP Economy Doc Not Accounting for Streak Cap
**What goes wrong:** Streak multiplier is capped at 3.0x (from streak-engine.ts). If the economy doc models without this cap, the worst-case math will overestimate XP output.
**Why it happens:** Modeler focuses on the daily cap and forgets the multiplier ceiling.
**How to avoid:** Use max streak multiplier of 3.0x in all worst-case calculations.

### Pitfall 6: Supabase RLS for Social Tables Omits Partner Access
**What goes wrong:** Writing a message RLS policy as `WHERE sender_id = auth.uid()` — the recipient can't read their received messages.
**Why it happens:** Reusing the single-user owner pattern without adapting for dual ownership.
**How to avoid:** All social table RLS policies must check buddy pair membership (EXISTS subquery on buddies) so both parties in the pair can read/write.

---

## Code Examples

### Adding a New Table to schema.ts (boss_battles example)

```typescript
// Source: src/db/schema.ts — follow existing pattern exactly

// ─── Boss Battles ─────────────────────────────────────────────────────
// Privacy: PRIVATE — nafs archetype reveals personal struggle, never synced
export const bossBattles = sqliteTable('boss_battles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  archetype: text('archetype').notNull(),
  bossHp: integer('boss_hp').notNull(),
  bossMaxHp: integer('boss_max_hp').notNull(),
  currentDay: integer('current_day').notNull().default(1),
  maxDays: integer('max_days').notNull(),
  dailyLog: text('daily_log').notNull().default('[]'),  // JSON array stored as TEXT
  status: text('status').notNull().default('active'),   // active/won/lost/abandoned
  mercyMode: integer('mercy_mode', { mode: 'boolean' }).notNull().default(false),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  updatedAt: text('updated_at').notNull(),
}, (table) => ([
  index('idx_boss_user_status').on(table.userId, table.status),
]));
```

### Extending PRIVACY_MAP and Updating Test Counts

```typescript
// Source: src/services/privacy-gate.ts
// After adding 6 new entries, the map comment changes to:
/**
 * PRIVATE (5): Worship data that never leaves the device
 * SYNCABLE (11): Profile/game data safe for cloud backup
 * LOCAL_ONLY (2): Infrastructure/ephemeral tables
 */
```

```typescript
// Source: __tests__/services/privacy-gate.test.ts — counts update
it('classifies exactly 18 entities (5 PRIVATE + 11 SYNCABLE + 2 LOCAL_ONLY)', () => {
  // was: 12 entities (4 PRIVATE + 7 SYNCABLE + 1 LOCAL_ONLY)
  expect(Object.keys(PRIVACY_MAP)).toHaveLength(18); // +6 new tables, +1 if _zustand_store added
```

### XPSourceType Extension in common.ts

```typescript
// Source: src/types/common.ts
export type XPSourceType =
  | 'habit'
  | 'quest'
  | 'muhasabah'
  | 'mercy_recovery'
  | 'milestone'
  | 'boss_defeat'       // NEW Phase 11
  | 'detox_completion'  // NEW Phase 11
  | 'friday_bonus'      // NEW Phase 11
  | 'duo_quest';        // NEW Phase 11
```

### Supabase RLS for buddies (dual-user ownership)

```sql
-- Source: supabase/migrations/ pattern from 20260317_rls.sql — adapted for buddy pairs
ALTER TABLE public.buddies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buddies: select own pair" ON public.buddies
  FOR SELECT TO authenticated
  USING (
    (select auth.uid())::text = user_a OR
    (select auth.uid())::text = user_b
  );

CREATE POLICY "Buddies: insert as user_a" ON public.buddies
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid())::text = user_a);

CREATE POLICY "Buddies: update own pair" ON public.buddies
  FOR UPDATE TO authenticated
  USING (
    (select auth.uid())::text = user_a OR
    (select auth.uid())::text = user_b
  );
```

---

## Recommended Column Details for Discretionary Tables

### shared_habits (Claude's discretion)

Represents a habit goal that two buddies are both working toward independently.

```typescript
export const sharedHabits = sqliteTable('shared_habits', {
  id: text('id').primaryKey(),
  buddyPairId: text('buddy_pair_id').notNull().references(() => buddies.id),
  createdByUserId: text('created_by_user_id').notNull().references(() => users.id),
  habitType: text('habit_type').notNull(),       // e.g., 'quran', 'fasting', custom name
  name: text('name').notNull(),
  targetFrequency: text('target_frequency').notNull().default('daily'),
  status: text('status').notNull().default('active'),  // active/completed/abandoned
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ([
  index('idx_shared_habit_pair').on(table.buddyPairId),
  index('idx_shared_habit_creator').on(table.createdByUserId),
]));
```

### duo_quests (Claude's discretion)

A quest that requires both buddies to complete their respective parts.

```typescript
export const duoQuests = sqliteTable('duo_quests', {
  id: text('id').primaryKey(),
  buddyPairId: text('buddy_pair_id').notNull().references(() => buddies.id),
  createdByUserId: text('created_by_user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  xpRewardEach: integer('xp_reward_each').notNull(),
  xpRewardBonus: integer('xp_reward_bonus').notNull().default(0),  // bonus if both complete
  targetType: text('target_type').notNull(),
  targetValue: integer('target_value').notNull(),
  userAProgress: integer('user_a_progress').notNull().default(0),
  userBProgress: integer('user_b_progress').notNull().default(0),
  userACompleted: integer('user_a_completed', { mode: 'boolean' }).notNull().default(false),
  userBCompleted: integer('user_b_completed', { mode: 'boolean' }).notNull().default(false),
  status: text('status').notNull().default('active'),  // active/completed/abandoned/expired
  expiresAt: text('expires_at').notNull(),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ([
  index('idx_duo_quest_pair_status').on(table.buddyPairId, table.status),
  index('idx_duo_quest_expires').on(table.expiresAt),
]));
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `drizzle-kit generate` + migration files | `drizzle-kit push` for dev (no production users yet) | Faster dev iteration; proper migrations deferred to pre-App Store |
| Single-owner RLS (`user_id = auth.uid()`) | Dual-owner RLS with EXISTS subquery for social tables | Buddy-pair access requires both parties to read/write |
| Fixed XPSourceType union | Extended union with 4 new v2.0 source types | No DB migration needed — stored as TEXT |

---

## Open Questions

1. **`_zustand_store` classification in PRIVACY_MAP**
   - What we know: schema.ts exports `zustandStore` for `_zustand_store`. PRIVACY_MAP currently doesn't include it. The auto-validation test would fail without handling this.
   - What's unclear: Was it intentionally excluded, or just never considered?
   - Recommendation: Add `_zustand_store: 'LOCAL_ONLY'` to PRIVACY_MAP. The planner should make this call explicit in the plan.

2. **TypeScript types in database.ts — now or Phase 12+?**
   - What we know: CONTEXT.md marks this as Claude's discretion. All 12 existing tables have types in database.ts.
   - What's unclear: Whether phases 12-17 need the types immediately or can add them inline.
   - Recommendation: Add TypeScript types for all 6 new tables in Phase 11. The types file is a mechanical derive from schema exports (`InferSelectModel` / `InferInsertModel`). Adding them now prevents type errors in Phase 12 before their repo exists.

3. **XP economy doc location**
   - What we know: CONTEXT.md says "Economy doc must model worst-case scenarios." No location specified.
   - Recommendation: Place at `src/domain/xp-economy-v2.md` so it lives alongside xp-engine.ts for easy reference during Phases 12-14.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest (configured in package.json) |
| Config file | jest.config.js (root) |
| Quick run command | `npx jest __tests__/services/privacy-gate.test.ts --no-coverage` |
| Full suite command | `npm test` (runs `jest --no-coverage`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-01 | PRIVACY_MAP has 18 entries (or 19 with _zustand_store), correct classifications for all 6 new tables | unit | `npx jest __tests__/services/privacy-gate.test.ts --no-coverage` | ✅ (extend existing) |
| FOUN-01 | Auto-validation: every schema.ts table has PRIVACY_MAP entry | unit | `npx jest __tests__/services/privacy-gate.test.ts --no-coverage` | ❌ Wave 0 (add describe block) |
| FOUN-01 | assertSyncable throws for boss_battles and detox_sessions | unit | `npx jest __tests__/services/privacy-gate.test.ts --no-coverage` | ✅ (extend existing) |
| FOUN-02 | All 6 tables exist in SQLite with correct columns after drizzle-kit push | integration/manual | drizzle-kit push then `npx jest __tests__/db/database.test.ts --no-coverage` | ✅ (extend existing) |
| FOUN-03 | XP soft cap behavior for boss/detox/friday sources | unit | `npx jest __tests__/domain/xp-engine.test.ts --no-coverage` | ✅ (extend with new source scenarios) |
| FOUN-03 | XPSourceType includes all 4 new values | type-check | `npx tsc --noEmit` | ✅ (after common.ts update) |

### Sampling Rate
- **Per task commit:** `npx jest __tests__/services/privacy-gate.test.ts --no-coverage`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/services/privacy-gate.test.ts` — add auto-validation describe block (FOUN-01)
- [ ] `__tests__/domain/xp-engine.test.ts` — add new source type scenario tests (FOUN-03)

---

## Sources

### Primary (HIGH confidence)
- `src/db/schema.ts` — Drizzle table definitions (all 13 tables, all conventions confirmed)
- `src/services/privacy-gate.ts` — PRIVACY_MAP, assertSyncable, getPrivacyLevel (exact implementation confirmed)
- `src/domain/xp-engine.ts` — applySoftCap(), calculateXP(), CAP = 500, 50% reduction (confirmed)
- `__tests__/services/privacy-gate.test.ts` — Existing test structure, hardcoded counts (confirmed)
- `src/types/common.ts` — PrivacyLevel type, XPSourceType union (confirmed)
- `supabase/migrations/20260317_rls.sql` — RLS policy pattern with `(select auth.uid())` caching (confirmed)
- `supabase/migrations/20260317_schema.sql` — Supabase schema pattern for SYNCABLE tables (confirmed)
- `drizzle.config.ts` — `dialect: 'sqlite', driver: 'expo'` (confirmed)

### Secondary (MEDIUM confidence)
- Supabase documentation pattern for EXISTS subquery in RLS policies (standard PostgreSQL RLS technique, widely documented)
- Drizzle ORM `text()` for JSON storage in SQLite (standard approach; Drizzle SQLite does not have a native JSON column type)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are existing project dependencies; no new packages
- Architecture: HIGH — all patterns directly observed in production codebase
- Pitfalls: HIGH — derived directly from exact test assertions in existing test files
- XP economy math: HIGH — applySoftCap() implementation read directly; numbers are exact
- Supabase RLS buddy-pair scoping: MEDIUM — pattern follows PostgreSQL EXISTS subquery standard, not yet in project

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable domain — all findings are based on current codebase, not external library versions)
