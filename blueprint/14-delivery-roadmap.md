# 14 — Delivery Roadmap

> **Requirement:** BLUE-14
> **Cross-references:** [Tech Architecture](./10-tech-architecture.md) · [Data Model](./11-data-model.md) · [Telemetry](./12-telemetry.md) · [QA & Balance](./13-qa-balance.md) · [Game Design Bible](./03-game-design-bible.md) · [Feature Systems](./05-feature-systems.md) · [Screen Specs](./07-screen-specs.md) · [UI Design Tokens](./08-ui-design-tokens.md)
> **See also:** [ROADMAP.md](../.planning/ROADMAP.md) (project-level phase definitions)

---

## Delivery Overview

HalalHabits is built in 7 phases. Phase 1 (this Blueprint) defines everything. Phases 2-7 build the app incrementally, each delivering a self-contained, testable capability.

**Team:** Solo developer + Claude Code workflow (AI-assisted development)
**Platform:** React Native (Expo), iOS + Android
**Build system:** EAS Build (required for iOS; Windows dev machine)
**Methodology:** 14-day sprints per phase (see Sprint Template below)
**Source of truth:** This Blueprint. If code contradicts the Blueprint, the Blueprint wins.

**Key principle:** Each phase ships a working, testable artifact. No phase depends on "finishing later." If Phase 3 is the last phase completed, the app has a complete habit loop with streaks and Mercy Mode — it just lacks game progression, HUD visuals, and backend sync.

---

## Phase-by-Phase Breakdown

### Phase 2: Foundation and Data Layer

**Depends on:** Phase 1 (Blueprint complete)
**Duration estimate:** 1 sprint (14 days)

**Deliverables:**

- [ ] Expo project scaffold with EAS Build pipeline (iOS + Android dev builds)
- [ ] Expo Router navigation: tab layout (Home, Habits, Quests, Profile) + stack screens
- [ ] SQLite database schema with migration system (all entities from [Data Model](./11-data-model.md))
- [ ] Zustand stores: habits, game, ui, settings (domain-split per [Tech Architecture](./10-tech-architecture.md))
- [ ] Privacy Gate module: classifies data as PRIVATE vs SYNCABLE, blocks private data from sync path
- [ ] Design token system: colors, typography, spacing, radius from [UI Design Tokens](./08-ui-design-tokens.md) as runtime constants
- [ ] i18n infrastructure: i18next configured with English strings, RTL-ready layout
- [ ] Telemetry service: event dispatcher with privacy gate check, opt-out toggle, batched transmission
- [ ] SQLite vs WatermelonDB spike: build the same read/write test with both, choose based on DX and performance

**Key Risks:**

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| WatermelonDB vs expo-sqlite decision paralysis | High | Medium | Time-boxed spike (2 days max). If unclear, default to expo-sqlite (simpler, fewer dependencies). |
| EAS Build configuration issues (first-time setup) | Medium | Medium | Follow Expo docs exactly. Budget 1 full day for build pipeline. Test on both platforms early. |
| Design token system too rigid for HUD vs modern-UI split | Low | Low | Define two token subsets from the start: `hud.*` and `ui.*`. |

**Definition of Done:**

- [ ] App builds and runs on physical device via EAS Build (not Expo Go)
- [ ] User can navigate between all 4 tabs with smooth transitions
- [ ] Data written to SQLite persists across app restarts (write → kill → relaunch → read)
- [ ] Privacy Gate correctly blocks test PRIVATE data from the sync-eligible code path
- [ ] Design tokens render correctly: emerald buttons, dark charcoal backgrounds, pixel font headers
- [ ] SQLite decision is made and documented

**Estimated Complexity:** Medium

---

### Phase 3: Core Habit Loop

**Depends on:** Phase 2 (navigation, SQLite, stores, Privacy Gate)
**Duration estimate:** 1 sprint (14 days)

**Deliverables:**

- [ ] Habit Forge: preset Islamic habit library (15 habits per [Feature Systems](./05-feature-systems.md))
- [ ] Custom habit creation: name, frequency, time window, difficulty, category, icon
- [ ] Habit list screen: daily checklist with tap-to-complete
- [ ] Habit detail screen: calendar/heatmap history, edit, pause, archive
- [ ] Prayer time integration: adhan-js for 5 daily prayer windows based on user location
- [ ] Calculation method selector (ISNA, MWL, Egyptian, etc.)
- [ ] Streak engine: per-habit streak tracking with midnight-boundary day logic
- [ ] Streak multiplier: 1.0x base, +0.1x/day, cap 3.0x (per [Game Design Bible](./03-game-design-bible.md))
- [ ] Mercy Mode: automatic activation on streak break, recovery quest flow, 25% partial streak credit
- [ ] Timezone edge case handling: client-timestamp authority, DST, travel (per [QA & Balance](./13-qa-balance.md))

**Key Risks:**

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| adhan-js accuracy across calculation methods | Medium | High | Test against known prayer time tables for 5 cities across 4 methods. Budget 1 day for validation. |
| Streak edge cases (timezone, pause/resume) | Medium | Medium | Implement the 12 streak edge case tests from QA plan as unit tests before writing streak logic (TDD). |
| Mercy Mode recovery flow UX complexity | Low | Medium | Start with simplest flow (single recovery quest), iterate if needed. |

**Definition of Done:**

- [ ] User can create a preset habit and complete it with a single tap
- [ ] User can create a custom habit with all fields
- [ ] Salah habits show correct prayer time windows for user's location
- [ ] Streak counter increments on consecutive-day completions
- [ ] Streak multiplier calculates correctly (verified by simulation tests)
- [ ] Mercy Mode activates on streak break with compassionate copy
- [ ] All 10 timezone edge cases from QA plan pass
- [ ] All 12 streak edge cases from QA plan pass

**Estimated Complexity:** High

---

### Phase 4: Game Engine and Progression

**Depends on:** Phase 3 (habits, streaks, and XP triggers exist)
**Duration estimate:** 1 sprint (14 days)

**Deliverables:**

- [ ] XP calculation engine: base XP per habit type, streak multiplier, soft daily cap (~500 XP)
- [ ] XP ledger: immutable log of all XP transactions with source tracking
- [ ] Level-up system: XP thresholds per level using `40 * level^1.85` formula
- [ ] Level-up UI: celebration animation, XP bar fill, new level announcement
- [ ] Identity Titles: 26 titles (10 Common, 10 Rare, 6 Legendary) with unlock condition checks
- [ ] Title gallery screen: all titles with locked/unlocked state and progress indicators
- [ ] Quest Board: daily and weekly quest generation, progress tracking, completion rewards
- [ ] Quest rotation: weekly refresh with daily partial rotation option (informed by A/B test)
- [ ] XP simulation tests: all 11 test cases from [QA & Balance](./13-qa-balance.md) passing
- [ ] Exploit mitigations: daily cap enforcement, single-completion-per-period, recovery XP limits

**Key Risks:**

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| XP economy balance feels wrong in practice | High | Medium | Run all 11 simulation tests. Playtest for 1 week with real usage. XP formula constants are configurable (not hardcoded). |
| Quest generation lacks variety | Medium | Low | Start with 30+ quest templates. Rotation algorithm ensures no repeats within 3 days. |
| Title unlock conditions too easy or too hard | Medium | Medium | Title thresholds are configurable. Monitor unlock rates via telemetry. |

**Definition of Done:**

- [ ] User earns XP for habit completion and sees total increase
- [ ] Level-up triggers at correct XP thresholds (verified against simulation table)
- [ ] All 11 XP simulation test cases pass
- [ ] User can view title gallery with progress toward next unlock
- [ ] Quest Board shows daily and weekly quests with completion tracking
- [ ] All exploit test cases from QA plan pass
- [ ] XP uses "discipline" framing everywhere (no worship score language)

**Estimated Complexity:** High

---

### Phase 5: HUD, Visual Identity, and Muhasabah

**Depends on:** Phase 4 (XP, levels, titles, and quests feed into HUD display)
**Duration estimate:** 1 sprint (14 days)

**Deliverables:**

- [ ] Skia-rendered Home HUD: game world scene with level, XP bar, streak count, active quests
- [ ] 4 HUD environments: Quiet Study, Growing Garden, Scholar's Courtyard, Living Sanctuary
- [ ] Environment transitions: unlock based on player level thresholds
- [ ] Pixel art rendering pipeline: FilterQuality.None, sprite sheet loading, animation frames
- [ ] XP gain animation: floating numbers, XP bar fill, particle effects (60fps via Reanimated)
- [ ] Level-up animation: full-screen celebration with haptic feedback
- [ ] Haptic feedback: tap, completion, level-up, quest complete (per [Sound & Haptics](./09-sound-haptics.md))
- [ ] Muhasabah flow: nightly reflection with 2-3 rotating prompts, 30-60 second completion
- [ ] Muhasabah privacy: all data device-only (PRIVATE classification), skip without penalty
- [ ] Reduced motion mode: all animations respect system accessibility setting

**Key Risks:**

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| Pixel art rendering performance on low-end devices | High | High | Test on oldest supported device early (Phase 5 Day 1). Use Skia offscreen canvas for complex scenes. Reduce particle count if needed. |
| Sprite sheet / asset pipeline not established | High | Medium | Create placeholder pixel art for Day 1. Establish the pipeline (loading, caching, rendering) before creating final assets. |
| HUD environment transitions feel jarring | Medium | Low | Use fade transitions between environments. Each environment shares the same layout structure with different assets. |

**Definition of Done:**

- [ ] Home HUD renders at 60fps on mid-range device
- [ ] XP and level-up animations are smooth and satisfying
- [ ] Haptic feedback fires on all specified interactions
- [ ] HUD environment changes based on player level
- [ ] Muhasabah presents prompts and stores responses device-only
- [ ] Muhasabah is skippable with zero penalty or shame copy
- [ ] Reduced motion mode disables all animations cleanly

**Estimated Complexity:** High

---

### Phase 6: Onboarding, Profile, and Notifications

**Depends on:** Phase 5 (HUD exists so onboarding can show the game world preview)
**Duration estimate:** 1 sprint (14 days)

**Deliverables:**

- [ ] Onboarding flow: Welcome, Niyyah (intention setting), Habit selection, Game intro, Done
- [ ] Onboarding completes in under 2 minutes
- [ ] Profile screen: title, level, XP, streak history, achievements, identity card
- [ ] Settings screen: notifications, prayer calculation method, telemetry opt-out, dark mode, privacy controls
- [ ] Data export: JSON export of all user data
- [ ] Data deletion: complete wipe with confirmation
- [ ] Notification system: local notifications for prayer reminders, Muhasabah prompt, quest refresh
- [ ] Notification copy review: all templates pass content sensitivity checklist
- [ ] Notification preferences: per-category enable/disable

**Key Risks:**

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| Onboarding flow too long (> 2 min) | Medium | Medium | Playtest with timer. Cut steps if needed (niyyah can be optional). |
| Notification permissions denied by user | High | Low | App works without notifications. Explain value proposition before requesting permission. |
| Data export format decisions | Low | Low | JSON is the default. Follow GDPR export patterns. |

**Definition of Done:**

- [ ] New user completes onboarding in under 2 minutes
- [ ] User can view profile with all progression data
- [ ] User can change all settings including prayer calculation method
- [ ] User can export and delete all personal data
- [ ] Notification copy passes adab compliance review (no shame, no guilt)
- [ ] Each notification category is independently toggleable

**Estimated Complexity:** Medium

---

### Phase 7: Backend, Auth, and Sync

**Depends on:** Phase 6 (all client features complete; backend adds cloud layer)
**Duration estimate:** 1 sprint (14 days)

**Deliverables:**

- [ ] Supabase project setup: Postgres schema (SYNCABLE entities only), Edge Functions, Storage
- [ ] Authentication: email, Apple Sign-In, Google Sign-In via Supabase Auth
- [ ] Row-Level Security: every table enforces user-only access at database level
- [ ] Sync engine: offline queue with conflict resolution (last-write-wins for settings, idempotent for completions)
- [ ] Privacy Gate enforcement: automated test that PRIVATE entities never appear in sync payloads
- [ ] Push notifications: Supabase Edge Function sends prayer reminders and Muhasabah prompts
- [ ] Offline resilience: app works identically offline for 3+ days, syncs correctly on reconnect
- [ ] Sync conflict testing: simulate concurrent edits from two devices, verify resolution

**Key Risks:**

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|-----------|
| Sync conflict resolution complexity | High | High | Start with last-write-wins (simplest). Habit completions are idempotent (same completion = no conflict). Only settings and profile need conflict resolution. |
| Privacy Gate bypass via sync | Medium | Critical | Automated integration test: attempt to sync every PRIVATE entity type, verify all are blocked. Run on every build. |
| Push notification delivery reliability | Medium | Medium | Use Supabase Edge Functions + Expo Push API. Test on both platforms. Fall back to local notifications if push fails. |
| Apple/Google auth review requirements | Medium | Medium | Follow platform guidelines exactly. Budget time for App Store review. Test auth on real devices early. |

**Definition of Done:**

- [ ] User can create account with email, Apple, or Google
- [ ] SYNCABLE data syncs to Supabase; PRIVATE data stays on device (automated test)
- [ ] App works offline for 3+ days then syncs correctly with no data loss
- [ ] RLS enforces user-only access (test: user A cannot read user B's data)
- [ ] Push notifications delivered for prayer reminders
- [ ] Privacy Gate automated test passes on every build

**Estimated Complexity:** High

---

## Cross-Phase Dependencies

```
Phase 1: Master Blueprint
    │
    ▼
Phase 2: Foundation ──────────────────────────────────────────┐
    │  (Expo, SQLite, stores, Privacy Gate, tokens, i18n)     │
    ▼                                                          │
Phase 3: Core Habit Loop ─────────────────────────────┐       │
    │  (habits, prayer, streaks, Mercy Mode)           │       │
    ▼                                                   │       │
Phase 4: Game Engine ──────────────────────────┐       │       │
    │  (XP, levels, titles, quests)            │       │       │
    ▼                                           │       │       │
Phase 5: HUD & Muhasabah ─────────────┐       │       │       │
    │  (Skia rendering, animations,    │       │       │       │
    │   haptics, reflection)           │       │       │       │
    ▼                                   │       │       │       │
Phase 6: Onboarding & Settings        │       │       │       │
    │  (first launch, profile,         │       │       │       │
    │   notifications, data export)    │       │       │       │
    ▼                                   ▼       ▼       ▼       ▼
Phase 7: Backend & Sync ◄─────────── ALL CLIENT PHASES ──────┘
    (auth, Supabase, sync engine, push notifications, RLS)
```

**Dependency rules:**
- Each phase depends on the one before it (linear chain)
- Phase 7 (Backend) depends on ALL client phases being complete — it adds a cloud layer on top of a fully working offline app
- No circular dependencies
- Each phase is independently testable with mock data for features from later phases

---

## Top Risks (Project-Level)

| # | Risk | Probability | Impact | Mitigation |
|---|------|:-----------:|:------:|-----------|
| 1 | **SQLite library decision** (WatermelonDB vs expo-sqlite) | High | Medium | Phase 2 spike: 2 days max. Build identical read/write test with both. Default to expo-sqlite if unclear (simpler, official Expo support). |
| 2 | **Pixel art asset pipeline** | High | Medium | Validate Skia rendering approach in Phase 2 (proof of concept). Use placeholder assets until pipeline is proven. Establish sprite sheet format early. |
| 3 | **adhan-js accuracy** across calculation methods and edge cases | Medium | High | Phase 3 Day 1: validate against known prayer time tables for 5 cities, 4 methods, DST boundaries. If accuracy is insufficient, evaluate alternative libraries. |
| 4 | **XP economy balance** (feels wrong in practice despite simulation) | High | Medium | All XP constants are configurable (not hardcoded). Run 11 simulation tests. Playtest for 1 week. Post-launch tuning is expected and budgeted. |
| 5 | **Solo dev scope management** (feature creep) | High | High | Ruthless scope control: if it's not in this Blueprint, it doesn't ship in v1. Defer to v2 list in [REQUIREMENTS.md](../.planning/REQUIREMENTS.md). Every feature request gets "which v1 feature does this replace?" |
| 6 | **iOS build pipeline** (Windows dev, EAS cloud builds) | Medium | Medium | Set up EAS Build in Phase 2 Day 1. Budget a full day for first successful iOS build. Keep a log of EAS gotchas. |
| 7 | **Performance on low-end devices** (Skia HUD + animations) | Medium | High | Test on oldest supported device starting Phase 5 Day 1. Set performance budget: 60fps on mid-range, 30fps acceptable on low-end. Reduce particle effects if needed. |

---

## 14-Day Sprint Template

A reusable two-week structure for each app-build phase (Phases 2-7). Adapt as needed per phase complexity.

```
┌─────────────────────────────────────────────────────┐
│                   SPRINT: PHASE N                    │
├──────────┬──────────────────────────────────────────┤
│ Days 1-2 │ PLAN & SETUP                             │
│          │ - Review Blueprint sections for phase     │
│          │ - Set up dev environment / dependencies   │
│          │ - Write failing tests (TDD RED phase)     │
│          │ - Identify risks and unknowns             │
│          │ - Spike any unresolved technical questions │
├──────────┼──────────────────────────────────────────┤
│ Days 3-8 │ CORE IMPLEMENTATION                       │
│          │ - Build features per plan deliverables     │
│          │ - Write tests alongside code (TDD GREEN)  │
│          │ - Commit per feature (atomic commits)     │
│          │ - Daily self-review of adab compliance     │
├──────────┼──────────────────────────────────────────┤
│ Days 9-10│ INTEGRATION & EDGE CASES                  │
│          │ - Wire features together end-to-end       │
│          │ - Implement edge cases from QA plan       │
│          │ - Run integration tests                   │
│          │ - Fix bugs found during integration       │
├──────────┼──────────────────────────────────────────┤
│ Days 11-12│ TESTING & POLISH                         │
│          │ - Run full test suite (unit + integration) │
│          │ - Manual QA checklist for this phase       │
│          │ - Accessibility check                     │
│          │ - Content sensitivity scan                │
│          │ - Performance profiling (if applicable)    │
├──────────┼──────────────────────────────────────────┤
│ Days 13-14│ RETROSPECTIVE & HANDOFF                  │
│          │ - Write phase SUMMARY.md                   │
│          │ - Document decisions and deviations        │
│          │ - Update STATE.md and ROADMAP.md           │
│          │ - Verify Definition of Done checklist      │
│          │ - Prep context for next phase              │
└──────────┴──────────────────────────────────────────┘
```

**Sprint health signals:**
- By Day 4: at least 30% of deliverables have passing tests
- By Day 8: all core features implemented (even if rough)
- By Day 10: all edge cases handled, integration working
- By Day 12: all tests passing, manual QA complete
- Day 14: Definition of Done met or blockers documented

**If behind schedule:** Cut scope, not quality. Move non-critical deliverables to the next phase. Document in SUMMARY.md.

---

## Total Project Timeline Estimate

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Blueprint | Complete | -- |
| Phase 2: Foundation | 14 days | 2 weeks |
| Phase 3: Core Habit Loop | 14 days | 4 weeks |
| Phase 4: Game Engine | 14 days | 6 weeks |
| Phase 5: HUD & Muhasabah | 14 days | 8 weeks |
| Phase 6: Onboarding & Settings | 14 days | 10 weeks |
| Phase 7: Backend & Sync | 14 days | 12 weeks |

**Total estimated build time:** 12 weeks (84 days) after Blueprint completion.

**Buffer:** Add 20% contingency = ~14.4 weeks realistic. Round to **15 weeks** total.

**Caveat:** Solo developer with AI-assisted workflow. Estimates assume focused, full-time effort. Part-time development extends timeline proportionally.

---

*Section 14 of 16 — Master Blueprint*
*Requirement: BLUE-14*
