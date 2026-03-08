# Roadmap: HalalHabits Ferrari 16-Bit Edition

## Overview

HalalHabits ships in two milestones. First, a 16-section Master Blueprint document that defines every system, screen, and design token so the app build has no ambiguity. Second, the app itself: an offline-first React Native game-meets-habit-tracker built in six phases from data layer through backend sync. Each phase delivers a coherent, testable capability. The Blueprint comes first because building without it means redesigning mid-flight.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Master Blueprint** - Complete 16-section design document that makes every app-build decision upfront (completed 2026-03-07)
- [ ] **Phase 2: Foundation and Data Layer** - Expo scaffold, navigation, SQLite persistence, state management, privacy boundaries, and design tokens
- [ ] **Phase 3: Core Habit Loop** - Habit tracking, prayer time integration, streaks, and Mercy Mode recovery -- the product's reason to exist
- [ ] **Phase 4: Game Engine and Progression** - XP system, leveling, Identity Titles, Quest Board, and balanced game economy
- [ ] **Phase 5: HUD, Visual Identity, and Muhasabah** - 16-bit Home HUD with Skia rendering, animations, haptics, and nightly reflection
- [ ] **Phase 6: Onboarding, Profile, and Notifications** - First-launch Niyyah flow, profile/settings screens, and notification system
- [ ] **Phase 7: Backend, Auth, and Sync** - Supabase auth, sync engine with conflict resolution, push notifications, and RLS enforcement

## Phase Details

### Phase 1: Master Blueprint
**Goal**: A complete, implementation-ready design document that eliminates ambiguity before any code is written
**Depends on**: Nothing (first phase)
**Requirements**: BLUE-01, BLUE-02, BLUE-03, BLUE-04, BLUE-05, BLUE-06, BLUE-07, BLUE-08, BLUE-09, BLUE-10, BLUE-11, BLUE-12, BLUE-13, BLUE-14, BLUE-15, BLUE-16
**Success Criteria** (what must be TRUE):
  1. A developer can read the Blueprint and build any screen without asking clarifying questions about layout, copy, interactions, or edge states
  2. The XP economy is modeled with a progression curve from level 1 to 100 including time-to-level estimates and unlock schedule
  3. Every screen in the app has a written spec with purpose, components, interactions, animation notes, and edge states
  4. The data model defines every entity, relationship, and privacy classification (private vs syncable)
  5. Adab safety rails are documented with specific copy examples showing what language is and is not acceptable
**Plans**: 7 plans

Plans:
- [ ] 01-01-PLAN.md — Executive vision, player fantasy, and Game Design Bible (foundation sections)
- [ ] 01-02-PLAN.md — Worldbuilding/lore framework and feature systems detailed specs
- [ ] 01-03-PLAN.md — Information architecture and screen-by-screen product spec (14+ screens)
- [ ] 01-04-PLAN.md — UI design tokens, sound/haptics direction, and tech architecture
- [ ] 01-05-PLAN.md — Data model and API contract with privacy classifications
- [ ] 01-06-PLAN.md — Telemetry plan, QA/balance plan, and delivery roadmap
- [ ] 01-07-PLAN.md — Content pack (130+ copy strings) and final build handoff

### Phase 2: Foundation and Data Layer
**Goal**: A running Expo app with navigation, local persistence, state management, and privacy boundaries -- the skeleton everything else plugs into
**Depends on**: Phase 1
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, FOUN-07
**Success Criteria** (what must be TRUE):
  1. The app builds and runs on a physical device via EAS Build (not Expo Go)
  2. User can navigate between tab screens (Home, Habits, Quests, Profile) with smooth transitions
  3. Data written to SQLite persists across app restarts with no data loss
  4. The Privacy Gate correctly classifies sample data and blocks private data from the sync-eligible path
  5. Design tokens render the 16-bit aesthetic (colors, typography, spacing) consistently across screens
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Expo scaffold, design tokens, and i18n infrastructure (completed 2026-03-08)
- [ ] 02-02-PLAN.md — SQLite schema with Drizzle ORM, DAO/repository layer, and Privacy Gate
- [ ] 02-03-PLAN.md — Zustand stores, tab navigation with custom pixel tab bar, and visual spikes

### Phase 3: Core Habit Loop
**Goal**: Users can track Islamic habits daily, see prayer-aware time windows, build streaks, and recover compassionately when they miss -- the complete daily discipline loop
**Depends on**: Phase 2
**Requirements**: HBIT-01, HBIT-02, HBIT-03, HBIT-04, HBIT-05, HBIT-06, PRAY-01, PRAY-02, PRAY-03, PRAY-04, STRK-01, STRK-02, STRK-03, STRK-04, STRK-05
**Success Criteria** (what must be TRUE):
  1. User can create a habit from the Islamic preset library and complete it with a single tap
  2. User can create a custom habit with name, frequency, and optional time window
  3. Salah habits display correct prayer time windows based on user location and selected calculation method
  4. User can view their streak count for each habit and see a calendar/heatmap of past completions
  5. When a streak breaks, Mercy Mode activates with a compassionate recovery path (no shame language anywhere)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Game Engine and Progression
**Goal**: Habit completions feed a balanced game economy with XP, levels, titles, and quests that motivate discipline without implying spiritual judgment
**Depends on**: Phase 3
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06
**Success Criteria** (what must be TRUE):
  1. User earns XP for each habit completion and sees their XP total increase
  2. User levels up through XP accumulation with a logarithmic curve that feels rewarding at every stage
  3. User unlocks Identity Titles at real consistency milestones (e.g., 40 consecutive Fajr prayers)
  4. Quest Board presents daily and weekly quests that rotate with variety, completable for bonus XP
  5. All XP-related UI uses "discipline" framing, never "worship score" or spiritual judgment language
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: HUD, Visual Identity, and Muhasabah
**Goal**: The app looks and feels like a premium retro RPG with a game-world Home HUD, smooth animations, haptic feedback, and a private nightly reflection ritual
**Depends on**: Phase 4
**Requirements**: HUD-01, HUD-02, HUD-03, HUD-04, MUHA-01, MUHA-02, MUHA-03, MUHA-04
**Success Criteria** (what must be TRUE):
  1. Home screen displays a game-world HUD with current level, XP bar, streak count, and active quests in 16-bit pixel art
  2. XP gain and level-up animations run at smooth 60fps with satisfying haptic feedback
  3. Nightly Muhasabah presents structured reflection prompts completable in 30-60 seconds
  4. Muhasabah data stays on-device only and user can skip reflection without any penalty or shame
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Onboarding, Profile, and Notifications
**Goal**: New users experience a compelling Niyyah-based first launch, returning users manage their profile and settings, and notifications invite (never guilt) users back
**Depends on**: Phase 5
**Requirements**: ONBR-01, ONBR-02, ONBR-03, ONBR-04, PROF-01, PROF-02, PROF-03, PROF-04, NOTF-01, NOTF-02, NOTF-03, NOTF-04
**Success Criteria** (what must be TRUE):
  1. New user completes onboarding in under 2 minutes, sets a Niyyah, selects initial habits, and understands the game metaphor
  2. User can view their profile with title, level, XP, streak history, and achievements
  3. User can configure notification preferences, prayer calculation method, dark mode, and privacy controls
  4. User can export or delete all personal data from settings
  5. All notification copy is invitational ("Ready for Dhuhr?") never guilt-based ("You missed Dhuhr!")
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD
- [ ] 06-03: TBD

### Phase 7: Backend, Auth, and Sync
**Goal**: Users can create accounts, sync non-private data across devices, and receive push notifications -- all while the app continues working perfectly offline
**Depends on**: Phase 6
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-05
**Success Criteria** (what must be TRUE):
  1. User can create an account with email, Apple, or Google sign-in
  2. Non-private data (XP, settings, profile) syncs to Supabase when online; private data (worship logs, Muhasabah) never leaves the device
  3. App works identically when offline for 3+ days, then syncs correctly when connectivity returns with no duplicate or lost entries
  4. Push notifications are delivered via Supabase Edge Functions for prayer reminders and Muhasabah prompts
  5. Row-Level Security enforces that users can only access their own data at the database level
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Master Blueprint | 7/7 | Complete   | 2026-03-07 |
| 2. Foundation and Data Layer | 1/3 | In progress | - |
| 3. Core Habit Loop | 0/3 | Not started | - |
| 4. Game Engine and Progression | 0/2 | Not started | - |
| 5. HUD, Visual Identity, and Muhasabah | 0/2 | Not started | - |
| 6. Onboarding, Profile, and Notifications | 0/3 | Not started | - |
| 7. Backend, Auth, and Sync | 0/2 | Not started | - |
