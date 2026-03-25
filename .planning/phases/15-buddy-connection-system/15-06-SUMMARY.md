---
phase: 15-buddy-connection-system
plan: "06"
subsystem: buddy-ui
tags: [bug-fix, gap-closure, profile-cache, buddy-list]
dependency_graph:
  requires:
    - 15-05-SUMMARY.md
  provides:
    - profileCache populated with real PublicBuddyProfile data on buddy list screen
  affects:
    - app/(tabs)/buddies.tsx
    - BuddyCard display name, streak count, lastActiveAt
    - PendingRequestCard display name
tech_stack:
  added: []
  patterns:
    - Functional useState update for Map mutation (avoids stale closures)
    - useEffect dependency on store arrays to re-fire after loadBuddies resolves
    - Promise.all + de-duplication via Set for batch profile loading
key_files:
  created: []
  modified:
    - app/(tabs)/buddies.tsx
decisions:
  - Profile loading is non-blocking; list renders with empty cache then re-renders as each profile resolves
  - De-duplication via Set prevents duplicate getBuddyProfile calls if a user appears in both accepted and pendingIncoming
  - Functional update pattern (prev => new Map(prev)) ensures React sees the new Map reference and triggers re-render
metrics:
  duration: 5m
  completed: "2026-03-25"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Phase 15 Plan 06: Populate profileCache — Gap Closure Summary

**One-liner:** Added `setProfileCache` setter and a profile-loading `useEffect` so `BuddyCard` and `PendingRequestCard` receive real `displayName`, `streakCount`, and `lastActiveAt` instead of `undefined`.

## What Was Changed

### Root Cause

`profileCache` was declared as `const [profileCache]` — no setter, no population mechanism. Every call to `profileCache.get(partnerUserId)` returned `undefined`, causing `BuddyCard` to fall back to "Unknown" for display name and 0 for streak count.

### Fix: Three surgical edits to `app/(tabs)/buddies.tsx`

**Edit 1 — Store destructure** (line 75): Added `getBuddyProfile` to the `useBuddyStore()` destructure so the profile-fetch function is available in the component.

**Edit 2 — useState setter** (line 92): Changed `const [profileCache]` to `const [profileCache, setProfileCache]` so the cache can actually be mutated.

**Edit 3 — Profile-loading useEffect** (lines 112-134): Inserted a new `useEffect` that:
- Fires whenever `accepted`, `pendingIncoming`, or `userId` changes
- Combines both arrays, extracts partner user IDs via `getBuddyUserId`
- De-duplicates IDs with `[...new Set(partnerIds)]`
- Calls `getBuddyProfile(partnerId)` for each unique ID in parallel via `Promise.all`
- Writes each resolved profile into `profileCache` via a functional `setProfileCache` update (creates a new Map so React detects the reference change and triggers re-renders)
- Is non-blocking — the list renders immediately with whatever is cached, then updates as each profile resolves

## Verification Results

```
grep "setProfileCache" app/(tabs)/buddies.tsx
  92: const [profileCache, setProfileCache] = useState<Map<string, PublicBuddyProfile>>(new Map());
  126:           setProfileCache((prev) => {

grep "getBuddyProfile" app/(tabs)/buddies.tsx
  75:     getBuddyProfile,
  124:         const profile = await getBuddyProfile(partnerId);
  134:   }, [accepted, pendingIncoming, userId, getBuddyProfile]);

grep "uniqueIds" app/(tabs)/buddies.tsx
  120:     const uniqueIds = [...new Set(partnerIds)];
  123:       uniqueIds.map(async (partnerId) => {
```

TypeScript errors in buddies.tsx are all pre-existing (StyleProp overload issues, router path types) — zero errors introduced by this change.

Buddy test suite: **82/82 tests pass** (no regressions).

## Gap Closure Confirmation

| Gap (VERIFICATION.md)                                                                                  | Status    |
| ------------------------------------------------------------------------------------------------------ | --------- |
| profileCache initialized empty with no population mechanism                                            | CLOSED    |
| Key link `buddies.tsx → buddyStore (profileCache) → buddy display names on list load` was NOT_WIRED   | WIRED     |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `app/(tabs)/buddies.tsx` modified with all three edits
- [x] Commit `14ba264` exists: `fix(15-06): populate profileCache so BuddyCard receives real profile data`
- [x] 82/82 buddy tests pass
- [x] `setProfileCache` count = 2 (useState destructure + functional update)
- [x] `getBuddyProfile` count = 3 (destructure + call + dependency array)
- [x] `uniqueIds` present (de-duplication logic)

## Self-Check: PASSED
