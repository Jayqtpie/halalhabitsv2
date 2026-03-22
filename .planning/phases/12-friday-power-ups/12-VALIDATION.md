---
phase: 12
slug: friday-power-ups
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (jest-expo preset) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npx jest __tests__/domain/friday-engine.test.ts --no-coverage` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest __tests__/domain/friday-engine.test.ts --no-coverage`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | FRDY-01 | unit | `npx jest __tests__/domain/friday-engine.test.ts -t "isFriday" --no-coverage` | ❌ W0 | ⬜ pending |
| 12-01-02 | 01 | 1 | FRDY-01 | unit | `npx jest __tests__/domain/friday-engine.test.ts -t "combinedMultiplier" --no-coverage` | ❌ W0 | ⬜ pending |
| 12-01-03 | 01 | 1 | FRDY-01 | unit | `npx jest __tests__/domain/xp-engine.test.ts -t "applySoftCap" --no-coverage` | ✅ | ⬜ pending |
| 12-01-04 | 01 | 1 | FRDY-01 | unit | `npx jest __tests__/domain/friday-engine.test.ts -t "questXP excluded" --no-coverage` | ❌ W0 | ⬜ pending |
| 12-02-01 | 02 | 1 | FRDY-03 | unit | `npx jest __tests__/domain/friday-engine.test.ts -t "Al-Kahf gate" --no-coverage` | ❌ W0 | ⬜ pending |
| 12-02-02 | 02 | 1 | FRDY-03 | unit | `npx jest __tests__/domain/friday-engine.test.ts -t "fallback expiry" --no-coverage` | ❌ W0 | ⬜ pending |
| 12-03-01 | 03 | 1 | FRDY-04 | unit | `npx jest __tests__/domain/notification-copy.test.ts -t "getFridayMessage" --no-coverage` | ❌ W0 | ⬜ pending |
| 12-03-02 | 03 | 1 | FRDY-04 | unit | `npx jest __tests__/domain/notification-copy.test.ts -t "Friday messages adab" --no-coverage` | ❌ W0 | ⬜ pending |
| 12-03-03 | 03 | 1 | FRDY-04 | unit | `npx jest __tests__/domain/notification-copy.test.ts -t "week stability" --no-coverage` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/domain/friday-engine.test.ts` — stubs for FRDY-01, FRDY-03 (isFriday, combinedMultiplier, questXP excluded, Al-Kahf gate, fallback expiry)
- [ ] Additional test cases in `__tests__/domain/notification-copy.test.ts` — stubs for FRDY-04 (getFridayMessage rotation, adab safety, week stability)

*Existing infrastructure covers framework install: `jest.config.js` present, `jest-expo` preset active, domain test pattern established.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| HUD Jumu'ah boost indicator visibility | FRDY-02 | Visual rendering on device | Open app on Friday, verify 2x badge visible on HUD; open on non-Friday, verify badge absent |
| Friday message integrated in HUD game world | FRDY-04 | Visual layout in game scene | Open app on first Friday open, verify message appears as game-world element (not modal/toast) |
| Jumu'ah toggle appears only on Fridays | FRDY-02 | UI conditional rendering | On Friday, check Dhuhr slot has Jumu'ah toggle; on non-Friday, verify toggle absent |
| Boost fade-out animation on day change | FRDY-02 | Animation timing/visual | Keep app open past midnight Friday, verify fade-out animation and "Friday boost ended" message |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
