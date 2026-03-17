# Phase 7: Backend, Auth & Sync - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Add Supabase backend so users can create accounts, sync non-private data across devices, receive push notifications — while the app continues working perfectly offline. The Privacy Gate already classifies all 13 tables; this phase wires the syncable ones to Supabase and adds auth + push.

</domain>

<decisions>
## Implementation Decisions

### Auth & Account Flow
- Email + password sign-in via Supabase Auth (social auth deferred)
- Guest-first: app works fully offline with no account, matching current offline-first architecture
- Early nudge: prompt account creation on first milestone (level-up or title unlock) — "You earned [title]! Create an account to keep your progress safe." Non-blocking, dismissible
- On account creation, user chooses: "Keep your progress" or "Start fresh" — fresh start option available

### Sync Behavior & Conflicts
- Background auto-sync when online + manual "Sync now" button in settings for peace of mind
- Last-write-wins conflict resolution based on `updatedAt` timestamp
- Subtle sync indicator: small cloud icon in settings/profile — checkmark when synced, spinning when syncing, warning if failed
- Idempotent completion merge: completions keyed by habitId+date, deduplicated — no double XP across devices

### Push Notification Migration
- Hybrid model: keep local notifications for prayer reminders (work offline, need precise timing)
- Push-based via Supabase Edge Functions for: streak milestones, quest expiry warnings, morning motivation, Muhasabah reminder
- Device token registration on account creation/sign-in

### Account Lifecycle
- Sign-out keeps local data on device, app reverts to guest mode — prevents accidental data loss
- Delete account erases everywhere: server data + local data, complete erasure (GDPR compliant)
- Unlimited simultaneous devices — no device limit, all sync via Supabase

### Claude's Discretion
- Supabase project structure and RLS policy design
- Sync queue batching strategy and retry logic
- Edge Function implementation details
- Token refresh and session management approach
- Migration strategy for existing `sync_queue` table schema (may need additional columns)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Privacy & Data Classification
- `src/services/privacy-gate.ts` — Defines PRIVACY_MAP for all 13 tables (4 private, 7 syncable, 1 local-only). `assertSyncable()` is the ONLY valid sync entry point
- `src/types/common.ts` — `PrivacyLevel` type, `SyncQueueItem` and `NewSyncQueueItem` types

### Database & Schema
- `src/db/schema.ts` — Full Drizzle ORM schema with all 13 tables including `sync_queue`
- `src/db/client.ts` — expo-sqlite client setup with WAL mode
- `src/db/migrations/` — 3 existing migrations (dark_mandrill, mercy_mode, quest_template_id)

### Repositories (sync targets)
- `src/db/repos/` — All repos follow singleton pattern with async methods. Syncable repos: userRepo, habitRepo, xpRepo, titleRepo, questRepo, settingsRepo

### State Management
- `src/stores/settingsStore.ts` — Only persisted store (SQLite-backed via sqliteStorage adapter). Has `hydrated` flag, `onboardingComplete`, all notification prefs
- `src/stores/sqliteStorage.ts` — Zustand StateStorage adapter for SQLite persistence

### Notifications (migration source)
- `src/services/notification-service.ts` — Current local notification implementation. `rescheduleAll()` handles prayer + Muhasabah scheduling
- `src/domain/notification-copy.ts` — Adab-safe notification strings

### Data Export (delete account extension point)
- `src/services/data-export.ts` — `deleteAllUserData()` with cascading SQL delete + store resets. Phase 7 extends this to also delete server data

### Blueprint Specs
- `.planning/phases/01-master-blueprint/sections/10-greenfield-tech-architecture.md` — Tech architecture including sync strategy
- `.planning/phases/01-master-blueprint/sections/11-data-model-and-api-contract.md` — Data model with privacy classifications

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Privacy Gate** (`src/services/privacy-gate.ts`): Already classifies all tables — sync engine calls `assertSyncable()` before any upload
- **sync_queue table** (`src/db/schema.ts`): Already defined with entityType, entityId, operation, payload, syncedAt columns
- **SyncQueueItem types** (`src/types/common.ts`): TypeScript types ready for sync queue operations
- **UUID utility** (`src/utils/uuid.ts`): expo-crypto based, used for all entity IDs
- **Data export service** (`src/services/data-export.ts`): `deleteAllUserData()` — extend for server-side deletion
- **Notification service** (`src/services/notification-service.ts`): Refactor to keep local prayer notifications, delegate others to push

### Established Patterns
- **Store-Repo-Engine**: UI → Zustand Store → Repository (DB) + Domain Engine (logic). Auth/sync should follow this pattern
- **SQLite-as-source-of-truth**: Supabase is backup, not primary. All reads come from local SQLite
- **Drizzle ORM migrations**: New tables/columns via Drizzle Kit migrations
- **Settings persistence**: Only settingsStore uses Zustand persist middleware with sqliteStorage adapter
- **User ID**: Currently hardcoded `'default-user'` everywhere — Phase 7 replaces with real Supabase auth user ID

### Integration Points
- **Root layout** (`app/_layout.tsx`): Hydration gate (fonts + migrations + hydrated). Add auth session listener here
- **Settings screen** (`app/(tabs)/settings.tsx` or similar): Add sign-in/sign-out, sync status, account management
- **settingsStore**: Add auth token/session storage, sync preferences
- **All repos using `'default-user'`**: Must accept dynamic user ID from auth session

</code_context>

<specifics>
## Specific Ideas

- Nudge ties to emotional moment (first level-up or title unlock) — not just time-based
- "Keep your progress" vs "Start fresh" on account creation — respects user agency
- Prayer reminders stay local (offline reliability) while engagement notifications go push
- Sign-out is non-destructive — user can sign back in without losing anything

</specifics>

<deferred>
## Deferred Ideas

- Social auth (Apple Sign-In, Google Sign-In) — add after email+password is working
- Cross-device real-time sync (WebSocket/Realtime) — eventual consistency via polling is fine for v1
- Account recovery / password reset flow — Supabase handles this but UI needs building
- Sync analytics / telemetry — track sync failures, latency, conflict rates

</deferred>

---

*Phase: 07-backend-auth-and-sync*
*Context gathered: 2026-03-17*
