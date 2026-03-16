---
phase: 06-onboarding-profile-and-notifications
plan: 03
subsystem: ui
tags: [react-native, profile, settings, notifications, data-export, expo-file-system, expo-sharing, tdd]

# Dependency graph
requires:
  - phase: 06-01
    provides: settingsStore extended with prayerReminders, notif prefs, niyyah, characterPresetId
  - phase: 04-game-engine-and-progression
    provides: gameStore (level, totalXP, titles), TitleGrid component pattern
  - phase: 03-core-habit-loop
    provides: habitStore (habits, streaks), streak engine

provides:
  - RPG character sheet profile screen (level, XP bar, stats, trophy case, streak bars, niyyah)
  - Settings screen with 4 grouped sections (Prayer, Notifications, Appearance, About)
  - Prayer Reminders sub-screen with per-prayer controls
  - Your Data screen (export JSON, delete all with onboarding reset)
  - data-export service (collectAllUserData, exportUserData, deleteAllUserData)
  - Profile components (ProfileHeader, StatsGrid, TrophyCase, StreakBars, NiyyahDisplay)
  - Settings components (SettingsList, PrayerReminderRow)

affects: [06-04, Phase 7 sync/auth (delete resets to onboarding)]

# Tech tracking
tech-stack:
  added: [expo-file-system/legacy (writeAsStringAsync + cacheDirectory), expo-sharing (shareAsync)]
  patterns: [TDD RED-GREEN for pure service modules, data-export as pure TS module no React imports]

key-files:
  created:
    - app/(tabs)/profile.tsx
    - app/settings.tsx
    - app/prayer-reminders.tsx
    - app/your-data.tsx
    - src/components/profile/ProfileHeader.tsx
    - src/components/profile/StatsGrid.tsx
    - src/components/profile/TrophyCase.tsx
    - src/components/profile/StreakBars.tsx
    - src/components/profile/NiyyahDisplay.tsx
    - src/components/settings/SettingsList.tsx
    - src/components/settings/PrayerReminderRow.tsx
    - src/services/data-export.ts
    - __tests__/services/data-export.test.ts
  modified: []

key-decisions:
  - "Use expo-file-system/legacy (not new v2 API) — writeAsStringAsync and cacheDirectory are legacy-only"
  - "data-export service uses raw SQL execSync for delete (avoids need for new deleteAll repo methods)"
  - "Delete data uses try/catch non-fatal DB block — store resets happen regardless of DB success"
  - "TrophyCase renders all titles from TITLE_SEED_DATA client-side, no DB query needed"
  - "ProfileHeader uses RN Image (not Skia) since it's outside a Skia Canvas context"
  - "Router.push uses 'as any' cast for /settings and /your-data — valid routes that TypeScript doesn't know until created"
  - "XP progress bar computed from xpForLevel(currentLevel) for accurate within-level progress"
  - "Settings screen uses Alert.alert for calculation method picker (no extra modal needed)"

patterns-established:
  - "Profile components: read-only view components that derive state from stores"
  - "Settings screens: grouped card layout with section titles, native Switch for toggles"
  - "Data export: collectAllUserData -> exportUserData -> shareAsync chain"

requirements-completed: [PROF-01, PROF-02, PROF-03, PROF-04, NOTF-04]

# Metrics
duration: 13min
completed: 2026-03-16
---

# Phase 6 Plan 3: Profile, Settings, and Data Management Summary

**RPG character sheet profile screen, 4-section settings UI, per-prayer notification config, and privacy-first data export/delete service with full TDD test coverage**

## Performance

- **Duration:** ~13 min
- **Started:** 2026-03-16T19:46:45Z
- **Completed:** 2026-03-16T19:59:52Z
- **Tasks:** 2 (+ checkpoint pending verification)
- **Files modified:** 13 created

## Accomplishments

- Profile tab replaced PlaceholderScreen with full RPG character sheet (sprite, title, level/XP bar, stats grid, 26-title trophy case, streak bars, niyyah chips)
- Settings screen built with 4 grouped sections using iOS-style card layout and native Switch toggles
- Prayer Reminders sub-screen with per-prayer enable/disable, lead time picker modal, and follow-up toggle
- Your Data screen with full data category listing, JSON export, and destructive delete with confirmation
- data-export service (TDD RED-GREEN): 10/10 tests passing, covers collectAllUserData structure, export flow, and store reset

## Task Commits

Each task was committed atomically:

1. **Task 1: Profile screen + components** - `a2ec1c4` (feat)
2. **TDD RED: Failing data-export tests** - `18550b3` (test)
3. **Task 2: Settings, Prayer Reminders, Your Data, data-export** - `b2c610a` (feat)

**Plan metadata:** (pending)

_Note: TDD tasks have separate test → feat commits_

## Files Created/Modified

- `app/(tabs)/profile.tsx` - RPG character sheet replacing PlaceholderScreen
- `app/settings.tsx` - Grouped settings (Prayer, Notifications, Appearance, About)
- `app/prayer-reminders.tsx` - Per-prayer notification configuration sub-screen
- `app/your-data.tsx` - Data categories, JSON export, delete all with onboarding reset
- `src/components/profile/ProfileHeader.tsx` - Sprite, title, level, XP bar
- `src/components/profile/StatsGrid.tsx` - 3-column stat cards (XP, streak, days active)
- `src/components/profile/TrophyCase.tsx` - All 26 titles by rarity, lock hints on tap
- `src/components/profile/StreakBars.tsx` - Per-habit streak bars, best streak gold
- `src/components/profile/NiyyahDisplay.tsx` - Read-only niyyah chips
- `src/components/settings/SettingsList.tsx` - Reusable grouped sections component
- `src/components/settings/PrayerReminderRow.tsx` - Per-prayer row with lead time modal
- `src/services/data-export.ts` - collectAllUserData, exportUserData, deleteAllUserData
- `__tests__/services/data-export.test.ts` - 10 tests (structure, export flow, store reset)

## Decisions Made

- expo-file-system/legacy for `writeAsStringAsync` and `cacheDirectory` — the new v2 API doesn't export these at the module root
- deleteAllUserData uses raw `execSync` SQL on the underlying expo-sqlite client — no new repo methods needed; wrapped in try/catch so store resets always happen
- TrophyCase uses TITLE_SEED_DATA directly (client-side) rather than a DB query — titles are static seed data
- ProfileHeader uses RN Image not Skia — it's in a regular View, not inside a Skia Canvas
- XP progress bar uses `xpForLevel(currentLevel)` from xp-engine for accurate within-level progress computation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `expo-file-system` import to use legacy API**
- **Found during:** Task 2 (data-export service TypeScript check)
- **Issue:** `expo-file-system` v2 doesn't export `cacheDirectory` or `writeAsStringAsync` at module root; they're in `expo-file-system/legacy`
- **Fix:** Changed import to `expo-file-system/legacy` in service and test
- **Files modified:** `src/services/data-export.ts`, `__tests__/services/data-export.test.ts`
- **Verification:** TypeScript no errors; 10/10 tests passing
- **Committed in:** b2c610a

**2. [Rule 1 - Bug] Fixed `typography.interBold` reference in your-data.tsx**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** `typography.interBold` doesn't exist as a property on the typography object
- **Fix:** Changed to `fontFamilies.interBold` (imported from tokens)
- **Files modified:** `app/your-data.tsx`
- **Verification:** TypeScript no errors
- **Committed in:** b2c610a

**3. [Rule 1 - Bug] Fixed missing `bottomPad` style in your-data.tsx**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** `styles.bottomPad` referenced in JSX but not defined in StyleSheet.create()
- **Fix:** Added `bottomPad: { height: spacing.xxl }` to styles
- **Files modified:** `app/your-data.tsx`
- **Verification:** TypeScript no errors
- **Committed in:** b2c610a

---

**Total deviations:** 3 auto-fixed (all Rule 1 bugs)
**Impact on plan:** All auto-fixes necessary for correct compilation. No scope creep.

## Issues Encountered

- expo-constants version differences: `ExpoConstants.manifest.version` no longer exists in newer SDK; used `ExpoConstants.expoConfig.version` with optional chaining and `as any` fallback
- HTML entity `&apos;` not supported in React Native JSX text — replaced with `{"WHAT'S STORED"}` expression syntax

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Profile screen awaiting human verification (checkpoint Task 3)
- Settings toggles persist to SQLite via Zustand persist middleware
- data-export service ready for use in Your Data screen
- After checkpoint approval: Plan 06-04 (final verification and wiring)

## Self-Check: PASSED

All 10 expected files found. All 3 task commits verified in git log.

---
*Phase: 06-onboarding-profile-and-notifications*
*Completed: 2026-03-16*
