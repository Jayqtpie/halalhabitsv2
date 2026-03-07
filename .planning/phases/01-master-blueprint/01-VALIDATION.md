---
phase: 1
slug: master-blueprint
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-07
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual review (documentation phase — no automated tests) |
| **Config file** | none |
| **Quick run command** | `grep -r "TODO\|TBD\|PLACEHOLDER" blueprint/` |
| **Full suite command** | Manual checklist review against success criteria |
| **Estimated runtime** | ~30 seconds (file existence checks) |

---

## Sampling Rate

- **After every task commit:** Verify file exists and section headers match template
- **After every plan wave:** Cross-reference check (do screen specs reference features defined in BLUE-05?)
- **Before `/gsd:verify-work`:** Full success criteria checklist must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | BLUE-01 | manual-only | `test -f blueprint/01-executive-vision.md` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | BLUE-02 | manual-only | `test -f blueprint/02-player-fantasy.md` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | BLUE-03 | manual-only | `grep -c "Level.*XP.*Days" blueprint/03-game-design-bible.md` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | BLUE-04 | manual-only | `grep -c "Title:" blueprint/04-worldbuilding.md` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | BLUE-05 | manual-only | `test -f blueprint/05-feature-systems.md` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | BLUE-06 | manual-only | `test -f blueprint/06-information-architecture.md` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | BLUE-07 | manual-only | `grep -c "┌\|┐\|└\|┘\|│\|─" blueprint/07-screen-specs.md` | ❌ W0 | ⬜ pending |
| 01-02-04 | 02 | 2 | BLUE-08 | manual-only | `grep -c "#[0-9A-Fa-f]" blueprint/08-ui-design-tokens.md` | ❌ W0 | ⬜ pending |
| 01-02-05 | 02 | 2 | BLUE-09 | manual-only | `test -f blueprint/09-sound-haptics.md` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | BLUE-10 | manual-only | `test -f blueprint/10-tech-architecture.md` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | BLUE-11 | manual-only | `grep -c "PRIVATE\|SYNCABLE" blueprint/11-data-model.md` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 3 | BLUE-12 | manual-only | `test -f blueprint/12-telemetry.md` | ❌ W0 | ⬜ pending |
| 01-03-04 | 03 | 3 | BLUE-13 | manual-only | `test -f blueprint/13-qa-balance.md` | ❌ W0 | ⬜ pending |
| 01-03-05 | 03 | 3 | BLUE-14 | manual-only | `test -f blueprint/14-delivery-roadmap.md` | ❌ W0 | ⬜ pending |
| 01-03-06 | 03 | 3 | BLUE-15 | manual-only | `grep -c "copy string" blueprint/15-content-pack.md` | ❌ W0 | ⬜ pending |
| 01-03-07 | 03 | 3 | BLUE-16 | manual-only | `test -f blueprint/16-build-handoff.md` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `blueprint/` directory — needs creation
- [ ] All 16 markdown files — none exist yet
- [ ] Adab Copy Guide — should be created early as a reference for all copy-writing tasks
- [ ] XP formula constants — need to be derived from time-to-level targets before BLUE-03

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Executive vision has market gap analysis | BLUE-01 | Content quality check | Review for completeness against requirement spec |
| XP simulation table has 100 levels with time-to-level | BLUE-03 | Mathematical validation | Verify curve matches "level 5-8 in first week" target |
| Screen specs have ASCII mockups for all screens | BLUE-07 | Visual review | Count screens, verify each has mockup + interactions |
| Data model has privacy classifications | BLUE-11 | Schema review | Verify every entity marked PRIVATE or SYNCABLE |
| Content pack has 130+ copy strings | BLUE-15 | Volume count | Count all copy strings, verify adab compliance |
| Adab safety rails documented with examples | All | Tone/content review | Check do/don't pairs exist with specific copy examples |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
