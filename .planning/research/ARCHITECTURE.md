# Architecture Patterns

**Domain:** Social & Battle Systems integration into offline-first Islamic habit app
**Researched:** 2026-03-19
**Confidence:** HIGH (existing codebase verified, Supabase Realtime docs verified, integration patterns confirmed)

---

## Context: What Already Exists

The v1.0 codebase has a well-established three-layer architecture:

```
Domain (pure TS functions)  →  Stores (Zustand)  →  Repos (Drizzle/SQLite)
                                                             ↓
                                               Sync Queue → Supabase
```

Key architectural invariants that MUST be preserved:
- Privacy Gate: `assertSyncable()` is the only path to sync queue writes. All 13 existing entities have explicit classifications. New tables require explicit classification before they can be touched.
- Pure domain functions: `xp-engine.ts`, `quest-engine.ts`, `streak-engine.ts` have no React imports. New game engines must follow the same pattern.
- Repository pattern: stores never touch Drizzle directly — they call repos. New stores must follow this.
- SQLite is source of truth. Supabase is a backup/sync target, not the primary read path.

---

## Recommended Architecture for v2.0 Features

### Overview: Four New Subsystems

```
┌─────────────────────────────────────────────────────────────────┐
│  EXISTING (unchanged)                                           │
│  habitStore → habitRepo → SQLite → syncQueue → Supabase        │
│  gameStore  → xpRepo, questRepo → SQLite                       │
└────────────────────────────────┬────────────────────────────────┘
                                 │ extends
┌────────────────────────────────▼────────────────────────────────┐
│  NEW SUBSYSTEM A: Social / Buddy                                │
│  socialStore → buddyRepo, messageRepo → SQLite                  │
│               (when online)                                     │
│  Supabase: buddies table (SYNCABLE) + Realtime channel          │
│  Edge Function: message-filter (content moderation before DB)   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  NEW SUBSYSTEM B: Boss Arena                                    │
│  bossStore → bossRepo → SQLite (PRIVATE — personal struggle)   │
│  boss-engine.ts (pure TS state machine, no React)              │
│  No sync to Supabase — boss battles are personal, not social   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  NEW SUBSYSTEM C: Dopamine Detox Dungeon                        │
│  detoxStore → detoxRepo → SQLite (LOCAL_ONLY, no sync)         │
│  detox-engine.ts (pure TS timer state machine)                 │
│  Timer: AppState start_timestamp stored locally; elapsed        │
│         recalculated on foreground, no background process      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  NEW SUBSYSTEM D: Friday Power-Ups                              │
│  friday-engine.ts (pure TS, extends xp-engine multiplier)      │
│  Integrates with gameStore.awardXP() — no new store needed     │
│  Friday detection: JS Date.getDay() + adhan-js timezone         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `buddy-engine.ts` | Invite code generation, connection limits (max 20), duo quest eligibility rules | `socialStore` |
| `message-filter` (Edge Function) | Server-side content moderation before DB insert; blocks inappropriate content | Supabase `messages` table |
| `boss-engine.ts` | Boss state machine (IDLE → ENGAGED → ATTACKED → FLED/DEFEATED), damage calculation, phase transitions | `bossStore` |
| `detox-engine.ts` | Challenge duration validation (2-8hr), completion criteria, XP awards | `detoxStore` |
| `friday-engine.ts` | Friday detection (local timezone via settings), multiplier injection (2x), Al-Kahf challenge gate | `gameStore.awardXP()` |
| `socialStore` | Buddy list state, pending invites, connection requests, shared quest state | `buddyRepo`, `messageRepo`, Supabase Realtime |
| `bossStore` | Active boss battle state, cooldown tracking, defeat history | `bossRepo` |
| `detoxStore` | Active challenge state, start_timestamp, pause state | `detoxRepo` |
| `buddyRepo` | CRUD for `buddies`, `shared_habits`, `duo_quests` tables | SQLite (Drizzle) |
| `messageRepo` | CRUD for local `messages` cache table | SQLite (Drizzle) |
| `bossRepo` | CRUD for `boss_battles` table | SQLite (Drizzle) |
| `detoxRepo` | CRUD for `detox_sessions` table | SQLite (Drizzle) |

---

## Data Flow: Social / Buddy System

### Connection Flow (Invite Codes)
```
User A generates invite code
  → stored in Supabase buddies table with status='pending' + code + TTL
  → User B enters code → Edge Function validates TTL + uniqueness
  → buddies row updated to status='accepted', both directions inserted
  → sync flushes to both users' SQLite caches
```

**RLS Policy Pattern (Supabase):**
```sql
-- buddies table: users can only see rows where they are requester or recipient
CREATE POLICY "buddies_select" ON buddies
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = recipient_id
  );

-- messages table: users can only see messages in channels where they are a buddy
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM buddies
      WHERE status = 'accepted'
        AND ((requester_id = auth.uid() AND recipient_id = messages.recipient_id)
          OR (recipient_id = auth.uid() AND requester_id = messages.sender_id))
    )
  );
```

### Messaging Flow (Online Path)
```
User types message
  → socialStore.sendMessage() called
  → Edge Function: message-filter validates content (bad-words library + Islamic content rules)
  → if clean: insert into Supabase messages table
  → Supabase Realtime fires on private channel messages:{lower_uid}:{higher_uid}
  → recipient's app receives via Realtime subscription
  → messageRepo.insert() caches locally
  → socialStore state update (both sender optimistic + recipient delivery)
```

### Messaging Flow (Offline Path)
```
User types message while offline
  → message stored in local messageRepo with status='pending_send'
  → when connectivity restored: flushQueue() picks up pending messages
  → Edge Function validates before DB insert (moderation still runs server-side)
  → on success: local message status updated to 'sent'
```

**Privacy classification for new social tables:**
```typescript
// Addition to PRIVACY_MAP in privacy-gate.ts
buddies: 'SYNCABLE',          // connection graph — profile data, not worship
messages: 'SYNCABLE',         // buddy chat — no worship content allowed by design
duo_quests: 'SYNCABLE',       // shared game state, not worship data
shared_habits: 'SYNCABLE',    // habit metadata visibility, not completion data
boss_battles: 'PRIVATE',      // personal struggle data, spiritually sensitive
detox_sessions: 'LOCAL_ONLY', // ephemeral timer, no cloud value
```

---

## Data Flow: Boss Arena State Machine

Boss battles are **PRIVATE** (revealing which nafs archetype a user battles is spiritually sensitive). They never leave the device.

```
boss-engine.ts (pure TS) — no XState dependency needed
  States: IDLE | COOLDOWN | ENGAGED | FLED | DEFEATED

IDLE
  → player triggers battle (Level 10+ gate checked by engine)
  → select boss archetype from 5 types
  → generate battle_id, set hp = calculateBossHP(archetype, playerLevel)
  → state: ENGAGED

ENGAGED (multi-day)
  → each habit completion calls boss-engine.processDamage(habitType, bossArchetype)
  → damage varies by archetype relevance
    (dhikr does more damage to Waswasa boss, fasting to Shumukh, etc.)
  → if boss.hp <= 0: state DEFEATED, XP reward calculated
  → if player misses X consecutive days: state FLED (boss retreats)
  → Cooldown after defeat or flight before new battle allowed

DEFEATED / FLED
  → bossStore saves outcome to bossRepo
  → gameStore.awardXP() called with source_type='boss_victory'
  → bossRepo.recordHistory() stores archetype, duration, outcome
  → state: COOLDOWN → IDLE after cooldown_ends_at
```

**No XState dependency.** The existing pattern uses plain TypeScript discriminated unions and pure functions. Boss engine follows the `streak-engine.ts` pattern: receive state, return new state. XState adds unnecessary complexity and bundle size for this use case.

```typescript
// Pattern: pure function, matches existing domain style
export function processBossDamage(
  state: BossState,
  event: BossEvent
): BossState { ... }
```

---

## Data Flow: Dopamine Detox Dungeon

Detox sessions are ephemeral and **LOCAL_ONLY**. The key architectural decision: store `start_timestamp`, not a running counter.

```
detox-engine.ts (pure TS)
  validateChallengeDuration(hours: number): boolean    // 2-8hr range
  calculateElapsed(startTimestamp: string, now: string): number
  isComplete(startTimestamp: string, durationHours: number, now: string): boolean
  calculateXPReward(durationHours: number, variant: 'daily' | 'deep'): number

detoxStore
  active: DetoxSession | null
  startChallenge(durationHours, variant)
    → detoxRepo.insert({ start_timestamp, duration_hours, status: 'active' })
  checkCompletion()
    → detox-engine.isComplete() → if complete: awardXP + detoxRepo.update(status='complete')
  abandonChallenge()
    → detoxRepo.update(status='abandoned')

Timer persistence pattern (AppState approach):
  - Store start_timestamp (ISO string) in SQLite on challenge start — one write
  - On app foreground: calculateElapsed(start_timestamp, Date.now())
  - No background process — user sees elapsed time only when app is open
  - If app is killed and reopened: recalculate elapsed from persisted timestamp
  - OS minimum for background tasks is 15 minutes — unsuitable for this use case
```

**No notifications during detox.** The feature is anti-doomscrolling. The app must suppress all non-critical push notifications when `detoxStore.active !== null`. Sending a notification to re-open the app during a detox session undermines the feature's purpose.

---

## Data Flow: Friday Power-Ups

No new store needed. Friday detection integrates with the existing `xp-engine.ts` multiplier parameter.

```
friday-engine.ts (pure TS)
  isFriday(now: Date, userTimezoneOffset: number): boolean
    // Use local weekday derived from timezone offset, not UTC getDay()
    // userTimezoneOffset from settings (already stored as locationLat/Lng → derive offset)
  getFridayMultiplier(): number  // returns 2.0
  isJumuahWindow(now: Date, prayerTimes: PrayerTimes): boolean
    // true between Dhuhr and Asr on Friday for precision variant

Integration with gameStore:
  gameStore.awardXP(habitId, completionEvent) already accepts multiplier
  → Before calling calculateXP(), check friday-engine.isFriday(now)
  → If Friday: inject 2x into the multiplier alongside streak multiplier
  → Multipliers stack multiplicatively: e.g. 1.5 streak × 2.0 Friday = 3.0x total
  → Cap remains enforced by existing soft daily cap logic in xp-engine.ts

Al-Kahf challenge:
  A quest-engine template (type: 'weekly', targetType: 'quran')
  friday-engine.isFriday() gates the template from appearing on other days
  No new architecture — uses existing quest system with a Friday-gated template selector
```

---

## New SQLite Schema Additions

All new tables follow the existing Drizzle pattern from `src/db/schema.ts`.

### Subsystem A: Social

```typescript
// buddies — SYNCABLE
export const buddies = sqliteTable('buddies', {
  id: text('id').primaryKey(),
  requesterId: text('requester_id').notNull().references(() => users.id),
  recipientId: text('recipient_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'declined' | 'removed'
  inviteCode: text('invite_code'),
  inviteExpiresAt: text('invite_expires_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// messages — SYNCABLE (content filtered before insert)
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  senderId: text('sender_id').notNull().references(() => users.id),
  recipientId: text('recipient_id').notNull().references(() => users.id),
  body: text('body').notNull(),
  status: text('status').notNull().default('sent'), // 'pending_send' | 'sent' | 'delivered' | 'read'
  sentAt: text('sent_at').notNull(),
  createdAt: text('created_at').notNull(),
});

// duo_quests — SYNCABLE
export const duoQuests = sqliteTable('duo_quests', {
  id: text('id').primaryKey(),
  buddyConnectionId: text('buddy_connection_id').notNull().references(() => buddies.id),
  initiatorId: text('initiator_id').notNull(),
  partnerId: text('partner_id').notNull(),
  templateId: text('template_id').notNull(),
  description: text('description').notNull(),
  xpReward: integer('xp_reward').notNull(),
  targetType: text('target_type').notNull(),
  targetValue: integer('target_value').notNull(),
  initiatorProgress: integer('initiator_progress').notNull().default(0),
  partnerProgress: integer('partner_progress').notNull().default(0),
  status: text('status').notNull().default('active'), // 'active' | 'completed' | 'expired'
  expiresAt: text('expires_at').notNull(),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
});

// shared_habits — SYNCABLE (visibility only; completion stays PRIVATE)
export const sharedHabits = sqliteTable('shared_habits', {
  id: text('id').primaryKey(),
  buddyConnectionId: text('buddy_connection_id').notNull().references(() => buddies.id),
  habitId: text('habit_id').notNull().references(() => habits.id),
  sharedById: text('shared_by_id').notNull(),
  createdAt: text('created_at').notNull(),
});
```

### Subsystem B: Boss Arena

```typescript
// boss_battles — PRIVATE (personal struggle data)
export const bossBattles = sqliteTable('boss_battles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  archetype: text('archetype').notNull(), // 'waswasa' | 'ghadab' | 'kibr' | 'shumukh' | 'kasal'
  status: text('status').notNull().default('engaged'), // 'engaged' | 'defeated' | 'fled' | 'cooldown'
  currentHp: integer('current_hp').notNull(),
  maxHp: integer('max_hp').notNull(),
  damageLog: text('damage_log').notNull().default('[]'), // JSON array of damage events
  startedAt: text('started_at').notNull(),
  endsAt: text('ends_at'),
  cooldownUntil: text('cooldown_until'),
  xpAwarded: integer('xp_awarded').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
```

### Subsystem C: Detox Dungeon

```typescript
// detox_sessions — LOCAL_ONLY (ephemeral, no sync value)
export const detoxSessions = sqliteTable('detox_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  variant: text('variant').notNull(), // 'daily' | 'deep'
  durationHours: integer('duration_hours').notNull(), // 2-8
  startTimestamp: text('start_timestamp').notNull(), // ISO string, source of truth for timer
  status: text('status').notNull().default('active'), // 'active' | 'complete' | 'abandoned'
  xpAwarded: integer('xp_awarded').notNull().default(0),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
});
```

---

## Privacy Gate: Required Additions

```typescript
// src/services/privacy-gate.ts — additions to PRIVACY_MAP
// Total entities after v2.0: 19 (up from 13)
export const PRIVACY_MAP: Record<string, PrivacyLevel> = {
  // ... existing 13 entries unchanged ...

  // SOCIAL (SYNCABLE) — connection graph and game state, no worship content
  buddies: 'SYNCABLE',
  messages: 'SYNCABLE',
  duo_quests: 'SYNCABLE',
  shared_habits: 'SYNCABLE',

  // BOSS ARENA (PRIVATE) — which nafs archetype a user battles is spiritually sensitive
  boss_battles: 'PRIVATE',

  // DETOX SESSIONS (LOCAL_ONLY) — ephemeral timer, no cloud value
  detox_sessions: 'LOCAL_ONLY',
};
```

The Privacy Gate throws for unknown tables — this addition MUST happen before any new repo attempts to write to the sync queue, or the app will throw in production.

---

## Supabase Realtime: Messaging Architecture

For buddy messaging, **Postgres Changes** is the correct Realtime mode — messages are always written to the DB first (after content filtering), and Realtime notifies the recipient via DB trigger.

```
Message write path:
  1. Client → Edge Function: message-filter (validates content)
  2. Edge Function → Supabase DB: INSERT into messages
  3. Supabase Realtime: realtime.broadcast_changes() fires on INSERT
  4. Recipient's Realtime subscription receives event
  5. Recipient's messageRepo.insert() caches locally
  6. socialStore updates UI

Channel naming: messages:{lower_user_id}:{higher_user_id}
  // Deterministic ordering ensures both users connect to the same channel
  // Private channel with RLS on realtime.messages table
```

**Authorization:** Private channels require `private: true` on channel creation. Supabase validates the JWT against RLS policies on `realtime.messages`. The existing `supabase` client in `src/lib/supabase.ts` already handles JWT refresh — Realtime subscriptions inherit the current session automatically.

**Offline handling:** When the app reconnects after being offline, fetch missed messages from the `messages` table via a direct REST query rather than relying on Realtime replay. Broadcast Replay is a paid Supabase feature — REST fallback is safer and already consistent with the existing sync-engine pattern.

---

## Edge Function: Message Content Filter

```typescript
// supabase/functions/message-filter/index.ts (new)
// Called by client BEFORE DB insert; returns { allowed: boolean, reason?: string }

// bad-words npm package covers English profanity baseline
// Custom Islamic content rules added as extended blocklist:
//   - No promotion of shirk
//   - No sectarian fitnah incitement
//   - No content that would constitute a public worship leaderboard (e.g., "I prayed X times today")

export default async function handler(req: Request) {
  const { body, senderId, recipientId } = await req.json();
  const filter = new Filter();

  if (filter.isProfane(body)) {
    return Response.json({ allowed: false, reason: 'content_policy' }, { status: 200 });
  }

  // Insert to DB only if clean
  const { error } = await supabase.from('messages').insert({ ... });
  return Response.json({ allowed: true, messageId: ... });
}
```

**Why Edge Function not client-side:** Client-side filtering is trivially bypassed. Content policy enforcement must happen server-side before DB persistence. This also keeps the filter logic centralized and updatable without an app release.

---

## Existing Components: What Changes vs What Is New

### MODIFIED (extend, not replace)

| Component | Change Required |
|-----------|----------------|
| `src/services/privacy-gate.ts` | Add 6 new table classifications to `PRIVACY_MAP` |
| `src/db/schema.ts` | Add 6 new Drizzle table definitions |
| `src/db/repos/index.ts` | Export new repos (`buddyRepo`, `messageRepo`, `duoQuestRepo`, `bossRepo`, `detoxRepo`) |
| `src/domain/xp-engine.ts` | Accept optional `fridayMultiplier` parameter in `calculateXP()` |
| `src/domain/quest-engine.ts` | Add `isFriday` gate to `selectQuestTemplates()` for Al-Kahf template |
| `src/stores/gameStore.ts` | Call `friday-engine.isFriday()` before XP award; wire boss victory XP source type |
| `src/services/sync-engine.ts` | No changes needed — Privacy Gate handles classification automatically |
| `supabase/` migrations | Add migration `0004_v2_social.sql` for new tables |

### NEW (create from scratch)

| Component | Type | Description |
|-----------|------|-------------|
| `src/domain/buddy-engine.ts` | Pure TS | Invite code generation, connection limit enforcement, duo quest eligibility |
| `src/domain/boss-engine.ts` | Pure TS state machine | Boss HP, damage calculation, state transitions, 5 archetype definitions |
| `src/domain/detox-engine.ts` | Pure TS | Duration validation, elapsed time calculation, completion check, XP award |
| `src/domain/friday-engine.ts` | Pure TS | Friday detection (timezone-aware), multiplier value, Al-Kahf challenge gate |
| `src/stores/socialStore.ts` | Zustand | Buddy list, pending invites, messages, Realtime subscriptions |
| `src/stores/bossStore.ts` | Zustand | Active boss state, history, cooldown tracking |
| `src/stores/detoxStore.ts` | Zustand | Active session, start_timestamp, status |
| `src/db/repos/buddyRepo.ts` | Drizzle repo | CRUD for buddies + shared_habits + duo_quests |
| `src/db/repos/messageRepo.ts` | Drizzle repo | CRUD for messages, pending_send queue |
| `src/db/repos/bossRepo.ts` | Drizzle repo | CRUD for boss_battles |
| `src/db/repos/detoxRepo.ts` | Drizzle repo | CRUD for detox_sessions |
| `supabase/functions/message-filter/` | Supabase Edge Function | Server-side content moderation |
| `src/db/migrations/0004_v2_social.sql` | Drizzle migration | New tables for v2.0 |

---

## Build Order (Dependency Graph)

Phase ordering must respect data layer → domain → store → UI dependencies.

```
Step 1: Privacy Gate + Schema additions (BLOCKING — throws on unknown tables)
  - Update privacy-gate.ts PRIVACY_MAP (6 new entries)
  - Add Drizzle schema definitions to schema.ts
  - Generate + run migration 0004_v2_social.sql
  Why first: Privacy Gate throws at runtime for unregistered tables.
             Everything else depends on schema existing.

Step 2: Pure domain engines (no dependencies, independently testable)
  - friday-engine.ts (depends only on adhan-js, already installed)
  - detox-engine.ts (no external deps)
  - boss-engine.ts (no external deps)
  - buddy-engine.ts (no external deps)
  Why second: Pure functions with no side effects — safest to build and test
              in isolation. Write unit tests immediately.

Step 3: Repository layer (depends on schema)
  - buddyRepo.ts, messageRepo.ts, duoQuestRepo.ts
  - bossRepo.ts
  - detoxRepo.ts
  - Update repos/index.ts

Step 4: Existing engine modifications (depends on domain engines from Step 2)
  - xp-engine.ts: add optional fridayMultiplier parameter
  - quest-engine.ts: add isFriday gate for Al-Kahf template selector

Step 5: Supabase infrastructure (blocking for social features only)
  - Deploy message-filter Edge Function
  - Add RLS policies for buddies, messages, duo_quests, shared_habits
  - Configure realtime.messages RLS for private channels
  Note: Steps 6A-C below can proceed without this. Only social features blocked.

Step 6: Zustand stores (depends on repos + engines)
  A. friday-engine integration into gameStore (low-risk, additive change)
  B. detoxStore — self-contained, no Supabase dependency
  C. bossStore — self-contained, no Supabase dependency
  D. socialStore — requires Supabase Realtime configured (Step 5 complete)

Step 7: UI screens (depends on stores)
  A. Friday Power-Up indicators on HUD + Al-Kahf quest card
  B. Detox Dungeon: challenge selector + active timer screen
  C. Boss Arena: archetype selection + battle screen + damage animations
  D. Buddy system: invite code screen + buddy list + duo quest view
  E. Messaging: chat screen per buddy pair (requires Step 5 complete)
```

**Recommended delivery order:** Friday Power-Ups first (pure engine extension, zero infra changes), Detox Dungeon second (self-contained, LOCAL_ONLY), Boss Arena third (self-contained, PRIVATE), Social/Messaging last (requires Supabase infra and EAS Build for push notifications).

---

## Critical Integration Points to Verify

1. **Shared habits surface no completion data.** The `shared_habits` table records that a habit was shared (SYNCABLE), but `habit_completions` remains PRIVATE. The buddy-facing view shows only habit metadata (name, icon, frequency) — never whether it was completed today. This is adab safety rail #1 (no public worship leaderboard), enforced architecturally by the Privacy Gate.

2. **Boss battles must be PRIVATE and verified before shipping.** Which nafs archetype a user battles (laziness, anger, arrogance, etc.) reveals personal spiritual struggle. Verifying the Privacy Gate classification is correct and testing that assertSyncable('boss_battles') throws is mandatory before release.

3. **Supabase Realtime works in Expo Go but push notifications for offline delivery require EAS Build.** The existing PROJECT.md flags that the app runs on Expo Go (SDK 54). Realtime WebSocket connections work in Expo Go. Social features should degrade gracefully when offline — no hard crash, queue the message for send on reconnect.

4. **Friday detection must be timezone-aware.** `new Date().getDay() === 5` is UTC-based. A user in UTC-5 at 11pm Thursday local time is already Friday UTC — they would incorrectly receive the 2x bonus. Use the user's stored location (settings.locationLat/Lng) to derive the local offset. adhan-js computes prayer times with timezone awareness — the same location data is already available.

5. **Message content policy is Islamic-context-aware.** The `bad-words` npm library covers English profanity baseline. Custom rules for Islamic context (no shirk propagation, no sectarian fitnah, no worship performance content) require a maintained blocklist. At MVP, this is editorial — a flat list maintained in the Edge Function. Automated LLM moderation is future scope.

6. **Duo quest progress must not reveal individual completion identity.** When displaying duo quest progress to a player, show aggregate progress (e.g., "4 of 10 completions") not which specific habits each player completed. This prevents the buddy pair from functioning as a private worship leaderboard.

---

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Message volume | Supabase free tier handles | Supabase Pro with connection pooling | Separate message storage consideration |
| Realtime connections | Fine on Supabase free tier | Monitor concurrent connections limit | Realtime sharding needed |
| Buddy graph queries | Simple JOIN on buddies table, fast | Add index on (requester_id, status) | Potential graph database consideration |
| RLS policy performance on messages | Minimal impact | Watch query plans on messages + buddies JOIN | Denormalize if JOIN becomes slow |
| Boss battle data | All local, no scale concern | All local, no scale concern | All local, no scale concern |
| Detox sessions | All local, no scale concern | All local, no scale concern | All local, no scale concern |
| Friday XP calculation | In-process, zero infra | In-process, zero infra | In-process, zero infra |

The solo dev context: build for 100 users at launch, design so 10K is achievable without a rewrite. Boss Arena and Detox Dungeon have zero scaling risk (local-only). Social features are the only Supabase scaling risk, handled well up to thousands of concurrent users on paid plans.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Syncing Boss Battle Data
**What:** Storing `boss_battles` as SYNCABLE to show battle history across devices
**Why bad:** Reveals which nafs archetype the user struggles with — spiritually sensitive data. Violates the Privacy Gate's core purpose.
**Instead:** Boss history stays PRIVATE (device-only). If user reinstalls, battle history resets. Accept and document this tradeoff.

### Anti-Pattern 2: Real-Time Completion Sharing Between Buddies
**What:** Broadcasting that a user completed Fajr today to their buddies via Realtime
**Why bad:** Violates adab safety rail #1 (no public worship leaderboards). Riya (showing off acts of worship) is a documented spiritual harm — even in a private two-person context.
**Instead:** Duo quests share only aggregate progress toward quest goals (e.g., "3 of 5 completions done"), never "who completed what prayer when."

### Anti-Pattern 3: Background Timer Process for Detox
**What:** Using `expo-background-fetch` to tick a detox countdown every minute
**Why bad:** iOS minimum background task interval is 15 minutes (not suitable for second-level precision). Battery drain. Adds native module complexity requiring EAS Build.
**Instead:** Store `start_timestamp` in SQLite on challenge start. Recalculate elapsed time from timestamp on app foreground. Timer is only visible when user opens the app — which is the intended behavior.

### Anti-Pattern 4: Client-Side Message Filtering Only
**What:** Filtering messages with `bad-words` in the React Native client before send
**Why bad:** Client-side filtering is trivially bypassed by a determined user. Inappropriate content would reach the DB.
**Instead:** Edge Function validates content server-side before DB insert. Client can show immediate feedback (optimistic UI for likely-clean messages) but server is the enforcement point.

### Anti-Pattern 5: Storing Elapsed Detox Time as Running Counter
**What:** Persisting `elapsed_seconds` to SQLite every second during a detox session
**Why bad:** 86,400 writes per 24hr challenge. Excessive storage wear, battery drain, SQLite write contention with concurrent habit completion writes.
**Instead:** Store only `start_timestamp` (one write on challenge start). Derive everything from `Date.now() - startTimestamp` at read time.

### Anti-Pattern 6: Adding XState for Boss Battle State
**What:** Adding XState dependency for boss battle state management
**Why bad:** XState adds bundle size and a learning curve. The existing codebase uses plain TypeScript discriminated unions — streak-engine.ts handles complex multi-state logic without XState. Boss battles are simpler than streak recovery logic.
**Instead:** Follow the established `streak-engine.ts` pattern: pure functions, discriminated union state types, no external dependencies.

---

## Sources

- Supabase Realtime Docs: [https://supabase.com/docs/guides/realtime](https://supabase.com/docs/guides/realtime)
- Supabase Realtime Broadcast: [https://supabase.com/docs/guides/realtime/broadcast](https://supabase.com/docs/guides/realtime/broadcast)
- Supabase Realtime Authorization: [https://supabase.com/blog/supabase-realtime-broadcast-and-presence-authorization](https://supabase.com/blog/supabase-realtime-broadcast-and-presence-authorization)
- Supabase RLS: [https://supabase.com/docs/guides/database/postgres/row-level-security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Supabase Edge Functions: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- Profanity filtering in React Native (Stream Chat approach): [https://getstream.io/blog/filtering-profanity-in-chat-with-react-native/](https://getstream.io/blog/filtering-profanity-in-chat-with-react-native/)
- Background timer persistence in Expo (AppState + timestamp pattern): [https://dev.to/albertop/how-to-persist-countdown-in-background-react-native-expo-23bi](https://dev.to/albertop/how-to-persist-countdown-in-background-react-native-expo-23bi)
- Expo BackgroundTask docs (15min minimum interval confirmed): [https://docs.expo.dev/versions/latest/sdk/background-task/](https://docs.expo.dev/versions/latest/sdk/background-task/)
- Offline-first mobile architecture patterns: [https://dev.to/odunayo_dada/offline-first-mobile-app-architecture-syncing-caching-and-conflict-resolution-1j58](https://dev.to/odunayo_dada/offline-first-mobile-app-architecture-syncing-caching-and-conflict-resolution-1j58)
- Existing codebase (HIGH confidence — verified directly):
  - `src/services/privacy-gate.ts` — Privacy Gate implementation
  - `src/db/schema.ts` — all 13 entity definitions
  - `src/stores/gameStore.ts` — XP award flow
  - `src/domain/xp-engine.ts` — multiplier parameter pattern
  - `src/domain/quest-engine.ts` — template selector pattern
