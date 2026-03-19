# Project Research Summary

**Project:** HalalHabits v2.0 - Social & Battle Systems
**Domain:** Gamified Islamic habit-building mobile app
**Researched:** 2026-03-19
**Confidence:** MEDIUM-HIGH

## Executive Summary

v2.0 adds four feature systems to a working v1.0 app: Private Accountability Buddies (up to 20 connections, shared habits, duo quests, filtered messaging), Nafs Boss Arena (multi-day boss battles against 5 nafs archetypes), Dopamine Detox Dungeon (voluntary 2-8hr anti-doomscrolling challenges), and Friday Power-Ups (2x XP on Fridays + Surah Al-Kahf challenge). Research reveals this is primarily a **data modeling and UX problem, not a stack expansion problem** - only one new npm package (leo-profanity) is needed. Everything else leverages the existing stack.

The recommended approach is to build solo game features first (Friday Power-Ups, Detox Dungeon, Boss Arena), then layer social features on top (buddy connections, shared activities, messaging). Solo features require zero Supabase infrastructure changes and can ship independently, while social features require schema migrations, RLS policies, Realtime channels, and an Edge Function for content moderation.

Top risks: (1) offline-first/social-online architecture contamination; (2) XP economy hyperinflation from stacking multipliers; (3) riya through buddy visibility features; (4) iOS killing background timers for Detox Dungeon.

## Key Findings

### Recommended Stack

Only **one new npm package**: leo-profanity ^1.9.0 for client-side content filtering. Everything else uses already-installed packages.

**Core technologies (all existing):**
- **Supabase Realtime** (via @supabase/supabase-js ^2.99.2): Broadcast + Postgres Changes for buddy messaging
- **Skottie** (via @shopify/react-native-skia 2.2.12): Boss battle animations inside existing Skia canvas
- **AppState + expo-notifications**: Detox timer uses wall-clock timestamps with completion notification
- **adhan-js + Date API**: Friday detection with timezone-aware prayer times

**What NOT to add:** Stream Chat/Sendbird, react-native-background-timer, lottie-react-native, XState, ML moderation APIs.

### Expected Features

**Must have (table stakes):**
- Invite code + username search for buddy connections
- Accept/decline/remove/block buddy management
- Buddy public progress summary (XP, streak count - never worship details)
- Boss HP bar with visible multi-day progress
- Daily habit completion to boss damage mechanic
- Voluntary detox start with duration selection (2-8hr)
- Friday 2x XP multiplier visible in HUD
- 1:1 filtered messaging with report/block
- Offline resilience

**Differentiators:**
- Nafs as boss archetypes - no competitor has gamified Islamic nafs concepts
- Duo quests with cooperative (not punitive) completion
- Dopamine Detox as jihad al-nafs (Islamic spiritual framing)
- Friday as a weekly game event
- Private accountability without leaderboards

**Anti-features (explicitly avoid):**
- Public buddy leaderboards (riya risk)
- Habitica-style party damage (contradicts Mercy Mode)
- App-level screen locking for detox (iOS restriction)
- AI-generated religious copy (hallucination risk)
- Group chats or channels (moderation burden)

### Architecture Approach

The existing three-layer architecture extends cleanly. Four new subsystems: Social/Buddy (SYNCABLE, Supabase-authoritative), Boss Arena (PRIVATE, local-only), Detox Dungeon (LOCAL_ONLY, ephemeral), Friday Power-Ups (pure engine extension). Privacy Gate requires 6 new table classifications.

**Major new components:**
1. 4 pure TS domain engines - buddy-engine, boss-engine, detox-engine, friday-engine
2. 3 new Zustand stores - socialStore, bossStore, detoxStore
3. 4 new Drizzle repos - buddyRepo, messageRepo, bossRepo, detoxRepo
4. 6 new SQLite tables - buddies, messages, duo_quests, shared_habits, boss_battles, detox_sessions
5. 1 Supabase Edge Function - message-filter for content moderation
6. RLS policies on all new SYNCABLE tables

### Critical Pitfalls

1. **Offline/social architecture contamination** - Personal data = SQLite source of truth, social data = Supabase source of truth. Never mix.
2. **XP economy hyperinflation** - Stacking can reach 4-8x baseline. Model combined economy BEFORE coding. Daily XP cap.
3. **Riya through buddy features** - Buddy visibility defaults to minimum. Never expose specific worship completions.
4. **iOS background timer kill** - Use Date.now() - started_at timestamp approach. Pre-schedule completion notification.
5. **Boss copy trivializing nafs struggle** - Frame as discipline challenges not combat. Islamic-literate copy review required.

## Implications for Roadmap

### Phase 1: Schema & Privacy Gate Foundation
**Rationale:** Privacy Gate throws on unknown tables - blocks ALL other work.
**Delivers:** 6 new table definitions, Privacy Gate updates, migration, XP economy model

### Phase 2: Friday Power-Ups
**Rationale:** Lowest complexity, zero Supabase infra changes, quick win
**Delivers:** friday-engine.ts, 2x XP multiplier, Al-Kahf quest card, HUD indicator

### Phase 3: Dopamine Detox Dungeon
**Rationale:** Self-contained LOCAL_ONLY feature, validates timer architecture
**Delivers:** detox-engine.ts, detoxStore, detoxRepo, timer UI, daily + weekly variants

### Phase 4: Nafs Boss Arena
**Rationale:** PRIVATE local-only, most unique differentiator
**Delivers:** boss-engine.ts state machine, 5 archetypes, battle screen with Skia animations

### Phase 5: Buddy Connection System
**Rationale:** Foundation for all social features
**Delivers:** buddy-engine.ts, invite codes, buddy list, RLS policies, progress sharing

### Phase 6: Shared Activities & Duo Quests
**Rationale:** Depends on Phase 5; extends existing Quest Board
**Delivers:** Shared habits, duo quests, ghost partner handling

### Phase 7: Messaging & Content Moderation
**Rationale:** Highest complexity, ships last
**Delivers:** 1:1 messaging, Edge Function, leo-profanity, Realtime, offline queue, report/block

### Phase Ordering Rationale

- Schema first because Privacy Gate throws on unknown tables
- Solo game features (2-4) before social (5-7) - zero Supabase infra dependency
- Friday Power-Ups first - easiest win
- Boss Arena before Social - highest uniqueness, validates game expansion
- Messaging last - most moving parts, depends on everything else

### Research Flags

Deeper research needed:
- Phase 4: Boss archetype content, game balance, Islamic copy review
- Phase 5: RLS policy design for social graph, Privacy Gate extension policy
- Phase 7: Islamic content blocklist, Realtime multiplexing, Edge Function compatibility

Standard patterns (skip research):
- Phase 1: Drizzle + Privacy Gate extension
- Phase 2: Date logic + existing XP engine
- Phase 3: Timestamp + AppState pattern

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Only 1 new package; all else verified installed |
| Features | MEDIUM-HIGH | Table stakes clear; Islamic content needs human review |
| Architecture | HIGH | Existing patterns extend cleanly; codebase verified |
| Pitfalls | MEDIUM-HIGH | Top risks well-documented; Islamic moderation has gaps |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- Islamic content blocklist must be hand-curated (no open-source exists)
- XP economy spreadsheet must be built before any v2.0 XP feature ships
- Boss archetype content needs Islamic-literate review
- Supabase Realtime connection limits need monitoring from beta
- Duo quest progress display needs design decision

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
