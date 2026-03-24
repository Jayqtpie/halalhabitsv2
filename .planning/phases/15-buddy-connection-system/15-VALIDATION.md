---
phase: 15
slug: buddy-connection-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npm test -- --testPathPattern="buddy" --no-coverage` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="buddy" --no-coverage`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | BUDY-01 | unit | `npm test -- --testPathPattern="buddy-engine" --no-coverage` | No — Wave 0 | ⬜ pending |
| 15-01-02 | 01 | 1 | BUDY-01 | unit | `npm test -- --testPathPattern="buddy-engine" --no-coverage` | No — Wave 0 | ⬜ pending |
| 15-02-01 | 02 | 1 | BUDY-02, BUDY-04, BUDY-05 | unit | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | No — Wave 0 | ⬜ pending |
| 15-02-02 | 02 | 1 | BUDY-03 | unit | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | No — Wave 0 | ⬜ pending |
| 15-02-03 | 02 | 1 | BUDY-06 | unit (privacy invariant) | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | No — Wave 0 | ⬜ pending |
| 15-02-04 | 02 | 1 | BUDY-07 | unit (source scan) | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | No — Wave 0 | ⬜ pending |
| 15-03-01 | 03 | 2 | BUDY-04, BUDY-05 | unit | `npm test -- --testPathPattern="buddyStore" --no-coverage` | No — Wave 0 | ⬜ pending |
| 15-04-01 | 04 | 3 | BUDY-05 | manual | Visual verification | N/A | ⬜ pending |
| 15-04-02 | 04 | 3 | BUDY-06 | manual | Visual verification | N/A | ⬜ pending |
| 15-05-01 | 05 | 3 | BUDY-07 | integration | `npm test -- --testPathPattern="rls" --no-coverage` | No — Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/domain/buddy-engine.test.ts` — stubs for BUDY-01 (code generation, expiry, rate limit)
- [ ] `__tests__/db/buddyRepo.test.ts` — stubs for BUDY-02, BUDY-03, BUDY-04, BUDY-05, BUDY-06, BUDY-07
- [ ] `__tests__/stores/buddyStore.test.ts` — stubs for store state transitions

*Existing jest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Buddy list UI layout and card design | BUDY-05 | Visual styling | Open buddy tab, verify cards show avatar/username/status dot/streak |
| Buddy profile RPG character sheet feel | BUDY-06 | Visual styling | Tap a buddy, verify XP/level/title display matches design spec |
| Share sheet opens with invite code | BUDY-01 | OS integration | Tap Invite, verify native share sheet opens with correct code format |
| Empty state illustration | BUDY-05 | Visual | Open buddy tab with no buddies, verify pixel-art illustration shows |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
