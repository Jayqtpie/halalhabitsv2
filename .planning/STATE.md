---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_plan: 3 of 5 (Phase 7) — plan 03 complete (paused at checkpoint:human-verify)
status: in_progress
stopped_at: Completed 07-03-PLAN.md (checkpoint:human-verify Task 2)
last_updated: "2026-03-18T01:15:00.000Z"
last_activity: "2026-03-18 -- 07-03: Auth UI screens, AccountSection, SyncStatusIcon, AccountNudgeBanner, DeleteAccountSheet"
progress:
  total_phases: 7
  completed_phases: 6
  total_plans: 33
  completed_plans: 30
  percent: 91
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-07)

**Core value:** Players build real-world Islamic discipline through game mechanics that motivate behavior without claiming to measure spiritual worth.
**Current focus:** Phase 7 in progress — Supabase client + auth service foundation complete (07-01), sync engine next (07-02)

## Current Position

Phase: 7 of 7 (Backend, Auth & Sync — in progress)
Current Plan: 3 of 5 (Phase 7) — plan 03 paused at checkpoint:human-verify
Status: 07-03 Task 1 complete. Auth UI screens and components built. Awaiting human visual verification (Task 2 checkpoint).
Last activity: 2026-03-18 -- 07-03: Auth UI screens, AccountSection, SyncStatusIcon, AccountNudgeBanner, DeleteAccountSheet

Progress: [█████████░] 91% overall (30/33 plans complete)
Overall: 6 complete phases (Phase 01-06), Phase 07 in progress (3/5 plans done)

## Performance Metrics

**By Phase:**

| Phase | Plans | Status | Completed |
|-------|-------|--------|-----------|
| Phase 01 | 7/7 | Complete | 2026-03-07 |
| Phase 02 | 3/3 | Complete | 2026-03-09 |
| Phase 03 | 6/6 | Complete | 2026-03-10 |
| Phase 04 | 3/3 | Complete | 2026-03-15 |
| Phase 05 | 4/4 | Complete | 2026-03-16 |
| Phase 06 | 4/4 | Complete | 2026-03-17 |
| Phase 07 | 3/5 | In Progress | — |

**Phase 4 Plan Breakdown:**

| Plan | Duration | Tasks | Description |
|------|----------|-------|-------------|
| 04-01 | 13min | 2 | XP engine, title engine, quest engine (pure TS domain modules, TDD) |
| 04-02 | 4min 28sec | 2 | titleRepo, gameStore orchestration, habitStore XP injection |
| 04-03 | ~15min | 2+checkpoint | XP feedback UI layer (6 game components + habits screen integration) |

**Phase 6 Plan Breakdown:**

| Plan | Duration | Tasks | Description |
|------|----------|-------|-------------|
| 06-01 | ~18min | 2 | Domain modules (niyyah-options, starter-packs, notification-copy), NotificationService, settingsStore +10 fields |
| 06-02 | ~20min | 1+checkpoint | 5-screen onboarding (Welcome, Character, Niyyah, Habits, Tour), Stack.Protected hydration gate |
| 06-03 | ~13min | 2+checkpoint | Profile RPG screen, Settings 4-section, Prayer Reminders sub-screen, Your Data with export/delete TDD |
| 06-04 | ~8min | 1+checkpoint | Notification lifecycle wiring (startup reschedule, settings-change reschedule, tap routing) |

**Phase 7 Plan Breakdown:**

| Plan | Duration | Tasks | Description |
|------|----------|-------|-------------|
| 07-01 | ~22min | 2 | Supabase client, authStore, auth-service (signUp/signIn/signOut/deleteAccount/migrateGuestData), DB migration |
| 07-03 | ~15min | 1+checkpoint | Auth UI screens (sign-in, create-account), AccountNudgeBanner, SyncStatusIcon, AccountSection, DeleteAccountSheet, MergeChoiceSheet |

**Phase 3 Plan Breakdown:**

| Plan | Duration | Tasks | Description |
|------|----------|-------|-------------|
| 03-01 | 5min | 3 | Domain types, presets, prayer times, location, habit sorter |
| 03-02 | 2min | 2 | Streak engine with full TDD |
| 03-03 | ~30min | 3 | Data wiring layer |
| 03-04 | 4min | 2 | Daily habit list screen |
| 03-05 | 6min | 2 | Habit creation & management |
| 03-06 | ~15min | 3 | Prayer, Mercy Mode, calendar, verification |
| Phase 07 P04 | 3min | 2 tasks | 8 files |

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
- [Phase 06-01]: Fail-open for Hijri month — if Intl.DateTimeFormat('en-u-ca-islamic') throws, show all niyyah options
- [Phase 06-01]: Runtime key validation in starter-packs.ts — throws at module load if habitKey doesn't match a preset
- [Phase 06-01]: Only today's prayer notifications scheduled (iOS 64-limit strategy); reschedule on each app launch
- [Phase 06-01]: hydrated flag NOT persisted — resets to false on cold start, set to true via onRehydrateStorage
- [Phase 06-01]: morningMotivationEnabled, streakMilestonesEnabled, questExpiringEnabled default to false (opt-in)
- [Phase 06-01]: muhasabahNotifEnabled defaults to true; arabicTermsEnabled defaults to true (adab-safe defaults)
- [Phase 06-02]: Stack.Protected guard with guard={!onboardingComplete} — declarative route gating, no manual redirect
- [Phase 06-02]: Hydration gate: app renders null until fontsLoaded + migrationsComplete + hydrated all true
- [Phase 06-02]: Character customization encoded as compound string in characterPresetId field (no DB change)
- [Phase 06-02]: Tour background uses simplified HUD preview (not real store context) — keeps onboarding self-contained
- [Phase 06-02]: as never cast for expo-router typed routes (type generation runs at build time, not TS compile)
- [Phase 06-03]: expo-file-system/legacy (not v2 root) for writeAsStringAsync and cacheDirectory
- [Phase 06-03]: deleteAllUserData uses raw execSync SQL -- no new deleteAll repo methods needed, wrapped in try/catch for store resets
- [Phase 06-03]: TrophyCase renders all titles from TITLE_SEED_DATA client-side (static data, no DB query)
- [Phase 06-03]: ProfileHeader uses RN Image not Skia -- standard View context, not inside Skia Canvas
- [Phase 06-04]: shouldShowBanner + shouldShowList (not deprecated shouldShowAlert) for foreground notification handler in SDK 0.31
- [Phase 06-04]: Notification tap routing via title+body keyword matching -- no custom data payload needed, consistent with notification-copy.ts patterns
- [Phase 06-04]: rescheduleAll effect dependency array includes all 9 notification settings -- settings screen changes apply immediately without restart
- [Phase 06-04]: Non-fatal try/catch on rescheduleAll -- notifications are enhancement not core function
- [Phase 07-01]: Inline jest.mock factory for src/lib/supabase in tests — avoids localStorage global not defined in Node env
- [Phase 07-01]: authStore has NO persist middleware — session managed by Supabase's own expo-sqlite localStorage persistence
- [Phase 07-01]: signOut is non-destructive — local SQLite data belongs to the device, not the session
- [Phase 07-01]: deleteAccount calls supabase.rpc('delete_user') for server cleanup before local wipe
- [Phase 07-01]: migrateGuestData uses raw execSync (same pattern as deleteAllUserData) — no new repo methods needed
- [Phase 07-03]: PressStart2P at 18px for auth screen titles per UI-SPEC (overrides typography.headingLg which is Inter-Bold 24px)
- [Phase 07-03]: SyncStatusIcon treats idle+!isAuthenticated as the offline/no-account muted state (cloud-x, surface-700)
- [Phase 07-03]: MergeChoiceSheet is rendered inside create-account.tsx (not as a separate route) — single-use decision modal
- [Phase 07-03]: AccountNudgeBanner exit animation uses setTimeout(210ms) delay before calling setNudgeDismissed
- [Phase 07]: [Phase 07-04]: useAuthStore.getState().userId in callbacks/handlers avoids rules-of-hooks violations
- [Phase 07]: [Phase 07-04]: Server-side deletion in deleteAllUserData is non-fatal — local deletion always proceeds even if Supabase unreachable

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
- Supabase project not yet created -- EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY needed in .env

## Session Continuity

Last session: 2026-03-18
Stopped at: 07-03 paused at checkpoint:human-verify (Task 2) — visual verification needed
Resume file: None
