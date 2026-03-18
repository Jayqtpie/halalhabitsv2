# Phase 8: Critical Integration Wiring - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix the 2 critical integration gaps found by milestone audit — sync queue never populated and tabs hardcoding 'default-user' — so auth and sync flows work end-to-end. Also wire the AccountNudgeBanner into the app so guest users get prompted to create an account.

</domain>

<decisions>
## Implementation Decisions

### Sync Queue Wiring
- enqueue() calls live inside each syncable repo's write methods (insert/update/delete) — co-located with data writes, no middleware
- Wire ALL 6 syncable repos: habits, xp_events, quests, titles, settings, user_profiles — complete wiring, no second pass
- Only enqueue when user is authenticated (skip for guest mode) — migrateGuestData handles initial upload on first sign-in
- Each repo calls assertSyncable(tableName) from privacy-gate before enqueue — defense-in-depth, throws if someone adds enqueue to a private repo

### userId Propagation
- Tab screens read userId via useAuthStore(s => s.userId) hook directly — replace all 4 hardcoded 'default-user' constants (index.tsx, habits.tsx, quests.tsx, profile.tsx)
- Fix UI layer only — repos continue working as-is, no repo method signature changes needed for this gap closure
- authStore already wires userId correctly on setSession (real UUID when authenticated, 'default-user' for guests)

### AccountNudgeBanner Trigger
- Render AccountNudgeBanner on the Home HUD screen (index.tsx) — highest visibility without being intrusive
- Trigger on first title unlock: check if user has any unlocked titles AND is not authenticated AND hasn't dismissed
- Banner already built with enter/exit animations and dismiss persistence — just needs rendering and trigger logic

### E2E Flow Testing
- Unit tests with mocked Supabase client — matches existing test patterns (auth-service.test.ts already mocks Supabase)
- Verify: repos call enqueue() after writes, sync engine reads queue and calls Supabase upsert, auth flow sets correct userId
- No real Supabase project required for verification (Supabase project creation is a known blocker, not in scope here)

### Claude's Discretion
- Exact order of repo wiring (which repos first)
- Test file organization and naming
- Whether to batch enqueue calls or do them individually per write
- Error handling pattern for failed enqueue calls (should not block the write)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Sync Infrastructure
- `src/db/repos/syncQueueRepo.ts` — enqueue() API, getPending(), markSynced(), markFailed() — the target API for all wiring
- `src/services/privacy-gate.ts` — PRIVACY_MAP for all 13 tables, assertSyncable() guard that MUST be called before enqueue
- `src/services/sync-engine.ts` — Sync engine that reads queue and pushes to Supabase
- `src/types/common.ts` — SyncQueueItem, NewSyncQueueItem types

### Auth State
- `src/stores/authStore.ts` — userId (default-user vs real UUID), isAuthenticated, nudgeDismissed, setSession()
- `src/services/auth-service.ts` — signUp, signIn, signOut, migrateGuestData

### Syncable Repos (all need enqueue wiring)
- `src/db/repos/` — All repos follow singleton pattern. Identify which are syncable via privacy-gate PRIVACY_MAP

### Tab Screens (all need userId fix)
- `app/(tabs)/index.tsx` — Home HUD, hardcodes DEFAULT_USER_ID
- `app/(tabs)/habits.tsx` — Habit list, hardcodes DEFAULT_USER_ID
- `app/(tabs)/quests.tsx` — Quest board, hardcodes USER_ID
- `app/(tabs)/profile.tsx` — Profile screen, hardcodes USER_ID

### AccountNudgeBanner
- `src/components/auth/AccountNudgeBanner.tsx` — Built component, needs rendering in index.tsx with title unlock trigger

### Phase 7 Context
- `.planning/phases/07-backend-auth-and-sync/07-CONTEXT.md` — Auth flow decisions, sync behavior, account lifecycle

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **syncQueueRepo** (`src/db/repos/syncQueueRepo.ts`): Complete enqueue/getPending/markSynced/markFailed API — zero call sites currently
- **assertSyncable** (`src/services/privacy-gate.ts`): Runtime guard for sync safety — call before every enqueue
- **useAuthStore** (`src/stores/authStore.ts`): Already exposes userId, isAuthenticated, nudgeDismissed via Zustand selectors
- **AccountNudgeBanner** (`src/components/auth/AccountNudgeBanner.tsx`): Fully built with animations, dismiss logic, and CTA — just needs mounting

### Established Patterns
- **Store-Repo-Engine**: Stores orchestrate repos (DB) + engines (logic). Sync enqueue fits naturally in repos
- **Inline jest.mock factory**: auth-service.test.ts mocks Supabase inline — follow same pattern for sync tests
- **useAuthStore.getState().userId**: Non-hook pattern for callbacks/handlers (established in Phase 07-04)

### Integration Points
- **Home HUD screen** (`app/(tabs)/index.tsx`): Mount AccountNudgeBanner here, read userId from authStore
- **All tab screens**: Replace hardcoded user ID constants with authStore hook
- **All syncable repo write methods**: Add enqueue() call after successful DB write

</code_context>

<specifics>
## Specific Ideas

- Enqueue should NOT block the local write — if enqueue fails, the write should still succeed (sync is enhancement, not core)
- assertSyncable() is defense-in-depth, not the primary guard — only syncable repos get enqueue calls
- AccountNudgeBanner trigger checks titleRepo for any unlocked titles — emotional moment ties the nudge to achievement

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-critical-integration-wiring*
*Context gathered: 2026-03-18*
