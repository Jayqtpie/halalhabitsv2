---
phase: 16-shared-activities-duo-quests
plan: 02
subsystem: database
tags: [drizzle, sqlite, sync-queue, privacy-gate, tdd, shared-habits, duo-quests, repo-layer]

dependency_graph:
  requires:
    - phase: 16-shared-activities-duo-quests
      plan: 01
      provides: "Domain engines (shared-habit-engine, duo-quest-engine) with validated business logic"
    - phase: 11-sync-engine
      provides: "syncQueueRepo.enqueue pattern and assertSyncable guard"
    - phase: 15-buddy-connection-system
      provides: "buddyRepo.ts pattern for dual-owner SYNCABLE repos"
  provides:
    - src/db/repos/sharedHabitRepo.ts
    - src/db/repos/duoQuestRepo.ts
    - src/db/repos/index.ts (sharedHabitRepo + duoQuestRepo exports)
  affects:
    - future: buddyStore extension (plan 03) — store orchestrates these repos
    - future: DuoQuestScreen UI (plan 04+) — UI consumes store which uses these repos

tech-stack:
  added: []
  patterns:
    - "TDD Red-Green repo tests using fs.readFileSync source-level privacy invariant checks"
    - "assertSyncable('table_name') called before every write — Privacy Gate guard"
    - "syncQueueRepo.enqueue('table_name', id, 'UPSERT', row) after insert/update when authenticated"
    - "try/catch around sync enqueue with console.warn fallback (non-blocking local writes)"
    - "All queries scoped to buddyPairId — no global table scans in public API"
    - "getProposalsForUser uses ne(createdByUserId, userId) to exclude self-created proposals"
    - "getActiveCountByBuddyPair uses count() for MAX_ACTIVE_DUO_QUESTS=3 limit check"
    - "updateProgress(id, side, progress, completed) dispatches to userA or userB columns"

key-files:
  created:
    - src/db/repos/sharedHabitRepo.ts
    - src/db/repos/duoQuestRepo.ts
    - __tests__/repos/sharedHabitRepo.test.ts
    - __tests__/repos/duoQuestRepo.test.ts
  modified:
    - src/db/repos/index.ts

key-decisions:
  - "getProposalsForUser takes (buddyPairIds: string[], userId: string) — caller supplies pair IDs instead of doing a JOIN, keeps repo simple and avoids cross-table coupling"
  - "duoQuestRepo stores individual userA/userB progress columns; domain engine (getAggregateProgress) is responsible for aggregating before UI display — privacy boundary at domain layer, not repo layer"
  - "updateProgress writes the full new progress value (not an increment) — store is responsible for reading current value and computing new value before calling repo"
  - "inArray used for getProposalsForUser buddyPairIds filter — handles multiple pair IDs in a single query"

patterns-established:
  - "Repo pattern: assertSyncable -> insert/update -> try/catch enqueue"
  - "Privacy invariant tests: source-level grep after stripping comments"
  - "Count pattern: select({ value: count() }) with ?? 0 fallback"

requirements-completed: [DUOQ-01, DUOQ-02, DUOQ-04, DUOQ-05]

duration: 6min
completed: "2026-03-26"
---

# Phase 16 Plan 02: Shared Habit Repo + Duo Quest Repo Summary

**Drizzle ORM repositories for shared_habits and duo_quests tables with assertSyncable guards, sync queue wiring, buddy-pair-scoped queries, and 40 passing TDD privacy invariant tests.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-26T21:40:00Z
- **Completed:** 2026-03-26T21:46:00Z
- **Tasks:** 2
- **Files modified:** 5 (2 repos created, 2 test files created, 1 barrel export updated)

## Accomplishments

- sharedHabitRepo.ts with create/getByBuddyPair/getActiveByBuddyPair/getProposalsForUser/updateStatus/getById — all writes assertSyncable-guarded and sync-queue-wired
- duoQuestRepo.ts with create/getActiveByBuddyPair/getActiveCountByBuddyPair/getByBuddyPair/getById/updateProgress/updateStatus/getExpiredActive — dual-column progress (userA/userB), expiry query via lte
- 40 privacy invariant tests passing (18 for sharedHabitRepo, 22 for duoQuestRepo) — source-level grep checks enforce Privacy Gate patterns

## Task Commits

Each task was committed atomically:

1. **Task 1: Shared Habit Repository** - `13a15b5` (feat — TDD Red-Green)
2. **Task 2: Duo Quest Repository** - `5035ac4` (feat — TDD Red-Green)

**Plan metadata:** (docs commit follows)

_Note: TDD tasks used Red-Green cycle — failing tests written first, then implementation._

## Files Created/Modified

- `src/db/repos/sharedHabitRepo.ts` — CRUD for shared_habits: assertSyncable + sync queue integration, buddyPairId-scoped queries, proposal self-exclusion via ne()
- `src/db/repos/duoQuestRepo.ts` — CRUD for duo_quests: assertSyncable + sync queue, dual-column updateProgress, active count for 3-quest limit, getExpiredActive with lte
- `src/db/repos/index.ts` — Added sharedHabitRepo and duoQuestRepo barrel exports
- `__tests__/repos/sharedHabitRepo.test.ts` — 18 privacy invariant and functional tests
- `__tests__/repos/duoQuestRepo.test.ts` — 22 privacy invariant and functional tests

## Decisions Made

- **getProposalsForUser signature:** Accepts `(buddyPairIds: string[], userId: string)` — store supplies buddy pair IDs rather than the repo joining with the buddies table. Keeps repo simple and avoids cross-table coupling.
- **Individual progress storage:** duoQuestRepo stores raw userA/userB progress columns. Domain engine `getAggregateProgress()` handles aggregation for UI display. This keeps the privacy boundary at the domain layer where it's testable.
- **updateProgress writes absolute value:** Receives the new progress value, not an increment. The store reads current state and computes the new value before calling the repo.
- **inArray for proposal filtering:** `getProposalsForUser` uses `inArray(sharedHabits.buddyPairId, buddyPairIds)` to handle multiple buddy pairs in a single query without N+1 issues.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Adab Safety Rails Verified

- Privacy Gate enforced: assertSyncable called before every write — verified at source level in tests
- getProposalsForUser excludes self-created proposals — ne() guard verified by test
- No worship data (habit_completions, streaks, muhasabah_entries) referenced in either repo — verified by source-level grep
- duoQuestRepo stores individual progress for accuracy but aggregation is enforced at domain layer (getAggregateProgress in duo-quest-engine.ts)

## Known Stubs

None — this plan creates pure data access repos with no UI rendering.

## Next Phase Readiness

- sharedHabitRepo and duoQuestRepo ready for Plan 03 (store orchestration layer)
- Both repos follow identical pattern to buddyRepo — store authors have clear precedent to follow
- Active count query ready for MAX_ACTIVE_DUO_QUESTS=3 enforcement in store
- getExpiredActive ready for background expiry sweep in store

---
*Phase: 16-shared-activities-duo-quests*
*Completed: 2026-03-26*
