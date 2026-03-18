---
phase: 07-backend-auth-and-sync
plan: "03"
subsystem: auth-ui
tags: [auth, ui, settings, sync-status, react-native, reanimated]
dependency_graph:
  requires:
    - 07-01 (authStore, auth-service, signIn/signUp/signOut/deleteAccount)
  provides:
    - app/(auth)/sign-in.tsx
    - app/(auth)/create-account.tsx
    - src/components/auth/AccountNudgeBanner.tsx
    - src/components/auth/MergeChoiceSheet.tsx
    - src/components/sync/SyncStatusIcon.tsx
    - src/components/settings/AccountSection.tsx
    - src/components/settings/DeleteAccountSheet.tsx
  affects:
    - app/settings.tsx (AccountSection added as first section)
    - app/_layout.tsx ((auth) route group registered)
tech_stack:
  added: []
  patterns:
    - Reanimated withTiming + withRepeat for banner animation and sync spinner
    - Modal bottom sheet pattern (transparent overlay + slide sheet)
    - KeyboardAvoidingView for auth form screens
    - authStore selector pattern (per-field selectors, no shallow needed)
key_files:
  created:
    - app/(auth)/_layout.tsx
    - app/(auth)/sign-in.tsx
    - app/(auth)/create-account.tsx
    - src/components/auth/AccountNudgeBanner.tsx
    - src/components/auth/MergeChoiceSheet.tsx
    - src/components/sync/SyncStatusIcon.tsx
    - src/components/settings/AccountSection.tsx
    - src/components/settings/DeleteAccountSheet.tsx
  modified:
    - app/settings.tsx (AccountSection inserted as first section)
    - app/_layout.tsx ((auth) route group registered as modal)
decisions:
  - Auth screens use PressStart2P at 18px for headingLg per UI-SPEC (overrides typography.headingLg which uses Inter-Bold — pixel font only for screen titles)
  - MergeChoiceSheet opens from create-account screen after form validation (not immediately on tap)
  - AccountNudgeBanner dismisses via store flag (setNudgeDismissed) — exit animation runs 200ms before flag set
  - SyncStatusIcon treats idle+not-authenticated as the "offline/no account" state (cloud-x, surface-700)
  - DeleteAccountSheet uses Alert for network errors rather than inline error (destructive flow, single attempt expected)
metrics:
  duration: "~15 min"
  tasks_completed: 1
  tasks_total: 2
  files_created: 8
  files_modified: 2
  completed_date: "2026-03-18"
---

# Phase 7 Plan 03: Auth UI Screens and Account Management Components Summary

One-liner: Full auth UI layer with sign-in/create-account screens, MergeChoiceSheet, AccountNudgeBanner with Reanimated animation, SyncStatusIcon with 4 states, and AccountSection/DeleteAccountSheet in settings.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Auth screens, components, and settings account section | 7a3812b | app/(auth)/*, src/components/auth/*, src/components/sync/*, src/components/settings/AccountSection.tsx, src/components/settings/DeleteAccountSheet.tsx, app/settings.tsx, app/_layout.tsx |

## Checkpoint Reached

Task 2 is `checkpoint:human-verify` — paused for visual verification.

## What Was Built

### app/(auth)/_layout.tsx
Simple Stack layout with `headerShown: false` for the auth screen group.

### app/(auth)/sign-in.tsx
Full-screen sign-in form:
- Surface-900 background, surface-800 card with cardPadding (16px)
- "Welcome Back" title in PressStart2P 18px
- Email field (keyboardType email-address, autoCapitalize none, returnKeyType next)
- Password field with show/hide toggle (44x44 touch target)
- Default border #1E293B, focused border #0D7C3D (2px), error border ruby-500
- Error text in bodySm below fields (not toast)
- "Sign In" primary button (emerald-500, full width, buttonPaddingVertical 16px)
- "Don't have an account? Create one" link to create-account
- "Continue Without Account" guest escape hatch below card
- KeyboardAvoidingView wrapping form
- Calls `signIn(email, password)` → router.replace('/(tabs)') on success

### app/(auth)/create-account.tsx
Full-screen account creation form:
- Same layout as sign-in
- "Protect Your Progress" title in PressStart2P 18px
- Opens MergeChoiceSheet after form validation
- Calls signUp from MergeChoiceSheet with keepProgress choice
- "Already have an account? Sign In" link
- "Continue Without Account" guest escape hatch

### src/components/auth/MergeChoiceSheet.tsx
Modal bottom sheet with two options:
- "Keep My Progress" → signUp(email, password, keepProgress=true)
- "Start Fresh" → signUp(email, password, keepProgress=false)
- Surface-800 background, modalPadding 24px, modalElementGap 16px
- Each option as full-width Pressable with description text

### src/components/auth/AccountNudgeBanner.tsx
Non-blocking bottom banner:
- Position absolute, bottom 0
- Mercy orange left accent bar (3px solid #FFB347)
- Surface-800 background with mercy orange tint
- "Your progress is safe — for now." title in bodySm mercy color
- Body: "You've earned [titleName]. Create a free account..."
- "Keep My Progress" CTA in emerald-500
- Dismiss X (44x44 touch target) — calls setNudgeDismissed(true)
- Reanimated: enter translateY +80→0 over 250ms ease-out; exit 0→+80 over 200ms ease-in
- Guards: renders null if isAuthenticated or nudgeDismissed

### src/components/sync/SyncStatusIcon.tsx
Cloud icon with 4 states driven by authStore.syncStatus:
- Synced: cloud + ✓, emerald-500, caption "Synced"
- Syncing: cloud + ↻ animated (Reanimated withRepeat 800ms linear), emerald-500, caption "Syncing..."
- Error: cloud + ! badge, gold-500, caption "Sync failed — tap to retry"
- Offline/no account: cloud + ✕, surface-700 muted, caption "Offline"
- 44x44px touch target, tap triggers flushQueue() in error state
- accessibilityLabel reflects current state

### src/components/settings/AccountSection.tsx
Settings section for account management:
- Guest state: "Not signed in..." body + Sign In row + Create Account row
- Authenticated state: email + SyncStatusIcon row, Sync Now button, Sign Out row, Delete Account row
- Sign Out: no confirmation, calls signOut() (reversible, non-destructive)
- Delete Account: opens DeleteAccountSheet
- Matches settings screen row pattern (listItemPaddingHorizontal/Vertical: 16px)

### src/components/settings/DeleteAccountSheet.tsx
Two-step destructive confirmation:
- "Delete Everything?" title
- Full destructive warning body copy from UI-SPEC
- "Delete Everything" button in ruby-500 with accessibilityHint
- "Keep My Account" secondary button (not "Cancel")
- On confirm: deleteAccount(userId) → router.replace('/(onboarding)')

### app/settings.tsx
AccountSection inserted as the first section (above PRAYER section).

### app/_layout.tsx
`(auth)` route group registered: `<Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />`

## Deviations from Plan

None — plan executed exactly as written.

## Decisions Made

- PressStart2P used for auth screen titles per UI-SPEC (18px/28px) — the typography.headingLg token is Inter-Bold 24px which differs from UI-SPEC which specifies PressStart2P 18px for screen titles. UI-SPEC wins here.
- SyncStatusIcon treats both `idle` AND `!isAuthenticated` as the offline/no-account visual state (cloud-x, surface-700). The `idle` status when no account is present should show the muted state, not a misleading "synced" indicator.
- MergeChoiceSheet is rendered inside create-account.tsx (not as a separate route) — keeps the flow contained and avoids navigation complexity for a single-use decision modal.
- AccountNudgeBanner uses setTimeout(210ms) to let exit animation finish before calling setNudgeDismissed — avoids the banner disappearing before animation completes.

## Self-Check: PASSED

Files created:
- app/(auth)/_layout.tsx — FOUND
- app/(auth)/sign-in.tsx — FOUND
- app/(auth)/create-account.tsx — FOUND
- src/components/auth/AccountNudgeBanner.tsx — FOUND
- src/components/auth/MergeChoiceSheet.tsx — FOUND
- src/components/sync/SyncStatusIcon.tsx — FOUND
- src/components/settings/AccountSection.tsx — FOUND
- src/components/settings/DeleteAccountSheet.tsx — FOUND

Commits:
- 7a3812b — feat(07-03): auth UI screens and account management components — FOUND
