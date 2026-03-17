---
phase: 07-backend-auth-and-sync
plan: 01
subsystem: auth
tags: [supabase, auth, zustand, sqlite, migration, expo-sqlite, localStorage]

# Dependency graph
requires:
  - phase: 06-onboarding-profile-and-notifications
    provides: data-export.ts deleteAllUserData, settingsStore, existing stores for auth integration
  - phase: 02-foundation-and-data-layer
    provides: SQLite schema, Drizzle migrations, migration runner pattern

provides:
  - Supabase client singleton (src/lib/supabase.ts) with expo-sqlite localStorage polyfill
  - authStore (src/stores/authStore.ts) with guest-mode default userId
  - auth-service (src/services/auth-service.ts) — signUp/signIn/signOut/deleteAccount/migrateGuestData
  - sync_queue migration: retryCount + lastError columns for retry tracking
  - users migration: expoPushToken column for push notification registration
  - .env.example template with Supabase env var names
  - Jest mocks for @supabase/supabase-js and @react-native-community/netinfo

affects:
  - 07-02-sync-engine (uses supabase singleton, authStore.isAuthenticated, syncQueueRepo)
  - 07-03-push-notifications (uses authStore.userId, users.expoPushToken column)
  - 07-04-account-screens (uses auth-service signUp/signIn/signOut/deleteAccount)
  - 07-05-auth-ui (uses authStore session, signUp with keepProgress/startFresh choice)

# Tech tracking
tech-stack:
  added:
    - "@supabase/supabase-js ^2.99.2 — Supabase client SDK"
    - "react-native-url-polyfill ^3.0.0 — URL polyfill required by supabase-js in RN"
    - "@react-native-community/netinfo ^11.4.1 — network state for sync engine"
  patterns:
    - "Polyfill-first import order: expo-sqlite/localStorage/install + react-native-url-polyfill/auto before createClient"
    - "Guest mode: userId='default-user' as Zustand default, real UUID on auth"
    - "Non-destructive signOut: local SQLite data stays intact, session cleared only in store"
    - "migrateGuestData: raw execSync SQL loop re-keying default-user rows to real UUID"
    - "Auth mock pattern: jest.mock src/lib/supabase inline factory to avoid localStorage in Node env"

key-files:
  created:
    - src/lib/supabase.ts
    - src/stores/authStore.ts
    - src/services/auth-service.ts
    - src/db/migrations/0003_phase7_sync.sql
    - __tests__/services/auth-service.test.ts
    - __mocks__/@supabase/supabase-js.ts
    - __mocks__/@react-native-community/netinfo.ts
    - .env.example
  modified:
    - src/types/common.ts (added SyncQueueOperation type)
    - src/db/schema.ts (retryCount/lastError on syncQueue, expoPushToken on users)
    - src/db/migrations/migrations.js (added m0003 import)
    - src/db/migrations/meta/_journal.json (added 0003_phase7_sync entry)
    - package.json + package-lock.json (3 new packages)

key-decisions:
  - "Inline jest.mock factory for src/lib/supabase in tests — avoids localStorage global not defined in Node env"
  - "authStore has NO persist middleware — session managed by Supabase's own expo-sqlite localStorage persistence"
  - "signOut is non-destructive — local SQLite data belongs to the device, not the session"
  - "deleteAccount calls supabase.rpc('delete_user') for server cleanup before local wipe"
  - "migrateGuestData uses raw execSync (same pattern as deleteAllUserData) — no new repo methods needed"

patterns-established:
  - "Polyfill import order: expo-sqlite/localStorage/install first, react-native-url-polyfill/auto second, createClient third"
  - "Test supabase by mocking src/lib/supabase directly (inline factory), NOT via __mocks__/@supabase"
  - "Guest userId 'default-user' is the FK key for all guest data — enables migration to real UUID"

requirements-completed:
  - SYNC-01

# Metrics
duration: 22min
completed: 2026-03-17
---

# Phase 7 Plan 01: Supabase Foundation Summary

**Supabase client singleton + authStore (guest-default userId) + auth-service lifecycle (signUp keep/fresh, signIn, signOut non-destructive, deleteAccount, migrateGuestData) + sync_queue retry columns + push token column, all with 7 passing TDD tests**

## Performance

- **Duration:** ~22 min
- **Started:** 2026-03-17T20:40:00Z
- **Completed:** 2026-03-17T21:02:00Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Supabase client singleton with correct SDK 54 localStorage polyfill setup and React Native URL polyfill
- authStore provides guest-mode 'default-user' fallback with session/isAuthenticated/syncStatus tracking
- auth-service covers full account lifecycle: signUp with keep/start-fresh choice, signIn, signOut (non-destructive), deleteAccount (RPC + local wipe), migrateGuestData (re-keys all default-user rows)
- DB migration 0003 adds retryCount + lastError to sync_queue and expoPushToken to users
- All 7 auth-service TDD tests pass; all 383 tests in suite pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Supabase client, authStore, and local DB migration** - `99d9fd5` (feat)
2. **Task 2: Auth service with signUp/signIn/signOut/deleteAccount/migrateGuestData + tests** - `056c310` (feat)

## Files Created/Modified

- `src/lib/supabase.ts` - Supabase client singleton with polyfill-first imports
- `src/stores/authStore.ts` - Zustand auth store with guest-mode default userId
- `src/services/auth-service.ts` - Auth operations: signUp (keep/fresh), signIn, signOut, deleteAccount, migrateGuestData
- `src/types/common.ts` - Added SyncQueueOperation type
- `src/db/schema.ts` - Added retryCount/lastError to syncQueue, expoPushToken to users
- `src/db/migrations/0003_phase7_sync.sql` - ALTER TABLE migration for new columns
- `src/db/migrations/migrations.js` - Added m0003 import
- `src/db/migrations/meta/_journal.json` - Added 0003_phase7_sync entry
- `__tests__/services/auth-service.test.ts` - 7 TDD tests (all passing)
- `__mocks__/@supabase/supabase-js.ts` - Jest manual mock with rpc() support
- `__mocks__/@react-native-community/netinfo.ts` - Jest manual mock for NetInfo
- `.env.example` - Supabase env var template
- `package.json` + `package-lock.json` - 3 new packages installed

## Decisions Made

- **Inline jest.mock factory for supabase**: Mocking `src/lib/supabase` directly with an inline factory is required to avoid `localStorage is not defined` errors in Node test environment. The `__mocks__/@supabase/supabase-js.ts` auto-mock is used for sync-engine tests that import supabase-js directly, not via our singleton.
- **No persist middleware on authStore**: Session is persisted by Supabase SDK itself via expo-sqlite localStorage polyfill. Adding Zustand persist on top would create conflicting persistence strategies.
- **Non-destructive signOut**: Offline-first design means local data belongs to device. signOut only clears the auth session. Only deleteAccount wipes local data.
- **migrateGuestData via raw execSync**: Consistent with deleteAllUserData pattern established in Phase 6. No new repo abstractions needed for this one-time migration operation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed sync-engine.test.ts module resolution failure**
- **Found during:** Task 2 (full test suite run after auth-service tests passed)
- **Issue:** sync-engine.test.ts had `jest.mock('../../src/lib/supabase')` (simple auto-mock) causing `localStorage is not defined` error when the module resolved, failing the entire test suite
- **Fix:** Updated mock to use inline factory: `jest.mock('../../src/lib/supabase', () => ({ supabase: { from: jest.fn() } }))`; same fix applied to authStore and syncQueueRepo mocks
- **Files modified:** `__tests__/services/sync-engine.test.ts`
- **Verification:** All 10 sync-engine tests pass; full 383-test suite passes
- **Committed in:** `056c310` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in test mocking)
**Impact on plan:** Required fix to prevent test suite failure from localStorage polyfill side-effect. No scope creep.

## Issues Encountered

- **localhost polyfill in test env**: `expo-sqlite/localStorage/install` sets up the `localStorage` global via expo-sqlite. In Jest's Node environment this global isn't available unless the polyfill runs. Solved by mocking `src/lib/supabase` directly with inline factory so the polyfill never executes in tests.

## User Setup Required

**External services require manual configuration.** Before Phase 7 sync/auth features can be tested end-to-end:

1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` to `.env` and fill in:
   - `EXPO_PUBLIC_SUPABASE_URL` — your project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your anon/public key
3. Create a `delete_user` Postgres function in Supabase for the `deleteAccount` RPC call (implementation in Plan 07-05)

## Next Phase Readiness

- Supabase client singleton ready for sync engine (07-02) and push notification (07-03) plans
- authStore.isAuthenticated gate ready for sync engine auth guard
- authStore.userId ready for sync operations
- sync_queue retryCount + lastError columns ready for syncQueueRepo.markFailed usage
- users.expoPushToken column ready for push notification registration
- All auth-service test patterns (inline factory mocking) can be reused in 07-02 through 07-05

---
*Phase: 07-backend-auth-and-sync*
*Completed: 2026-03-17*
