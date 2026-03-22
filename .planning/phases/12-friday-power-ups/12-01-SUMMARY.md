---
phase: 12-friday-power-ups
plan: "01"
subsystem: domain
tags: [friday-engine, xp-multiplier, al-kahf, notification-copy, quest-templates, tdd]
dependency_graph:
  requires: []
  provides:
    - src/domain/friday-engine.ts (isFriday, getFridayMultiplier, combinedMultiplier, getAlKahfExpiry, getWeekNumber)
    - src/domain/notification-copy.ts (getFridayMessage, getFridayMessageTitle)
    - src/domain/quest-templates.ts (ALKAHF_TEMPLATE)
  affects:
    - Plan 02 (friday store wiring and UI)
    - src/domain/quest-engine.ts (targetType union extended)
tech_stack:
  added: []
  patterns:
    - Pure TypeScript domain functions (no React, no DB, no side effects)
    - Dependency injection for getPrayerWindows (testable without real adhan calls)
    - Week-number-based stable message rotation
key_files:
  created:
    - src/domain/friday-engine.ts
    - __tests__/domain/friday-engine.test.ts
  modified:
    - src/domain/quest-engine.ts (targetType union + evaluateQuestProgress switch)
    - src/domain/notification-copy.ts (FRIDAY_MESSAGES, getFridayMessage, getFridayMessageTitle)
    - src/domain/quest-templates.ts (ALKAHF_TEMPLATE)
    - __tests__/domain/notification-copy.test.ts (10 new Friday tests)
decisions:
  - "getAlKahfExpiry uses dependency injection for getPrayerWindows to keep friday-engine.ts pure and testable without real adhan library calls"
  - "ALKAHF_TEMPLATE excluded from QUEST_TEMPLATES array — generated separately by gameStore when isFriday() is true, not selected by selectQuestTemplates()"
  - "getFridayMessage uses weekNumber parameter (not internal state) — deterministic, stable, no module-level counter mutation"
metrics:
  duration_seconds: 174
  completed_date: "2026-03-22"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 4
  tests_added: 32
  tests_total: 462
---

# Phase 12 Plan 01: Friday Engine Domain Module Summary

**One-liner:** Pure TS Friday Power-Ups domain — isFriday/multiplier/Al-Kahf helpers, 10 hadith-sourced Jumu'ah messages, ALKAHF_TEMPLATE with 18-section/100 XP values, 32 new tests all passing.

## What Was Built

### src/domain/friday-engine.ts (new)

Pure TypeScript module with 5 exported functions, zero React/DB imports:

- `isFriday(now?: Date)` — checks `getDay() === 5` against local device time
- `getFridayMultiplier()` — returns constant `2.0`
- `combinedMultiplier(streakMultiplier, fridayMultiplier)` — multiplicative stacking
- `getWeekNumber(now?: Date)` — stable ISO week number for copy rotation
- `getAlKahfExpiry(lat, lng, today, calcMethod, getPrayerWindowsFn)` — Maghrib-based expiry with midnight fallback, dependency-injected prayer function for testability

### src/domain/quest-engine.ts (modified)

Extended `QuestTemplate.targetType` union with `'alkahf_sections'`. Added case in `evaluateQuestProgress` that increments progress by `completionCount ?? 1` (same as `total_completions` pattern — Al-Kahf sections reported manually via UI taps).

### src/domain/notification-copy.ts (modified)

Added `FRIDAY_MESSAGES` array with 10 entries — all adab-safe, none containing forbidden words (missed/failed/shame/disappointed/lazy/forgot). Three entries carry hadith attribution:
- Muslim 854 (best day the sun rises on is Friday)
- Bukhari 935 (the hour on Friday)
- Abu Dawud 1047 (salawat upon the Prophet)

Exported `getFridayMessage(weekNumber)` (deterministic, week-stable) and `getFridayMessageTitle()`.

### src/domain/quest-templates.ts (modified)

Added `ALKAHF_TEMPLATE` as a separate named export (NOT in `QUEST_TEMPLATES` array). Template values: `id: 'friday-alkahf'`, `targetType: 'alkahf_sections'`, `targetValue: 18`, `xpReward: 100`, `minLevel: 1`, `type: 'daily'`.

## Test Coverage

- `__tests__/domain/friday-engine.test.ts` — 22 tests covering all 5 functions
- `__tests__/domain/notification-copy.test.ts` — 10 new tests added (adab compliance, rotation, week stability)
- Full suite: 462 tests, 28 suites, 0 failures

## Deviations from Plan

None — plan executed exactly as written.

The dependency injection pattern for `getPrayerWindowsFn` was specified in the plan's action section and was followed precisely. No architectural deviations required.

## Known Stubs

None. All exported values are fully functional constants and pure functions. No data is hardcoded to empty or placeholder values that would affect runtime behavior.

## Self-Check: PASSED

Files exist:
- FOUND: src/domain/friday-engine.ts
- FOUND: src/domain/notification-copy.ts (modified)
- FOUND: src/domain/quest-templates.ts (modified)
- FOUND: __tests__/domain/friday-engine.test.ts

Commits exist:
- FOUND: 6de9da2 (Task 1 — friday-engine.ts + quest-engine.ts extension + tests)
- FOUND: 88cb262 (Task 2 — notification-copy Friday messages + ALKAHF_TEMPLATE)
