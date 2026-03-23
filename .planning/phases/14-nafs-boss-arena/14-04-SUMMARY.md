---
phase: 14-nafs-boss-arena
plan: 04
subsystem: ui
tags: [react-native, skia, reanimated, arena, boss-battle, archetype, accessibility]

# Dependency graph
requires:
  - phase: 14-nafs-boss-arena plan 03
    provides: bossStore with full battle lifecycle (startBattle, abandonBattle, loadActiveBattle, pendingEscapeNotice)
  - phase: 14-nafs-boss-arena plan 01
    provides: boss-content.ts (BOSS_ARCHETYPES, ArchetypeId), boss-engine.ts (getBossDialoguePhase, suggestArchetype, calculatePartialXp)
provides:
  - Arena route at /arena (app/arena.tsx)
  - ArenaScreen — full Arena screen with battle scene, archetype gallery, level gate, escape notice, and abandon wiring
  - ArchetypeCard — selection card with recommended badge and accessibility
  - BossHpBar — Skia RoundedRect animated HP bar (Reanimated withTiming 600ms)
  - RpgDialogueBox — RPG text box with 30ms/char typewriter (reduce motion aware)
  - AbandonConfirmation — two-tap modal with partial XP preview (no shame copy)
affects: [14-05, HUD-boss-gate-icon, BossDefeatFanfare]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Skia HP bar: RoundedRect inside parent Canvas driven by useDerivedValue(animatedHp.value * trackWidth)"
    - "Typewriter pattern: setInterval at 30ms/char with AccessibilityInfo.isReduceMotionEnabled instant fallback"
    - "Abandon confirmation: sibling Modal (same z-index pattern as EarlyExitConfirmation)"
    - "Arena route: app/arena.tsx thin re-export of ArenaScreen component"
    - "BossPlaceholder: absolute overlay View outside Canvas for archetype tint (Canvas cannot host RN views)"

key-files:
  created:
    - app/arena.tsx
    - src/components/arena/ArenaScreen.tsx
    - src/components/arena/ArchetypeCard.tsx
    - src/components/arena/BossHpBar.tsx
    - src/components/arena/RpgDialogueBox.tsx
    - src/components/arena/AbandonConfirmation.tsx
  modified: []

key-decisions:
  - "BossHpBar renders inside parent Canvas using RoundedRect pair (background track + fill); parent provides Canvas element"
  - "Archetype silhouette rendered as absolute View overlay outside Canvas (Canvas cannot host RN views)"
  - "Typewriter uses setInterval (not Reanimated worklet) — same worklet/Text bridge limitation as DetoxCountdownTimer"
  - "Level gate uses positive encouraging language per adab safety rails — no shame, no locked imagery"

patterns-established:
  - "Arena route: thin re-export pattern (app/X.tsx imports and re-exports src/components/X/XScreen.tsx)"

requirements-completed: [BOSS-01, BOSS-03, BOSS-07]

# Metrics
duration: 25min
completed: 2026-03-23
---

# Phase 14 Plan 04: Arena Screen Summary

**Full Arena UI built: Skia HP bar with Reanimated 600ms animation, 30ms/char typewriter RPG dialogue, 6-card archetype gallery with recommended badge, two-tap abandon confirmation, and level-10 gate with positive framing**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-23T20:20:00Z
- **Completed:** 2026-03-23T20:45:00Z
- **Tasks:** 2 of 2
- **Files modified:** 6 created

## Accomplishments

- Arena route at `/arena` created — accessible via `router.push('/arena')` from any screen
- ArenaScreen manages both states: active battle (Skia canvas + RPG dialogue + abandon) and idle gallery (6 archetype cards + CTA)
- BossHpBar renders inside parent Canvas with gold-500 background track and ruby-600 fill that animates via Reanimated `withTiming` (600ms easeOut)
- RpgDialogueBox delivers typewriter at 30ms/char with `isReduceMotionEnabled` instant-reveal fallback
- AbandonConfirmation (sibling Modal) shows partial XP preview and requires explicit two-tap: "Yes, Abandon" + "Keep Fighting"
- Level-10 gate uses adab-safe positive copy: "Keep building discipline to unlock boss battles" — never shame

## Task Commits

Each task was committed atomically:

1. **Task 1: Arena route, ArenaScreen, and ArchetypeCard** - `3a24f99` (feat)
2. **Task 2: BossHpBar, RpgDialogueBox, and AbandonConfirmation** - `1e4a8e2` (feat)

**Plan metadata:** pending docs commit

## Files Created/Modified

- `app/arena.tsx` — Expo Router route re-export for `/arena`
- `src/components/arena/ArenaScreen.tsx` — Full Arena screen (idle + battle states, level gate, escape notice)
- `src/components/arena/ArchetypeCard.tsx` — Gallery card with selection state, recommended badge, accessibility
- `src/components/arena/BossHpBar.tsx` — Skia RoundedRect HP bar driven by Reanimated shared value
- `src/components/arena/RpgDialogueBox.tsx` — PressStart2P typewriter box with reduce motion fallback
- `src/components/arena/AbandonConfirmation.tsx` — Two-tap Modal with partial XP framing

## Decisions Made

- **BossHpBar inside parent Canvas:** HP bar renders as RoundedRect pair inside the ArenaScreen Canvas (not its own Canvas) — matches UI-SPEC and HudScene pattern
- **Archetype silhouette as View overlay:** Boss placeholder color block rendered as absolute View outside Canvas (Canvas cannot host React Native views — same constraint as FridayMessageBanner)
- **setInterval for typewriter:** Matches DetoxCountdownTimer pattern — Reanimated worklets cannot update Text children across JS bridge
- **Partial XP framing in abandon modal:** Shows damage dealt and XP earned to soften the loss; no shame or guilt copy per adab safety rails

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Known Stubs

- `ARCHETYPE_PLACEHOLDER_COLOR` in `ArenaScreen.tsx` — each archetype uses a muted color block instead of actual boss sprite PNG. These are intentional placeholder blocks until AI-generated pixel art assets are created (noted in pending todos). Battle is fully functional without them.

## Next Phase Readiness

- All 5 Arena UI components ready for Plan 05 integration
- Plan 05 will add: HUD Arena Gate icon, BossDefeatFanfare overlay, BossEscapedNotice integration into HUD flow
- Boss battle is fully playable end-to-end (store + domain + UI all wired)

---
## Self-Check: PASSED

All 7 files verified present. Both task commits (3a24f99, 1e4a8e2) verified in git log.

---
*Phase: 14-nafs-boss-arena*
*Completed: 2026-03-23*
