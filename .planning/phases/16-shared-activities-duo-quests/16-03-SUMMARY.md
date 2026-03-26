---
phase: 16-shared-activities-duo-quests
plan: 03
subsystem: state-management
tags: [zustand, stores, xp-integration, badge-integration, shared-habits, duo-quests, privacy-gate]
dependency_graph:
  requires:
    - phase: 16-shared-activities-duo-quests
      plan: 01
      provides: "Domain engines (shared-habit-engine, duo-quest-engine) with Privacy Gate"
    - phase: 16-shared-activities-duo-quests
      plan: 02
      provides: "sharedHabitRepo + duoQuestRepo with assertSyncable + sync queue"
  provides:
    - src/stores/sharedHabitStore.ts
    - src/stores/duoQuestStore.ts
  affects:
    - src/stores/buddyStore.ts (pendingProposalCount + setPendingProposalCount added)
    - future: DuoQuestScreen UI (plan 04) — consumes useDuoQuestStore
    - future: SharedHabitScreen UI (plan 05) — consumes useSharedHabitStore
tech_stack:
  added: []
  patterns:
    - "Zustand store with no persist middleware (SQLite via repo is source of truth)"
    - "Cross-store communication via getState() setter (sharedHabitStore -> buddyStore)"
    - "useGameStore.getState().awardXP() for XP awards from non-React context"
    - "_extractBuddyPairIds helper for reload calls without re-supplying pair IDs"
key_files:
  created:
    - src/stores/sharedHabitStore.ts
    - src/stores/duoQuestStore.ts
  modified:
    - src/stores/buddyStore.ts
decisions:
  - "setPendingProposalCount is a plain setter on buddyStore — sharedHabitStore calls it after loadSharedHabits to avoid circular dependency"
  - "pendingBadgeCount in buddyStore now = pendingIncoming.length + pendingProposalCount per D-03"
  - "recordMyProgress awards bonus XP to the player who triggers both-complete (sync will handle the partner's bonus in real-time when implemented)"
  - "checkInactivityStatus uses quest.updatedAt as partner's last activity proxy (conservative — any write updates it)"
  - "createCustom defaults xpRewardBonus to Math.round(xpRewardEach * 0.5) when not supplied"
  - "_extractBuddyPairIds helper derives pair IDs from current state for internal reload calls in proposeSharedHabit"
metrics:
  duration_minutes: 3
  completed_date: "2026-03-26"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 1
---

# Phase 16 Plan 03: Shared Habit Store + Duo Quest Store Summary

**One-liner:** Zustand state management layer for shared habits and duo quests — full lifecycle orchestration with domain engine + repo calls, XP awards via gameStore, and buddy tab badge count integration for incoming shared habit proposals.

## Objective

Provide the state management layer (stores) that UI components (Plans 04, 05) will consume. Stores orchestrate domain engine logic + repository calls, following the buddyStore.ts no-persist pattern where SQLite is the source of truth.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Shared Habit Store + buddyStore Badge Integration | ea24537 | sharedHabitStore.ts (new), buddyStore.ts (modified) |
| 2 | Duo Quest Store + gameStore XP Integration | 4557f27 | duoQuestStore.ts (new) |

## Key Exports

### sharedHabitStore.ts — `useSharedHabitStore`
- **State:** `activeSharedHabits: SharedHabit[]`, `proposals: SharedHabit[]`, `loading: boolean`
- `loadSharedHabits(buddyPairIds, userId)` — fetch active habits across all pairs + incoming proposals; calls `setPendingProposalCount` on buddyStore after load
- `proposeSharedHabit(params)` — checks `isEligibleForSharing` (blocks worship habits), calls `createSharedHabitProposal` from domain engine, persists via `sharedHabitRepo.create`
- `acceptProposal(id, userId, pairIds)` — updateStatus to 'active' + reload
- `declineProposal(id, userId, pairIds)` — updateStatus to 'ended' + reload
- `endSharedHabit(id, userId, pairIds)` — checks `canEndSharedHabit` first, then updateStatus to 'ended' (per D-04: either player can end unilaterally)
- `getSharedStreak(id, userADates, userBDates)` — pure computation via `calculateSharedStreak`, no DB call

### duoQuestStore.ts — `useDuoQuestStore`
- **State:** `activeQuests: DuoQuest[]`, `completedQuests: DuoQuest[]`, `loading: boolean`
- `loadDuoQuests(buddyPairId)` — fetch active + completed for one buddy pair
- `loadAllDuoQuests(buddyPairIds)` — concat quests across all pairs for Activities tab
- `createFromTemplate(params)` — enforces MAX_ACTIVE_DUO_QUESTS=3 via `canCreateDuoQuest`, creates from `DuoQuestTemplate`
- `createCustom(params)` — same 3-quest enforcement, defaults `xpRewardBonus` to `Math.round(xpRewardEach * 0.5)` if not supplied
- `recordMyProgress(questId, side, userId)` — `recordProgress` from domain engine, `updateProgress` to repo, awards individual XP when side completes, awards bonus XP when both complete (DUOQ-03)
- `checkInactivityStatus(questId, side)` — delegates to `checkInactivity` from domain engine, returns `'ok' | 'warning' | 'exit_eligible'` (D-09/D-10)
- `exitQuest(questId, side, userId)` — `calculatePartialXP`, awards proportional individual XP, no bonus (D-10), status → 'exited'

### buddyStore.ts — modified
- **Added state:** `pendingProposalCount: number` (default 0)
- **Added method:** `setPendingProposalCount(count: number)` — updates count and recalculates `pendingBadgeCount`
- **Modified:** `loadBuddies` now adds `pendingProposalCount` to `pendingBadgeCount` calculation (D-03)

## XP Award Summary

| Action | sourceType | XP Amount |
|--------|-----------|-----------|
| Player's side reaches target | `duo_quest_individual` | `quest.xpRewardEach` |
| Both players complete | `duo_quest_bonus` | `quest.xpRewardBonus` |
| Exit after 72h inactivity | `duo_quest_partial` | `Math.floor(progress / target * xpRewardEach)` |

## Deviations from Plan

### Auto-added: `_extractBuddyPairIds` helper

**Found during:** Task 1 implementation

**Issue:** `proposeSharedHabit` needs to call `loadSharedHabits` to reload after creating, but the method signature only receives `buddyPairId` (singular). After proposal, the existing pairs are already in state.

**Fix:** Added private `_extractBuddyPairIds(state)` helper that reads current activeSharedHabits and proposals from state to reconstruct the full buddy pair ID list for the reload call.

**Classification:** Rule 2 (missing critical functionality — without this, the store couldn't reload after proposal without caller re-supplying all pair IDs).

### No other deviations — plan executed as written.

## Adab Safety Rails Verified

- Privacy Gate enforced: `isEligibleForSharing` check in `proposeSharedHabit` returns `'ineligible_type'` for salah/muhasabah
- No worship data (habit_completions, streaks, muhasabah_entries) referenced in either store
- `getSharedStreak` passes both player's dates to `calculateSharedStreak` without labeling which is which — aggregate-only pattern maintained
- No shame copy — exit is framed as "exit with partial XP" not punishment
- XP is effort-based: proportional on exit, full on completion — never reduced for a missed day

## Known Stubs

None — this plan creates pure state management stores with no UI rendering or data source wiring stubs. All methods call real repo and domain engine functions. UI wiring is the responsibility of Plans 04 and 05.

## Self-Check: PASSED

All files exist on disk. Both commits (ea24537, 4557f27) verified in git log. TypeScript compilation shows zero errors in src/stores/ layer introduced by this plan.
