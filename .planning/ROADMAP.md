# Roadmap: HalalHabits Ferrari 16-Bit Edition

## Milestones

- **v1.0 HalalHabits Ferrari 16-Bit Edition** — Phases 1-10 (shipped 2026-03-19)
- **v2.0 Social & Battle Systems** — Phases 11-17 (in progress)

## Phases

<details>
<summary>v1.0 HalalHabits Ferrari 16-Bit Edition (Phases 1-10) — SHIPPED 2026-03-19</summary>

- [x] Phase 1: Master Blueprint (7/7 plans) — completed 2026-03-07
- [x] Phase 2: Foundation and Data Layer (3/3 plans) — completed 2026-03-09
- [x] Phase 3: Core Habit Loop (6/6 plans) — completed 2026-03-10
- [x] Phase 4: Game Engine and Progression (4/4 plans) — completed 2026-03-15
- [x] Phase 5: HUD, Visual Identity, and Muhasabah (4/4 plans) — completed 2026-03-16
- [x] Phase 6: Onboarding, Profile, and Notifications (4/4 plans) — completed 2026-03-16
- [x] Phase 7: Backend, Auth, and Sync (5/5 plans) — completed 2026-03-18
- [x] Phase 8: Critical Integration Wiring (2/2 plans) — completed 2026-03-18
- [x] Phase 9: Verification and Audit Cleanup (2/2 plans) — completed 2026-03-19
- [x] Phase 10: Title Pipeline and Integration Fixes (1/1 plan) — completed 2026-03-19

Full details: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

### v2.0 Social & Battle Systems (In Progress)

**Milestone Goal:** Add a private accountability buddy system with shared activities and filtered messaging, plus three solo game features — Friday Power-Ups, Dopamine Detox Dungeon, and Nafs Boss Arena.

- [x] **Phase 11: Schema & Privacy Gate Foundation** - Lay data foundation for all v2.0 features before any feature code runs (completed 2026-03-19)
- [ ] **Phase 12: Friday Power-Ups** - Make every Friday a game event with 2x XP and Al-Kahf challenge
- [ ] **Phase 13: Dopamine Detox Dungeon** - Give players a voluntary anti-doomscrolling challenge system
- [ ] **Phase 14: Nafs Boss Arena** - Let players battle personified nafs struggles in multi-day boss fights
- [ ] **Phase 15: Buddy Connection System** - Enable private accountability partnerships with up to 20 connections
- [ ] **Phase 16: Shared Activities & Duo Quests** - Let buddy pairs track shared habits and complete cooperative quests
- [ ] **Phase 17: Messaging & Content Moderation** - Enable filtered 1:1 chat between connected buddies

## Phase Details

### Phase 11: Schema & Privacy Gate Foundation
**Goal**: All v2.0 database tables exist, Privacy Gate correctly classifies every new table, and the XP economy model is validated before any feature ships
**Depends on**: Phase 10 (v1.0 complete)
**Requirements**: FOUN-01, FOUN-02, FOUN-03
**Success Criteria** (what must be TRUE):
  1. Privacy Gate correctly routes all 6 new tables — buddies and messages sync to Supabase, boss_battles stays local, detox_sessions are ephemeral, and no unknown-table error is thrown anywhere in the codebase
  2. All 6 SQLite tables exist after migration runs with correct columns, foreign keys, and indexes
  3. The XP economy model document shows combined daily cap math — Friday 2x + streak multiplier + boss/detox rewards never causes hyperinflation at any level
**Plans**: 2 plans
Plans:
- [ ] 11-01-PLAN.md — Schema tables, Privacy Gate extension, types, and tests
- [ ] 11-02-PLAN.md — Supabase migrations with RLS policies and XP economy model

### Phase 12: Friday Power-Ups
**Goal**: Every Friday becomes a distinct game event — players see a 2x XP boost on the HUD, receive the Surah Al-Kahf quest card, and read one of 10 vetted hadith-sourced messages
**Depends on**: Phase 11
**Requirements**: FRDY-01, FRDY-02, FRDY-03, FRDY-04
**Success Criteria** (what must be TRUE):
  1. On a Friday, completing any habit awards double XP compared to the same habit on any other day, and the multiplier stacks correctly with the streak multiplier
  2. The HUD displays a visible Jumu'ah boost indicator on Fridays and hides it on all other days
  3. A Surah Al-Kahf quest card appears on the Quest Board on Friday mornings and awards 100 bonus XP on completion
  4. One of 10 pre-written, hadith-sourced Friday messages displays to the player (messages rotate, not random spam)
**Plans**: TBD

### Phase 13: Dopamine Detox Dungeon
**Goal**: Players can voluntarily enter a timed anti-doomscrolling challenge, earn XP for completing it, and have their habit streaks protected during an active session
**Depends on**: Phase 11
**Requirements**: DTOX-01, DTOX-02, DTOX-03, DTOX-04, DTOX-05, DTOX-06
**Success Criteria** (what must be TRUE):
  1. Player can select a duration (2-8 hours), start a detox session, and see a countdown timer that continues correctly after backgrounding the app or restarting it
  2. Completing a session (daily or deep weekly) awards the correct XP amount — daily sessions award 50-150 XP based on duration, the weekly deep variant awards 300 XP
  3. Exiting early shows a confirmation dialog with the XP penalty, and the penalty is applied if the player confirms
  4. Habit streaks are not penalized for habits missed during an active detox session
  5. The weekly deep variant (6-8 hours) is only available once per week; the daily variant resets daily
**Plans**: TBD

### Phase 14: Nafs Boss Arena
**Goal**: Players at Level 10+ can battle one of 5 nafs archetypes over 5-7 days, dealing damage through habit completions and receiving counter-attacks for missed days, culminating in XP and title rewards
**Depends on**: Phase 11
**Requirements**: BOSS-01, BOSS-02, BOSS-03, BOSS-04, BOSS-05, BOSS-06, BOSS-07, BOSS-08
**Success Criteria** (what must be TRUE):
  1. A player at Level 10+ can enter the Boss Arena, select an archetype, and start a battle; a player below Level 10 cannot access the Arena
  2. The boss HP bar visibly decreases from daily habit completions across the 5-7 day battle window, and visibly recovers (counter-attack) when habits are missed
  3. Each of the 5 archetypes displays unique dialogue at battle start, during taunts, when the player is winning, and when the boss is defeated
  4. Defeating a boss awards the correct XP (200-500) and contributes progress toward the boss-specific Identity Title
  5. Mercy Mode reduces the severity of counter-attacks when active during a battle
  6. Battle state (HP, days elapsed, archetype) survives app kills and device restarts without data loss
**Plans**: TBD

### Phase 15: Buddy Connection System
**Goal**: Players can find, invite, and manage up to 20 private accountability buddies, view a buddy's public progress summary, and have all social data protected by RLS policies
**Depends on**: Phase 11
**Requirements**: BUDY-01, BUDY-02, BUDY-03, BUDY-04, BUDY-05, BUDY-06, BUDY-07
**Success Criteria** (what must be TRUE):
  1. Player can generate an invite code (valid 48 hours) and share it; a friend can enter that code to initiate a connection
  2. Player can search by username and find users who opted into discoverability; users who did not opt in are invisible to search
  3. Player can accept or decline incoming requests, and can remove or block existing connections; a blocked buddy cannot reconnect without the blocker acting first
  4. Buddy list shows up to 20 connections with online status visible
  5. Viewing a buddy's profile shows XP total and streak count only — no salah completions, Muhasabah content, or other worship details are ever exposed
  6. All buddy, message, duo_quest, and shared_habit data in Supabase is scoped to the buddy pair — no row is readable by a third user
**Plans**: TBD

### Phase 16: Shared Activities & Duo Quests
**Goal**: Buddy pairs can track a shared habit together and complete cooperative duo quests that reward both players individually and with bonus XP upon joint completion
**Depends on**: Phase 15
**Requirements**: DUOQ-01, DUOQ-02, DUOQ-03, DUOQ-04, DUOQ-05
**Success Criteria** (what must be TRUE):
  1. Player can propose a shared habit goal with a buddy; both players see the shared habit in their habit list and can track it independently
  2. Player can create a duo quest with a buddy; both players see their required action and can mark their part complete
  3. Each player receives individual XP when they complete their part; when both complete, both receive additional bonus shared XP
  4. If a partner is inactive for 48 hours the quest pauses with a visible notice; after 72 hours of inactivity the active player can exit with partial XP credit
  5. Duo quest progress display shows aggregate completion percentage only — never reveals whether the partner completed a specific worship act
**Plans**: TBD

### Phase 17: Messaging & Content Moderation
**Goal**: Connected buddies can send and receive text messages that are filtered on both client and server, with offline queuing, message history, and report/block tools
**Depends on**: Phase 15, Phase 16
**Requirements**: MSSG-01, MSSG-02, MSSG-03, MSSG-04, MSSG-05, MSSG-06
**Success Criteria** (what must be TRUE):
  1. Player can open a conversation with any connected buddy and send and receive text messages in real time
  2. A message containing obvious profanity is blocked client-side before it reaches the server (leo-profanity filter)
  3. A message that passes client-side filter is still evaluated by the Edge Function before database insertion — a rejected message surfaces an error to the sender and is never stored
  4. Full conversation history per buddy is viewable when the player opens the chat screen
  5. Player can report a specific message or block a buddy from within the chat screen; both actions take effect immediately
  6. Messages composed while offline are queued locally and automatically sent when connectivity is restored, in order
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Master Blueprint | v1.0 | 7/7 | Complete | 2026-03-07 |
| 2. Foundation and Data Layer | v1.0 | 3/3 | Complete | 2026-03-09 |
| 3. Core Habit Loop | v1.0 | 6/6 | Complete | 2026-03-10 |
| 4. Game Engine and Progression | v1.0 | 4/4 | Complete | 2026-03-15 |
| 5. HUD, Visual Identity, and Muhasabah | v1.0 | 4/4 | Complete | 2026-03-16 |
| 6. Onboarding, Profile, and Notifications | v1.0 | 4/4 | Complete | 2026-03-16 |
| 7. Backend, Auth, and Sync | v1.0 | 5/5 | Complete | 2026-03-18 |
| 8. Critical Integration Wiring | v1.0 | 2/2 | Complete | 2026-03-18 |
| 9. Verification and Audit Cleanup | v1.0 | 2/2 | Complete | 2026-03-19 |
| 10. Title Pipeline and Integration Fixes | v1.0 | 1/1 | Complete | 2026-03-19 |
| 11. Schema & Privacy Gate Foundation | 2/2 | Complete    | 2026-03-20 | - |
| 12. Friday Power-Ups | v2.0 | 0/TBD | Not started | - |
| 13. Dopamine Detox Dungeon | v2.0 | 0/TBD | Not started | - |
| 14. Nafs Boss Arena | v2.0 | 0/TBD | Not started | - |
| 15. Buddy Connection System | v2.0 | 0/TBD | Not started | - |
| 16. Shared Activities & Duo Quests | v2.0 | 0/TBD | Not started | - |
| 17. Messaging & Content Moderation | v2.0 | 0/TBD | Not started | - |
