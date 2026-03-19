---
phase: 07-backend-auth-and-sync
plan: 02
subsystem: sync-engine
tags: [sync, offline-first, privacy-gate, tdd, zustand, supabase]
dependency_graph:
  requires:
    - 07-01 (authStore, supabase client, schema migration with retryCount/lastError)
    - src/services/privacy-gate.ts (assertSyncable guard)
    - src/db/schema.ts (syncQueue table)
  provides:
    - src/db/repos/syncQueueRepo.ts (sync queue CRUD operations)
    - src/services/sync-engine.ts (flushQueue, syncNow, purgeCompleted)
    - __tests__/services/sync-engine.test.ts (10 passing test cases)
  affects:
    - Any code that needs to enqueue changes for sync
    - 07-03+ plans that trigger sync after auth events
tech_stack:
  added: []
  patterns:
    - TDD (RED -> GREEN for sync-engine)
    - Store-repo-engine pattern (authStore + syncQueueRepo + privacy-gate)
    - Factory mocks in Jest for modules with expo-sqlite side-effects
key_files:
  created:
    - src/db/repos/syncQueueRepo.ts
    - src/services/sync-engine.ts
    - __tests__/services/sync-engine.test.ts
    - __mocks__/@supabase/supabase-js.ts
    - __mocks__/@react-native-community/netinfo.ts
  modified:
    - src/db/repos/index.ts (added syncQueueRepo export)
    - jest.setup.ts (mocked expo-sqlite/localStorage/install, react-native-url-polyfill/auto)
decisions:
  - "Factory mocks in jest.mock() calls required for modules with expo-sqlite side-effect imports — auto-mock attempts to load the module which runs openDatabaseSync"
  - "Supabase error objects (not Error instances) wrapped with new Error(error.message) before throw to preserve message string in markFailed calls"
  - "jest.setup.ts global mocks for expo-sqlite/localStorage/install and react-native-url-polyfill/auto prevent side-effect failures across all future test suites"
metrics:
  duration: "~5 min"
  completed: "2026-03-17"
  tasks_completed: 2
  files_created: 7
  tests_added: 10
  tests_total: 383
---

# Phase 7 Plan 02: Sync Queue Repository and Sync Engine Summary

**One-liner:** Offline sync backbone — syncQueueRepo with causal ordering + sync engine with auth/connectivity/privacy guards, 10 TDD tests passing.

## What Was Built

### Task 1: Sync Queue Repository (`c1d5572`)

`src/db/repos/syncQueueRepo.ts` — Full CRUD for the `sync_queue` SQLite table:

- `getPending()` — fetches items where `syncedAt IS NULL`, ordered `ASC createdAt` for causal delivery
- `enqueue(entityType, entityId, operation, payload)` — inserts new queue entry with UUID
- `markSynced(id)` — stamps `syncedAt` timestamp after successful cloud upsert
- `markFailed(id, errorMessage)` — increments `retryCount`, sets `lastError` for diagnostics
- `purgeSynced()` — removes completed items to keep queue lean
- `clearAll()` — wipes queue entirely (used during account deletion)

Also created missing mock files from Plan 01 (Rule 3 auto-fix):
- `__mocks__/@supabase/supabase-js.ts` — full `createClient` mock with auth and `from` methods
- `__mocks__/@react-native-community/netinfo.ts` — `fetch` mock defaulting to `isConnected: true`

### Task 2: Sync Engine (TDD) (`021e26e`)

`src/services/sync-engine.ts` — Three-guard flush architecture:

```
flushQueue()
  1. Auth guard: useAuthStore.getState().isAuthenticated → early return if false
  2. Connectivity guard: NetInfo.fetch() → early return if !isConnected
  3. setSyncStatus('syncing')
  4. For each pending item (retryCount < MAX_RETRIES=5):
     a. assertSyncable(entityType) → throws PRIVACY VIOLATION for PRIVATE tables
     b. DELETE or upsert with { onConflict: 'id' }
     c. markSynced on success | markFailed(id, error.message) on failure
  5. setSyncStatus('synced' | 'error') + setLastSyncedAt on full success
```

`syncNow()` — semantic alias for manual "Sync Now" button call sites.

`purgeCompleted()` — periodic cleanup wrapper.

## Test Coverage (10 cases)

| Test | Scenario | Result |
|------|----------|--------|
| 1 | isAuthenticated=false → no-op, no NetInfo call | PASS |
| 2 | isConnected=false → no-op, no getPending | PASS |
| 3 | upsert called with parsed payload + onConflict: id | PASS |
| 4 | markSynced called after successful upsert | PASS |
| 5 | markFailed called with error.message on upsert error | PASS |
| 6 | syncStatus: syncing → synced on all-success | PASS |
| 6b | syncStatus: syncing → error on any failure | PASS |
| 7 | lastSyncedAt set to ISO timestamp on success | PASS |
| 8 | habit_completions (PRIVATE) → PRIVACY VIOLATION in markFailed | PASS |
| 9 | syncNow() exhibits same behavior as flushQueue | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing Plan 01 mock files**
- **Found during:** Task 1 setup
- **Issue:** `__mocks__/@supabase/supabase-js.ts` and `__mocks__/@react-native-community/netinfo.ts` directories existed but were empty — Plan 01 was partially executed
- **Fix:** Created both mock files with full jest.fn() implementations
- **Files modified:** `__mocks__/@supabase/supabase-js.ts`, `__mocks__/@react-native-community/netinfo.ts`
- **Commit:** c1d5572

**2. [Rule 1 - Bug] Supabase error object not an Error instance**
- **Found during:** Task 2 TDD (Test 5 failing — `'[object Object]'` instead of `'Upsert failed'`)
- **Issue:** Supabase returns `{ error: { message: string } }` not `Error` instances; plain `throw error` loses the message string when `err instanceof Error` check runs
- **Fix:** Changed `if (error) throw error` to `if (error) throw new Error(error.message ?? String(error))`
- **Files modified:** `src/services/sync-engine.ts`
- **Commit:** 021e26e

**3. [Rule 3 - Blocking] Jest test environment: expo-sqlite/localStorage/install side-effect**
- **Found during:** Task 2 TDD (test suite failed to run)
- **Issue:** `expo-sqlite/localStorage/install` is imported as a side-effect in `supabase.ts` — when Jest tries to auto-mock `src/lib/supabase`, it still evaluates the module which runs `openDatabaseSync` → `NativeDatabase is not a constructor`
- **Fix:** (a) Added `jest.mock('expo-sqlite/localStorage/install', () => {})` and `jest.mock('react-native-url-polyfill/auto', () => {})` to `jest.setup.ts` globally; (b) Used factory mocks in test file for supabase, authStore, and syncQueueRepo to prevent side-effect module evaluation
- **Files modified:** `jest.setup.ts`, `__tests__/services/sync-engine.test.ts`
- **Commit:** 021e26e

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/db/repos/syncQueueRepo.ts | FOUND |
| src/services/sync-engine.ts | FOUND |
| __tests__/services/sync-engine.test.ts | FOUND |
| __mocks__/@supabase/supabase-js.ts | FOUND |
| __mocks__/@react-native-community/netinfo.ts | FOUND |
| Commit c1d5572 (Task 1) | FOUND |
| Commit 021e26e (Task 2) | FOUND |
| 383 tests passing | VERIFIED |
