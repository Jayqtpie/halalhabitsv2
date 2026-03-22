---
phase: 13-dopamine-detox-dungeon
plan: 01
subsystem: database
tags: [detox, domain-engine, drizzle, sqlite, tdd, local-only, pure-functions]

# Dependency graph
requires:
  - phase: 13-dopamine-detox-dungeon
    provides: schema detoxSessions table, DetoxSession/NewDetoxSession types in database.ts

provides:
  - detox-engine.ts with 7 exported pure domain functions (calculateDetoxXP, calculateEarlyExitPenalty, isProtectedByDetox, isDeepVariantAvailableThisWeek, getRemainingMs, canStartSession, getSessionEndTime)
  - detoxRepo.ts with 7 CRUD/query methods (create, getActiveSession, getTodaySessions, getThisWeekDeepSessions, complete, exitEarly, getCompletedCount)
  - 53 tests: 40 domain-engine + 13 repo tests, all passing
  - Re-export in repos/index.ts

affects:
  - 13-02 (detoxStore depends on detox-engine and detoxRepo)
  - 13-03 (DetoxDungeonScreen UI uses store built on this foundation)
  - 13-04 (title engine integration uses getCompletedCount)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - LOCAL_ONLY repo pattern (no syncQueueRepo, no assertSyncable — privacy invariant enforced)
    - TDD pattern: failing tests committed first, then implementation in separate commit
    - Pure domain engine: zero React/DB imports, fully unit-testable
    - Caller-supplied boundary values (dayStart, weekStart) keep repo pure/deterministic

key-files:
  created:
    - src/domain/detox-engine.ts
    - src/db/repos/detoxRepo.ts
    - __tests__/domain/detox-engine.test.ts
    - __tests__/db/detoxRepo.test.ts
  modified:
    - src/db/repos/index.ts

key-decisions:
  - "detox-engine daily XP formula: 50 + (clampedHours - 2) * 25 where clampedHours = clamp(h, 2, 6) — yields 50/75/100/125/150 for 2-6h"
  - "isProtectedByDetox uses HH:MM lexicographic overlap (habitStart < sessionEnd && habitEnd > sessionStart) — adjacent times are NOT overlapping"
  - "canStartSession blocks on any active or completed session; allows up to 1 abandoned retry for daily and deep variants"
  - "isDeepVariantAvailableThisWeek: 2+ sessions => false; 1 abandoned => true (re-entry); 1 active/completed => false"
  - "detoxRepo caller-supplied boundaries: getTodaySessions(dayStart, dayEnd), getThisWeekDeepSessions(weekStart) — repo stays pure"

patterns-established:
  - "LOCAL_ONLY repo: never import syncQueueRepo or assertSyncable; privacy invariant verified by test"
  - "TDD flow: test commit (failing) then feat commit (implementation) — two separate commits per feature"

requirements-completed: [DTOX-01, DTOX-02, DTOX-03, DTOX-04, DTOX-05, DTOX-06]

# Metrics
duration: 25min
completed: 2026-03-22
---

# Phase 13 Plan 01: Detox Domain Engine + Repo Summary

**7 pure detox domain functions and LOCAL_ONLY Drizzle repo for Dopamine Detox Dungeon, built TDD with 53 passing tests**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-22T22:10:00Z
- **Completed:** 2026-03-22T22:35:00Z
- **Tasks:** 2 (TDD feature + auto task)
- **Files modified:** 5

## Accomplishments

- detox-engine.ts: 7 pure TypeScript functions covering all detox session lifecycle logic (XP calc, penalty, overlap protection, availability, remaining time, gating, end time)
- detoxRepo.ts: 7 Drizzle ORM methods for detox_sessions table with zero sync queue involvement (LOCAL_ONLY privacy invariant)
- 53 tests passing: 40 domain-engine tests covering edge cases, 13 repo tests covering CRUD + privacy invariant

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: detox-engine failing tests** - `3bdd381` (test)
2. **Task 1 GREEN: detox-engine implementation** - `9da9c2c` (feat)
3. **Task 2: detoxRepo + tests + index re-export** - `2651cd1` (feat)

_TDD tasks have two commits (test RED → feat GREEN)_

## Files Created/Modified

- `src/domain/detox-engine.ts` — 7 exported pure functions, zero React/DB imports
- `src/db/repos/detoxRepo.ts` — CRUD + queries for detox_sessions, LOCAL_ONLY (no sync)
- `src/db/repos/index.ts` — Added `export { detoxRepo } from './detoxRepo'`
- `__tests__/domain/detox-engine.test.ts` — 40 unit tests with edge cases
- `__tests__/db/detoxRepo.test.ts` — 13 integration tests incl. privacy invariant check

## Decisions Made

- **Daily XP formula:** `50 + (clampedHours - 2) * 25` clamped to [2,6] hours. Yields 50/75/100/125/150 for 2-6h sessions. Deep always returns 300.
- **isProtectedByDetox uses lexicographic HH:MM overlap:** `habitStart < sessionEnd && habitEnd > sessionStart`. Adjacent times (habit ends exactly when session starts) are NOT protected.
- **canStartSession:** Blocks on any `active` or `completed` session; counts `abandoned` — up to 2 total sessions per period (0 or 1 abandoned = allowed, 2+ = exhausted). Same logic for both variants; caller scopes the list.
- **Caller-supplied boundaries:** `getTodaySessions(dayStart, dayEnd)` and `getThisWeekDeepSessions(weekStart)` accept ISO string boundaries from caller — repo stays deterministic and pure.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- detox-engine.ts and detoxRepo.ts are the complete foundation layer for plan 13-02
- Plan 13-02 (detoxStore + Zustand store) can import both immediately
- getCompletedCount is wired for title engine in plan 13-04
- No blockers

## Self-Check: PASSED

- FOUND: src/domain/detox-engine.ts
- FOUND: src/db/repos/detoxRepo.ts
- FOUND: __tests__/domain/detox-engine.test.ts
- FOUND: __tests__/db/detoxRepo.test.ts
- FOUND commit 3bdd381 (test RED)
- FOUND commit 9da9c2c (feat GREEN)
- FOUND commit 2651cd1 (feat repo)
- FOUND commit 9ca465f (docs metadata)

---
*Phase: 13-dopamine-detox-dungeon*
*Completed: 2026-03-22*
