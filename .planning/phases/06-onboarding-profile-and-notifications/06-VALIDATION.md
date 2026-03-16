---
phase: 6
slug: onboarding-profile-and-notifications
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest-expo (already configured) |
| **Config file** | `jest.config.js` at project root |
| **Quick run command** | `npx jest --testPathPattern="domain/niyyah\|domain/notification-copy\|services/notification" --passWithNoTests` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="domain/niyyah\|domain/notification-copy\|services/notification" --passWithNoTests`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 0 | ONBR-01 | unit | `npx jest __tests__/domain/niyyah-options.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 0 | ONBR-02 | unit | `npx jest __tests__/domain/starter-packs.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 0 | ONBR-03 | unit | `npx jest __tests__/stores/settingsStore.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-04 | 01 | 0 | NOTF-01 | unit | `npx jest __tests__/services/notification-service.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-05 | 01 | 0 | NOTF-02 | unit | `npx jest __tests__/services/notification-service.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-06 | 01 | 0 | NOTF-03 | unit | `npx jest __tests__/domain/notification-copy.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-07 | 01 | 0 | NOTF-04 | unit | `npx jest __tests__/services/notification-service.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-08 | 01 | 0 | PROF-02 | unit | `npx jest __tests__/stores/settingsStore.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-01-09 | 01 | 0 | PROF-03 | unit | `npx jest __tests__/services/data-export.test.ts -x` | ❌ W0 | ⬜ pending |
| 06-XX-XX | XX | X | ONBR-04 | manual | Visual walkthrough < 2 min | N/A | ⬜ pending |
| 06-XX-XX | XX | X | PROF-01 | unit | `npx jest __tests__/stores/stores.test.ts -x` | ✅ (extend) | ⬜ pending |
| 06-XX-XX | XX | X | PROF-04 | manual | Visual check on dark/light device | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/domain/niyyah-options.test.ts` — stubs for ONBR-01 (seasonal filtering)
- [ ] `__tests__/domain/starter-packs.test.ts` — stubs for ONBR-02 (bundle habit IDs)
- [ ] `__tests__/domain/notification-copy.test.ts` — stubs for NOTF-03 (adab copy guard)
- [ ] `__tests__/services/notification-service.test.ts` — stubs for NOTF-01, NOTF-02, NOTF-04
- [ ] `__tests__/services/data-export.test.ts` — stubs for PROF-03 (export format)
- [ ] `__tests__/stores/settingsStore.test.ts` — stubs for ONBR-03, PROF-02 (new fields)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Onboarding ≤ 5 screens, < 2 min | ONBR-04 | UX timing & flow requires real device walkthrough | Launch app as new user, time the flow end-to-end, count screens |
| Dark mode 'auto' reads system scheme | PROF-04 | Requires toggling device system settings | Toggle device dark/light mode, verify app follows |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
