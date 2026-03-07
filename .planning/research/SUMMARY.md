# Project Research Summary

**Project:** HalalHabits: Ferrari 16-Bit Edition
**Domain:** Gamified Islamic habit-building mobile app
**Researched:** 2026-03-07
**Confidence:** MEDIUM

## Executive Summary

HalalHabits sits at the intersection of two mature but non-overlapping app categories: gamified habit trackers (Habitica, Forest, Streaks) and Islamic lifestyle apps (Muslim Pro, Quran.com, Pillars). No product currently combines genuine game design with culturally respectful Islamic framing at quality. The recommended approach is a React Native (Expo) + Supabase stack with an offline-first SQLite data layer, Zustand for game state, and Skia + Reanimated for the 16-bit visual identity. This stack is well-established for solo-dev mobile projects and aligns with every constraint in the project brief.

The architecture must be offline-first with privacy as an architectural boundary, not a policy checkbox. Worship data (salah logs, Quran reading, Muhasabah reflections) stays on-device permanently. Only non-sensitive data (XP totals, settings, profile) syncs to Supabase. The game engine (XP, streaks, titles, quests) should be pure TypeScript functions with no React dependencies, making the entire progression system unit-testable and balance-tunable without UI involvement.

The dominant risks are cultural, not technical. Streak tyranny (users associating the app with worship guilt), spiritual quantification (XP systems implying a "prayer score"), and insensitive copy are all capable of generating community backlash that kills the product before it gains traction. Mercy Mode and compassionate recovery language must ship alongside streaks from day one -- they are the same feature, not separate phases. On the technical side, prayer time timezone handling and offline sync conflict resolution are the two areas most likely to cause painful rewrites if not designed correctly upfront.

## Key Findings

### Recommended Stack

The stack centers on Expo (managed workflow with dev client), Supabase (Postgres + Auth + RLS), and a local-first data layer. Development builds are required from day one because WatermelonDB and Skia both need native modules unavailable in Expo Go. Windows development means EAS Build is mandatory for iOS builds.

**Core technologies:**
- **React Native + Expo SDK 52+**: Cross-platform runtime with managed builds, OTA updates, and the module ecosystem a solo dev needs
- **Supabase (Postgres + Auth + Edge Functions)**: Row-Level Security enforces privacy boundaries at the database level; Postgres handles relational habit data far better than NoSQL
- **WatermelonDB (or expo-sqlite)**: Offline-first local database with sync primitives; observable queries for reactive UI without duplicating state
- **Zustand**: Lightweight game state management (~1KB); split stores by domain to avoid re-render cascading on the HUD
- **Skia + Reanimated 3**: GPU-accelerated 2D drawing for pixel art + UI-thread animations for 60fps game feel; this IS the "Ferrari 16-bit" differentiator
- **adhan (local calculation)**: Offline prayer time computation; network dependency for prayer times is unacceptable
- **expo-router**: File-based routing with auto-generated TypeScript types and deep linking for notifications

**Stack note:** The STACK.md researcher recommended WatermelonDB while the ARCHITECTURE.md researcher designed around expo-sqlite. Both are valid. WatermelonDB has built-in sync primitives but adds native module complexity. expo-sqlite is simpler but requires building sync logic manually. Decide during Phase 1 scaffolding -- either works with the architecture.

### Expected Features

**Must have (table stakes):**
- Daily habit check-in with single-tap completion
- Streak tracking (prominent but not the only motivator)
- Preset Islamic habits (5 salah, Quran, dhikr, fasting) + custom creation
- Prayer time awareness with configurable calculation methods
- Progress history / calendar view
- Push notifications / reminders
- Offline-first functionality
- Dark mode (default or auto; Fajr tracking happens pre-dawn)

**Should have (differentiators for MVP):**
- XP and leveling with effort-based framing ("discipline score" not "worship score")
- Identity Titles tied to real consistency milestones
- Quest Board with rotating daily/weekly quests
- Home HUD with 16-bit game-world aesthetic
- Salah Streak Shield (protects streaks around prayer windows)
- Mercy Mode (compassionate streak recovery, not shame)
- Nightly Muhasabah with structured prompts (30-60 seconds, not journaling)
- Niyyah-based onboarding (intention setting)

**Defer (v2+):**
- Nafs Boss Arena (Phase 2 -- validate core loop first)
- Dopamine Detox Dungeon (Phase 2)
- Friday Power-Ups (Phase 2 -- low complexity but strategically timed)
- Private Accountability Duos (Phase 3 -- needs user base)
- Barakah Shop / cosmetics (post-MVP monetization)
- Qibla compass, widget support, wearable companion, tablet layouts

### Architecture Approach

Four-layer architecture: UI (Expo Router + Skia + Reanimated) -> Application (Game Engine + Habit Tracker + Schedule Engine as pure TypeScript modules) -> State & Data (Zustand + SQLite + Sync Engine with Privacy Gate) -> Backend (Supabase for auth, sync, and push only). The critical design principle is that the app must function identically when Supabase is unreachable. SQLite is the source of truth; Supabase is the backup/sync destination.

**Major components:**
1. **Game Engine** -- Pure TypeScript functions for XP calculation, streak evaluation, title progression, quest completion. No React imports. Fully unit-testable.
2. **Privacy Gate** -- Single enforcement point classifying data as private (device-only) or syncable. Sits between data layer and sync engine. Worship data never crosses this boundary.
3. **Sync Engine** -- Queue-based sync with conflict resolution (idempotent habit completions by user+habit+date, last-write-wins for settings, sum-merge for XP). Processes when connectivity returns.
4. **Schedule Engine** -- Local prayer time calculation via adhan, notification scheduling via expo-notifications, daily reset timing. Fully offline.
5. **HUD / Animation System** -- Skia for pixel-art sprite rendering (FilterQuality.None for crisp pixels), Reanimated for transitions and XP bar fills, Lottie for one-off celebrations only.

### Critical Pitfalls

1. **Streak Tyranny** -- Streaks without Mercy Mode create worship guilt and churn. Prevention: Ship Mercy Mode as part of the streak system from day one. Frame streaks as "momentum" not "perfection." Never use "You broke your streak" language.

2. **Spiritual Quantification** -- XP systems implicitly rank users spiritually. Prevention: Frame as "discipline score" never "worship score." Show XP in a separate game layer, not on prayer completion screens. Include explicit disclaimer. Have 2-3 knowledgeable Muslims review all copy.

3. **Prayer Time / Timezone Chaos** -- Prayer times vary by location, calculation method, and shift daily. Day boundaries, DST, high-latitude edge cases, and timezone travel all break naive implementations. Prevention: Use adhan library with configurable methods. Store UTC internally. Define habit-day boundaries explicitly (Fajr-to-Fajr or midnight, pick one and be consistent). Test with extreme latitudes.

4. **Offline Sync Conflicts** -- Supabase has no built-in offline sync. Duplicate completions, lost entries, and XP inconsistencies erode trust. Prevention: Design local data layer with conflict resolution before touching Supabase. Idempotent completions by (user, habit, date). Use operation log / sync queue. Test 3-day airplane mode then sync.

5. **Game Economy Inflation** -- XP and levels that come too fast or mean nothing. Prevention: Model the full economy on a spreadsheet (levels 1-100, time-to-level, XP-per-action, unlock schedule) during Blueprint phase. Use logarithmic leveling curves. Tie titles to real milestones (40 consecutive Fajr, not 3).

## Implications for Roadmap

Based on combined research, the following phase structure respects technical dependencies, feature groupings, and pitfall avoidance.

### Phase 1: Foundation and Data Layer
**Rationale:** Everything depends on navigation + data + persistence. The offline-first architecture and privacy boundaries must be established before any feature code. Getting this wrong means rewriting the data layer later (Pitfall 4).
**Delivers:** Expo project scaffold with dev client, Expo Router navigation structure, SQLite database schema and migrations, Zustand stores with SQLite persistence, Privacy Gate, basic design token system.
**Addresses:** Offline functionality (table stake), data persistence (table stake)
**Avoids:** Pitfall 4 (sync conflicts), Pitfall 8 (Expo build footguns -- set up dev client and EAS Build pipeline here)

### Phase 2: Core Habit Loop
**Rationale:** The daily check-in loop is the product's reason to exist. Must work end-to-end before layering game systems. This validates the fundamental value proposition.
**Delivers:** Habit CRUD (preset library + custom creation), single-tap check-in, prayer time calculation and awareness, streak tracking with Mercy Mode and Salah Streak Shield built in from day one.
**Addresses:** Habit tracking core (table stake), prayer tracking (table stake), streak tracking (table stake), Mercy Mode (differentiator), Salah Streak Shield (differentiator)
**Avoids:** Pitfall 1 (streak tyranny -- Mercy Mode ships with streaks), Pitfall 3 (prayer time chaos -- configurable calculation methods from the start), Pitfall 14 (overbuilding game layer before core loop)

### Phase 3: Game Engine and Progression
**Rationale:** Game mechanics layer on top of the validated core loop. XP, titles, and quests reference habits and streaks but do not change the fundamental data model. The game engine is pure functions -- can be built and tested independently.
**Delivers:** XP calculation and leveling, Identity Titles with unlock celebrations, Quest Board (daily/weekly), game economy with modeled curves.
**Addresses:** XP system (differentiator), Identity Titles (differentiator), Quest Board (differentiator)
**Avoids:** Pitfall 5 (game economy inflation -- spreadsheet model required before implementation), Pitfall 2 (spiritual quantification -- "discipline score" framing enforced in all XP-related copy)

### Phase 4: HUD, Animations, and Visual Identity
**Rationale:** The 16-bit visual layer is the brand differentiator but depends on working game state to display. Build the engine before the dashboard. This phase is where the "Ferrari" feel materializes.
**Delivers:** Home HUD with game-world aesthetic, Skia pixel-art rendering, Reanimated transitions, haptic feedback, sound effects, sprite sheets and visual assets.
**Addresses:** Home HUD (differentiator), 16-bit visual identity (differentiator), smooth animations (table stake)
**Avoids:** Pitfall 6 (animation jank -- Reanimated 3 + Skia from the start, test on mid-range Android), Pitfall 15 (accessibility -- dynamic text scaling, readable pixel art sizes)

### Phase 5: Reflection, Onboarding, and Polish
**Rationale:** Muhasabah is a standalone screen with private data. Onboarding depends on having a polished app to onboard into. These are the bookend experiences (first launch and nightly return).
**Delivers:** Nightly Muhasabah with structured prompts, Niyyah-based onboarding flow, settings and profile screens, history views, notifications.
**Addresses:** Muhasabah (differentiator), onboarding (table stake + differentiator via Niyyah), notifications (table stake)
**Avoids:** Pitfall 7 (Muhasabah as chore -- structured prompts, 30-60 seconds, skip without penalty), Pitfall 10 (guilt-based notifications -- invitations not accusations), Pitfall 9 (offensive copy -- Adab Copy Guide review for all screens)

### Phase 6: Backend, Auth, and Sync
**Rationale:** Auth and sync are intentionally last. The app must work completely without them. Adding sync after the full offline experience is built means you test the privacy boundaries under real conditions.
**Delivers:** Supabase Auth (email, Apple, Google), Sync Engine with queue and conflict resolution, push notifications via Edge Functions, cross-device data sync for non-private data.
**Addresses:** Data backup (table stake), cross-device sync
**Avoids:** Pitfall 4 (sync conflicts -- Privacy Gate tested before sync engine connects to Supabase), Pitfall 13 (RLS complexity -- flat data model, test as different users)

### Phase Ordering Rationale

- Data layer first because every other phase reads/writes to it. Retrofitting offline-first or privacy boundaries is a near-complete rewrite.
- Core habit loop before game systems because the game layer is meaningless without habits to gamify. This also validates the fundamental hypothesis: "Do Muslims want to track habits in a game-styled app?"
- Game engine before visual layer because the HUD needs real state to display. Building the HUD with mock data leads to redesigns when real data shapes differ.
- Sync last because the app must work offline. Building sync early creates a false dependency on network availability during development.
- This ordering aligns with the architecture's dependency graph and avoids the top 5 critical pitfalls.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Foundation):** WatermelonDB vs expo-sqlite decision needs hands-on prototyping. Stack researchers disagreed. Try both sync approaches in a spike.
- **Phase 2 (Core Habit Loop):** Prayer time calculation edge cases (high latitude, DST, day boundaries) need dedicated research with the adhan library.
- **Phase 3 (Game Engine):** XP economy modeling needs game design research -- spreadsheet model with progression curves from level 1 to 100.
- **Phase 4 (Visual Identity):** Pixel art asset pipeline (sprite sheets, custom Arabic pixel fonts, Skia rendering patterns) needs prototyping research.

Phases with standard patterns (skip deep research):
- **Phase 5 (Reflection/Onboarding):** Standard mobile onboarding and form patterns. Muhasabah is just structured prompts with persistence.
- **Phase 6 (Auth/Sync):** Supabase Auth and queue-based sync are well-documented patterns. RLS policies need testing but not research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Library choices are HIGH confidence; exact version pins are MEDIUM (training data cutoff). Run verification checklist before scaffolding. |
| Features | HIGH | Table stakes and differentiators well-identified from two mature app categories. Competitor details may be stale (early 2025 data). |
| Architecture | MEDIUM-HIGH | Patterns are well-established (offline-first, pure game engine, privacy gate). expo-sqlite vs WatermelonDB choice unresolved. |
| Pitfalls | HIGH | Streak psychology, prayer time complexity, offline sync gaps, and cultural sensitivity risks are all well-documented in behavioral design and mobile dev literature. |

**Overall confidence:** MEDIUM -- architecture and feature decisions are sound; version-specific details and one key stack decision (local DB) need validation before implementation.

### Gaps to Address

- **Local DB choice (WatermelonDB vs expo-sqlite):** Researchers disagreed. Needs a spike during Phase 1 to compare sync ergonomics. Both work architecturally.
- **Exact library versions:** All version numbers are minimums from early-2025 training data. Run the verification checklist in STACK.md before `npm install`.
- **Pixel art asset pipeline:** No research covered sourcing or creating 16-bit art assets, sprite sheets, or custom Arabic pixel fonts. Needs art direction research.
- **XP economy balance:** Spreadsheet model needed during Blueprint/Phase 3. No existing template -- game design research required.
- **Adab Copy Guide:** Referenced as critical by Pitfalls researcher but no content exists yet. Must be created during Blueprint phase with input from practicing Muslims.
- **Android notification reliability:** Per-manufacturer battery optimization workarounds (Samsung, Xiaomi, Huawei) need device-specific QA. Reference dontkillmyapp.com.
- **Tamagui vs Unistyles:** Styling framework choice flagged as "choose one and commit" during Phase 1. Tamagui recommended but Unistyles is a valid lighter alternative.
- **RTL / Arabic support:** Flagged as "much harder to add later." i18n infrastructure (i18next) should be in place from Phase 1 even if launching English-only.

## Sources

### Primary (HIGH confidence)
- React Native + Expo ecosystem patterns (well-established by 2024+)
- Supabase Postgres + RLS architecture (documented, community-proven)
- Reanimated 3 + Skia rendering patterns (Shopify-maintained, stable)
- adhan-js prayer time library (industry standard since 2020)
- Streak psychology and gamification design (behavioral design literature)
- Offline-first sync queue patterns (established mobile architecture)

### Secondary (MEDIUM confidence)
- Specific library version numbers (training data through early 2025)
- Competitor feature details for Habitica, Muslim Pro, Pillars (may have updated)
- WatermelonDB sync protocol maturity vs PowerSync alternative
- Tamagui vs alternative styling frameworks

### Tertiary (LOW confidence)
- Expo SDK 52+ specifics (SDK 53+ may exist by March 2026)
- Prayer time edge cases at extreme latitudes (needs real-device testing)
- Android OEM-specific notification behavior (changes with OS updates)

---
*Research completed: 2026-03-07*
*Ready for roadmap: yes*
