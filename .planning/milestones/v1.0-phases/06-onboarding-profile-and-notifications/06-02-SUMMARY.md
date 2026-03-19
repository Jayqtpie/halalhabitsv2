---
phase: 06-onboarding-profile-and-notifications
plan: "02"
subsystem: onboarding-ui
tags: [onboarding, expo-router, reanimated, zustand, react-native, screens, navigation]
dependency_graph:
  requires:
    - src/domain/niyyah-options.ts
    - src/domain/starter-packs.ts
    - src/stores/settingsStore.ts (extended in 06-01)
    - src/stores/habitStore.ts
    - src/domain/presets.ts
    - src/components/habits/PresetLibrary.tsx
  provides:
    - app/(onboarding)/_layout.tsx
    - app/(onboarding)/welcome.tsx
    - app/(onboarding)/character.tsx
    - app/(onboarding)/niyyah.tsx
    - app/(onboarding)/habits.tsx
    - app/(onboarding)/tour.tsx
    - src/components/onboarding/CharacterPicker.tsx
    - src/components/onboarding/NiyyahSelector.tsx
    - src/components/onboarding/StarterPackSelector.tsx
    - src/components/onboarding/HudTourOverlay.tsx
    - app/_layout.tsx (hydration gate + Stack.Protected)
  affects:
    - First launch user experience
    - settingsStore.onboardingComplete gating all main app access
    - habitStore (habits created from starter packs during onboarding)
tech_stack:
  added: []
  patterns:
    - Stack.Protected guard for conditional route access based on onboardingComplete
    - Hydration gate pattern - wait for settingsStore.hydrated before rendering
    - Reanimated staggered fade-in for splash screen
    - as never cast for expo-router typed routes (type generation runs at build time)
    - Property-by-property expansion instead of ...typography spread in StyleSheet.create
key_files:
  created:
    - app/(onboarding)/_layout.tsx
    - app/(onboarding)/welcome.tsx
    - app/(onboarding)/character.tsx
    - app/(onboarding)/niyyah.tsx
    - app/(onboarding)/habits.tsx
    - app/(onboarding)/tour.tsx
    - src/components/onboarding/CharacterPicker.tsx
    - src/components/onboarding/NiyyahSelector.tsx
    - src/components/onboarding/StarterPackSelector.tsx
    - src/components/onboarding/HudTourOverlay.tsx
  modified:
    - app/_layout.tsx
key_decisions:
  - "Stack.Protected guard used with guard={!onboardingComplete} — new users routed through onboarding, returning users skip it"
  - "Hydration gate: app renders null until fontsLoaded + migrationsComplete + hydrated are all true"
  - "Character customization (skin tone, outfit) encoded as compound string in characterPresetId for MVP (single field, no DB change)"
  - "Router.push uses 'as never' cast for onboarding routes — expo-router type generation runs at build time, not relevant for runtime"
  - "Pressable style callbacks return null instead of false for optional styles (avoids TypeScript error with undefined in style arrays)"
  - "Tour background is a simplified HUD preview (not real HUD) — avoids needing full store context during onboarding"
requirements_completed:
  - ONBR-01
  - ONBR-02
  - ONBR-03
  - ONBR-04
duration: ~20min
completed: "2026-03-16"
---

# Phase 6 Plan 02: Onboarding Flow Summary

**5-screen RPG-style onboarding (Welcome, Character, Niyyah, Habits, Tour) with Stack.Protected hydration-gated root layout — new users route through onboarding, returning users skip it entirely.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-16T19:46:29Z
- **Completed:** 2026-03-16T20:06:00Z (at checkpoint)
- **Tasks:** 1/1 (checkpoint pending human verification)
- **Files created:** 10
- **Files modified:** 1

## Accomplishments

- 5-screen onboarding flow with consistent step indicator UI
- Stack.Protected guard in root layout routes new users through onboarding
- Hydration gate prevents flash of wrong screen on cold start
- CharacterPicker: horizontal scroll of 4 scholar presets with emerald glow on selection
- NiyyahSelector: chip multi-select enforcing max 3, seasonal filtering passes through
- StarterPackSelector: 3 vertical pack cards with radio selection and left accent bar
- HudTourOverlay: 3-step spotlight tour with Reanimated fade transitions, skippable
- All touch targets >= 44x44px, accessible labels and roles on all interactive elements

## Task Commits

Each task committed atomically:

1. **Task 1: Root layout guard + onboarding screens** - `9ae6d92` (feat)

## Files Created/Modified

- `app/_layout.tsx` - Added hydration gate (hydrated + onboardingComplete), Stack.Protected guards for (onboarding) and (tabs), Stack.Screen entries for settings/prayer-reminders/your-data
- `app/(onboarding)/_layout.tsx` - Stack navigator, headerShown: false, gestureEnabled: false
- `app/(onboarding)/welcome.tsx` - Full-screen splash, staggered Reanimated fade-in, "Begin Your Journey" CTA
- `app/(onboarding)/character.tsx` - Character picker with customization (skin tone, outfit)
- `app/(onboarding)/niyyah.tsx` - Multi-select niyyah with max 3 enforcement and continue guard
- `app/(onboarding)/habits.tsx` - Starter pack selector + PresetLibrary modal for custom mode
- `app/(onboarding)/tour.tsx` - 3-step HUD tour, completions call setOnboardingComplete(true)
- `src/components/onboarding/CharacterPicker.tsx` - Horizontal scroll, 4 presets, emerald glow
- `src/components/onboarding/NiyyahSelector.tsx` - Chip multi-select, max enforcement
- `src/components/onboarding/StarterPackSelector.tsx` - Vertical pack cards, radio buttons
- `src/components/onboarding/HudTourOverlay.tsx` - Spotlight overlay with Reanimated fade

## Decisions Made

- Stack.Protected guard chosen over manual redirect logic — cleaner, declarative, built-in to expo-router 6
- Character customization stored as compound string (`scholar_01|skin:tone_2|outfit:emerald`) in single `characterPresetId` field — no schema change needed for MVP
- Tour background uses simplified HUD preview (not real HUD store context) — keeps onboarding self-contained
- `as never` cast for expo-router typed routes — type generation runs at metro build time, not TS compile time
- Typography spreads expanded property-by-property in StyleSheet.create — consistent with Phase 4 decision

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript Pressable style callback returning false | ViewStyle array**
- **Found during:** Task 1 (all screen files)
- **Issue:** `[style, condition && otherStyle]` returns `false | ViewStyle` which TypeScript rejects for Pressable
- **Fix:** Changed to `[style, condition ? otherStyle : null]` or `condition ? otherStyle : undefined` pattern
- **Files modified:** All 5 screen files + CharacterPicker, HudTourOverlay
- **Committed in:** 9ae6d92 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed ...typography spread in StyleSheet.create**
- **Found during:** Task 1
- **Issue:** `...typography.bodyMd` in StyleSheet.create fails TypeScript (fontWeight string literal vs string type)
- **Fix:** Expanded each property individually (fontSize, lineHeight, fontFamily)
- **Files modified:** welcome.tsx, character.tsx, niyyah.tsx, habits.tsx, HudTourOverlay.tsx
- **Committed in:** 9ae6d92 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both fixes are standard TypeScript correctness issues. No scope creep.

## Issues Encountered

- expo-router typed routes: `router.push('/(onboarding)/niyyah')` fails TypeScript because route types are generated at metro build time, not TS compile. Used `as never` cast — this is the standard workaround for new routes.
- expo export --platform web fails (pre-existing) due to expo-sqlite having no web implementation. Not relevant to mobile app.

## Next Phase Readiness

- Onboarding flow ready for device verification (checkpoint pending)
- After checkpoint approval: plan 06-03 (Profile screen) and 06-04 (Notifications integration) can proceed
- settingsStore.onboardingComplete persists across restarts (SQLite-backed)

## Self-Check: PASSED

Files verified on disk:
- app/(onboarding)/_layout.tsx: FOUND
- app/(onboarding)/welcome.tsx: FOUND
- app/(onboarding)/character.tsx: FOUND
- app/(onboarding)/niyyah.tsx: FOUND
- app/(onboarding)/habits.tsx: FOUND
- app/(onboarding)/tour.tsx: FOUND
- src/components/onboarding/CharacterPicker.tsx: FOUND
- src/components/onboarding/NiyyahSelector.tsx: FOUND
- src/components/onboarding/StarterPackSelector.tsx: FOUND
- src/components/onboarding/HudTourOverlay.tsx: FOUND
- app/_layout.tsx: FOUND (modified)

Commit 9ae6d92 verified in git log.
