---
phase: 05-hud-visual-identity-and-muhasabah
plan: 01
status: complete
started: 2026-03-15
completed: 2026-03-15
---

## Summary

Installed @shopify/react-native-skia and expo-blur, created jest mocks for both, and built 4 pure-TypeScript domain/data modules: HUD environment selector, Muhasabah engine (timing + curated closing content), muhasabahRepo (PRIVATE CRUD), and muhasabahStore (Zustand flow state). All 34 new tests pass across 4 test files.

## Key Files

### Created
- `jest.setup.ts` — Skia and expo-blur jest mocks
- `src/domain/hud-environment.ts` — Level→environment mapping (4 zones)
- `src/domain/muhasabah-engine.ts` — isMuhasabahTime, CLOSING_CONTENT (7 vetted entries), getClosingContent
- `src/db/repos/muhasabahRepo.ts` — PRIVATE CRUD for muhasabah_entries
- `src/stores/muhasabahStore.ts` — Zustand store: open/close/submit flow, 12 XP award
- `__tests__/domain/hud-environment.test.ts` — 7 tests
- `__tests__/domain/muhasabah-engine.test.ts` — 9 tests
- `__tests__/stores/muhasabahStore.test.ts` — 11 tests
- `__tests__/db/muhasabahRepo.test.ts` — 7 tests

### Modified
- `jest.config.js` — Added setupFiles reference
- `package.json` / `package-lock.json` — New dependencies

## Decisions

- Used `require()` instead of `dynamic import()` for gameStore in muhasabahStore.submit() — jest doesn't support `--experimental-vm-modules` in this config
- CLOSING_CONTENT has 7 entries (exceeds minimum of 5) — all Arabic text + translation + source vetted
- Privacy invariant enforced: muhasabahRepo has zero references to assertSyncable in executable code

## Self-Check: PASSED

- [x] All must_have truths verified by tests
- [x] All must_have artifacts exist with correct exports
- [x] Key links verified (store→awardXP, repo→muhasabahEntries, engine→ishaWindow)
- [x] Full test suite: 311 tests pass
