# Requirements: HalalHabits v2.0 — Social & Battle Systems

**Defined:** 2026-03-19
**Core Value:** Players build real-world Islamic discipline through game mechanics that motivate behavior without claiming to measure spiritual worth.

## v2.0 Requirements

Requirements for v2.0 milestone. Each maps to roadmap phases.

### Schema & Foundation

- [x] **FOUN-01**: Privacy Gate updated with 6 new table classifications (buddies, messages, duo_quests, shared_habits = SYNCABLE; boss_battles = PRIVATE; detox_sessions = LOCAL_ONLY)
- [x] **FOUN-02**: 6 new SQLite tables created via Drizzle migration (buddies, messages, duo_quests, shared_habits, boss_battles, detox_sessions)
- [x] **FOUN-03**: XP economy model accounts for all v2.0 sources with daily cap preventing hyperinflation

### Friday Power-Ups

- [x] **FRDY-01**: User receives 2x XP multiplier on all Friday habit completions (timezone-aware, stacks with streak multiplier)
- [x] **FRDY-02**: HUD displays active Jumu'ah boost indicator on Fridays
- [x] **FRDY-03**: Surah Al-Kahf challenge quest card appears on Friday mornings with 100 bonus XP
- [x] **FRDY-04**: Rotating hadith-sourced Friday messages display (10 pre-written, vetted messages)

### Dopamine Detox Dungeon

- [ ] **DTOX-01**: User can start a voluntary detox challenge with duration selection (2-8 hours)
- [ ] **DTOX-02**: Active session displays countdown timer that survives app backgrounding (timestamp-based)
- [ ] **DTOX-03**: Completing a detox session awards XP based on duration (50-150 daily, 300 deep weekly)
- [ ] **DTOX-04**: User can exit detox early with confirmation and XP cost penalty
- [ ] **DTOX-05**: Daily variant resets daily; weekly deep variant (6-8hr) available once per week
- [ ] **DTOX-06**: Active detox session preserves habit streaks (no penalty for missed habits during detox)

### Nafs Boss Arena

- [ ] **BOSS-01**: User can initiate a boss battle at Level 10+ against one of 5 nafs archetypes
- [ ] **BOSS-02**: Boss battles last 5-7 days with HP that decreases from daily habit completions
- [ ] **BOSS-03**: Each boss archetype has unique dialogue (intro, taunt, player winning, defeated messages)
- [ ] **BOSS-04**: Boss counter-attacks (HP heals) when user misses habits on active battle days
- [ ] **BOSS-05**: Defeating a boss awards 200-500 XP and contributes to boss-specific Identity Title
- [ ] **BOSS-06**: Mercy Mode reduces boss counter-attack severity during active Mercy Mode
- [ ] **BOSS-07**: Boss battle screen renders with Skia/Skottie animations (HP bar, hit effects, phase transitions)
- [ ] **BOSS-08**: Boss battle state persists across app kills and device restarts (SQLite wall-clock timestamps)

### Buddy System

- [ ] **BUDY-01**: User can generate a single-use invite code (expires in 48 hours) to share with a friend
- [ ] **BUDY-02**: User can connect by entering a buddy's invite code
- [ ] **BUDY-03**: User can search for buddies by username (only finds users who opted into discoverability)
- [ ] **BUDY-04**: User can accept, decline, remove, or block buddy requests
- [ ] **BUDY-05**: User can view buddy list showing up to 20 connections with online status
- [ ] **BUDY-06**: User can view a buddy's public progress summary (XP total, streak count — never worship details)
- [ ] **BUDY-07**: Supabase RLS policies enforce buddy-pair scoping on all social tables

### Shared Activities & Duo Quests

- [ ] **DUOQ-01**: User can create a shared habit goal with a buddy (both track the same habit)
- [ ] **DUOQ-02**: User can create a duo quest that requires both buddies to complete their part
- [ ] **DUOQ-03**: Completing individual part of duo quest awards individual XP; both completing awards bonus shared XP
- [ ] **DUOQ-04**: Duo quest pauses after 48 hours of partner inactivity; user can exit after 72 hours with partial credit
- [ ] **DUOQ-05**: Duo quest progress shows aggregate completion only (never reveals individual worship details)

### Messaging

- [ ] **MSSG-01**: User can send and receive text messages with any connected buddy (1:1 only)
- [ ] **MSSG-02**: Messages are filtered server-side via Edge Function before database insertion
- [ ] **MSSG-03**: Client-side pre-filter blocks obvious profanity before sending (leo-profanity)
- [ ] **MSSG-04**: Message history persists and is viewable per buddy conversation
- [ ] **MSSG-05**: User can report a message or block a buddy from the chat screen
- [ ] **MSSG-06**: Messages queued offline are sent automatically when connectivity is restored

## Future Requirements

Deferred beyond v2.0. Tracked but not in current roadmap.

### Social Expansion

- **SOCL-01**: Group accountability circles (3-5 members)
- **SOCL-02**: Buddy boss battles (cooperative duo boss fights)
- **SOCL-03**: Shared Muhasabah prompts between buddies (requires careful adab review)

### Game Expansion

- **GAME-01**: Nafs Boss Arena seasonal events with limited-time bosses
- **GAME-02**: Dopamine Detox leaderboard (personal best streaks, never public)
- **GAME-03**: Boss battle replay with harder difficulty tiers

### Platform

- **PLAT-01**: Apple/Google OAuth login
- **PLAT-02**: Cosmetic-only Barakah shop (monetization)
- **PLAT-03**: Web companion dashboard

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Public leaderboards for buddy stats | Riya risk — violates adab safety rails |
| Habitica-style party damage | Contradicts Mercy Mode philosophy; guilt-inducing |
| App-level screen locking for detox | iOS restriction; cannot enforce without MDM |
| AI-generated religious copy | Hallucination risk unacceptable for Islamic content |
| Group chats or channels | Moderation burden disproportionate to value for solo dev |
| Voice/video messaging | Massively increases moderation surface area |
| Real-time worship completion sharing with buddies | Privacy Gate violation; riya concern even in private |
| Automatic Friday productivity notifications | Misaligned with spiritual weight of Jumu'ah |
| Boss battle data syncing to cloud | Boss archetype reveals personal nafs struggle — spiritually sensitive |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 11 | Complete |
| FOUN-02 | Phase 11 | Complete |
| FOUN-03 | Phase 11 | Complete |
| FRDY-01 | Phase 12 | Complete |
| FRDY-02 | Phase 12 | Complete |
| FRDY-03 | Phase 12 | Complete |
| FRDY-04 | Phase 12 | Complete |
| DTOX-01 | Phase 13 | Pending |
| DTOX-02 | Phase 13 | Pending |
| DTOX-03 | Phase 13 | Pending |
| DTOX-04 | Phase 13 | Pending |
| DTOX-05 | Phase 13 | Pending |
| DTOX-06 | Phase 13 | Pending |
| BOSS-01 | Phase 14 | Pending |
| BOSS-02 | Phase 14 | Pending |
| BOSS-03 | Phase 14 | Pending |
| BOSS-04 | Phase 14 | Pending |
| BOSS-05 | Phase 14 | Pending |
| BOSS-06 | Phase 14 | Pending |
| BOSS-07 | Phase 14 | Pending |
| BOSS-08 | Phase 14 | Pending |
| BUDY-01 | Phase 15 | Pending |
| BUDY-02 | Phase 15 | Pending |
| BUDY-03 | Phase 15 | Pending |
| BUDY-04 | Phase 15 | Pending |
| BUDY-05 | Phase 15 | Pending |
| BUDY-06 | Phase 15 | Pending |
| BUDY-07 | Phase 15 | Pending |
| DUOQ-01 | Phase 16 | Pending |
| DUOQ-02 | Phase 16 | Pending |
| DUOQ-03 | Phase 16 | Pending |
| DUOQ-04 | Phase 16 | Pending |
| DUOQ-05 | Phase 16 | Pending |
| MSSG-01 | Phase 17 | Pending |
| MSSG-02 | Phase 17 | Pending |
| MSSG-03 | Phase 17 | Pending |
| MSSG-04 | Phase 17 | Pending |
| MSSG-05 | Phase 17 | Pending |
| MSSG-06 | Phase 17 | Pending |

**Coverage:**
- v2.0 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 — traceability populated after roadmap creation*
