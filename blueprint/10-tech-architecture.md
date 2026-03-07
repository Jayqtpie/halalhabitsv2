# 10 — Greenfield Tech Architecture

> **Requirement:** BLUE-10
> **Cross-references:** [Game Design Bible](./03-game-design-bible.md) · [UI Design Tokens](./08-ui-design-tokens.md) · [Data Model](./11-data-model.md)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (React Native / Expo)      │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Screens  │  │  Stores  │  │  Game Engine     │  │
│  │ (Expo     │←→│ (Zustand)│←→│  (Pure TS, no    │  │
│  │  Router)  │  │          │  │   React imports) │  │
│  └──────────┘  └────┬─────┘  └──────────────────┘  │
│                      │                               │
│              ┌───────┴───────┐                       │
│              │   SQLite      │  ← Source of Truth     │
│              │ (expo-sqlite  │                       │
│              │  or WatermelonDB)                     │
│              └───────┬───────┘                       │
│                      │                               │
│              ┌───────┴───────┐                       │
│              │ Privacy Gate  │  Classifies PRIVATE    │
│              │               │  vs SYNCABLE           │
│              └───────┬───────┘                       │
│                      │ (SYNCABLE only)               │
│              ┌───────┴───────┐                       │
│              │  Sync Engine  │  Offline queue,        │
│              │               │  conflict resolution   │
│              └───────┬───────┘                       │
└──────────────────────┼──────────────────────────────┘
                       │ HTTPS
┌──────────────────────┼──────────────────────────────┐
│              ┌───────┴───────┐      SUPABASE         │
│              │   Auth        │  Email, Apple, Google  │
│              │   Postgres    │  RLS-enforced tables   │
│              │   Edge Fns    │  Push notifs, sync     │
│              └───────────────┘                       │
└─────────────────────────────────────────────────────┘
```

**Core principle:** SQLite is the source of truth. Supabase is a backup/sync target. The app works identically offline for days. Worship data never leaves the device.

---

## Frontend Architecture

### Framework
- **React Native (Expo)** with managed workflow
- **Expo Router** for file-based routing (tab layout + stack navigation)
- **Development builds** via EAS Build — NOT Expo Go (per CLAUDE.md)
- **EAS Build** for iOS (required — solo dev on Windows needs cloud builds for iOS)

### Navigation Structure
```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab bar layout
│   ├── index.tsx            # Home HUD (default tab)
│   ├── habits.tsx           # Habits List
│   ├── quests.tsx           # Quest Board
│   └── profile.tsx          # Profile
├── habit/
│   ├── [id].tsx             # Habit Detail
│   └── create.tsx           # Habit Create/Edit
├── settings.tsx             # Settings
├── titles.tsx               # Titles Gallery
├── muhasabah.tsx            # Muhasabah (full-screen)
├── onboarding/
│   ├── welcome.tsx
│   ├── niyyah.tsx
│   └── habits.tsx
└── _layout.tsx              # Root layout
```

---

## Rendering Pipeline

### Skia (Home HUD)
- **react-native-skia** for pixel art game world rendering
- `FilterQuality.None` — crisp pixel art, no anti-aliasing
- Canvas-based: environment scene, character, ambient animations
- Overlay UI (level badge, XP bar, today snapshot) positioned over Skia canvas using absolute positioning
- Target: 60fps for ambient animations (lantern flicker, water, particles)

### Reanimated (UI Animations)
- **react-native-reanimated** for all non-HUD animations
- XP gain floaters, streak increment, checkbox fills, screen transitions
- Shared element transitions between screens (habit card → detail)
- Worklets for 60fps on UI thread

### When to Use Which
| Scenario | Renderer |
|----------|----------|
| Pixel art game world scene | Skia |
| HUD overlay UI elements | React Native + Reanimated |
| Habit list, quest board, profile | React Native + Reanimated |
| Level-up particle effects | Skia (overlay canvas) or Reanimated |
| Screen transitions | Reanimated |

---

## State Management

### Zustand Stores (Domain-Split)

```typescript
// habitStore: habits, completions, streaks
habitStore = {
  habits: Habit[],
  completions: Map<habitId, HabitCompletion[]>,
  streaks: Map<habitId, Streak>,
  completeHabit(id): void,    // → triggers gameStore.addXP()
  createHabit(data): void,
  pauseHabit(id): void,
  archiveHabit(id): void,
}

// gameStore: XP, level, titles, quests
gameStore = {
  totalXP: number,
  currentLevel: number,
  earnedTitles: UserTitle[],
  activeTitle: Title,
  quests: UserQuest[],
  addXP(amount, source): void,  // checks level-up
  checkTitleUnlocks(): void,
  generateQuests(): void,
}

// uiStore: modals, toasts, animation states
uiStore = {
  showLevelUp: boolean,
  showTitleUnlock: Title | null,
  showMercyMode: Habit | null,
  toasts: Toast[],
  showModal(type, data): void,
  dismissModal(): void,
}

// settingsStore: preferences
settingsStore = {
  prayerCalcMethod: string,
  notifications: NotificationPrefs,
  darkMode: 'auto' | 'dark' | 'light',
  soundEnabled: boolean,
  hapticEnabled: boolean,
}
```

### Store Persistence
- Zustand `persist` middleware → SQLite (NOT AsyncStorage)
- On app launch: hydrate stores from SQLite
- On state change: persist to SQLite (debounced, 500ms)
- Critical writes (habit completion, XP) persist immediately

### Inter-Store Communication
- `habitStore.completeHabit()` calls `gameStore.addXP()` directly
- `gameStore.addXP()` checks level threshold, triggers `uiStore.showLevelUp` if crossed
- `gameStore.checkTitleUnlocks()` called after XP change, triggers `uiStore.showTitleUnlock` if earned

---

## Local Database

### SQLite Options (Decision Pending Phase 2 Spike)

| Option | Pros | Cons |
|--------|------|------|
| **expo-sqlite** | Simple, lightweight, direct SQL, Expo-native | Manual queries, no ORM, manual migrations |
| **WatermelonDB** | Lazy loading, reactive queries, built-in sync primitives | Heavier, learning curve, may be overkill for v1 |

**Recommendation:** Start with expo-sqlite for v1 simplicity. Migrate to WatermelonDB if performance requires it. Decision finalized in Phase 2 spike.

### Migration Strategy
- Numbered migration files: `001_initial.sql`, `002_add_quests.sql`
- `schema_version` table tracks applied migrations
- Migrations run on app startup, skip if already applied
- WAL mode enabled for concurrent read/write
- All migrations are forward-only (no down migrations in v1)

---

## Privacy Gate Module

The Privacy Gate is a middleware layer that enforces data privacy classifications at the code level.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Store Write  │────→│ Privacy Gate │────→│   SQLite     │
│  (any store)  │     │              │     │   (always)   │
└──────────────┘     │  PRIVATE?    │     └──────────────┘
                     │  → SQLite    │
                     │    only      │     ┌──────────────┐
                     │              │────→│  Sync Queue  │
                     │  SYNCABLE?   │     │  (if online)  │
                     │  → SQLite    │     └──────────────┘
                     │    + queue   │
                     └──────────────┘
```

**Rules:**
- PRIVATE entities: written to SQLite only, never added to sync queue, no analytics on content
- SYNCABLE entities: written to SQLite AND added to sync queue for eventual upload
- The Privacy Gate is the ONLY path for data writes — stores cannot bypass it
- Classification is hardcoded per entity type (not configurable by user)

---

## Backend (Supabase)

### Services Used
| Service | Purpose | Phase |
|---------|---------|-------|
| **Auth** | Email, Apple, Google sign-in | Phase 7 |
| **Postgres** | Server-side data storage for syncable entities | Phase 7 |
| **Row-Level Security** | Each user can only access their own rows | Phase 7 |
| **Edge Functions** | Push notification delivery, sync conflict resolution | Phase 7 |
| **Storage** | Not used in v1 (no user-uploaded content) | -- |
| **Realtime** | Not used in v1 (polling-based sync is simpler) | -- |

### RLS Policy Pattern
```sql
-- Every syncable table has this policy
CREATE POLICY "Users can only access own data"
ON public.habits
FOR ALL
USING (auth.uid() = user_id);
```

---

## Sync Engine

### Offline Queue
- All SYNCABLE writes go to `SyncQueue` table in SQLite
- Queue entries: `{ entity_type, entity_id, operation, payload, created_at }`
- Queue persists across app restarts

### Sync Trigger
- On app foreground + connectivity detected
- Periodic background sync (every 15 minutes when app is active)
- Manual pull-to-refresh on any screen

### Conflict Resolution
- **Settings:** Last-write-wins (timestamp comparison)
- **Habit completions:** Idempotent — same habit + timestamp = no duplicate
- **XP ledger:** Additive merge — server sums all ledger entries
- **Titles:** Union merge — if either side has the title, it's earned

### Sync Protocol
```
1. Client: POST /sync/push { queue_items[] }
2. Server: Apply items, return { confirmed_ids[], conflicts[] }
3. Client: Clear confirmed items from local queue
4. Client: GET /sync/pull?since={last_sync_timestamp}
5. Server: Return all changes since timestamp
6. Client: Merge server changes into local SQLite
```

---

## Prayer Times

- **Library:** `adhan-js` for local calculation (no server dependency)
- **Input:** Device GPS coordinates (one-time permission) or manual city selection
- **Calculation methods:** ISNA, MWL, Egyptian, Umm al-Qura, Karachi, Tehran, Singapore (user selects in settings)
- **Cache:** Prayer times calculated daily at midnight local time, stored in memory
- **Recalculation triggers:** Midnight, location change, calculation method change
- **Output:** Five prayer windows (Fajr, Dhuhr, Asr, Maghrib, Isha) with start/end times

---

## Notifications

- **Local:** `expo-notifications` for prayer reminders, Muhasabah prompt, streak milestones
- **Push:** Supabase Edge Functions (Phase 7) for server-triggered notifications
- **Scheduling:** Calculate prayer times → schedule 5 local notifications daily
- **Muhasabah:** Single evening notification (default 9 PM, configurable)
- **Copy:** All notification copy is invitational ("Fajr time has entered") never guilt-based

---

## Analytics / Telemetry

- Privacy-safe events only — no worship data, no PII
- Event schema defined in [BLUE-12 Telemetry](./12-telemetry.md)
- Implementation: custom Supabase events table or PostHog (decision in Phase 7)
- All events are aggregate/anonymous — no user-level worship tracking

---

## i18n Infrastructure

- **Library:** i18next with react-i18next
- **Default:** English with Arabic terms inline ("Complete your Dhikr (remembrance)")
- **String externalization:** All user-facing strings in JSON translation files from day 1
- **RTL preparation:** Layout must work with RTL text direction (i18next handles text, layout needs flexbox RTL support)
- **Future languages:** Arabic, Urdu, Malay, Turkish, French (in that priority order)

---

## Directory Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab screens
│   ├── habit/              # Habit stack screens
│   ├── onboarding/         # Onboarding flow
│   └── _layout.tsx         # Root layout
├── components/             # Shared UI components
│   ├── ui/                 # Buttons, Cards, Inputs
│   ├── habits/             # Habit-specific components
│   ├── hud/                # HUD overlay components
│   └── modals/             # Level up, title unlock, Mercy Mode
├── features/               # Feature-specific logic + components
│   ├── habits/
│   ├── quests/
│   ├── titles/
│   ├── muhasabah/
│   └── mercy-mode/
├── stores/                 # Zustand stores
│   ├── habitStore.ts
│   ├── gameStore.ts
│   ├── uiStore.ts
│   └── settingsStore.ts
├── game/                   # Pure TS game engine (NO React imports)
│   ├── xp.ts              # XP formula, level calculations
│   ├── streaks.ts          # Streak logic, multiplier
│   ├── quests.ts           # Quest generation, validation
│   ├── titles.ts           # Title unlock conditions
│   └── mercy.ts            # Mercy Mode logic
├── services/               # External integrations
│   ├── prayer-times.ts     # adhan-js wrapper
│   ├── sync.ts             # Sync engine
│   ├── privacy-gate.ts     # Privacy classification
│   └── notifications.ts   # Notification scheduling
├── db/                     # Database layer
│   ├── schema.ts           # Table definitions
│   ├── migrations/         # Numbered SQL migrations
│   └── queries.ts          # Query helpers
├── tokens/                 # Design tokens
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── motion.ts
├── i18n/                   # Translation files
│   ├── en.json
│   └── config.ts
├── types/                  # Shared TypeScript types
│   ├── habit.ts
│   ├── quest.ts
│   ├── game.ts
│   └── common.ts
└── utils/                  # Helpers
    ├── date.ts
    ├── format.ts
    └── platform.ts
```

**Key principle:** The `game/` directory contains pure TypeScript functions with zero React imports. All game logic (XP calculation, streak evaluation, quest validation, title unlock checks) is fully unit-testable without React Native or any UI framework.

---

*Section 10 of 16 · HalalHabits: Ferrari 16-Bit Edition Master Blueprint*
