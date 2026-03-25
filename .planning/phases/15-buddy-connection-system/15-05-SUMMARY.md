---
phase: 15-buddy-connection-system
plan: "05"
subsystem: buddy-profile-screen
tags: [react-native, buddy, profile, rpg-character-sheet, ui, expo-router]
dependency_graph:
  requires: [15-03]
  provides: [buddy-profile-screen, BuddyProfileCard, ConfirmActionSheet, OnlineStatusDot]
  affects:
    - app/buddy-profile/_layout.tsx
    - app/buddy-profile/[id].tsx
    - src/components/buddy/BuddyProfileCard.tsx
    - src/components/buddy/ConfirmActionSheet.tsx
    - src/components/buddy/OnlineStatusDot.tsx
tech_stack:
  added: []
  patterns:
    - Expo Router push navigation outside tabs (arena.tsx pattern)
    - Modal-based bottom sheet confirmation (no flex:1 on children — per project memory)
    - Avatar color derived from name hash (consistent per user)
    - TITLE_SEED_DATA lookup to resolve activeTitleId to display name
    - Graceful Supabase degradation (null profile falls back to derived values)
key_files:
  created:
    - app/buddy-profile/_layout.tsx
    - app/buddy-profile/[id].tsx
    - src/components/buddy/BuddyProfileCard.tsx
    - src/components/buddy/ConfirmActionSheet.tsx
    - src/components/buddy/OnlineStatusDot.tsx
  modified: []
decisions:
  - OnlineStatusDot created in Plan 05 (not 04) to unblock profile screen — Plan 04 will reuse it
  - Avatar color derived from name hash with 5-color palette for visual variety without API dependency
  - Three-dot menu implemented as absolute-positioned Modal dropdown (not a library sheet) for zero dependency cost
  - Graceful degradation: if getBuddyProfile returns null (offline), screen shows safe fallback values (level 1, 0 XP, 0 streak)
metrics:
  duration: "8 minutes"
  completed: "2026-03-25"
  tasks_completed: 1
  files_created: 5
  files_modified: 0
---

# Phase 15 Plan 05: Buddy Profile Detail Screen Summary

**One-liner:** Buddy profile screen with RPG character-sheet layout (avatar, identity title, 2x2 stat grid), silent block/remove actions via ConfirmActionSheet, and "Only public progress is shared" privacy notice — no worship data exposed.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Buddy profile screen, stat cards, confirmation sheet, online status dot | ff8d141 | 5 files created |

## Checkpoint Status

| Task | Type | Status |
|------|------|--------|
| 2 | checkpoint:human-verify | Pending human verification |

**Checkpoint details:** Human must verify the buddy profile screen visually — avatar initial, identity title font (PressStart2P), 2x2 stats grid layout (Level, XP Total in gold, Current Streak, Days Connected), privacy notice, three-dot menu showing Remove/Block options, and confirmation sheet destructive styling for Block action.

## What Was Built

### app/buddy-profile/_layout.tsx
Stack layout with `headerShown: false` for buddy profile sub-navigation. Follows the same pattern as arena.tsx for full-screen push navigation outside the tab bar.

### app/buddy-profile/[id].tsx
Full profile screen with:
- **Header bar**: Back arrow (44x44px touch target), buddy displayName (headingMd centered), three-dot menu button with `accessibilityLabel="Buddy actions menu"`
- **Avatar**: 80x80px circle, background color derived from display name hash (5-color palette), first letter as headingXl white text
- **Identity Title**: PressStart2P 12px (`hudXp` token), resolves `activeTitleId` via `TITLE_SEED_DATA`, falls back to "Adventurer" if null
- **Online Status**: `OnlineStatusDot` centered (green within 15 min, gray + "Active Xh ago" beyond)
- **Stats Grid**: 2x2 grid using flexDirection row + wrap pattern:
  - Level card (textPrimary color)
  - XP Total card (gold `#FFD700` via `colors.dark.xp`)
  - Current Streak card
  - Days Connected (computed from `buddyRow.acceptedAt`)
- **Privacy notice**: bodySm, opacity 0.6, centered
- **Three-dot menu**: Modal dropdown with Remove (normal) and Block (destructive red text) options
- **ConfirmActionSheet** integration for both actions; Remove/Block calls store then `router.back()`

**Data flow:**
1. Route param `id` matched against `useBuddyStore.accepted` to find buddy row
2. `getBuddyId(userA, userB, userId)` resolves other user's ID
3. `getBuddyProfile(buddyUserId)` fetches Supabase data
4. Graceful fallback to safe defaults if profile is null (offline mode)

**Privacy boundary:** Only queries `PublicBuddyProfile` which contains `displayName`, `currentLevel`, `totalXp`, `activeTitleId`, `currentStreakCount`, `lastActiveAt`. No worship data fields exist on this type.

### src/components/buddy/BuddyProfileCard.tsx
Reusable stat card component (64 lines):
- Props: `label`, `value`, `valueColor?`, `icon?`
- Surface background (`#1E293B`), borderRadius 12, cardPadding 16px
- Value: headingMd (20px Inter-SemiBold), centered
- Label: bodySm (13px Inter-Regular), centered below value
- Optional `valueColor` override (used for gold XP total)

### src/components/buddy/ConfirmActionSheet.tsx
Modal bottom sheet confirmation (148 lines):
- Props: `visible`, `title`, `body`, `confirmLabel`, `onConfirm`, `onCancel`, `destructive?`
- Semi-transparent backdrop (rgba 0.6), tap-to-cancel
- Sheet anchored to bottom with `position: absolute` — no `flex: 1` on children (per project memory)
- Confirm button: emerald (`#0D7C3D`) for normal, error red (`#9B1B30`) for destructive
- Cancel button: gray muted text, minimum 44px touch target

### src/components/buddy/OnlineStatusDot.tsx
Status dot component (57 lines):
- Props: `status: 'online' | 'offline'`, `label?`
- Online: emerald-500 (`#0D7C3D`) dot
- Offline: text-muted (`#64748B`) dot
- Optional label text in bodySm muted color
- Created in Plan 05 (not 04) as a required dependency — Plan 04 will reuse it

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created OnlineStatusDot in Plan 05 (Plan 04 dependency)**
- **Found during:** Task 1 (profile screen imports OnlineStatusDot)
- **Issue:** Plan 04 (buddy list) creates `OnlineStatusDot.tsx` but Plan 04 hasn't executed yet. Plan 05 depends on it.
- **Fix:** Created minimal `OnlineStatusDot.tsx` in this plan. Plan 04 can reuse/extend it when it runs. No duplication — same file path.
- **Files modified:** `src/components/buddy/OnlineStatusDot.tsx`
- **Commit:** ff8d141

## Decisions Made

- `OnlineStatusDot` created ahead of Plan 04 to unblock Plan 05 — shared ownership, Plan 04 extends as needed
- Avatar color algorithm: string hash → modulo 5-color palette (emerald-800, sapphire-800, ruby-500, gold-700, surface-700) for consistent per-user coloring without network dependency
- Three-dot menu as absolute-positioned Modal dropdown avoids adding a bottom-sheet library; consistent with existing codebase pattern (no additional npm packages)
- `getBuddyProfile` failure is non-fatal: screen degrades gracefully to level 1 / 0 XP / 0 streak display rather than crashing or showing error state
- Used `useCallback` on confirm handlers to prevent accidental double-tap re-renders

## Known Stubs

None — all stat values are wired to real data sources:
- Level, XP Total, Current Streak, lastActiveAt: from `PublicBuddyProfile` (Supabase query via `buddyRepo.getBuddyProfile`)
- Days Connected: computed live from `buddyRow.acceptedAt`
- Identity Title: resolved from `TITLE_SEED_DATA` lookup (local, no stub)
- Fallback values (level 1, 0 XP, 0 streak) are safe offline defaults, not stubs

## Self-Check: PASSED

- `app/buddy-profile/_layout.tsx` — FOUND
- `app/buddy-profile/[id].tsx` — FOUND (489 lines, >= 80 required)
- `src/components/buddy/BuddyProfileCard.tsx` — FOUND (64 lines, >= 20 required)
- `src/components/buddy/ConfirmActionSheet.tsx` — FOUND (148 lines, >= 30 required)
- `src/components/buddy/OnlineStatusDot.tsx` — FOUND
- Commit ff8d141 — verified in git log
