---
phase: 02-foundation-and-data-layer
plan: 03
subsystem: state-nav
tags: [zustand, expo-router, tab-navigation, stores, visual-review]

requires:
  - phase: 02-foundation-and-data-layer
    plan: 01
    provides: "Design tokens, fonts, i18n, Jest infrastructure"
  - phase: 02-foundation-and-data-layer
    plan: 02
    provides: "SQLite schema, Drizzle ORM, repositories, Privacy Gate"
provides:
  - "4 Zustand domain-split stores (habit, game, ui, settings)"
  - "SQLite-backed persist adapter for settings store"
  - "Tab navigation with custom pixel-accented tab bar"
  - "Root layout with font loading, migration execution, i18n provider"
  - "Font decision: Press Start 2P for headings"
  - "Theme decision: Dark-only for v1"
affects: [03-core-habit-loop, 04-game-engine, 05-hud-visual-identity]

tech-stack:
  added: [@expo-google-fonts/inter]
  patterns: [zustand-domain-split, sqlite-persist-adapter, custom-tab-bar]

key-files:
  created:
    - src/stores/sqliteStorage.ts
    - src/stores/habitStore.ts
    - src/stores/gameStore.ts
    - src/stores/uiStore.ts
    - src/stores/settingsStore.ts
    - src/components/ui/CustomTabBar.tsx
    - src/components/ui/PlaceholderScreen.tsx
    - app/(tabs)/_layout.tsx
    - app/(tabs)/index.tsx
    - app/(tabs)/habits.tsx
    - app/(tabs)/quests.tsx
    - app/(tabs)/profile.tsx
    - __tests__/stores/stores.test.ts
  modified:
    - app/_layout.tsx
    - src/tokens/typography.ts
    - app.json
    - assets/fonts/Inter-Regular.ttf
    - assets/fonts/Inter-Bold.ttf
    - assets/fonts/Inter-SemiBold.ttf

key-decisions:
  - "Press Start 2P for all headings (headingXl, headingLg, headingMd) — pixel aesthetic extends beyond HUD"
  - "Dark-only for v1 — userInterfaceStyle set to 'dark', light theme tokens kept but unused"
  - "SDK 54 for Expo Go compatibility on iPhone (user has no Apple Developer account)"
  - "Font files replaced with valid TTFs from @expo-google-fonts/inter package"
  - "Spike screens removed after decisions made (fonts.tsx, theme.tsx)"

patterns-established:
  - "Store import: import { useHabitStore } from '@/stores/habitStore'"
  - "Only settingsStore uses persist middleware; other stores are read caches of SQLite data"
  - "Tab navigation via expo-router Tabs with custom tabBar prop"
  - "PlaceholderScreen component for unbuilt tabs (shows phase indicator)"

requirements-completed: [FOUN-02, FOUN-04]

duration: ~30min (across 2 sessions with checkpoint)
completed: 2026-03-09
---

# Phase 2 Plan 3: Zustand Stores, Tab Navigation, and Visual Review Summary

**4 domain-split Zustand stores with SQLite persist, custom pixel tab bar with 4 tabs, font/theme decisions finalized (Press Start 2P headings, dark-only v1)**

## Performance

- **Duration:** ~30 min (across 2 sessions, interrupted by checkpoint)
- **Tasks:** 3 (2 auto + 1 human checkpoint)
- **Tests:** 96 passing (all suites green)

## Accomplishments
- 4 Zustand stores: habitStore, gameStore, uiStore, settingsStore with correct defaults
- SQLite-backed persist adapter (sqliteStorage.ts) for settings store
- Root layout loads 4 fonts, runs Drizzle migrations, provides i18n context
- Custom pixel-accented tab bar with jewel-tone active states (emerald)
- 4 placeholder tab screens showing phase indicators
- Font/theme spike screens reviewed on device, decisions made, spikes removed
- Fixed corrupt font files (HTML pages replaced with real TTFs)
- Fixed Expo Go crash (newArchEnabled toggled back to true)

## Decisions Made
- **Font:** Press Start 2P for headings (headingXl=22px, headingLg=18px, headingMd=14px). Body text stays Inter.
- **Theme:** Dark-only for v1. Light theme tokens preserved in code but app locked to dark via app.json.
- Heading font sizes reduced slightly from Inter values to account for Press Start 2P's wider glyphs.

## Deviations from Plan

### Auto-fixed Issues

**1. Corrupt font files (CTFontManagerError 104)**
- **Issue:** Font files were HTML pages, not TTFs (downloaded from GitHub HTML view, not raw)
- **Fix:** Installed @expo-google-fonts/inter, copied real TTFs to assets/fonts/
- **Impact:** None — same font names, correct binaries

**2. Expo Go newArchEnabled conflict**
- **Issue:** newArchEnabled:false conflicted with Expo Go (always uses New Architecture)
- **Fix:** Set newArchEnabled:true in app.json
- **Impact:** None — React version mismatch that originally caused the error was already fixed

---

*Phase: 02-foundation-and-data-layer*
*Completed: 2026-03-09*
