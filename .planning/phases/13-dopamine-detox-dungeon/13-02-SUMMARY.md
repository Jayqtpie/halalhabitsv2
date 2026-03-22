---
phase: 13-dopamine-detox-dungeon
plan: 02
subsystem: stores
tags: [detox, zustand, store, title-engine, streak-protection, xp, notifications, tdd]

# Dependency graph
requires:
  - phase: 13-dopamine-detox-dungeon
    plan: 01
    provides: detox-engine.ts (7 pure domain functions), detoxRepo.ts (7 CRUD methods)

provides:
  - detoxStore.ts: full session lifecycle (start, complete, exitEarly, loadActiveSession, getPenaltyPreview, isDailyAvailable, isDeepAvailable)
  - title-engine.ts: detox_completions unlockType + detoxCompletions PlayerStats field
  - title-seed-data.ts: "The Unplugged" rare title (sortOrder 27, 10 sessions)
  - streak-engine.ts: re-export of isProtectedByDetox from detox-engine
  - habitStore.ts: streak protection during active detox sessions
  - gameStore.ts: detoxCompletions in checkTitles PlayerStats construction

affects:
  - 13-03 (DetoxDungeonScreen uses useDetoxStore)
  - 13-04 (title system uses detox_completions unlock type)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Cross-store access via useGameStore.getState() for XP awards (same pattern as habitStore)
    - Detox protection check placed BEFORE detectStreakBreak in habitStore loop (guard-first pattern)
    - Auto-complete expired sessions on app launch (loadActiveSession checks getRemainingMs)
    - Notification scheduling with date trigger for session end time

key-files:
  created:
    - src/stores/detoxStore.ts
    - __tests__/stores/detoxStore.test.ts
  modified:
    - src/domain/title-engine.ts
    - src/domain/title-seed-data.ts
    - src/domain/streak-engine.ts
    - src/stores/habitStore.ts
    - src/stores/gameStore.ts
    - __tests__/domain/title-engine.test.ts

key-decisions:
  - "detoxStore uses no persist middleware — session data lives exclusively in SQLite (LOCAL_ONLY invariant)"
  - "Auto-complete on loadActiveSession: if session expired while app was closed, complete it with correct XP and cancel notifications"
  - "Streak protection uses full-day window (dayStart to dayEnd) for simplicity — any active detox session protects all habits for the day"
  - "detoxCompletions added to gameStore checkTitles parallel Promise.all — no extra round-trip cost"
  - "The Unplugged title uses sortOrder 27 (outside original 11-20 rare range) — title count updated from 26 to 27"

patterns-established:
  - "Detox protection: guard clause before detectStreakBreak in habitStore.loadDailyState loop"
  - "XP award pattern: awardXP(userId, baseXP, 1.0, 'detox_completion', sessionId) — multiplier always 1.0 for detox"

requirements-completed: [DTOX-01, DTOX-02, DTOX-03, DTOX-04, DTOX-05, DTOX-06]

# Metrics
duration: 5min
completed: 2026-03-22
---

# Phase 13 Plan 02: Detox Store + Engine Integration Summary

**detoxStore Zustand store wiring all detox session lifecycle to domain engine, XP flow, title evaluation, and streak protection, built TDD with 27 passing tests**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-22T22:12:12Z
- **Completed:** 2026-03-22T22:16:47Z
- **Tasks:** 2 (TDD store + auto integration task)
- **Files modified:** 8

## Accomplishments

- detoxStore.ts: 7 lifecycle methods, Zustand store with no persistence (LOCAL_ONLY session data in SQLite)
- Session auto-completion on app launch when session expired while closed
- Push notification scheduling at session start, cancellation on complete/exitEarly
- title-engine.ts: detox_completions unlock type + detoxCompletions PlayerStats field
- "The Unplugged" rare title (10 sessions, sortOrder 27) added to seed data
- streak-engine.ts re-exports isProtectedByDetox for ergonomic access
- habitStore: full-day window detox protection guard before streak break detection
- gameStore: detoxRepo.getCompletedCount added to parallel Promise.all in checkTitles
- 956 tests passing, 0 regressions

## Task Commits

1. **Task 1 RED: detoxStore failing tests** - `2fc3494` (test)
2. **Task 1 GREEN: detoxStore implementation** - `f1900fc` (feat)
3. **Task 2: title engine + seed + streak protection + gameStore** - `a50ccdc` (feat)

## Files Created/Modified

- `src/stores/detoxStore.ts` — 7-method Zustand store for full detox session lifecycle
- `__tests__/stores/detoxStore.test.ts` — 27 static analysis tests verifying wiring contracts
- `src/domain/title-engine.ts` — detox_completions unlockType, detoxCompletions PlayerStats
- `src/domain/title-seed-data.ts` — "The Unplugged" rare title + detox_completions union
- `src/domain/streak-engine.ts` — re-export isProtectedByDetox from detox-engine
- `src/stores/habitStore.ts` — streak protection guard (isProtectedByDetox + getSessionEndTime)
- `src/stores/gameStore.ts` — detoxRepo import + detoxCompletions in checkTitles
- `__tests__/domain/title-engine.test.ts` — updated count/sort/type assertions for new title

## Decisions Made

- **No persist middleware:** detoxStore is memory-only backed by SQLite — matches LOCAL_ONLY privacy invariant from Plan 01.
- **Full-day window protection:** Streak protection during active detox uses `dayStart` to `dayEnd` as the habit window — simplest correct approach, protects all habits during dungeon run.
- **Auto-complete on launch:** `loadActiveSession` checks `getRemainingMs` and auto-completes expired sessions with accurate XP + notification cleanup.
- **Title count 26 → 27:** "The Unplugged" (sortOrder 27, rare, 10 detox completions) added; test assertions updated to reflect the new total.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] title-engine.test.ts hardcoded count assertions broke with new title**
- **Found during:** Task 2 (full test suite run)
- **Issue:** Tests asserted `toHaveLength(26)`, `toHaveLength(10)` rare, `toBe(26)` unique IDs, `sortOrder is 1-26`, `rare titles 11-20` — all failed with the new 27th title
- **Fix:** Updated assertions to `toHaveLength(27)`, `toHaveLength(11)` rare, `uniqueIds.size === data.length`, unique sortOrder check (not sequential range), relaxed rare sortOrder to `>= 11`; added `detox_completions` to valid enum set; added `detoxCompletions: 0` to `makeStats` helper and `detoxCompletions: 10` to max stats object
- **Files modified:** `__tests__/domain/title-engine.test.ts`
- **Commit:** `a50ccdc` (included in same commit as implementation)

## Known Stubs

None — all data sources wired. detoxStore calls real repo, real domain engine, and real gameStore.awardXP.

## Self-Check: PASSED

- FOUND: src/stores/detoxStore.ts
- FOUND: __tests__/stores/detoxStore.test.ts
- FOUND commit 2fc3494 (test RED)
- FOUND commit f1900fc (feat GREEN)
- FOUND commit a50ccdc (feat Task 2)
- FOUND: grep "detox_completions" src/domain/title-engine.ts ✓
- FOUND: grep "the-unplugged" src/domain/title-seed-data.ts ✓
- FOUND: grep "isProtectedByDetox" src/stores/habitStore.ts ✓
- FOUND: grep "detoxRepo" src/stores/gameStore.ts ✓
- 956 tests passing, 0 failures

---
*Phase: 13-dopamine-detox-dungeon*
*Completed: 2026-03-22*
