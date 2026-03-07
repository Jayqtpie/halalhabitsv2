# 11 — Data Model and API Contract

> **Requirement:** BLUE-11
> **Cross-references:** [Feature Systems](./05-feature-systems.md) · [Tech Architecture](./10-tech-architecture.md) · [QA & Balance](./13-qa-balance.md)

---

## Entity-Relationship Overview

```
┌──────────┐    1:N    ┌──────────────┐    1:N    ┌──────────────────┐
│   User   │──────────→│    Habit     │──────────→│ HabitCompletion  │
│ SYNCABLE │          │  SYNCABLE    │          │    PRIVATE        │
└────┬─────┘          └──────┬───────┘          └──────────────────┘
     │                       │
     │ 1:N                   │ 1:1
     ▼                       ▼
┌──────────┐          ┌──────────────┐
│ XPLedger │          │   Streak     │
│ SYNCABLE │          │   PRIVATE    │
└──────────┘          └──────────────┘
     │
     │ 1:N              1:N    ┌──────────────┐
     │          ┌──────────────│    Quest     │
     │          │              │  SYNCABLE    │
     │          │              └──────────────┘
     │          ▼                     │ 1:N
     │   ┌──────────────┐            ▼
     │   │  UserQuest   │     ┌──────────────┐
     │   │  SYNCABLE    │     │  QuestDef    │
     │   └──────────────┘     │  (seed data) │
     │                        └──────────────┘
     │
     │ 1:N   ┌──────────────┐         ┌──────────────┐
     ├──────→│  UserTitle   │←────────│    Title     │
     │       │  SYNCABLE    │  N:1    │ (seed data)  │
     │       └──────────────┘         └──────────────┘
     │
     │ 1:1   ┌──────────────┐
     ├──────→│  Settings    │
     │       │  SYNCABLE    │
     │       └──────────────┘
     │
     │ 1:N   ┌──────────────┐
     ├──────→│MuhasabahEntry│
     │       │   PRIVATE    │
     │       └──────────────┘
     │
     │ 1:1   ┌──────────────┐
     └──────→│   Niyyah     │
              │   PRIVATE    │
              └──────────────┘

              ┌──────────────┐
              │  SyncQueue   │  (infrastructure, not user data)
              │  LOCAL ONLY  │
              └──────────────┘
```

---

## Entity Definitions

### Entity: User
**Privacy:** SYNCABLE — profile data, no worship content

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key (matches Supabase auth.uid) |
| display_name | TEXT | NOT NULL, 1-50 chars | Player display name |
| active_title_id | UUID | FK → Title, NULLABLE | Currently equipped title |
| current_level | INT | NOT NULL, DEFAULT 1 | Current player level |
| total_xp | INT | NOT NULL, DEFAULT 0 | Lifetime XP (never decreases) |
| created_at | DATETIME | NOT NULL, DEFAULT NOW | Account creation |
| updated_at | DATETIME | NOT NULL | Last profile update |

**Relationships:**
- has_many: Habit (1:N)
- has_many: XPLedger (1:N)
- has_many: UserTitle (1:N)
- has_many: UserQuest (1:N)
- has_many: MuhasabahEntry (1:N)
- has_one: Settings (1:1)
- has_one: Niyyah (1:1)
- belongs_to: Title via active_title_id (N:1)

**Indexes:**
- `idx_user_level` on (current_level) — for level-based queries

---

### Entity: Habit
**Privacy:** SYNCABLE — habit definitions are configuration, not worship data. Knowing a user tracks "Fajr Prayer" is not the same as knowing they completed it.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → User, NOT NULL | Owner |
| name | TEXT | NOT NULL, 3-50 chars | Display name |
| type | TEXT | NOT NULL, 'preset' or 'custom' | Origin type |
| preset_key | TEXT | NULLABLE | Preset identifier (e.g., 'fajr', 'quran') |
| category | TEXT | NOT NULL | 'salah', 'worship', 'dhikr', 'fasting', 'character', 'custom' |
| frequency | TEXT | NOT NULL | 'daily', 'weekly', JSON for custom |
| frequency_days | TEXT | NULLABLE | JSON array for weekly (e.g., ["mon","thu"]) |
| time_window_start | TEXT | NULLABLE | HH:MM or 'prayer:fajr' |
| time_window_end | TEXT | NULLABLE | HH:MM or 'prayer:dhuhr' |
| difficulty_tier | TEXT | NOT NULL, DEFAULT 'medium' | 'easy', 'medium', 'hard', 'intense' |
| base_xp | INT | NOT NULL | XP per completion (10, 15, 20, or 25) |
| status | TEXT | NOT NULL, DEFAULT 'active' | 'active', 'paused', 'archived' |
| sort_order | INT | NOT NULL, DEFAULT 0 | Display order |
| icon | TEXT | NULLABLE | Icon identifier from preset library |
| created_at | DATETIME | NOT NULL | Creation time |
| updated_at | DATETIME | NOT NULL | Last modification |

**Relationships:**
- belongs_to: User (N:1)
- has_many: HabitCompletion (1:N)
- has_one: Streak (1:1)

**Indexes:**
- `idx_habit_user_status` on (user_id, status) — active habits for a user
- `idx_habit_user_sort` on (user_id, sort_order) — display order

---

### Entity: HabitCompletion
**Privacy:** PRIVATE — this is worship data. It records when a user prayed, fasted, or performed dhikr. This information is between the servant and the Creator. It never leaves the device.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| habit_id | UUID | FK → Habit, NOT NULL | Which habit was completed |
| completed_at | DATETIME | NOT NULL | When the completion was recorded |
| xp_earned | INT | NOT NULL | XP awarded (base × multiplier) |
| streak_multiplier | REAL | NOT NULL | Multiplier applied at time of completion |
| created_at | DATETIME | NOT NULL | Record creation time |

**Relationships:**
- belongs_to: Habit (N:1)
- triggers: XPLedger entry creation (1:1, decoupled)

**Indexes:**
- `idx_completion_habit_date` on (habit_id, completed_at) — lookup by habit and date
- `idx_completion_date` on (completed_at) — daily summary queries

---

### Entity: Streak
**Privacy:** PRIVATE — tracks worship consistency patterns. A user's streak data reveals their prayer and worship habits.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| habit_id | UUID | FK → Habit, NOT NULL, UNIQUE | One streak per habit |
| current_count | INT | NOT NULL, DEFAULT 0 | Current consecutive days |
| longest_count | INT | NOT NULL, DEFAULT 0 | All-time best streak |
| last_completed_at | DATETIME | NULLABLE | Last completion timestamp |
| multiplier | REAL | NOT NULL, DEFAULT 1.0 | Current streak multiplier |
| is_rebuilt | BOOLEAN | NOT NULL, DEFAULT false | In rebuilt state (post-recovery) |
| rebuilt_at | DATETIME | NULLABLE | When recovery completed |
| updated_at | DATETIME | NOT NULL | Last update |

**Relationships:**
- belongs_to: Habit (1:1)

**Indexes:**
- `idx_streak_habit` on (habit_id) — UNIQUE, one streak per habit

---

### Entity: XPLedger
**Privacy:** SYNCABLE — records that XP was earned and from what type of source, but NOT which specific worship act generated it. This is the critical privacy boundary. The server knows "User earned 15 XP from a habit" but not "User prayed Fajr at 5:42 AM."

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → User, NOT NULL | Who earned the XP |
| amount | INT | NOT NULL | XP amount |
| source_type | TEXT | NOT NULL | 'habit', 'quest', 'muhasabah', 'mercy_recovery', 'milestone' |
| source_id | UUID | NULLABLE | FK to source entity (quest_id, etc.) — NULL for habits (privacy) |
| earned_at | DATETIME | NOT NULL | When XP was earned |
| created_at | DATETIME | NOT NULL | Record creation time |

**Relationships:**
- belongs_to: User (N:1)

**Indexes:**
- `idx_xp_user_date` on (user_id, earned_at) — daily XP totals
- `idx_xp_user` on (user_id) — user lifetime XP

**Privacy boundary note:** When `source_type` is 'habit', `source_id` is always NULL. The XP ledger records the amount and type but never links back to the specific HabitCompletion. This decoupling is enforced by the Privacy Gate.

---

### Entity: Title
**Privacy:** SYNCABLE — title definitions are game data, not user data. These are seed data loaded on app install.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| name | TEXT | NOT NULL, UNIQUE | Title display name |
| rarity | TEXT | NOT NULL | 'common', 'rare', 'legendary' |
| unlock_type | TEXT | NOT NULL | 'level', 'streak', 'quest_count', 'recovery_count', 'habit_count', 'muhasabah_count', 'multi_streak' |
| unlock_value | INT | NOT NULL | Threshold value (e.g., 40 for 40-day streak) |
| unlock_habit_type | TEXT | NULLABLE | Required habit type (e.g., 'fajr' for Dawn Guardian) |
| flavor_text | TEXT | NOT NULL | Wise mentor flavor text |
| sort_order | INT | NOT NULL | Display order in gallery |

**Relationships:**
- has_many: UserTitle (1:N)

**Indexes:**
- `idx_title_rarity` on (rarity) — filter by rarity tier

---

### Entity: UserTitle
**Privacy:** SYNCABLE — which titles a user has earned is part of their game profile, not worship data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → User, NOT NULL | Who earned it |
| title_id | UUID | FK → Title, NOT NULL | Which title |
| earned_at | DATETIME | NOT NULL | When unlocked |

**Relationships:**
- belongs_to: User (N:1)
- belongs_to: Title (N:1)

**Indexes:**
- `idx_usertitle_user` on (user_id) — all titles for a user
- UNIQUE constraint on (user_id, title_id) — can't earn same title twice

---

### Entity: Quest
**Privacy:** SYNCABLE — quest instances generated for a user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → User, NOT NULL | Owner |
| type | TEXT | NOT NULL | 'daily', 'weekly', 'stretch', 'recovery' |
| description | TEXT | NOT NULL | Quest display text |
| xp_reward | INT | NOT NULL | XP on completion |
| target_type | TEXT | NOT NULL | 'habit_count', 'streak_days', 'specific_habit', 'all_salah' |
| target_value | INT | NOT NULL | Target count/days |
| target_habit_id | UUID | NULLABLE | FK → Habit, for habit-specific quests |
| progress | INT | NOT NULL, DEFAULT 0 | Current progress toward target |
| status | TEXT | NOT NULL, DEFAULT 'available' | 'available', 'in_progress', 'completed', 'expired' |
| expires_at | DATETIME | NOT NULL | Expiration timestamp |
| completed_at | DATETIME | NULLABLE | When completed |
| created_at | DATETIME | NOT NULL | Generation time |

**Relationships:**
- belongs_to: User (N:1)

**Indexes:**
- `idx_quest_user_status` on (user_id, status) — active quests
- `idx_quest_expires` on (expires_at) — expiration checks

---

### Entity: MuhasabahEntry
**Privacy:** PRIVATE — deeply personal reflection data. A user's self-assessment, gratitude, and intentions are the most private data in the app. This data exists ONLY on the device. No analytics capture content. No sync. No export that includes it alongside syncable data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → User, NOT NULL | Owner |
| prompt_1_text | TEXT | NOT NULL | First prompt question |
| prompt_1_response | TEXT | NULLABLE | User's response |
| prompt_2_text | TEXT | NULLABLE | Second prompt question |
| prompt_2_response | TEXT | NULLABLE | User's response |
| prompt_3_text | TEXT | NULLABLE | Third prompt question |
| prompt_3_response | TEXT | NULLABLE | User's response |
| tomorrow_intention | TEXT | NULLABLE | Intention set for next day |
| xp_earned | INT | NOT NULL, DEFAULT 0 | XP awarded (10 if completed, 0 if skipped) |
| created_at | DATETIME | NOT NULL | Session timestamp |

**Relationships:**
- belongs_to: User (N:1)

**Indexes:**
- `idx_muhasabah_user_date` on (user_id, created_at) — lookup by date

---

### Entity: Settings
**Privacy:** SYNCABLE — preferences are not worship data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → User, NOT NULL, UNIQUE | Owner |
| prayer_calc_method | TEXT | NOT NULL, DEFAULT 'ISNA' | Calculation method |
| location_lat | REAL | NULLABLE | Latitude for prayer times |
| location_lng | REAL | NULLABLE | Longitude for prayer times |
| location_name | TEXT | NULLABLE | Display name for location |
| isha_end_time | TEXT | NOT NULL, DEFAULT 'midnight' | 'midnight', 'last_third', 'fajr' |
| notification_prayers | BOOLEAN | NOT NULL, DEFAULT true | Prayer reminders |
| notification_muhasabah | BOOLEAN | NOT NULL, DEFAULT true | Evening reflection |
| notification_quests | BOOLEAN | NOT NULL, DEFAULT false | Quest expiry |
| notification_titles | BOOLEAN | NOT NULL, DEFAULT true | Title progress |
| muhasabah_reminder_time | TEXT | NOT NULL, DEFAULT '21:00' | HH:MM local |
| dark_mode | TEXT | NOT NULL, DEFAULT 'auto' | 'auto', 'dark', 'light' |
| sound_enabled | BOOLEAN | NOT NULL, DEFAULT true | Sound effects |
| haptic_enabled | BOOLEAN | NOT NULL, DEFAULT true | Haptic feedback |
| updated_at | DATETIME | NOT NULL | Last change |

**Relationships:**
- belongs_to: User (1:1)

---

### Entity: Niyyah
**Privacy:** PRIVATE — personal spiritual intention, set during onboarding.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| user_id | UUID | FK → User, NOT NULL, UNIQUE | Owner |
| text | TEXT | NOT NULL | Intention text |
| created_at | DATETIME | NOT NULL | When set |

**Relationships:**
- belongs_to: User (1:1)

---

### Entity: SyncQueue
**Privacy:** LOCAL ONLY — infrastructure table, not user data. Never synced (that would be circular).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| entity_type | TEXT | NOT NULL | Table name of synced entity |
| entity_id | UUID | NOT NULL | PK of synced entity |
| operation | TEXT | NOT NULL | 'create', 'update', 'delete' |
| payload | TEXT | NOT NULL | JSON serialized entity |
| created_at | DATETIME | NOT NULL | When queued |
| synced_at | DATETIME | NULLABLE | When successfully synced (NULL = pending) |

**Indexes:**
- `idx_sync_pending` on (synced_at) WHERE synced_at IS NULL — pending items
- `idx_sync_entity` on (entity_type, entity_id) — dedup check

---

## Privacy Classification Summary

| Entity | Privacy | Justification |
|--------|---------|---------------|
| User | SYNCABLE | Profile data (name, level, XP) — no worship content |
| Habit | SYNCABLE | Habit definitions are configuration, not completion records |
| HabitCompletion | **PRIVATE** | Records when user performed worship acts — sacred privacy |
| Streak | **PRIVATE** | Reveals worship consistency patterns |
| XPLedger | SYNCABLE | Aggregated effort score, decoupled from worship source |
| Title | SYNCABLE | Game data (seed), not user data |
| UserTitle | SYNCABLE | Achievement records — part of game profile |
| Quest | SYNCABLE | Quest instances and progress |
| MuhasabahEntry | **PRIVATE** | Deeply personal self-reflection — most private data |
| Settings | SYNCABLE | Preferences, no sensitive content |
| Niyyah | **PRIVATE** | Personal spiritual intention |
| SyncQueue | LOCAL ONLY | Infrastructure, never synced |

**PRIVATE entities (4):** HabitCompletion, Streak, MuhasabahEntry, Niyyah
**SYNCABLE entities (7):** User, Habit, XPLedger, Title, UserTitle, Quest, Settings
**LOCAL ONLY (1):** SyncQueue

---

## API Contracts (Phase 7)

### POST /sync/push
Push local changes to server.

**Request:**
```json
{
  "items": [
    {
      "entity_type": "habit",
      "entity_id": "uuid",
      "operation": "create",
      "payload": { ... },
      "client_timestamp": "2026-03-07T15:30:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "confirmed_ids": ["uuid-1", "uuid-2"],
  "conflicts": [
    {
      "entity_type": "settings",
      "entity_id": "uuid",
      "resolution": "server_wins",
      "server_version": { ... }
    }
  ],
  "server_timestamp": "2026-03-07T15:30:05Z"
}
```

### GET /sync/pull?since={timestamp}
Pull server changes since last sync.

**Response:**
```json
{
  "entities": {
    "habits": [...],
    "xp_ledger": [...],
    "user_titles": [...],
    "quests": [...],
    "settings": { ... }
  },
  "server_timestamp": "2026-03-07T15:30:05Z"
}
```

### POST /auth/register
Create account via Supabase Auth.

### POST /auth/login
Sign in via Supabase Auth (email, Apple, Google).

### DELETE /user/data
Export and/or delete all user data. Returns a JSON file of all syncable data. Deletes server records. Local data deletion handled client-side.

---

## Versioning and Migration Strategy

- **Schema version table:** `_schema_version(version INT, applied_at DATETIME)`
- **Migration files:** `001_initial.sql`, `002_add_quests.sql`, etc.
- **Run on startup:** App checks current version, runs any unapplied migrations in order
- **Forward-only:** No down migrations in v1 — rollback = reinstall
- **Backward-compatible changes preferred:** Add columns with defaults, don't rename/drop
- **Breaking changes:** Require data migration script within the migration file
- **Seed data:** Title definitions loaded via `001_initial.sql` seed section

---

## Privacy Boundary Rules

1. **PRIVATE entities exist ONLY in local SQLite.** No corresponding table in Supabase Postgres. No sync queue entry is ever created for them.

2. **The XPLedger is the critical boundary.** It records that XP was earned and from what source type (habit/quest/muhasabah) but for habits, `source_id` is always NULL. The server knows "user earned 15 XP from a habit at 5:42 AM" but not "user prayed Fajr at 5:42 AM." The completion is private; the effort score is syncable.

3. **Privacy Gate enforcement:** The Privacy Gate module (Phase 2) hardcodes the classification per entity type. There is no configuration toggle. A developer cannot accidentally sync HabitCompletion data — the code prevents it structurally.

4. **Analytics exclusion:** Telemetry events (BLUE-12) may record "muhasabah_completed" (boolean) but never the content of responses. The event schema excludes all PRIVATE entity fields.

5. **Data export:** The "Export My Data" feature exports only SYNCABLE data. Muhasabah and worship completion data are excluded. A separate "Delete Muhasabah Data" option exists for local-only deletion.

---

*Section 11 of 16 · HalalHabits: Ferrari 16-Bit Edition Master Blueprint*
