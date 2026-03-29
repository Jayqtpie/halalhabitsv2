# Phase 17: Messaging & Content Moderation - Research

**Researched:** 2026-03-29
**Domain:** 1:1 buddy messaging with dual-layer content moderation (client + server), offline queue, Supabase Realtime, report/block
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MSSG-01 | User can send and receive text messages with any connected buddy (1:1 only) | Messages table exists in schema.ts + Supabase schema; Supabase Realtime postgres_changes for live delivery; messageRepo + messageStore follow established buddy/duoQuest patterns |
| MSSG-02 | Messages are filtered server-side via Edge Function before database insertion | New Supabase Edge Function `moderate-message`; Deno runtime with custom word list; existing push Edge Function provides pattern |
| MSSG-03 | Client-side pre-filter blocks obvious profanity before sending (leo-profanity) | leo-profanity ^1.9.0 already installed; usage pattern established in CreateDuoQuestSheet.tsx (`filter.clean()` comparison) |
| MSSG-04 | Message history persists and is viewable per buddy conversation | SQLite messages table with idx_message_pair_created index; messageRepo.getByBuddyPair() ordered by createdAt ASC |
| MSSG-05 | User can report a message or block a buddy from the chat screen | Block already exists in buddyStore.blockBuddy(); report requires new message_reports table (schema addition); report action creates a Supabase row for admin review |
| MSSG-06 | Messages queued offline are sent automatically when connectivity is restored | Existing syncQueueRepo.enqueue() + sync-engine flushQueue() pattern; messages are SYNCABLE in privacy-gate.ts; NetInfo already used for connectivity detection |
</phase_requirements>

---

## Summary

Phase 17 builds 1:1 messaging between connected buddies with a dual-layer content moderation pipeline (client-side leo-profanity + server-side Edge Function). The entire infrastructure foundation is already in place: the `messages` table schema exists in both SQLite (`src/db/schema.ts` lines 275-286) and Supabase (`supabase/migrations/20260319_v2_schema.sql`), RLS policies are already written (`20260319_v2_rls.sql` lines 34-70), the privacy gate classifies messages as SYNCABLE, and leo-profanity ^1.9.0 is already installed with a working usage pattern in `CreateDuoQuestSheet.tsx`.

The main implementation work is: (1) building messageRepo following the duoQuestRepo SYNCABLE pattern, (2) building messageStore following the duoQuestStore pattern, (3) creating the chat screen UI, (4) writing a Supabase Edge Function for server-side moderation, (5) adding Supabase Realtime subscription for live message delivery, (6) adding report functionality (new schema table + Edge Function or Supabase insert), and (7) extending the existing block feature from buddyStore into the chat UI. The offline queue for messages piggybacks on the existing sync engine (`src/services/sync-engine.ts`) which already handles connectivity detection via NetInfo, retry logic, and queue flushing.

**Primary recommendation:** Build in 5 plans: (1) domain engine + profanity utilities, (2) messageRepo + schema additions, (3) messageStore + offline queue, (4) Edge Function for server-side moderation, (5) chat UI + Realtime subscription + report/block integration.

---

## Standard Stack

### Core (all already installed -- no new packages for messaging)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | ^0.45.1 | SQLite queries for messageRepo | Established pattern across 16 repos |
| expo-sqlite | ~16.0.10 | Local messages table persistence | Project-wide local DB |
| @supabase/supabase-js | ^2.99.2 | Realtime subscription + Edge Function invocation | Project sync/auth infrastructure |
| zustand | ^5.0.11 | messageStore state management | All domain stores use Zustand |
| leo-profanity | ^1.9.0 | Client-side profanity filter | Already installed; usage pattern in CreateDuoQuestSheet.tsx |
| @react-native-community/netinfo | ^11.4.1 | Connectivity detection for offline queue | Already used in sync-engine.ts |
| react-native | 0.81.5 | FlatList for message history, TextInput for composer | Base RN stack |
| expo-router | ~6.0.23 | Chat screen navigation | Established project navigation |

### New Package: NONE

Phase 17 requires zero new npm packages. leo-profanity is already installed and has an established usage pattern.

### Edge Function Runtime

| Tool | Version | Purpose |
|------|---------|---------|
| Deno (Supabase Edge Functions) | Supabase-managed | Server-side content moderation Edge Function |

**Installation:** No npm install step needed. Edge Function deployed via `supabase functions deploy`.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
  db/repos/
    messageRepo.ts           # SYNCABLE repo -- follows duoQuestRepo pattern
  domain/
    message-engine.ts        # Pure TS: profanity check, message validation, Islamic filter words
  stores/
    messageStore.ts          # Zustand store -- no persist, SQLite via repo
  components/
    chat/
      ChatScreen.tsx         # FlatList message list + composer bar
      MessageBubble.tsx      # Sent/received bubble styling
      ChatComposer.tsx       # TextInput + send button + profanity pre-check
      ReportMessageSheet.tsx # Modal for reporting a message
app/
  chat/
    [buddyPairId].tsx        # Chat screen route (push from buddy profile)
    _layout.tsx              # Stack layout for chat
supabase/
  functions/
    moderate-message/
      index.ts               # Deno Edge Function for server-side filtering
```

### Pattern 1: messageRepo -- SYNCABLE Repo (follows duoQuestRepo exactly)

```typescript
// Source: src/db/repos/duoQuestRepo.ts pattern
import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import { messages } from '../schema';
import { assertSyncable } from '../../services/privacy-gate';
import { syncQueueRepo } from './syncQueueRepo';
import { useAuthStore } from '../../stores/authStore';
import type { Message, NewMessage } from '../../types/database';

export const messageRepo = {
  async create(data: NewMessage): Promise<Message[]> {
    assertSyncable('messages');
    const db = getDb();
    const rows = await db.insert(messages).values(data).returning();
    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        await syncQueueRepo.enqueue('messages', rows[0].id, 'UPSERT', rows[0]);
      }
    } catch {
      console.warn('[messageRepo] sync enqueue failed on create');
    }
    return rows;
  },

  async getByBuddyPair(buddyPairId: string, limit = 50, offset = 0): Promise<Message[]> {
    const db = getDb();
    return db.select().from(messages)
      .where(eq(messages.buddyPairId, buddyPairId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async updateStatus(id: string, status: string): Promise<void> {
    assertSyncable('messages');
    const db = getDb();
    await db.update(messages).set({ status }).where(eq(messages.id, id));
    // No sync enqueue for status-only updates (delivered/read are local-only flags)
  },
};
```

### Pattern 2: messageStore -- Zustand (follows duoQuestStore pattern)

```typescript
// Source: src/stores/duoQuestStore.ts pattern
import { create } from 'zustand';

interface MessageState {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  activeBuddyPairId: string | null;

  loadMessages: (buddyPairId: string) => Promise<void>;
  sendMessage: (buddyPairId: string, senderId: string, content: string) => Promise<SendResult>;
  receiveMessage: (message: Message) => void; // called by Realtime listener
  reportMessage: (messageId: string, reason: string) => Promise<void>;
}
```

### Pattern 3: Dual-Layer Content Moderation Pipeline

**Flow:** User types message -> client-side leo-profanity check -> if clean, write to local SQLite with status='pending' -> sync engine sends to Supabase -> Edge Function intercepts INSERT (or: client calls Edge Function directly) -> Edge Function checks against server word list -> if clean, INSERT proceeds -> if rejected, return error + update local status to 'filtered'.

**Recommended approach:** The client calls the Edge Function directly (not via direct INSERT). This gives synchronous feedback to the sender:

```
User types "hello"
  -> leo-profanity.clean("hello") === "hello" (pass)
  -> Call Edge Function: POST /functions/v1/moderate-message { buddyPairId, content }
  -> Edge Function checks content against server blocklist
  -> If pass: Edge Function inserts into messages table + returns { ok: true, id }
  -> If fail: Edge Function returns { ok: false, reason: 'content_filtered' }
  -> Client: if ok, write to local SQLite (optimistic or confirmed)
  -> Client: if fail, show error toast
```

This is better than direct INSERT + trigger because:
1. Rejected messages are never stored in Supabase (MSSG-02: "never stored")
2. Synchronous feedback to sender (MSSG-02: "surfaces an error to the sender")
3. Edge Function can use SERVICE_ROLE_KEY to bypass RLS for the insert

### Pattern 4: Supabase Realtime for Live Message Delivery

```typescript
// Source: Supabase docs -- postgres_changes with filter
import { supabase, supabaseConfigured } from '../lib/supabase';

function subscribeToMessages(buddyPairId: string, onNewMessage: (msg: Message) => void) {
  if (!supabaseConfigured) return null;

  const channel = supabase
    .channel(`messages:${buddyPairId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `buddy_pair_id=eq.${buddyPairId}`,
      },
      (payload) => {
        onNewMessage(payload.new as Message);
      },
    )
    .subscribe();

  return channel; // caller must unsubscribe on unmount
}
```

**Key details:**
- Filter by `buddy_pair_id` so only messages for the active conversation arrive
- RLS policies already enforce that only buddy pair members can see messages
- Channel name includes buddyPairId for uniqueness
- Unsubscribe on screen unmount to avoid memory leaks
- Falls back gracefully when `supabaseConfigured` is false (offline-only mode)

### Pattern 5: Offline Message Queue

Messages composed offline follow the existing sync engine pattern:

1. Write message to local SQLite with `status = 'queued'`
2. `syncQueueRepo.enqueue('messages', id, 'UPSERT', payload)` queues for sync
3. When online, `flushQueue()` processes pending items in createdAt order (MSSG-06: "in order")
4. **BUT**: If using the Edge Function approach (Pattern 3), offline messages need a different flow:
   - Write to local SQLite with `status = 'queued'`
   - On reconnect, instead of sync engine upsert, call the Edge Function for each queued message
   - This ensures server-side moderation still applies to offline-composed messages

**Recommended:** Use a dedicated `messageQueue` flush function (not the generic sync engine) that calls the Edge Function per message. This keeps moderation in the critical path even for offline messages.

### Pattern 6: Client-Side Profanity Filter (leo-profanity)

Existing pattern from `src/components/activities/CreateDuoQuestSheet.tsx`:

```typescript
import filter from 'leo-profanity';

// Check if text contains profanity
if (filter.clean(text) !== text) {
  // Block -- show error
  Alert.alert('Language Filter', 'Please use appropriate language.');
  return;
}
```

**For messaging, extend with Islamic context words:**

```typescript
// In message-engine.ts or a shared profanity-utils.ts
import filter from 'leo-profanity';

// Add custom Islamic-context blocklist (hand-curated per project decision)
const ISLAMIC_BLOCKLIST: string[] = [
  // Blasphemous terms, mockery of religious figures, etc.
  // This must be hand-curated -- no open-source Islamic profanity list exists
];

let initialized = false;

export function initProfanityFilter(): void {
  if (initialized) return;
  filter.add(ISLAMIC_BLOCKLIST);
  initialized = true;
}

export function isClean(text: string): boolean {
  initProfanityFilter();
  return filter.clean(text) === text;
}

export function cleanText(text: string): string {
  initProfanityFilter();
  return filter.clean(text);
}
```

### Pattern 7: Report/Block from Chat Screen

**Block:** Already fully implemented in `buddyStore.blockBuddy()`. The chat screen just needs to call it and navigate back to buddy list.

**Report:** New functionality. A message report writes a row to a new `message_reports` table (or directly to Supabase via Edge Function). Reports are for admin review -- the app does not auto-moderate based on reports.

```typescript
// Report a message
export const messageRepo = {
  // ... existing methods ...

  async reportMessage(messageId: string, reporterId: string, reason: string): Promise<void> {
    if (!supabaseConfigured) return; // reports only work online
    await supabase.from('message_reports').insert({
      id: generateId(),
      message_id: messageId,
      reporter_id: reporterId,
      reason,
      created_at: new Date().toISOString(),
    });
  },
};
```

### Anti-Patterns to Avoid

- **Do not use Supabase Realtime Broadcast for messaging.** Use `postgres_changes` on the messages table -- it provides delivery guarantees tied to actual database state, not ephemeral broadcast.
- **Do not skip server-side moderation for offline messages.** When flushing offline queue, route through the Edge Function, not direct Supabase INSERT. Otherwise offline-composed messages bypass MSSG-02.
- **Do not store rejected messages in the database.** MSSG-02 explicitly says "a rejected message is never stored." The Edge Function must reject before insert.
- **Do not add `flex: 1` to modal children** (project memory: `feedback_flex1_layout.md`).
- **Do not expose worship data through messages.** The message content is user-typed text -- the concern here is about preventing the *system* from leaking worship data in any automated message or notification copy.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Profanity detection | Custom regex wordlist | leo-profanity `filter.clean()` | Already installed, Shutterstock dictionary, customizable |
| Offline queue ordering | Custom queue table | Existing `syncQueueRepo` + `sync-engine.ts` | Already handles retry, ordering, connectivity detection |
| Connectivity detection | Custom network polling | `@react-native-community/netinfo` | Already used in sync-engine.ts |
| Message list virtualization | Custom scroll handler | React Native `FlatList` with `inverted` prop | Standard pattern for chat UIs |
| Real-time delivery | WebSocket from scratch | Supabase Realtime `postgres_changes` | Already configured in project; RLS provides auth |
| Block functionality | New block system | Existing `buddyStore.blockBuddy()` | Phase 15 already built complete block lifecycle |

---

## Common Pitfalls

### Pitfall 1: Inverted FlatList Scroll Direction
**What goes wrong:** Chat messages render top-to-bottom but newest messages should appear at the bottom (standard chat UX). Developer manually manages scroll position.
**Why it happens:** Default FlatList renders data[0] at the top.
**How to avoid:** Use `<FlatList inverted />` which renders data[0] at the bottom. Store messages in descending order (newest first) from the repo, and FlatList inverted will display them correctly (newest at bottom, scroll up for older).
**Warning signs:** Messages appear in wrong order or user must manually scroll down to see latest.

### Pitfall 2: Offline Messages Bypass Server Moderation
**What goes wrong:** Messages queued offline go through the generic sync engine `flushQueue()` which does a direct Supabase UPSERT -- bypassing the Edge Function content filter.
**Why it happens:** The sync engine is designed for generic table upserts, not moderated inserts.
**How to avoid:** Create a dedicated message flush function that calls the Edge Function instead of direct upsert. The sync engine should skip `messages` entityType, or messages should use a separate queue mechanism.
**Warning signs:** Profane messages composed offline appear in the conversation after reconnect.

### Pitfall 3: Realtime Subscription Memory Leak
**What goes wrong:** Supabase channel is subscribed on mount but not unsubscribed on unmount. Multiple subscriptions accumulate, causing duplicate message delivery and memory leaks.
**Why it happens:** Missing cleanup in useEffect.
**How to avoid:** Return a cleanup function from useEffect that calls `supabase.removeChannel(channel)`. Track channel reference in a ref.
**Warning signs:** After navigating between chats multiple times, the same message appears 2+ times.

### Pitfall 4: Edge Function INSERT Bypasses RLS
**What goes wrong:** Edge Function uses SERVICE_ROLE_KEY to insert messages, which bypasses RLS. A malicious request could insert messages into any buddy pair.
**Why it happens:** SERVICE_ROLE_KEY bypasses all RLS policies.
**How to avoid:** The Edge Function must validate the JWT from the Authorization header, extract the user ID, verify the user is a member of the buddy pair, then insert. Never trust client-supplied sender_id without JWT verification.
**Warning signs:** Messages can be inserted into conversations the sender is not part of.

### Pitfall 5: Message Status Conflicts Between Local and Remote
**What goes wrong:** Local SQLite has message status='queued', Supabase has status='sent' after Edge Function insert. If the sync engine later processes a stale queue item, it could overwrite the Supabase status back to 'queued'.
**Why it happens:** Two write paths (Edge Function + sync engine) updating the same row.
**How to avoid:** After the Edge Function successfully inserts, update local SQLite status to 'sent' immediately. Remove the sync queue entry for that message (or mark it synced). Do not let the generic sync engine also process messages.
**Warning signs:** Messages flip between 'sent' and 'queued' status.

### Pitfall 6: Islamic Blocklist Maintenance
**What goes wrong:** The Islamic-context blocklist is incomplete or overly broad, either missing offensive terms or blocking legitimate Islamic vocabulary.
**Why it happens:** No open-source Islamic profanity list exists (per project decision). Must be hand-curated.
**How to avoid:** Start with a minimal, high-confidence blocklist (clearly blasphemous terms only). Ship conservative -- it's better to miss edge cases than to false-positive on legitimate religious discussion. The server-side list can be updated independently of app releases.
**Warning signs:** Users report being unable to discuss Islamic topics normally, or clearly offensive content passes through.

---

## Code Examples

### leo-profanity Usage (verified from existing codebase)

```typescript
// Source: src/components/activities/CreateDuoQuestSheet.tsx line 27, 112
import filter from 'leo-profanity';

// Check if text is clean (no profanity detected)
const isClean = filter.clean(text) === text;

// Add custom words to the dictionary
filter.add(['word1', 'word2']);

// Remove words from dictionary (whitelist)
// filter.removeWhitelist is not the right API -- use filter.remove(['word'])
```

### Supabase Realtime postgres_changes Subscription

```typescript
// Source: Supabase official docs -- postgres_changes with filter
const channel = supabase
  .channel(`chat:${buddyPairId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `buddy_pair_id=eq.${buddyPairId}`,
    },
    (payload) => {
      const newMessage = payload.new;
      // Add to local state + SQLite cache
    },
  )
  .subscribe();

// Cleanup on unmount
return () => {
  supabase.removeChannel(channel);
};
```

### Supabase Edge Function Pattern (from existing push function)

```typescript
// Source: supabase/functions/push/index.ts pattern
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    // 1. Verify JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    // ... extract and verify JWT to get sender_id

    const { buddyPairId, content } = await req.json();

    // 2. Check content against server-side blocklist
    if (containsProfanity(content)) {
      return new Response(
        JSON.stringify({ ok: false, reason: 'content_filtered' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // 3. Verify sender is member of buddy pair
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 4. Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        id: crypto.randomUUID(),
        buddy_pair_id: buddyPairId,
        sender_id: senderId,
        content,
        status: 'sent',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ ok: true, message: data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
```

### Sync Engine Offline Queue (existing pattern)

```typescript
// Source: src/services/sync-engine.ts -- flushQueue pattern
// Messages use the same syncQueueRepo.enqueue() call
// BUT: offline messages should flush through Edge Function, not direct upsert
// See Pitfall #2 for the correct offline flush approach
```

---

## Schema Additions Required

### Existing: messages table (already defined)

```typescript
// Source: src/db/schema.ts lines 275-286 -- ALREADY EXISTS
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  buddyPairId: text('buddy_pair_id').notNull().references(() => buddies.id),
  senderId: text('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  status: text('status').notNull().default('sent'),
  createdAt: text('created_at').notNull(),
  syncedAt: text('synced_at'),
}, (table) => ([
  index('idx_message_pair_created').on(table.buddyPairId, table.createdAt),
  index('idx_message_sender').on(table.senderId),
]));
```

### New: message_reports table (for MSSG-05 report functionality)

```typescript
// NEW -- add to src/db/schema.ts
export const messageReports = sqliteTable('message_reports', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => messages.id),
  reporterId: text('reporter_id').notNull().references(() => users.id),
  reason: text('reason').notNull(),
  createdAt: text('created_at').notNull(),
});
```

**Privacy classification:** SYNCABLE -- reports must reach Supabase for admin review.

**Supabase migration:**
```sql
CREATE TABLE IF NOT EXISTS public.message_reports (
  id text PRIMARY KEY,
  message_id text NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reporter_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at text NOT NULL
);

-- RLS: user can only insert reports for messages in their buddy pairs
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Message Reports: insert own reports" ON public.message_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid())::text = reporter_id
    AND EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.buddies b ON b.id = m.buddy_pair_id
      WHERE m.id = message_id
        AND (
          (select auth.uid())::text = b.user_a OR
          (select auth.uid())::text = b.user_b
        )
    )
  );
```

### Privacy Gate Update

```typescript
// Add to PRIVACY_MAP in src/services/privacy-gate.ts
message_reports: 'SYNCABLE',  // reports must reach admin via Supabase
```

---

## Content Moderation Approach

### Layer 1: Client-Side (leo-profanity)

- **When:** Before any message leaves the device
- **Library:** leo-profanity ^1.9.0 (already installed)
- **Dictionary:** Default Shutterstock dictionary + custom Islamic-context words
- **Action on match:** Block send, show inline error ("Please use appropriate language")
- **Bypass risk:** A modified client could skip this check -- that's why Layer 2 exists

### Layer 2: Server-Side (Edge Function)

- **When:** Before message is inserted into the Supabase messages table
- **Runtime:** Deno (Supabase Edge Functions)
- **Dictionary:** Separate server-side word list (can be updated without app release)
- **Action on match:** Return `{ ok: false, reason: 'content_filtered' }` -- message is never stored
- **Verification:** JWT validation ensures sender identity; buddy pair membership check ensures authorization

### Islamic Content Blocklist Strategy

Per project decision: "Islamic content blocklist must be hand-curated (no open-source list exists)."

**Categories to include (HIGH confidence these should be filtered):**
1. Direct blasphemy / mockery of Allah, Prophet Muhammad (PBUH), other prophets
2. Mockery of Islamic practices (salah, fasting, hijab)
3. Slurs targeting Muslims

**Categories to NOT filter (would cause false positives):**
1. Standard Islamic vocabulary (mashallah, inshallah, subhanallah, etc.)
2. Names of Islamic figures used in normal conversation
3. Discussion of religious concepts (halal, haram, etc.)

**Implementation:** Start with a minimal blocklist (10-20 high-confidence terms). Both client and server share the same base list, but the server list can be extended independently. The list lives in a separate file (`src/domain/islamic-blocklist.ts` for client, inline in Edge Function for server).

---

## Offline Queue Strategy

### Message Flow: Online

```
User types message
  -> Client profanity check (leo-profanity)
  -> Call Edge Function (HTTP POST)
  -> Edge Function: server check + INSERT
  -> Response: { ok: true, message }
  -> Update local SQLite: insert with status='sent'
  -> Supabase Realtime delivers to buddy
```

### Message Flow: Offline

```
User types message
  -> Client profanity check (leo-profanity) -- works offline
  -> NetInfo says offline
  -> Write to local SQLite with status='queued'
  -> Show in chat UI with "pending" indicator
  -> (later) NetInfo detects online
  -> Flush: for each queued message, call Edge Function
  -> If Edge Function accepts: update local status='sent'
  -> If Edge Function rejects: update local status='filtered', show error
```

### Key Design Decision: Separate Message Flush (not generic sync engine)

The generic `flushQueue()` in sync-engine.ts does direct Supabase UPSERT. Messages need to go through the Edge Function. Two options:

**Option A (Recommended):** Messages use their own flush function that calls the Edge Function. The generic sync engine skips `messages` entityType. This keeps moderation in the critical path.

**Option B:** Messages still enqueue to syncQueue but a custom handler intercepts them during flush. More complex, breaks the clean sync engine pattern.

---

## Report/Block Integration

### Block (already exists)

- `buddyStore.blockBuddy(buddyId, currentUserId, buddy)` -- writes `blocked_by_a` or `blocked_by_b`
- Chat screen adds a "Block" option in the message long-press menu or header three-dot menu
- After blocking: navigate back to buddy list, buddy disappears (D-04 from Phase 15)
- All messages from blocked buddy remain in local SQLite but conversation is inaccessible

### Report (new)

- User long-presses a message -> "Report" option
- Report modal: select reason (dropdown: "Inappropriate language", "Harassment", "Spam", "Other") + optional note
- Submit creates a row in `message_reports` (Supabase via direct insert or sync queue)
- Confirmation: "Report submitted. Thank you for helping keep our community safe."
- No immediate action on the reported message -- reports are for admin review
- The reporter can also block the buddy in the same flow (optional, not automatic)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Supabase Realtime v1 (server-side listeners) | Supabase Realtime v2 (client-side `postgres_changes` filter) | 2023 | Filter-by-column reduces noise; RLS enforces security |
| Direct INSERT + DB trigger for moderation | Edge Function as gateway (insert gatekeeper) | Standard pattern | Rejected messages never touch DB; synchronous feedback |
| Single profanity filter | Dual-layer (client + server) | Best practice | Client for UX speed; server for security |

---

## Open Questions

1. **Edge Function invocation from React Native when offline-first**
   - What we know: The Edge Function approach is ideal for moderation (reject before store). Offline messages need to be routed through it on reconnect.
   - What's unclear: Should the Edge Function be called via `supabase.functions.invoke('moderate-message', ...)` or a raw `fetch()` call? The `supabase-js` client has a built-in `functions.invoke()` method.
   - Recommendation: Use `supabase.functions.invoke()` -- it handles auth headers automatically.

2. **Message pagination / infinite scroll**
   - What we know: MSSG-04 requires full conversation history to be viewable.
   - What's unclear: How many messages to load initially and how to paginate.
   - Recommendation: Load 50 messages initially, paginate on scroll-to-top (FlatList `onEndReached` with `inverted` means scroll-to-top fires `onEndReached`). The `messageRepo.getByBuddyPair(id, limit, offset)` already supports this.

3. **Realtime fallback when Supabase is not configured**
   - What we know: `supabaseConfigured` can be false (offline-only mode). Realtime won't work.
   - What's unclear: How does the buddy receive messages in offline-only mode?
   - Recommendation: In offline-only mode, messages sync when both users run `flushQueue()`. No real-time delivery -- the chat screen shows a "Messages sync when you're online" notice. This is acceptable for the offline-first architecture.

4. **Should message_reports also be stored locally in SQLite?**
   - What we know: Reports are SYNCABLE and need to reach Supabase.
   - What's unclear: Is local SQLite storage needed, or can reports go directly to Supabase?
   - Recommendation: Store locally + enqueue for sync. This follows the existing pattern and ensures reports aren't lost if submitted during a brief connectivity gap. Add `message_reports` to PRIVACY_MAP as SYNCABLE.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Test runner | Yes | v24.13.0 | -- |
| Jest (jest-expo) | Unit tests | Yes | 29.7.0 | -- |
| leo-profanity | Client profanity filter | Yes (installed) | ^1.9.0 | -- |
| @supabase/supabase-js | Realtime + Edge Function | Yes (installed) | ^2.99.2 | Offline-only mode |
| @react-native-community/netinfo | Connectivity detection | Yes (installed) | ^11.4.1 | -- |
| Supabase project | Edge Function hosting, Realtime | Not yet deployed | -- | All Supabase calls guarded by `supabaseConfigured` |
| Supabase CLI | Edge Function deployment | Needs verification | -- | Deploy via Supabase Dashboard |

**Missing dependencies with no fallback:**
- None blocking Phase 17 implementation. All Supabase features degrade gracefully.

**Missing dependencies with fallback:**
- Supabase project (not deployed): Edge Function and Realtime won't work. Messages still work offline via SQLite. Moderation falls back to client-side only. Reports queue locally.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 via jest-expo ~54.0.17 |
| Config file | package.json `"jest": { "preset": "jest-expo" }` |
| Quick run command | `npm test -- --testPathPattern="message" --no-coverage` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MSSG-01 | messageRepo.create() inserts to SQLite + enqueues sync | unit | `npm test -- --testPathPattern="messageRepo" --no-coverage` | No -- Wave 0 |
| MSSG-02 | Edge Function rejects profane content (server-side) | unit (mock Edge Function logic) | `npm test -- --testPathPattern="message-engine" --no-coverage` | No -- Wave 0 |
| MSSG-03 | isClean() detects profanity; filter.add() accepts custom words | unit | `npm test -- --testPathPattern="message-engine" --no-coverage` | No -- Wave 0 |
| MSSG-04 | messageRepo.getByBuddyPair() returns messages ordered by createdAt | unit | `npm test -- --testPathPattern="messageRepo" --no-coverage` | No -- Wave 0 |
| MSSG-05 | reportMessage creates report row; blockBuddy transitions status | unit | `npm test -- --testPathPattern="messageRepo\|messageStore" --no-coverage` | No -- Wave 0 |
| MSSG-06 | Queued messages flush in createdAt order; status transitions queued->sent | unit | `npm test -- --testPathPattern="messageStore" --no-coverage` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="message" --no-coverage`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/domain/message-engine.test.ts` -- covers MSSG-02, MSSG-03 (profanity check, Islamic blocklist, message validation)
- [ ] `__tests__/db/messageRepo.test.ts` -- covers MSSG-01, MSSG-04, MSSG-05 (CRUD, ordering, report creation)
- [ ] `__tests__/stores/messageStore.test.ts` -- covers MSSG-01, MSSG-05, MSSG-06 (send, receive, queue flush, report, block)

---

## Recommended Plan Breakdown

| Plan | Scope | Dependencies |
|------|-------|--------------|
| **17-01** | Domain engine (message-engine.ts): profanity utilities, Islamic blocklist, message validation, text length limits + tests | None |
| **17-02** | Schema additions (message_reports table) + messageRepo + privacy gate update + tests | 17-01 |
| **17-03** | messageStore (Zustand) + offline queue + flush logic + tests | 17-02 |
| **17-04** | Edge Function (moderate-message) + Supabase migration for message_reports | 17-01 |
| **17-05** | Chat UI + Realtime subscription + report/block integration | 17-03, 17-04 |

---

## Project Constraints (from CLAUDE.md)

- **UI/UX:** Must read and follow `ui-ux-pro-max` skill before designing chat screen, message bubbles, composer bar, report modal.
- **Adab Safety Rails:**
  - Privacy-first: message content is user-typed text; system must never auto-populate worship data into messages
  - Religious copy must be reverent: error messages for filtered content should be gentle ("Please use appropriate language"), not accusatory
  - No shame-based UX: filtered message feedback should not shame the user
  - No addiction dark patterns: no read receipts, no typing indicators, no pressure to respond quickly
- **Architecture constraints:**
  - Domain engine (message-engine.ts) must be pure TypeScript, no React imports
  - Zustand store without persist middleware (SQLite is source of truth)
  - Privacy Gate: `assertSyncable('messages')` on all writes; add `message_reports` to PRIVACY_MAP
  - Supabase not yet deployed: all Supabase calls guarded by `supabaseConfigured`
  - Only 1 new npm package allowed: leo-profanity (already installed, so effectively 0 new packages)
- **Existing code to leverage:**
  - leo-profanity pattern from CreateDuoQuestSheet.tsx
  - duoQuestRepo pattern for SYNCABLE repo
  - duoQuestStore pattern for Zustand store
  - push Edge Function pattern for Deno function structure
  - sync-engine.ts for offline queue flushing
  - buddyStore.blockBuddy() for block functionality

---

## Sources

### Primary (HIGH confidence)
- `src/db/schema.ts` lines 275-286 -- messages table definition verified with all columns and indexes
- `supabase/migrations/20260319_v2_schema.sql` -- Supabase messages table definition verified
- `supabase/migrations/20260319_v2_rls.sql` lines 34-70 -- Messages RLS policies verified (SELECT, INSERT, UPDATE, DELETE)
- `src/services/privacy-gate.ts` -- messages classified as SYNCABLE verified
- `src/db/repos/duoQuestRepo.ts` -- SYNCABLE repo pattern verified (assertSyncable + syncQueueRepo.enqueue)
- `src/stores/duoQuestStore.ts` -- Zustand store pattern verified (no persist, SQLite-backed)
- `src/components/activities/CreateDuoQuestSheet.tsx` -- leo-profanity usage pattern verified (`filter.clean()`)
- `src/services/sync-engine.ts` -- Offline queue flush pattern verified (NetInfo + syncQueueRepo)
- `src/stores/buddyStore.ts` -- blockBuddy() implementation verified
- `supabase/functions/push/index.ts` -- Edge Function pattern verified (Deno.serve, createClient, SERVICE_ROLE_KEY)
- `package.json` -- leo-profanity ^1.9.0 confirmed installed

### Secondary (MEDIUM confidence)
- [Supabase Realtime postgres_changes docs](https://supabase.com/docs/guides/realtime/postgres-changes) -- filter syntax for buddy_pair_id column
- [leo-profanity npm](https://www.npmjs.com/package/leo-profanity) -- filter.add(), filter.clean() API
- [Supabase Edge Functions docs](https://supabase.com/docs/guides/functions) -- Deno runtime, JWT verification, functions.invoke()

### Tertiary (LOW confidence)
- Islamic content blocklist categories -- based on general knowledge; no authoritative open-source list exists. Must be hand-curated by project maintainer.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified as already installed in package.json
- Architecture: HIGH -- repo/store/domain patterns verified against existing duoQuest/buddy implementations
- Schema: HIGH -- messages table already exists in both SQLite and Supabase; RLS already written
- Content moderation approach: HIGH -- dual-layer (client + server) is standard; Edge Function pattern exists in project
- Offline queue: MEDIUM -- dedicated message flush (not generic sync engine) is the right approach but adds complexity
- Islamic blocklist: LOW -- must be hand-curated; no validated source exists

**Research date:** 2026-03-29
**Valid until:** 2026-05-01 (stable stack -- no fast-moving dependencies)
