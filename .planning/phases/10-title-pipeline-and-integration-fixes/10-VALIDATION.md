---
phase: 10
slug: title-pipeline-and-integration-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest-expo ~54.0.17 |
| **Config file** | package.json ("jest-expo" preset) |
| **Quick run command** | `npm test -- --testPathPattern=gameStore\|authUserId\|your-data` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=gameStore|authUserId`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 0 | GAME-03 | unit | `npm test -- --testPathPattern=gameStore` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 0 | GAME-05 | unit | `npm test -- --testPathPattern=gameStore` | ❌ W0 | ⬜ pending |
| 10-01-03 | 01 | 0 | PROF-03/SYNC-01 | static analysis | `npm test -- --testPathPattern=authUserId` | ✅ extend | ⬜ pending |
| 10-02-01 | 02 | 1 | GAME-03 | unit | `npm test -- --testPathPattern=gameStore` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 1 | GAME-03 | unit | `npm test -- --testPathPattern=gameStore` | ❌ W0 | ⬜ pending |
| 10-02-03 | 02 | 1 | GAME-05 | unit | `npm test -- --testPathPattern=gameStore` | ❌ W0 | ⬜ pending |
| 10-02-04 | 02 | 1 | PROF-03/SYNC-01 | static analysis | `npm test -- --testPathPattern=authUserId` | ✅ extend | ⬜ pending |
| 10-03-01 | 03 | 2 | STRK-03/04 | integration | N/A | manual | ⬜ pending |
| 10-03-02 | 03 | 2 | MUHA-01 | integration | N/A | manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/stores/gameStore.test.ts` — stubs for GAME-03 (mercyRecoveries, muhasabahStreak), GAME-05 (partial progress); needs mocks for `streakRepo`, `muhasabahRepo`, `questRepo`
- [ ] Extend `__tests__/integration/authUserId.test.ts` — add describe block covering `app/your-data.tsx` for PROF-03/SYNC-01

*Existing infrastructure covers framework setup — only test files needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mercy Mode → title unlock E2E flow | STRK-03/04 | React Native UI flow, requires running app | 1. Break a streak 2. Activate Mercy Mode 3. Complete recovery 4. Verify "Resilient One" title unlocks |
| Muhasabah → title unlock E2E flow | MUHA-01 | React Native UI flow, requires running app | 1. Complete 7 consecutive daily Muhasabah entries 2. Verify "The Reflective" title unlocks |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
