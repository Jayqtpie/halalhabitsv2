---
phase: 4
slug: game-engine-and-progression
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest-expo ~54.0.17 |
| **Config file** | jest.config.js (or package.json jest field) |
| **Quick run command** | `npm test -- --testPathPattern=domain/` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=domain/`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 0 | GAME-01 | unit | `npm test -- --testPathPattern=domain/xp-engine` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 0 | GAME-02 | unit | `npm test -- --testPathPattern=domain/xp-engine` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 0 | GAME-03 | unit | `npm test -- --testPathPattern=domain/title-engine` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 0 | GAME-04 | unit | `npm test -- --testPathPattern=domain/quest-engine` | ❌ W0 | ⬜ pending |
| 04-01-05 | 01 | 0 | GAME-05 | unit | `npm test -- --testPathPattern=domain/quest-engine` | ❌ W0 | ⬜ pending |
| 04-01-06 | 01 | 0 | GAME-06 | unit | `npm test -- --testPathPattern=domain/xp-engine` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/domain/xp-engine.test.ts` — stubs for GAME-01, GAME-02, GAME-06
- [ ] `__tests__/domain/title-engine.test.ts` — stubs for GAME-03
- [ ] `__tests__/domain/quest-engine.test.ts` — stubs for GAME-04, GAME-05

*No framework gaps — jest-expo already installed and working from Phase 2/3*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| XP float animation rises from card | GAME-01 | Visual animation timing/position | Complete a habit, verify float appears over card and rises |
| Level-up celebration modal appears | GAME-02 | Full-screen overlay visual test | Trigger level-up, verify modal shows with correct level number |
| Title unlock modal shows correctly | GAME-03 | Visual overlay with equip button | Trigger title unlock, verify modal with title name and equip/later buttons |
| Quest Board shows daily/weekly sections | GAME-04 | Layout and grouping visual test | Open quests tab, verify sections render with correct grouping |
| XP bar animates on gain | GAME-01 | Animation smoothness/timing | Complete habit, verify bar fills incrementally |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
