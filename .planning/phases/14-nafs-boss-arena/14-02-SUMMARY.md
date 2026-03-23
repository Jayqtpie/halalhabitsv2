---
phase: 14-nafs-boss-arena
plan: "02"
subsystem: db/repos
tags: [repository, sqlite, drizzle, privacy, boss-battle]
one_liner: "SQLite repository for boss_battles with PRIVATE privacy enforcement — 9 CRUD methods, no sync imports"

dependency_graph:
  requires:
    - src/db/schema.ts (bossBattles table, lines 235-251)
    - src/types/database.ts (BossBattle, NewBossBattle types)
    - src/db/client.ts (getDb)
    - src/services/privacy-gate.ts (PRIVATE classification confirmed)
  provides:
    - src/db/repos/bossRepo.ts (bossRepo object with 9 methods)
  affects:
    - src/db/repos/index.ts (re-export added)
    - Plan 03: bossStore will consume bossRepo

tech_stack:
  added: []
  patterns:
    - Drizzle ORM queries (select, insert, update, selectDistinct)
    - Privacy-gate PRIVATE pattern (mirrors detoxRepo.ts)
    - Static-analysis privacy invariant test (fs.readFileSync + regex)

key_files:
  created:
    - src/db/repos/bossRepo.ts
    - __tests__/db/bossRepo.test.ts
  modified:
    - src/db/repos/index.ts

decisions:
  - Used `ne(bossBattles.status, 'active')` for getLastBattle filter to match "any non-active" semantics
  - Used `selectDistinct` for getDefeatedArchetypes — Drizzle native distinct per-column
  - Followed detoxRepo.ts pattern exactly: no persist, no sync, getDb() called inline per method

metrics:
  duration: "8 minutes"
  completed_date: "2026-03-23"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
---

# Phase 14 Plan 02: bossRepo SQLite Repository Summary

SQLite repository for boss_battles with PRIVATE privacy enforcement — 9 CRUD methods, no sync imports.

## What Was Built

`bossRepo.ts` provides the persistence layer for boss battles. It follows the `detoxRepo.ts` pattern exactly — PRIVATE data stays on device, no sync queue involvement.

### Methods Implemented

| Method | Purpose |
|--------|---------|
| `create(data)` | Insert new boss battle, return inserted row |
| `getActiveBattle(userId)` | Find single active battle or null |
| `getLastBattle(userId)` | Most recent non-active battle (for cooldown) |
| `getAllBattles(userId)` | All battles ordered by startedAt desc |
| `updateDailyOutcome(id, bossHp, currentDay, dailyLog, updatedAt)` | Daily habit resolution update |
| `defeat(id, endedAt)` | Set status='defeated', record end time |
| `escape(id, endedAt)` | Set status='escaped', record end time |
| `getDefeatedCount(userId)` | Count of defeated battles (for title engine) |
| `getDefeatedArchetypes(userId)` | Distinct archetype IDs defeated (for unlock tracking) |

## Privacy Enforcement

- No `syncQueueRepo` import or call
- No `assertSyncable` import or call
- No `enqueueSync` call
- Confirmed by static analysis test in `bossRepo.test.ts`
- boss_battles classified PRIVATE at `src/services/privacy-gate.ts:29` — nafs archetype reveals personal struggle

## Test Results

```
PASS __tests__/db/bossRepo.test.ts
  bossRepo
    privacy invariant
      ✓ never imports or calls assertSyncable
      ✓ never imports or calls syncQueueRepo
      ✓ never calls enqueueSync
    module exports
      ✓ exports bossRepo with all required methods

Tests: 4 passed, 4 total
```

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1: Create bossRepo.ts | f859238 | src/db/repos/bossRepo.ts, src/db/repos/index.ts |
| Task 2: Create bossRepo tests | 1d8ab9f | __tests__/db/bossRepo.test.ts |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- src/db/repos/bossRepo.ts: FOUND
- __tests__/db/bossRepo.test.ts: FOUND
- src/db/repos/index.ts (updated): FOUND
- Commit f859238: FOUND
- Commit 1d8ab9f: FOUND
