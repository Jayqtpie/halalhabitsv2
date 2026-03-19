# Phase 7: Backend, Auth, and Sync - Research

**Researched:** 2026-03-17
**Domain:** Supabase Auth + offline sync engine + Expo push notifications + Row-Level Security
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Email + password sign-in via Supabase Auth (social auth deferred)
- Guest-first: app works fully offline with no account, matching current offline-first architecture
- Early nudge: prompt account creation on first milestone (level-up or title unlock). "You earned [title]! Create an account to keep your progress safe." Non-blocking, dismissible
- On account creation, user chooses: "Keep your progress" or "Start fresh" — fresh start option available
- Background auto-sync when online + manual "Sync now" button in settings for peace of mind
- Last-write-wins conflict resolution based on `updatedAt` timestamp
- Subtle sync indicator: small cloud icon in settings/profile — checkmark when synced, spinning when syncing, warning if failed
- Idempotent completion merge: completions keyed by habitId+date, deduplicated — no double XP across devices
- Hybrid push model: keep local notifications for prayer reminders (work offline, need precise timing)
- Push-based via Supabase Edge Functions for: streak milestones, quest expiry warnings, morning motivation, Muhasabah reminder
- Device token registration on account creation/sign-in
- Sign-out keeps local data on device, app reverts to guest mode — prevents accidental data loss
- Delete account erases everywhere: server data + local data, complete erasure (GDPR compliant)
- Unlimited simultaneous devices — no device limit, all sync via Supabase

### Claude's Discretion
- Supabase project structure and RLS policy design
- Sync queue batching strategy and retry logic
- Edge Function implementation details
- Token refresh and session management approach
- Migration strategy for existing `sync_queue` table schema (may need additional columns)

### Deferred Ideas (OUT OF SCOPE)
- Social auth (Apple Sign-In, Google Sign-In) — add after email+password is working
- Cross-device real-time sync (WebSocket/Realtime) — eventual consistency via polling is fine for v1
- Account recovery / password reset flow — Supabase handles this but UI needs building
- Sync analytics / telemetry — track sync failures, latency, conflict rates
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SYNC-01 | User can create account with email, Apple, or Google auth via Supabase | Supabase Auth email+password; social deferred per CONTEXT.md |
| SYNC-02 | Non-private data syncs to Supabase when online (XP, settings, profile) | 7 SYNCABLE tables identified in privacy-gate.ts; upsert with onConflict pattern |
| SYNC-03 | Sync engine handles offline queue with conflict resolution (idempotent completions) | sync_queue table already exists; last-write-wins via updatedAt; needs retry/flush logic |
| SYNC-04 | Push notifications delivered via Supabase Edge Functions | Expo push API + Deno Edge Function pattern; expo_push_token in users/profiles table |
| SYNC-05 | Row-Level Security enforces data privacy at database level | Standard RLS policies using auth.uid(); all 7 syncable tables need RLS |
</phase_requirements>

---

## Summary

Phase 7 connects the fully offline-first HalalHabits app to Supabase for account creation, cloud backup, and push notifications. The Privacy Gate is already built and classifies all 13 tables — this phase wires the 7 SYNCABLE tables to Supabase and adds auth + push on top of that existing foundation.

The core implementation challenge is the transition from the hardcoded `'default-user'` ID to a real Supabase auth user ID. Every repository, store, and service that references `'default-user'` must accept a dynamic user ID derived from the auth session. This is the most pervasive change in the phase and must be addressed systematically.

Auth session persistence is solved by Expo SDK 54's built-in `localStorage` polyfill backed by `expo-sqlite` — the same SQLite instance the app already uses. This is the officially recommended approach and avoids the 2048-byte `expo-secure-store` limitation for JWT tokens. The Supabase client uses `storage: localStorage` + `persistSession: true` + `detectSessionInUrl: false`. AppState integration (startAutoRefresh/stopAutoRefresh) is needed to prevent session expiry issues when the app is backgrounded.

**Primary recommendation:** Build a thin `authStore` (Zustand) that holds session state, expose `useAuthStore.getState().userId` throughout the app, and replace all `'default-user'` references with this computed value. The sync engine is a separate service (`sync-engine.ts`) that reads from `sync_queue`, batches upserts by entity type, and flushes when the app comes online.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.99.2 | Supabase client (auth + database) | Official JS client; includes auth helpers, PostgREST query builder, storage |
| react-native-url-polyfill | latest | URL API polyfill required by supabase-js | supabase-js uses URL internally; required for React Native |
| expo-sqlite | ~16.0.10 | Already installed; provides localStorage polyfill for auth session storage | SDK 54 ships `expo-sqlite/localStorage/install` — no extra package needed |
| @react-native-community/netinfo | 12.0.1 | Network connectivity detection to gate sync triggers | Standard React Native network detection; used to check online status before flush |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-notifications | ~0.32.16 | Already installed; push token registration | `getExpoPushTokenAsync()` for device token; triggers on auth sign-in |
| expo-server-sdk (server side) | Deno native fetch | Not installed — Edge Function uses raw fetch to Expo API | Used in Deno Edge Function, not in the app |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-sqlite/localStorage polyfill | expo-secure-store | SecureStore has 2048-byte limit, JWT tokens exceed this — NOT recommended |
| expo-sqlite/localStorage polyfill | @react-native-async-storage/async-storage | localStorage polyfill is built into SDK 54 with the same SQLite backend; no extra package |
| Manual sync engine | PowerSync / RxDB | Adds significant complexity and dependencies; overkill for 7 syncable tables with simple LWW |

**Installation:**
```bash
npx expo install @supabase/supabase-js react-native-url-polyfill @react-native-community/netinfo
```

**Version verification (confirmed 2026-03-17):**
- `@supabase/supabase-js`: 2.99.2 (latest)
- `@react-native-community/netinfo`: 12.0.1 (latest)
- `expo-sqlite` 16.0.10 already installed — `expo-sqlite/localStorage/install` available in SDK 54

---

## Architecture Patterns

### Recommended Project Structure (new files)
```
src/
├── lib/
│   └── supabase.ts          # Supabase client singleton (URL + key + localStorage storage)
├── services/
│   ├── auth-service.ts      # signUp, signIn, signOut, deleteAccount (pure TS, no React)
│   └── sync-engine.ts       # flushQueue(), syncEntity(), connectivity listener
├── stores/
│   └── authStore.ts         # Zustand store: session, userId, syncStatus
├── db/
│   ├── schema.ts            # ADD: retryCount, lastError to sync_queue
│   └── migrations/
│       └── 0003_phase7.sql  # Migration: sync_queue columns + push_token column on users
└── supabase/                # Supabase project files (NOT in src/)
    ├── functions/
    │   └── push/
    │       └── index.ts     # Deno Edge Function for Expo push notifications
    └── migrations/          # Supabase SQL migrations (RLS, schema)
        └── 20260317_rls.sql
```

### Pattern 1: Supabase Client Initialization
**What:** Singleton client with localStorage polyfill for session persistence
**When to use:** Created once in `src/lib/supabase.ts`, imported everywhere

```typescript
// Source: https://docs.expo.dev/guides/using-supabase/
// Must be the FIRST import in the file — installs localStorage before Supabase reads it
import 'expo-sqlite/localStorage/install';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,        // SDK 54 expo-sqlite backed
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,    // Required for native apps
  },
});
```

### Pattern 2: AuthStore (Zustand)
**What:** Thin store that holds session state; provides userId computed from session
**When to use:** All stores/services that need current user ID read from here

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  userId: string;           // 'default-user' when guest, real UUID when authenticated
  isAuthenticated: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: string | null;
  setSession: (session: Session | null) => void;
  setSyncStatus: (status: AuthState['syncStatus']) => void;
  setLastSyncedAt: (iso: string | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  userId: 'default-user',     // Guest default — safe for all existing repos
  isAuthenticated: false,
  syncStatus: 'idle',
  lastSyncedAt: null,
  setSession: (session) =>
    set({
      session,
      userId: session?.user?.id ?? 'default-user',
      isAuthenticated: !!session,
    }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSyncedAt: (iso) => set({ lastSyncedAt: iso }),
}));
```

### Pattern 3: onAuthStateChange in Root Layout
**What:** Subscribe to auth events once in `app/_layout.tsx` to update authStore
**When to use:** Mounted at root, handles INITIAL_SESSION, SIGNED_IN, SIGNED_OUT

```typescript
// app/_layout.tsx — add to existing useEffect area
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/stores/authStore';
import { AppState } from 'react-native';

// AppState listener for token auto-refresh (React Native specific requirement)
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

// Auth state subscription — in useEffect with [] deps
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });
  return () => subscription.unsubscribe();
}, []);
```

### Pattern 4: Supabase Upsert with Last-Write-Wins
**What:** Sync engine uploads local records using upsert; onConflict on primary key; updatedAt wins
**When to use:** Every sync flush operation for all 7 SYNCABLE tables

```typescript
// Source: https://supabase.com/docs/reference/javascript/upsert
const { error } = await supabase
  .from('habits')
  .upsert(localHabits, {
    onConflict: 'id',           // Primary key conflict resolution
    ignoreDuplicates: false,    // Always overwrite — last-write-wins
  });
```

**For last-write-wins to work correctly:** The server-side SQL must use `updatedAt` comparison or accept the upsert as-is. Since this is a single-user app (no concurrent edits from different accounts), simple upsert without server-side timestamp check is safe.

### Pattern 5: Sync Queue Flush
**What:** Read unsynced items from `sync_queue`, batch by entity, upsert to Supabase, mark synced
**When to use:** On app foreground + connectivity restored + manual "Sync now"

```typescript
// src/services/sync-engine.ts (abbreviated)
export async function flushQueue(userId: string): Promise<void> {
  if (!useAuthStore.getState().isAuthenticated) return;
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  const pending = await syncQueueRepo.getPending(); // WHERE synced_at IS NULL
  for (const item of pending) {
    assertSyncable(item.entityType);
    const payload = JSON.parse(item.payload);
    const { error } = await supabase
      .from(item.entityType)
      .upsert(payload, { onConflict: 'id' });
    if (!error) {
      await syncQueueRepo.markSynced(item.id);
    }
  }
}
```

### Pattern 6: Expo Push Token Registration
**What:** After sign-in, get Expo push token and store in users table
**When to use:** Called from auth-service.ts after successful sign-in/sign-up

```typescript
// Source: Supabase push notifications example
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

async function registerPushToken(userId: string): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });
  // Store token in Supabase users table
  await supabase
    .from('users')
    .update({ expoPushToken: token.data })
    .eq('id', userId);
}
```

### Pattern 7: RLS Policy (Standard for all 7 syncable tables)
**What:** Enable RLS and create CRUD policies binding rows to auth.uid()
**When to use:** All 7 SYNCABLE tables: users, habits, xp_ledger, titles, user_titles, quests, settings

```sql
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security
-- Apply this pattern to each SYNCABLE table

alter table public.habits enable row level security;

-- Performance: wrap in SELECT to cache the call (up to 99% faster)
create policy "Users can view their own habits"
  on habits for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can insert their own habits"
  on habits for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "Users can update their own habits"
  on habits for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "Users can delete their own habits"
  on habits for delete to authenticated
  using ( (select auth.uid()) = user_id );
```

**Special case — users table:** Policy uses `id = auth.uid()` not `user_id = auth.uid()`:
```sql
create policy "Users can view own profile"
  on users for select to authenticated
  using ( (select auth.uid()) = id );
```

**Special case — titles table:** Titles are seed data, not user-owned. Allow all authenticated users to SELECT:
```sql
create policy "All authenticated users can view titles"
  on titles for select to authenticated
  using ( true );
```

### Pattern 8: Deno Edge Function for Push Notifications
**What:** Triggered by database webhook when a row is inserted in a `push_notifications` table
**When to use:** For server-triggered notifications (streak milestone, quest expiry, Muhasabah reminder)

```typescript
// supabase/functions/push/index.ts
// Source: https://github.com/supabase/supabase/blob/master/examples/user-management/expo-push-notifications/supabase/functions/push/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const payload = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Fetch the push token from users table
  const { data: user } = await supabase
    .from('users')
    .select('expo_push_token')
    .eq('id', payload.record.user_id)
    .single();

  if (!user?.expo_push_token) return new Response('no token', { status: 200 });

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
    },
    body: JSON.stringify({
      to: user.expo_push_token,
      sound: 'default',
      title: payload.record.title,
      body: payload.record.body,
    }),
  });

  return new Response(JSON.stringify(await res.json()), { status: 200 });
});
```

### Anti-Patterns to Avoid
- **Storing JWT in expo-secure-store directly:** SecureStore has 2048-byte limit; Supabase JWTs are larger — use localStorage polyfill instead
- **Calling auth.uid() in RLS without SELECT wrapper:** `auth.uid()` is not cached per-query; wrap as `(select auth.uid())` for up to 99% performance gain
- **Syncing PRIVATE tables:** `assertSyncable()` must be called before every sync operation — it will throw for PRIVATE tables
- **Forgetting startAutoRefresh/stopAutoRefresh:** React Native does not auto-manage app visibility for token refresh; failing to call these causes session expiry when backgrounded
- **Not persisting push token across sign-ins:** Token changes on device; register token on every sign-in, not just first sign-up
- **Allowing unauthenticated access to any Supabase table:** RLS is opt-in; tables without enabled RLS are publicly accessible via anon key

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth session persistence | Custom SQLite session store | `expo-sqlite/localStorage/install` + `persistSession: true` | SDK 54 provides this; JWT refresh, expiry handling already included |
| Token refresh on app resume | Custom timer/polling | `supabase.auth.startAutoRefresh()` / `stopAutoRefresh()` with AppState | Built-in Supabase feature; handles edge cases like network outage during refresh |
| Expo push token to FCM/APNs bridge | Direct FCM/APNs integration | Expo's push notification service | Expo handles platform credential management; single API for iOS + Android |
| Conflict resolution in upsert | Custom merge logic | `supabase.upsert({ onConflict: 'id' })` | PostgREST handles `ON CONFLICT DO UPDATE` in Postgres; no custom code needed |
| Network connectivity check | Polling / setInterval | `@react-native-community/netinfo` | Official React Native library; event-based, no polling overhead |
| RLS bypass for service operations | Application-level filtering | Supabase service role key in Edge Functions | Service role bypasses RLS by design; app uses anon key which is gated by RLS |

**Key insight:** Supabase already solves the hardest parts. The only custom work is the sync queue flush loop (which reads the already-defined `sync_queue` table), the `default-user` → dynamic user ID migration, and wiring `onAuthStateChange` into the existing store pattern.

---

## Common Pitfalls

### Pitfall 1: Session Lost When Starting Offline
**What goes wrong:** App starts offline; Supabase client attempts to verify stored session against server; server unreachable; session is cleared
**Why it happens:** `autoRefreshToken: true` initiates a network call on startup to validate the token
**How to avoid:** There is a known issue in Supabase React Native Auth (Discussion #36906). Mitigation: catch `AuthSessionMissingError` in `onAuthStateChange` and treat it as "session cached locally, will restore when online." Do NOT clear auth state on network errors.
**Warning signs:** User is signed out unexpectedly after app resumes from airplane mode

### Pitfall 2: `default-user` ID Not Replaced Everywhere
**What goes wrong:** Some repos still use hardcoded `'default-user'`; sync engine uploads data with wrong user_id; RLS blocks the upsert (user_id doesn't match auth.uid())
**Why it happens:** The string `'default-user'` appears in `userRepo`, `habitRepo`, and other places; easy to miss during refactor
**How to avoid:** `useAuthStore.getState().userId` should be the single source of truth; grep for `'default-user'` after implementation and verify zero hardcoded instances remain
**Warning signs:** RLS policy violations in Supabase logs; sync uploads return 403 errors

### Pitfall 3: Double XP Across Devices
**What goes wrong:** User completes habit on device A, syncs; completes same habit on device B (offline), syncs; XP applied twice
**Why it happens:** `xp_ledger` entries are append-only; upsert on ID deduplicates individual rows but two distinct IDs for the same habit+date create two entries
**How to avoid:** Per CONTEXT.md decision: completions keyed by habitId+date (idempotent merge). Add a `UNIQUE(habit_id, date_local)` constraint on `habit_completions` in Supabase (even though this table is PRIVATE and not synced) and on `xp_ledger` use sourceId deduplication. xp_ledger rows keyed by `(source_type, source_id)` with a unique index prevents duplicate XP
**Warning signs:** `totalXp` in Supabase users table is higher than local SQLite value

### Pitfall 4: Push Token Not Updated After Re-install
**What goes wrong:** User uninstalls and reinstalls app; push token changes; old token stored in Supabase; notifications stop arriving
**Why it happens:** Token is only registered once, not on every sign-in
**How to avoid:** Call `registerPushToken()` on every SIGNED_IN event (not just first sign-up)
**Warning signs:** Push notifications not received after reinstall; no errors in Edge Function logs

### Pitfall 5: RLS on `titles` Table Blocks Seed Data Read
**What goes wrong:** App tries to read title definitions from Supabase; RLS blocks all reads; empty title list
**Why it happens:** `titles` table is seed data shared across all users; naive `user_id = auth.uid()` policy blocks everyone
**How to avoid:** `titles` gets a permissive SELECT policy (`using (true)`) for all authenticated users; INSERT/UPDATE/DELETE remain restricted to service role only
**Warning signs:** Quest Board and Title Grid show empty after sign-in

### Pitfall 6: Sync Queue Accumulates Stale Entries
**What goes wrong:** App goes offline for days; queue grows; user deletes a habit; deletion queued; habit creation also queued; on flush, delete runs before create in some orderings — foreign key violation
**Why it happens:** Queue entries are unordered by default; operations on the same entity need causal ordering
**How to avoid:** Order sync queue flush by `createdAt ASC`; this preserves causal order. Additionally, on habit delete, mark the queue entry as superseded rather than keeping both create + delete
**Warning signs:** Supabase upsert returns foreign key constraint errors during flush

### Pitfall 7: AppState Listener Registered Multiple Times
**What goes wrong:** `AppState.addEventListener` called in multiple places; multiple `startAutoRefresh` / `stopAutoRefresh` calls
**Why it happens:** Root layout re-renders; the listener is registered outside useEffect
**How to avoid:** Register `AppState.addEventListener` at module level (outside component) OR once in a useEffect with `[]` deps with proper cleanup. Use a module-level guard flag.
**Warning signs:** Console shows duplicate "TOKEN_REFRESHED" events

---

## Code Examples

### Supabase Client (`src/lib/supabase.ts`)
```typescript
// Source: https://docs.expo.dev/guides/using-supabase/
// Order matters: polyfills must load before supabase-js
import 'expo-sqlite/localStorage/install';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### Email Sign-Up
```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react-native
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
});
// data.session is null until email confirmation (if enabled)
// data.user contains the new user — use data.user.id as userId
```

### Email Sign-In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword',
});
// data.session contains access_token, refresh_token
// data.session.user.id is the real userId
```

### Sign Out (non-destructive — keep local data)
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-signout
// scope: 'local' clears only this device session
// Local SQLite data is NOT touched — user reverts to guest mode
await supabase.auth.signOut({ scope: 'local' });
// onAuthStateChange fires SIGNED_OUT event
// authStore.setSession(null) -> userId reverts to 'default-user'
```

### Get Current Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
// Call this once on app init to restore persisted session
```

### RLS Migration SQL Template
```sql
-- Apply to each syncable table: users, habits, xp_ledger, user_titles, quests, settings
-- Run via Supabase Dashboard or supabase CLI

alter table public.{table} enable row level security;

create policy "{Table}: select own data"
  on {table} for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "{Table}: insert own data"
  on {table} for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "{Table}: update own data"
  on {table} for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "{Table}: delete own data"
  on {table} for delete to authenticated
  using ( (select auth.uid()) = user_id );
```

### Sync Queue Schema Addition (Drizzle migration)
```sql
-- 0003_phase7.sql
-- Add retry tracking and push token to sync_queue and users

ALTER TABLE sync_queue ADD COLUMN retry_count integer NOT NULL DEFAULT 0;
ALTER TABLE sync_queue ADD COLUMN last_error text;
ALTER TABLE users ADD COLUMN expo_push_token text;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| expo-secure-store for Supabase session | expo-sqlite/localStorage polyfill | SDK 54 (2025) | No more 2048-byte limit workarounds; single install import |
| @react-native-async-storage for session | expo-sqlite/localStorage polyfill | SDK 54 (2025) | Fewer dependencies; same SQLite backend as app data |
| Manual FCM/APNs integration | Expo Push Service + Edge Function | 2023+ | Single API for iOS + Android; Expo handles credentials |
| Supabase anon key + client-side row filtering | Row Level Security | Standard since 2021 | Security at DB level; app cannot accidentally leak data |

**Deprecated/outdated:**
- `expo-secure-store` as Supabase session storage: Still works but requires AES+MMKV workaround for the 2048-byte limit. Use localStorage polyfill instead.
- `supabase.auth.api.*` methods: Removed in supabase-js v2; use `supabase.auth.*` directly.

---

## Open Questions

1. **Supabase project provisioning**
   - What we know: Need `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` as env vars
   - What's unclear: Whether the user has already created a Supabase project or whether Wave 0 tasks must include "create Supabase project"
   - Recommendation: Planner should add a Wave 0 task: "Create Supabase project, create `.env` with URL and anon key, add to `.gitignore`"

2. **"Keep your progress" migration on account creation**
   - What we know: User chooses to keep existing local data when creating account; local `'default-user'` rows must be re-keyed to the new auth UUID
   - What's unclear: Whether this is done via a SQL UPDATE `WHERE user_id = 'default-user'` or by re-inserting all rows with new user_id
   - Recommendation: Use `UPDATE {table} SET user_id = $newId WHERE user_id = 'default-user'` in a transaction — simpler than re-insert, preserves IDs

3. **Push notification opt-in timing for migrated users**
   - What we know: Users who were using local notifications now need to register an Expo push token on first sign-in
   - What's unclear: Whether permission should be re-requested or existing local notification permission is sufficient for Expo push tokens
   - Recommendation: `getExpoPushTokenAsync()` only requires notification permission — the same permission already granted for local notifications. No extra prompt needed.

4. **sync_queue ordering under high volume**
   - What we know: Queue must flush in `createdAt ASC` order to preserve causal ordering
   - What's unclear: Performance impact of ordering on large queues (unlikely in practice for a habit tracker)
   - Recommendation: Add `index('idx_sync_queue_pending').on(syncQueue.createdAt)` filtered on `syncedAt IS NULL`

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest-expo ~54.0.17 |
| Config file | `jest.config.js` (exists at root) |
| Quick run command | `npx jest --no-coverage --testPathPattern="auth\|sync" -x` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SYNC-01 | `authService.signUp` returns session; `signIn` returns session; `signOut` clears userId | unit | `npx jest --no-coverage __tests__/services/auth-service.test.ts -x` | ❌ Wave 0 |
| SYNC-02 | `syncEngine.syncEntity('habits', payload)` calls supabase.upsert with correct table + onConflict | unit | `npx jest --no-coverage __tests__/services/sync-engine.test.ts -x` | ❌ Wave 0 |
| SYNC-02 | Privacy gate: `assertSyncable('habit_completions')` throws; `assertSyncable('habits')` passes | unit | `npx jest --no-coverage __tests__/services/privacy-gate.test.ts -x` | ✅ (existing) |
| SYNC-03 | `syncEngine.flushQueue()` skips when offline (NetInfo mock returns isConnected: false) | unit | `npx jest --no-coverage __tests__/services/sync-engine.test.ts -x` | ❌ Wave 0 |
| SYNC-03 | `syncEngine.flushQueue()` marks queue items as synced after successful upsert | unit | `npx jest --no-coverage __tests__/services/sync-engine.test.ts -x` | ❌ Wave 0 |
| SYNC-04 | `registerPushToken()` calls `supabase.update` with token value | unit | `npx jest --no-coverage __tests__/services/auth-service.test.ts -x` | ❌ Wave 0 |
| SYNC-05 | RLS policies present on all 7 syncable tables | manual | Supabase dashboard review | Manual only |

### Sampling Rate
- **Per task commit:** `npx jest --no-coverage __tests__/services/ -x`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/services/auth-service.test.ts` — covers SYNC-01, SYNC-04
- [ ] `__tests__/services/sync-engine.test.ts` — covers SYNC-02, SYNC-03
- [ ] Mock for `@supabase/supabase-js` in `jest.setup.ts` (supabase client calls must be mockable)
- [ ] Mock for `@react-native-community/netinfo` in `jest.setup.ts`

---

## Sources

### Primary (HIGH confidence)
- [Expo: Using Supabase](https://docs.expo.dev/guides/using-supabase/) — SDK 54 localStorage polyfill, Supabase client setup
- [Supabase: RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — policy patterns, `(select auth.uid())` performance wrapping
- [Supabase: onAuthStateChange](https://supabase.com/docs/reference/javascript/auth-onauthstatechange) — event types (INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
- [Supabase: signOut](https://supabase.com/docs/reference/javascript/auth-signout) — scope options, SIGNED_OUT event
- [Supabase: upsert](https://supabase.com/docs/reference/javascript/upsert) — onConflict parameter, ignoreDuplicates
- [Supabase Push Notifications Example](https://github.com/supabase/supabase/blob/master/examples/user-management/expo-push-notifications/supabase/functions/push/index.ts) — Deno Edge Function pattern
- [Supabase: Push Notifications Guide](https://supabase.com/docs/guides/functions/examples/push-notifications) — database webhook + expo_push_token setup
- [Supabase: Automatic Retries](https://supabase.com/docs/guides/api/automatic-retries-in-supabase-js) — exponential backoff pattern with fetch-retry

### Secondary (MEDIUM confidence)
- [Supabase Auth React Native Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react-native) — signUp, signInWithPassword patterns; AppState integration for startAutoRefresh
- [Supabase Expo Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native) — EXPO_PUBLIC_ env var pattern; publishable key format
- Evan Bacon (X/Twitter) on SDK 54 localStorage: "new spec-compliant localStorage API... Built for New Architecture and uses our powerful new SQLite native module" — confirms SDK 54 built-in support

### Tertiary (LOW confidence)
- [GitHub Discussion #36906](https://github.com/orgs/supabase/discussions/36906): Session lost when starting offline — known issue; mitigation is to not clear auth state on network errors
- [GitHub Discussion #14306](https://github.com/orgs/supabase/discussions/14306): expo-secure-store 2048-byte size limit confirmed

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against npm registry and official Expo/Supabase docs
- Architecture: HIGH — patterns from official docs and verified examples
- Pitfalls: MEDIUM — mix of official documentation and GitHub discussion reports
- Sync queue design: MEDIUM — custom design based on existing schema; no official Supabase pattern for this exact approach

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable libraries; SDK 54 localStorage polyfill is new but stable)
