---
phase: 3
slug: core-habit-loop
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest via jest-expo ~54.0.17 |
| **Config file** | jest.config.js |
| **Quick run command** | `npm test -- --testPathPattern="habits\|prayer\|streak" --no-coverage` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="habits|prayer|streak" --no-coverage`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | HBIT-01 | unit | `npm test -- --testPathPattern="presets" -t "create from preset"` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | HBIT-02 | unit | `npm test -- --testPathPattern="habits" -t "custom habit"` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | HBIT-03 | unit | `npm test -- --testPathPattern="completion" -t "complete habit"` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | HBIT-04 | unit | `npm test -- --testPathPattern="habit-sorter" -t "sort"` | ❌ W0 | ⬜ pending |
| 03-01-05 | 01 | 1 | HBIT-05 | unit | `npm test -- --testPathPattern="habits" -t "archive"` | ✅ partial | ⬜ pending |
| 03-01-06 | 01 | 1 | HBIT-06 | unit | `npm test -- --testPathPattern="completion" -t "date range"` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | PRAY-01 | unit | `npm test -- --testPathPattern="prayer" -t "prayer times"` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | PRAY-02 | unit | `npm test -- --testPathPattern="prayer" -t "calculation method"` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | PRAY-03 | unit | `npm test -- --testPathPattern="prayer" -t "window status"` | ❌ W0 | ⬜ pending |
| 03-02-04 | 02 | 1 | PRAY-04 | manual-only | Manual test on device | N/A | ⬜ deferred P6 |
| 03-03-01 | 03 | 2 | STRK-01 | unit | `npm test -- --testPathPattern="streak" -t "streak count"` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | STRK-02 | unit | `npm test -- --testPathPattern="streak" -t "streak shield"` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 2 | STRK-03 | unit | `npm test -- --testPathPattern="streak" -t "mercy mode"` | ❌ W0 | ⬜ pending |
| 03-03-04 | 03 | 2 | STRK-04 | unit | `npm test -- --testPathPattern="streak" -t "recovery"` | ❌ W0 | ⬜ pending |
| 03-03-05 | 03 | 2 | STRK-05 | manual-only | Copy review against adab rails | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/domain/streak-engine.test.ts` — stubs for STRK-01, STRK-02, STRK-03, STRK-04
- [ ] `__tests__/domain/habit-sorter.test.ts` — stubs for HBIT-04 sorting logic
- [ ] `__tests__/services/prayer-times.test.ts` — stubs for PRAY-01, PRAY-02, PRAY-03
- [ ] `__tests__/db/completionRepo.test.ts` — stubs for HBIT-03, HBIT-06 date queries
- [ ] `__tests__/domain/presets.test.ts` — stubs for HBIT-01 preset definitions
- [ ] Install adhan as dev dep or mock for unit tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Prayer notifications | PRAY-04 | Deferred to Phase 6 (notification infrastructure) | N/A |
| Momentum framing copy | STRK-05 | Requires human review of language against adab rails | Review all user-facing streak text for shame-free, encouraging tone |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
