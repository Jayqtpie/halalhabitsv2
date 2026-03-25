---
phase: 15-buddy-connection-system
plan: "03"
subsystem: buddy-store
tags: [zustand, store, buddy, streak-sync, tdd]
dependency_graph:
  requires: [15-01, 15-02]
  provides: [buddyStore, habitStore-streak-sync]
  affects: [src/stores/buddyStore.ts, src/stores/habitStore.ts]
tech_stack:
  added: []
  patterns:
    - Zustand store without persist middleware (SQLite as source of truth)
    - TDD static analysis test pattern (file content assertions)
    - Denormalized streak sync via Privacy Gate-safe users table column
key_files:
  created:
    - src/stores/buddyStore.ts
    - __tests__/stores/buddyStore.test.ts
  modified:
    - src/stores/habitStore.ts
decisions:
  - buddyStore uses no persist middleware — SQLite via buddyRepo is source of truth
  - enterCode checks rate limit and buddy cap before DB lookups (fail-fast ordering)
  - Invite code cleared (inviteCode: null) on redemption — single-use enforcement
  - syncStreakToUser is non-fatal — warn only so streak display lag never breaks habit flow
  - currentStreakCount updated via direct drizzle call rather than a new userRepo method
metrics:
  duration: "4 minutes"
  completed: "2026-03-25"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
---

# Phase 15 Plan 03: Buddy Store & Streak Sync Summary

**One-liner:** Zustand buddyStore orchestrating full buddy lifecycle (load/invite/enter/accept/block) plus habitStore denormalized streak sync to users table for Privacy Gate-safe buddy profiles.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 (RED) | Failing tests for buddyStore | a04b65e | `__tests__/stores/buddyStore.test.ts` |
| 1 (GREEN) | Implement buddyStore with all lifecycle ops | b05cbec | `src/stores/buddyStore.ts`, `__tests__/stores/buddyStore.test.ts` |
| 2 | Wire habitStore streak sync to users table | d70c6fc | `src/stores/habitStore.ts` |

## What Was Built

### buddyStore (`src/stores/buddyStore.ts`)

Zustand store managing buddy connection state with no persist middleware.

**State shape:**
- `accepted: Buddy[]` — fully connected buddies
- `pendingIncoming: Buddy[]` — pending requests addressed to current user
- `pendingOutgoing: Buddy[]` — pending requests sent by current user
- `pendingBadgeCount: number` — drives badge on buddy navigation tab
- `lastGeneratedCode: string | null` — last generated code for clipboard display

**Operations:**
- `loadBuddies(userId)` — loads all three arrays + sets badge count
- `generateInviteCode(userId)` — creates pending row with code, placeholder `userB: ''`
- `enterCode(code, userId)` — 7-path validation: rate_limited → max_buddies → not_found → expired → already_connected (self) → blocked → already_connected (existing pair) → success
- `acceptRequest / declineRequest / removeBuddy` — status transitions, refresh state
- `blockBuddy` — `getBlockerSide()` computes side, writes `blocked_by_a` or `blocked_by_b`
- `searchUsers / getBuddyProfile / sendHeartbeat` — Supabase-backed helpers (degrade gracefully offline)

### habitStore streak sync (`src/stores/habitStore.ts`)

Added `syncStreakToUser(userId, streakCount)` helper:
- Called at step 6a in `completeHabit`, immediately after `streakRepo.upsert`
- Updates `users.current_streak_count` and `users.updated_at` via drizzle
- Non-fatal wrapper — warn only, never breaks the habit completion flow

**Privacy Gate rationale:** The `streaks` table is PRIVATE (worship consistency data, never syncs). The `users.current_streak_count` column is SYNCABLE (aggregated public score, safe to sync). This is the only correct channel for buddy profiles to observe streak data.

## Test Results

- 31 buddyStore static analysis tests — all passing
- 82 total buddy-related tests (engine + repo + store) — all passing
- 769 full suite tests — all passing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test regex matched "persist" in JSDoc comment**
- **Found during:** Task 1 TDD GREEN phase
- **Issue:** The test `expect(storeContent).not.toMatch(/persist/)` fired because the buddyStore JSDoc comment contains "NO persist middleware". The test intent was to verify no `persist(` middleware call, not to ban the word entirely.
- **Fix:** Updated regex to `/\bpersist\s*\(/` which matches actual middleware usage only
- **Files modified:** `__tests__/stores/buddyStore.test.ts`
- **Commit:** b05cbec

## Decisions Made

- buddyStore uses no persist middleware — consistent with detoxStore, bossStore pattern
- `enterCode` validation order: rate limit → cap → code lookup → expiry → self-check → pair check. Fail-fast ordering avoids unnecessary DB queries
- `inviteCode: null` on redemption enforces single-use codes at the data layer
- `syncStreakToUser` is non-fatal — buddy streak display may lag briefly but will never break the core habit completion flow
- Used direct drizzle call rather than a new `userRepo.updateStreakCount()` method to minimize plan scope

## Known Stubs

None — all implemented functionality is fully wired to real data sources.

## Self-Check: PASSED

- `src/stores/buddyStore.ts` — FOUND
- `__tests__/stores/buddyStore.test.ts` — FOUND
- Commits a04b65e, b05cbec, d70c6fc — all verified in git log
