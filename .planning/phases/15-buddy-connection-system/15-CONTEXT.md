# Phase 15: Buddy Connection System - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Players can find, invite, and manage up to 20 private accountability buddies, view a buddy's public progress summary, and have all social data protected by RLS policies. This phase covers connection mechanics, buddy list UI, buddy profile viewing, and discoverability settings. It does NOT include messaging (Phase 17), shared habits, or duo quests (Phase 16).

</domain>

<decisions>
## Implementation Decisions

### Connection Flow
- **D-01:** Invite codes shared via native share sheet. Tap 'Invite' generates a short alphanumeric code (e.g., 'HH-A7K3'), then opens OS share sheet (WhatsApp, iMessage, copy). Code expires after 48 hours per BUDY-01.
- **D-02:** Code entry happens on the buddy list screen. Prominent 'Enter Code' button — tap it, type/paste the code, confirm.
- **D-03:** Incoming buddy requests notified in-app only. Badge on buddy tab icon, pending requests section at top of buddy list. No push notifications for buddy requests.
- **D-04:** Blocking is silent removal. Blocked user disappears from both lists. Blocked person sees the buddy as 'removed' — no indication they were blocked. Blocked user cannot re-request.

### Buddy List & Status
- **D-05:** Buddy list is a simple vertical list of buddy cards — avatar/initial, username, online status dot, streak count. Pending requests section at top.
- **D-06:** Online status shows last active time. Green dot = active in last 15 min, gray dot = offline. Show 'Active 2h ago' text. Implemented via Supabase presence or heartbeat.
- **D-07:** Empty state shows pixel-art illustration of two characters, warm mentor copy ('Accountability starts with one connection'), plus 'Invite a Buddy' and 'Enter Code' buttons.

### Buddy Profile View
- **D-08:** Tapping a buddy in the list opens their profile as a detail screen (push navigation).
- **D-09:** Buddy profile shows: XP total, current streak count, identity title (e.g., 'The Steadfast'), and level. All non-worship public data — feels like viewing a friend's RPG character sheet.
- **D-10:** Buddy profile includes Remove and Block actions via three-dot menu or bottom actions. No messaging or shared activity actions in Phase 15.

### Discoverability & Privacy
- **D-11:** Discoverability opt-in presented during buddy onboarding — first time user opens the buddy screen: 'Want others to find you by username?' Choice changeable in settings later. Privacy-first: defaults to not discoverable if user skips.
- **D-12:** Username search is an inline search bar at top of the buddy list screen. Type a username, debounced Supabase query, results appear below. Only discoverable users show up.
- **D-13:** Soft rate limit: max 10 pending outbound buddy requests at a time. No time cooldown — just cap concurrent pending. Prevents mass-spamming while not annoying normal users.

### Claude's Discretion
- Navigation structure for buddy screens within Expo Router (tab vs stack)
- Exact heartbeat/presence implementation approach
- Buddy card component styling details within the modern pixel revival aesthetic
- Confirmation dialogs for remove/block actions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & Data Layer
- `.planning/phases/11-schema-privacy-gate-foundation/11-CONTEXT.md` — Buddies table schema (single-row pair model, user_a/user_b, status column, invite_code), dual-owner RLS policy, privacy classification (SYNCABLE)
- `src/db/schema.ts` — Buddies table definition with indexes on user_a, user_b, invite_code
- `src/services/privacy-gate.ts` — Privacy classifications (buddies = SYNCABLE)

### Existing Infrastructure
- `src/services/sync-engine.ts` — Sync infrastructure for SYNCABLE tables
- `src/services/auth-service.ts` — User auth and identity
- `src/stores/` — Zustand store patterns (domain-split stores)
- `app/` — Expo Router navigation structure

### Requirements
- `.planning/REQUIREMENTS.md` lines 45-51 — BUDY-01 through BUDY-07

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/db/schema.ts` — buddies table already defined with all columns and indexes
- `src/services/privacy-gate.ts` — buddies already classified as SYNCABLE
- `src/services/sync-engine.ts` — existing sync queue pattern to follow
- `src/services/auth-service.ts` — user identity for buddy operations
- `src/components/ui/CustomTabBar.tsx` — tab bar (for badge integration)
- `src/stores/` — 6 existing Zustand stores as pattern reference

### Established Patterns
- Zustand domain-split stores with SQLite persistence (see habitStore, gameStore)
- Expo Router tab + stack navigation
- Privacy Gate classification for all tables
- Sync queue enqueue pattern for SYNCABLE data

### Integration Points
- Tab navigation: buddy tab needs to be added to CustomTabBar
- Settings screen: discoverability toggle needs to be added
- Supabase: RLS policies for buddy-pair scoping (dual-owner pattern from Phase 11)
- Notification badge: buddy tab badge for pending requests

</code_context>

<specifics>
## Specific Ideas

- Buddy profile should feel like viewing a friend's RPG character sheet — XP, level, title, streak
- Empty state illustration: two pixel-art characters, warm mentor voice copy
- Invite code format: short and shareable like 'HH-A7K3'
- Discoverability prompt appears on first buddy screen visit, not during main onboarding

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-buddy-connection-system*
*Context gathered: 2026-03-24*
