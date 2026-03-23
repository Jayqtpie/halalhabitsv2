---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Social & Battle Systems
status: Ready to execute
stopped_at: Completed 14-01-PLAN.md
last_updated: "2026-03-23T20:09:19.748Z"
progress:
  total_phases: 7
  completed_phases: 3
  total_plans: 14
  completed_plans: 11
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Players build real-world Islamic discipline through game mechanics that motivate behavior without claiming to measure spiritual worth.
**Current focus:** Phase 14 — nafs-boss-arena

## Current Position

Phase: 14 (nafs-boss-arena) — EXECUTING
Plan: 3 of 5

## Accumulated Context

### Decisions

- Boss unlock lowered to Level 10+ (from Blueprint's 15+) for faster engagement
- Up to 20 buddies (expanded from original "duo" concept)
- Only 1 new npm package (leo-profanity) — all else uses existing stack
- Boss battles are PRIVATE (local-only) — nafs archetype reveals personal struggle
- Detox sessions are LOCAL_ONLY — ephemeral, no sync needed
- XP economy spreadsheet must be built in Phase 11 before any XP feature ships
- Decisions logged in PROJECT.md Key Decisions table.
- [Phase 11]: Drizzle table SQL names accessed via Symbol.for('drizzle:Name'), not _.name — discovered during auto-validation test
- [Phase 11]: Buddies table uses dual-owner RLS (user_a OR user_b) — both users own the pair equally
- [Phase 11]: XP economy worst-case ~1,330 XP/day cannot level up at level 10+ (requires 2,302 XP) — cap proven sufficient
- [Phase 11]: Actual salah XP base values (fajr=50, others=15) differ from Blueprint template (30/20) — economy model uses actual values
- [Phase 12-friday-power-ups]: getAlKahfExpiry uses dependency injection for getPrayerWindows to keep friday-engine.ts pure and testable
- [Phase 12-friday-power-ups]: ALKAHF_TEMPLATE excluded from QUEST_TEMPLATES array — generated separately by gameStore when isFriday() is true
- [Phase 12-friday-power-ups]: Friday multiplier injected at habitStore.completeHabit call site (not inside awardXP) to preserve quest XP exclusion at 1.0 per D-13
- [Phase 12-friday-power-ups]: FridayMessageBanner rendered as React Native View sibling outside Skia Canvas — Canvas cannot host RN views
- [Phase 12-friday-power-ups]: AlKahf section progress stored as boolean[] locally, synced via questRepo.updateProgressAtomic on each chip tap
- [Phase 12-friday-power-ups]: JumuahToggle state is local to HabitCard — honor system toggle with no persistence, no XP awarded
- [Phase 13-dopamine-detox-dungeon]: detox-engine daily XP formula: 50+(clampedHours-2)*25, clamp(h,2-6); deep always 300
- [Phase 13-dopamine-detox-dungeon]: detoxRepo uses caller-supplied day/week boundaries — getTodaySessions(dayStart,dayEnd), getThisWeekDeepSessions(weekStart)
- [Phase 13-dopamine-detox-dungeon]: detoxStore uses no persist middleware — session data lives in SQLite (LOCAL_ONLY invariant)
- [Phase 13-dopamine-detox-dungeon]: Full-day window used for streak protection during active detox (dayStart to dayEnd) — simplest correct approach
- [Phase 13-dopamine-detox-dungeon]: Title count expanded to 27 with The Unplugged (detox_completions, 10 sessions, sortOrder 27)
- [Phase 13-dopamine-detox-dungeon]: EarlyExitConfirmation rendered as sibling Modal outside DungeonSheet to avoid z-index nesting issues
- [Phase 13-dopamine-detox-dungeon]: DetoxCountdownTimer uses setInterval + getRemainingMs (no Reanimated per-tick) — matches UI-SPEC timer performance contract
- [Phase 13-dopamine-detox-dungeon]: Phase-offset torches use setTimeout(200ms) to start second withRepeat at different phase for natural flicker
- [Phase 13-dopamine-detox-dungeon]: XP count-up uses state-based setInterval (not Reanimated withTiming) to avoid worklet<->JS bridge limitation with Text children
- [Phase 14]: bossRepo uses selectDistinct for getDefeatedArchetypes — Drizzle native distinct per-column query
- [Phase 14]: getBossDialoguePhase checks defeated status before isFirstDay — status is authoritative
- [Phase 14]: suggestArchetype returns procrastinator as safe fallback when no data provided

### Pending Todos

- Gear icon redesign (flagged during 03-06 verification)
- Replace environment PNG placeholders with real AI-generated pixel art assets
- Apple Developer account for EAS Build
- Supabase project creation and deployment
- Push notification webhook setup

### Blockers/Concerns

- [Phase 14]: Boss archetype content needs Islamic-literate copy review before shipping
- [Phase 15]: RLS policy design for social graph needs careful buddy-pair scoping
- [Phase 17]: Islamic content blocklist must be hand-curated (no open-source list exists)
- [Deployment]: Apple Developer account needed for EAS Build and App Store submission

## Session Continuity

Last session: 2026-03-23T20:09:19.744Z
Stopped at: Completed 14-01-PLAN.md
Resume file: None
