---
phase: 05-hud-visual-identity-and-muhasabah
plan: 02
subsystem: hud

tags: [react-native, skia, pixel-art, hud, home-screen, animation, day-night, expo-blur]

requires:
  - phase: 05-01
    provides: hud-environment.ts, muhasabahStore, muhasabah-engine

provides:
  - Full-screen Home HUD with Skia Canvas pixel art scene
  - DayNightOverlay: animated time-based tint with Skia interpolateColors
  - CharacterSprite: 4-frame idle animation via Reanimated withRepeat+Easing.steps
  - SceneObjects: invisible Pressable tap zones for quest board, prayer mat, journal
  - HudStatBar: translucent overlay with BlurView (iOS) / rgba fallback (Android)
  - PrayerCountdown: next prayer + countdown from settingsStore + prayer-times service
  - EnvironmentReveal: fade-to-black overlay on environment transitions (levels 6/12/20)

affects:
  - phase-05-03 (Muhasabah modal -- journal tap zone ready)
  - phase-05-04 (pixel art icons -- visual identity layer)
  - verify-work (Phase 5 HUD verification)

tech-stack:
  added:
    - "@shopify/react-native-skia@2.2.12 (Canvas, Image, Rect, FilterMode.Nearest)"
    - "expo-blur (BlurView for iOS frosted glass)"
  patterns:
    - "Layered Canvas + RN View architecture (Skia bottom, Pressables middle, views top)"
    - "FilterMode.Nearest + MipmapMode.Nearest for crisp pixel art (not FilterQuality.None -- old API)"
    - "Skia interpolateColors for day/night tint (NOT Reanimated interpolateColor -- incompatible formats)"
    - "Manual 4-frame clip cycling (simpler than Atlas for <=4 frames)"
    - "Platform.OS conditional: BlurView (iOS) / rgba(0,0,0,0.75) fallback (Android)"
    - "StyleSheet.absoluteFillObject for EnvironmentReveal overlay (consistent with Phase 4)"

key-files:
  created:
    - assets/environments/quiet-study.png
    - assets/environments/growing-garden.png
    - assets/environments/scholars-courtyard.png
    - assets/environments/living-sanctuary.png
    - assets/sprites/character-idle.png
    - src/components/hud/HudScene.tsx
    - src/components/hud/DayNightOverlay.tsx
    - src/components/hud/CharacterSprite.tsx
    - src/components/hud/SceneObjects.tsx
    - src/components/hud/HudStatBar.tsx
    - src/components/hud/PrayerCountdown.tsx
    - src/components/hud/EnvironmentReveal.tsx
  modified:
    - app/(tabs)/index.tsx
    - src/stores/gameStore.ts

decisions:
  - "[Deviation Rule 2] Added quest completion haptic (ImpactFeedbackStyle.Medium) to
    gameStore.updateQuestProgress -- was missing for HUD-04 requirement"
  - "Assets use favicon.png copy as placeholder -- real AI-generated pixel art to be
    swapped before checkpoint verification"
  - "CharacterSprite uses manual clip approach (not Skia Atlas) -- simpler for 4 frames,
    avoids Atlas complexity at MVP stage"
  - "PrayerCountdown falls back to '--' when location not set -- graceful degradation"
  - "EnvironmentReveal checks isEnvironmentTransition to avoid firing on every level-up"
  - "HudStatBar uses useSafeAreaInsets for bottom padding -- handles notched devices"

metrics:
  duration: "~45min"
  tasks_completed: 2
  files_created: 12
  files_modified: 2
  tests_passing: 311
  completed: 2026-03-15
---

# Phase 5 Plan 02: Home HUD Scene Summary

Full-screen Home HUD built on Skia Canvas: pixel art game world scene with layered environment backgrounds, animated character sprite, day/night color tint, invisible tap zones for navigation, and a translucent BlurView stat overlay showing level, XP, streak, and next prayer.

## What Was Built

The Home tab is no longer a placeholder. It renders a full-screen game world scene:

**HudScene (Skia Canvas):**
- Full-screen Canvas with environment PNG background (selected by `getEnvironmentForLevel`)
- `FilterMode.Nearest` + `MipmapMode.Nearest` sampling for crisp pixel art (HUD-02)
- DayNightOverlay draws a tinted Rect over the background using `Skia.interpolateColors`
  based on current local time (6 stops across 24h: midnight/dawn/day/evening/night)
- CharacterSprite cycles 4 frames via `withRepeat(withTiming(Easing.steps(4)))` at 800ms period

**Interactive Layer (RN Views):**
- SceneObjects: 3 invisible Pressables (quest board, prayer mat, journal), all >= 44x44px
- Journal tap zone shows animated glow ring (opacity 0.4→1.0 pulse) when Muhasabah time

**HUD Stat Bar:**
- iOS: `BlurView intensity={60} tint="dark"` frosted glass
- Android: `backgroundColor: 'rgba(0,0,0,0.75)'` solid fallback
- Row: LevelBadge | XPProgressBar | best streak text | PrayerCountdown

**EnvironmentReveal:**
- Detects level_up celebrations that cross environment boundaries (5→6, 11→12, 19→20)
- Sequence: fade to black (400ms) → hold "New Area Unlocked" (800ms) → fade out (1200ms)
- Fires `Haptics.NotificationFeedbackType.Success` at reveal moment

**Haptics (HUD-04):**
- Habit completion: `ImpactFeedbackStyle.Medium` (HabitCard, Phase 4)
- Level-up: `ImpactFeedbackStyle.Heavy` x3 burst (LevelUpOverlay, Phase 4)
- Title unlock: `NotificationFeedbackType.Success` (TitleUnlockOverlay, Phase 4)
- Quest completion: `ImpactFeedbackStyle.Medium` added to gameStore.updateQuestProgress [Deviation]
- Environment unlock: `NotificationFeedbackType.Success` (EnvironmentReveal, this plan)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Quest completion haptic was absent (HUD-04)**
- **Found during:** Task 2 review
- **Issue:** HUD-04 requires Medium haptic on quest completion. Phase 4 added habit/level-up haptics but missed quest completion.
- **Fix:** Added `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` in `gameStore.updateQuestProgress` when a quest status transitions to 'completed'. Non-blocking (`.catch(() => {})`).
- **Files modified:** `src/stores/gameStore.ts`
- **Commit:** f72341a

### Pre-existing Issues (Out of Scope)

- `muhasabahStore.ts` and other 05-01 files existed from a prior session but were uncommitted. Committed as part of this execution (`cb09b6a`).
- jest.config.js was missing `@shopify/react-native-skia` in transformIgnorePatterns. Fixed.

## Awaiting Human Verification

**Checkpoint:** Visual and functional verification of Home HUD on device.

The HUD requires device testing since:
1. Pixel art rendering quality (crisp vs blurry) can only be verified on device
2. Character animation smoothness needs real-time validation
3. Tap zone positions need adjustment based on actual pixel art asset placement
4. Day/night tint should reflect current local time

Assets are currently placeholder (favicon.png copies). The visual identity will be finalized with real AI-generated pixel art assets after verification confirms the architecture works.

## Self-Check

- [x] All must_have artifacts exist (HudScene, HudStatBar, SceneObjects, EnvironmentReveal, PrayerCountdown)
- [x] TypeScript: `npx tsc --noEmit` passes with no new errors in source files
- [x] Tests: 311 tests pass, 17 test suites
- [x] Home tab no longer shows PlaceholderScreen
- [x] FilterMode.Nearest used (not FilterQuality.None)
- [x] Haptics: all 5 events covered (habit, level-up, title-unlock, quest, environment)
