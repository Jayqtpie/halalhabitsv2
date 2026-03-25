---
phase: 15
slug: buddy-connection-system
status: draft
nyquist_compliant: true
wave_0_complete: true
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

## Wave 0 Approach

Plans 15-01, 15-02, and 15-03 use TDD-within-task (`type: tdd` or `tdd="true"`). Tests are written BEFORE implementation as part of the RED-GREEN-REFACTOR cycle within each task. This satisfies Wave 0 requirements without a separate stub-generation plan.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Wave 0 Satisfied By | Status |
|---------|------|------|-------------|-----------|-------------------|---------------------|--------|
| 15-01-01 | 01 | 1 | BUDY-01 | unit | `npm test -- --testPathPattern="buddy-engine" --no-coverage` | TDD in Plan 01 (RED phase creates test) | pending |
| 15-01-02 | 01 | 1 | BUDY-01 | unit | `npm test -- --testPathPattern="buddy-engine" --no-coverage` | TDD in Plan 01 (RED phase creates test) | pending |
| 15-02-01 | 02 | 1 | BUDY-02, BUDY-04, BUDY-05 | unit | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | TDD in Plan 02 Task 1 (test-first) | pending |
| 15-02-02 | 02 | 1 | BUDY-03 | unit | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | TDD in Plan 02 Task 1 (test-first) | pending |
| 15-02-03 | 02 | 1 | BUDY-06 | unit (privacy invariant) | `npm test -- --testPathPattern="buddyRepo" --no-coverage` | TDD in Plan 02 Task 1 (test-first) | pending |
| 15-02-04 | 02 | 1 | BUDY-07 | source scan | `grep -c "CREATE POLICY" supabase/migrations/20260325_buddy_rls_update.sql` | Plan 02 Task 2 creates migration SQL | pending |
| 15-03-01 | 03 | 2 | BUDY-04, BUDY-05 | unit | `npm test -- --testPathPattern="buddyStore" --no-coverage` | TDD in Plan 03 Task 1 (test-first) | pending |
| 15-04-01 | 04 | 3 | BUDY-05 | manual | Visual verification | N/A (UI checkpoint) | pending |
| 15-04-02 | 04 | 3 | BUDY-06 | manual | Visual verification | N/A (UI checkpoint) | pending |
| 15-05-01 | 05 | 3 | BUDY-04, BUDY-06 | source scan | `grep -c "CREATE POLICY" supabase/migrations/20260325_buddy_rls_update.sql && grep "select buddy profiles" supabase/migrations/20260325_buddy_rls_update.sql` | Plan 02 Task 2 creates RLS policies; verified by grep on migration SQL | pending |

*Status: pending / green / red / flaky*

---

## BUDY-07 RLS Verification Note

BUDY-07 (RLS policies) is verified via source scan of migration SQL files rather than runtime integration tests. Plan 02 Task 2 creates the RLS migration with policies for buddy profile reads (`"Users: select buddy profiles"`) and discoverable search (`"Users: search discoverable"`). Verification is grep-based on the SQL files to confirm policy names and conditions exist. Full runtime RLS testing requires a live Supabase instance and is deferred to integration/staging testing.

---

## D-04 Block Bypass Limitation (Phase 15)

Block enforcement is client-side SQLite only. A blocked user reinstalling the app (fresh device) could bypass the block until sync pulls the `blocked_by_*` status from Supabase. This is an accepted Phase 15 limitation. Mitigation: Supabase RLS INSERT policy on `buddies` table could add a server-side check (deferred to a future hardening phase).

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

- [x] All tasks have `<automated>` verify or TDD-within-task satisfying Wave 0
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covered by TDD approach in Plans 01, 02, 03
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
