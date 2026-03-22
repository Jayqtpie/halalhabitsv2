---
phase: 13
slug: dopamine-detox-dungeon
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --testPathPattern="detox" --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern="detox" --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | DTOX-01 | unit | `npx jest __tests__/db/detoxRepo.test.ts` | ❌ W0 | ⬜ pending |
| 13-01-02 | 01 | 1 | DTOX-02,DTOX-04 | unit | `npx jest __tests__/domain/detox-engine.test.ts` | ❌ W0 | ⬜ pending |
| 13-01-03 | 01 | 1 | DTOX-06 | unit | `npx jest __tests__/domain/streak-engine.test.ts` | ✅ | ⬜ pending |
| 13-02-01 | 02 | 2 | DTOX-01,DTOX-02,DTOX-03 | unit | `npx jest __tests__/stores/detoxStore.test.ts` | ❌ W0 | ⬜ pending |
| 13-03-01 | 03 | 3 | DTOX-05 | manual | N/A — HUD visual | N/A | ⬜ pending |
| 13-03-02 | 03 | 3 | DTOX-01,DTOX-04 | manual | N/A — bottom sheet UI | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/db/detoxRepo.test.ts` — stubs for DTOX-01 (CRUD operations)
- [ ] `__tests__/domain/detox-engine.test.ts` — stubs for DTOX-02, DTOX-04 (XP calc, penalty, timer logic)
- [ ] `__tests__/stores/detoxStore.test.ts` — stubs for DTOX-01, DTOX-02, DTOX-03 (session lifecycle)

*Existing infrastructure covers streak-engine tests (already exists).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| HUD dungeon theme transformation | DTOX-05 | Visual Skia rendering | Start detox session, verify HUD changes to dungeon theme with stone walls and torches |
| Dungeon door icon animation | DTOX-05 | Visual animation | Verify door glows when tappable, animates on tap |
| Bottom sheet layout/UX | DTOX-01 | Interactive UI | Open dungeon sheet, verify chip buttons, toggle, start flow |
| Completion fanfare | DTOX-03 | Visual + animation | Complete session, verify full-screen celebration |
| Push notification on background completion | DTOX-02 | OS notification | Background app during active session, wait for timer to complete, verify notification fires |
| Timer persistence across app kill | DTOX-02 | App lifecycle | Start session, kill app, reopen, verify timer shows correct remaining time |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
