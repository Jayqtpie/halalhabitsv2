---
phase: 8
slug: critical-integration-wiring
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest-expo (jest 29.x) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npx jest --no-coverage --testPathPattern="(sync-queue-wiring\|repos)"` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --no-coverage --testPathPattern="(sync-queue-wiring|repos)"`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | SYNC-02 | unit | `npx jest --no-coverage --testPathPattern="repos"` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | SYNC-02 | unit | `npx jest --no-coverage --testPathPattern="repos"` | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | SYNC-02 | unit | `npx jest --no-coverage --testPathPattern="repos"` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 1 | SYNC-01 | unit | `npx jest --no-coverage --testPathPattern="integration"` | ❌ W0 | ⬜ pending |
| 08-03-01 | 03 | 2 | SYNC-03 | unit | `npx jest --no-coverage --testPathPattern="sync-engine"` | ✅ | ⬜ pending |
| 08-03-02 | 03 | 2 | SYNC-03 | unit | `npx jest --no-coverage --testPathPattern="auth-service"` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/db/repos/syncQueueWiring.test.ts` — stubs for SYNC-02 (enqueue called in repos, isAuthenticated guard, assertSyncable guard)
- [ ] `__tests__/integration/authUserId.test.ts` — stubs for SYNC-01 (tab screens use authStore userId, not hardcoded string)

*Existing `__tests__/services/sync-engine.test.ts` and `auth-service.test.ts` already cover downstream behavior.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AccountNudgeBanner renders for guest after title unlock | SYNC-01 | UI rendering with animation state | 1. Run app as guest 2. Earn first title 3. Verify banner appears on Home HUD |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
