---
phase: 12-friday-power-ups
plan: 03
subsystem: ui
tags: [react-native, components, quest, habit, friday, accessibility, haptics]

# Dependency graph
requires:
  - phase: 12-friday-power-ups/12-01
    provides: friday-engine.ts with isFriday(), getAlKahfExpiry(), gameStore Al-Kahf quest generation
provides:
  - AlKahfQuestCard component with 18-section progress tracker and Maghrib deadline
  - JumuahToggle component with emerald honor-system toggle and haptic feedback
  - QuestBoardScreen (quests.tsx) conditionally renders AlKahfQuestCard on Fridays
  - HabitCard conditionally renders JumuahToggle and inline Jumu'ah badge for Dhuhr on Fridays
affects: [phase-13, any screen consuming QuestBoardScreen or HabitCard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Friday conditional render: isDhuhr && isFriday() for zero-cost non-Friday rendering"
    - "Section chip tap-to-toggle: local boolean[] state + atomic repo sync on each tap"
    - "Inline badge pattern: small pill inside centerContent nameRow, same emerald-400 color as shieldText"
    - "Footer row pattern: View appended inside Animated.View after Pressable for card-level sub-components"

key-files:
  created:
    - src/components/quests/AlKahfQuestCard.tsx
    - src/components/habits/JumuahToggle.tsx
  modified:
    - app/(tabs)/quests.tsx
    - src/components/habits/HabitCard.tsx

key-decisions:
  - "AlKahf section progress stored as boolean[] locally, synced via questRepo.updateProgressAtomic on each chip tap"
  - "Midnight fallback detection: hours===0 && minutes===0 on expiresAt shows 'Complete by midnight' instead of Maghrib time"
  - "JumuahToggle haptic fires on toggle ON only (confirmation), not on toggle OFF"
  - "JumuahToggle state is local to HabitCard (no persistence needed — honor system, no XP awarded from toggle)"

patterns-established:
  - "Footer row inside Animated.View: conditionally rendered View below Pressable, within card boundary"
  - "Inline badge in nameRow: flexDirection row with gap xs, flexShrink 0 on badge to prevent text truncation"

requirements-completed: [FRDY-02, FRDY-03]

# Metrics
duration: 4min
completed: 2026-03-22
---

# Phase 12 Plan 03: Al-Kahf Quest Card and Jumu'ah Toggle Summary

**AlKahfQuestCard with 18-section scrollable progress chips and Maghrib deadline, plus JumuahToggle emerald honor-system toggle for Dhuhr slot — both Friday-conditional with full accessibility**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-22T06:29:51Z
- **Completed:** 2026-03-22T06:33:07Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- AlKahfQuestCard with header row (title + +100 XP badge), Maghrib deadline line, 18 scrollable section chips, and three states (active emerald border glow, completed with "Jumu'ah honored!", expired opacity 0.45)
- JumuahToggle with emerald-400 themed row, honor-system toggle circle (matching HabitCard checkCircle pattern), haptic on toggle ON, full accessibility as checkbox role
- QuestBoardScreen (quests.tsx) conditionally renders AlKahfQuestCard as first card above quest sections on Fridays only
- HabitCard conditionally renders inline Jumu'ah badge next to Dhuhr name AND JumuahToggle footer row on Fridays only — both removed on non-Fridays via conditional render

## Task Commits

Each task was committed atomically:

1. **Task 1: Build AlKahfQuestCard with 18-section progress tracker** - `6f59a6b` (feat)
2. **Task 2: Build JumuahToggle and integrate into HabitCard for Dhuhr slot** - `2e27890` (feat)

## Files Created/Modified

- `src/components/quests/AlKahfQuestCard.tsx` - Created — Friday Al-Kahf quest card with progress tracker, 3 visual states, accessibility
- `src/components/habits/JumuahToggle.tsx` - Created — Emerald honor-system toggle for Jumu'ah attendance with haptic feedback
- `app/(tabs)/quests.tsx` - Modified — imports AlKahfQuestCard and isFriday, renders card as first item on Fridays
- `src/components/habits/HabitCard.tsx` - Modified — adds isDhuhr detection, nameRow + inline badge, JumuahToggle footer

## Decisions Made

- Section progress stored as `boolean[]` in local component state, initialized from `quest.progress`, synced to DB on each chip tap via `questRepo.updateProgressAtomic` — lightweight and responsive
- Midnight fallback detection uses `hours===0 && minutes===0` check on `expiresAt` to show "Complete by midnight" when no location is available (Maghrib cannot be computed)
- Haptic feedback fires only on toggle ON (confirmation of attendance), not on toggle OFF — avoids double haptic feel
- JumuahToggle state is local-only in HabitCard (`useState`) because the toggle is an honor-system personal acknowledgment with no XP award and no persistence requirement

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — TypeScript compiled cleanly (only pre-existing errors in mock files, test files, and Edge Function Deno types). All 462 tests pass.

## Known Stubs

None — AlKahfQuestCard reads live quest data from `gameStore.quests` (generated by Plan 01's friday-engine integration). JumuahToggle fires haptic and calls `onToggle` callback. No hardcoded empty data flows to UI.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Friday Power-Ups UI is complete: FridayBoostBadge (Plan 02), AlKahfQuestCard and JumuahToggle (Plan 03)
- All three components gate on `isFriday()` from friday-engine.ts
- Quest Board and Habit list both conditionally render Friday content
- Phase 12 is complete — ready for Phase 13 (Nafs Boss Arena or next v2.0 feature)

---
*Phase: 12-friday-power-ups*
*Completed: 2026-03-22*
