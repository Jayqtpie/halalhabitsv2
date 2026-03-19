# Requirements: HalalHabits Ferrari 16-Bit Edition

**Defined:** 2026-03-07
**Core Value:** Players build real-world Islamic discipline through game mechanics that motivate behavior without claiming to measure spiritual worth.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Blueprint Document

- [ ] **BLUE-01**: Executive product vision with market gap analysis and differentiation narrative
- [ ] **BLUE-02**: Player fantasy and behavioral model (first 60 seconds, daily return, identity transformation, behavioral science)
- [ ] **BLUE-03**: Game Design Bible (core/meta/long loops, progression, XP model, streak model, boss progression, failure/recovery, anti-burnout)
- [ ] **BLUE-04**: Worldbuilding and lore framework (discipline metaphor, environments, enemy/boss archetypes, titles, seasonal events)
- [ ] **BLUE-05**: Feature systems detailed specs (Habit Forge, Quest Board, Salah Streak Shield, Nafs Boss Arena, Dopamine Detox Dungeon, Mercy Mode, Identity Titles, Friday Power-Ups, Muhasabah, Accountability Duos, Barakah economy)
- [ ] **BLUE-06**: Information architecture and full UX flow (onboarding-to-day-30 journey, nav model, key paths, drop-off risks, edge states)
- [ ] **BLUE-07**: Screen-by-screen product spec (12+ screens with purpose, layout, components, interactions, animations, copy tone, edge states)
- [ ] **BLUE-08**: UI system and design tokens (colors, typography, spacing, radius, HUD components, cards/buttons/inputs, iconography, motion, accessibility modes)
- [ ] **BLUE-09**: Sound and haptic direction (sound identity, event map, haptic rules, audio boundaries, focus mode)
- [ ] **BLUE-10**: Greenfield tech architecture (frontend, backend, data, auth, sync, analytics, notifications, offline, config)
- [ ] **BLUE-11**: Data model and API contract (entities, relationships, versioning, migration, privacy boundaries, endpoints, schemas)
- [x] **BLUE-12**: Telemetry and experimentation plan (privacy-safe events, north-star metric, retention metrics, burnout indicators, A/B tests, anti-metric traps)
- [x] **BLUE-13**: QA and balance plan (test strategy, XP/streak simulation, timezone edge cases, exploit testing, accessibility QA, content sensitivity checklist)
- [x] **BLUE-14**: Delivery roadmap (Phase 0-4 with deliverables, dependencies, risks, staffing, definition of done)
- [x] **BLUE-15**: Content pack (40 microcopy, 20 quest lines, 20 boss encounters, 20 mercy mode, 10 Friday power-ups, 20 notification templates)
- [x] **BLUE-16**: Final build handoff (founder brief, task tree, 14-day checklist, 30-day emergency cut plan, top 10 failure risks)

### Foundation

- [x] **FOUN-01**: Expo project scaffold with development builds (not Expo Go) and EAS Build pipeline
- [x] **FOUN-02**: Expo Router navigation structure with tab-based layout
- [x] **FOUN-03**: SQLite database schema with migrations for habits, completions, streaks, XP, titles, quests, muhasabah
- [x] **FOUN-04**: Zustand state management with domain-split stores (habits, game, ui, settings)
- [x] **FOUN-05**: Privacy Gate module classifying data as private (device-only) vs syncable
- [x] **FOUN-06**: Design token system (colors, typography, spacing, 16-bit aesthetic tokens)
- [x] **FOUN-07**: i18n infrastructure (i18next) for future RTL/Arabic support

### Habit Tracking

- [x] **HBIT-01**: User can create habits from preset Islamic library (5 salah, Quran reading, dhikr, fasting, dua)
- [x] **HBIT-02**: User can create custom habits with name, frequency, and optional time window
- [x] **HBIT-03**: User can complete a habit with single-tap check-in
- [x] **HBIT-04**: User can view daily habit list with completion status
- [x] **HBIT-05**: User can edit or archive habits
- [x] **HBIT-06**: User can view habit history in calendar/heatmap view

### Prayer Integration

- [x] **PRAY-01**: App calculates prayer times locally using adhan library based on user location
- [x] **PRAY-02**: User can select calculation method (ISNA, MWL, Egyptian, etc.)
- [x] **PRAY-03**: Salah habits display contextual time windows (e.g., Dhuhr available 12:05-3:30pm)
- [x] **PRAY-04**: Prayer time notifications remind user before each salah window

### Streaks and Recovery

- [x] **STRK-01**: User can see current streak count for each habit and overall
- [x] **STRK-02**: Salah Streak Shield protects streak when prayer is completed within its time window
- [x] **STRK-03**: Mercy Mode activates on streak break with compassionate recovery path (not shame)
- [x] **STRK-04**: User can recover streak through Mercy Mode completion tasks
- [x] **STRK-05**: Streak display frames consistency as "momentum" not "perfection"

### Game Engine

- [x] **GAME-01**: User earns XP for habit completions (effort-based, not outcome-based)
- [x] **GAME-02**: User levels up through XP accumulation with logarithmic progression curve
- [x] **GAME-03**: User unlocks Identity Titles at milestone thresholds (e.g., "The Steadfast" at 40 consecutive Fajr)
- [x] **GAME-04**: Quest Board presents daily and weekly quests with rotating variety
- [x] **GAME-05**: User can complete quests for bonus XP and progression
- [x] **GAME-06**: XP economy modeled and balanced (levels 1-100 progression curve)

### Home HUD

- [ ] **HUD-01**: Home screen displays game-world HUD with current level, XP bar, streak count, and active quests
- [x] **HUD-02**: HUD uses 16-bit pixel art aesthetic with crisp rendering (Skia FilterQuality.None)
- [ ] **HUD-03**: XP gain and level-up animations are smooth 60fps (Reanimated)
- [ ] **HUD-04**: Haptic feedback on habit completion, level-up, and quest completion

### Muhasabah

- [ ] **MUHA-01**: Nightly Muhasabah presents structured reflection prompts (30-60 seconds, not journaling)
- [ ] **MUHA-02**: User can review today's completions and set intention for tomorrow
- [ ] **MUHA-03**: Muhasabah data is private (device-only, never synced)
- [ ] **MUHA-04**: User can skip Muhasabah without penalty or shame

### Onboarding

- [x] **ONBR-01**: First-launch onboarding includes Niyyah (intention setting) flow
- [x] **ONBR-02**: User selects initial habits from preset library during onboarding
- [x] **ONBR-03**: Onboarding communicates game metaphor and XP philosophy clearly
- [x] **ONBR-04**: Onboarding is completable in under 2 minutes

### Profile and Settings

- [x] **PROF-01**: User can view profile with title, level, XP, streak history, and achievements
- [x] **PROF-02**: User can access settings for notifications, prayer calculation method, and privacy controls
- [x] **PROF-03**: User can export or delete all personal data
- [x] **PROF-04**: Dark mode supported (default or system-auto)

### Backend and Sync

- [x] **SYNC-01**: User can create account with email, Apple, or Google auth via Supabase
- [x] **SYNC-02**: Non-private data syncs to Supabase when online (XP, settings, profile)
- [x] **SYNC-03**: Sync engine handles offline queue with conflict resolution (idempotent completions)
- [x] **SYNC-04**: Push notifications delivered via Supabase Edge Functions
- [x] **SYNC-05**: Row-Level Security enforces data privacy at database level

### Notifications

- [x] **NOTF-01**: User receives prayer time reminders
- [x] **NOTF-02**: User receives gentle evening Muhasabah reminder
- [x] **NOTF-03**: Notification copy is invitational, never guilt-based ("Ready for Dhuhr?" not "You missed Dhuhr!")
- [x] **NOTF-04**: User can configure or disable any notification category

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Retention Systems (Phase 2)

- **BOSS-01**: Nafs Boss Arena with boss battles representing personal struggles
- **BOSS-02**: Dopamine Detox Dungeon with anti-doomscrolling challenge mechanics
- **FRDY-01**: Friday Power-Ups with Jumu'ah-specific bonuses

### Social (Phase 3)

- **SOCL-01**: Private Accountability Duos for two-person mutual accountability
- **SOCL-02**: Duo partner can see limited, non-worship progress data only

### Monetization (Phase 4+)

- **SHOP-01**: Barakah Shop with cosmetic-only items (no pay-to-win)
- **SHOP-02**: Visual customizations for HUD and profile

## Out of Scope

| Feature | Reason |
|---------|--------|
| Public worship leaderboards | Violates Islamic adab -- riya (showing off worship) is spiritually harmful |
| Iman/taqwa scoring | No app can measure spiritual state; theologically problematic |
| Fatwa engine or religious rulings | Requires scholarly authority; app stays in "motivation" lane |
| Full Quran reader | Muslim Pro and Quran.com do this well; don't compete on utility |
| AI-generated Islamic content | Hallucination risk with religious content is unacceptable |
| Social feed / timeline | Attracts doomscrolling -- the exact problem the audience wants to escape |
| Ad-supported free tier | Ads break immersion and degrade "Ferrari" brand |
| Apple Watch / wearable | Scope explosion for solo dev |
| Tablet-optimized layouts | Phone-first for MVP |
| Widget support | High platform-specific effort, not core value |
| Cross-app integrations (Apple Health, etc.) | Physical health tracking not core domain |
| Complex character customization | Massive complexity for solo dev; titles handle identity progression |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BLUE-01 through BLUE-16 | Phase 1: Master Blueprint | Complete (01-VERIFICATION) |
| FOUN-01 through FOUN-07 | Phase 2 + Phase 9 (verification) | Partial (code complete, verification pending) |
| HBIT-01, HBIT-02, HBIT-05 | Phase 3 + Phase 9 (verification) | Unsatisfied (code exists, no verification trail) |
| HBIT-03, HBIT-04, HBIT-06 | Phase 3: Core Habit Loop | Partial (listed in SUMMARYs, no VERIFICATION) |
| PRAY-01 through PRAY-04 | Phase 3 + Phase 9 (verification) | Orphaned (code exists, never tracked) |
| STRK-01 through STRK-05 | Phase 3: Core Habit Loop | Partial (listed in SUMMARYs, no VERIFICATION) |
| GAME-01 through GAME-06 | Phase 4: Game Engine and Progression | Complete (04-VERIFICATION) |
| HUD-01 through HUD-04 | Phase 5: HUD, Visual Identity, and Muhasabah | Complete (05-VERIFICATION) |
| MUHA-01 through MUHA-04 | Phase 5: HUD, Visual Identity, and Muhasabah | Complete (05-VERIFICATION) |
| ONBR-01 through ONBR-04 | Phase 6: Onboarding, Profile, and Notifications | Complete (06-VERIFICATION) |
| PROF-01 through PROF-04 | Phase 6: Onboarding, Profile, and Notifications | Complete (06-VERIFICATION) |
| NOTF-01 through NOTF-04 | Phase 6: Onboarding, Profile, and Notifications | Complete (06-VERIFICATION) |
| SYNC-01 through SYNC-05 | Phase 7 + Phase 8 (integration fix) | Partial (code complete, integration gaps in Phase 8) |

**Coverage:**
- v1 requirements: 62 total
- Mapped to phases: 62 (+ 2 gap closure phases)
- Satisfied: 50
- Partial: 12 (verification gaps)
- Unsatisfied: 7 (Phase 9 will close)
- Unmapped: 0

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after roadmap creation*
