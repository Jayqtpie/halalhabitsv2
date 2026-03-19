---
phase: 03-core-habit-loop
plan: 06
subsystem: prayer-mercy-calendar
tags: [prayer-times, mercy-mode, calendar, streak-shield, calc-method, recovery]
dependency_graph:
  requires: [03-04, 03-05]
  provides: [prayer-time-windows, mercy-mode-banner, recovery-tracker, habit-calendar, calc-method-picker]
  affects: [habits-tab, habit-card, settings-store]
tech_stack:
  added: []
  patterns: [modal-bottom-sheet, pixel-grid-icon, calendar-grid, recovery-state-machine]
key_files:
  created:
    - src/components/prayer/PrayerTimeWindow.tsx
    - src/components/prayer/CalcMethodPicker.tsx
    - src/components/habits/MercyModeBanner.tsx
    - src/components/habits/MercyModeRecoveryTracker.tsx
    - src/components/calendar/HabitCalendar.tsx
    - src/components/ui/PixelGearIcon.tsx
  modified:
    - src/components/habits/HabitCard.tsx
    - src/components/habits/HabitList.tsx
    - src/stores/settingsStore.ts
    - app/(tabs)/habits.tsx
key_decisions:
  - "Pixel gear icon for settings button (to be revisited for polish)"
  - "Empty state '+' is tappable, triggers same add-habit flow as FAB"
  - "Mercy Mode banner uses locked compassionate copy — no shame language"
  - "Calendar is simple completed/not binary (no heat intensity for v1)"
  - "PRAY-04 deferred to Phase 6 with TODO comment"
metrics:
  duration: ~15min
  completed: 2026-03-10
  tasks_completed: 3
  tasks_total: 3
  files_created: 6
  files_modified: 4
---

# Phase 3 Plan 06: Prayer, Mercy Mode & Calendar Summary

Prayer time windows on salah cards, Mercy Mode compassionate recovery, calendar heatmap, and calc method picker — completing the full daily discipline loop.

## What Was Built

### Task 1: Prayer Time Windows & Calc Method Picker (01c5814)
- `src/components/prayer/PrayerTimeWindow.tsx`: Time range badge with active/upcoming/passed status for salah cards
- `src/components/prayer/CalcMethodPicker.tsx`: Modal selector for 6+ prayer calculation methods (ISNA, MWL, Egyptian, etc.)
- `src/components/ui/PixelGearIcon.tsx`: Pixel-art settings gear icon (12x12 grid)
- Updated `src/stores/settingsStore.ts` with location persistence (lat, lng, name)
- Updated `src/components/habits/HabitCard.tsx` with PrayerTimeWindow integration and Streak Shield indicator
- PRAY-04 deferred to Phase 6 with TODO comment

### Task 2: Mercy Mode Banner, Recovery Tracker & Calendar (e3fbfd2)
- `src/components/habits/MercyModeBanner.tsx`: Compassionate streak break banner with exact locked copy ("Your momentum paused. The door of tawbah is always open.")
- `src/components/habits/MercyModeRecoveryTracker.tsx`: 3-step visual progress tracker with encouraging copy at each step
- `src/components/calendar/HabitCalendar.tsx`: Monthly calendar grid with completion history, streak stats, month navigation
- Wired all components into `app/(tabs)/habits.tsx` with store callbacks

### Task 3: On-Device Verification (human checkpoint)
- User verified complete habit loop on device
- Fixes applied during verification:
  - Empty state "+" made tappable (same as FAB)
  - Gear icon redesigned (still needs future polish)
  - Reanimated version mismatch resolved (SDK 54 compatible)
  - Mercy mode migration registered in migrations.js

## Deviations from Plan

- Gear icon pixel art needs future redesign (user flagged, deferred)
- Reanimated 4.1.1 → SDK 54-compatible downgrade required before device testing

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 01c5814 | Prayer time windows, calc method picker, streak shield |
| 2 | e3fbfd2 | Mercy Mode banner, recovery tracker, calendar heatmap |
| bugfix | d2beca3 | Register mercy mode migration in migrations.js |
| wip | 27417f9 | Reanimated blocker checkpoint |

## Self-Check: PASSED

- All 6 created files verified
- 4 modified files verified
- User approved on-device verification
- Complete Phase 3 feature set delivered
