---
phase: 14-nafs-boss-arena
plan: 03
subsystem: game-engine
tags: [zustand, boss-battle, title-system, xp-pipeline, sqlite]

requires:
  - phase: 14-nafs-boss-arena
    provides: boss-engine.ts pure domain functions (Wave 1)
  - phase: 14-nafs-boss-arena
    provides: bossRepo.ts SQLite repository (Wave 2)

provides:
  - useBossStore Zustand store orchestrating full boss battle lifecycle
  - boss_defeats unlock type in TitleCondition and PlayerStats
  - 3 tiered boss arena Identity Titles (The Challenger, The Warrior of Nafs, Conqueror of Nafs)
  - gameStore.checkTitles extended with bossDefeats stat via bossRepo.getDefeatedCount

affects:
  - 14-04 (UI screens will consume useBossStore state)
  - 14-05 (integration verification will run full boss lifecycle)

tech-stack:
  added: []
  patterns:
    - "Zustand store without persist — boss data lives in SQLite via bossRepo (same as detoxStore)"
    - "Multi-day catch-up on loadActiveBattle — processes missed days with full-miss penalty"
    - "pendingDefeatCelebration / pendingEscapeNotice queue for UI celebration screens"
    - "Dynamic import for habitStore in startBattle to avoid circular dependency"
    - "Static analysis test pattern for store wiring verification (same as detoxStore.test.ts)"

key-files:
  created:
    - src/stores/bossStore.ts
    - __tests__/stores/bossStore.test.ts
  modified:
    - src/domain/title-engine.ts
    - src/domain/title-seed-data.ts
    - src/stores/gameStore.ts
    - __tests__/domain/title-engine.test.ts

key-decisions:
  - "mercyModeActive not in settingsStore — fixed to check habitStore.mercyModes for any active mercy mode at battle start (Rule 1 auto-fix)"
  - "BOSS_TITLES added as separate section in title-seed-data.ts (sortOrder 28-30) rather than modifying RARE_TITLES/LEGENDARY_TITLES arrays"
  - "bossStore uses dynamic import for habitStore (same pattern as gameStore uses for habitStore) to avoid circular dependency"

patterns-established:
  - "Boss battle defeat flow: bossRepo.defeat -> awardXP('boss_defeat', 1.0, fullXp) -> checkTitles"
  - "Boss escape flow: bossRepo.escape -> calculatePartialXp -> awardXP('boss_defeat', 1.0, partialXp)"
  - "Daily outcome guard: compare battle.updatedAt date string to todayDateStr() before processing"

requirements-completed: [BOSS-01, BOSS-02, BOSS-04, BOSS-05, BOSS-06, BOSS-08]

duration: ~8min
completed: 2026-03-23
---

# Phase 14 Plan 03: Boss Arena State Management Summary

**Zustand bossStore with multi-day catch-up, defeat/escape XP flows, and 30-title system with boss_defeats unlock type**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-23T20:09:00Z
- **Completed:** 2026-03-23T20:17:05Z
- **Tasks:** 2 of 2
- **Files modified:** 6

## Accomplishments

- Extended title-engine.ts and title-seed-data.ts with `boss_defeats` unlock type, `bossDefeats` stat field, and 3 new tiered titles (The Challenger at 1 defeat, The Warrior of Nafs at 3, Conqueror of Nafs at 6) — TITLE_SEED_DATA expanded from 27 to 30 entries
- Created bossStore.ts with full battle lifecycle: loadActiveBattle (with multi-day catch-up for app-closed days), startBattle, processDailyOutcome (defeat/escape/continue branches), abandonBattle, canStart, clearCelebration, clearEscapeNotice
- Wired gameStore.checkTitles to include `bossRepo.getDefeatedCount` in the parallel Promise.all and pass `bossDefeats` to PlayerStats
- All 119 tests pass across boss-engine, title-engine, and bossStore test suites

## Task Commits

1. **Task 1: Extend title-engine and title-seed-data with boss_defeats** - `a6ed277` (feat)
2. **Task 2: Create bossStore.ts and update gameStore.checkTitles** - `d17c07b` (feat)

## Files Created/Modified

- `src/domain/title-engine.ts` — Added `'boss_defeats'` to TitleCondition.unlockType union, `bossDefeats: number` to PlayerStats, and `case 'boss_defeats'` to isTitleUnlocked switch
- `src/domain/title-seed-data.ts` — Added `'boss_defeats'` to TitleSeedEntry.unlockType union, new BOSS_TITLES section with 3 entries at sortOrder 28-30
- `src/stores/bossStore.ts` — New Zustand store: full boss battle lifecycle orchestration
- `src/stores/gameStore.ts` — Added bossRepo import, bossRepo.getDefeatedCount to Promise.all, bossDefeats to PlayerStats
- `__tests__/domain/title-engine.test.ts` — Updated count assertions (27->30, rare 11->12, legendary 6->8), added boss_defeats validType, bossDefeats to baseStats, 3 new boss_defeats test cases
- `__tests__/stores/bossStore.test.ts` — 40 static analysis tests verifying all store wiring contracts

## Decisions Made

- Used `generateId()` from `../utils/uuid` (project-established pattern) instead of `expo-crypto.randomUUID()` as mentioned in the plan spec
- BOSS_TITLES added as a separate named array section rather than inline in LEGENDARY_TITLES for clarity and future extensibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] mercyModeActive not present in settingsStore**
- **Found during:** Task 2 (startBattle implementation)
- **Issue:** Plan spec referenced `useSettingsStore.getState().mercyModeActive` which doesn't exist in settingsStore — mercy mode is per-habit state in habitStore.mercyModes, not a global setting
- **Fix:** Dynamic import of habitStore and check `Object.values(habitMercyModes).some(m => m?.active === true)` — semantically correct: battle starts with mercy mode if ANY active habit currently has mercy mode enabled
- **Files modified:** src/stores/bossStore.ts
- **Verification:** TypeScript compiles, bossStore tests pass, no undefined access errors
- **Committed in:** d17c07b (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — non-existent store field reference)
**Impact on plan:** Fix was necessary for correctness. Semantics preserved — mercyMode captures player's current mercy state at battle start.

## Issues Encountered

- The worktree was on an older branch that pre-dated Wave 1/2 commits. Resolved by merging master (`git merge master`) to bring in boss-engine.ts, boss-content.ts, and bossRepo.ts before beginning execution.

## Known Stubs

None — all data flows are wired. bossStore reads from bossRepo (SQLite), game state from gameStore.currentLevel, and mercy mode from habitStore.mercyModes. pendingDefeatCelebration and pendingEscapeNotice are populated with real XP values from the boss-engine calculations.

## Next Phase Readiness

- useBossStore is ready for UI consumption by Plan 14-04 (BossArenaScreen, ArchetypeSelectSheet, BattleProgressSheet)
- All wiring contracts verified by 40 static analysis tests
- gameStore.checkTitles will now fire title unlocks for boss milestones on defeat

---
*Phase: 14-nafs-boss-arena*
*Completed: 2026-03-23*
