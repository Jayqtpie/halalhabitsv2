---
phase: 13
slug: dopamine-detox-dungeon
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-22
validated: 2026-03-23
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
| 13-01-01 | 01 | 1 | DTOX-01 | unit | `npx jest __tests__/db/detoxRepo.test.ts` | ✅ | ✅ green |
| 13-01-02 | 01 | 1 | DTOX-02,DTOX-04 | unit | `npx jest __tests__/domain/detox-engine.test.ts` | ✅ | ✅ green |
| 13-01-03 | 01 | 1 | DTOX-06 | unit | `npx jest __tests__/domain/detox-engine.test.ts` | ✅ | ✅ green |
| 13-02-01 | 02 | 2 | DTOX-01,DTOX-02,DTOX-03 | unit | `npx jest __tests__/stores/detoxStore.test.ts` | ✅ | ✅ green |
| 13-02-02 | 02 | 2 | Title (The Unplugged) | unit | `npx jest __tests__/domain/title-engine.test.ts` | ✅ | ✅ green |
| 13-02-03 | 02 | 2 | Privacy (LOCAL_ONLY) | unit | `npx jest __tests__/services/privacy-gate.test.ts` | ✅ | ✅ green |
| 13-03-01 | 03 | 3 | DTOX-05 | manual | N/A — HUD visual | N/A | ⬜ manual |
| 13-03-02 | 03 | 3 | DTOX-01,DTOX-04 | manual | N/A — bottom sheet UI | N/A | ⬜ manual |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky · ⬜ manual*

---

## Wave 0 Requirements

- [x] `__tests__/db/detoxRepo.test.ts` — DTOX-01 (CRUD operations) — 10 tests, all green
- [x] `__tests__/domain/detox-engine.test.ts` — DTOX-02, DTOX-04, DTOX-06 (XP calc, penalty, timer, streak protection) — 28 tests, all green
- [x] `__tests__/stores/detoxStore.test.ts` — DTOX-01, DTOX-02, DTOX-03 (session lifecycle, notifications) — 18 tests, all green

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

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated 2026-03-23

---

## Validation Audit 2026-03-23

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |
| Total automated tests | 103 (across 4 suites) |
| All green | Yes |

**Notes:** All Wave 0 test files were created during Phase 13 execution. All 6 DTOX requirements have automated coverage. DTOX-05 (visual) and UI layout behaviors remain manual-only (appropriate for Skia rendering and interactive UI).
