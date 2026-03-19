# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — HalalHabits Ferrari 16-Bit Edition

**Shipped:** 2026-03-19
**Phases:** 10 | **Plans:** 38 | **Timeline:** 13 days (2026-03-07 to 2026-03-19)

### What Was Built
- 5,725-line Master Blueprint design document covering 16 product sections
- Offline-first React Native app with SQLite, Zustand, Privacy Gate
- Full daily discipline loop: habit tracking, prayer times, streaks, Mercy Mode
- Game economy: XP engine, 26 Identity Titles, Quest Board with rotating quests
- 16-bit Home HUD with Skia rendering, day/night cycle, character sprite
- Onboarding with Niyyah flow, profile/settings, data export/delete
- Supabase auth, sync engine, RLS policies, push notification Edge Functions
- 414 tests, 8 verified E2E flows, all cross-phase integrations wired

### What Worked
- Blueprint-first approach eliminated mid-build redesigns — every screen had a spec
- Store-repo-engine pattern created clean separation: stores orchestrate, repos handle DB, engines are pure TS
- Pure TypeScript game engine (no React imports) made XP/title/quest logic fully unit-testable
- TDD for domain engines (streak, XP, title, quest) caught edge cases early
- GSD workflow kept 10 phases organized with clear verification at each boundary
- Phase 8-10 gap closure phases worked well — audit caught real integration gaps that code-level testing missed
- Privacy Gate as architectural boundary (not policy) ensured worship data never leaked to sync layer
- YOLO mode with balanced model profile kept velocity high without sacrificing quality

### What Was Inefficient
- SUMMARY.md one-liner fields weren't populated — accomplishment extraction at milestone close had to be manual
- Nyquist validation was scaffolded but not actually run during phases — 9/10 phases have draft VALIDATION.md only
- ~40 human verification items accumulated without a device build to test against
- Some REQUIREMENTS.md checkboxes fell out of sync mid-project — required Phase 9 cleanup sweep
- Phase 4 plan count in STATE.md shows 3/3 but ROADMAP.md shows 4/4 — minor tracking drift

### Patterns Established
- Store-repo-engine architecture for all domain modules
- Static file analysis tests for integration verification (userId propagation, sync wiring)
- Privacy Gate with assertSyncable() guard at the repo boundary
- Adab copy guide (12 do/don't pairs) as content review checklist
- Gap closure phases (audit → plan-milestone-gaps → execute) as standard milestone close process

### Key Lessons
1. Blueprint-first pays off massively for solo dev — zero major redesigns in 10 phases
2. Integration gaps only surface at cross-phase boundaries — milestone audit is essential, not optional
3. Human verification items need a plan, not just a list — without a device build pipeline, they accumulate silently
4. SUMMARY.md metadata discipline matters at milestone close — populate one-liners during execution, not retroactively
5. Static file analysis tests are surprisingly effective for integration verification without full RN pipeline

### Cost Observations
- Model mix: ~20% opus, ~75% sonnet (balanced profile), ~5% haiku
- Sessions: ~15-20 across 13 days
- Notable: Phases 1-3 took 3 days, Phases 4-7 took 8 days, Phases 8-10 (gap closure) took 2 days

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Timeline | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 13 days | 10 | Blueprint-first, GSD workflow, gap closure phases |

### Cumulative Quality

| Milestone | Tests | Test Suites | E2E Flows |
|-----------|-------|-------------|-----------|
| v1.0 | 414 | 27 | 8 verified |

### Top Lessons (Verified Across Milestones)

1. Blueprint-first eliminates mid-build redesigns
2. Milestone audit catches integration gaps that unit tests miss
3. Privacy boundaries must be architectural (code-enforced), not policy (documentation-only)
