---
phase: 06-onboarding-profile-and-notifications
plan: "01"
subsystem: domain-and-notification-foundation
tags: [notifications, domain, settings, onboarding, tdd]
dependency_graph:
  requires:
    - src/domain/presets.ts
    - src/services/prayer-times.ts
    - src/stores/settingsStore.ts (existing)
    - src/types/habits.ts
  provides:
    - src/domain/niyyah-options.ts
    - src/domain/starter-packs.ts
    - src/domain/notification-copy.ts
    - src/services/notification-service.ts
    - src/stores/settingsStore.ts (extended)
  affects:
    - app/(tabs)/profile.tsx (will use onboardingComplete)
    - Future onboarding screens (will use niyyah-options, starter-packs)
    - Any screen triggering notification scheduling
tech_stack:
  added:
    - expo-notifications@0.31.2 (SDK 54 compatible)
    - expo-file-system@18.1.1 (SDK 54 compatible)
    - expo-sharing@13.1.5 (SDK 54 compatible)
  patterns:
    - TDD RED/GREEN for all new modules
    - Pure TS domain modules (no React imports)
    - Seasonal Hijri filtering via Intl.DateTimeFormat
    - Adab-safe copy: forbidden word set enforced by automated tests
    - Fail-open pattern for Hijri month detection
key_files:
  created:
    - src/domain/niyyah-options.ts
    - src/domain/starter-packs.ts
    - src/domain/notification-copy.ts
    - src/services/notification-service.ts
    - __tests__/domain/niyyah-options.test.ts
    - __tests__/domain/starter-packs.test.ts
    - __tests__/domain/notification-copy.test.ts
    - __tests__/services/notification-service.test.ts
  modified:
    - src/stores/settingsStore.ts
    - package.json
    - package-lock.json
    - app.json
decisions:
  - "Fail-open for Hijri month: if Intl.DateTimeFormat('en-u-ca-islamic') throws, show all niyyah options"
  - "Runtime key validation in starter-packs.ts: throws at module load if habitKey doesn't match a preset"
  - "Notification trigger type cast as 'any' to satisfy expo-notifications typing in Jest environment"
  - "Only today's prayer notifications scheduled (iOS 64-limit strategy); reschedule on each app launch"
  - "hydrated flag NOT included in partialize — it should always reset to false on cold start"
  - "morningMotivationEnabled, streakMilestonesEnabled, questExpiringEnabled default to false (opt-in)"
  - "muhasabahNotifEnabled defaults to true (core feature, users can disable)"
  - "arabicTermsEnabled defaults to true (reverent default per adab safety rails)"
metrics:
  duration: "~18 minutes"
  completed_date: "2026-03-16"
  tasks_completed: 2
  tests_added: 45
  files_created: 8
  files_modified: 4
---

# Phase 6 Plan 01: Domain & Notification Foundation Summary

**One-liner:** Niyyah options with Hijri seasonal filtering, 3 starter packs with runtime validation, adab-safe notification copy, NotificationService scheduling layer, and settingsStore extended with 10+ onboarding/notification fields.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install packages + domain modules with TDD | 036fe1a | src/domain/{niyyah-options,starter-packs,notification-copy}.ts + 3 test files + package.json + app.json |
| 2 | Extend settingsStore + create NotificationService | b4638b1 | src/stores/settingsStore.ts + src/services/notification-service.ts + test file |

## What Was Built

### Domain Modules

**niyyah-options.ts**
- 8 niyyah (intention) options: 7 always-visible, 1 seasonal (Ramadan prep, months 8-9)
- `getCurrentHijriMonth()`: wraps `Intl.DateTimeFormat('en-u-ca-islamic')` with try/catch, returns `undefined` on failure
- `getAvailableNiyyahOptions()`: filters by current Hijri month, fail-open (returns all if month unknown)

**starter-packs.ts**
- 3 bundles: "Beginner Path" (fajr + morning-adhkar + daily-reading), "Salah Focus" (all 5 prayers), "Full Discipline" (fajr + daily-reading + morning-adhkar + daily-dua + evening-adhkar)
- Runtime validation at module load: throws if any `habitKey` doesn't match a preset in `HABIT_PRESETS`

**notification-copy.ts**
- Full copy coverage: `getPrayerReminderTitle/Body`, `getFollowUpTitle/Body`, `getMuhasabahTitle/Body`, `getMorningMotivation`, `getStreakMilestoneBody`, `getQuestExpiringBody`
- Follow-up copy uses "still open" / "still time" framing (invitational, never shame-based)
- Forbidden word set (`missed`, `forgot`, `failed`, `shame`, `disappointed`) enforced by automated test

### settingsStore Extensions

Added 10 new fields with correct defaults:
- `onboardingComplete: false`, `hydrated: false` (not persisted), `selectedNiyyahs: []`, `characterPresetId: null`
- `arabicTermsEnabled: true`, `prayerReminders` (all 5 enabled, 10min lead, followUp on), `muhasabahNotifEnabled: true`
- `streakMilestonesEnabled: false`, `questExpiringEnabled: false`, `morningMotivationEnabled: false`
- `onRehydrateStorage` callback sets `hydrated = true` after store rehydrates

### NotificationService

Pure TypeScript module wrapping `expo-notifications`:
- `requestPermissions()` → boolean
- `cancelAll()` → cancels all scheduled notifications
- `rescheduleAll(lat, lng, calcMethod, prefs)` → cancel-then-schedule pattern:
  - Prayer reminders at `prayerStart - leadMinutes` (future only)
  - Follow-ups at `prayerStart + 30min` (future only, if enabled)
  - Muhasabah as `DailyTriggerInput` with hour/minute from `muhasabahReminderTime`
- Schedules only today's prayers (stays within iOS 64-notification limit)

## Test Results

```
Tests: 228 passed across 12 test suites
  - niyyah-options: 9 tests
  - starter-packs: 8 tests
  - notification-copy: 19 tests (including forbidden-word sweep)
  - notification-service: 9 tests (mocked expo-notifications)
  - All pre-existing domain/services tests: green
```

## Deviations from Plan

None — plan executed exactly as written. The `type` cast on expo-notifications trigger object was necessary due to Jest environment typing differences but matches runtime behavior.

## Self-Check: PASSED

All 9 required files found on disk. Both commits verified in git log:
- `036fe1a` — feat(06-01): install packages + domain modules with TDD
- `b4638b1` — feat(06-01): extend settingsStore + NotificationService with TDD
