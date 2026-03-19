---
phase: 05
slug: hud-visual-identity-and-muhasabah
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest-expo 54.0.17 |
| **Config file** | package.json jest section |
| **Quick run command** | `npm test -- --testPathPattern="muhasabah\|hud" --no-coverage` |
| **Full suite command** | `npm test -- --no-coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="muhasabah\|hud" --no-coverage`
- **After every plan wave:** Run `npm test -- --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | HUD-01 | unit | `npm test -- --testPathPattern="gameStore" --no-coverage` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | HUD-02 | unit (snapshot) | `npm test -- --testPathPattern="hud-scene" --no-coverage` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | HUD-03 | unit | `npm test -- --testPathPattern="HudStatBar" --no-coverage` | ❌ W0 | ⬜ pending |
| 05-01-04 | 01 | 1 | HUD-04 | unit (mock) | `npm test -- --testPathPattern="haptics" --no-coverage` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | MUHA-01 | unit | `npm test -- --testPathPattern="muhasabah-engine" --no-coverage` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | MUHA-02 | unit | `npm test -- --testPathPattern="muhasabahStore" --no-coverage` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 2 | MUHA-03 | unit (privacy gate) | `npm test -- --testPathPattern="muhasabahRepo" --no-coverage` | ❌ W0 | ⬜ pending |
| 05-02-04 | 02 | 2 | MUHA-04 | unit | `npm test -- --testPathPattern="muhasabahStore" --no-coverage` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/domain/hud-environment.test.ts` — covers HUD-02 (pixel art sampling, environment thresholds)
- [ ] `__tests__/domain/muhasabah-engine.test.ts` — covers MUHA-01 (isMuhasabahTime, getClosingContent)
- [ ] `__tests__/stores/muhasabahStore.test.ts` — covers MUHA-02, MUHA-04
- [ ] `__tests__/db/muhasabahRepo.test.ts` — covers MUHA-03 (privacy gate assertion)
- [ ] `@shopify/react-native-skia` mock in jest setup — required for any component tests using Canvas/Image

*Existing infrastructure covers HUD-01 (gameStore tests exist).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| HUD scene renders pixel art at correct scale on device | HUD-02 | Visual verification needed | Open Home tab, verify pixel art is crisp (no blurring), check FilterQuality.None applied |
| 60fps animation performance | HUD-03 | Performance testing | Toggle XP gain, observe smooth animation via Perf Monitor overlay |
| Haptic feedback feels correct | HUD-04 | Physical sensation | Complete habit, verify haptic fires with appropriate intensity |
| Muhasabah reflection UX flow | MUHA-01 | UX flow verification | After Isha, verify prompt appears, complete in <60s, verify skip has no penalty |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
