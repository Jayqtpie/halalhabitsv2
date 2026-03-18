---
phase: 08-critical-integration-wiring
plan: 02
subsystem: auth
tags: [authStore, userId, AccountNudgeBanner, tab-screens, integration-tests]

# Dependency graph
requires:
  - phase: 07-backend-auth-and-sync
    provides: authStore with userId, isAuthenticated, nudgeDismissed fields
  - phase: 07-backend-auth-and-sync
    provides: AccountNudgeBanner component (fully built)
  - phase: 07-backend-auth-and-sync
    provides: titleRepo.getUserTitles(userId) for title unlock detection
provides:
  - All 4 tab screens read userId from useAuthStore instead of hardcoded 'default-user'
  - AccountNudgeBanner mounted on Home HUD with title-unlock trigger logic
  - Integration tests verifying no hardcoded userId remains in tab screens
affects: [future auth wiring, sync wiring, userId-dependent features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useAuthStore((s) => s.userId) hook pattern for tab screen userId access
    - Static file analysis tests for wiring regression protection

key-files:
  created:
    - __tests__/integration/authUserId.test.ts
  modified:
    - app/(tabs)/index.tsx
    - app/(tabs)/habits.tsx
    - app/(tabs)/quests.tsx
    - app/(tabs)/profile.tsx

key-decisions:
  - "useEffect dependency arrays include userId so re-loading triggers on auth state change"
  - "useCallback dependency arrays include userId for handlers that use it in callbacks"
  - "loadGame useEffect in index.tsx now depends on [loadGame, userId] (was [loadGame] only)"
  - "Static analysis tests (fs.readFileSync) chosen over render tests to avoid RN pipeline mocking"

patterns-established:
  - "All tab screen data loads use const userId = useAuthStore((s) => s.userId)"
  - "Callbacks that use userId include it in their dependency array"
  - "AccountNudgeBanner mounted as last layer in index.tsx root View"

requirements-completed: [SYNC-01]

# Metrics
duration: ~15min
completed: 2026-03-18
---

# Phase 08 Plan 02: userId Propagation and AccountNudgeBanner Mount Summary

**authStore userId wired into all 4 tab screens replacing hardcoded 'default-user', with AccountNudgeBanner mounted on Home HUD triggered by first title unlock**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-18T20:44:00Z
- **Completed:** 2026-03-18T20:58:49Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Replaced all hardcoded `'default-user'` constants in index.tsx, habits.tsx, quests.tsx, and profile.tsx with `useAuthStore((s) => s.userId)` hook
- Mounted `AccountNudgeBanner` in the Home HUD (index.tsx) with title-unlock detection via `titleRepo.getUserTitles(userId)` and `TITLE_SEED_DATA` name resolution
- Created 12-test static analysis suite verifying no hardcoded userId remains and banner is properly wired

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace hardcoded userId in all 4 tab screens and mount AccountNudgeBanner** - `48037da` (feat)
2. **Task 2: Create integration tests for userId propagation** - `b1e3d88` (test)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `app/(tabs)/index.tsx` - Removed DEFAULT_USER_ID constant; added useAuthStore, AccountNudgeBanner, titleRepo, TITLE_SEED_DATA imports; added banner trigger useEffect; mounted AccountNudgeBanner as Layer 6
- `app/(tabs)/habits.tsx` - Removed DEFAULT_USER_ID constant; added useAuthStore import; wired userId into loadDailyState, loadGame, and HabitList userId prop
- `app/(tabs)/quests.tsx` - Removed module-level USER_ID constant; added useAuthStore import; wired userId into loadGame, generateQuests, and equipTitle calls
- `app/(tabs)/profile.tsx` - Removed module-level USER_ID constant; added useAuthStore import; wired userId into loadGame, loadDailyState, equipTitle, and userRepo.setActiveTitle calls
- `__tests__/integration/authUserId.test.ts` - Static file analysis tests (12 tests): 4 files x 2 (no constant, imports useAuthStore) + 4 AccountNudgeBanner wiring checks

## Decisions Made
- useEffect dependency arrays updated to include `userId` so data re-loads when auth state changes (sign-in triggers fresh data load with real UUID)
- useCallback dependency arrays updated to include `userId` for handlers using it in closures
- `loadGame` useEffect in index.tsx now depends on `[loadGame, userId]` — was `[loadGame]` only, which would miss re-loads after auth
- Static analysis tests chosen over React Native render tests to avoid the full RN + Expo mocking pipeline complexity

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing test failures in `__tests__/db/repos/syncQueueWiring.test.ts` (6 tests) were present before this plan and are out of scope for 08-02. They relate to sync queue wiring that belongs to plan 08-01.

## Next Phase Readiness
- All 4 tab screens now use real userId from authStore post sign-in
- Guest mode still works — authStore defaults userId to 'default-user' when unauthenticated
- AccountNudgeBanner will appear for guest users after their first title unlock
- Ready for Phase 09 (verification cleanup) or production testing

---
*Phase: 08-critical-integration-wiring*
*Completed: 2026-03-18*
