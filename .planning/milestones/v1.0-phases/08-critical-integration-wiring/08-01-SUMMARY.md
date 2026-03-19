---
phase: 08-critical-integration-wiring
plan: 01
subsystem: sync
tags: [syncQueueRepo, enqueue, privacy-gate, authStore, offline-first]

# Dependency graph
requires:
  - phase: 07-backend-auth-and-sync
    provides: syncQueueRepo.enqueue() method
  - phase: 07-backend-auth-and-sync
    provides: assertSyncable() privacy gate
  - phase: 07-backend-auth-and-sync
    provides: authStore with isAuthenticated state
provides:
  - All 6 syncable repos wire enqueue() after write operations
  - Auth-gated sync (guests skip enqueue)
  - assertSyncable() defense-in-depth before every enqueue
  - Non-blocking guarantee (enqueue failure never prevents local write)
affects: [sync-engine flush, cloud backup, offline-first data flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Fire-and-forget enqueue with .catch(() => {}) after local DB write
    - useAuthStore.getState() static accessor in non-React repo code
    - assertSyncable() guard before every enqueue call

key-files:
  created:
    - __tests__/db/repos/syncQueueWiring.test.ts
  modified:
    - src/db/repos/habitRepo.ts
    - src/db/repos/xpRepo.ts
    - src/db/repos/questRepo.ts
    - src/db/repos/titleRepo.ts
    - src/db/repos/settingsRepo.ts
    - src/db/repos/userRepo.ts
---

## What shipped

Wired `syncQueueRepo.enqueue()` into all 6 syncable repos (habitRepo, xpRepo, questRepo, titleRepo, settingsRepo, userRepo) so every write operation is automatically enqueued for cloud sync when the user is authenticated.

### Wiring details

| Repo | Methods wired | Entity type | Skipped |
|------|--------------|-------------|---------|
| habitRepo | create, update, archive | habits | reorder (cosmetic) |
| xpRepo | create | xp_ledger | — |
| questRepo | create, updateProgress, updateProgressAtomic, complete | quests | expireOld (bulk) |
| titleRepo | grantTitle | user_titles | seedTitles (static) |
| settingsRepo | upsert | settings | — |
| userRepo | create, updateXP, setActiveTitle | users | — |

### Pattern used
Every write method follows: local DB write → auth check → assertSyncable() → enqueue().catch(() => {}). The entire enqueue block is wrapped in try/catch to guarantee the local write is never blocked.

## Tests
10 tests in `syncQueueWiring.test.ts` covering:
- Enqueue called with correct args on authenticated writes
- Enqueue skipped in guest mode
- Non-blocking guarantee (enqueue throw doesn't prevent local write)
- assertSyncable() ordering before enqueue
- Skip cases (reorder, seedTitles)

## Commits
- `cc8d881` feat(08-01): wire syncQueueRepo.enqueue() into all 6 syncable repos
- `e9f29b7` test(08-01): add sync queue wiring tests (10 passing)

## Self-Check: PASSED
- All 6 repos contain syncQueueRepo.enqueue calls
- All repos import assertSyncable and useAuthStore
- reorder() and seedTitles() correctly excluded
- 10 tests passing

## Deviations
None.
