---
phase: 07-backend-auth-and-sync
plan: "04"
subsystem: auth-lifecycle
tags: [auth, sync, lifecycle, default-user, data-export]
dependency_graph:
  requires: [07-01, 07-02]
  provides: [auth-session-wiring, sync-on-foreground, push-token-registration, authstore-userId-in-components]
  affects: [app/_layout.tsx, all-habit-components, muhasabah-components, game-components, data-export]
tech_stack:
  added: []
  patterns: [module-level-guard, onAuthStateChange-pattern, AppState-foreground-trigger]
key_files:
  created: []
  modified:
    - app/_layout.tsx
    - src/components/habits/CustomHabitForm.tsx
    - src/components/habits/PresetLibrary.tsx
    - src/components/muhasabah/MuhasabahStep2.tsx
    - src/components/muhasabah/MuhasabahStep3.tsx
    - src/components/game/CelebrationManager.tsx
    - src/services/data-export.ts
    - __tests__/services/data-export.test.ts
decisions:
  - "useAuthStore.getState().userId in render callbacks (not hook) — avoids rules-of-hooks violations in event handlers and callbacks"
  - "Server-side deletion is non-fatal try/catch — local deletion always proceeds even if Supabase is unreachable"
  - "syncQueueRepo.clearAll() placed after store resets to avoid partial state"
metrics:
  duration: "~3 minutes"
  completed: "2026-03-18"
  tasks: 2
  files: 8
---

# Phase 7 Plan 04: Auth Wiring and Default-User Cleanup Summary

Auth session management wired into root layout via onAuthStateChange + AppState, all 5 hardcoded 'default-user' component references replaced with authStore.userId, and data-export extended with server-side Supabase deletion on sign-out/account delete.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Root layout auth wiring and push token registration | 497ae83 | app/_layout.tsx |
| 2 | Replace default-user and extend data-export | e57f530 | 7 files |

## What Was Built

### Task 1 — Root Layout Auth Wiring (pre-committed)

The root layout (`app/_layout.tsx`) already had been committed at `497ae83` with:

- **onAuthStateChange subscription** — Updates `authStore.setSession(session)` on every Supabase auth event. Unsubscribes on unmount.
- **Push token registration** — On every `SIGNED_IN` event, checks notification permission and registers the Expo push token in the `users` table. Handles reinstall and new device cases.
- **AppState token refresh guard** — Module-level listener with `appStateListenerRegistered` flag prevents double-registration on hot reload. Calls `startAutoRefresh()` on foreground, `stopAutoRefresh()` on background.
- **Sync-on-foreground** — Separate AppState effect flushes sync queue whenever app becomes active and user is authenticated. Non-fatal try/catch.

### Task 2 — Default-User Replacement + Data Export Extension

**5 components updated:**

1. `CustomHabitForm.tsx` — `userId: useAuthStore.getState().userId` replaces `'default-user'`
2. `PresetLibrary.tsx` — same pattern for newHabit creation
3. `MuhasabahStep2.tsx` — removed `DEFAULT_USER_ID` const; `loadDailyState` call uses `useAuthStore.getState().userId`
4. `MuhasabahStep3.tsx` — `submit(useAuthStore.getState().userId)` replaces `submit('default-user')`
5. `CelebrationManager.tsx` — removed `DEFAULT_USER_ID` const; `equipTitle` call uses `useAuthStore.getState().userId`

**data-export.ts extended:**

- Added `supabase`, `useAuthStore`, and `syncQueueRepo` imports
- `deleteAllUserData` now checks `isAuthenticated` and deletes from all syncable server tables (`xp_ledger`, `user_titles`, `quests`, `habits`, `settings`, `users`) before local deletion
- After store resets, calls `syncQueueRepo.clearAll()` to clean up the offline queue

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test suite failure after adding supabase import to data-export.ts**
- **Found during:** Task 2 verification (jest run)
- **Issue:** `data-export.ts` now imports `src/lib/supabase.ts`, which calls `localStorage` at module load time — not available in Node/Jest environment.
- **Fix:** Added `jest.mock('../../src/lib/supabase', ...)`, `jest.mock('../../src/stores/authStore', ...)`, and `syncQueueRepo: { clearAll: jest.fn() }` to `data-export.test.ts`. Same pattern used in auth-service tests (Phase 07-01 decision).
- **Files modified:** `__tests__/services/data-export.test.ts`
- **Commit:** e57f530

## Verification Results

- `npx jest --no-coverage` — 383 tests pass, 24 suites (10 new tests from mock additions)
- Grep for `'default-user'` in `src/components/` returns zero matches
- Grep for `'default-user'` in `src/` returns only `authStore.ts` (guest default) and `auth-service.ts` (migration SQL)
- `app/_layout.tsx` contains: `onAuthStateChange`, `setSession`, `startAutoRefresh`, `stopAutoRefresh`, `getExpoPushTokenAsync`, `flushQueue`, `appStateListenerRegistered`, `useMigrations`, `Stack.Protected`, `MuhasabahModal`
- `data-export.ts` contains `supabase.from(table).delete()` and `syncQueueRepo.clearAll()`

## Self-Check: PASSED

Files verified present:
- app/_layout.tsx — exists, contains all required patterns
- src/services/data-export.ts — exists, has server-side deletion
- src/components/habits/CustomHabitForm.tsx — useAuthStore.getState().userId present
- src/components/habits/PresetLibrary.tsx — useAuthStore.getState().userId present
- src/components/muhasabah/MuhasabahStep2.tsx — DEFAULT_USER_ID removed
- src/components/muhasabah/MuhasabahStep3.tsx — useAuthStore.getState().userId present
- src/components/game/CelebrationManager.tsx — DEFAULT_USER_ID removed
- __tests__/services/data-export.test.ts — mocks added

Commits verified:
- 497ae83 — feat(07-04): wire auth session management into root layout
- e57f530 — feat(07-04): replace default-user with authStore.userId and extend data-export
