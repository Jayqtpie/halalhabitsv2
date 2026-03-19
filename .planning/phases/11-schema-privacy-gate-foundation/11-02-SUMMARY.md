---
phase: 11-schema-privacy-gate-foundation
plan: 02
subsystem: database
tags: [supabase, rls, sql, migrations, xp-economy, game-design]

# Dependency graph
requires:
  - phase: 11-01
    provides: 6 new Drizzle SQLite table definitions including buddies, messages, shared_habits, duo_quests
provides:
  - Supabase CREATE TABLE definitions for 4 SYNCABLE tables ready for deployment
  - 16 RLS policies with buddy-pair scoping pattern
  - XP economy model proving soft cap prevents hyperinflation across all v2.0 sources
affects: [12-boss-battle, 13-detox, 14-buddy-system, 15-social-graph, 16-messages, 17-duo-quests]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Buddy-pair dual-owner RLS pattern (user_a OR user_b on buddies table)
    - EXISTS subquery RLS pattern for tables owned by a pair (messages, shared_habits, duo_quests)
    - (select auth.uid()) caching on all policy checks for query performance

key-files:
  created:
    - supabase/migrations/20260319_v2_schema.sql
    - supabase/migrations/20260319_v2_rls.sql
    - src/domain/xp-economy-v2.md
  modified: []

key-decisions:
  - "Buddies table uses dual-owner RLS (user_a OR user_b) — both users own the pair equally"
  - "Messages/shared_habits/duo_quests use EXISTS subquery to buddies for buddy-pair membership check"
  - "XP economy worst-case (1,330 XP/day) is confirmed unable to single-day level-up at level 10+ (requires 2,302 XP)"
  - "Actual salah XP values (fajr=50, others=15) used in economy model, not blueprint template values"

requirements-completed: [FOUN-02, FOUN-03]

# Metrics
duration: 5min
completed: 2026-03-19
---

# Phase 11 Plan 02: Supabase Migrations + XP Economy Model Summary

**Supabase v2.0 schema and RLS migrations for 4 SYNCABLE tables with buddy-pair-scoped policies, plus XP economy model proving the 500 XP soft cap prevents hyperinflation across all v2.0 reward scenarios**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-19T23:54:00Z
- **Completed:** 2026-03-19T23:59:00Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments

- Created `supabase/migrations/20260319_v2_schema.sql` with 4 SYNCABLE table definitions (buddies, messages, shared_habits, duo_quests) with correct columns, FKs, and indexes matching Drizzle schema from Plan 01
- Created `supabase/migrations/20260319_v2_rls.sql` with 16 RLS policies (4 CRUD per table): buddies uses dual-owner pattern, other tables use EXISTS subquery for buddy-pair membership scoping
- Created `src/domain/xp-economy-v2.md` with complete XP sources table (17 sources), soft cap mechanics, 3 scenario models (regular/Friday/worst-case), and proof that worst-case (~1,330 XP) cannot level up at level 10+ (requires 2,302 XP)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Supabase schema + RLS migrations for 4 SYNCABLE tables** - `55e6353` (feat)
2. **Task 2: Write XP economy model document proving cap prevents hyperinflation** - `c93e10f` (feat)

## Files Created/Modified

- `supabase/migrations/20260319_v2_schema.sql` - 4 CREATE TABLE statements for buddies, messages, shared_habits, duo_quests with indexes; ready for Supabase deployment
- `supabase/migrations/20260319_v2_rls.sql` - 16 RLS policies with buddy-pair scoping; 4 ENABLE ROW LEVEL SECURITY statements; EXISTS subquery pattern for pair-owned tables
- `src/domain/xp-economy-v2.md` - Complete XP economy model with actual base values from habitStore.ts, 3 scenario models with full math, and level-up impossibility proof

## Decisions Made

- Buddies table uses dual-owner RLS (user_a OR user_b can SELECT/UPDATE/DELETE). Only user_a (inviter) can INSERT.
- Messages, shared_habits, and duo_quests use EXISTS subquery against the buddies table for membership checks. This is the correct pattern for pair-shared resources.
- The XP economy document uses actual values from `habitStore.ts` (fajr=50, other salah=15, fasting=25) rather than the plan template's assumed values (30/20/30). The document notes this explicitly.
- Worst-case daily XP confirmed at ~1,330 XP (38% reduction from raw 2,160). No single-day level-up is possible at level 10+.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used actual XP base values instead of plan template values**
- **Found during:** Task 2 (XP economy model authoring)
- **Issue:** The plan template showed `salah_fajr: 30`, `salah_dhuhr: 20`, `fasting: 30`, but actual `habitStore.ts` values are `salah_fajr: 50`, `salah_dhuhr/asr/maghrib/isha: 15`, `fasting: 25`. The plan explicitly says "All math must use the actual values from xp-engine.ts and habitStore.ts."
- **Fix:** Sourced base XP values directly from `habitStore.ts` XP_MAP. All scenario math reflects actual values. Total salah base XP = 110 (same as plan template, different distribution).
- **Files modified:** `src/domain/xp-economy-v2.md`
- **Impact:** Scenario numbers differ slightly from plan template (worst-case ~1,330 vs template's ~1,355), but correctness is improved.

---

**Total deviations:** 1 auto-fixed (Rule 1 - data accuracy)
**Impact on plan:** Improved accuracy. No scope creep. The core conclusion (cap prevents single-day level-up) holds.

## Issues Encountered

None beyond the XP value discrepancy between plan template and actual codebase values (resolved by reading habitStore.ts directly).

## User Setup Required

None - no external service configuration required. Supabase migrations are ready for `supabase db push` when a Supabase project is available.

## Next Phase Readiness

- Supabase migration files are ready for deployment when Supabase project is created
- RLS policies implement the buddy-pair security model required for Phases 15-16
- XP economy model provides the mathematical foundation for Phase 12 (Friday bonus) and all v2.0 XP sources
- All Phase 11 plans complete — Phase 12 (boss battles) can begin

## Self-Check

Verified after SUMMARY creation:

- [x] `supabase/migrations/20260319_v2_schema.sql` — EXISTS (4 CREATE TABLE)
- [x] `supabase/migrations/20260319_v2_rls.sql` — EXISTS (16 CREATE POLICY, 4 ENABLE RLS)
- [x] `src/domain/xp-economy-v2.md` — EXISTS (all required sections present)
- [x] Commit `55e6353` — EXISTS (Task 1)
- [x] Commit `c93e10f` — EXISTS (Task 2)

## Self-Check: PASSED

---
*Phase: 11-schema-privacy-gate-foundation*
*Completed: 2026-03-19*
