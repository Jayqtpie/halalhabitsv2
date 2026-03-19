# HalalHabits: Ferrari 16-Bit Edition

## What This Is

A game-first Islamic discipline platform that helps Muslims build consistency in worship anchors, focus, character habits, and anti-distraction behavior. It feels like a premium retro RPG fused with modern mobile UX — not a checklist app with badges. The creative direction is "Ferrari x 16-bit": high-performance, elite precision, emotional intensity, retro game soul, modern product polish.

## Core Value

Players build real-world Islamic discipline through game mechanics that motivate behavior without claiming to measure spiritual worth. The core loop must make daily return feel natural, not forced.

## Requirements

### Validated

- [x] Core daily loop — habits tracked, XP earned, streaks maintained (Validated in Phase 3: Core Habit Loop)
- [x] Salah Streak Shield system (Validated in Phase 3: Core Habit Loop)
- [x] Habit Forge — custom habit creation and tracking (Validated in Phase 3: Core Habit Loop)
- [x] Quest Board — daily/weekly quests (Validated in Phase 3: Core Habit Loop)
- [x] Nightly Muhasabah — evening reflection (Validated in Phase 5: HUD, Visual Identity & Muhasabah)
- [x] Mercy Mode — compassionate streak recovery (Validated in Phase 3: Core Habit Loop)
- [x] Identity Titles and progression system (Validated in Phase 4: Game Engine & Progression, wiring completed Phase 10)
- [x] Home HUD with game-world feel (Validated in Phase 5: HUD, Visual Identity & Muhasabah)
- [x] Offline-first with sync (Validated in Phase 7: Backend, Auth & Sync)
- [x] Privacy-first defaults — all worship data local (Validated in Phase 7: Backend, Auth & Sync)
- [x] Title pipeline wired to real data — integration gaps closed (Validated in Phase 10: Title Pipeline & Integration Fixes)

### Active

**Phase A: Master Blueprint (Design Document)**
- [ ] 16-section product design document covering executive vision, game design, worldbuilding, feature systems, UX flows, screen specs, UI tokens, sound/haptics, tech architecture, data model, telemetry, QA plan, delivery roadmap, content pack, and build handoff
- [ ] Implementation-ready specs that a build team could execute directly

**Phase B: MVP App Build**
- [ ] Core daily loop — habits tracked, XP earned, streaks maintained
- [ ] Salah Streak Shield system
- [ ] Habit Forge (custom habit creation and tracking)
- [ ] Quest Board (daily/weekly quests)
- [ ] Nightly Muhasabah (evening reflection)
- [ ] Mercy Mode (compassionate streak recovery)
- [ ] Identity Titles and progression system
- [ ] Home HUD with game-world feel
- [ ] Onboarding with Niyyah (intention setting)
- [ ] Profile, history, and settings
- [ ] Offline-first with sync
- [ ] Privacy-first defaults (all worship data local)

### Out of Scope

- Fatwa engine or religious authority claims — app motivates behavior, not spiritual judgment
- Public leaderboards for worship — violates adab safety rails
- Monetization at MVP — future cosmetic-only Barakah shop
- Social features at MVP — Private Accountability Duos deferred to Phase 3
- Nafs Boss Arena — deferred to Phase 2 retention systems
- Dopamine Detox Dungeon — deferred to Phase 2
- Friday Power-Ups — deferred to Phase 2
- Web version — mobile-first, cross-platform via React Native but App Store first

## Context

**Audience:** Muslims 16-35, digitally native, struggling with inconsistency and doomscrolling, wanting deen + dunya integration. Secondary: Muslim creators, students, founders needing structure around prayer anchors and deep work.

**Market gap:** Existing Islamic apps are either reminder/checklist tools (no game feel) or generic habit trackers (no spiritual context). Nothing combines respectful Islamic framing with genuine game design that creates intrinsic motivation.

**Ethics (Hard Constraints — Adab Safety Rails):**
1. No public leaderboard for worship performance
2. No language implying app can measure iman/taqwa
3. No mockery or trivialization of sacred acts
4. No addiction dark patterns (infinite variable reward spam, guilt loops)
5. No shame copy for missed days
6. Privacy-first defaults
7. Religious copy must be reverent and careful
8. Recovery paths built-in (Mercy Mode)

**XP Philosophy:** "Score motivates behavior, not spiritual worth." Effort-based, not outcome-based — completing the action scores, not spiritual quality.

**Emotional Tone:** Serious but energizing. Respectful but exciting. Challenging but compassionate. No cringe, no corny gamification.

## Constraints

- **Tech stack**: React Native (Expo) + Supabase — best for solo dev, fast ship, cross-platform mobile
- **Platform**: App Store first priority, Android via React Native cross-platform
- **Team**: Solo developer with Claude assistance
- **Privacy**: All worship data local-first, no public worship leaderboards ever
- **Content sensitivity**: All religious copy reviewed for adab compliance
- **Offline**: Must work offline with eventual sync

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native (Expo) over native | Solo dev needs cross-platform; Expo has mature ecosystem for mobile | -- Pending |
| Supabase over Firebase | Postgres > NoSQL for relational habit data; row-level security for privacy | -- Pending |
| Blueprint-first approach | 16-section design doc before code ensures coherent game design | -- Pending |
| Effort-based XP, not outcome-based | Prevents spiritual judgment; rewards discipline not perceived piety | -- Pending |
| No monetization at MVP | Focus on product-market fit; future cosmetic-only shop | -- Pending |
| Local-first worship data | Privacy is a hard constraint; sync for non-sensitive data only | -- Pending |

---
*Last updated: 2026-03-19 after Phase 10 completion — all 10 phases complete*
