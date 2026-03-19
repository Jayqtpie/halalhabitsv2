---
phase: 7
slug: backend-auth-and-sync
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest-expo ~54.0.17 |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npx jest --no-coverage --testPathPattern="auth\|sync" -x` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --no-coverage __tests__/services/ -x`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | SYNC-01 | unit | `npx jest --no-coverage __tests__/services/auth-service.test.ts -x` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | SYNC-02 | unit | `npx jest --no-coverage __tests__/services/sync-engine.test.ts -x` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | SYNC-02 | unit | `npx jest --no-coverage __tests__/services/privacy-gate.test.ts -x` | ✅ | ⬜ pending |
| 07-01-04 | 01 | 1 | SYNC-03 | unit | `npx jest --no-coverage __tests__/services/sync-engine.test.ts -x` | ❌ W0 | ⬜ pending |
| 07-01-05 | 01 | 1 | SYNC-03 | unit | `npx jest --no-coverage __tests__/services/sync-engine.test.ts -x` | ❌ W0 | ⬜ pending |
| 07-01-06 | 01 | 1 | SYNC-04 | unit | `npx jest --no-coverage __tests__/services/auth-service.test.ts -x` | ❌ W0 | ⬜ pending |
| 07-01-07 | 01 | 1 | SYNC-05 | manual | Supabase dashboard review | Manual only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/services/auth-service.test.ts` — stubs for SYNC-01, SYNC-04
- [ ] `__tests__/services/sync-engine.test.ts` — stubs for SYNC-02, SYNC-03
- [ ] Mock for `@supabase/supabase-js` in `jest.setup.ts` (supabase client calls must be mockable)
- [ ] Mock for `@react-native-community/netinfo` in `jest.setup.ts`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RLS policies on all 7 syncable tables | SYNC-05 | Requires live Supabase project with applied migrations | Check Supabase dashboard > Auth Policies for each table |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
