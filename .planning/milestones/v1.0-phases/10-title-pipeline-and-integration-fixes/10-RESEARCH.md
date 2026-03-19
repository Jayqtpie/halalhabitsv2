# Phase 10: Title Pipeline and Integration Fixes - Research

**Researched:** 2026-03-19
**Domain:** Cross-store data wiring, SQLite query aggregation, Zustand store orchestration
**Confidence:** HIGH

## Summary

Phase 10 closes four integration gaps identified in the v1.0 milestone audit. All gaps are
surgical code fixes — no new libraries, no architectural changes, no schema migrations needed.
The audit confirmed that the title engine logic, repo layer, and DB schema already exist and
are correct; the problem is purely that `checkTitles` in `gameStore.ts` passes hardcoded `0`
for two `PlayerStats` fields (`mercyRecoveries` and `muhasabahStreak`) instead of querying
repos that already have the data. Similarly, `your-data.tsx` uses a module-level constant
instead of reading `userId` from `authStore`, and `updateQuestProgress` passes the wrong
argument (`quest.targetValue` instead of `newProgress`) in its partial-progress branch.

The two blocked E2E flows (Mercy Mode → title unlock, Muhasabah → title unlock) will pass
once the two hardcoded `0` values are replaced with real DB queries. These queries use repos
that already exist: `streakRepo.getAllForUser` (already used in `loadDailyState`) and
`muhasabahRepo.getStreak` (already implemented and tested). The fixes are additive — no
existing behavior changes.

**Primary recommendation:** Wire four known gaps in `gameStore.checkTitles`, `gameStore.updateQuestProgress`,
and `your-data.tsx`. No new deps, no migration, no architecture change.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAME-03 | User unlocks Identity Titles at milestone thresholds | Blocked by mercyRecoveries=0 and muhasabahStreak=0 in PlayerStats; fixed by querying streakRepo and muhasabahRepo in checkTitles |
| GAME-05 | User can complete quests for bonus XP and progression | Partial-progress quests silently write targetValue to DB instead of newProgress; one-line fix in updateQuestProgress else branch |
| PROF-03 | User can export or delete all personal data | your-data.tsx uses hardcoded 'default-user'; replace with useAuthStore((s) => s.userId) hook |
| SYNC-01 | User can create account via Supabase auth | Same your-data.tsx userId fix satisfies the remaining gap for this requirement |
| STRK-03 | Mercy Mode activates on streak break with compassionate recovery path | mercyRecoveries count comes from streakRepo.getAllForUser filtering isRebuilt=true rows |
| STRK-04 | User can recover streak through Mercy Mode completion tasks | Same fix as STRK-03 — isRebuilt flag marks completed recoveries |
| MUHA-01 | Nightly Muhasabah presents structured reflection prompts | muhasabahStreak comes from muhasabahRepo.getStreak (already implemented) |
</phase_requirements>

---

## Standard Stack

This phase introduces zero new dependencies. All tools are already installed and proven.

### Core (Already Present)
| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| Drizzle ORM | as installed | SQLite query builder for streak/muhasabah queries | HIGH |
| Zustand | as installed | Cross-store state management pattern | HIGH |
| expo-sqlite | as installed | SQLite DB driver | HIGH |
| jest-expo | ~54.0.17 | Test runner (`npm test`) | HIGH |

### No Installations Required

```bash
# Nothing to install — phase 10 is pure wiring
```

---

## Architecture Patterns

### Store-Repo-Engine Pattern (Established)

The project uses a consistent three-layer pattern:
- **Engine** — pure TypeScript function, no side effects (e.g., `title-engine.ts`)
- **Repo** — typed DB access, no React (e.g., `streakRepo.ts`, `muhasabahRepo.ts`)
- **Store** — orchestrates repos and engines, updates Zustand state (e.g., `gameStore.ts`)

Phase 10 changes live entirely in the **store** layer — repos and engines are already correct.

### Fix 1: mercyRecoveries in checkTitles

**What:** `checkTitles` builds a `PlayerStats` snapshot. The `mercyRecoveries` field is hardcoded
to `0` with a TODO comment ("Phase 5 TODO: track mercy recoveries in DB").

**Root cause:** Mercy recoveries are not stored as a counter column. Instead, completed Mercy Mode
recoveries are signaled by `isRebuilt = true` on a streak row (set in `habitStore.completeHabit`
at line 288). The count of `isRebuilt = true` rows for a user's active habits is the real
`mercyRecoveries` value.

**The data path:**
1. `streakRepo.getAllForUser(userId)` — already used in `habitStore.loadDailyState`
2. Filter rows where `isRebuilt === true`
3. Count = `mercyRecoveries`

**Code location:** `src/stores/gameStore.ts` — `checkTitles` function, line 325
```typescript
// BEFORE (broken):
mercyRecoveries: 0, // Phase 5 TODO: track mercy recoveries in DB

// AFTER (fixed):
const allUserStreaks = await streakRepo.getAllForUser(userId);
const mercyRecoveries = allUserStreaks.filter(s => s.isRebuilt).length;
// ...
mercyRecoveries,
```

**Import:** `streakRepo` is already imported at line 19 of `gameStore.ts`.

### Fix 2: muhasabahStreak in checkTitles

**What:** `checkTitles` hardcodes `muhasabahStreak: 0` with the same TODO comment.

**Root cause:** `muhasabahRepo.getStreak(userId)` already implements consecutive-day counting
(lines 54-77 of `muhasabahRepo.ts`), but it is never called in `checkTitles`.

**Code location:** `src/stores/gameStore.ts` — `checkTitles` function, line 326
```typescript
// BEFORE (broken):
muhasabahStreak: 0, // Phase 5 TODO: compute from muhasabah entries

// AFTER (fixed):
const muhasabahStreak = await muhasabahRepo.getStreak(userId);
// ...
muhasabahStreak,
```

**Import required:** `muhasabahRepo` must be added to the import at line 19:
```typescript
import { xpRepo, titleRepo, questRepo, userRepo, habitRepo, streakRepo, muhasabahRepo } from '../db/repos';
```

`streakRepo` also needs to be added to the same import line (currently not imported in
`gameStore.ts` — it is only imported in `habitStore.ts`).

### Fix 3: Quest Partial-Progress Parameter Bug

**What:** In `updateQuestProgress`, the `else` branch (partial progress, quest not yet complete)
calls `questRepo.updateProgressAtomic(quest.id, quest.targetValue)` — passing `targetValue`
instead of `newProgress`.

**Root cause:** The completion branch (lines 422-423) correctly passes `quest.targetValue` as the
final persisted value when a quest is done. The partial branch (lines 442-443) copy-pasted the
same call without changing the second argument.

**Effect:** Partial quests immediately jump to `targetValue` in the DB even though they are not
complete, causing `status` to remain `in_progress` but the number to be wrong. The local state
(line 447) correctly uses `newProgress`, so the UI looks correct but the DB is wrong.

**Code location:** `src/stores/gameStore.ts` — `updateQuestProgress` function, line 442
```typescript
// BEFORE (broken):
await questRepo.updateProgressAtomic(quest.id, quest.targetValue);

// AFTER (fixed):
await questRepo.updateProgressAtomic(quest.id, newProgress);
```

### Fix 4: your-data.tsx userId Wiring

**What:** `your-data.tsx` declares `const USER_ID = 'default-user'` at module scope (line 24)
and passes it to `exportUserData` and `deleteAllUserData`. After sign-in, the real userId is
in `authStore.userId` but this screen ignores it.

**Root cause:** This screen was implemented in Phase 6 before auth wiring was in place (Phase 7).
The Phase 8 sweep of hardcoded `default-user` covered `app/(tabs)/*.tsx` but missed
`app/your-data.tsx` (not a tab screen, so the test in `__tests__/integration/authUserId.test.ts`
did not cover it).

**Code location:** `app/your-data.tsx` — lines 9-24
```typescript
// BEFORE (broken):
// No import of useAuthStore
const USER_ID = 'default-user';

// AFTER (fixed):
import { useAuthStore } from '../src/stores/authStore';
// Inside YourDataScreen component:
const userId = useAuthStore((s) => s.userId);
// Replace USER_ID with userId everywhere in the function body
```

**Impact on existing integration test:** The `authUserId.test.ts` file only checks tab screens
(`app/(tabs)/*.tsx`). A new static-analysis test should cover `app/your-data.tsx` as well
to prevent regression.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mercy recovery count | Custom DB query or migration | `streakRepo.getAllForUser` + filter `isRebuilt` | Already persisted and correct |
| Muhasabah streak | Reimplement consecutive-day logic | `muhasabahRepo.getStreak` | Already implemented and unit-tested |
| userId in your-data.tsx | sessionStorage, AsyncStorage, prop drilling | `useAuthStore((s) => s.userId)` | Established pattern across all other screens |

**Key insight:** All the data and logic already exists. Phase 10 is connecting wires, not building new systems.

---

## Common Pitfalls

### Pitfall 1: Circular Import Between gameStore and streakRepo

**What goes wrong:** `gameStore.ts` already imports from `habitStore` with a dynamic import
to break a circular dependency (`const { useHabitStore } = await import('./habitStore')`).
Adding a direct `streakRepo` import to `gameStore.ts` does NOT create a circular dependency
because `streakRepo` is a plain data-access module with no store imports.

**How to avoid:** Use a static import for `streakRepo` and `muhasabahRepo` in the import block
at the top of `gameStore.ts`. No dynamic import needed.

**Warning signs:** TypeScript will throw at compile time if a true circular import exists.

### Pitfall 2: useAuthStore Hook Outside React Component

**What goes wrong:** Calling `useAuthStore((s) => s.userId)` at module scope (outside a component
or hook) will throw React's "Invalid hook call" error.

**How to avoid:** `const USER_ID = 'default-user'` is module-scope — it must be replaced with a
hook call *inside* the component body. Pattern used elsewhere:
```typescript
// Inside YourDataScreen component function body:
const userId = useAuthStore((s) => s.userId);
```
For non-component contexts (callbacks, handlers), the established project pattern is:
```typescript
const userId = useAuthStore.getState().userId; // Phase 07 decision
```

**Warning signs:** "Invalid hook call" React error at runtime. TypeScript does not catch this.

### Pitfall 3: Test Coverage Gap for your-data.tsx

**What goes wrong:** The existing `authUserId.test.ts` passes even after this phase because it
only reads `app/(tabs)/*.tsx`. The `your-data.tsx` fix would be invisible to the current test.

**How to avoid:** Extend `authUserId.test.ts` (or add a new test file) to verify:
- `app/your-data.tsx` does NOT contain `const USER_ID = 'default-user'`
- `app/your-data.tsx` does import `useAuthStore`

### Pitfall 4: Parallel Queries in checkTitles Performance

**What goes wrong:** Adding two sequential `await` calls (`streakRepo.getAllForUser` then
`muhasabahRepo.getStreak`) in `checkTitles` doubles the DB round-trips.

**How to avoid:** Run both queries in parallel:
```typescript
const [allUserStreaks, muhasabahStreak] = await Promise.all([
  streakRepo.getAllForUser(userId),
  muhasabahRepo.getStreak(userId),
]);
const mercyRecoveries = allUserStreaks.filter(s => s.isRebuilt).length;
```
`checkTitles` is already in a try/catch and is non-fatal, so a parallel await is safe.

---

## Code Examples

Verified from source code inspection:

### streakRepo.getAllForUser — return shape
```typescript
// src/db/repos/streakRepo.ts lines 27-46
// Returns rows with: id, habitId, currentCount, longestCount,
//   lastCompletedAt, multiplier, isRebuilt, rebuiltAt,
//   mercyRecoveryDay, preBreakStreak, updatedAt
// isRebuilt is boolean (Drizzle mode: 'boolean' maps integer -> boolean)
const allUserStreaks = await streakRepo.getAllForUser(userId);
const mercyRecoveries = allUserStreaks.filter(s => s.isRebuilt).length;
```

### muhasabahRepo.getStreak — return shape
```typescript
// src/db/repos/muhasabahRepo.ts lines 54-77
// Returns: number (0 if no entries, consecutive-day count otherwise)
const muhasabahStreak = await muhasabahRepo.getStreak(userId);
```

### useAuthStore pattern in components
```typescript
// Pattern established in app/(tabs)/index.tsx, habits.tsx, quests.tsx, profile.tsx
import { useAuthStore } from '../src/stores/authStore';

export default function YourDataScreen() {
  const userId = useAuthStore((s) => s.userId);
  // userId is 'default-user' in guest mode, real UUID after sign-in
  // ...
}
```

### questRepo.updateProgressAtomic — correct usage
```typescript
// COMPLETE branch (correct — writes targetValue):
await questRepo.updateProgressAtomic(quest.id, quest.targetValue);

// PARTIAL branch (must write newProgress, not targetValue):
await questRepo.updateProgressAtomic(quest.id, newProgress);
```

---

## State of the Art

| Area | Current State | Fix Required |
|------|--------------|--------------|
| mercyRecoveries | Hardcoded 0 in PlayerStats | Query streakRepo.getAllForUser, filter isRebuilt |
| muhasabahStreak | Hardcoded 0 in PlayerStats | Call muhasabahRepo.getStreak |
| your-data.tsx userId | Hardcoded 'default-user' | useAuthStore((s) => s.userId) hook |
| Quest partial progress | Writes targetValue to DB | Pass newProgress to updateProgressAtomic |

**No deprecated APIs or outdated patterns involved.** All fixes follow patterns already established
in earlier phases of this project.

---

## Open Questions

1. **Should mercyRecoveries include non-active (archived) habit recoveries?**
   - What we know: `streakRepo.getAllForUser` joins with habits on `status = 'active'`, so it
     only counts recoveries for currently active habits
   - What's unclear: If a habit is archived, its `isRebuilt` streak row is excluded. Does this
     undercount a player's real mercy history?
   - Recommendation: Accept this behavior — the title engine's spirit is rewarding current
     discipline practice, not historical data from archived habits. Document the decision.

2. **Does the your-data.tsx regression test need a new file or extend the existing one?**
   - What we know: `__tests__/integration/authUserId.test.ts` covers `app/(tabs)/*.tsx`
   - Recommendation: Extend the existing file — add a new `describe` block for `your-data.tsx`
     that checks the same patterns. Keeping related assertions together improves discoverability.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest-expo ~54.0.17 |
| Config file | package.json ("jest-expo" preset) |
| Quick run command | `npm test -- --testPathPattern=gameStore\|authUserId\|your-data` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAME-03 | mercyRecoveries reads from streakRepo | unit | `npm test -- --testPathPattern=gameStore` | ❌ Wave 0 |
| GAME-03 | muhasabahStreak reads from muhasabahRepo | unit | `npm test -- --testPathPattern=gameStore` | ❌ Wave 0 |
| GAME-05 | partial quest progress writes newProgress not targetValue | unit | `npm test -- --testPathPattern=gameStore` | ❌ Wave 0 |
| PROF-03 / SYNC-01 | your-data.tsx uses useAuthStore userId | static analysis | `npm test -- --testPathPattern=authUserId` | ✅ extend existing |
| STRK-03/04 | Mercy Mode → title unlock E2E flow | integration (manual-only for RN) | N/A | manual |
| MUHA-01 | Muhasabah → title unlock E2E flow | integration (manual-only for RN) | N/A | manual |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=gameStore|authUserId`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/stores/gameStore.test.ts` — covers GAME-03 (mercyRecoveries), GAME-03 (muhasabahStreak), GAME-05 (partial progress); needs mock for `streakRepo`, `muhasabahRepo`, `questRepo`
- [ ] Extend `__tests__/integration/authUserId.test.ts` — add `describe` block covering `app/your-data.tsx` for PROF-03/SYNC-01

---

## Sources

### Primary (HIGH confidence)
- Direct source inspection: `src/stores/gameStore.ts` — confirmed hardcoded 0s at lines 325-326
- Direct source inspection: `src/db/repos/streakRepo.ts` — confirmed `getAllForUser` returns `isRebuilt`
- Direct source inspection: `src/db/repos/muhasabahRepo.ts` — confirmed `getStreak` implemented
- Direct source inspection: `app/your-data.tsx` — confirmed `const USER_ID = 'default-user'` at line 24
- Direct source inspection: `src/stores/gameStore.ts` lines 441-443 — confirmed `quest.targetValue` bug
- Direct source inspection: `.planning/v1.0-MILESTONE-AUDIT.md` — authoritative gap list
- Direct source inspection: `src/db/schema.ts` — confirmed `isRebuilt` boolean column on `streaks` table

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` decisions log — Phase 07 decision: "useAuthStore.getState().userId in callbacks/handlers"
- `.planning/STATE.md` decisions log — Phase 08-02 decision: "Static file analysis tests chosen for userId propagation regression"

### Tertiary
- None

---

## Metadata

**Confidence breakdown:**
- All four gaps: HIGH — directly verified in source code
- Fix strategies: HIGH — follow established project patterns with verified return shapes
- Test approach: HIGH — follows Phase 08 static analysis pattern

**Research date:** 2026-03-19
**Valid until:** This research does not expire (all findings are from source code, not external docs)
