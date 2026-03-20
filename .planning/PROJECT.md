# HalalHabits: Ferrari 16-Bit Edition

## What This Is

A game-first Islamic discipline platform that helps Muslims build consistency in worship anchors, focus, character habits, and anti-distraction behavior. Built as an offline-first React Native (Expo) app with Supabase sync, featuring a "modern pixel revival" aesthetic — 16-bit game-world HUD, pixel art characters, and modern mobile UI. Shipped v1.0 with 24,689 LOC TypeScript across 346 files.

## Core Value

Players build real-world Islamic discipline through game mechanics that motivate behavior without claiming to measure spiritual worth. The core loop makes daily return feel natural, not forced.

## Requirements

### Validated

- ✓ 16-section Master Blueprint design document (5,725 lines) — v1.0
- ✓ Core daily loop — habits tracked, XP earned, streaks maintained — v1.0
- ✓ Salah Streak Shield system — v1.0
- ✓ Habit Forge — custom habit creation and tracking — v1.0
- ✓ Quest Board — daily/weekly quests with rotating variety — v1.0
- ✓ Nightly Muhasabah — 30-60 second evening reflection — v1.0
- ✓ Mercy Mode — compassionate streak recovery — v1.0
- ✓ 26 Identity Titles with rarity tiers and real data conditions — v1.0
- ✓ Home HUD with game-world feel (Skia, day/night cycle, character sprite) — v1.0
- ✓ Onboarding with Niyyah flow (under 2 minutes) — v1.0
- ✓ Profile with RPG character sheet, settings, data export/delete — v1.0
- ✓ Offline-first with SQLite source of truth and sync engine — v1.0
- ✓ Privacy-first defaults — all worship data stays on device — v1.0
- ✓ Supabase auth (email/password), sync, RLS policies — v1.0
- ✓ Adab-safe notification copy (invitational, never guilt-based) — v1.0
- ✓ All cross-phase integrations wired, 414 tests, 8 E2E flows verified — v1.0

### Active

<!-- Current scope: v2.0 milestone -->

- [ ] Private Accountability Buddies — social buddy system (up to 20 connections)
- [ ] Buddy invite codes + username search connection mechanism
- [ ] Shared habit goals between buddies
- [ ] Duo quests requiring both players to complete
- [ ] In-app filtered messaging between buddies
- [ ] Nafs Boss Arena — multi-day boss battles against personified struggles
- [ ] Dopamine Detox Dungeon — voluntary anti-doomscrolling challenges
- [ ] Friday Power-Ups — Jumu'ah 2x XP multiplier + Surah Al-Kahf challenge

### Out of Scope

- Fatwa engine or religious authority claims — app motivates behavior, not spiritual judgment
- Public leaderboards for worship — violates adab safety rails (riya)
- ~~Private Accountability Duos~~ — moved to v2.0 Active
- ~~Nafs Boss Arena, Dopamine Detox Dungeon, Friday Power-Ups~~ — moved to v2.0 Active
- Apple/Google OAuth — email/password only for v1 (scoping choice)
- Monetization — future cosmetic-only Barakah shop
- Web version — mobile-first, App Store priority
- Apple Watch / wearable, tablet layouts, widgets — scope control for solo dev

## Current Milestone: v2.0 Social & Battle Systems

**Goal:** Add a social buddy system with shared activities and filtered messaging, plus three game features — Nafs Boss Arena, Dopamine Detox Dungeon, and Friday Power-Ups.

**Target features:**
- Private Accountability Buddies (up to 20, invite codes + username search, shared habits, duo quests, filtered chat)
- Nafs Boss Arena (multi-day boss battles, 5 boss archetypes, unlock at Level 10+)
- Dopamine Detox Dungeon (voluntary 2-8hr anti-doomscrolling, daily + weekly deep variant)
- Friday Power-Ups (2x XP on Fridays, Surah Al-Kahf challenge, hadith-sourced messages)

## Context

**Shipped:** v1.0 on 2026-03-19 (13 days, 223 commits)
**Stack:** React Native (Expo SDK 54) + Supabase + SQLite + Zustand + Skia + Reanimated + adhan-js
**Codebase:** 24,689 LOC TypeScript, 414 tests passing, 27 test suites
**Running on:** Expo Go (EAS Build deferred — Apple Developer account needed)

**Deployment prerequisites (before App Store):**
- Apple Developer account for EAS Build
- Supabase project creation (SQL migrations, RLS, Edge Functions ready)
- Push notification webhook setup
- Real pixel art assets (4 environments + character spritesheet)

**Audience:** Muslims 16-35, digitally native, struggling with inconsistency and doomscrolling.

**Ethics (Adab Safety Rails — non-negotiable):**
1. No public worship leaderboards
2. No iman/taqwa scoring
3. No shame copy for missed days
4. No addiction dark patterns
5. Privacy-first defaults
6. Religious copy must be reverent
7. Recovery paths built-in (Mercy Mode)
8. XP is effort-based ("discipline score"), never spiritual judgment

## Constraints

- **Tech stack**: React Native (Expo) + Supabase
- **Platform**: App Store first, Android via cross-platform
- **Team**: Solo developer with Claude assistance
- **Privacy**: All worship data local-first, no public worship leaderboards ever
- **Content sensitivity**: All religious copy reviewed for adab compliance
- **Offline**: Must work offline with eventual sync

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native (Expo) over native | Solo dev needs cross-platform; Expo mature ecosystem | ✓ Good — shipped in 13 days |
| Supabase over Firebase | Postgres for relational data; RLS for privacy | ✓ Good — RLS policies clean |
| Blueprint-first approach | 16-section design doc before code | ✓ Good — zero major redesigns needed |
| Effort-based XP, not outcome-based | Prevents spiritual judgment | ✓ Good — adab-safe framing throughout |
| Local-first worship data | Privacy is architectural, not policy | ✓ Good — Privacy Gate enforced |
| Expo Go for v1 (not EAS Build) | No Apple Developer account | ⚠️ Revisit — need EAS for App Store |
| Email-only auth (no Apple/Google OAuth) | Scope control for solo dev | ⚠️ Revisit — OAuth needed for launch |
| WatermelonDB skipped for expo-sqlite | Simpler, direct SQL, lower complexity | ✓ Good — worked well with Drizzle |
| Dark-only theme for v1 | Matches retro aesthetic, ship faster | — Pending user feedback |
| SDK 54 for Expo Go compatibility | iPhone testing without Apple Dev account | ⚠️ Revisit — upgrade path needed |
| Boss unlock lowered to Level 10+ | Faster engagement, let players hit bosses sooner | — Pending |
| Up to 20 buddies (not strict duo) | More social, user preference | — Pending |

## Current State

- Phase 11 complete — v2.0 schema foundation laid (6 new Drizzle tables, 19-entry Privacy Gate, Supabase migrations for 4 SYNCABLE tables with buddy-pair RLS, XP economy model validated)
- Next: Phase 12 — Friday Power-Ups

---
*Last updated: 2026-03-20 after Phase 11 completion*
