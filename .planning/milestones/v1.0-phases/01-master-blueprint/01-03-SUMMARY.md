---
phase: 01-master-blueprint
plan: 03
subsystem: design-docs
tags: [ux-flows, screen-specs, wireframes, navigation, information-architecture]

requires:
  - phase: 01-01
    provides: XP economy, streak model, player behavioral model
  - phase: 01-02
    provides: Feature system specs, worldbuilding framework
provides:
  - Information architecture with tab navigation model and 7 key user paths
  - Screen-by-screen product spec with 14 ASCII wireframes
  - Onboarding-to-day-30 journey map with drop-off risk analysis
affects: [01-04, 01-06, 01-07]

tech-stack:
  added: []
  patterns: [screen-spec template with 8 sections, ASCII wireframe format]

key-files:
  created:
    - blueprint/06-information-architecture.md
    - blueprint/07-screen-specs.md
  modified: []

key-decisions:
  - "14 screens specced (exceeded 12+ requirement): added Onboarding Welcome, Niyyah, Habit Selection as separate screens"
  - "Tab navigation: Home HUD, Habits, Quests, Profile — 4-tab model"
  - "Mercy Mode is an overlay/modal on Home HUD, not a separate screen"

patterns-established:
  - "Screen spec template: Purpose, Entry Points, Layout (ASCII), Components, Interactions, Animations, Copy, Edge States"
  - "Edge states required for every screen: empty, loading, error, offline + domain-specific"

requirements-completed: [BLUE-06, BLUE-07]

duration: 15min
completed: 2026-03-07
---

# Plan 01-03: Information Architecture and Screen Specs Summary

**Navigation model with 4-tab structure, 7 mapped user paths from onboarding to day 30, and 14 screen specs with ASCII wireframes covering every v1 screen**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- Tab-based navigation model (Home HUD, Habits, Quests, Profile) with modal/stack screen categorization
- 7 key user paths with ASCII flow diagrams (first launch, daily morning, streak break, quest completion, evening routine, level up, title unlock)
- Day-0-to-day-30 journey map with milestone expectations at each checkpoint
- Drop-off risk analysis for days 2-3, 7-10, 14, 30, 60+ with specific mitigations
- 14 full screen specs with ASCII wireframes, component tables, interaction specs, animations, copy examples, and edge states
- Home HUD received the most detailed wireframe as the crown jewel screen

## Task Commits

1. **Task 1: Information Architecture and UX Flows** — `7d40fe5` (docs)
2. **Task 2: Screen-by-Screen Product Spec** — `b79a652` (docs)

## Files Created
- `blueprint/06-information-architecture.md` — Navigation model, UX flows, journey map, drop-off risks
- `blueprint/07-screen-specs.md` — 14 screen specs with ASCII mockups, components, interactions, edge states

## Decisions Made
- 14 screens instead of minimum 12 — onboarding split into 3 distinct screens for better UX flow clarity
- Mercy Mode as overlay rather than standalone screen — keeps user in HUD context during recovery

## Deviations from Plan
None — plan executed as specified.

## Issues Encountered
None.

## Next Phase Readiness
- Screen specs provide the primary reference for all UI development in Phases 2-6
- Design tokens (01-04) can cross-reference screen component names

---
*Phase: 01-master-blueprint*
*Completed: 2026-03-07*
