---
phase: 14
slug: nafs-boss-arena
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (jest-expo ~54.0.17) |
| **Config file** | `jest.config.js` (existing) |
| **Quick run command** | `npx jest --testPathPattern="boss" --no-coverage` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="boss" --no-coverage`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | BOSS-01 | unit | `npx jest --testPathPattern="boss-engine" --no-coverage` | ❌ W0 | ⬜ pending |
| 14-01-02 | 01 | 1 | BOSS-01 | unit | same | ❌ W0 | ⬜ pending |
| 14-01-03 | 01 | 1 | BOSS-02 | unit | same | ❌ W0 | ⬜ pending |
| 14-01-04 | 01 | 1 | BOSS-04 | unit | same | ❌ W0 | ⬜ pending |
| 14-01-05 | 01 | 1 | BOSS-05 | unit | same | ❌ W0 | ⬜ pending |
| 14-01-06 | 01 | 1 | BOSS-06 | unit | same | ❌ W0 | ⬜ pending |
| 14-01-07 | 01 | 1 | BOSS-08 | unit | same | ❌ W0 | ⬜ pending |
| 14-01-08 | 01 | 1 | BOSS-03 | unit | `npx jest --testPathPattern="boss-content" --no-coverage` | ❌ W0 | ⬜ pending |
| 14-02-01 | 02 | 1 | BOSS-02 | unit | `npx jest --testPathPattern="bossRepo" --no-coverage` | ❌ W0 | ⬜ pending |
| 14-02-02 | 02 | 1 | BOSS-08 | privacy | same | ❌ W0 | ⬜ pending |
| 14-03-01 | 03 | 2 | BOSS-02 | unit | `npx jest --testPathPattern="bossStore" --no-coverage` | ❌ W0 | ⬜ pending |
| 14-03-02 | 03 | 2 | BOSS-05 | unit | `npx jest --testPathPattern="title-engine" --no-coverage` | ✅ extend | ⬜ pending |
| 14-04-01 | 04 | 3 | BOSS-07 | smoke | manual | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/domain/boss-engine.test.ts` — stubs for BOSS-01, BOSS-02, BOSS-04, BOSS-05, BOSS-06, BOSS-08
- [ ] `__tests__/db/bossRepo.test.ts` — stubs for BOSS-08 (privacy invariant)
- [ ] `__tests__/stores/bossStore.test.ts` — stubs for BOSS-02 (multi-day processing)
- [ ] `__tests__/domain/boss-content.test.ts` — stubs for BOSS-03 (6 archetypes x 4 dialogue strings)
- [ ] Extend `__tests__/domain/title-engine.test.ts` — add boss_defeats unlock type case (BOSS-05)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ArenaScreen renders Skia battle scene | BOSS-07 | Skia Canvas requires device/emulator | Open Arena screen, verify boss sprite + HP bar render |
| HUD theme swap to battle arena | BOSS-07 | Visual verification | Start battle, verify HUD theme changes |
| Typewriter dialogue animation | BOSS-03 | Animation timing is visual | Open Arena during battle, verify text appears character-by-character |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
