---
phase: 04-game-engine-and-progression
plan: 01
subsystem: game-engine
tags: [xp-engine, title-engine, quest-engine, domain, tdd, pure-ts]

requires:
  - phase: 03-06
    provides: streak-engine pattern (template for pure domain modules)
provides:
  - XP calculation with streak multiplier and soft daily cap
  - Level derivation from cumulative XP (blueprint-exact values)
  - Level-up detection with previousLevel/newLevel
  - 26 Identity Titles seed data with unlock conditions
  - Title unlock condition evaluation (checkTitleUnlocks)
  - 31 quest templates (20 daily, 8 weekly, 3 stretch)
  - Quest template selection with level-gating, no-repeat, relevance filter
  - Quest progress evaluation per completion event
affects: [04-02, 04-03]

tech-stack:
  added: []
  patterns:
    - Pure TS domain module (no React, no DB, no side effects)
    - TDD red-green-refactor cycle (per streak-engine template)
    - Blueprint simulation table as authoritative XP values

key-files:
  created:
    - src/domain/xp-engine.ts
    - src/domain/level-copy.ts
    - src/domain/title-engine.ts
    - src/domain/title-seed-data.ts
    - src/domain/quest-engine.ts
    - src/domain/quest-templates.ts
    - __tests__/domain/xp-engine.test.ts
    - __tests__/domain/title-engine.test.ts
    - __tests__/domain/quest-engine.test.ts
  modified: []

key-decisions:
  - "Used blueprint simulation table (xpToNextLevel 1-10) not formula description: xpForLevel(5)=915, xpForLevel(10)=7232 exactly"
  - "Blueprint formula '40 * level^1.85' in text is approximate; table values are canonical"
  - "levels 11+ use floor(40 * level^1.85) formula which produces monotonically increasing values"
  - "simultaneous_streaks condition checks both simultaneousStreaks14 and simultaneousStreaks90"
  - "Quest template pool uses Claude-authored content matching blueprint examples and XP ranges"

metrics:
  duration: 13min
  completed: "2026-03-15"
  tasks: 2
  files_created: 9
  tests_added: 121
  tests_total_domain: 164
---

# Phase 4 Plan 01: Game Engine Domain Modules Summary

**Three pure TypeScript game engine modules (XP, titles, quests) built TDD with 121 new tests, using blueprint simulation table values as authoritative XP progression targets**

## Performance

- **Duration:** ~13 min
- **Tasks:** 2/2
- **Files created:** 9 (6 domain + 3 test)
- **Tests added:** 121 (51 xp-engine, 32 title-engine, 38 quest-engine)
- **Domain test suite:** 164 tests, all green

## Accomplishments

### Task 1: XP Engine + Level Copy (TDD)

**xp-engine.ts** (exported: `calculateXP`, `xpForLevel`, `xpToNextLevel`, `levelForXP`, `applySoftCap`, `XPResult`)
- Per-level XP costs for levels 1-10 taken directly from blueprint simulation table (authoritative)
- `xpForLevel(5)` = 915, `xpForLevel(10)` = 7232 (exact blueprint requirements)
- Levels 11+ use `floor(40 * level^1.85)` formula (monotonically increasing)
- Soft daily cap at 500 XP with 50% diminishing returns above cap
- `calculateXP()` returns full `XPResult` including `didLevelUp`, `previousLevel`, `newLevel`
- Binary search `levelForXP()` for O(log n) level derivation

**level-copy.ts** (exported: `getLevelUpCopy`)
- Locked milestone strings for levels 5, 10, 20, 50 from CONTEXT.md
- Range copy for non-milestone levels following wise mentor voice pattern
- 51 tests passing

### Task 2: Title Engine + Quest Engine (TDD)

**title-seed-data.ts** (exported: `TITLE_SEED_DATA`)
- All 26 Identity Titles from blueprint/04-worldbuilding.md
- Distribution: 10 common (sortOrder 1-10), 10 rare (11-20), 6 legendary (21-26)
- Complete flavor text for all titles from blueprint

**title-engine.ts** (exported: `checkTitleUnlocks`, `TitleCondition`, `PlayerStats`)
- Pure function evaluating all 10 unlock types: onboarding, total_completions, level_reach, habit_type_streak, habit_streak, quest_completions, mercy_recoveries, simultaneous_streaks, muhasabah_streak, habit_count
- Skips already-unlocked titles (Set-based O(1) lookup)
- Returns array of newly unlocked title IDs

**quest-templates.ts** (exported: `QUEST_TEMPLATES`)
- 31 templates: 20 daily (25-50 XP, minLevel 1-5), 8 weekly (100-200 XP, minLevel 5-8), 3 stretch (300-500 XP, minLevel 8-10)
- Based on blueprint/05-feature-systems.md examples + Claude-authored variants

**quest-engine.ts** (exported: `selectQuestTemplates`, `evaluateQuestProgress`, `isRelevantToPlayer`, `QuestTemplate`)
- `selectQuestTemplates()`: filters by type + level + no-repeat + relevance, Fisher-Yates shuffle, returns up to `count`
- `evaluateQuestProgress()`: increments progress clamped to targetValue; handles all 7 targetTypes
- `isRelevantToPlayer()`: habit_type templates filtered to player's active habit types
- 70 tests passing

## Task Commits

1. **Task 1: XP Engine + Level Copy** — `2ea3e21`
   - `src/domain/xp-engine.ts`, `src/domain/level-copy.ts`, `__tests__/domain/xp-engine.test.ts`

2. **Task 2: Title Engine + Quest Engine** — `b33dedc`
   - `src/domain/title-engine.ts`, `src/domain/title-seed-data.ts`, `src/domain/quest-engine.ts`, `src/domain/quest-templates.ts`, `__tests__/domain/title-engine.test.ts`, `__tests__/domain/quest-engine.test.ts`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Blueprint XP formula description vs. simulation table values**
- **Found during:** Task 1 implementation
- **Issue:** The plan states "xpToNextLevel(2) returns floor(40 * 2^1.85) = ~137" but `floor(40 * 2^1.85)` = 144, not 137. The blueprint text says exponent is 1.85 but the simulation table values (40, 137, 278, 460...) imply a different exponent (~1.776 for levels 1-10).
- **Fix:** Used the blueprint simulation table values directly as per-level costs for levels 1-10 (the authoritative source). This ensures `xpForLevel(5)` = exactly 915 and `xpForLevel(10)` = exactly 7232 as required. Levels 11+ use `floor(40 * level^1.85)` which gives monotonically increasing values.
- **Files modified:** `src/domain/xp-engine.ts`
- **Commit:** `2ea3e21`

## Success Criteria Verification

- [x] xp-engine: calculateXP, levelForXP, applySoftCap all tested and passing (51 tests)
- [x] title-engine: checkTitleUnlocks verified against all 10 unlock types (32 tests)
- [x] quest-engine: selectQuestTemplates and evaluateQuestProgress tested (38 tests)
- [x] Blueprint XP targets validated: Level 5 = 915 (exact), Level 10 = 7232 (exact)
- [x] All 26 title seeds present with correct rarity distribution (10/10/6)
- [x] All 31 quest templates present with correct type distribution (20/8/3)
- [x] Zero React or DB imports in any domain file

## Self-Check: PASSED

- All 9 domain files exist on disk
- Commits 2ea3e21 and b33dedc verified in git log
- xpForLevel(5) = 915 (confirmed via Jest)
- xpForLevel(10) = 7232 (confirmed via Jest)
- 164 domain tests all green
