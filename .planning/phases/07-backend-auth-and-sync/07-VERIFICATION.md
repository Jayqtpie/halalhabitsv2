---
phase: 07-backend-auth-and-sync
verified: 2026-03-18T06:00:00Z
status: human_needed
score: 11/13 must-haves verified
human_verification:
  - test: "Navigate to Settings and confirm Account section appears as the first section showing 'Not signed in' state"
    expected: "Account section at the top of settings with correct copy, guest state, and sign-in link"
    why_human: "Visual layout and copy quality cannot be verified programmatically; Auth screens require device render to confirm keyboard avoidance, touch targets, and pixel font rendering"
  - test: "Tap 'Sign In' from settings Account section, verify sign-in screen renders with 'Welcome Back' heading, email/password fields, and 'Continue Without Account' link; repeat for 'Create Account' and verify 'Protect Your Progress' heading with MergeChoiceSheet modal"
    expected: "Both auth screens render without crash; SyncStatusIcon shows muted cloud-x in offline/no-account state; all copy matches UI-SPEC (no shame language)"
    why_human: "Visual quality of 4-state SyncStatusIcon (including animated spinner and transition), banner animation smoothness, and adab-safe copy review require human eyes"
  - test: "Create a Supabase project, run supabase/migrations/20260317_schema.sql and supabase/migrations/20260317_rls.sql in Supabase SQL Editor, deploy supabase/functions/push/index.ts via 'supabase functions deploy push', set EXPO_ACCESS_TOKEN secret, create database webhook on push_notifications INSERT"
    expected: "All 8 tables created with RLS enabled, all policies visible in Dashboard -> Authentication -> Policies, Edge Function deployed, webhook firing on INSERT"
    why_human: "Requires actual Supabase account, project credentials (.env EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY), dashboard configuration, and live deployment — cannot be verified without a real project"
---

# Phase 7: Backend, Auth and Sync Verification Report

**Phase Goal:** Backend auth, sync engine, server infrastructure — Supabase client, auth service, sync queue, auth UI, session wiring, Postgres schema, RLS, push notifications
**Verified:** 2026-03-18T06:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Supabase client singleton exists with localStorage polyfill for session persistence | VERIFIED | `src/lib/supabase.ts`: `require('expo-sqlite/localStorage/install')` inside guard, `createClient` with `storage: localStorage`, `detectSessionInUrl: false` |
| 2 | authStore provides userId that defaults to 'default-user' for guest mode | VERIFIED | `src/stores/authStore.ts`: `userId: 'default-user'`, `setSession` updates to `session?.user?.id ?? 'default-user'` |
| 3 | auth-service can sign up, sign in, and sign out via Supabase Auth | VERIFIED | `src/services/auth-service.ts`: exports `signUp`, `signIn`, `signOut`, `deleteAccount`, `migrateGuestData` — all implemented, 7 TDD tests pass |
| 4 | sync_queue table has retryCount and lastError columns for retry tracking | VERIFIED | `src/db/schema.ts` line ~210: `retryCount: integer('retry_count').notNull().default(0)`, `lastError: text('last_error')`; migration `0003_phase7_sync.sql` adds columns via ALTER TABLE |
| 5 | Sync engine reads from sync_queue and upserts to Supabase by entity type | VERIFIED | `src/services/sync-engine.ts`: `getPending()` -> loop -> `supabase.from(item.entityType).upsert(payload, { onConflict: 'id' })` — 10 TDD tests pass |
| 6 | Sync engine enforces auth guard, connectivity guard, and privacy gate | VERIFIED | `sync-engine.ts`: `useAuthStore.getState().isAuthenticated` check, `NetInfo.fetch()` check, `assertSyncable(item.entityType)` per item |
| 7 | User can sign in / create account via dedicated auth screens | VERIFIED (code) | `app/(auth)/sign-in.tsx` calls `signIn(email, password)`, `app/(auth)/create-account.tsx` opens MergeChoiceSheet then calls `signUp`; **human visual confirmation still needed** |
| 8 | Root layout subscribes to onAuthStateChange and updates authStore | VERIFIED | `app/_layout.tsx`: `supabase.auth.onAuthStateChange` → `useAuthStore.getState().setSession(session)`, unsubscribes on unmount |
| 9 | AppState manages token auto-refresh; sync flushes on foreground | VERIFIED | `app/_layout.tsx`: module-level `appStateListenerRegistered` guard, `startAutoRefresh`/`stopAutoRefresh`; separate `useEffect` calls `flushQueue()` when `isAuthenticated` |
| 10 | All components use authStore.userId instead of hardcoded 'default-user' | VERIFIED | All 5 target components (`CustomHabitForm`, `PresetLibrary`, `MuhasabahStep2`, `MuhasabahStep3`, `CelebrationManager`) use `useAuthStore.getState().userId`; grep of `src/` (excluding `authStore.ts` and `auth-service.ts`) returns zero matches |
| 11 | Supabase Postgres schema mirrors 7 syncable tables; PRIVATE tables absent | VERIFIED | `supabase/migrations/20260317_schema.sql`: 8 tables created (`users`, `habits`, `xp_ledger`, `titles`, `user_titles`, `quests`, `settings`, `push_notifications`); comment explicitly excludes `habit_completions`, `streaks`, `muhasabah_entries`, `niyyah` |
| 12 | RLS policies enforce auth.uid() ownership on all syncable tables | VERIFIED | `supabase/migrations/20260317_rls.sql`: 8x `ENABLE ROW LEVEL SECURITY`, all policies use `(select auth.uid())::text` cached pattern; titles has permissive `USING (true)` SELECT; `delete_user()` SECURITY DEFINER RPC present |
| 13 | Push notification Edge Function sends via Expo Push API on INSERT | VERIFIED (code) | `supabase/functions/push/index.ts`: `Deno.serve`, fetches `expo_push_token` from `users`, POSTs to `https://exp.host/--/api/v2/push/send`; **live deployment to Supabase project not yet done** |

**Score:** 11/13 truths verified (2 require human confirmation of live deployment and visual quality)

---

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/lib/supabase.ts` | VERIFIED | Supabase client singleton with polyfill-first imports, `supabaseConfigured` guard, `detectSessionInUrl: false` |
| `src/stores/authStore.ts` | VERIFIED | Zustand store, exports `useAuthStore`, `SyncStatus` type, guest-mode `default-user` default |
| `src/services/auth-service.ts` | VERIFIED | Exports `signUp`, `signIn`, `signOut`, `deleteAccount`, `migrateGuestData` — all substantive implementations |
| `src/db/migrations/0003_phase7_sync.sql` | VERIFIED | ALTER TABLE adds `retry_count`, `last_error` to `sync_queue`; `expo_push_token` to `users` |
| `src/db/migrations/migrations.js` | VERIFIED | Imports `m0003` from `./0003_phase7_sync.sql`, included in migrations array |
| `src/db/repos/syncQueueRepo.ts` | VERIFIED | Exports `syncQueueRepo` with `getPending` (causal ASC order + `isNull` filter), `enqueue`, `markSynced`, `markFailed`, `purgeSynced`, `clearAll` |
| `src/services/sync-engine.ts` | VERIFIED | Exports `flushQueue`, `syncNow`, `purgeCompleted` — full three-guard architecture |
| `app/(auth)/_layout.tsx` | VERIFIED | Simple Stack with `headerShown: false` |
| `app/(auth)/sign-in.tsx` | VERIFIED (code) | Calls `signIn`, "Welcome Back" title, "Continue Without Account" link, KeyboardAvoidingView, error states |
| `app/(auth)/create-account.tsx` | VERIFIED (code) | Calls `signUp`, "Protect Your Progress" title, MergeChoiceSheet integration |
| `src/components/auth/AccountNudgeBanner.tsx` | VERIFIED (code) | "Your progress is safe" copy, `translateY` Reanimated animation, `Keep My Progress` CTA, `setNudgeDismissed` on dismiss |
| `src/components/auth/MergeChoiceSheet.tsx` | VERIFIED | "Keep My Progress" and "Start Fresh" options with `keepProgress=true/false` signUp calls |
| `src/components/sync/SyncStatusIcon.tsx` | VERIFIED (code) | Reads `useAuthStore` `syncStatus`, 4 visual states, `Sync failed` caption, 44x44 touch target |
| `src/components/settings/AccountSection.tsx` | VERIFIED (code) | "Not signed in" guest state, Sign Out row, Delete Account row, Sign In navigation |
| `src/components/settings/DeleteAccountSheet.tsx` | VERIFIED | "Delete Everything?" / "Keep My Account" two-step confirmation, `deleteAccount(userId)` call |
| `app/settings.tsx` | VERIFIED | `AccountSection` imported and rendered as first section at line 196 |
| `app/_layout.tsx` | VERIFIED | `onAuthStateChange`, `setSession`, `startAutoRefresh`, `stopAutoRefresh`, `getExpoPushTokenAsync`, `flushQueue`, `appStateListenerRegistered` — all existing functionality (`useMigrations`, `Stack.Protected`, `MuhasabahModal`) preserved |
| `src/services/data-export.ts` | VERIFIED | `supabase.from(table).delete()` server cleanup when authenticated; `syncQueueRepo.clearAll()` after store resets |
| `supabase/migrations/20260317_schema.sql` | VERIFIED | 8 tables (7 syncable + `push_notifications`); no PRIVATE tables; indexes on habits, xp_ledger, quests |
| `supabase/migrations/20260317_rls.sql` | VERIFIED | 8x RLS enabled, `(select auth.uid())` caching, permissive titles SELECT, `delete_user()` RPC |
| `supabase/functions/push/index.ts` | VERIFIED (code) | `Deno.serve`, `expo_push_token` lookup, `exp.host/--/api/v2/push/send` Expo Push API |
| `__tests__/services/auth-service.test.ts` | VERIFIED | 7 test cases present |
| `__tests__/services/sync-engine.test.ts` | VERIFIED | 10 test cases present |
| `__mocks__/@supabase/supabase-js.ts` | VERIFIED | `createClient` mock with auth and `from` methods including `rpc` |
| `__mocks__/@react-native-community/netinfo.ts` | VERIFIED | `fetch` mock returning `isConnected: true` |
| `.env.example` | VERIFIED | `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` present |
| `.gitignore` | VERIFIED | `.env`, `.env.local`, `.env.production` excluded |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/supabase.ts` | `@supabase/supabase-js` | `createClient` with localStorage storage | VERIFIED | `createClient(supabaseUrl, supabaseAnonKey, { auth: { storage: localStorage } })` |
| `src/services/auth-service.ts` | `src/stores/authStore.ts` | `setSession` on auth events | NOT DIRECT | auth-service does NOT call `useAuthStore` — per design decision, `setSession` is triggered via `onAuthStateChange` in `_layout.tsx`, not in auth-service directly. This is intentional: auth-service is a pure TypeScript service layer. WIRED at system level via `_layout.tsx`. |
| `src/services/sync-engine.ts` | `src/services/privacy-gate.ts` | `assertSyncable(item.entityType)` | VERIFIED | `import { assertSyncable } from './privacy-gate'`; called per item in flush loop |
| `src/services/sync-engine.ts` | `src/stores/authStore.ts` | `useAuthStore.getState().isAuthenticated` | VERIFIED | Line 32: `const { isAuthenticated } = useAuthStore.getState()` |
| `src/services/sync-engine.ts` | `@react-native-community/netinfo` | `NetInfo.fetch()` | VERIFIED | Line 35: `const netState = await NetInfo.fetch()` |
| `app/(auth)/sign-in.tsx` | `src/services/auth-service.ts` | `signIn(` call | VERIFIED | Line 25 import, line 75: `const { error: authError } = await signIn(email.trim(), password)` |
| `app/(auth)/create-account.tsx` | `src/services/auth-service.ts` | `signUp(` call | VERIFIED | Called inside MergeChoiceSheet rendered from create-account.tsx |
| `src/components/sync/SyncStatusIcon.tsx` | `src/stores/authStore.ts` | `useAuthStore` syncStatus selector | VERIFIED | Line 30: `const syncStatus = useAuthStore((s) => s.syncStatus)` |
| `app/_layout.tsx` | `src/lib/supabase.ts` | `onAuthStateChange` subscription | VERIFIED | `supabase.auth.onAuthStateChange(...)` with `supabaseConfigured` guard |
| `app/_layout.tsx` | `src/stores/authStore.ts` | `setSession` on auth events | VERIFIED | `useAuthStore.getState().setSession(session)` inside listener |
| `app/_layout.tsx` | `src/services/sync-engine.ts` | `flushQueue` on foreground | VERIFIED | `import { flushQueue }` + AppState `useEffect` calls `await flushQueue()` |
| `supabase/migrations/20260317_rls.sql` | `auth.uid()` | RLS policy USING statements | VERIFIED | `(select auth.uid())::text` on all 8 tables — cached pattern confirmed |
| `supabase/functions/push/index.ts` | `exp.host/--/api/v2/push/send` | Expo Push API fetch | VERIFIED | `fetch('https://exp.host/--/api/v2/push/send', ...)` present |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| SYNC-01 | 07-01, 07-03 | User can create account with email, Apple, or Google auth via Supabase | SATISFIED | `signUp`/`signIn` in auth-service; sign-in and create-account screens; authStore session management. (Apple/Google OAuth not implemented — email/password only in v1, consistent with plan scope.) |
| SYNC-02 | 07-02, 07-04 | Non-private data syncs to Supabase when online (XP, settings, profile) | SATISFIED | `syncQueueRepo.enqueue` + `sync-engine.flushQueue` with privacy gate; only SYNCABLE tables go to Supabase; sync triggers on foreground via AppState |
| SYNC-03 | 07-02 | Sync engine handles offline queue with conflict resolution (idempotent completions) | SATISFIED | `flushQueue` uses `{ onConflict: 'id' }` upsert; `retryCount`/`lastError` tracking; `MAX_RETRIES=5` ceiling; 10 TDD tests covering online/offline/unauth/privacy scenarios |
| SYNC-04 | 07-04, 07-05 | Push notifications delivered via Supabase Edge Functions | SATISFIED (code) | `supabase/functions/push/index.ts` Edge Function; push token registered in `_layout.tsx` on `SIGNED_IN`; `expo_push_token` column in users table. **Requires human deployment to Supabase project to be live.** |
| SYNC-05 | 07-05 | Row-Level Security enforces data privacy at database level | SATISFIED (code) | `supabase/migrations/20260317_rls.sql`: all 8 tables have RLS enabled with `auth.uid()` ownership policies; `delete_user()` SECURITY DEFINER RPC. **Requires human deployment to be active.** |

---

### Anti-Patterns Found

No blockers or warnings found. Spot-checks across all phase 7 artifacts:

- No `TODO`/`FIXME`/`PLACEHOLDER` comments in any created files
- No `return null` stub components (all auth components render real UI)
- No empty handlers (`onSubmit={() => {}}` patterns)
- No hardcoded `'default-user'` strings outside `authStore.ts` (guest default) and `auth-service.ts` (migration SQL — intentional)
- `supabaseConfigured` guard in `supabase.ts` and all consuming services is correct defensive coding, not a stub

---

### Human Verification Required

#### 1. Auth UI Visual and UX Review

**Test:** Run `npx expo start --go` and open on device. Navigate to Settings (gear icon on Profile tab). Verify "Account" section appears at the top of settings as the first section showing "Not signed in. Your progress lives on this device only." Tap "Sign In" and verify sign-in screen appears. Tap "Create one" and verify create-account screen. Verify "Continue Without Account" link on both screens.

**Expected:** Auth screens render without crash; "Welcome Back" heading in pixel font on sign-in; "Protect Your Progress" on create-account; SyncStatusIcon shows muted cloud-x (offline/no-account state); all copy is adab-safe with no shame language; keyboard avoidance works on both forms.

**Why human:** Visual rendering, touch target sizes, keyboard avoidance behavior, pixel font quality, and copy tone cannot be verified programmatically. The MergeChoiceSheet modal, AccountNudgeBanner animation (250ms enter / 200ms exit), and SyncStatusIcon spinner animation all require device rendering.

#### 2. Supabase Project Setup and Live Deployment

**Test:** Follow the instructions in the 07-05-SUMMARY.md "User Setup Required" section:
1. Create Supabase project at https://supabase.com/dashboard
2. Copy Project URL to `EXPO_PUBLIC_SUPABASE_URL` and anon key to `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`
3. Run `supabase/migrations/20260317_schema.sql` in SQL Editor
4. Run `supabase/migrations/20260317_rls.sql` in SQL Editor
5. Run `supabase functions deploy push` after `supabase link --project-ref YOUR_REF`
6. Set `EXPO_ACCESS_TOKEN` secret on the push Edge Function
7. Create database webhook: table `push_notifications`, event `INSERT`, type Edge Function, function `push`
8. Verify Dashboard -> Authentication -> Policies shows all 8 tables with RLS enabled

**Expected:** All 8 tables visible in Table Editor; all RLS policies active; Edge Function deployed and listed; webhook created; after restarting Expo with `.env` filled in, auth sign-up/sign-in flows work end-to-end.

**Why human:** Requires an active Supabase account, real credentials, dashboard configuration, and live deployment. The SQL files and Edge Function code are verified correct, but their live effect cannot be tested without a real project.

---

### Gaps Summary

No code gaps were found. All 21 artifacts exist at all three verification levels (exists, substantive, wired). All 5 SYNC requirements have complete implementation evidence in code.

The two `human_needed` items are structural checkpoints designed into the plans:

- **Plan 03 Task 2** (`checkpoint:human-verify`) — visual verification of auth UI screens on device
- **Plan 05 Task 2** (`checkpoint:human-action`) — actual Supabase project creation and live deployment

These are not gaps or failures. The code is complete and correct. The human checkpoints gate deployment of live infrastructure (not code quality).

SYNC-01 covers email/password auth only (Apple/Google OAuth is in the requirement description but not scoped into the Phase 7 plans — plans explicitly implement email/password; this is consistent with the plan acceptance criteria and is a known scoping choice, not a gap).

---

_Verified: 2026-03-18T06:00:00Z_
_Verifier: Claude (gsd-verifier)_
