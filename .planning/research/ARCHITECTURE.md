# Architecture Patterns

**Domain:** Gamified Islamic habit-building mobile app
**Stack:** React Native (Expo) + Supabase
**Researched:** 2026-03-07
**Overall Confidence:** MEDIUM (training data only -- web search/docs unavailable; patterns are well-established but version-specific details should be verified)

---

## Recommended Architecture

### High-Level Overview

```
+--------------------------------------------------+
|                EXPO MOBILE APP                    |
|                                                   |
|  +------------+  +------------+  +-------------+  |
|  | Navigation |  |   Screens  |  |  UI Layer   |  |
|  | (Expo      |  | (Home HUD, |  | (Components |  |
|  |  Router)   |  |  Forge,    |  |  Tokens,    |  |
|  |            |  |  Quests,   |  |  Animations)|  |
|  +------+-----+  +-----+------+  +------+------+  |
|         |              |                |          |
|  +------v--------------v----------------v------+   |
|  |           APPLICATION LAYER                 |   |
|  |  +----------+  +----------+  +-----------+  |   |
|  |  | Game     |  | Habit    |  | Schedule  |  |   |
|  |  | Engine   |  | Tracker  |  | Engine    |  |   |
|  |  | (XP,     |  | (CRUD,   |  | (Notifs,  |  |   |
|  |  |  Streaks,|  |  Check-  |  |  Prayer   |  |   |
|  |  |  Titles) |  |  ins)    |  |  Times)   |  |   |
|  |  +----+-----+  +----+-----+  +-----+-----+  |   |
|  |       |             |              |          |   |
|  +-------v-------------v--------------v---------+   |
|  |           STATE & DATA LAYER                  |   |
|  |  +----------+  +----------+  +-----------+    |   |
|  |  | Zustand  |  | Local DB |  | Sync      |    |   |
|  |  | (UI/Game |  | (SQLite  |  | Engine    |    |   |
|  |  |  State)  |  |  via     |  | (Queue +  |    |   |
|  |  |          |  |  expo-   |  |  Conflict  |    |   |
|  |  |          |  |  sqlite) |  |  Resolver) |    |   |
|  |  +----------+  +----+-----+  +-----+-----+    |   |
|  +---------------------|--------------|----------+   |
+------------------------|--------------|----------+
                         |              |
              (local)    |              | (network)
                         v              v
                  +------+------+  +----+--------+
                  | Device      |  | Supabase    |
                  | Storage     |  | Backend     |
                  | (SQLite DB) |  | (Postgres,  |
                  |             |  |  Auth, RLS) |
                  +-------------+  +-------------+
```

### Design Principles

1. **Offline-first, sync-second** -- the app must be fully functional without network. Supabase is the sync/backup layer, not the primary data store.
2. **Local worship data** -- prayer logs, habit check-ins, and spiritual reflections never leave the device by default. Only non-sensitive data (settings, XP totals, anonymized progress) syncs.
3. **Game engine as a pure function** -- XP calculation, streak logic, title progression are deterministic functions of state. No side effects, easy to test.
4. **Privacy boundaries are architectural** -- not just policy. Sensitive data lives in a separate SQLite table namespace that the sync engine cannot access.

---

## Component Boundaries

### Layer 1: UI Layer

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Navigation (Expo Router)** | File-based routing, tab structure, deep links | Screens |
| **Screen Components** | Screen-level layout, data fetching orchestration | Application Layer hooks, UI Components |
| **UI Components** | Reusable presentational components (buttons, cards, progress bars, HUD elements) | Props only (no direct state access) |
| **Animation System** | Retro pixel transitions, XP gain animations, haptic feedback | UI Components, react-native-reanimated |

**Boundary rule:** UI layer never touches SQLite or Supabase directly. All data access through hooks that wrap the Application Layer.

### Layer 2: Application Layer (Domain Logic)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Game Engine** | XP calculation, streak evaluation, title progression, quest completion logic | State Layer (reads habit data, writes XP/streak state) |
| **Habit Tracker** | CRUD for habits, check-in recording, custom habit creation (Habit Forge) | Local DB, Sync Engine (for non-sensitive habits) |
| **Quest Board** | Daily/weekly quest generation, completion tracking, reward distribution | Game Engine, Habit Tracker |
| **Muhasabah Engine** | Nightly reflection prompts, journaling, mood/energy logging | Local DB only (private) |
| **Mercy Mode** | Streak recovery logic, compassionate re-engagement flows | Game Engine, Notification scheduler |
| **Schedule Engine** | Prayer time calculation, notification scheduling, daily reset timing | expo-notifications, device clock |

**Boundary rule:** Domain logic is framework-agnostic where possible. Game Engine and streak logic should be pure TypeScript modules with no React imports -- testable in isolation.

### Layer 3: State & Data Layer

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Zustand Store** | In-memory UI state, current session game state, derived computed values | Application Layer (via hooks) |
| **Local DB (expo-sqlite)** | Persistent storage for all habit data, check-ins, XP history, journal entries | Zustand (hydration on app open), Sync Engine |
| **Sync Engine** | Queues changes for upload, resolves conflicts, manages connectivity state | Local DB, Supabase client |
| **Privacy Gate** | Classifies data as private vs syncable, enforces sync boundaries | Sync Engine, Local DB |

**Boundary rule:** Zustand is the single source of truth for the running app. SQLite is the persistence layer that survives app restarts. Supabase is the backup/cross-device layer.

### Layer 4: Backend (Supabase)

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Supabase Auth** | User authentication (email, Apple Sign-In, Google) | Mobile auth flow |
| **Supabase Postgres** | Remote storage for syncable data, user profile, settings | Sync Engine via Supabase JS client |
| **Row Level Security (RLS)** | Ensures users can only access their own data | All Postgres queries |
| **Edge Functions** | Push notification dispatch, prayer time API proxy, optional analytics | Supabase scheduled jobs, expo-notifications push |

**Boundary rule:** The app must function identically if Supabase is unreachable. The backend is for sync, auth, and notifications -- never for core game logic.

---

## Data Flow

### Core Daily Loop

```
User opens app
  |
  v
[App Start] --> Zustand hydrates from SQLite
  |
  v
[Home HUD renders] <-- Zustand provides: today's habits, XP, streak, title, quests
  |
  v
[User checks in a habit]
  |
  +--> Zustand updates immediately (optimistic UI)
  +--> SQLite writes check-in record
  +--> Game Engine recalculates: XP earned, streak status, quest progress
  |      |
  |      +--> If title threshold crossed --> trigger title animation
  |      +--> If quest completed --> trigger quest reward
  |
  +--> Sync Engine queues change (if habit is syncable)
       |
       +--> On next connectivity --> batch upload to Supabase
```

### Data Privacy Flow

```
All data generated
  |
  +-- Privacy Gate classifies -->
  |
  |   PRIVATE (never syncs):          SYNCABLE (syncs when online):
  |   - Salah check-in times          - XP totals
  |   - Quran reading logs            - Streak counts (not details)
  |   - Muhasabah journal entries     - Custom habit names (user choice)
  |   - Dua completion                - App settings/preferences
  |   - Worship-specific habits       - Title/progression state
  |                                   - Anonymized usage analytics
  |
  v                                   v
  SQLite only                         SQLite + Supabase sync queue
  (device-bound)                      (eventual consistency)
```

### Offline-First Sync Pattern

```
[Check-in happens offline]
  |
  v
[Write to SQLite] --> [Add to sync_queue table]
  |                       |
  v                       v
[UI updates instantly]  [sync_queue row]:
                         { id, table, operation, payload, created_at, synced: false }

[Network becomes available]
  |
  v
[Sync Engine processes queue in order]
  |
  +--> For each queued item:
       |
       +--> POST to Supabase
       +--> On success: mark synced: true
       +--> On conflict: apply conflict resolution
       |     |
       |     +--> Last-write-wins for settings
       |     +--> Merge for XP (sum, not replace)
       |     +--> Device-wins for private data (should never conflict)
       |
       +--> On failure: retry with exponential backoff
```

---

## State Management Architecture

### Why Zustand (not Redux, not Context)

- **Zustand** is the right choice for this app. It is lightweight, has no boilerplate, supports computed/derived state, works well with React Native, and handles persistence via middleware.
- Redux is overkill for a solo-dev mobile app. The action/reducer ceremony adds complexity without benefit here.
- React Context causes unnecessary re-renders in deep component trees, which kills performance on the Home HUD with multiple animated elements.

### Store Structure

```typescript
// stores/gameStore.ts -- Game state (XP, streaks, titles)
interface GameStore {
  xp: number;
  level: number;
  currentTitle: string;
  streaks: Record<string, StreakData>;
  addXP: (amount: number, source: string) => void;
  evaluateStreaks: () => void;
  checkTitleProgression: () => void;
}

// stores/habitStore.ts -- Habit definitions and check-ins
interface HabitStore {
  habits: Habit[];
  todayCheckIns: CheckIn[];
  checkIn: (habitId: string) => void;
  createHabit: (habit: NewHabit) => void;
}

// stores/questStore.ts -- Daily/weekly quests
interface QuestStore {
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  generateDailyQuests: () => void;
  completeQuest: (questId: string) => void;
}

// stores/uiStore.ts -- Transient UI state
interface UIStore {
  activeTab: string;
  modalStack: string[];
  animationQueue: Animation[];
}
```

### Persistence Flow

```
App opens --> SQLite read --> Zustand hydrate --> UI renders
                                  |
                           (subscriptions active)
                                  |
State change --> Zustand update --> SQLite write (debounced) --> Sync queue
```

Use Zustand's `persist` middleware with a custom SQLite storage adapter rather than AsyncStorage. SQLite is faster and more reliable for structured data.

---

## Database Schema (SQLite -- Local)

### Core Tables

```sql
-- Habit definitions
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'salah' | 'quran' | 'dhikr' | 'character' | 'focus' | 'custom'
  is_private INTEGER DEFAULT 1, -- 1 = never syncs
  xp_value INTEGER DEFAULT 10,
  frequency TEXT DEFAULT 'daily', -- 'daily' | 'weekly' | 'custom'
  created_at TEXT NOT NULL,
  archived_at TEXT
);

-- Check-in records
CREATE TABLE check_ins (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id),
  checked_at TEXT NOT NULL,
  xp_earned INTEGER NOT NULL,
  notes TEXT, -- optional reflection
  is_private INTEGER DEFAULT 1
);

-- Streak tracking
CREATE TABLE streaks (
  habit_id TEXT PRIMARY KEY REFERENCES habits(id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_check_in TEXT,
  mercy_mode_used INTEGER DEFAULT 0
);

-- Game progression
CREATE TABLE progression (
  id INTEGER PRIMARY KEY DEFAULT 1, -- singleton row
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_title TEXT DEFAULT 'Seeker',
  titles_unlocked TEXT DEFAULT '[]', -- JSON array
  updated_at TEXT
);

-- Quest tracking
CREATE TABLE quests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'daily' | 'weekly'
  title TEXT NOT NULL,
  description TEXT,
  target_count INTEGER DEFAULT 1,
  current_count INTEGER DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  generated_date TEXT NOT NULL,
  completed_at TEXT
);

-- Muhasabah (reflection) journal
CREATE TABLE muhasabah (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  energy_level INTEGER, -- 1-5
  gratitude TEXT,
  struggle TEXT,
  tomorrow_intention TEXT,
  created_at TEXT NOT NULL
  -- Always private, never syncs
);

-- Sync queue (for syncable data only)
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'INSERT' | 'UPDATE' | 'DELETE'
  payload TEXT NOT NULL, -- JSON
  created_at TEXT NOT NULL,
  synced_at TEXT,
  retry_count INTEGER DEFAULT 0
);
```

### Supabase Schema (Remote -- Syncable Data Only)

```sql
-- Only non-private data lives here
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  current_title TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

CREATE TABLE synced_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  notification_preferences JSONB DEFAULT '{}',
  theme TEXT DEFAULT 'dark',
  prayer_calculation_method TEXT DEFAULT 'ISNA',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE synced_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own settings"
  ON synced_settings FOR ALL USING (auth.uid() = user_id);
```

---

## Key Technical Patterns

### 1. Game Engine as Pure Functions

**Confidence: HIGH** -- this is standard game architecture.

```typescript
// engine/xp.ts -- No React, no side effects, pure math
export function calculateXP(action: ActionType, streak: number): number {
  const base = XP_VALUES[action];
  const streakMultiplier = Math.min(1 + (streak * 0.1), 2.0); // caps at 2x
  return Math.floor(base * streakMultiplier);
}

export function calculateLevel(totalXP: number): number {
  // Logarithmic curve -- early levels fast, later levels slower
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

export function evaluateTitle(level: number, achievements: string[]): string {
  // Deterministic title based on level + achievement combination
  return TITLE_THRESHOLDS.find(t => meetsRequirements(level, achievements, t))?.title ?? 'Seeker';
}
```

This pattern means the entire game engine is unit-testable without any React Native or database setup. Critical for a game app where balance tuning requires fast iteration.

### 2. Offline-First with Sync Queue

**Confidence: MEDIUM** -- the pattern is well-known, but Supabase does not provide a built-in offline sync SDK. You build this yourself.

The key insight: Supabase is NOT Firebase -- it does not have built-in offline persistence or sync. You must implement the offline queue manually. This is actually an advantage because it gives you full control over what syncs and what stays private.

```typescript
// sync/engine.ts
export class SyncEngine {
  private db: SQLiteDatabase;
  private supabase: SupabaseClient;

  async processQueue(): Promise<void> {
    const pending = await this.db.getAllAsync(
      'SELECT * FROM sync_queue WHERE synced_at IS NULL ORDER BY created_at ASC'
    );

    for (const item of pending) {
      try {
        await this.pushToSupabase(item);
        await this.db.runAsync(
          'UPDATE sync_queue SET synced_at = ? WHERE id = ?',
          [new Date().toISOString(), item.id]
        );
      } catch (error) {
        await this.db.runAsync(
          'UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?',
          [item.id]
        );
        if (item.retry_count >= MAX_RETRIES) {
          // Dead-letter it, don't block the queue
          break;
        }
      }
    }
  }
}
```

### 3. Privacy Gate Pattern

**Confidence: HIGH** -- straightforward architectural boundary.

```typescript
// privacy/gate.ts
const PRIVATE_TABLES = new Set(['check_ins', 'muhasabah', 'streaks']);
const SYNCABLE_TABLES = new Set(['progression', 'synced_settings']);

export function canSync(tableName: string, record: any): boolean {
  if (PRIVATE_TABLES.has(tableName)) return false;
  if (!SYNCABLE_TABLES.has(tableName)) return false;
  if (record.is_private) return false;
  return true;
}
```

The privacy gate sits between the data layer and the sync engine. It is the single enforcement point -- if you want to change what syncs, you change one file.

### 4. Push Notifications via Supabase Edge Functions

**Confidence: MEDIUM** -- expo-notifications handles local scheduling well; server-push for reminders requires Edge Functions.

```
Local notifications (prayer times, daily reminders):
  --> expo-notifications scheduleNotificationAsync()
  --> Computed from prayer time calculation
  --> Works fully offline

Server notifications (streak at risk, re-engagement):
  --> Supabase Edge Function (cron or triggered)
  --> Sends push via Expo Push API
  --> Requires user to have synced push token
```

### 5. Navigation Structure (Expo Router)

**Confidence: HIGH** -- Expo Router is the standard for Expo apps.

```
app/
  _layout.tsx          -- Root layout (auth gate, providers)
  (auth)/
    login.tsx
    onboarding.tsx     -- Niyyah (intention) setting flow
  (tabs)/
    _layout.tsx        -- Tab bar layout
    index.tsx          -- Home HUD
    forge.tsx          -- Habit Forge
    quests.tsx         -- Quest Board
    reflect.tsx        -- Muhasabah
    profile.tsx        -- Profile, history, settings
  (modals)/
    check-in.tsx       -- Habit check-in modal
    mercy-mode.tsx     -- Streak recovery
    title-unlock.tsx   -- Title progression celebration
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Supabase as Primary Database
**What:** Treating Supabase Postgres as the source of truth, reading/writing directly.
**Why bad:** App becomes useless offline. Every interaction requires network. Latency on every tap.
**Instead:** SQLite is the source of truth. Supabase is the backup/sync destination.

### Anti-Pattern 2: Game Logic in Components
**What:** Calculating XP, evaluating streaks, or determining titles inside React components.
**Why bad:** Untestable, duplicated across screens, impossible to balance-tune.
**Instead:** Pure TypeScript modules in an `engine/` directory. Components call hooks that call engine functions.

### Anti-Pattern 3: Single Zustand Mega-Store
**What:** One massive store with all app state.
**Why bad:** Every state change re-renders everything. Performance death on Home HUD.
**Instead:** Split stores by domain (game, habits, quests, UI). Components subscribe to only what they need.

### Anti-Pattern 4: Syncing Everything
**What:** Syncing all data to Supabase for "backup."
**Why bad:** Violates privacy-first constraint. Worship data on a server is a trust violation.
**Instead:** Privacy Gate enforces boundaries. Private data stays on device. User can export manually if they want backup.

### Anti-Pattern 5: AsyncStorage for Structured Data
**What:** Using AsyncStorage (key-value) for habit records, check-ins, quests.
**Why bad:** No queries, no relations, no aggregation. "Show me my last 30 days of Fajr" requires loading everything.
**Instead:** expo-sqlite for all structured data. AsyncStorage only for simple flags (has_onboarded, theme_preference).

---

## Scalability Considerations

| Concern | At MVP (1 user) | At 1K users | At 100K users |
|---------|-----------------|-------------|---------------|
| **Local DB size** | Negligible | N/A (per-device) | N/A (per-device) |
| **Supabase load** | Free tier fine | Free tier fine | Pro plan, connection pooling |
| **Sync conflicts** | Won't happen (single device) | Rare (mostly single device) | Need proper conflict resolution for multi-device |
| **Push notifications** | Expo push service free | Expo push free | Expo push free (scales well) |
| **Prayer time calc** | On-device library | On-device library | On-device library (no server needed) |
| **Auth** | Supabase free tier | Supabase free tier | Supabase Pro for MAU limits |

The architecture scales naturally because the heavy work (game logic, habit tracking, prayer times) is all on-device. Supabase only handles auth, sync, and push -- all lightweight operations.

---

## Suggested Build Order

Based on component dependencies, build in this order:

### Foundation (must come first)
1. **Expo project scaffold** with Expo Router navigation structure
2. **SQLite database layer** -- schema, migrations, basic CRUD helpers
3. **Zustand stores** -- habit store and game store with SQLite persistence

**Rationale:** Everything else depends on navigation + data layer. Without these, no screen can show real data.

### Core Loop (depends on Foundation)
4. **Habit Tracker** -- create habits, check in, view today's habits
5. **Game Engine** -- XP calculation, streak evaluation (pure functions first, then wire to stores)
6. **Home HUD** -- render game state, today's habits, streaks

**Rationale:** The daily check-in loop is the core value. Get this working end-to-end before adding systems around it.

### Game Systems (depends on Core Loop)
7. **Quest Board** -- quest generation, completion tracking, reward integration with Game Engine
8. **Title Progression** -- title thresholds, unlock celebrations
9. **Mercy Mode** -- streak recovery logic, compassionate re-engagement

**Rationale:** These systems layer on top of the core loop. They reference habits and XP but don't change the fundamental data model.

### Reflection & Privacy (can parallel with Game Systems)
10. **Muhasabah** -- nightly reflection screen, journal entries
11. **Privacy Gate** -- classification logic, enforcement at data layer

**Rationale:** Muhasabah is a standalone screen with its own private data. Privacy Gate should be built before sync but can be built alongside game systems.

### Backend & Sync (depends on Privacy Gate)
12. **Supabase Auth** -- login, account creation, session management
13. **Sync Engine** -- queue, conflict resolution, background sync
14. **Push Notifications** -- local scheduling (prayer times), Supabase Edge Function for server push

**Rationale:** Auth and sync are intentionally last. The app must work completely without them. Adding sync last means you test the full offline experience first.

### Polish (depends on everything)
15. **Onboarding** -- Niyyah flow, initial habit selection
16. **Animations & Haptics** -- XP gain celebrations, streak milestones, title unlocks
17. **Settings & Profile** -- history views, data export, prayer calculation method selection

---

## Technology Choices for Architecture

| Layer | Technology | Why |
|-------|-----------|-----|
| Navigation | Expo Router | File-based routing, deep links, matches Expo ecosystem |
| State Management | Zustand | Lightweight, no boilerplate, great React Native perf, persist middleware |
| Local Database | expo-sqlite | Structured queries, relations, built into Expo, no native module headaches |
| Remote Backend | Supabase (Postgres + Auth + Edge Functions) | Postgres for relational data, RLS for privacy, Edge Functions for push |
| Animations | react-native-reanimated | 60fps UI thread animations for game feel, worklets |
| Notifications | expo-notifications | Local + push, works with Expo managed workflow |
| Prayer Times | adhan-js (or similar) | On-device calculation, no API dependency, works offline |
| Haptics | expo-haptics | Tactile feedback for check-ins, milestones |

---

## Sources

- Architecture patterns derived from established React Native + Supabase community patterns (training data, MEDIUM confidence)
- Offline-first sync queue pattern is a well-documented approach for mobile apps lacking built-in sync SDKs (HIGH confidence on pattern, MEDIUM on Supabase-specific implementation)
- Expo Router file-based routing is the current Expo standard (HIGH confidence)
- Zustand as React Native state management recommendation based on ecosystem trends and solo-dev ergonomics (HIGH confidence)
- expo-sqlite over AsyncStorage for structured data is a well-established best practice (HIGH confidence)
- Privacy Gate as architectural boundary is a custom pattern designed for this project's hard constraints (HIGH confidence on approach, project-specific)

**Note:** Web search and documentation fetch were unavailable during this research session. Version-specific API details (especially expo-sqlite API surface and Supabase JS v2 client patterns) should be verified against current documentation before implementation begins.
