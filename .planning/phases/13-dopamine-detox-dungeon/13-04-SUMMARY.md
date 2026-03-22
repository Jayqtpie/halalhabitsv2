---
phase: 13-dopamine-detox-dungeon
plan: 04
subsystem: hud-components
tags: [detox, hud, dungeon, skia, reanimated, animation, haptics, fanfare]

# Dependency graph
requires:
  - phase: 13-dopamine-detox-dungeon
    plan: 02
    provides: detoxStore.ts (activeSession, completeSession, loadActiveSession)
  - phase: 13-dopamine-detox-dungeon
    plan: 03
    provides: DungeonSheet.tsx, DetoxCountdownTimer.tsx (imported by HudScene and DungeonDoorIcon)

provides:
  - DungeonDoorIcon.tsx: HUD tap target with glow animation and countdown badge
  - WelcomeBackToast.tsx: Foreground toast with AppState listener and fade animation
  - HudScene.tsx: Modified with dungeon theme (stone tint, torches, DayNightOverlay swap)
  - DungeonClearedFanfare.tsx: Full-screen celebration with spring zoom, XP count-up, haptics

affects:
  - HudScene.tsx: now imports DungeonSheet, DungeonDoorIcon, WelcomeBackToast, DungeonClearedFanfare, useDetoxStore

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Skia Rect/Circle inside Canvas for dungeon stone tint and torch elements (dungeonActive conditional)
    - DayNightOverlay replaced by static dungeon shadow Rect when dungeonActive
    - Phase-offset torch flicker: two useSharedValue with 200ms setTimeout offset for different flicker phases
    - State-based XP count-up (setInterval at 16ms/step for 50 steps over 800ms) avoids Reanimated worklet↔JS Text bridge issue
    - AppState.addEventListener('change') for app-foreground toast detection
    - AccessibilityInfo.isReduceMotionEnabled() called on mount for all animated components

key-files:
  created:
    - src/components/hud/DungeonDoorIcon.tsx
    - src/components/hud/WelcomeBackToast.tsx
    - src/components/detox/DungeonClearedFanfare.tsx
  modified:
    - src/components/hud/HudScene.tsx

key-decisions:
  - "Phase-offset torch flicker uses setTimeout(200ms) to start second torch animation — simpler than useSharedValue initial offset"
  - "XP count-up uses state-based setInterval (not Reanimated withTiming + useDerivedValue) to avoid worklet↔JS bridge for Text children"
  - "DungeonClearedFanfare uses View, not Modal — consistent with LevelUpOverlay pattern"
  - "HudScene dungeon theme fully conditional: dungeonActive=false restores DayNightOverlay without any modification to that component"

requirements-completed: [DTOX-01, DTOX-02, DTOX-03, DTOX-04, DTOX-06]

# Metrics
duration: ~5 min
completed: 2026-03-22
---

# Phase 13 Plan 04: HUD Dungeon Theme, DungeonDoorIcon, WelcomeBackToast, and DungeonClearedFanfare Summary

**HUD dungeon theme with Skia stone/torch layers, DungeonDoorIcon with glow pulse, WelcomeBackToast with AppState listener, and DungeonClearedFanfare with spring zoom + XP count-up + haptic burst**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-22T22:20:10Z
- **Completed:** 2026-03-22T22:25:03Z
- **Tasks:** 2 auto-execute + 1 checkpoint (human-verify)
- **Files modified:** 4

## Accomplishments

- DungeonDoorIcon: 32×32 RN View-based icon, 44px hit slop, emerald glow ring (2000ms Reanimated pulse during active session, static 60% idle), DetoxCountdownTimer badge below when active, AccessibilityInfo reduced motion support
- WelcomeBackToast: AppState listener detects foreground, shows "Still in the dungeon — Xh Ym remaining" for 3s, 300ms Reanimated fade in/out, reduced motion instant show/hide
- HudScene: dungeonActive boolean from useDetoxStore, Skia Rect stone tint (#1A1410 30%), DayNightOverlay swapped to dungeon shadow (rgba(0,0,0,0.65)), two torch Circle elements at 15%/85% X positions with phase-offset flicker, DungeonDoorIcon + WelcomeBackToast + DungeonSheet + DungeonClearedFanfare all wired as Canvas siblings
- DungeonClearedFanfare: full-screen overlay zIndex:50, spring ZoomIn (damping:15 stiffness:150), state-based XP count-up (50 steps over 800ms), "Dungeon Cleared!" / "+X XP" / mentor line / "Continue Journey" button, 3× Heavy haptic burst, AccessibilityInfo reduced motion support

## Task Commits

1. **Task 1: DungeonDoorIcon, WelcomeBackToast, HudScene dungeon theme** - `183b412` (feat)
2. **Task 2: DungeonClearedFanfare completion celebration** - `c8a827a` (feat)
3. **Task 3:** checkpoint:human-verify — pending user verification

## Files Created/Modified

- `src/components/hud/DungeonDoorIcon.tsx` — HUD entry point with glow animation and countdown badge
- `src/components/hud/WelcomeBackToast.tsx` — App-foreground toast with animated fade
- `src/components/hud/HudScene.tsx` — Modified: dungeon theme layers, door icon, toast, sheet, fanfare
- `src/components/detox/DungeonClearedFanfare.tsx` — Full-screen celebration with spring, XP count-up, haptics

## Decisions Made

- **Phase-offset torches:** Second torch uses `setTimeout(200ms)` to start withRepeat at different phase — creates visual desync from first torch for natural flicker effect.
- **XP count-up via state:** Reanimated `useDerivedValue().value` cannot be read in React JSX render context; state-based `setInterval` counter avoids this Reanimated worklet limitation cleanly.
- **DungeonClearedFanfare as View (not Modal):** Consistent with LevelUpOverlay established pattern; absolute positioning + zIndex:50 achieves same full-screen effect without Modal overhead.
- **dungeonActive inline condition in Canvas:** Both stone tint and torch elements wrapped in `{dungeonActive && ...}` — React null renders cleanly in Skia Canvas JSX; DayNightOverlay swapped via ternary.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] authStore has `userId` field, not `user?.id`**
- **Found during:** Task 1 (TypeScript check)
- **Issue:** Plan showed `useAuthStore(s => s.user?.id ?? '')` but authStore exposes `userId: string` directly (never null — 'default-user' in guest mode)
- **Fix:** Changed HudScene to `useAuthStore(s => s.userId)` — simpler and correct
- **Files modified:** `src/components/hud/HudScene.tsx`
- **Commit:** `183b412` (included in same commit)

## Known Stubs

- DungeonDoorIcon renders a View-based placeholder pixel-art door (arch + planks). Real pixel-art PNG asset is a deferred asset task (noted in STATE.md Pending Todos). The component accepts the interaction correctly; only the visual is placeholder.

## Status

**Tasks 1-2 complete and committed. Task 3 is a checkpoint:human-verify awaiting user approval.**

The complete dungeon feature (Plans 01-04) is ready for visual verification. Human approval of Task 3 is required before this plan is marked fully complete.

## Self-Check: PASSED

- FOUND: src/components/hud/DungeonDoorIcon.tsx
- FOUND: src/components/hud/WelcomeBackToast.tsx
- FOUND: src/components/detox/DungeonClearedFanfare.tsx
- FOUND: HudScene.tsx modified with dungeonActive, DungeonDoorIcon, WelcomeBackToast
- FOUND commit 183b412 (Task 1)
- FOUND commit c8a827a (Task 2)
- grep "dungeonActive" HudScene.tsx ✓
- grep "AppState.addEventListener" WelcomeBackToast.tsx ✓
- grep "withSpring" DungeonClearedFanfare.tsx ✓
- grep "Haptics.impactAsync" DungeonClearedFanfare.tsx ✓
- No src/ TypeScript errors introduced by this plan

---
*Phase: 13-dopamine-detox-dungeon*
*Completed: 2026-03-22 (Tasks 1-2; Task 3 pending human verification)*
