---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Social & Battle Systems
status: Ready to execute
stopped_at: Completed 15-05-PLAN.md
last_updated: "2026-03-25T19:26:28.601Z"
progress:
  total_phases: 7
  completed_phases: 4
  total_plans: 19
  completed_plans: 18
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Players build real-world Islamic discipline through game mechanics that motivate behavior without claiming to measure spiritual worth.
**Current focus:** Phase 15 — buddy-connection-system

## Current Position

Phase: 15 (buddy-connection-system) — EXECUTING
Plan: 4 of 5

## Accumulated Context

### Decisions

- Boss unlock lowered to Level 10+ (from Blueprint's 15+) for faster engagement
- Up to 20 buddies (expanded from original "duo" concept)
- Only 1 new npm package (leo-profanity) — all else uses existing stack
- Boss battles are PRIVATE (local-only) — nafs archetype reveals personal struggle
- Detox sessions are LOCAL_ONLY — ephemeral, no sync needed
- XP economy spreadsheet must be built in Phase 11 before any XP feature ships
- Decisions logged in PROJECT.md Key Decisions table.
- [Phase 11]: Drizzle table SQL names accessed via Symbol.for('drizzle:Name'), not _.name
- [Phase 11]: Buddies table uses dual-owner RLS (user_a OR user_b)
- [Phase 11]: XP economy worst-case ~1,330 XP/day cannot level up at level 10+
- [Phase 11]: Actual salah XP base values (fajr=50, others=15) differ from Blueprint template
- [Phase 12]: getAlKahfExpiry uses dependency injection for getPrayerWindows
- [Phase 12]: ALKAHF_TEMPLATE excluded from QUEST_TEMPLATES array
- [Phase 12]: Friday multiplier injected at habitStore.completeHabit call site
- [Phase 12]: FridayMessageBanner rendered as React Native View sibling outside Skia Canvas
- [Phase 12]: AlKahf section progress stored as boolean[] locally
- [Phase 12]: JumuahToggle state is local to HabitCard — honor system toggle
- [Phase 13]: detox-engine daily XP formula: 50+(clampedHours-2)*25
- [Phase 13]: detoxRepo uses caller-supplied day/week boundaries
- [Phase 13]: detoxStore uses no persist middleware
- [Phase 13]: Title count expanded to 27 with The Unplugged
- [Phase 13]: EarlyExitConfirmation rendered as sibling Modal outside DungeonSheet
- [Phase 13]: DetoxCountdownTimer uses setInterval + getRemainingMs
- [Phase 13]: Phase-offset torches use setTimeout(200ms) for natural flicker
- [Phase 13]: XP count-up uses state-based setInterval
- [Phase 14]: bossRepo uses selectDistinct for getDefeatedArchetypes
- [Phase 14]: getBossDialoguePhase checks defeated status before isFirstDay
- [Phase 14]: suggestArchetype returns procrastinator as safe fallback
- [Phase 14]: bossStore uses habitStore.mercyModes for mercy mode detection
- [Phase 14]: BOSS_TITLES added as separate array (sortOrder 28-30, 30 total entries)
- [Phase 14]: BossHpBar inside parent Canvas; archetype silhouette as absolute View overlay
- [Phase 14-UAT]: Arena init must call loadHabits for cold reload support
- [Phase 14-UAT]: Inline habit checklist added to Arena — damage dealt without leaving screen
- [Phase 14-UAT]: Visual HP offset tracks per-habit damage in real-time
- [Phase 14-UAT]: BossDefeatFanfare renders in both HudScene and ArenaScreen
- [Phase 15]: buddyStore uses no persist middleware — SQLite via buddyRepo is the source of truth
- [Phase 15]: syncStreakToUser is non-fatal — buddy streak display lag never breaks core habit flow
- [Phase 15]: OnlineStatusDot created in Plan 05 to unblock profile screen (Plan 04 will reuse)
- [Phase 15]: Avatar color derived from name hash — 5-color palette, no network dependency
- [Phase 15]: Three-dot menu as Modal dropdown avoids adding a bottom-sheet library

### Pending Todos

- Gear icon redesign (flagged during 03-06 verification)
- Replace environment PNG placeholders with real AI-generated pixel art assets
- Apple Developer account for EAS Build
- Supabase project creation and deployment
- Push notification webhook setup
- Arena stone/ruby HUD theme needs real assets to verify visually (UAT #5 deferred)
- Reduce Motion accessibility pass (UAT #7 deferred)
- Boss damage animation on habit completion (noted during UAT)

### Blockers/Concerns

- [Phase 15]: RLS policy design for social graph needs careful buddy-pair scoping
- [Phase 17]: Islamic content blocklist must be hand-curated (no open-source list exists)
- [Deployment]: Apple Developer account needed for EAS Build and App Store submission

## Session Continuity

Last session: 2026-03-25T19:26:28.597Z
Stopped at: Completed 15-05-PLAN.md
Resume file: None
