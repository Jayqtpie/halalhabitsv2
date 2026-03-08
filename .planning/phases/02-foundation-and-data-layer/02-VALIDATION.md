---
phase: 2
slug: foundation-and-data-layer
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-08
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (bundled with Expo via jest-expo) + @testing-library/react-native |
| **Config file** | none — Wave 0 creates jest.config.js |
| **Quick run command** | `npx jest --testPathPattern=<file> --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=<relevant> --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-T1 | 01 | 1 | FOUN-01 | smoke | `npx expo export --platform web` | ❌ W0 | ⬜ pending |
| 02-01-T2 | 01 | 1 | FOUN-06 | unit | `npx jest --testPathPattern=tokens --no-coverage` | ❌ W0 | ⬜ pending |
| 02-01-T3 | 01 | 1 | FOUN-07 | unit | `npx jest --testPathPattern=i18n --no-coverage` | ❌ W0 | ⬜ pending |
| 02-02-T1 | 02 | 2 | FOUN-03 | unit | `npx jest --testPathPattern=database --no-coverage` | ❌ W0 | ⬜ pending |
| 02-02-T2 | 02 | 2 | FOUN-05 | unit | `npx jest --testPathPattern=privacy --no-coverage` | ❌ W0 | ⬜ pending |
| 02-03-T1 | 03 | 3 | FOUN-04 | unit | `npx jest --testPathPattern=stores --no-coverage` | ❌ W0 | ⬜ pending |
| 02-03-T2 | 03 | 3 | FOUN-02 | unit | `npx jest --testPathPattern=tabs --no-coverage` | ❌ W0 | ⬜ pending |
| 02-03-T3 | 03 | 3 | — | checkpoint | checkpoint:human-verify | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.js` — Jest configuration for Expo + TypeScript
- [ ] `__tests__/db/database.test.ts` — stubs for FOUN-03 (schema creation, migrations)
- [ ] `__tests__/services/privacy-gate.test.ts` — stubs for FOUN-05 (classification, blocking)
- [ ] `__tests__/stores/stores.test.ts` — stubs for FOUN-04 (store initialization)
- [ ] `__tests__/tokens/tokens.test.ts` — stubs for FOUN-06 (token completeness)
- [ ] `__tests__/i18n/i18n.test.ts` — stubs for FOUN-07 (initialization, key resolution)
- [ ] `npm install -D jest @testing-library/react-native @testing-library/jest-native jest-expo` — test framework install

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App builds via EAS Build | FOUN-01 | Requires cloud build + physical device | Run `eas build --platform android --profile development`, install on device, verify app launches |
| Tab navigation with smooth transitions | FOUN-02 | Visual/UX quality assessment | Navigate between all 4 tabs, verify transitions feel smooth and tab bar renders pixel styling |
| Font comparison spike | FOUN-06 | Design decision requires visual review | Open spike screen, compare pixel font vs modern font at multiple sizes |
| Dark/light mode spike | FOUN-06 | Design decision requires visual review | Toggle between dark and light mode on spike screen, compare jewel-tone rendering |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
