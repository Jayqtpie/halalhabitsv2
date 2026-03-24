# Phase 15: Buddy Connection System - Research

**Researched:** 2026-03-24
**Domain:** Social graph (invite codes, buddy list, online presence, RLS, discoverability), React Native UI (FlatList, share sheet, search), Zustand store patterns, Drizzle/SQLite repo layer
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Connection Flow**
- D-01: Invite codes shared via native share sheet. 'Invite' generates a short alphanumeric code (e.g., 'HH-A7K3'), then opens OS share sheet (WhatsApp, iMessage, copy). Code expires after 48 hours per BUDY-01.
- D-02: Code entry happens on the buddy list screen. Prominent 'Enter Code' button — tap it, type/paste the code, confirm.
- D-03: Incoming buddy requests notified in-app only. Badge on buddy tab icon, pending requests section at top of buddy list. No push notifications for buddy requests.
- D-04: Blocking is silent removal. Blocked user disappears from both lists. Blocked person sees the buddy as 'removed' — no indication they were blocked. Blocked user cannot re-request.

**Buddy List & Status**
- D-05: Buddy list is a simple vertical list of buddy cards — avatar/initial, username, online status dot, streak count. Pending requests section at top.
- D-06: Online status shows last active time. Green dot = active in last 15 min, gray dot = offline. Show 'Active 2h ago' text. Implemented via Supabase presence or heartbeat.
- D-07: Empty state shows pixel-art illustration of two characters, warm mentor copy ('Accountability starts with one connection'), plus 'Invite a Buddy' and 'Enter Code' buttons.

**Buddy Profile View**
- D-08: Tapping a buddy in the list opens their profile as a detail screen (push navigation).
- D-09: Buddy profile shows: XP total, current streak count, identity title (e.g., 'The Steadfast'), and level. All non-worship public data — feels like viewing a friend's RPG character sheet.
- D-10: Buddy profile includes Remove and Block actions via three-dot menu or bottom actions. No messaging or shared activity actions in Phase 15.

**Discoverability & Privacy**
- D-11: Discoverability opt-in presented during buddy onboarding — first time user opens the buddy screen: 'Want others to find you by username?' Choice changeable in settings later. Privacy-first: defaults to not discoverable if user skips.
- D-12: Username search is an inline search bar at top of the buddy list screen. Type a username, debounced Supabase query, results appear below. Only discoverable users show up.
- D-13: Soft rate limit: max 10 pending outbound buddy requests at a time. No time cooldown — just cap concurrent pending.

### Claude's Discretion
- Navigation structure for buddy screens within Expo Router (tab vs stack)
- Exact heartbeat/presence implementation approach
- Buddy card component styling details within the modern pixel revival aesthetic
- Confirmation dialogs for remove/block actions

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BUDY-01 | User can generate a single-use invite code (expires in 48 hours) to share with a friend | Code generation with crypto randomness + expiry timestamp in buddies row; expo-sharing for share sheet |
| BUDY-02 | User can connect by entering a buddy's invite code | Code lookup query on Supabase buddies table (invite_code unique index exists); status update to 'accepted' |
| BUDY-03 | User can search for buddies by username (only finds users who opted into discoverability) | Supabase SELECT on users table filtered by display_name + is_discoverable; users table needs discoverability column |
| BUDY-04 | User can accept, decline, remove, or block buddy requests | Status machine on buddies row: pending → accepted / deleted (decline/remove) / blocked_by_a / blocked_by_b |
| BUDY-05 | User can view buddy list showing up to 20 connections with online status | Local SQLite buddies query + periodic Supabase last_active_at fetch; 20-buddy cap enforced at insert |
| BUDY-06 | User can view a buddy's public progress summary (XP total, streak count — never worship details) | Supabase SELECT on users table (total_xp, current_level, active_title_id) — no habit_completions or streaks access |
| BUDY-07 | Supabase RLS policies enforce buddy-pair scoping on all social tables | RLS SQL already exists in 20260319_v2_rls.sql; users table needs new policy for buddy-pair profile reads and discoverable search |
</phase_requirements>

---

## Summary

Phase 15 builds on a solid foundation: the `buddies` table schema is defined in `src/db/schema.ts` with all required columns (`user_a`, `user_b`, `status`, `invite_code`, `created_at`, `accepted_at`, `updated_at`), and the Supabase RLS policies for `buddies`, `messages`, `shared_habits`, and `duo_quests` are already written in `supabase/migrations/20260319_v2_rls.sql`. The main implementation work is: (1) building the `buddyRepo` following established patterns, (2) building the `buddyStore` following the gameStore/detoxStore pattern, (3) creating the buddy tab screens in Expo Router, (4) adding discoverability support to the `users` table (both SQLite schema and Supabase), and (5) updating the existing `users` RLS policy to allow buddy-pair profile reads.

The existing `buddies` RLS only allows a user to select rows where they are `user_a` or `user_b`. Buddy profile viewing (BUDY-06) requires reading another user's row from the `users` table — the current `users` RLS policy only permits `id = auth.uid()`. This is the only RLS gap that must be addressed in Phase 15. The fix is a new Supabase policy: allow SELECT on `users` where the requesting user has an accepted buddy row with that user.

**Primary recommendation:** Build buddyRepo → buddyStore → buddy screens in that order. Add discoverability column to users table (SQLite + Supabase ALTER TABLE). Fix the users SELECT RLS policy for buddy profile reads before any other Supabase work.

---

## Standard Stack

### Core (all already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | ^0.45.1 | SQLite queries for buddyRepo | Established pattern across all 12 repos |
| expo-sqlite | ~16.0.10 | Local buddies table persistence | Project-wide local DB |
| @supabase/supabase-js | ^2.99.2 | Supabase queries for discoverability search, buddy profile reads, heartbeat | Project sync/auth infrastructure |
| zustand | ^5.0.11 | buddyStore state management | All 6 domain stores use Zustand |
| expo-sharing | ~14.0.8 | Native share sheet for invite codes | Already installed; Share.shareAsync() |
| expo-crypto | ~15.0.8 | Cryptographically random invite code generation | Already installed; Crypto.getRandomBytes() |
| react-native | 0.81.5 | FlatList for buddy list, TextInput for search/code entry | Base RN stack |
| expo-router | ~6.0.23 | Tab + stack navigation for buddy screens | Established project navigation |

### No New Dependencies Required

Phase 15 requires zero new npm packages. Every capability needed is already installed:
- Share sheet: `expo-sharing` (`Sharing.shareAsync()` or `Share` from React Native)
- Crypto randomness for invite codes: `expo-crypto` (`Crypto.getRandomValues()`)
- Debounced search: implement with `useRef` + `setTimeout` — no lodash needed

**Installation:** No installation step needed.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── db/repos/
│   └── buddyRepo.ts           # SYNCABLE repo — calls syncQueueRepo.enqueue()
├── domain/
│   └── buddy-engine.ts        # Pure TS: invite code generation, status transitions, rate limit check
├── stores/
│   └── buddyStore.ts          # Zustand store — no persist middleware (SQLite is source of truth)
app/
├── (tabs)/
│   └── buddies.tsx            # Buddy list tab screen (FlatList, search bar, empty state)
├── buddy/
│   ├── _layout.tsx            # Stack layout for buddy sub-screens
│   ├── [id].tsx               # Buddy profile screen (RPG character sheet view)
│   └── enter-code.tsx         # Code entry screen (or modal)
src/components/
└── buddy/
    ├── BuddyCard.tsx           # Avatar/initial, username, online dot, streak count
    ├── BuddyProfileSheet.tsx   # (or use push screen per D-08)
    ├── InviteCodeSheet.tsx     # Displays generated code + share button
    └── BuddyEmptyState.tsx     # Pixel-art illustration + CTAs
```

### Pattern 1: buddyRepo — SYNCABLE Repo (follows bossRepo/detoxRepo inverted)

Every write to the buddies table MUST call `syncQueueRepo.enqueue('buddies', ...)` after the SQLite write. This is the opposite of bossRepo (which deliberately never calls enqueue). Follow `habitRepo` or `xpRepo` as the pattern for SYNCABLE repos.

```typescript
// Source: src/db/repos/detoxRepo.ts pattern (but SYNCABLE, not LOCAL_ONLY)
import { assertSyncable } from '../../services/privacy-gate';
import { syncQueueRepo } from './syncQueueRepo';

export const buddyRepo = {
  async create(data: NewBuddy): Promise<Buddy[]> {
    assertSyncable('buddies'); // guard call on write path
    const db = getDb();
    const rows = await db.insert(buddies).values(data).returning();
    await syncQueueRepo.enqueue('buddies', rows[0].id, 'UPSERT', rows[0]);
    return rows;
  },

  async updateStatus(id: string, status: BuddyStatus, extra?: Partial<Buddy>): Promise<void> {
    assertSyncable('buddies');
    const db = getDb();
    const payload = { status, updatedAt: new Date().toISOString(), ...extra };
    await db.update(buddies).set(payload).where(eq(buddies.id, id));
    const updated = await db.select().from(buddies).where(eq(buddies.id, id));
    await syncQueueRepo.enqueue('buddies', id, 'UPSERT', updated[0]);
  },

  // Queries (read-only, no sync needed)
  async getAccepted(userId: string): Promise<Buddy[]> { ... },
  async getPending(userId: string): Promise<Buddy[]> { ... },
  async findByInviteCode(code: string): Promise<Buddy | null> { ... },
  async getPendingOutboundCount(userId: string): Promise<number> { ... },
};
```

### Pattern 2: buddyStore — Zustand (follows detoxStore/bossStore pattern)

No persist middleware. Data lives in SQLite. Store holds in-memory view + loading state + pending badge count.

```typescript
// Source: src/stores/bossStore.ts / detoxStore.ts pattern
import { create } from 'zustand';

interface BuddyState {
  accepted: Buddy[];
  pendingIncoming: Buddy[];
  pendingOutgoing: Buddy[];
  loading: boolean;
  pendingBadgeCount: number; // drives tab badge

  loadBuddies: (userId: string) => Promise<void>;
  generateInviteCode: (userId: string) => Promise<string>;
  acceptRequest: (buddyId: string) => Promise<void>;
  declineRequest: (buddyId: string) => Promise<void>;
  removeBuddy: (buddyId: string, currentUserId: string) => Promise<void>;
  blockBuddy: (buddyId: string, currentUserId: string) => Promise<void>;
  enterCode: (code: string, userId: string) => Promise<'success' | 'expired' | 'not_found' | 'already_connected' | 'rate_limited'>;
}
```

### Pattern 3: Invite Code Generation (buddy-engine.ts)

Generate via `expo-crypto`, format as `HH-XXXXX` (alphanumeric), store on the buddies row with a 48-hour expiry timestamp.

```typescript
// Source: expo-crypto docs — Crypto.getRandomValues()
import * as Crypto from 'expo-crypto';

export function generateInviteCode(): string {
  const bytes = Crypto.getRandomValues(new Uint8Array(4));
  const hex = Array.from(bytes).map(b => b.toString(36).toUpperCase()).join('').slice(0, 5);
  return `HH-${hex}`;
}

export function isInviteCodeExpired(createdAt: string): boolean {
  const EXPIRY_MS = 48 * 60 * 60 * 1000;
  return Date.now() - new Date(createdAt).getTime() > EXPIRY_MS;
}

export function canSendRequest(pendingOutboundCount: number): boolean {
  return pendingOutboundCount < 10; // D-13 rate limit
}
```

### Pattern 4: Discoverability Column — Schema Addition

The `users` table (SQLite + Supabase) currently has no `is_discoverable` column. This must be added as part of Phase 15.

**SQLite:** Add column to `schema.ts`:
```typescript
// Add to users sqliteTable definition
isDiscoverable: integer('is_discoverable', { mode: 'boolean' }).notNull().default(false),
lastActiveAt: text('last_active_at'), // for online status heartbeat
```

**Supabase:** New migration file `supabase/migrations/20260324_buddy_columns.sql`:
```sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_discoverable boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_active_at text;
CREATE INDEX IF NOT EXISTS idx_users_discoverable_name ON public.users(display_name) WHERE is_discoverable = true;
```

### Pattern 5: Online Status — Heartbeat (Claude's Discretion)

Supabase Realtime Presence is overkill for this phase and requires active WebSocket connections. A simpler heartbeat approach is recommended:

- On app foreground (AppState 'active'), write `last_active_at = now()` to Supabase users row
- On buddy list render, compute status client-side: `now() - last_active_at < 15 min → green`
- No WebSocket subscription required — just a periodic write + read at list render time

This matches the offline-first pattern already used throughout the project.

### Pattern 6: Buddy Profile Read — Supabase RLS Gap

Current `users` SELECT policy: `(select auth.uid())::text = id` — only own row.

New policy needed for Phase 15:
```sql
-- Allow reading a buddy's public profile if you have an accepted connection
CREATE POLICY "Users: select buddy profiles" ON public.users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.buddies b
      WHERE b.status = 'accepted'
        AND (
          ((select auth.uid())::text = b.user_a AND id = b.user_b) OR
          ((select auth.uid())::text = b.user_b AND id = b.user_a)
        )
    )
  );
```

**Also needed:** A Supabase function or direct query for username search (discoverability). The current users SELECT policy does not allow searching other users' rows. Use a Supabase RPC (SECURITY DEFINER) or a new policy:
```sql
-- Allow searching discoverable users by display_name
CREATE POLICY "Users: search discoverable" ON public.users
  FOR SELECT TO authenticated
  USING (is_discoverable = true);
```
This is safe: discoverable users explicitly opted in, and only `display_name`, `id`, `current_level`, `total_xp`, `active_title_id` are exposed — no worship data.

### Pattern 7: Navigation Structure (Claude's Discretion)

Recommended: Add `buddies` as a 5th tab in `app/(tabs)/`. The current tab bar has 4 tabs (index, habits, quests, profile). Add `buddies.tsx` as the 5th tab.

For the buddy profile detail screen: push navigation via `app/buddy/[id].tsx` (stack route outside tabs). This follows the existing pattern of `app/arena.tsx` as a full-screen stack push.

Tab badge for pending requests: Add badge rendering to `CustomTabBar.tsx` — read `pendingBadgeCount` from `buddyStore`.

```typescript
// In CustomTabBar.tsx — add badge support
// buddyStore.pendingBadgeCount > 0 → show red dot on 'buddies' tab icon
```

### Anti-Patterns to Avoid

- **Do not use Supabase Realtime subscriptions for online presence in Phase 15.** The project is offline-first; a heartbeat write is sufficient and far simpler.
- **Do not expose streak count from the local `streaks` table** for buddy profile view. Use `total_xp` and derive "current streak" from the Supabase `users` row — but wait: `streaks` is PRIVATE. The buddy profile must only show data from the `users` table (level, XP, active title). "Streak count" for BUDY-06 means the user's total/current streak must be stored as a denormalized column on `users` or derived from non-PRIVATE data. See Pitfall #3.
- **Do not call `syncQueueRepo.enqueue()` without first calling `assertSyncable()`** — follow the guard-then-write pattern.
- **Do not add `flex: 1` to modal/sheet children** — project memory `feedback_flex1_layout.md` records that this collapses layout.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Native share sheet | Custom share UI | `Share.share()` from React Native (built-in) | OS handles app list, copy, etc. |
| Cryptographically random codes | Math.random() | `expo-crypto` `Crypto.getRandomValues()` | Math.random() is not cryptographically secure |
| Debounced search | Custom debounce util | `useRef` + `setTimeout` (3 lines) | Lodash debounce is not installed; trivial inline |
| Online status badge | WebSocket subscription | Heartbeat last_active_at column | Simpler, offline-friendly, no subscription complexity |
| Username uniqueness | Custom uniqueness check | Supabase UNIQUE constraint on `display_name` | DB-level guarantee; check exists already via unique() in schema |

---

## Common Pitfalls

### Pitfall 1: Invite Code Collision
**What goes wrong:** Two users generate the same code simultaneously; the second insert fails with a unique constraint violation.
**Why it happens:** Short codes (5 chars base-36 = ~60M combinations) have low but non-zero collision probability.
**How to avoid:** Catch unique constraint error on insert, regenerate and retry once. The `idx_buddy_invite_code` uniqueIndex already exists in schema.ts.
**Warning signs:** `UNIQUE constraint failed: buddies.invite_code` error from SQLite or Supabase.

### Pitfall 2: Dual-Owner Query Logic
**What goes wrong:** `getAccepted(userId)` query only checks `userA = userId` — misses rows where the user is `userB`.
**Why it happens:** Single-owner mental model applied to dual-owner table.
**How to avoid:** All buddyRepo queries must use `OR` conditions: `eq(buddies.userA, userId)` OR `eq(buddies.userB, userId)`. Use Drizzle `or()` operator.
**Warning signs:** Buddy list is empty for the invited party (user_b) even after accepting.

### Pitfall 3: Streak Count on Buddy Profile Violates Privacy Gate
**What goes wrong:** BUDY-06 says buddy profile shows "streak count" — but `streaks` table is PRIVATE. Reading another user's streaks via Supabase would require either exposing the PRIVATE table or syncing it (which is forbidden).
**Why it happens:** BUDY-06 spec uses "streak count" loosely; the Privacy Gate prohibits syncing streak data.
**How to avoid:** The buddy profile streak count must come from a **denormalized field on the `users` table** (e.g., `current_streak_count integer`). Add this column to both SQLite schema and Supabase users table. Update it whenever the local user's streak changes (in habitStore, after streak update). This column syncs via the existing users SYNCABLE path. The buddy reads it from Supabase users row — zero PRIVATE data exposure.
**Warning signs:** Attempting to `SELECT streaks WHERE user_id = buddyId` from Supabase — will fail (streaks table doesn't exist in Supabase by design).

### Pitfall 4: Block State Asymmetry
**What goes wrong:** When user A blocks user B, status becomes `blocked_by_a`. If user B later tries to reconnect (e.g., enters user A's new invite code), the system must prevent it — but checking `status = 'blocked_by_a'` when B is the requester is non-trivial.
**Why it happens:** The block status encodes WHO blocked, not just that a block exists.
**How to avoid:** In `enterCode()` domain logic: before creating a new buddy row, query if any row exists with `(user_a=A, user_b=B) OR (user_a=B, user_b=A)` with any non-null status. If a row exists with `blocked_by_a` or `blocked_by_b`, check if the requesting user is the blocked party — if so, return `'blocked'` and do not create a new row.
**Warning signs:** A blocked user can reconnect by entering a new invite code.

### Pitfall 5: Tab Count Growth — CustomTabBar Needs Update
**What goes wrong:** Adding a 5th tab without updating `CustomTabBar.tsx` breaks icon routing — the `switch (routeName)` in `TabIcon` falls through to the `default` case, displaying wrong icon shape.
**Why it happens:** `TabIcon` has hard-coded `case` for each of the 4 current tabs.
**How to avoid:** Add `case 'buddies':` to `TabIcon` switch and add `'buddies': 'tabs.buddies'` to `routeLabels`. Also add i18n key `tabs.buddies` to translation files.
**Warning signs:** Buddy tab icon renders a plain square (the `default` case).

### Pitfall 6: 48-Hour Expiry Is Client-Side Only
**What goes wrong:** Invite code expiry is checked client-side only. A malicious client can submit an expired code directly to Supabase and create a buddy connection.
**Why it happens:** No server-side expiry enforcement.
**How to avoid:** In the Supabase `buddies` INSERT policy, add a CHECK that `invite_code IS NULL OR created_at > now() - interval '48 hours'`. Alternatively, use a Supabase Edge Function for code redemption (more robust but out of scope). For Phase 15, a Supabase RPC `redeem_invite_code(code text)` with SECURITY DEFINER that validates expiry is the safest approach.
**Warning signs:** Friend redeems an old code and it succeeds.

### Pitfall 7: Discoverability Default Must Be false
**What goes wrong:** Developer sets `DEFAULT true` on `is_discoverable` for testing convenience and forgets to change it.
**Why it happens:** Convenience during development.
**How to avoid:** D-11 is explicit: "Privacy-first: defaults to not discoverable if user skips." Both SQLite schema and Supabase SQL must use `DEFAULT false`. The onboarding prompt is the only affirmative path to `is_discoverable = true`.
**Warning signs:** Privacy Gate audit during verification flags default as true.

---

## Code Examples

### Share Sheet for Invite Code

```typescript
// Source: React Native Share API (built-in, no expo-sharing needed for text)
import { Share } from 'react-native';

async function shareInviteCode(code: string): Promise<void> {
  await Share.share({
    message: `Join me on HalalHabits! Enter my invite code: ${code}\n\nCode expires in 48 hours.`,
    title: 'Join HalalHabits',
  });
}
```

### Drizzle Dual-Owner Query

```typescript
// Source: drizzle-orm docs — or() operator
import { or, eq, and } from 'drizzle-orm';

async function getAccepted(userId: string): Promise<Buddy[]> {
  const db = getDb();
  return db.select().from(buddies).where(
    and(
      eq(buddies.status, 'accepted'),
      or(
        eq(buddies.userA, userId),
        eq(buddies.userB, userId),
      ),
    ),
  ) as Promise<Buddy[]>;
}
```

### Heartbeat Update

```typescript
// Source: @supabase/supabase-js v2 docs — update
async function updateHeartbeat(userId: string): Promise<void> {
  if (!supabaseConfigured) return;
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return;
  await supabase
    .from('users')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId);
}
```

### Debounced Search (inline — no lodash)

```typescript
// Pattern: useRef debounce, no external library
const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

function handleSearchChange(text: string) {
  setSearchQuery(text);
  if (searchTimeout.current) clearTimeout(searchTimeout.current);
  searchTimeout.current = setTimeout(() => {
    searchDiscoverableUsers(text.trim());
  }, 400); // 400ms debounce
}
```

### Supabase Discoverability Search

```typescript
// Source: @supabase/supabase-js v2 — ilike for case-insensitive search
async function searchDiscoverableUsers(query: string): Promise<PublicUserProfile[]> {
  if (!query || query.length < 2) return [];
  const { data, error } = await supabase
    .from('users')
    .select('id, display_name, current_level, total_xp, active_title_id')
    .eq('is_discoverable', true)
    .ilike('display_name', `%${query}%`)
    .limit(20);
  if (error) return [];
  return data ?? [];
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `expo-sharing` for all sharing | React Native built-in `Share.share()` for text/message sharing | Always available in RN | Simpler; no extra import for invite code text share |
| WebSocket presence for online status | Supabase Presence (Realtime) or simple heartbeat column | Supabase Realtime added ~2022 | Heartbeat is simpler and offline-first; Realtime is overkill for Phase 15 |
| Manual UUID generation | `expo-crypto` getRandomValues | expo-crypto has been stable for years | Cryptographically secure, already installed |

---

## Open Questions

1. **Where does `current_streak_count` come from for buddy profile?**
   - What we know: BUDY-06 requires streak count on buddy profile. `streaks` is PRIVATE and not synced to Supabase.
   - What's unclear: Should the `users` table get a `current_streak_count` denormalized column? Or is the requirement only XP + level (with "streak" being a soft/implied display)?
   - Recommendation: Add `current_streak_count integer NOT NULL DEFAULT 0` to `users` table. Update it in `habitStore` after any streak change, following the same pattern used to update `totalXp` and `currentLevel`. This is the only Privacy Gate-safe path. The planner MUST include this as a schema change task.

2. **Where does `is_discoverable` live in settings vs users?**
   - What we know: D-11 says "choice changeable in settings later." The `settings` table has a row per user but `is_discoverable` is better on `users` because it's publicly queryable on Supabase.
   - What's unclear: Should `is_discoverable` be on `users` (Supabase-queryable for search) or `settings` (already has the user preferences pattern)?
   - Recommendation: Put `is_discoverable` on the `users` table (not `settings`). The Supabase discoverability search queries `users`, not `settings`. The `settings` screen toggle updates the `users` row. This is cleaner and avoids a JOIN.

3. **Invite code: single-use or invalidated-on-use?**
   - What we know: BUDY-01 says "single-use." D-01 says "expires after 48 hours."
   - What's unclear: When code is redeemed, should the `invite_code` column be set to NULL (preventing re-use of the same code string)?
   - Recommendation: On successful redemption, set `invite_code = NULL` and `accepted_at = now()`. This prevents reuse without deleting the row.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Test runner | Yes | v24.13.0 | — |
| Jest (jest-expo) | Unit tests | Yes | 29.7.0 | — |
| expo-crypto | Invite code generation | Yes (installed) | ~15.0.8 | — |
| expo-sharing | Share sheet | Yes (installed) | ~14.0.8 | Use RN Share built-in (simpler) |
| @supabase/supabase-js | Discoverability search, heartbeat, profile read | Yes (installed) | ^2.99.2 | Offline-only mode (supabaseConfigured guard) |
| Supabase project | RLS enforcement, cloud sync | Not yet deployed (noted in STATE.md) | — | All sync paths guard with `supabaseConfigured` check |

**Missing dependencies with no fallback:**
- None blocking Phase 15 implementation. Supabase not being deployed is noted but all sync code already guards with `supabaseConfigured`.

**Missing dependencies with fallback:**
- Supabase project (not deployed): all Supabase calls are guarded by `if (!supabaseConfigured) return` — feature degrades gracefully to local-only mode.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 via jest-expo ~54.0.17 |
| Config file | package.json `"jest": { "preset": "jest-expo" }` (standard Expo setup) |
| Quick run command | `npm test -- --testPathPattern="buddy" --no-coverage` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUDY-01 | generateInviteCode() produces HH-XXXXX format; isInviteCodeExpired() returns true after 48h | unit | `npm test -- --testPathPattern="buddy-engine" --no-coverage` | No — Wave 0 |
| BUDY-01 | canSendRequest() returns false when pendingCount >= 10 | unit | `npm test -- --testPathPattern="buddy-engine" --no-coverage` | No — Wave 0 |
| BUDY-02 | buddyRepo.findByInviteCode() returns row; enterCode() handles expired/not_found/already_connected | unit | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | No — Wave 0 |
| BUDY-03 | searchDiscoverableUsers() only returns is_discoverable=true users | unit (mocked Supabase) | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | No — Wave 0 |
| BUDY-04 | updateStatus() transitions: pending→accepted, pending→deleted (decline), accepted→deleted (remove), accepted→blocked_by_a/b | unit | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | No — Wave 0 |
| BUDY-05 | getAccepted() dual-owner query returns rows where user is user_a OR user_b | unit | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | No — Wave 0 |
| BUDY-06 | Buddy profile data (XP, level, title) comes from users table only — no streaks/completions | unit (privacy invariant test) | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | No — Wave 0 |
| BUDY-07 | buddyRepo never imports assertSyncable without calling it; privacy guard present on writes | unit (source scan) | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="buddy" --no-coverage`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/domain/buddy-engine.test.ts` — covers BUDY-01 (code generation, expiry, rate limit)
- [ ] `__tests__/db/buddyRepo.test.ts` — covers BUDY-02, BUDY-03, BUDY-04, BUDY-05, BUDY-06, BUDY-07
- [ ] `__tests__/stores/buddyStore.test.ts` — covers store state transitions (load, accept, decline, block)

---

## Project Constraints (from CLAUDE.md)

- **UI/UX:** Must read and follow `ui-ux-pro-max` skill before proposing buddy screen layouts, card designs, or navigation patterns. The skill is at `.claude/skills/ui-ux-pro-max/SKILL.md`.
- **Adab Safety Rails:**
  - No public worship leaderboards → buddy profile must never show habit completion counts or salah logs
  - No iman/taqwa scoring → streak count on profile is "discipline score," not spiritual judgment
  - No shame copy → remove/block confirmations must use neutral, dignity-preserving copy
  - Privacy-first → discoverability defaults to false (D-11); all worship data stays device-only
- **Architecture constraints:**
  - Game engine / domain logic in pure TypeScript functions, no React imports (`buddy-engine.ts`)
  - Zustand domain-split stores (no persist middleware for buddyStore — SQLite is source of truth)
  - Privacy Gate: `assertSyncable('buddies')` must be called before any sync queue write
  - Supabase not yet deployed — all Supabase calls must guard with `supabaseConfigured` check
- **No new npm packages** (confirmed: all needed libraries already installed)

---

## Sources

### Primary (HIGH confidence)
- `src/db/schema.ts` — buddies table definition verified; all columns confirmed present
- `supabase/migrations/20260319_v2_rls.sql` — existing RLS policies for buddies, messages, shared_habits, duo_quests verified
- `supabase/migrations/20260317_rls.sql` — existing users SELECT policy verified (id = auth.uid() only — confirms the gap for buddy profile reads)
- `src/services/privacy-gate.ts` — PRIVACY_MAP confirmed: buddies=SYNCABLE, streaks=PRIVATE
- `src/db/repos/syncQueueRepo.ts` — enqueue() pattern confirmed for SYNCABLE repos
- `src/components/ui/CustomTabBar.tsx` — tab bar structure confirmed; needs buddies case added
- `app/(tabs)/_layout.tsx` — 4 tabs confirmed; buddies tab requires addition

### Secondary (MEDIUM confidence)
- React Native `Share.share()` API — built-in, stable across RN versions; simpler than expo-sharing for text messages
- `expo-crypto` `Crypto.getRandomValues()` — installed, standard API per expo-crypto docs pattern

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified as already installed in package.json
- Architecture: HIGH — repo/store/domain patterns verified against 6 existing stores and 12 existing repos
- RLS gap (users SELECT for buddy profiles): HIGH — verified by reading 20260317_rls.sql directly
- Streak count privacy pitfall: HIGH — verified by reading privacy-gate.ts (streaks=PRIVATE) and schema.ts
- Online presence approach: MEDIUM — heartbeat recommended over Supabase Realtime; Realtime would also work but is more complex

**Research date:** 2026-03-24
**Valid until:** 2026-05-01 (stable stack — no fast-moving dependencies)
