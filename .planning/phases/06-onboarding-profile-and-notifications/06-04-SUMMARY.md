---
phase: 06-onboarding-profile-and-notifications
plan: "04"
subsystem: ui
tags: [react-native, expo-notifications, notifications, lifecycle, muhasabah, hud]

# Dependency graph
requires:
  - phase: 06-01
    provides: NotificationService (rescheduleAll, requestPermissions), settingsStore notification prefs
  - phase: 06-03
    provides: MuhasabahModal mounted in root layout, useMuhasabahStore.open()
  - phase: 05-hud-visual-identity-and-muhasabah
    provides: SceneObjects with showJournalGlow prop and JournalGlowRing animation

provides:
  - Notification scheduling on app startup (post-hydration, permissions checked)
  - Reschedule on settings change (prayer prefs, muhasabah time, location)
  - Notification tap routing (prayer -> habits tab, muhasabah -> modal)
  - Foreground notification display (shouldShowBanner + shouldShowList handler)

affects: [Phase 7 backend/sync — notification service is standalone, no sync dependency]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Module-level Notifications.setNotificationHandler (runs once before any notification fires)"
    - "useEffect dependency array includes all notification settings for auto-reschedule on change"
    - "Non-fatal try/catch on rescheduleAll (app works without notifications)"

key-files:
  created: []
  modified:
    - app/_layout.tsx

key-decisions:
  - "shouldShowBanner + shouldShowList (not deprecated shouldShowAlert) for foreground notifications"
  - "Notification tap routing via title+body content keywords (no custom data payload needed)"
  - "rescheduleAll effect re-runs on any notification settings change for real-time sync"
  - "Non-fatal error handling on reschedule — notifications are enhancement, not core function"

patterns-established:
  - "Root layout owns notification lifecycle: handler, startup reschedule, tap listener"
  - "Startup reschedule guards: appReady AND location set AND permission granted"

requirements-completed: [NOTF-01, NOTF-02, NOTF-03, NOTF-04]

# Metrics
duration: ~8min
completed: 2026-03-16
---

# Phase 6 Plan 4: Notification Lifecycle Wiring Summary

**Foreground notification handler, startup reschedule on hydration, settings-change reschedule, and notification tap routing wired in root layout — completing the Phase 6 notification system.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-16T20:18:16Z
- **Completed:** 2026-03-16T20:26:00Z
- **Tasks:** 1 (+ checkpoint awaiting human verification)
- **Files modified:** 1

## Accomplishments

- Root layout wired with module-level `Notifications.setNotificationHandler` using correct SDK 0.31 API (`shouldShowBanner` + `shouldShowList`)
- Startup reschedule effect runs after `appReady` (fonts + migrations + hydration gate), checks permissions, calls `NotificationService.rescheduleAll` with full settings snapshot
- Settings-change reschedule: effect dependency array includes all 9 notification-relevant settings — any change triggers automatic rescheduling
- Notification tap listener routes users to correct screen: Muhasabah keywords open the modal via `useMuhasabahStore.getState().open()`, all other notifications push to habits tab

## Task Commits

1. **Task 1: Notification startup wiring** - `8a322c0` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified

- `app/_layout.tsx` — Added foreground handler (module-level), startup reschedule useEffect, tap listener useEffect, imported `expo-notifications`, `useShallow`, `NotificationService`, `useMuhasabahStore`, `useRouter`

## Decisions Made

- `shouldShowBanner` + `shouldShowList` instead of deprecated `shouldShowAlert` — SDK 0.31 `NotificationBehavior` interface requires these fields
- Notification routing uses title+body keyword matching (no custom data payload) — keeps scheduling code simple and consistent with existing `notification-copy.ts` patterns
- `rescheduleAll` effect re-runs whenever any notification setting changes — ensures settings screen changes apply immediately without app restart
- Non-fatal error handling on `rescheduleAll` — notifications are a quality-of-life feature, not core functionality; app must not crash if scheduling fails

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed deprecated shouldShowAlert in setNotificationHandler**
- **Found during:** Task 1 (TypeScript check on `app/_layout.tsx`)
- **Issue:** `shouldShowAlert` is deprecated in expo-notifications SDK 0.31; `NotificationBehavior` type requires `shouldShowBanner: boolean` and `shouldShowList: boolean` (not optional)
- **Fix:** Replaced `shouldShowAlert: true` with `shouldShowBanner: true, shouldShowList: true`
- **Files modified:** `app/_layout.tsx`
- **Verification:** `npx tsc --noEmit` shows no errors on `_layout.tsx`; 366/366 tests pass
- **Committed in:** 8a322c0

---

**Total deviations:** 1 auto-fixed (Rule 1 bug — SDK API mismatch)
**Impact on plan:** Fix required for type correctness and correct runtime behavior. No scope creep.

## Issues Encountered

- SceneObjects `showJournalGlow` and `index.tsx` Muhasabah glow logic were already fully implemented in Phase 5. Plan 04 correctly noted "no major changes expected" — confirmed, only `_layout.tsx` required new work.

## User Setup Required

None — no external service configuration required. Notifications require user permission grant on first launch (handled by onboarding notification-permissions step from Plan 02).

## Next Phase Readiness

- Phase 6 complete pending human verification checkpoint
- Full test suite: 366 tests passing across 22 suites
- Notification system end-to-end: service (06-01), UI controls (06-03), lifecycle wiring (06-04)
- Phase 7 (Backend, Auth & Sync) can begin after Phase 6 verification passes

## Self-Check: PASSED

---
*Phase: 06-onboarding-profile-and-notifications*
*Completed: 2026-03-16*
