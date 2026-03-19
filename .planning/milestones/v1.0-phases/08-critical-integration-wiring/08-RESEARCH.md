# Phase 8: Critical Integration Wiring - Research

**Researched:** 2026-03-18
**Domain:** Sync queue wiring, userId propagation, AccountNudgeBanner integration
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Sync Queue Wiring**
- enqueue() calls live inside each syncable repo's write methods (insert/update/delete) — co-located with data writes, no middleware
- Wire ALL 6 syncable repos: habits, xp_events, quests, titles, settings, user_profiles — complete wiring, no second pass
- Only enqueue when user is authenticated (skip for guest mode) — migrateGuestData handles initial upload on first sign-in
- Each repo calls assertSyncable(tableName) from privacy-gate before enqueue — defense-in-depth, throws if someone adds enqueue to a private repo

**userId Propagation**
- Tab screens read userId via useAuthStore(s => s.userId) hook directly — replace all 4 hardcoded 'default-user' constants (index.tsx, habits.tsx, quests.tsx, profile.tsx)
- Fix UI layer only — repos continue working as-is, no repo method signature changes needed for this gap closure
- authStore already wires userId correctly on setSession (real UUID when authenticated, 'default-user' for guests)

**AccountNudgeBanner Trigger**
- Render AccountNudgeBanner on the Home HUD screen (index.tsx) — highest visibility without being intrusive
- Trigger on first title unlock: check if user has any unlocked titles AND is not authenticated AND hasn't dismissed
- Banner already built with enter/exit animations and dismiss persistence — just needs rendering and trigger logic

**E2E Flow Testing**
- Unit tests with mocked Supabase client — matches existing test patterns (auth-service.test.ts already mocks Supabase)
- Verify: repos call enqueue() after writes, sync engine reads queue and calls Supabase upsert, auth flow sets correct userId
- No real Supabase project required for verification (Supabase project creation is a known blocker, not in scope here)

### Claude's Discretion
- Exact order of repo wiring (which repos first)
- Test file organization and naming
- Whether to batch enqueue calls or do them individually per write
- Error handling pattern for failed enqueue calls (should not block the write)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SYNC-02 | Non-private data syncs to Supabase when online (XP, settings, profile) | Repos lack enqueue() calls — privacy-gate already classifies all 7 SYNCABLE tables; wiring them completes SYNC-02 |
| SYNC-03 | Sync engine handles offline queue with conflict resolution (idempotent completions) | sync-engine.ts (flushQueue) is fully built and tested; the queue is simply never populated — adding enqueue() to repos activates SYNC-03 end-to-end |
| SYNC-01 | User can create account with email, Apple, or Google auth via Supabase | authStore.setSession() correctly propagates real UUID; tab screens reading hardcoded 'default-user' prevent auth data from being used — userId wiring completes SYNC-01's data-visibility requirement |
</phase_requirements>

---

## Summary

Phase 8 fixes two precise, surgical integration gaps found during the v1.0 milestone audit. Both gaps are wiring problems, not missing features — all the underlying infrastructure (syncQueueRepo, privacy-gate, authStore, AccountNudgeBanner) was built in Phases 2-7 and simply never connected.

**Gap 1 — Sync queue never populated.** `syncQueueRepo.enqueue()` has zero call sites in the codebase. Six repos write to SYNCABLE tables (habits, xp_ledger, quests, user_titles, settings, users) but never enqueue those writes. `flushQueue()` in sync-engine.ts always processes an empty list. The fix is to add `enqueue()` calls inside each repo's write methods, guarded by an `isAuthenticated` check and an `assertSyncable()` call.

**Gap 2 — Tab screens hardcode 'default-user'.** All four tab screens (index.tsx, habits.tsx, quests.tsx, profile.tsx) declare a `DEFAULT_USER_ID = 'default-user'` or `USER_ID = 'default-user'` constant and pass it to every store and repo call. After sign-in, the authStore correctly holds the real UUID, but the screens never read it — data is always loaded and written under 'default-user'. The fix is a one-line hook: `const userId = useAuthStore((s) => s.userId)`.

**Gap 3 — AccountNudgeBanner not mounted.** The component is fully built and tested in Phase 7. It self-manages auth state, dismiss persistence, and exit animation. It needs a single mount point in index.tsx (Home HUD), triggered when `titleRepo.getUserTitles(userId).length > 0` AND `!isAuthenticated` AND `!nudgeDismissed`.

**Primary recommendation:** Wire all 6 repos in one plan, fix all 4 tab screens in one plan, mount the banner in one plan, and write integration tests for all three in a final plan. Four plans total.

---

## Standard Stack

### Core (all already installed — no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `zustand` | already installed | authStore access via `useAuthStore` hook | Established store pattern for all Phase 2-7 code |
| `drizzle-orm` | already installed | Repo DB writes that trigger enqueue | All repos use Drizzle already |
| `jest-expo` | already installed (jest.config.js) | Test framework for integration tests | All existing tests use this preset |

### No New Dependencies
This phase adds zero new packages. Every capability needed (syncQueueRepo, assertSyncable, useAuthStore, AccountNudgeBanner) is already built. The work is exclusively wiring.

---

## Architecture Patterns

### Established Pattern: Store-Repo-Engine
Stores orchestrate repos (DB reads/writes) and engines (domain logic). Sync enqueue sits at the repo layer — co-located with the DB write it accompanies. This matches the existing pattern from Phases 3-7.

### Pattern 1: enqueue() After Write in Repo

```typescript
// Source: CONTEXT.md canonical decisions + syncQueueRepo.ts API
import { syncQueueRepo } from './syncQueueRepo';
import { assertSyncable } from '../../services/privacy-gate';
import { useAuthStore } from '../../stores/authStore';

// Inside habitRepo.create():
async create(data: NewHabit) {
  const db = getDb();
  const result = await db.insert(habits).values(data).returning();

  // Enqueue for sync — non-blocking, guest mode skip
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    assertSyncable('habits');  // defense-in-depth guard
    syncQueueRepo.enqueue('habits', data.id, 'INSERT', data).catch(() => {
      // enqueue failure MUST NOT block the local write
    });
  }

  return result;
}
```

**Key rules:**
- `isAuthenticated` check FIRST — skip entirely for guest mode
- `assertSyncable()` SECOND — defense-in-depth, throws on misconfiguration
- `.catch(() => {})` on enqueue — never block or throw on queue failure
- Pass the full entity object as payload — sync engine calls `supabase.from(table).upsert(payload, { onConflict: 'id' })`

### Pattern 2: userId Fix in Tab Screens

```typescript
// Source: authStore.ts + CONTEXT.md decisions
// BEFORE (all 4 tab screens):
const DEFAULT_USER_ID = 'default-user';

// AFTER:
import { useAuthStore } from '../../src/stores/authStore';
// Inside component:
const userId = useAuthStore((s) => s.userId);
// Then pass userId everywhere DEFAULT_USER_ID / USER_ID was used
```

**Note:** `useAuthStore.getState().userId` (non-hook) is already established for callbacks and handlers (Phase 07-04 decision). In render contexts, use the hook form.

### Pattern 3: AccountNudgeBanner Mount in index.tsx

```typescript
// Source: AccountNudgeBanner.tsx props interface + titleRepo.ts
import { AccountNudgeBanner } from '../../src/components/auth/AccountNudgeBanner';
import { titleRepo } from '../../src/db/repos';
import { useAuthStore } from '../../src/stores/authStore';
import { useRouter } from 'expo-router';

// Inside HomeScreen component:
const { isAuthenticated, nudgeDismissed } = useAuthStore(
  useShallow((s) => ({ isAuthenticated: s.isAuthenticated, nudgeDismissed: s.nudgeDismissed }))
);
const [firstUnlockedTitle, setFirstUnlockedTitle] = useState<string | null>(null);

useEffect(() => {
  if (!isAuthenticated && !nudgeDismissed) {
    titleRepo.getUserTitles(userId).then((userTitles) => {
      if (userTitles.length > 0) {
        // Get the title name from titleRepo.getAll() or use a static lookup
        setFirstUnlockedTitle('The Steadfast'); // or resolve from title definitions
      }
    }).catch(() => {});
  }
}, [isAuthenticated, nudgeDismissed, userId]);

// In render (absolute positioned, renders above all other layers):
{firstUnlockedTitle && !isAuthenticated && !nudgeDismissed && (
  <AccountNudgeBanner
    titleName={firstUnlockedTitle}
    onCreateAccount={() => router.push('/create-account')}
    onDismiss={() => setFirstUnlockedTitle(null)}
  />
)}
```

**Important:** AccountNudgeBanner has `position: 'absolute'` in its own styles — it overlays the HUD. The HomeScreen container uses `StyleSheet.absoluteFillObject`. The banner renders inside this View and floats at the bottom. No wrapper changes needed.

### Pattern 4: Inline jest.mock Factory for Tests

```typescript
// Source: auth-service.test.ts (established in Phase 07-01)
// Mock syncQueueRepo to avoid expo-sqlite in Node test env
jest.mock('../../src/db/repos/syncQueueRepo', () => ({
  syncQueueRepo: {
    enqueue: jest.fn().mockResolvedValue(undefined),
    getPending: jest.fn().mockResolvedValue([]),
    markSynced: jest.fn().mockResolvedValue(undefined),
    markFailed: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock authStore for auth-gated enqueue checks
jest.mock('../../src/stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({ isAuthenticated: true, userId: 'test-uuid' })),
  },
}));
```

### Anti-Patterns to Avoid

- **Blocking local write on enqueue failure:** enqueue is enhancement, not core. Always `.catch(() => {})` or wrap in try/catch that does NOT rethrow.
- **Calling enqueue without isAuthenticated guard:** Guest users write to 'default-user' rows. Enqueueing guest data before migration would corrupt the sync queue with wrong user IDs.
- **Changing repo method signatures:** CONTEXT.md explicitly locks this — fix the UI layer only for userId propagation.
- **Using React hooks inside repo methods:** Repos are pure TypeScript (no React imports). Use `useAuthStore.getState()` (static accessor), not `useAuthStore()` (hook).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Privacy enforcement before sync | Custom table allowlist | `assertSyncable()` in privacy-gate.ts | Already built, throws on violation, covers all 13 tables |
| Auth state in repos | Pass userId/isAuthenticated as params | `useAuthStore.getState()` | Non-hook static accessor established in Phase 07-04 for exactly this use case |
| Banner dismiss persistence | AsyncStorage/local state | `useAuthStore.setNudgeDismissed()` | authStore already tracks nudgeDismissed; banner reads it and self-hides |
| Custom banner animation | Manual Animated.Value | AccountNudgeBanner already has enter/exit animations | Component is fully built with Reanimated — just mount it |

**Key insight:** Every capability for this phase was built in Phases 2-7. The implementation work is exclusively wiring — adding function calls at existing integration points.

---

## Common Pitfalls

### Pitfall 1: Enqueue Blocks the Local Write
**What goes wrong:** If `syncQueueRepo.enqueue()` throws (e.g., DB not initialized, schema migration pending), the local write also fails. The user's habit completion is lost because of a sync infrastructure error.
**Why it happens:** Awaiting enqueue without a `.catch()` means any rejection propagates up through the repo method.
**How to avoid:** Always fire-and-forget enqueue or wrap in try/catch that swallows the error: `syncQueueRepo.enqueue(...).catch(() => {})`.
**Warning signs:** Test: "repo write fails when enqueue throws" — if this test passes, the wiring is wrong.

### Pitfall 2: Wrong Payload in Enqueue
**What goes wrong:** Sync engine calls `supabase.from(table).upsert(payload, { onConflict: 'id' })`. If payload is missing the `id` field, or contains undefined values, the upsert will fail or create duplicate rows.
**Why it happens:** Passing partial objects (just changed fields) instead of the full entity.
**How to avoid:** For INSERT/UPDATE, pass the complete entity object. For archive/status changes, fetch the updated row first and pass the full result. The existing sync-engine.test.ts (Test 3) validates `onConflict: 'id'` — the `id` field must always be in the payload.
**Warning signs:** Test: `markFailed` called with a Supabase constraint error message.

### Pitfall 3: userId Constant Missed in Callbacks
**What goes wrong:** After replacing the module-level `DEFAULT_USER_ID` constant with `useAuthStore(s => s.userId)` hook, some callbacks or handler functions may still reference the old constant (e.g., `equipTitle(USER_ID, titleId)` inside `handleEquipTitle`).
**Why it happens:** The constant is used in multiple places across the file. Grep may miss callback closure captures.
**How to avoid:** Search each file for both `'default-user'` and the local constant name (`DEFAULT_USER_ID`, `USER_ID`) after the change. Ensure all call sites use the hook-derived value.
**Warning signs:** After sign-in, data still loads from 'default-user' scope in a specific screen.

### Pitfall 4: AccountNudgeBanner Title Name Resolution
**What goes wrong:** `AccountNudgeBanner` requires a `titleName` string prop to personalize the copy. If the title name is empty or generic ("Title"), the emotional impact of the nudge is lost.
**Why it happens:** `titleRepo.getUserTitles()` returns `user_titles` rows with a `titleId` — not the display name. The display name lives in the `titles` table or in `TITLE_SEED_DATA`.
**How to avoid:** Either (a) call `titleRepo.getAll()` and cross-reference by ID, or (b) use the static `TITLE_SEED_DATA` array already loaded client-side in TrophyCase (no extra DB query). Option (b) is simpler.
**Warning signs:** Banner shows "You've earned ." (empty title name).

### Pitfall 5: Double-Enqueue on Reorder Operations
**What goes wrong:** `habitRepo.reorder()` calls `db.update()` in a loop for each habit. Wrapping this with enqueue would create N queue items for a cosmetic sort change, overloading the queue.
**Why it happens:** Reorder iterates over orderedIds and updates each row's sortOrder.
**How to avoid:** Skip enqueue in `reorder()`. Sort order is a UX preference, not a critical sync target. Only wire enqueue in `create`, `update`, and `archive` methods. This is Claude's discretion per CONTEXT.md.
**Warning signs:** Queue fills with dozens of sort-order-only items after any habit reorder.

---

## Code Examples

Verified patterns from existing codebase:

### Authenticated Guard Pattern (established in Phase 07-04)
```typescript
// Source: STATE.md "[Phase 07-04]: useAuthStore.getState().userId in callbacks/handlers"
// Use static accessor in non-hook context (repos, callbacks):
const { isAuthenticated, userId } = useAuthStore.getState();
```

### assertSyncable Usage
```typescript
// Source: privacy-gate.ts
import { assertSyncable } from '../../services/privacy-gate';
// Throws: "PRIVACY VIOLATION: Attempted to sync 'habit_completions' (classified as PRIVATE)."
assertSyncable('habits'); // passes — 'habits' is SYNCABLE
assertSyncable('habit_completions'); // throws — PRIVATE
```

### syncQueueRepo.enqueue Signature
```typescript
// Source: syncQueueRepo.ts
await syncQueueRepo.enqueue(
  entityType: string,   // table name, e.g. 'habits'
  entityId: string,     // the row's PK
  operation: string,    // 'INSERT', 'UPDATE', or 'DELETE'
  payload: object,      // full entity object for upsert, or { id } for delete
);
```

### AccountNudgeBanner Props
```typescript
// Source: AccountNudgeBanner.tsx interface
interface AccountNudgeBannerProps {
  titleName: string;          // Display name of unlocked title, e.g. "The Steadfast"
  onCreateAccount: () => void; // Navigate to create-account screen
  onDismiss: () => void;       // Called after exit animation completes (210ms delay)
}
// Note: component self-reads isAuthenticated and nudgeDismissed from authStore
// and returns null if either is true — caller doesn't need to guard rendering
```

### SYNCABLE Tables Reference (from privacy-gate.ts)
```typescript
// Source: privacy-gate.ts PRIVACY_MAP
// These 7 tables are SYNCABLE and need enqueue wiring in their repos:
'users'        // userRepo  — updateXP, setActiveTitle, create
'habits'       // habitRepo — create, update, archive
'xp_ledger'    // xpRepo    — create
'titles'       // titleRepo — note: title DEFINITIONS, not user_titles
'user_titles'  // titleRepo — grantTitle
'quests'       // questRepo — create, complete, updateProgress
'settings'     // settingsRepo — upsert

// These 4 tables are PRIVATE — NEVER enqueue:
'habit_completions'
'streaks'
'muhasabah_entries'
'niyyah'

// This 1 table is LOCAL_ONLY — infrastructure, never enqueue:
'sync_queue'
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pass userId as constant to all store calls | Read `useAuthStore(s => s.userId)` in screen components | Phase 8 (this phase) | After sign-in, all data loads/writes use real UUID instead of 'default-user' |
| syncQueueRepo exists but is never called | enqueue() in each syncable repo write method | Phase 8 (this phase) | flushQueue() now has items to process; sync to Supabase activates |
| AccountNudgeBanner built but not mounted | Mounted in index.tsx with title-unlock trigger | Phase 8 (this phase) | Guest users who earn their first title are nudged to create an account |

---

## Open Questions

1. **Title name resolution for AccountNudgeBanner**
   - What we know: `titleRepo.getUserTitles(userId)` returns rows with `titleId`, not display names. `TITLE_SEED_DATA` has names but lives in the game store/domain layer.
   - What's unclear: Which file exports `TITLE_SEED_DATA` — is it reachable from index.tsx without circular imports?
   - Recommendation: Check if `TrophyCase` or the title-engine module exports a static title map. If not, do a quick `titleRepo.getAll()` at the point the trigger fires (once only, cached in state).

2. **xp_ledger table name vs 'xp_events' in CONTEXT.md**
   - What we know: CONTEXT.md mentions "xp_events" as one of the 6 repos to wire; the actual table in privacy-gate.ts is `xp_ledger`; `xpRepo.ts` operates on `xpLedger`; privacy-gate PRIVACY_MAP key is `xp_ledger`.
   - What's unclear: This is a naming inconsistency in CONTEXT.md — 'xp_events' appears to be a typo for 'xp_ledger'.
   - Recommendation: Wire `xpRepo` using entityType `'xp_ledger'` (matches PRIVACY_MAP key and assertSyncable) — ignore 'xp_events' as a CONTEXT.md typo.

3. **titles vs user_titles enqueue**
   - What we know: `titleRepo` manages two tables: `titles` (definitions, seeded once) and `user_titles` (per-user grants). Both are SYNCABLE. `grantTitle()` writes to `user_titles`. `seedTitles()` writes to `titles` but only at first run.
   - What's unclear: Should `seedTitles()` enqueue? Seeded data is static and device-invariant — syncing it would overwrite server-side data with locally-seeded definitions.
   - Recommendation: Only wire `grantTitle()` (user_titles). Skip `seedTitles()` — title definitions are static seed data, not user data. The planner should make this explicit.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest-expo (jest.config.js) |
| Config file | `jest.config.js` (root) |
| Quick run command | `npx jest --no-coverage --testPathPattern="sync-queue-wiring"` |
| Full suite command | `npm test` (runs all `__tests__/**/*.test.ts`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SYNC-02 | Repos call enqueue() after writes | unit | `npx jest --no-coverage --testPathPattern="repos"` | ❌ Wave 0 |
| SYNC-02 | enqueue() is skipped for guest (isAuthenticated=false) | unit | same | ❌ Wave 0 |
| SYNC-02 | assertSyncable() is called before enqueue() | unit | same | ❌ Wave 0 |
| SYNC-03 | Auth flow sets correct userId in authStore | unit | `npx jest --no-coverage --testPathPattern="auth-service"` | ✅ exists |
| SYNC-03 | flushQueue processes enqueued items end-to-end | unit | `npx jest --no-coverage --testPathPattern="sync-engine"` | ✅ exists |
| SYNC-01 | Tab screens use authStore userId not hardcoded | unit | `npx jest --no-coverage --testPathPattern="integration"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --no-coverage --testPathPattern="(sync-queue-wiring|repos)"` (new tests for this phase)
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/db/repos/syncQueueWiring.test.ts` — covers SYNC-02 (enqueue called in repos, isAuthenticated guard, assertSyncable guard)
- [ ] `__tests__/integration/authUserId.test.ts` — covers SYNC-01 (tab screens use authStore userId, not hardcoded string)

*(Existing `__tests__/services/sync-engine.test.ts` and `auth-service.test.ts` already cover the downstream behavior — new tests focus on the wiring layer itself.)*

---

## Sources

### Primary (HIGH confidence)
- Direct source code read: `src/db/repos/syncQueueRepo.ts` — enqueue() API signature, all 5 methods
- Direct source code read: `src/services/privacy-gate.ts` — PRIVACY_MAP (all 13 tables), assertSyncable() behavior
- Direct source code read: `src/stores/authStore.ts` — userId, isAuthenticated, nudgeDismissed, setSession pattern
- Direct source code read: `src/services/sync-engine.ts` — flushQueue() guards, upsert pattern, markSynced/markFailed calls
- Direct source code read: `src/services/auth-service.ts` — migrateGuestData pattern, supabaseConfigured guard
- Direct source code read: `src/components/auth/AccountNudgeBanner.tsx` — props interface, self-managed auth check, animation timing
- Direct source code read: `src/db/repos/habitRepo.ts`, `xpRepo.ts`, `questRepo.ts`, `titleRepo.ts`, `settingsRepo.ts`, `userRepo.ts` — all write method signatures
- Direct source code read: `app/(tabs)/index.tsx`, `habits.tsx`, `quests.tsx`, `profile.tsx` — hardcoded userId locations
- Direct source code read: `__tests__/services/auth-service.test.ts`, `sync-engine.test.ts` — established mock patterns
- Direct source code read: `jest.config.js` — test framework config, transformIgnorePatterns
- Direct source code read: `.planning/phases/08-critical-integration-wiring/08-CONTEXT.md` — all locked decisions

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` decisions table — Phase 07-01, 07-03, 07-04 decisions confirmed against source code

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all libraries verified from source
- Architecture patterns: HIGH — derived directly from reading existing code, not from training data
- Pitfalls: HIGH — identified from actual code inspection (reorder loop, enqueue blocking, title name resolution gap)
- Test patterns: HIGH — derived from existing test files using same framework

**Research date:** 2026-03-18
**Valid until:** Stable indefinitely (no external dependencies to drift)
