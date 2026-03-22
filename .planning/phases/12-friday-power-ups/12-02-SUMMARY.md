---
phase: 12-friday-power-ups
plan: "02"
subsystem: ui
tags: [friday-power-ups, zustand, react-native, reanimated, expo-notifications, HUD, quest-engine]

# Dependency graph
requires:
  - phase: 12-friday-power-ups/12-01
    provides: friday-engine.ts pure functions (isFriday, getFridayMultiplier, combinedMultiplier, getAlKahfExpiry, getWeekNumber), notification-copy.ts Friday messages (getFridayMessage, getFridayMessageTitle), quest-templates.ts ALKAHF_TEMPLATE
provides:
  - Friday 2x XP multiplier wired into habitStore.completeHabit via combinedMultiplier (FRDY-01)
  - Al-Kahf quest generated on Fridays with Maghrib-based expiry in gameStore.generateQuests (FRDY-03)
  - Friday 8AM push notification scheduled in notification-service.rescheduleAll (FRDY-04)
  - FridayBoostBadge component (gold 2xXP chip, Reanimated fade, PressStart2P font)
  - FridayMessageBanner component (hadith overlay, auto-dismiss 8s, condensed pill variant)
  - HudStatBar conditionally renders FridayBoostBadge when isFriday()
  - HudScene renders FridayMessageBanner as React Native sibling outside Skia Canvas
affects: [12-03, HUD rendering, quest board, XP economy, notification scheduling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Friday multiplier injection at call site (not inside awardXP) preserves quest XP exclusion via 1.0 unchanged path"
    - "Reanimated useSharedValue + withTiming for HUD component fade-in/fade-out"
    - "HUD overlays rendered as React Native View siblings outside Skia Canvas (Canvas cannot host RN views)"
    - "withDelay(8000, withTiming(0, { duration: 400 })) for auto-dismiss timing chain"

key-files:
  created:
    - src/components/hud/FridayBoostBadge.tsx
    - src/components/hud/FridayMessageBanner.tsx
  modified:
    - src/stores/habitStore.ts
    - src/stores/gameStore.ts
    - src/services/notification-service.ts
    - src/components/hud/HudStatBar.tsx
    - src/components/hud/HudScene.tsx

key-decisions:
  - "Friday multiplier injected at habitStore.completeHabit call site (not inside awardXP) — preserves quest XP exclusion: quest path keeps 1.0 multiplier unchanged per D-13"
  - "FridayMessageBanner rendered as React Native View sibling outside Skia Canvas — Canvas cannot host React Native views"
  - "HudScene wrapped in View container (StyleSheet.absoluteFill) to allow sibling overlay without breaking Canvas positioning"

patterns-established:
  - "Pattern: Friday state injection — isFriday() called at call site, not inside domain functions, for clean testability"
  - "Pattern: HUD React Native overlays — use sibling View outside Canvas, positioned absolute, not inside Skia Canvas"

requirements-completed:
  - FRDY-01
  - FRDY-02
  - FRDY-03
  - FRDY-04

# Metrics
duration: 25min
completed: 2026-03-22
---

# Phase 12 Plan 02: Friday Power-Ups — Store Wiring and HUD Components Summary

**Friday 2x XP wired into habitStore, Al-Kahf quest generated on Fridays in gameStore, FridayBoostBadge gold chip and FridayMessageBanner hadith overlay integrated into HUD**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-22T07:00:00Z
- **Completed:** 2026-03-22T07:25:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Friday 2x XP multiplier injected at `habitStore.completeHabit` using `combinedMultiplier(streakMultiplier, fridayBonus)` — quest XP path left at 1.0 unchanged (D-13)
- `gameStore.generateQuests` now generates Al-Kahf quest on Fridays with Maghrib-based expiry via `getAlKahfExpiry`, deduped with `hasAlKahfQuest` check
- `notification-service.rescheduleAll` schedules Friday 8AM push notification with weekly-rotating hadith copy
- `FridayBoostBadge`: gold "2xXP" chip in PressStart2P font, emerald border glow, Reanimated fade-in 300ms, polls every 60s for Friday end
- `FridayMessageBanner`: hadith message overlay at top of HudScene, auto-dismisses after 8s, tap-to-dismiss, condensed pill variant for subsequent views
- `HudStatBar` conditionally renders FridayBoostBadge between streak and prayer countdown when `isFriday()`
- `HudScene` wrapped in View container to host FridayMessageBanner as React Native sibling outside Skia Canvas

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire Friday multiplier, Al-Kahf quest, push notification** - `b9fccff` (feat)
2. **Task 2: Build FridayBoostBadge and FridayMessageBanner, integrate into HUD** - `e9eef44` (feat)

## Files Created/Modified
- `src/stores/habitStore.ts` — Friday multiplier injection in completeHabit (FRDY-01)
- `src/stores/gameStore.ts` — Al-Kahf quest generation in generateQuests (FRDY-03), quest XP 1.0 comment
- `src/services/notification-service.ts` — Friday 8AM push notification scheduling (FRDY-04)
- `src/components/hud/FridayBoostBadge.tsx` — Created: gold 2xXP chip with Reanimated fade (FRDY-02)
- `src/components/hud/FridayMessageBanner.tsx` — Created: hadith overlay with auto-dismiss and pill variant
- `src/components/hud/HudStatBar.tsx` — Conditional FridayBoostBadge render
- `src/components/hud/HudScene.tsx` — View wrapper + FridayMessageBanner sibling outside Canvas

## Decisions Made
- Friday multiplier injected at the call site in `habitStore.completeHabit`, not inside `awardXP` — preserves quest path exclusion without touching the quest completion branch
- `FridayMessageBanner` rendered as a React Native View sibling outside the Skia Canvas — Canvas renders Skia elements only, not React Native views
- `HudScene` wrapped in `View` with `StyleSheet.absoluteFill` to support the overlay pattern without changing Canvas positioning behavior

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None — all TypeScript errors in `__mocks__/` and `__tests__/` were pre-existing and unrelated to this plan's changes. Source files are type-clean.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- All four Friday Power-Up requirements (FRDY-01 through FRDY-04) are fully implemented
- Plan 03 (AlKahfQuestCard UI) can reference `FridayBoostBadge` and `FridayMessageBanner` patterns for consistent HUD component structure
- Quest board will automatically show Al-Kahf card on Fridays via `gameStore.generateQuests`
- Friday XP multiplier is live for all habit completions — tested via existing 462-test suite

---
*Phase: 12-friday-power-ups*
*Completed: 2026-03-22*
