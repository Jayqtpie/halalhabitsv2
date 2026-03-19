# Technology Stack

**Project:** HalalHabits v2.0 — Social & Battle Systems
**Researched:** 2026-03-19
**Scope:** NEW additions only — existing v1.0 stack is validated and unchanged

---

## Existing Stack (Validated — Do Not Re-research)

These are confirmed in production via v1.0 (24,689 LOC, 414 tests passing):

| Technology | Version (actual) | Role |
|------------|-----------------|------|
| Expo SDK | ~54.0.33 | Runtime |
| React Native | 0.81.5 | Cross-platform |
| @shopify/react-native-skia | 2.2.12 | 2D rendering, pixel art |
| react-native-reanimated | ~4.1.1 | Animations, worklets |
| expo-sqlite | ~16.0.10 | Local DB |
| drizzle-orm | ^0.45.1 | ORM / schema |
| @supabase/supabase-js | ^2.99.2 | Auth, Postgres, Realtime |
| zustand | ^5.0.11 | State management |
| adhan | ^4.4.3 | Prayer time calculation |
| expo-notifications | ~0.32.16 | Local + push notifications |
| expo-router | ~6.0.23 | File-based navigation |
| i18next + react-i18next | ^25 / ^16 | Internationalisation |

---

## New Stack Additions for v2.0

### 1. Real-Time Messaging — Supabase Realtime (Already Installed)

**Decision: Use Supabase Realtime Broadcast + Postgres Changes. No new package needed.**

`@supabase/supabase-js` ^2.99.2 is already installed and includes Realtime. No additional
library is needed for the buddy messaging system.

**How it works:**

- **Postgres Changes** — listen to INSERT on `messages` table; buddy receives message via WebSocket
- **Broadcast** — ephemeral typing indicators, online presence (no DB write needed)
- **Realtime Authorization** — `realtime.messages` table supports RLS policies; only buddies
  in the same channel receive events

**Critical integration note (MEDIUM confidence — RLS + Realtime on React Native):**
There is a documented issue where Realtime stops delivering events in React Native when
`detectSessionInUrl: true` is set in the Supabase client config. The fix is:

```typescript
const supabase = createClient(url, key, {
  auth: { detectSessionInUrl: false }  // required for RN Realtime + RLS
})
```

This is already correct for React Native. Verify this is set in `src/lib/supabase.ts`.

**Channel pattern for buddy messaging:**

```typescript
// One private channel per buddy pair, keyed by sorted user IDs
const channelId = [myId, buddyId].sort().join(':')
const channel = supabase.channel(`buddy:${channelId}`, {
  config: { broadcast: { self: true } }
})
```

**Confidence: HIGH** — Supabase Realtime is documented, battle-tested with React Native,
and the package is already installed.

---

### 2. Content Filtering for Buddy Messages

**Decision: `leo-profanity` (client-side pre-filter) + Supabase Edge Function (server-side validator)**

Two-layer approach:

| Layer | Library | Role | When |
|-------|---------|------|------|
| Client | `leo-profanity` ^1.9.0 | Block obvious profanity before send | Before API call |
| Server | Supabase Edge Function (custom) | Authoritative filter + Islamic content rules | On message INSERT trigger |

**Why leo-profanity over bad-words:**
- `leo-profanity` is actively maintained (published 2 months ago as of March 2026); `bad-words`
  last published 2 years ago
- Supports custom word list extension — needed for Islamic-specific blocked terms (profanity
  against prophets, blasphemous phrases)
- Pure JS, works in React Native with no native dependencies

**Why NOT an ML-based filter (glin-profanity, Azure Cognitive Services, OpenAI moderation):**
- Overkill for a small buddy chat (max 20 connections)
- ML models add latency and cost
- The app is offline-first — an ML API call blocks message send
- Simple word-list filtering is sufficient for a closed, small-network buddy system

**Installation:**

```bash
npm install leo-profanity
```

**Usage pattern:**

```typescript
import leoProfanity from 'leo-profanity'
leoProfanity.loadDictionary('en')
leoProfanity.add(['islamophobic_term_1', 'islamophobic_term_2'])  // custom list

const isSafe = !leoProfanity.check(messageText)
```

**Confidence: MEDIUM** — leo-profanity is well-established. Custom Islamic word list must be
curated manually by the developer; no existing Islamic-specific profanity list was found in
the ecosystem.

---

### 3. Boss Battle Animations — Skottie (Already Partially Available)

**Decision: Use built-in Skottie from `@shopify/react-native-skia` 2.2.12 (already installed).
No new package needed.**

React Native Skia 2.x ships with Skottie (Lottie renderer built on Skia). Boss battle
animations (hit flash, health drain, phase transitions) can be expressed as Lottie JSON
files rendered inside the existing Skia canvas, composited with other Skia drawing primitives.

**Why this is better than `lottie-react-native` for boss battles:**
- Skottie renders inside the Skia canvas, so animations layer with pixel-art health bars and
  boss sprites without a separate native view
- 63% better frame rates on low-end Android vs lottie-react-native (benchmark source: Margelo)
- Boss phase transitions need compositing (hit flash OVER the boss sprite) — only achievable
  inside a single Skia canvas

**What Skia 2.2.12 Skottie supports:**

```typescript
import { Skottie, useSkottie } from '@shopify/react-native-skia'

const animation = useSkottie(require('./boss-hit.json'))  // Lottie JSON asset

// Inside a <Canvas>:
<Skottie animation={animation} x={0} y={0} width={200} height={200} />
```

**Boss battle UX does NOT require new libraries.** The existing Reanimated 4.1.1 +
Skia 2.2.12 stack handles:
- Health bar drain animations (Reanimated `useSharedValue` + Skia `Paint`)
- Boss idle/attack frame cycles (Reanimated driving Skia `drawImageRect` sprite frames)
- Hit flash effect (Skia `ColorFilter` + Reanimated timing)
- Phase transition screen shake (Reanimated `useSharedValue` on canvas transform)

**Confidence: HIGH** — Skia 2.2.12 is the confirmed installed version. Skottie is documented
as part of @shopify/react-native-skia since v1.x. No additional package required.

---

### 4. Dopamine Detox Timer — No New Library Needed

**Decision: Timestamp + AppState pattern using built-in React Native APIs. No new package.**

The Dopamine Detox Dungeon requires a 2-8 hour countdown timer that survives app
backgrounding. The correct approach for Expo (without ejecting or foreground services):

**Pattern: Start timestamp + AppState reconciliation**

```typescript
// On challenge start:
const startedAt = Date.now()
await AsyncStorage.setItem('detox_start', String(startedAt))
await AsyncStorage.setItem('detox_duration_ms', String(durationMs))

// In component:
const appState = useRef(AppState.currentState)
AppState.addEventListener('change', (nextState) => {
  if (nextState === 'active') {
    const start = await AsyncStorage.getItem('detox_start')
    const elapsed = Date.now() - Number(start)
    setRemainingMs(durationMs - elapsed)
  }
})
```

**Why NOT `react-native-background-timer`:**
- Requires ejecting (loses Expo Go compatibility; the project is still using Expo Go)
- Foreground services on Android require additional native configuration
- Timestamp reconciliation is sufficient — the timer just needs accuracy when foregrounded,
  not continuous background tick accuracy

**Why NOT expo-background-fetch:**
- Background fetch fires at OS-discretion intervals (minutes, not seconds)
- Cannot maintain a second-by-second countdown in background
- Correct approach: recalculate elapsed time on foreground, not tick in background

**Scheduled notification at challenge end:**
Use the existing `expo-notifications` ^0.32.16 with a future-date trigger:

```typescript
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Dungeon Complete',
    body: 'You conquered the Dopamine Detox Dungeon. Barakah earned.'
  },
  trigger: { date: new Date(startedAt + durationMs) }
})
```

**Confidence: HIGH** — AppState + timestamp is the documented Expo-compatible pattern.
expo-notifications future-date triggers are confirmed in current Expo 54 docs.

---

### 5. Friday Power-Up Scheduling

**Decision: No new library. Use `adhan` (already installed) + `expo-notifications` (already installed).**

Friday detection uses the existing `adhan` library + JavaScript `Date`:

```typescript
// Jumu'ah detection
const now = new Date()
const isFriday = now.getDay() === 5  // 0=Sun, 5=Fri

// Jumu'ah starts at Dhuhr on Friday (use adhan for local prayer times)
const prayerTimes = new PrayerTimes(coords, now, calculationParams)
const jumuahStart = prayerTimes.dhuhr
const jumuahEnd = prayerTimes.asr
```

**2x XP multiplier:** Pure TypeScript in the existing XP engine. No library needed.

**Surah Al-Kahf challenge scheduling:** Schedule a weekly local notification every Thursday
night using `expo-notifications` `WeeklyTrigger`:

```typescript
await Notifications.scheduleNotificationAsync({
  content: { title: 'Friday Reminder', body: 'Read Surah Al-Kahf before sunset.' },
  trigger: { weekday: 6, hour: 20, minute: 0, repeats: true }  // Thursday 8pm
})
```

**Confidence: HIGH** — Both components use confirmed installed packages.

---

### 6. Social / Buddy Data Layer — Supabase (New Tables, No New Library)

**Decision: New Supabase tables + existing drizzle-orm schema + existing Zustand store. No new package.**

The buddy system requires new database tables in Supabase (server) and possibly mirrored
schema in expo-sqlite (local cache for offline viewing). New Zustand slice: `useBuddyStore`.

**New Supabase tables (server-side):**

| Table | Purpose |
|-------|---------|
| `user_profiles` (extend) | Add `username`, `invite_code` (unique, 6-char) fields |
| `buddy_connections` | `user_a_id`, `user_b_id`, `status` (pending/accepted/blocked), `created_at` |
| `buddy_messages` | `id`, `channel_id`, `sender_id`, `content`, `filtered`, `sent_at` |
| `shared_habits` | `id`, `owner_id`, `buddy_id`, `habit_id`, `goal`, `created_at` |
| `duo_quests` | `id`, `user_a_id`, `user_b_id`, `quest_type`, `a_completed`, `b_completed` |

**RLS policies required for all new tables** — buddy can only read messages in their channel,
connections only visible to participating users.

**Invite code generation:** Use existing `expo-crypto` (already installed):

```typescript
import * as Crypto from 'expo-crypto'
const bytes = await Crypto.getRandomBytesAsync(4)
const code = Array.from(bytes).map(b => b.toString(36)).join('').toUpperCase().slice(0, 6)
```

**New local SQLite tables (via drizzle-orm):** Cache buddy list and recent messages for
offline viewing. Full message sync is not needed offline — just the buddy list + last 50
messages per buddy.

**Confidence: HIGH** — Standard Supabase pattern, all tools already installed.

---

### 7. Nafs Boss Arena State — No New Library

**Decision: Boss battle state is pure TypeScript + existing Zustand + expo-sqlite. No new package.**

Boss battles are multi-day, persistent state machines:

- **Local state:** expo-sqlite table `boss_battles` (boss_id, player_id, phase, hp_remaining,
  started_at, daily_damage_dealt)
- **In-memory state:** New `useBossStore` Zustand slice (active boss, current phase, player
  attack queue)
- **Progression unlock:** Boss unlocks at Level 10+ — query existing XP store, no new logic

**Boss archetype definitions:** Static TypeScript constants file. No library needed.

```typescript
export const BOSS_ARCHETYPES = {
  WASWASAH:  { name: 'Al-Waswas', hp: 500, phases: 3, duration_days: 7 },
  GHAFLAH:   { name: 'Al-Ghaflah', hp: 400, phases: 3, duration_days: 5 },
  KIBR:      { name: 'Al-Kibr', hp: 600, phases: 4, duration_days: 10 },
  HASAD:     { name: 'Al-Hasad', hp: 450, phases: 3, duration_days: 7 },
  TARSEEL:   { name: 'Al-Tarseel', hp: 350, phases: 2, duration_days: 5 },
} as const
```

**Daily damage is awarded by completing regular habits** — the boss system hooks into
the existing habit completion event bus (Zustand `useHabitStore`). No architectural change.

**Confidence: HIGH** — Pure TypeScript state machine, existing infrastructure sufficient.

---

## Summary: New Packages Required

Only one new npm package is required for the entire v2.0 milestone:

| Package | Version | Purpose | Install Command |
|---------|---------|---------|----------------|
| `leo-profanity` | ^1.9.0 | Client-side message content filter | `npm install leo-profanity` |

Everything else — Realtime messaging, boss animations, detox timer, Friday power-ups,
buddy data layer, boss state — uses already-installed packages.

---

## What NOT to Add

| Technology | Why Not |
|------------|---------|
| Stream Chat / Sendbird / Pubnub | External paid chat service; Supabase Realtime is sufficient for 20-buddy private messaging |
| `react-native-background-timer` | Requires ejecting; timestamp + AppState is sufficient for detox timer |
| `lottie-react-native` (standalone) | Skia 2.2.12 already has Skottie built-in; redundant |
| `react-native-skottie` (Margelo) | Same as above — this package wraps what Skia 2.x already ships |
| ML content moderation (Azure/OpenAI) | Overkill for 20-buddy closed network; adds latency and cost |
| Firebase Cloud Messaging (separate) | expo-notifications already handles APNs/FCM abstraction |
| Socket.io / ws (standalone WebSocket) | Supabase Realtime uses WebSockets internally; no raw WS library needed |
| Redux / Redux Toolkit | Already decided against; Zustand handles new social store slices |
| `expo-background-fetch` (new) | Already in project; not useful for second-accurate detox countdown |
| Separate invitation service | Supabase invite codes via `expo-crypto` (already installed) are sufficient |

---

## Integration Points (How New Features Wire Into Existing Architecture)

| New Feature | Hooks Into | Integration Pattern |
|-------------|-----------|---------------------|
| Buddy messaging | Supabase Realtime channel, existing `useSupabase` hook | New `useChatStore` Zustand slice; subscribe on buddy screen mount |
| Content filter | Message send path in chat service | Filter before `supabase.from('buddy_messages').insert()` |
| Boss battle | `useHabitStore` completion event | Boss damage calculated on `onHabitCompleted` callback |
| Boss animation | Existing Skia canvas in game HUD | New `BossArenaScreen` with `<Canvas>` + Skottie + Reanimated |
| Detox timer | `AppState` + `expo-notifications` | New `useDetoxStore` Zustand slice; schedule notification on start |
| Friday 2x XP | Existing XP engine `calculateXP()` | Add `fridayMultiplier` param; check `Date.getDay() === 5` |
| Surah Al-Kahf | `expo-notifications` weekly trigger | Schedule once on app startup, replace if already scheduled |
| Invite codes | `expo-crypto` random bytes, Supabase `user_profiles` | Generate on first launch, store in profile |

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Supabase Realtime for messaging | HIGH | Official docs, confirmed package installed |
| Supabase Realtime + RLS in React Native | MEDIUM | Documented known issue with `detectSessionInUrl`; verify config |
| leo-profanity content filter | MEDIUM | Confirmed active package; Islamic custom list must be hand-curated |
| Skottie in Skia 2.2.12 | HIGH | Confirmed version installed; Skottie documented in Skia since v1.x |
| AppState timer for detox | HIGH | Standard documented Expo pattern, no native module needed |
| Friday power-up via adhan + notifications | HIGH | Both packages confirmed installed and functional |
| New Supabase tables (buddy system) | HIGH | Standard Supabase + Drizzle pattern, identical to existing tables |
| Boss battle as pure TS state machine | HIGH | No new library, hooks into existing event system |

---

## Sources

- [Supabase Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization) — RLS on broadcast channels
- [Supabase Broadcast Docs](https://supabase.com/docs/guides/realtime/broadcast) — Channel patterns
- [Supabase Realtime + RLS React Native issue](https://medium.com/@kidane10g/supabase-realtime-stops-working-when-rls-is-enabled-heres-the-fix-154f0b43c69a) — `detectSessionInUrl` fix (MEDIUM confidence)
- [leo-profanity npm](https://www.npmjs.com/package/leo-profanity) — Version 1.9.0 confirmed active
- [React Native Skia Skottie docs](https://shopify.github.io/react-native-skia/docs/skottie/) — Built-in since Skia 1.x
- [Margelo react-native-skottie benchmark](https://github.com/margelo/react-native-skottie) — 63% fps improvement vs lottie-react-native
- [Expo background timer AppState pattern](https://aloukissas.medium.com/how-to-build-a-background-timer-in-expo-react-native-without-ejecting-ea7d67478408) — Timestamp reconciliation
- [Expo Notifications scheduling](https://docs.expo.dev/versions/latest/sdk/notifications/) — Future-date and weekly triggers
- [Drizzle + Expo SQLite](https://expo.dev/blog/modern-sqlite-for-react-native-apps) — Confirmed integration pattern
- Existing `package.json` (confirmed installed versions, March 2026)
