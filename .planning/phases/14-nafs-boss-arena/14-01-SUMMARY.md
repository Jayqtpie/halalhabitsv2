---
phase: 14-nafs-boss-arena
plan: 01
subsystem: domain
tags: [boss-engine, boss-content, pure-ts, tdd, nafs-arena]
dependency_graph:
  requires: []
  provides: [boss-engine.ts, boss-content.ts]
  affects: [future boss store, future boss repo, future boss UI]
tech_stack:
  added: []
  patterns: [pure-ts-domain, tdd-red-green, dependency-injection]
key_files:
  created:
    - src/domain/boss-engine.ts
    - src/domain/boss-content.ts
    - __tests__/domain/boss-engine.test.ts
    - __tests__/domain/boss-content.test.ts
  modified: []
decisions:
  - "getBossDialoguePhase checks 'defeated' status before isFirstDay — status is authoritative"
  - "suggestArchetype returns procrastinator as safe fallback (no data case)"
  - "calculateDailyHealing uses Math.round(healing * 0.5) for mercy mode — consistent rounding"
metrics:
  duration: "3 minutes"
  completed_date: "2026-03-23"
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 0
  tests_added: 98
---

# Phase 14 Plan 01: Boss Domain Engine & Content Pack Summary

**One-liner:** Pure TypeScript boss battle domain logic (9 functions, level-scaled HP/XP formulas, mercy mode halving) and 6-archetype nafs content pack with adab-safe dialogue sourced from blueprint/15-content-pack.md.

## What Was Built

### boss-content.ts

Exports `ArchetypeId` type union, `BossDialogue` and `BossArchetype` interfaces, and `BOSS_ARCHETYPES` record with all 6 nafs archetypes:

| ID | Name | Arabic Name |
|----|------|-------------|
| procrastinator | The Procrastinator | Al-Musawwif |
| distractor | The Distractor | Al-Mulhi |
| doubter | The Doubter | Al-Mushakkik |
| glutton | The Glutton | Al-Sharah |
| comparer | The Comparer | Al-Muqarin |
| perfectionist | The Perfectionist | Al-Kamali |

Each archetype has: id, name, arabicName, lore (1-2 sentences for card display), and 4 dialogue strings (intro, taunt, playerWinning, defeated). All dialogue strings pass adab safety rail validation (no shame language).

### boss-engine.ts

Exports `DailyLogEntry` interface and 9 pure functions:

| Function | Formula / Logic |
|----------|----------------|
| `canStartBattle` | Level >= 10, no active battle, cooldown elapsed |
| `calculateBossMaxHp` | 100 + (level - 10) * 15 |
| `calculateBossXpReward` | clamp(200 + (level - 10) * 15, 200, 500) |
| `getMaxDays` | level >= 30 ? 5 : level >= 20 ? 6 : 7 |
| `calculateDailyDamage` | round(maxHp * 0.20 * completion_ratio) |
| `calculateDailyHealing` | round(maxHp * 0.10 * miss_ratio), halved if mercy |
| `applyDailyOutcome` | clamp(hp - damage + healing, 0, maxHp) |
| `calculatePartialXp` | round(fullXp * damageDealt / maxHp) |
| `getBossDialoguePhase` | defeated > intro > player_winning > taunt |
| `suggestArchetype` | heuristic, procrastinator fallback |

## Test Results

- `__tests__/domain/boss-content.test.ts`: 52 tests, all passing
- `__tests__/domain/boss-engine.test.ts`: 46 tests, all passing
- Total: 98 tests, 0 failures

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | f363f1b | feat(14-01): add boss-content.ts with 6 archetypes and tests |
| 2 | a5544a4 | feat(14-01): add boss-engine.ts pure domain logic and tests |

## Deviations from Plan

None - plan executed exactly as written. All acceptance criteria met:
- Both domain files contain zero React imports
- All 9 functions exported from boss-engine.ts
- All 4 exports present in boss-content.ts (ArchetypeId, BossDialogue, BossArchetype, BOSS_ARCHETYPES)
- Glutton dialogue matches blueprint spec ("Why deny yourself")
- 98 tests green

## Known Stubs

None. This is a pure data/logic layer with no UI rendering. All 6 archetypes have complete dialogue and lore. No placeholder text.

## Self-Check: PASSED
