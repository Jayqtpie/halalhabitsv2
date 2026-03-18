---
phase: 9
slug: verification-and-audit-cleanup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest-expo (jest 29) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npx jest --no-coverage 2>&1 \| tail -20` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --no-coverage 2>&1 | tail -20`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | FOUN-01 | file-check | `ls eas.json` | ✅ | ⬜ pending |
| 09-01-02 | 01 | 1 | FOUN-02 | file-check | `ls app/(tabs)/` | ✅ | ⬜ pending |
| 09-01-03 | 01 | 1 | FOUN-03 | unit | `npx jest __tests__/db/database.test.ts` | ✅ | ⬜ pending |
| 09-01-04 | 01 | 1 | FOUN-04 | unit | `npx jest __tests__/stores/stores.test.ts` | ✅ | ⬜ pending |
| 09-01-05 | 01 | 1 | FOUN-05 | unit | `npx jest __tests__/services/privacy-gate.test.ts` | ✅ | ⬜ pending |
| 09-01-06 | 01 | 1 | FOUN-06 | unit | `npx jest __tests__/tokens/tokens.test.ts` | ✅ | ⬜ pending |
| 09-01-07 | 01 | 1 | FOUN-07 | unit | `npx jest __tests__/i18n/i18n.test.ts` | ✅ | ⬜ pending |
| 09-02-01 | 02 | 1 | HBIT-01 | unit | `npx jest __tests__/domain/presets.test.ts` | ✅ | ⬜ pending |
| 09-02-02 | 02 | 1 | HBIT-02 | manual | N/A — UI component | N/A | ⬜ pending |
| 09-02-03 | 02 | 1 | HBIT-05 | manual | N/A — UI component | N/A | ⬜ pending |
| 09-02-04 | 02 | 1 | PRAY-01 | unit | `npx jest __tests__/services/prayer-times.test.ts` | ✅ | ⬜ pending |
| 09-02-05 | 02 | 1 | PRAY-02 | manual | N/A — UI component | N/A | ⬜ pending |
| 09-02-06 | 02 | 1 | PRAY-03 | manual | N/A — UI component | N/A | ⬜ pending |
| 09-02-07 | 02 | 1 | PRAY-04 | unit | `npx jest __tests__/services/notification-service.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Phase 9 creates no new code so no new tests are needed. The existing test suite is run as evidence collection, not extended.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Custom habit creation form | HBIT-02 | UI component, device-only | Verify CreateHabitSheet component exists with required fields |
| Edit/archive sheet | HBIT-05 | UI component, device-only | Verify EditHabitSheet component exists with edit/archive actions |
| CalcMethodPicker UI | PRAY-02 | UI component, device-only | Verify CalcMethodPicker component exists and renders |
| PrayerTimeWindow on HabitCard | PRAY-03 | UI component, device-only | Verify HabitCard renders prayer time window when applicable |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
