---
phase: 10-title-pipeline-and-integration-fixes
plan: "01"
subsystem: game-store
tags: [tdd, integration, title-engine, quest-engine, auth]
dependency_graph:
  requires:
    - src/db/repos/streakRepo.ts (getAllForUser)
    - src/db/repos/muhasabahRepo.ts (getStreak)
    - src/stores/authStore.ts (useAuthStore)
  provides:
    - mercyRecoveries wired to real DB data in checkTitles
    - muhasabahStreak wired to real DB data in checkTitles
    - quest partial progress writes newProgress to DB
    - your-data.tsx userId derived from authStore
  affects:
    - src/stores/gameStore.ts
    - app/your-data.tsx
tech_stack:
  added: []
  patterns:
    - static file analysis tests (avoid full RN pipeline mock)
    - Promise.all for parallel repo queries in checkTitles
key_files:
  created:
    - __tests__/stores/gameStore.test.ts
  modified:
    - __tests__/integration/authUserId.test.ts
    - src/stores/gameStore.ts
    - app/your-data.tsx
decisions:
  - Static file analysis chosen for all 4 integration gap tests -- same pattern established in Phase 08-02
  - Promise.all used for streakRepo.getAllForUser + muhasabahRepo.getStreak in checkTitles (parallel, non-blocking)
  - isRebuilt filter on getAllForUser result (not a new repo method) -- consistent with existing repo contract
metrics:
  duration: "2 minutes"
  completed: "2026-03-19"
  tasks_completed: 2
  files_modified: 4
---

# Phase 10 Plan 01: Integration Gap Closure Summary

**One-liner:** Wired streakRepo/muhasabahRepo into title unlock conditions, fixed quest partial-progress parameter bug, and replaced hardcoded USER_ID with authStore in your-data.tsx -- closing all 4 v1.0 milestone audit blockers.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write failing tests for all 4 integration gaps (RED) | 01ae70a | `__tests__/stores/gameStore.test.ts`, `__tests__/integration/authUserId.test.ts` |
| 2 | Apply all 4 integration fixes to make tests green (GREEN) | be4c5c0 | `src/stores/gameStore.ts`, `app/your-data.tsx` |

## What Was Fixed

### Fix 1: mercyRecoveries wired to real DB data

**Before:** `mercyRecoveries: 0, // Phase 5 TODO: track mercy recoveries in DB`

**After:** `streakRepo.getAllForUser(userId)` returns all streak rows; rows with `isRebuilt === true` are counted as mercy recoveries.

### Fix 2: muhasabahStreak wired to real DB data

**Before:** `muhasabahStreak: 0, // Phase 5 TODO: compute from muhasabah entries`

**After:** `muhasabahRepo.getStreak(userId)` returns consecutive-day count from the muhasabah_entries table.

Both queries run in parallel via `Promise.all` before building the `PlayerStats` object in `checkTitles`.

### Fix 3: Quest partial progress bug

**Before:** `await questRepo.updateProgressAtomic(quest.id, quest.targetValue)` in the `else` (partial) branch -- was writing the max value instead of the current progress.

**After:** `await questRepo.updateProgressAtomic(quest.id, newProgress)` -- writes the actual incremented progress value.

### Fix 4: your-data.tsx userId propagation

**Before:** `const USER_ID = 'default-user';` hardcoded constant used in `exportUserData` and `deleteAllUserData` calls.

**After:** `const userId = useAuthStore((s) => s.userId);` derived from authStore -- works for both authenticated users (Supabase UID) and guest users (device-generated ID).

## Verification Results

```
npm test -- --testPathPattern="gameStore|authUserId"
  Tests: 21 passed, 21 total

npm test (full suite)
  Test Suites: 27 passed, 27 total
  Tests:       414 passed, 414 total
```

grep checks:
- `mercyRecoveries: 0` in gameStore.ts: no matches (PASS)
- `muhasabahStreak: 0` in gameStore.ts: no matches (PASS)
- `default-user` in your-data.tsx: no matches (PASS)
- `quest.targetValue` in partial branch: no matches (only appears in COMPLETE branch) (PASS)

## Deviations from Plan

None -- plan executed exactly as written. All 4 fixes applied in the order specified.

## Requirements Closed

| Requirement | Description | Status |
|-------------|-------------|--------|
| GAME-03 | Title unlocks evaluate real mercy recovery count | CLOSED |
| GAME-05 | Title unlocks evaluate real muhasabah streak | CLOSED |
| PROF-03 | your-data.tsx uses authenticated user's data | CLOSED |
| STRK-03 | Mercy Mode recoveries tracked in streak DB | CLOSED |
| STRK-04 | isRebuilt column queried for title conditions | CLOSED |
| MUHA-01 | Muhasabah streak feeds into title unlock engine | CLOSED |

## Self-Check: PASSED

Files exist:
- FOUND: `__tests__/stores/gameStore.test.ts`
- FOUND: `__tests__/integration/authUserId.test.ts` (extended)
- FOUND: `src/stores/gameStore.ts` (modified)
- FOUND: `app/your-data.tsx` (modified)

Commits exist:
- FOUND: 01ae70a (test RED)
- FOUND: be4c5c0 (feat GREEN)
