---
phase: 07-backend-auth-and-sync
plan: 05
subsystem: infra
tags: [supabase, postgres, rls, deno, edge-function, push-notifications, sql]

# Dependency graph
requires:
  - phase: 07-01
    provides: authStore, auth-service with delete_user RPC reference, supabase client
  - phase: 07-02
    provides: sync engine, privacy gate, syncable table list
  - phase: 07-03
    provides: AccountSection, DeleteAccountSheet, auth UI
  - phase: 07-04
    provides: auth session wiring in root layout
provides:
  - Postgres schema SQL for 7 syncable tables + push_notifications (8 total)
  - RLS policies for all 8 tables binding rows to auth.uid()
  - delete_user() SECURITY DEFINER RPC for account deletion cascade
  - Deno Edge Function for Expo push notification delivery via webhook
  - Supabase project setup instructions for human operator
affects:
  - Any future backend work or Supabase dashboard configuration

# Tech tracking
tech-stack:
  added: [supabase-edge-functions, deno, expo-push-api]
  patterns: [rls-cached-auth-uid, security-definer-rpc, database-webhook-trigger]

key-files:
  created:
    - supabase/migrations/20260317_schema.sql
    - supabase/migrations/20260317_rls.sql
    - supabase/functions/push/index.ts

key-decisions:
  - "text PKs used in Postgres to match local SQLite schema exactly — avoids UUID conversion in sync layer"
  - "(select auth.uid()) wrapper caches the auth call per query for up to 99% performance improvement vs direct auth.uid()"
  - "titles table has permissive SELECT (USING true) for all authenticated — seed data shared across all users"
  - "delete_user() uses SECURITY DEFINER so it can cascade-delete across all tables as the postgres role bypassing per-table RLS"
  - "push_notifications table uses uuid PK (gen_random_uuid()) not text — server-generated, no app-side ID needed"
  - "Edge Function reads expo_push_token from users table via service role key — bypasses RLS for server-only access"
  - "PRIVATE tables (habit_completions, streaks, muhasabah_entries, niyyah) absent from Supabase by design (privacy gate enforcement)"

patterns-established:
  - "RLS pattern: ALTER TABLE ... ENABLE ROW LEVEL SECURITY + CREATE POLICY FOR SELECT/INSERT/UPDATE/DELETE with (select auth.uid())::text"
  - "Cached auth.uid() pattern: wrap in (select ...) to avoid per-row function call overhead"
  - "SECURITY DEFINER RPC pattern for admin operations that need to bypass RLS"
  - "Database webhook -> Edge Function pattern for async server-side processing"

requirements-completed: [SYNC-04, SYNC-05]

# Metrics
duration: 8min
completed: 2026-03-18
---

# Phase 7 Plan 05: Supabase Server Infrastructure Summary

**Postgres schema (8 tables), RLS policies with cached auth.uid(), delete_user() RPC, and Deno push Edge Function — full server-side infrastructure for HalalHabits backend**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-18T05:08:53Z
- **Completed:** 2026-03-18T05:17:00Z
- **Tasks:** 1 of 2 automated (Task 2 requires human Supabase project setup)
- **Files modified:** 3

## Accomplishments
- Postgres schema mirrors all 7 syncable local tables with text PKs to avoid UUID conversion overhead
- RLS policies on all 8 tables enforce auth.uid() ownership with cached (select auth.uid()) pattern for performance
- titles table correctly has permissive SELECT for all authenticated users (shared seed data)
- delete_user() SECURITY DEFINER RPC provides safe account deletion cascade in correct dependency order
- Deno Edge Function fetches push token from users table and delivers via Expo Push API
- PRIVATE tables (habit_completions, streaks, muhasabah_entries, niyyah) deliberately absent

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema migration, RLS policies, Edge Function** - `4b18fd0` (feat)
2. **Task 2: Supabase project setup** - Requires human action (checkpoint:human-action)

**Plan metadata:** TBD (docs commit after state update)

## Files Created/Modified
- `supabase/migrations/20260317_schema.sql` - 8-table Postgres schema (7 syncable + push_notifications)
- `supabase/migrations/20260317_rls.sql` - RLS policies for all 8 tables + delete_user() RPC
- `supabase/functions/push/index.ts` - Deno Edge Function for Expo push delivery via webhook

## Decisions Made
- Used `text` PKs throughout to match local SQLite schema — avoids UUID conversion in sync layer
- `(select auth.uid())` wrapper on all RLS policies — caches per query, not per row
- `titles` table permissive SELECT with `USING (true)` — seed data, all authenticated users can read
- `push_notifications` uses `uuid` PK (`gen_random_uuid()`) — server-generated, app never creates these IDs
- `delete_user()` SECURITY DEFINER deletes in dependency order: push_notifications -> user_titles -> xp_ledger -> quests -> settings -> habits -> users

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**External services require manual configuration before the sync/push features are live:**

### Supabase Project Setup (Task 2 — Human Action Required)

1. **Create Supabase project** at https://supabase.com/dashboard -> New Project
2. **Copy credentials** from Settings -> API:
   - Project URL -> set as `EXPO_PUBLIC_SUPABASE_URL` in `.env`
   - anon public key -> set as `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`
3. **Run schema migration** — Copy `supabase/migrations/20260317_schema.sql` into SQL Editor -> Run
4. **Run RLS migration** — Copy `supabase/migrations/20260317_rls.sql` into SQL Editor -> Run
5. **Deploy Edge Function:**
   - `npm install -g supabase` (if not installed)
   - `supabase link --project-ref YOUR_PROJECT_REF`
   - `supabase functions deploy push`
6. **Set Edge Function secret:**
   - Supabase Dashboard -> Edge Functions -> push -> Secrets
   - Add `EXPO_ACCESS_TOKEN` (from https://expo.dev/accounts/settings/access-tokens)
7. **Create database webhook:**
   - Supabase Dashboard -> Database -> Webhooks -> Create webhook
   - Table: `push_notifications`, Events: `INSERT`, Type: Supabase Edge Function, Function: `push`
8. **Verify** — Dashboard -> Authentication -> Policies: all 8 tables show RLS enabled

### Resume Signal
Type "supabase ready" when setup is complete, or describe any issues encountered.

## Next Phase Readiness
- All server-side artifacts committed and ready to deploy
- Schema and RLS files can be copy-pasted directly into Supabase SQL Editor
- Edge Function ready for `supabase functions deploy push`
- Once Supabase project is live, the sync engine (07-02) and auth service (07-01) will have a working backend
- Phase 7 is complete once Task 2 human setup is done — all 5 plans fully executed

---
*Phase: 07-backend-auth-and-sync*
*Completed: 2026-03-18*
