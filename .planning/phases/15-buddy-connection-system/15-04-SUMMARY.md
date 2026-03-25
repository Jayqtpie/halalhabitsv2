---
phase: 15-buddy-connection-system
plan: 04
subsystem: ui
tags: [react-native, expo-router, zustand, supabase, buddy-system, tab-navigation, bottom-sheet, modal]

# Dependency graph
requires:
  - phase: 15-03
    provides: buddyStore with full state management and invite code generation
  - phase: 15-01
    provides: buddy-engine pure functions (canSendRequest, canAddBuddy, isBlocked)

provides:
  - Buddies tab registered as 5th tab in app/(tabs) navigation
  - Custom tab icon (two overlapping circles) for buddies route
  - Pending request badge on buddies tab icon (emerald bg, PressStart2P font)
  - BuddyCard: pressable row with avatar, username, OnlineStatusDot, streak count
  - PendingRequestCard: accept/decline action buttons with accessibility labels
  - BuddyEmptyState: pixel-art placeholder, mentor copy, two CTAs
  - InviteCodeSheet: code display, native share sheet, clipboard copy fallback
  - EnterCodeSheet: auto-uppercase input, format validation, 5 error states
  - DiscoverabilitySheet: one-time opt-in prompt shown on first tab visit
  - Full buddies.tsx screen: search, pending section, buddy list, empty state, refresh

affects: [15-05, settings-screen, buddy-profile]

# Tech tracking
tech-stack:
  added: [expo-clipboard (for code copy), Share (React Native built-in)]
  patterns:
    - Bottom sheet pattern using React Native Modal with absolute positioning (no flex:1)
    - Debounced search using useRef + setTimeout (300ms)
    - Privacy-first discoverability: defaults to not discoverable, one-time prompt
    - Pending badge count from Zustand store rendered in tab bar
    - Profile cache Map for lazy loading buddy display names

key-files:
  created:
    - app/(tabs)/buddies.tsx
    - src/components/buddy/BuddyCard.tsx
    - src/components/buddy/PendingRequestCard.tsx
    - src/components/buddy/BuddyEmptyState.tsx
    - src/components/buddy/InviteCodeSheet.tsx
    - src/components/buddy/EnterCodeSheet.tsx
    - src/components/buddy/DiscoverabilitySheet.tsx
  modified:
    - app/(tabs)/_layout.tsx
    - src/components/ui/CustomTabBar.tsx
    - src/i18n/locales/en/translation.json
    - src/stores/settingsStore.ts

key-decisions:
  - "discoverabilityPrompted flag added to settingsStore for re-show prevention (Rule 2 deviation)"
  - "OnlineStatusDot reused from Plan 05 — existing interface (status + label props) rather than lastActiveAt"
  - "DiscoverabilitySheet backdrop tap defaults to Keep Private (privacy-first)"
  - "Bottom sheets use React Native Modal with absolute positioning, not flex:1 (per project memory)"

patterns-established:
  - "Bottom sheet pattern: Modal with transparent=true, animationType=slide, absolute View, NO flex:1"
  - "Badge rendering: position absolute on iconContainer, emerald bg, PressStart2P font, 9+ cap"
  - "Buddy avatar fallback: first letter of displayName, emerald circle background"
  - "Search debounce: useRef holding setTimeout id, cleared on new keystroke, 300ms delay"

requirements-completed: [BUDY-01, BUDY-02, BUDY-03, BUDY-05]

# Metrics
duration: 35min
completed: 2026-03-25
---

# Phase 15 Plan 04: Buddy List UI Summary

**Full buddy list tab with 7 components: code-based connection flow (invite/enter), debounced username search, pending request management, and one-time discoverability opt-in**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-03-25
- **Completed:** 2026-03-25
- **Tasks:** 3 automated (Task 4 is checkpoint — pending human verification)
- **Files modified:** 11

## Accomplishments

- Buddies registered as 5th tab with two-circle icon, i18n label, and pending request badge
- 7 new components in src/components/buddy/ (3 atomic, 3 bottom sheets, 1 screen)
- Full buddy list screen with search, pending requests, buddy list, empty state, and pull-to-refresh
- Invite code generation + native OS share sheet + clipboard copy
- Enter code with format validation, 5 error states (not_found, expired, rate_limited, max_buddies, blocked)
- Discoverability prompt shown on first visit — privacy-first default (Keep Private)

## Task Commits

1. **Task 1: Add buddies tab to navigation and CustomTabBar badge support** — `e89c74d` (feat)
2. **Task 2a: Build atomic buddy components** — `178b54d` (feat)
3. **Task 2b: Build bottom sheets and full buddies screen** — `47899d3` (feat)
4. **Task 4: Checkpoint — human verification** — PENDING (not yet executed)

## Files Created/Modified

- `app/(tabs)/_layout.tsx` — Added buddies Tabs.Screen registration between quests and profile
- `app/(tabs)/buddies.tsx` — Full buddy list screen (search, pending, list, empty, modals)
- `src/components/ui/CustomTabBar.tsx` — Added buddies icon case, routeLabel, badge rendering
- `src/i18n/locales/en/translation.json` — Added tabs.buddies key
- `src/components/buddy/BuddyCard.tsx` — Pressable row with avatar, status, streak
- `src/components/buddy/PendingRequestCard.tsx` — Accept/Decline action card
- `src/components/buddy/BuddyEmptyState.tsx` — Warm mentor copy with dual CTAs
- `src/components/buddy/InviteCodeSheet.tsx` — Code display, share, clipboard
- `src/components/buddy/EnterCodeSheet.tsx` — Input validation + all error states
- `src/components/buddy/DiscoverabilitySheet.tsx` — One-time opt-in prompt
- `src/stores/settingsStore.ts` — Added discoverabilityPrompted field

## Decisions Made

- Reused existing OnlineStatusDot from Plan 05 (status + optional label props) rather than changing its interface to lastActiveAt — BuddyCard now computes status from lastActiveAt and passes computed values.
- discoverabilityPrompted persisted in settingsStore (SQLite-backed) so it survives app restart.
- DiscoverabilitySheet backdrop tap defaults to Keep Private for privacy-first behavior.
- Profile cache implemented as useState Map for lazy loading — no store overhead.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added discoverabilityPrompted to settingsStore**
- **Found during:** Task 2b (DiscoverabilitySheet and buddies.tsx)
- **Issue:** Plan specified "save preference to prevent re-showing" but no store field existed for this — without persistence the prompt would re-appear on every app restart
- **Fix:** Added `discoverabilityPrompted: boolean` field to settingsStore with setter, persisted via existing SQLite middleware
- **Files modified:** src/stores/settingsStore.ts
- **Verification:** Field added with default `false`, setter `setDiscoverabilityPrompted`, included in `partialize` for SQLite persistence
- **Committed in:** 47899d3 (Task 2b commit)

**2. [Rule 1 - Interface Mismatch] Adapted to existing OnlineStatusDot interface**
- **Found during:** Task 2a (BuddyCard)
- **Issue:** Plan spec said OnlineStatusDot should accept `lastActiveAt: string | null`, but Plan 05 had already created it with `status: 'online' | 'offline'` + optional `label` props
- **Fix:** BuddyCard computes online/offline status and relative time label from lastActiveAt, then passes computed values to the existing OnlineStatusDot interface
- **Files modified:** src/components/buddy/BuddyCard.tsx
- **Verification:** BuddyCard renders correctly with both interface styles; no breaking changes to Plan 05 usage
- **Committed in:** 178b54d (Task 2a commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical field, 1 interface adaptation)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Checkpoint Status

**Task 4 (human-verify): PENDING**
The checkpoint requires visual verification of the buddy list tab and all connection flow UI in the running app. This cannot be automated.

Verification steps per plan:
1. Open app — verify 5th "Buddies" tab with two-circle icon
2. Tap Buddies — verify empty state with heading + two CTAs
3. Tap "Invite a Buddy" — verify HH-XXXX code in bottom sheet with Share button
4. Tap "Share Code" — verify native OS share sheet opens
5. Tap "Enter Code" — verify auto-uppercase input, disabled button until valid format
6. Type invalid code — verify appropriate error message
7. Verify search bar with placeholder "Search by username..."
8. On first visit, verify discoverability prompt appears

## Known Stubs

- `src/components/buddy/BuddyEmptyState.tsx` — Pixel-art placeholder uses two gray rounded rects. Real pixel-art characters are deferred to a future assets phase.
- `app/(tabs)/buddies.tsx` (profileCache) — BuddyCard profile data (displayName, streakCount, lastActiveAt) uses an in-memory Map that starts empty. Buddy display names show "Unknown" until fetched. A future plan should wire profile fetching via buddyStore.getBuddyProfile on list load.

## Issues Encountered

None outside the two tracked deviations above.

## Next Phase Readiness

- Buddy list tab fully functional for human verification
- Plan 05 (buddy profile screen) was already executed and complete
- BuddyCard navigates to `/buddy-profile/[userId]` which Plan 05 implemented
- DiscoverabilitySheet triggers Supabase users table update via dynamic import (graceful offline degradation)

---
*Phase: 15-buddy-connection-system*
*Completed: 2026-03-25*
