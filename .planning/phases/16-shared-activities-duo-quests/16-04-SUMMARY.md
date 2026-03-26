---
phase: 16-shared-activities-duo-quests
plan: 04
subsystem: ui-components
tags: [activities-tab, shared-habits, duo-quests, sub-navigation, privacy-gate]
dependency_graph:
  requires:
    - phase: 16-shared-activities-duo-quests
      plan: 03
      provides: "useSharedHabitStore + useDuoQuestStore with full lifecycle"
  provides:
    - src/components/activities/SharedHabitCard.tsx
    - src/components/activities/SharedHabitProposalCard.tsx
    - src/components/activities/ProposeSharedHabitSheet.tsx
    - src/components/activities/ActivitiesTab.tsx
  affects:
    - app/(tabs)/buddies.tsx (Buddies|Activities sub-tabs added)
    - app/buddy-profile/[id].tsx (Propose Shared Habit button added)
tech_stack:
  added: []
  patterns:
    - "Sub-tab navigation via useState + conditional rendering (no library)"
    - "pairProfileMap derived from profileCache: pairId -> { name } for ActivitiesTab"
    - "Privacy Gate at UI level: ELIGIBLE_HABIT_TYPES list excludes salah/muhasabah"
key_files:
  created:
    - src/components/activities/SharedHabitCard.tsx
    - src/components/activities/SharedHabitProposalCard.tsx
    - src/components/activities/ProposeSharedHabitSheet.tsx
    - src/components/activities/ActivitiesTab.tsx
  modified:
    - app/(tabs)/buddies.tsx
    - app/buddy-profile/[id].tsx
decisions:
  - "pairProfileMap is a separate Map<pairId, { name }> derived from profileCache to give ActivitiesTab buddy names by pair ID rather than user ID"
  - "Duo Quests section in ActivitiesTab renders a placeholder — actual cards in Plan 05"
  - "Sub-tab search bar hidden when Activities tab is active to reduce visual noise"
  - "SharedHabitCard getSharedStreak called with empty arrays as graceful offline default — date hydration in future sync plan"
metrics:
  duration_minutes: 8
  completed_date: "2026-03-26"
  tasks_completed: 2
  tasks_total: 3
  files_created: 4
  files_modified: 2
---

# Phase 16 Plan 04: Activities Sub-Tab + Shared Habit UI Summary

**Status: PAUSED — awaiting human verification at checkpoint Task 3**

**One-liner:** Buddies|Activities sub-tab navigation, SharedHabitCard/ProposalCard with privacy-safe streak display, ProposeSharedHabitSheet with Privacy Gate filtering, and Propose Shared Habit entry point on buddy profile screen.

## Objective

Deliver the user-facing shared habit feature (DUOQ-01) with privacy-safe progress display (DUOQ-05). Build the Activities sub-tab, shared habit components, proposal flow, and buddy profile integration.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Activities Sub-Tab + Shared Habit Components | 9edbe91 | ActivitiesTab.tsx (new), SharedHabitCard.tsx (new), SharedHabitProposalCard.tsx (new), ProposeSharedHabitSheet.tsx (new) |
| 2 | Buddy Screen Sub-Tabs + Profile Integration | 23a772a | buddies.tsx (modified), buddy-profile/[id].tsx (modified) |

## Task 3 — Pending Human Verification

**Status:** CHECKPOINT — awaiting user approval

## Key Exports

### SharedHabitCard.tsx
- Props: `{ sharedHabit, buddyName, sharedStreak, onEnd }`
- Shows: habit name (bold), "with [buddyName]", "N days shared" streak count per D-14
- End button triggers Alert.alert confirmation before calling onEnd (D-04: unilateral end)
- Emerald-500 left accent bar for active habit visual identity

### SharedHabitProposalCard.tsx
- Props: `{ proposal, fromName, onAccept, onDecline }`
- Shows: "[fromName] wants to share: [habit name]" with Accept (emerald) / Decline (text) buttons
- Gold-700 left accent bar for incoming social action

### ProposeSharedHabitSheet.tsx
- Props: `{ visible, onClose, buddyPairId, buddyName }`
- FlatList habit type picker: 7 eligible types (salah/muhasabah excluded per D-02)
- Name TextInput, Frequency "Daily" badge (fixed for v1)
- Propose button disabled until name filled; calls useSharedHabitStore.proposeSharedHabit
- No flex:1 in Modal children (project memory constraint)

### ActivitiesTab.tsx
- Props: `{ userId, buddyPairIds, buddyProfiles: Map<pairId, { name }> }`
- Loads shared habits + duo quests on mount, pull-to-refresh
- Sections: Proposals → Shared Habits → Duo Quests (placeholder)
- Empty state when no proposals and no active habits

### buddies.tsx changes
- Buddies|Activities sub-tab bar with emerald underline on active tab
- pairProfileMap built alongside profileCache: maps buddyPairId → { name } for ActivitiesTab
- Search bar hidden when Activities tab is active

### buddy-profile/[id].tsx changes
- "Propose Shared Habit" outlined emerald button below stat grid (per D-01)
- "Start Duo Quest" disabled placeholder button (Plan 05)
- ProposeSharedHabitSheet rendered conditionally when buddyRow exists

## Privacy Compliance (DUOQ-01, DUOQ-05)

- SharedHabitCard: shows "N days shared" only — no individual completion data exposed
- ProposeSharedHabitSheet: ELIGIBLE_HABIT_TYPES list contains 7 types, salah/muhasabah absent
- isEligibleForSharing from shared-habit-engine enforces Privacy Gate at store level (second layer)
- ActivitiesTab: getSharedStreak receives only aggregate dates, returns aggregate count

## Deviations from Plan

### Auto-added: pairProfileMap state for ActivitiesTab

**Found during:** Task 2 implementation

**Issue:** ActivitiesTab needs `Map<pairId, { name }>` but `profileCache` maps `userId -> PublicBuddyProfile`. The two ID spaces are different (buddy row ID vs user ID).

**Fix:** Added `pairProfileMap` state variable in buddies.tsx. The existing profile-loading `useEffect` was extended to also populate pairProfileMap by finding which accepted buddy rows have the loaded partnerId and setting `pairRow.id -> { name: profile.displayName }`.

**Classification:** Rule 2 (missing critical data bridge — without this, ActivitiesTab would display "Buddy" for every shared habit card regardless of who the buddy is).

### No other deviations — plan executed as written.

## Adab Safety Rails Verified

- No shame copy in any component (ending a habit: "Are you sure? This can't be undone" — neutral)
- Declining a proposal framed as "Decline" not "Reject" — neutral language
- Privacy Gate enforced at two layers: UI (eligible type list) + store (isEligibleForSharing check)
- SharedHabitCard shows aggregate streak only — never individual player data (D-14)

## Known Stubs

### Duo Quests placeholder in ActivitiesTab
- File: `src/components/activities/ActivitiesTab.tsx`
- Line: ~180 (Duo Quests section)
- Content: `<Text>"Duo quest cards coming soon"</Text>`
- Reason: Intentional — Plan 05 will wire actual DuoQuestCard components here. Plan 04 only installs the Activities tab infrastructure. This stub is documented in the plan spec.

### SharedHabitCard streak shows 0 for all habits (offline v1)
- File: `src/components/activities/ActivitiesTab.tsx`
- Line: ~165 (`getSharedStreak(habit.id, [], [])`)
- Content: Empty date arrays passed to getSharedStreak
- Reason: Completion date arrays require habit_completions join that is out of scope for this plan. Will be wired when the offline completion tracking connects to shared habits in a future plan.
