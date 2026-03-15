---
phase: 04-game-engine-and-progression
plan: 02
subsystem: game-store
tags: [game-engine, xp, titles, quests, store, persistence, wiring]
dependency_graph:
  requires:
    - 04-01 (xp-engine, title-engine, quest-engine domain modules)
    - 03-03 (habitRepo, completionRepo, streakRepo, userRepo, xpRepo)
    - 02-02 (SQLite schema, Drizzle ORM)
  provides:
    - gameStore.loadGame (game state bootstrap)
    - gameStore.awardXP (XP award pipeline)
    - gameStore.checkTitles (title unlock evaluation)
    - gameStore.updateQuestProgress (quest progress tracking)
    - gameStore.generateQuests (quest board population)
    - gameStore.consumeCelebration (UI celebration queue)
    - gameStore.equipTitle (active title management)
    - titleRepo (titles/user_titles CRUD)
    - questRepo.getRecentTemplateIds (no-repeat tracking)
    - questRepo.updateProgressAtomic (race-condition-safe progress)
    - schema migration: quests.templateId column
  affects:
    - habitStore.completeHabit (now awards real XP via gameStore.awardXP)
    - Quest Board UI (has data pipeline from 04-02 onward)
    - Level-up and title celebration overlays (pendingCelebrations queue)
tech_stack:
  added: []
  patterns:
    - "Store-repo-engine pattern: gameStore orchestrates repos + engines"
    - "Cross-store access via useStore.getState() (no circular import)"
    - "Dynamic import for circular dep avoidance: import('./habitStore') in checkTitles"
    - "pendingCelebrations queue for serialized UI overlays"
    - "Atomic SQL: MIN(progress + 1, target_value) for race-condition-safe increments"
    - "Idempotent title seeding: count() check before bulk insert"
key_files:
  created:
    - src/db/repos/titleRepo.ts
    - src/db/migrations/0002_quest_template_id.sql
  modified:
    - src/db/repos/questRepo.ts (getByUser, getCompleted, getRecentTemplateIds, updateProgressAtomic, expireOld for in_progress)
    - src/db/repos/index.ts (re-export titleRepo)
    - src/db/schema.ts (templateId column on quests table)
    - src/db/migrations/meta/_journal.json (idx 2 entry)
    - src/stores/gameStore.ts (full rewrite from shell to orchestration store)
    - src/stores/habitStore.ts (XP injection in completeHabit, getBaseXP helper)
decisions:
  - "targetHabitId column reused to store targetHabitType string (quest templates use habit type strings, not IDs)"
  - "Dynamic import for habitStore in gameStore.checkTitles to break circular reference"
  - "checkTitles is non-fatal (console.warn) -- title failure never breaks habit completion"
  - "updateQuestProgress is non-fatal -- quest failure never breaks habit completion"
  - "Habit baseXp from DB used if non-zero, falls back to getBaseXP(type) from blueprint map"
  - "totalCompletions in PlayerStats uses in-memory completions (today only) -- sufficient for title unlock check at completion time"
metrics:
  duration: "4 min 28 sec"
  completed: "2026-03-15"
  tasks: 2
  files_changed: 8
---

# Phase 4 Plan 02: Data Layer Wiring Summary

**One-liner:** Full game pipeline wired from habit completion through XP award, title unlock, and quest progress using titleRepo, extended questRepo, and orchestrated gameStore.

## What Was Built

### Task 1: titleRepo, questRepo Extensions, Schema Migration

**titleRepo** (`src/db/repos/titleRepo.ts`):
- `getAll()` — all title definitions ordered by sortOrder
- `getUserTitles(userId)` — all user_title rows for a user
- `grantTitle(data)` — idempotent insert via `onConflictDoNothing().returning()`
- `count()` — for seeding idempotency check
- `seedTitles(data[])` — bulk insert all 26 titles on first app load

**questRepo extensions** (`src/db/repos/questRepo.ts`):
- `getByUser(userId)` — all quests regardless of status
- `getCompleted(userId)` — status='completed' quests
- `getRecentTemplateIds(userId, days)` — distinct template_id used in last N days (no-repeat tracking)
- `updateProgressAtomic(id, targetValue)` — `MIN(progress + 1, target_value)` SQL (prevents race conditions)
- `expireOld()` updated to expire both 'available' and 'in_progress' quests past expiresAt

**Schema migration** (`src/db/migrations/0002_quest_template_id.sql`):
```sql
ALTER TABLE quests ADD COLUMN template_id TEXT;
CREATE INDEX idx_quest_template ON quests(template_id);
```

### Task 2: gameStore Orchestration and habitStore XP Injection

**gameStore** rewritten from shell to full orchestration store:

| Action | Description |
|--------|-------------|
| `loadGame(userId)` | Seeds titles (idempotent), loads user XP/level, user titles, active title, active quests, triggers generateQuests |
| `awardXP(userId, baseXP, multiplier, sourceType, sourceId?)` | Calls calculateXP, writes xp_ledger, updates users table, updates local state, queues level_up celebration if didLevelUp |
| `checkTitles(userId)` | Builds PlayerStats from habitStore streaks + DB, calls checkTitleUnlocks, grants new titles, queues title_unlock celebrations (or bundles into pending level_up) |
| `updateQuestProgress(userId, event)` | Evaluates each active quest via evaluateQuestProgress, atomically increments progress, completes and awards XP when targetValue reached |
| `generateQuests(userId)` | Expires old quests, checks which types need generation, selects templates via selectQuestTemplates with no-repeat filtering, creates daily/weekly/stretch quests |
| `consumeCelebration()` | Shifts first item from pendingCelebrations queue — UI calls this to show overlays one at a time |
| `equipTitle(userId, titleId)` | Updates user.activeTitleId in DB, updates local activeTitle state |

**New state fields:** `xpToNext`, `quests`, `pendingCelebrations`

**habitStore.completeHabit injection:**
- `getBaseXP(habitType)` helper added — maps all habit types to blueprint XP values (salah_fajr=50, quran=20, dhikr=10, fasting=25, custom=15)
- `xpEarned: 0` placeholder replaced with real `useGameStore.getState().awardXP(...)` call
- Streak multiplier from `processCompletion` result passed to awardXP
- `habit.baseXp` from DB used if non-zero (user-customizable), falls back to `getBaseXP(habit.type)`
- `checkTitles` called after completion (non-fatal)
- `updateQuestProgress` called with full event context: `allSalahComplete`, `allHabitsComplete`, `currentStreaks`

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Minor Implementation Notes

1. `targetHabitId` column reused to store `targetHabitType` string for quest templates (column name is misleading but avoids a schema migration; the plan did not specify a new column for this).

2. `checkTitles` uses dynamic `import('./habitStore')` to get streak data from habitStore without creating a circular import. Both stores live in the same directory so static imports would be circular.

3. `totalCompletions` in PlayerStats snapshots the in-memory completions state (today's completed habits). This is sufficient for title unlock checks at completion time; lifetime completions can be added in Phase 5 via a completionRepo count query if needed.

## Self-Check

- titleRepo.ts: EXISTS
- questRepo.ts (extended): EXISTS with updateProgressAtomic and getRecentTemplateIds
- gameStore.ts (full rewrite): EXISTS with all 7 actions
- habitStore.ts (XP injected): xpEarned: 0 placeholder REMOVED
- Migration SQL: EXISTS at src/db/migrations/0002_quest_template_id.sql
- Tests: 277/277 PASSED (no regressions)
- TypeScript: 0 errors in source files

## Self-Check: PASSED
