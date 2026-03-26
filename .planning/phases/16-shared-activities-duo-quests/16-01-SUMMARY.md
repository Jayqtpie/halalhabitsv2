---
phase: 16-shared-activities-duo-quests
plan: 01
subsystem: domain-engine
tags: [domain, pure-ts, tdd, shared-habits, duo-quests, privacy-gate]
dependency_graph:
  requires: []
  provides:
    - src/domain/shared-habit-engine.ts
    - src/domain/duo-quest-engine.ts
    - src/domain/duo-quest-templates.ts
  affects:
    - future: duoQuestRepo (plan 02)
    - future: sharedHabitRepo (plan 02)
    - future: buddyStore extension (plan 03)
    - future: DuoQuestScreen UI (plan 04+)
tech_stack:
  added: []
  patterns:
    - Pure TypeScript domain engine (no React, no DB, no side effects)
    - TDD Red-Green-Refactor cycle
    - Privacy Gate enforcement via WORSHIP_HABIT_TYPES constant
    - Aggregate-only progress pattern (never expose individual data)
key_files:
  created:
    - src/domain/shared-habit-engine.ts
    - src/domain/duo-quest-engine.ts
    - src/domain/duo-quest-templates.ts
    - __tests__/domain/shared-habit-engine.test.ts
    - __tests__/domain/duo-quest-engine.test.ts
  modified: []
decisions:
  - "WORSHIP_HABIT_TYPES=['salah','muhasabah'] as const — typed array for Privacy Gate"
  - "calculateSharedStreak uses Set intersection + sort desc + consecutive day diff check"
  - "getAggregateProgress returns no userA/userB keys — intentional for privacy (D-05/D-13)"
  - "calculatePartialXP floors result (Math.floor) — no fractional XP"
  - "getDuoQuestStatusTransition: paused+exit=>exited is valid (not in plan spec but correct)"
  - "xpRewardBonus defaults to 0 when not provided in createDuoQuest"
metrics:
  duration_minutes: 4
  completed_date: "2026-03-26"
  tasks_completed: 2
  tasks_total: 2
  files_created: 5
  files_modified: 0
  tests_added: 94
---

# Phase 16 Plan 01: Shared Habit Engine + Duo Quest Engine Summary

**One-liner:** Pure TypeScript domain engines for shared habits and duo quests using TDD, with Privacy Gate enforcement (salah/muhasabah excluded), aggregate-only progress (no individual exposure), and a curated 8-template catalog within XP economy bounds.

## Objective

Establish testable domain logic for Phase 16 (Shared Activities & Duo Quests) before any IO layer. All downstream plans (repos, stores, UI) consume these pure functions.

## Tasks Completed

| Task | Name | Commit | Tests |
|------|------|--------|-------|
| 1 | Shared Habit Engine — TDD Red-Green-Refactor | b3d3574 | 30 passing |
| 2 | Duo Quest Engine + Templates — TDD Red-Green-Refactor | 90caf6e | 64 passing |

**Total: 94 tests, 0 failures**

## Key Exports

### shared-habit-engine.ts
- `WORSHIP_HABIT_TYPES` — `['salah', 'muhasabah'] as const`
- `isEligibleForSharing(habitType)` — returns false for worship types (Privacy Gate D-02)
- `createSharedHabitProposal(params)` — throws on ineligible types, defaults frequency to 'daily'
- `calculateSharedStreak(userADates, userBDates)` — consecutive shared completion count
- `canEndSharedHabit(status)` — true for 'active' or 'proposed', false for 'ended'

### duo-quest-engine.ts
- `MAX_ACTIVE_DUO_QUESTS = 3` (D-08)
- `INACTIVITY_WARNING_MS = 48h` (D-09)
- `INACTIVITY_EXIT_MS = 72h` (D-10)
- `canCreateDuoQuest(activeCount)` — enforces 3-quest max per buddy pair
- `createDuoQuest(params)` — all progress at 0, status=active, expiresAt from durationDays
- `recordProgress(quest, side, increment)` — immutable update, clamps to targetValue, sets completed flag
- `getAggregateProgress(quest)` — totalProgress/totalTarget/percentage, no individual keys (D-05/D-13)
- `checkInactivity(partnerLastProgressAt, now?)` — ok/warning/exit_eligible at 48h/72h
- `calculatePartialXP(params)` — floor(progress/target * xpRewardEach), bonusXP always 0
- `getDuoQuestStatusTransition(current, action)` — state machine returning null for invalid transitions
- `isQuestComplete(quest)` — requires both userACompleted and userBCompleted

### duo-quest-templates.ts
- `DuoQuestTemplate` interface — extends base with durationDays field
- `DUO_QUEST_TEMPLATES` — 8 curated templates:
  - Read Together (7 completions, 10 days, 75+40 XP)
  - Hydration Challenge (5 completions, 7 days, 60+30 XP)
  - Morning Routine (5 completions, 7 days, 80+45 XP)
  - Gratitude Week (7 completions, 10 days, 70+35 XP)
  - Exercise Buddies (5 completions, 7 days, 90+50 XP)
  - Screen-Free Evenings (5 completions, 7 days, 100+55 XP)
  - Early Bird Challenge (3 consecutive days, 5 days, 120+60 XP)
  - Dhikr Together (7 completions, 10 days, 75+40 XP)

## Deviations from Plan

### Auto-added: `paused + exit => exited` transition
- **Found during:** Task 2 implementation
- **Issue:** Plan spec listed only 4 transitions; paused+exit is a valid and necessary escape hatch
- **Fix:** Added the transition to getDuoQuestStatusTransition state machine
- **Classification:** Rule 2 (missing critical functionality for correct operation)

### No other deviations — plan executed as written.

## Adab Safety Rails Verified

- Privacy Gate enforced: salah and muhasabah excluded from WORSHIP_HABIT_TYPES — verified with tests
- Aggregate progress never exposes individual player data — verified by checking return type keys
- No worship-private habits appear in DUO_QUEST_TEMPLATES
- No shame copy or competitive framing in template descriptions

## Known Stubs

None — this plan creates pure domain functions with no UI rendering or data source wiring needed.

## Self-Check: PASSED

All 5 files exist on disk. Both commits (b3d3574, 90caf6e) verified in git log. 94 tests passing with 0 failures.
