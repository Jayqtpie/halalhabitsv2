---
phase: 03-core-habit-loop
plan: 01
subsystem: domain-layer
tags: [types, prayer-times, presets, sorting, adhan]
dependency_graph:
  requires: [02-foundation]
  provides: [domain-types, prayer-times-service, habit-presets, habit-sorter]
  affects: [habit-store, prayer-screen, home-screen]
tech_stack:
  added: [adhan, expo-location, expo-haptics, react-native-reanimated]
  patterns: [pure-ts-domain, tdd, adhan-wrapper, contiguous-prayer-windows]
key_files:
  created:
    - src/types/habits.ts
    - src/services/prayer-times.ts
    - src/services/location.ts
    - src/domain/presets.ts
    - src/domain/habit-sorter.ts
    - __tests__/services/prayer-times.test.ts
    - __tests__/domain/presets.test.ts
    - __tests__/domain/habit-sorter.test.ts
  modified:
    - package.json
    - package-lock.json
decisions:
  - "Fajr gets highest salah XP (50) due to difficulty of waking early"
  - "Manual time formatting (h:mm AM/PM) instead of Intl.DateTimeFormat for consistency across platforms"
  - "Contiguous prayer windows: each prayer ends when next begins, Isha ends at next Fajr"
  - "4-group sort: uncompleted salah, uncompleted other, completed salah, completed other"
metrics:
  duration: ~5min
  completed: 2026-03-09
  tasks_completed: 3
  tasks_total: 3
  tests_added: 30
  files_created: 8
  files_modified: 2
---

# Phase 3 Plan 1: Domain Types, Prayer Times & Presets Summary

Pure-TypeScript domain layer with adhan-js prayer time service, 15 Islamic habit presets across 6 categories, and chronological habit sorting logic -- 30 tests, all passing.

## What Was Built

### Task 1: Dependencies & Domain Types (6e78114)
- Installed adhan, expo-location, expo-haptics, react-native-reanimated via `npx expo install`
- Created `src/types/habits.ts` with all Phase 3 domain types:
  - PrayerName, PrayerWindow, CalcMethodKey, CalcMethodInfo, CALC_METHODS
  - PresetHabit, PresetCategory, DifficultyTier
  - StreakState, MercyModeState
  - HabitWithStatus (extends Habit from database.ts)

### Task 2: Prayer Times & Location Services (7b48161)
- `src/services/prayer-times.ts`: adhan-js wrapper with `getPrayerWindows()`, `getNextFajr()`, `formatPrayerTime()`
  - Supports all 6 calculation methods (ISNA, MWL, Egyptian, Karachi, UmmAlQura, MoonsightingCommittee)
  - Contiguous windows: each prayer ends at next prayer's start, Isha ends at next Fajr
  - Status determination: active/upcoming/passed based on optional `now` parameter
- `src/services/location.ts`: expo-location wrapper with `getCoordinates()` and permission handling
- 10 tests covering windows, methods, status, formatting

### Task 3: Presets & Habit Sorter (95889c9)
- `src/domain/presets.ts`: 15 presets across 6 categories
  - Salah (5): Fajr (50xp), Dhuhr (30), Asr (30), Maghrib (30), Isha (35)
  - Quran (2): Daily Reading (25), Memorization (30)
  - Dhikr (2): Morning Adhkar (15), Evening Adhkar (15)
  - Dua (1): Daily Dua (15)
  - Fasting (2): Monday-Thursday (30), White Days (30)
  - Character (3): Gratitude (15), Patience (20), Charity (20)
- `src/domain/habit-sorter.ts`: `sortHabitsForDisplay()` with 4-group ordering
  - Uncompleted salah (Fajr->Isha) > uncompleted other (sortOrder) > completed salah > completed other
- 20 tests covering presets and sorting

## Deviations from Plan

None - plan executed exactly as written.

## Verification

All 30 tests pass across 3 test suites:
- `__tests__/services/prayer-times.test.ts` (10 tests)
- `__tests__/domain/presets.test.ts` (14 tests)
- `__tests__/domain/habit-sorter.test.ts` (6 tests)

No TypeScript errors in new files (drizzle-orm node_modules errors are pre-existing and unrelated).

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 6e78114 | Install deps, create domain types |
| 2 | 7b48161 | Prayer times service + location service |
| 3 | 95889c9 | Habit presets + habit sorter |

## Self-Check: PASSED

- All 8 created files verified on disk
- All 3 task commits verified in git log (6e78114, 7b48161, 95889c9)
- 30/30 tests passing
