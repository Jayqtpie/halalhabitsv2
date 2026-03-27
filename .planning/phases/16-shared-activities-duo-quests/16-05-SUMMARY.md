---
phase: 16-shared-activities-duo-quests
plan: 05
subsystem: ui-components
tags: [duo-quest-cards, create-quest, inactivity-banner, profanity-filter, aggregate-progress]
dependency_graph:
  requires:
    - phase: 16-shared-activities-duo-quests
      plan: 03
      provides: "useDuoQuestStore with full lifecycle"
    - phase: 16-shared-activities-duo-quests
      plan: 04
      provides: "ActivitiesTab + buddy profile with sub-tabs"
  provides:
    - "DuoQuestCard — aggregate-only progress display (DUOQ-05/D-13)"
    - "CreateDuoQuestSheet — template + custom creation with leo-profanity (D-05/D-06)"
    - "DuoQuestDetailSheet — Mark Progress + XP breakdown + exit"
    - "InactivityBanner — 48h warning / 72h exit (D-09/D-10)"
    - "Activities tab fully wired with duo quest cards"
    - "Buddy profile Start Duo Quest button active (D-07)"
status: checkpoint-pending
result: Tasks 1-2 complete, Task 3 (human-verify) pending
started: "2026-03-27T00:00:00.000Z"
updated: "2026-03-27T00:00:00.000Z"
---

## One-liner
Duo quest cards with aggregate progress, template/custom creation with profanity filter, inactivity banners, and full Activities tab integration.

## What shipped

### New files
- `src/components/activities/DuoQuestCard.tsx` — Quest card with single combined progress bar, aggregate % only (DUOQ-05/D-13), time remaining, XP reward, warm encouragement copy
- `src/components/activities/CreateDuoQuestSheet.tsx` — Modal with Templates|Custom tabs, 8 template cards, custom form with title/desc/target/duration, leo-profanity client-side filter (D-06), max 3 quest alert (D-08)
- `src/components/activities/DuoQuestDetailSheet.tsx` — Full quest detail with large progress bar, "Mark Progress" button, XP breakdown, InactivityBanner integration, exit with partial XP confirmation
- `src/components/activities/InactivityBanner.tsx` — Gold warning banner at 48h ("Paused — waiting for [buddy]"), exit button at 72h with partial XP (D-09/D-10), adab-safe non-shame copy

### Modified files
- `src/components/activities/ActivitiesTab.tsx` — Replaced "coming soon" placeholder with real DuoQuestCard rendering, added DuoQuestDetailSheet, completed quests collapsed section, inactivity status computed inline via pure function
- `app/buddy-profile/[id].tsx` — Start Duo Quest button now active (sapphire-800 outlined), opens CreateDuoQuestSheet

## Key decisions
- Inactivity status computed via pure `checkInactivity()` from timestamps — no async needed in card render
- Creator is side 'a', non-creator is side 'b' (follows schema convention)
- `filter.clean()` compared to original for profanity detection (D-06)
- XP auto-calculated for custom quests: `Math.min(150, Math.max(50, targetValue * 15))`

## Self-Check: PENDING
Tasks 1-2 complete. Task 3 (human-verify) deferred — awaiting user visual verification.

## key-files
### created
- src/components/activities/DuoQuestCard.tsx
- src/components/activities/CreateDuoQuestSheet.tsx
- src/components/activities/DuoQuestDetailSheet.tsx
- src/components/activities/InactivityBanner.tsx

### modified
- src/components/activities/ActivitiesTab.tsx
- app/buddy-profile/[id].tsx
