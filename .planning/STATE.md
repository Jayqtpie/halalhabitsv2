---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_plan: 2 of 4 (Phase 5) — checkpoint awaiting human verify
status: verifying
stopped_at: Phase 6 context gathered
last_updated: "2026-03-16T01:38:40.781Z"
last_activity: "2026-03-15 -- 05-02: Home HUD assembled with HudScene (Skia Canvas), HudStatBar (BlurView), SceneObjects (tap zones), EnvironmentReveal, PrayerCountdown"
progress:
  total_phases: 7
  completed_phases: 5
  total_plans: 24
  completed_plans: 24
  percent: 92
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Players build real-world Islamic discipline through game mechanics that motivate behavior without claiming to measure spiritual worth.
**Current focus:** Phase 4 complete (Game Engine & Progression) -- ready for Phase 5

## Current Position

Phase: 5 of 7 (HUD, Visual Identity & Muhasabah — in progress)
Current Plan: 2 of 4 (Phase 5) — checkpoint awaiting human verify
Status: Home HUD assembled, awaiting device verification of visual output and tap zone interactions
Last activity: 2026-03-15 -- 05-02: Home HUD assembled with HudScene (Skia Canvas), HudStatBar (BlurView), SceneObjects (tap zones), EnvironmentReveal, PrayerCountdown

Progress: [█████████░] 92% overall (22/24 plans complete)
Overall: 4 complete phases (Phase 01-04), Phase 05 in progress (2/4 plans done)

## Performance Metrics

**By Phase:**

| Phase | Plans | Status | Completed |
|-------|-------|--------|-----------|
| Phase 01 | 7/7 | Complete | 2026-03-07 |
| Phase 02 | 3/3 | Complete | 2026-03-09 |
| Phase 03 | 6/6 | Complete | 2026-03-10 |
| Phase 04 | 3/3 | Complete | 2026-03-15 |

**Phase 4 Plan Breakdown:**

| Plan | Duration | Tasks | Description |
|------|----------|-------|-------------|
| 04-01 | 13min | 2 | XP engine, title engine, quest engine (pure TS domain modules, TDD) |
| 04-02 | 4min 28sec | 2 | titleRepo, gameStore orchestration, habitStore XP injection |
| 04-03 | ~15min | 2+checkpoint | XP feedback UI layer (6 game components + habits screen integration) |

**Phase 3 Plan Breakdown:**

| Plan | Duration | Tasks | Description |
|------|----------|-------|-------------|
| 03-01 | 5min | 3 | Domain types, presets, prayer times, location, habit sorter |
| 03-02 | 2min | 2 | Streak engine with full TDD |
| 03-03 | ~30min | 3 | Data wiring layer |
| 03-04 | 4min | 2 | Daily habit list screen |
| 03-05 | 6min | 2 | Habit creation & management |
| 03-06 | ~15min | 3 | Prayer, Mercy Mode, calendar, verification |
| Phase 04-game-engine-and-progression P04 | 5 | 2 tasks | 6 files |
| Phase 05-hud-visual-identity-and-muhasabah P04 | 4min | 1 tasks | 8 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Blueprint-first approach chosen: 16-section design doc before code ensures coherent game design
- Effort-based XP (not outcome-based): rewards discipline, not perceived piety
- Local-first worship data: privacy is architectural, not policy
- XP formula: 40 x level^1.85 -- fast early wins, logarithmic long tail
- Streak multiplier: 1.0x base, +0.1x/day, cap 3.0x per habit
- Soft daily XP cap at ~500 XP (50% diminishing returns, invisible)
- Level 5 by week 1, Level 20 by month 2-3, Level 100 aspirational (years)
- 4 HUD environments: Quiet Study -> Growing Garden -> Scholar's Courtyard -> Living Sanctuary
- 26 Identity Titles: 10 Common, 10 Rare, 6 Legendary
- Mercy Mode partial streak credit: 25% of pre-break streak on recovery
- North-star metric: DAU-Completion (daily active users who complete 1+ habits)
- Client timestamp authoritative for day-boundary decisions (not server)
- Day boundary is midnight local time (00:00), not Fajr or Maghrib
- 15-week total build timeline estimate (12 weeks + 20% contingency)
- Adab copy guide: 12 do/don't pairs as reference for all user-facing text
- MVP cut plan: habits + prayer + streaks + XP (priorities 1-2); recommended minimum adds Mercy Mode + Quests + Titles (1-5)
- Used root app/ directory for expo-router (standard convention)
- Two-tier token system (palette primitives + dark/light semantic) per user decision
- [Phase 02]: Kept Drizzle-generated migration filename (0000_dark_mandrill.sql) -- journal references exact name
- [Phase 02]: ISO 8601 text strings for all datetime columns in SQLite schema
- [Phase 02]: Press Start 2P for all headings (pixel aesthetic beyond HUD)
- [Phase 02]: Dark-only for v1 (light theme tokens kept but unused)
- [Phase 02]: SDK 54 for Expo Go compatibility (user has iPhone, no Apple Dev account)
- [Phase 03]: Types defined locally in streak-engine.ts pending Plan 01 consolidation
- [Phase 03]: Fajr gets highest salah XP (50) due to difficulty of waking early
- [Phase 03]: Contiguous prayer windows -- each prayer ends when next begins, Isha ends at next Fajr
- [Phase 03]: 4-group habit sort -- uncompleted salah, uncompleted other, completed salah, completed other
- [Phase 03]: Mercy Mode persisted as individual columns (mercyRecoveryDay, preBreakStreak) not JSON blob
- [Phase 03]: Store-repo-engine pattern -- store orchestrates repos for DB and domain engine for logic
- [Phase 03]: FlatList for habit list (not ScrollView+Reanimated) for performance with large lists
- [Phase 03]: Emoji icons for habit cards (SVG migration deferred to Phase 5)
- [Phase 03]: Presets/Custom mode toggle on single add-habit screen (not separate routes)
- [Phase 03]: Expandable accordion for preset categories (one open at a time)
- [Phase 03]: Modal bottom sheet for edit habit (not separate screen)
- [Phase 03]: Pixel gear icon needs redesign (deferred)
- [Phase 03]: Empty state "+" tappable, same action as FAB
- [Phase 04]: Blueprint XP formula text (40*level^1.85) is approximate; simulation table values are canonical (xpForLevel(5)=915, xpForLevel(10)=7232)
- [Phase 04]: Per-level XP costs for levels 1-10 hardcoded from blueprint table; levels 11+ use floor(40*level^1.85) formula
- [Phase 04]: simultaneous_streaks title condition checks both simultaneousStreaks14 and simultaneousStreaks90
- [Phase 04]: Quest Board locked until Level 5 (minLevel enforced in selectQuestTemplates)
- [Phase 04]: targetHabitId column reused to store targetHabitType string for quest templates (avoids extra migration)
- [Phase 04]: Dynamic import for habitStore in checkTitles to break circular reference between game/habit stores
- [Phase 04]: QuestLockedState takes explicit currentXP prop to keep component pure and testable
- [Phase 04]: TitleGrid lazy-loads Title definitions from titleRepo.getAll on first titles tab visit
- [Phase 04]: Typography spread removed from StyleSheet.create -- TypeScript requires property-by-property expansion
- [Phase 04]: XP float text derived from totalXP delta via store subscription (not XPResult return value)
- [Phase 04]: Celebration overlays use StyleSheet.absoluteFillObject absolute Views (not React Native Modal)
- [Phase 04]: HabitCard exposes onCompleteWithPosition callback with measureInWindow for float positioning
- [Phase 05-04]: Use RN Image (not Skia Image) in HabitCard -- standard RN view, not inside Skia Canvas
- [Phase 05-04]: Icons keyed by habit.category, character category maps to custom icon
- [Phase 05-04]: Pixel art icons at 32x32 source + render size to avoid upscaling antialiasing

### Pending Todos

- Gear icon redesign (flagged during 03-06 verification)
- Replace environment PNG placeholders with real AI-generated pixel art assets (after HUD checkpoint approved)

### Decisions (Phase 05)

- [Phase 05-02]: Skia interpolateColors for day/night tint (NOT Reanimated interpolateColor -- incompatible formats)
- [Phase 05-02]: Manual 4-frame clip cycling for CharacterSprite (not Atlas -- simpler for <=4 frames at MVP)
- [Phase 05-02]: BlurView (iOS) / rgba fallback (Android) for HudStatBar -- BlurTargetView complexity avoided for MVP
- [Phase 05-02]: Quest completion haptic added to gameStore.updateQuestProgress (missing from Phase 4)
- [Phase 05-02]: EnvironmentReveal fires only when isEnvironmentTransition(level-1, level) is true

### Blockers/Concerns

- Asset placeholders in use -- real pixel art assets needed before product-quality screenshots
- Success criterion "app builds via EAS Build (not Expo Go)" not yet met -- using Expo Go on SDK 54

## Session Continuity

Last session: 2026-03-16T01:38:40.778Z
Stopped at: Phase 6 context gathered
Resume file: .planning/phases/06-onboarding-profile-and-notifications/06-CONTEXT.md
