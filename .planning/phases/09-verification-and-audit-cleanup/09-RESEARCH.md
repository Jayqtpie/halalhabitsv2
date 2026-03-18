# Phase 9: Verification and Audit Cleanup - Research

**Researched:** 2026-03-18
**Domain:** Documentation audit, verification paper trail, requirements traceability
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Unsatisfied requirement handling:**
- FOUN-01 (EAS Build): Mark PARTIAL with caveat — "Expo scaffold complete, EAS Build deferred — using Expo Go for development"
- FOUN-02 (tab navigation), FOUN-04 (Zustand stores): Mark SATISFIED — implemented since Phase 2, checkbox oversight
- PRAY-01..04 (prayer times, calc method, time windows, notifications): Mark SATISFIED — code complete in Phase 03/06, never tracked
- Orphaned requirements (PRAY-01..04): Credit to Phase 03 retroactively in traceability table

**Verification depth:**
- Full re-test: run test suites and use passing tests as evidence for each requirement
- Include HUMAN NEEDED items for things that require device verification (visual rendering, navigation smoothness, prayer time display)
- Document-only approach for failures: if a test fails, mark it FAILED with evidence — do NOT fix it in Phase 9
- One VERIFICATION.md per phase: `02-VERIFICATION.md` in Phase 02 directory, `03-VERIFICATION.md` in Phase 03 directory

**Checkbox reconciliation:**
- Single atomic sweep after both VERIFICATION.md files are written
- Update all REQUIREMENTS.md checkboxes to match actual implementation status
- Update traceability table statuses from 'Partial'/'Unsatisfied'/'Orphaned' to actual verified status
- ROADMAP.md: check all completed phases inline (fix Phase 5 `[ ]` → `[x]` and any others)
- BLUE-01..11: Check all in the sweep — Phase 1 verified complete via 01-VERIFICATION.md

### Claude's Discretion
- Observable Truths table structure and grouping within each VERIFICATION.md
- Which specific tests to cite as evidence per requirement
- Ordering of the atomic sweep operations
- Human verification item wording and expected-result descriptions

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | Expo project scaffold with development builds (not Expo Go) and EAS Build pipeline | eas.json created in 02-01; scaffold complete; EAS Build not yet executed — mark PARTIAL |
| FOUN-02 | Expo Router navigation structure with tab-based layout | Implemented in 02-03; CustomTabBar, 4 tabs; mark SATISFIED |
| FOUN-03 | SQLite database schema with migrations for all entities | Implemented in 02-02; 13-entity Drizzle schema + 2 migrations; already checked |
| FOUN-04 | Zustand state management with domain-split stores | Implemented in 02-03; 4 stores (habit, game, ui, settings); mark SATISFIED |
| FOUN-05 | Privacy Gate module | Implemented in 02-02; 40 tests; already checked |
| FOUN-06 | Design token system | Implemented in 02-01; 20 token tests; already checked |
| FOUN-07 | i18n infrastructure (i18next) | Implemented in 02-01; 9 i18n tests; already checked |
| HBIT-01 | User can create habits from preset Islamic library | Implemented in 03-05; PresetLibrary with 15 presets; mark SATISFIED |
| HBIT-02 | User can create custom habits with name, frequency, time window | Implemented in 03-05; CustomHabitForm; mark SATISFIED |
| HBIT-05 | User can edit or archive habits | Implemented in 03-05; EditHabitSheet via long-press; mark SATISFIED |
| PRAY-01 | App calculates prayer times locally using adhan library | Implemented in 03-01; prayer-times.ts with adhan-js; mark SATISFIED |
| PRAY-02 | User can select calculation method | Implemented in 03-06; CalcMethodPicker with 6+ methods; mark SATISFIED |
| PRAY-03 | Salah habits display contextual time windows | Implemented in 03-06; PrayerTimeWindow component on HabitCard; mark SATISFIED |
| PRAY-04 | Prayer time notifications | Implemented in 06-01/06-04; deferred from Phase 03 with TODO comment; mark SATISFIED |
</phase_requirements>

---

## Summary

Phase 9 is a pure documentation and audit reconciliation phase. No new code is written. The goal is to close the verification paper trail that was skipped during the rapid build of Phases 02 and 03 — both phases completed without VERIFICATION.md files. Additionally, REQUIREMENTS.md has stale checkboxes (FOUN-02, FOUN-04, PRAY-01..04 are unchecked despite being fully implemented) and the ROADMAP.md has Phase 5 incorrectly showing `[ ]` instead of `[x]`.

The work breaks into two clearly ordered parts: (1) write the two missing VERIFICATION.md files using the existing established format from Phases 04 and 08 as reference, and (2) execute a single atomic sweep of REQUIREMENTS.md and ROADMAP.md to reconcile all stale checkboxes. Evidence for the verification files comes primarily from SUMMARY.md execution records and the project's existing test suite.

**Primary recommendation:** Follow the Phase 04 VERIFICATION.md format exactly — frontmatter, Observable Truths table with VERIFIED/HUMAN NEEDED/FAILED status, Required Artifacts section, Requirements Coverage table, and Human Verification section. Run the full test suite before writing to confirm current pass/fail status of all relevant tests.

---

## Established Verification Format

This phase follows existing patterns from Phases 04 and 08. There is nothing to research externally. All needed patterns are in the codebase already.

### Frontmatter Schema

```yaml
---
phase: {phase-slug}
verified: {ISO 8601 timestamp}
status: passed | human_needed | failed
score: {N}/{M} must-haves verified
re_verification: false
human_verification:          # only if status is human_needed
  - test: "{device test description}"
    expected: "{observable outcome}"
    why_human: "{why automated verification is insufficient}"
---
```

**Status rules:**
- `passed` — all truths are VERIFIED (no HUMAN NEEDED, no FAILED)
- `human_needed` — all automated truths pass, but some require device verification
- `failed` — one or more truths are FAILED

### Observable Truths Table

```markdown
| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | {claim} | VERIFIED | {file, line, test count} |
| 2 | {claim} | HUMAN NEEDED | {file exists + why device needed} |
| 3 | {claim} | FAILED | {what was checked, what failed} |
```

**Evidence pattern (from Phase 04):** Cite the specific file, export name, line number, or test count. "56 tests passing" is evidence. "src/services/prayer-times.ts exports getPrayerWindows" is evidence. "component exists" alone is not sufficient.

### Required Artifacts Section

Table-per-plan structure showing each artifact with Status (VERIFIED/FAILED) and Details.

### Requirements Coverage Section

```markdown
| Requirement | Plans | Description | Status | Evidence |
|-------------|-------|-------------|--------|----------|
```

### Human Verification Section

Full prose description per item: Test, Expected, Why human. Match the Phase 04 format exactly.

---

## Phase 02 Verification Analysis

### Requirements in Scope

| Req | Status in REQUIREMENTS.md | Actual Status | Source Evidence |
|-----|--------------------------|---------------|-----------------|
| FOUN-01 | [x] checked | PARTIAL | eas.json created (02-01 SUMMARY), EAS Build never executed (STATE.md blockers) |
| FOUN-02 | [ ] unchecked | SATISFIED | 4 tab screens + CustomTabBar created in 02-03-SUMMARY.md |
| FOUN-03 | [x] checked | SATISFIED | 13-entity schema + 0000_dark_mandrill.sql in 02-02-SUMMARY.md, 15 schema tests |
| FOUN-04 | [ ] unchecked | SATISFIED | 4 Zustand stores created in 02-03-SUMMARY.md |
| FOUN-05 | [x] checked | SATISFIED | privacy-gate.ts with 40 tests in 02-02-SUMMARY.md |
| FOUN-06 | [x] checked | SATISFIED | Complete token system with 20 tests in 02-01-SUMMARY.md |
| FOUN-07 | [x] checked | SATISFIED | i18next config with 9 tests in 02-01-SUMMARY.md |

### Plan Evidence Available

**02-01 (Expo scaffold, tokens, i18n):**
- Tests: `__tests__/tokens/tokens.test.ts` (20 tests), `__tests__/i18n/i18n.test.ts` (9 tests)
- Key files: src/tokens/*.ts, src/i18n/config.ts, eas.json, app/_layout.tsx
- Commits: 278b60a, f39540c, 2733c0f, 4fc1eba, 2e8c411

**02-02 (SQLite, repos, Privacy Gate):**
- Tests: `__tests__/db/database.test.ts` (15 tests), `__tests__/services/privacy-gate.test.ts` (40 tests)
- Key files: src/db/schema.ts, src/db/client.ts, src/db/migrations/0000_dark_mandrill.sql, src/db/repos/*.ts, src/services/privacy-gate.ts
- Commits: d0017fa, 1c3e68c

**02-03 (Zustand stores, tab navigation):**
- Tests: `__tests__/stores/stores.test.ts` (96 tests total at time of completion)
- Key files: src/stores/habitStore.ts, gameStore.ts, uiStore.ts, settingsStore.ts, src/components/ui/CustomTabBar.tsx, app/(tabs)/_layout.tsx
- Commits: multiple across 2 sessions

### FOUN-01 Caveat (PARTIAL)

FOUN-01 requires "development builds (not Expo Go) and EAS Build pipeline." Research confirms:
- eas.json was created with development/preview/production profiles (VERIFIED)
- SDK was set to 54 for Expo Go compatibility (STATE.md decision: "SDK 54 for Expo Go compatibility on iPhone")
- STATE.md Blockers section explicitly states: "Success criterion 'app builds via EAS Build (not Expo Go)' not yet met — using Expo Go on SDK 54"
- Mark PARTIAL with caveat in VERIFICATION.md — honest documentation is the requirement here

### Human Verification Items for Phase 02

These aspects of Phase 02 cannot be verified programmatically:
1. App actually runs on a physical device (navigation smoothness, font rendering)
2. Design tokens render 16-bit aesthetic (colors visually correct on device screen)
3. Tab navigation transitions are smooth (custom pixel tab bar renders correctly)
4. SQLite data persists across app restarts (requires device kill/relaunch cycle)
5. Privacy Gate blocks private data (integration with sync queue — not fully testable until Phase 7 wired)

---

## Phase 03 Verification Analysis

### Requirements in Scope

| Req | Status in REQUIREMENTS.md | Actual Status | Source Evidence |
|-----|--------------------------|---------------|-----------------|
| HBIT-01 | [x] checked | SATISFIED | PresetLibrary (15 presets) in 03-05-SUMMARY.md |
| HBIT-02 | [x] checked | SATISFIED | CustomHabitForm in 03-05-SUMMARY.md |
| HBIT-03 | [x] checked | SATISFIED | completionRepo.create + habitStore.completeHabit in 03-03-SUMMARY.md |
| HBIT-04 | [x] checked | SATISFIED | HabitList + habits.tsx in 03-04-SUMMARY.md |
| HBIT-05 | [x] checked | SATISFIED | EditHabitSheet + archive in 03-05-SUMMARY.md |
| HBIT-06 | [x] checked | SATISFIED | HabitCalendar in 03-06-SUMMARY.md |
| PRAY-01 | [ ] unchecked | SATISFIED | prayer-times.ts with adhan-js in 03-01-SUMMARY.md |
| PRAY-02 | [ ] unchecked | SATISFIED | CalcMethodPicker (6+ methods) in 03-06-SUMMARY.md |
| PRAY-03 | [ ] unchecked | SATISFIED | PrayerTimeWindow component on HabitCard in 03-06-SUMMARY.md |
| PRAY-04 | [ ] unchecked | SATISFIED | Implemented in Phase 06 (06-01/06-04 NOTIFICATIONs); 03-06 has TODO comment deferring to Phase 6 |
| STRK-01 | [x] checked | SATISFIED | streakRepo + habitStore in 03-03; HabitCard streak display in 03-04 |
| STRK-02 | [x] checked | SATISFIED | Streak Shield in 03-06; PrayerTimeWindow + HabitCard indicator |
| STRK-03 | [x] checked | SATISFIED | MercyModeBanner with compassionate copy in 03-06-SUMMARY.md |
| STRK-04 | [x] checked | SATISFIED | MercyModeRecoveryTracker (3-step) in 03-06-SUMMARY.md |
| STRK-05 | [x] checked | SATISFIED | HabitCard streak display frames as "momentum" (adab-safe copy) |

### Plan Evidence Available

**03-01 (Domain types, prayer times, presets, sorter):**
- Tests: `__tests__/services/prayer-times.test.ts` (10 tests), `__tests__/domain/presets.test.ts` (14 tests), `__tests__/domain/habit-sorter.test.ts` (6 tests)
- Key files: src/types/habits.ts, src/services/prayer-times.ts, src/services/location.ts, src/domain/presets.ts, src/domain/habit-sorter.ts

**03-02 (Streak engine):**
- Tests: `__tests__/domain/streak-engine.test.ts` (23 tests)
- Key files: src/domain/streak-engine.ts

**03-03 (Data wiring, repos, habitStore):**
- Tests: `__tests__/db/completionRepo.test.ts` (7 tests)
- Key files: src/db/repos/completionRepo.ts, src/db/repos/streakRepo.ts, src/db/migrations/0001_mercy_mode.sql, src/stores/habitStore.ts

**03-04 (Daily habit list screen):**
- No dedicated tests (UI components)
- Key files: src/components/habits/HabitCard.tsx, DailyProgressBar.tsx, HabitList.tsx, app/(tabs)/habits.tsx

**03-05 (Habit creation & management):**
- No dedicated tests (UI components)
- Key files: src/components/habits/PresetLibrary.tsx, CustomHabitForm.tsx, EditHabitSheet.tsx, app/add-habit.tsx

**03-06 (Prayer, Mercy Mode, calendar):**
- No dedicated tests (UI components)
- Key files: src/components/prayer/PrayerTimeWindow.tsx, CalcMethodPicker.tsx, src/components/habits/MercyModeBanner.tsx, MercyModeRecoveryTracker.tsx, src/components/calendar/HabitCalendar.tsx

### PRAY-04 Attribution Note

PRAY-04 (prayer time notifications) was deferred from Phase 03 with an explicit TODO comment in 03-06. It was fully implemented in Phase 06 (06-01 NotificationService + 06-04 notification lifecycle wiring). The traceability table should credit Phase 03 AND Phase 06 retroactively. In the 03-VERIFICATION.md, mark PRAY-04 as SATISFIED with a note that implementation completed in Phase 06.

### Human Verification Items for Phase 03

These aspects require device verification:
1. Salah habits show prayer time windows on HabitCard (PrayerTimeWindow badge renders correctly)
2. Single-tap habit completion triggers animation + haptic (Reanimated scale pulse, emerald border glow)
3. CalcMethodPicker opens as modal, selection persists (visual rendering, modal dismiss)
4. Mercy Mode banner appears with compassionate copy after streak break (no shame language)
5. HabitCalendar monthly view shows completion history correctly
6. 4-group habit sort order correct on screen (uncompleted salah first, completed last)

---

## REQUIREMENTS.md Checkbox Sweep Analysis

### Stale Checkboxes — Changes Required

**Currently unchecked but should be checked:**
- `[ ] BLUE-01` through `[ ] BLUE-11` — Phase 1 verified complete via 01-VERIFICATION.md; all 16 BLUE requirements should be `[x]`
- `[ ] FOUN-02` → `[x]` SATISFIED (tab navigation implemented 02-03)
- `[ ] FOUN-04` → `[x]` SATISFIED (Zustand stores implemented 02-03)
- `[ ] PRAY-01` → `[x]` SATISFIED (adhan-js service implemented 03-01)
- `[ ] PRAY-02` → `[x]` SATISFIED (CalcMethodPicker implemented 03-06)
- `[ ] PRAY-03` → `[x]` SATISFIED (PrayerTimeWindow on HabitCard implemented 03-06)
- `[ ] PRAY-04` → `[x]` SATISFIED (NotificationService implemented Phase 06)

**Already correct — do not change:**
- FOUN-01 stays `[x]` (partial is still checked; PARTIAL caveat goes in VERIFICATION.md)
- FOUN-03, FOUN-05, FOUN-06, FOUN-07 — already `[x]`, correct
- All HBIT, STRK — already `[x]`, correct

**ROADMAP.md Phase 5 fix:**
- `[ ] Phase 5: HUD, Visual Identity, and Muhasabah` → `[x]` (completed 2026-03-16 per STATE.md)
- ROADMAP.md plan-level checkboxes inside Phase 5 block also need updating to `[x]`
- Phase 8 progress table: currently "1/2 In Progress" — after Phase 8 is complete should be "2/2 Complete"
- Phase 9 progress table: "0/? Not Started" → update once Phase 9 completes

### Traceability Table Updates

| Current Status | Requirement | New Status |
|---------------|-------------|------------|
| Partial (code complete, verification pending) | FOUN-01..07 | FOUN-01: Partial (EAS deferred); FOUN-02..07: Complete (02-VERIFICATION) |
| Unsatisfied (code exists, no verification trail) | HBIT-01, HBIT-02, HBIT-05 | Complete (03-VERIFICATION) |
| Partial (listed in SUMMARYs, no VERIFICATION) | HBIT-03, HBIT-04, HBIT-06 | Complete (03-VERIFICATION) |
| Orphaned (code exists, never tracked) | PRAY-01..04 | Complete (03-VERIFICATION, Phase 06 for PRAY-04) |
| Partial (listed in SUMMARYs, no VERIFICATION) | STRK-01..05 | Complete (03-VERIFICATION) |

---

## Work Decomposition for Planner

Phase 9 has exactly 3 units of work, sequenced strictly:

### Unit 1: Write 02-VERIFICATION.md
- Location: `.planning/phases/02-foundation-and-data-layer/02-VERIFICATION.md`
- Run tests first: `npx jest --testPathPattern="tokens|i18n|database|privacy-gate|stores" --no-coverage`
- Use passing test counts as evidence in Observable Truths
- Cover FOUN-01 (PARTIAL) through FOUN-07 (SATISFIED)
- Expect status: `human_needed` (visual rendering, device persistence require human)

### Unit 2: Write 03-VERIFICATION.md
- Location: `.planning/phases/03-core-habit-loop/03-VERIFICATION.md`
- Run tests first: `npx jest --testPathPattern="prayer-times|presets|habit-sorter|streak-engine|completionRepo" --no-coverage`
- Cover HBIT-01..06, PRAY-01..04, STRK-01..05
- Expect status: `human_needed` (UI components cannot be automated)

### Unit 3: Atomic Sweep (REQUIREMENTS.md + ROADMAP.md)
- Execute AFTER both VERIFICATION.md files are written and confirmed
- 7 checkbox changes in REQUIREMENTS.md (BLUE-01..11 + FOUN-02, FOUN-04, PRAY-01..04)
- Traceability table: update 5 row statuses
- ROADMAP.md: fix Phase 5 checkboxes, fix progress table rows for Phases 5, 8, 9

---

## Test Infrastructure Confirmed

The project has a Jest setup (jest-expo preset, jest.config.js) with these test suites relevant to Phases 02 and 03:

| Test File | Tests | Relevance |
|-----------|-------|-----------|
| `__tests__/tokens/tokens.test.ts` | 20 | FOUN-06 evidence |
| `__tests__/i18n/i18n.test.ts` | 9 | FOUN-07 evidence |
| `__tests__/db/database.test.ts` | 15+ | FOUN-03 evidence |
| `__tests__/services/privacy-gate.test.ts` | 40 | FOUN-05 evidence |
| `__tests__/stores/stores.test.ts` | varies | FOUN-04 evidence |
| `__tests__/services/prayer-times.test.ts` | 10 | PRAY-01 evidence |
| `__tests__/domain/presets.test.ts` | 14 | HBIT-01 evidence |
| `__tests__/domain/habit-sorter.test.ts` | 6 | HBIT-04 (sort), STRK-01 display |
| `__tests__/domain/streak-engine.test.ts` | 23 | STRK-01..04 evidence |
| `__tests__/db/completionRepo.test.ts` | 7 | HBIT-03 evidence |

**Quick run command:** `npx jest --no-coverage 2>&1 | tail -20`
**Targeted run:** `npx jest --testPathPattern="tokens|i18n|database|privacy-gate|stores|prayer-times|presets|habit-sorter|streak-engine|completionRepo" --no-coverage`

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | jest-expo (jest 29) |
| Config file | `jest.config.js` |
| Quick run command | `npx jest --no-coverage 2>&1 \| tail -20` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-01 | eas.json exists with correct profiles | file-check | `ls eas.json` | ✅ |
| FOUN-02 | Tab navigation structure exists | file-check | `ls app/\(tabs\)/` | ✅ |
| FOUN-03 | SQLite schema has all 13 entities | unit | `npx jest __tests__/db/database.test.ts` | ✅ |
| FOUN-04 | 4 Zustand stores with correct shape | unit | `npx jest __tests__/stores/stores.test.ts` | ✅ |
| FOUN-05 | Privacy Gate correctly classifies data | unit | `npx jest __tests__/services/privacy-gate.test.ts` | ✅ |
| FOUN-06 | Design tokens export correct values | unit | `npx jest __tests__/tokens/tokens.test.ts` | ✅ |
| FOUN-07 | i18n initializes and translates | unit | `npx jest __tests__/i18n/i18n.test.ts` | ✅ |
| HBIT-01 | 15 Islamic presets across 6 categories | unit | `npx jest __tests__/domain/presets.test.ts` | ✅ |
| HBIT-02 | Custom habit creation form exists | manual | N/A — UI component, device-only | N/A |
| HBIT-05 | Edit/archive sheet exists | manual | N/A — UI component, device-only | N/A |
| PRAY-01 | adhan-js calculates prayer windows | unit | `npx jest __tests__/services/prayer-times.test.ts` | ✅ |
| PRAY-02 | CalcMethodPicker UI exists | manual | N/A — UI component, device-only | N/A |
| PRAY-03 | PrayerTimeWindow displays on HabitCard | manual | N/A — UI component, device-only | N/A |
| PRAY-04 | Notification scheduling for prayer times | unit | `npx jest __tests__/services/notification-service.test.ts` | ✅ |

### Sampling Rate
- **Per task commit:** `npx jest --no-coverage 2>&1 | tail -20`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements. Phase 9 creates no new code so no new tests are needed. The existing test suite is run as evidence collection, not extended.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| VERIFICATION.md format | Custom format | Exact Phase 04 and 08 format | Consistency is what makes audit work; diverging formats fail audit |
| Requirement status determination | Infer from code | Read SUMMARY.md facts | SUMMARYs are committed evidence, not interpretation |
| Checkbox sweep order | Arbitrary | VERIFICATION.md first, sweep second | Sweep must cite VERIFICATION.md as evidence source |

---

## Common Pitfalls

### Pitfall 1: Marking PRAY-04 as Phase 03 only
**What goes wrong:** PRAY-04 was deferred from Phase 03 with a TODO comment. Crediting it only to Phase 03 in the traceability table misrepresents implementation.
**How to avoid:** In 03-VERIFICATION.md, note "implemented in Phase 06 (06-01/06-04)" for PRAY-04. In traceability table, list Phase 03 + Phase 06 for PRAY-04.

### Pitfall 2: Marking FOUN-01 as SATISFIED
**What goes wrong:** eas.json exists and the scaffold works, but EAS Build has never actually been run on a device. The requirement specifically says "not Expo Go."
**How to avoid:** Mark PARTIAL with explicit caveat. STATE.md confirms the blocker exists. Honest documentation is more valuable than false satisfaction.

### Pitfall 3: Sweeping checkboxes before VERIFICATION.md files exist
**What goes wrong:** The checkpoint sweep changes REQUIREMENTS.md to reference verification that hasn't been written yet. Creates inconsistency.
**How to avoid:** Strict sequencing: 02-VERIFICATION.md → 03-VERIFICATION.md → atomic sweep. Never reorder.

### Pitfall 4: ROADMAP.md plan-level checkboxes out of sync
**What goes wrong:** Phase 5 shows `[ ]` at phase level AND at plan level. Both need fixing. Similarly, Phase 4's plan checkboxes appear unchecked in ROADMAP.md.
**How to avoid:** When sweeping ROADMAP.md, check both the phase-level checkbox AND all plan-level checkboxes within the Phase details section. Phases 1-8 (after Phase 8 completes) should all have `[x]` at every level.

### Pitfall 5: Running tests without checking for regressions
**What goes wrong:** Citing test evidence without actually running tests first. If a test is currently failing (due to changes in Phases 7-8), citing it as passing is false evidence.
**How to avoid:** Run the test suite first, note actual current counts. If a test fails, report FAILED with actual output. Do not fix failures — document them.

---

## Sources

### Primary (HIGH confidence)
- `.planning/phases/02-foundation-and-data-layer/02-01-SUMMARY.md` — FOUN-01, FOUN-06, FOUN-07 implementation evidence
- `.planning/phases/02-foundation-and-data-layer/02-02-SUMMARY.md` — FOUN-03, FOUN-05 implementation evidence
- `.planning/phases/02-foundation-and-data-layer/02-03-SUMMARY.md` — FOUN-02, FOUN-04 implementation evidence
- `.planning/phases/03-core-habit-loop/03-01-SUMMARY.md` — PRAY-01, HBIT-01 (presets) evidence
- `.planning/phases/03-core-habit-loop/03-02-SUMMARY.md` — STRK-01..04 (streak engine) evidence
- `.planning/phases/03-core-habit-loop/03-03-SUMMARY.md` — HBIT-03, HBIT-06, STRK-01..04 data layer evidence
- `.planning/phases/03-core-habit-loop/03-04-SUMMARY.md` — HBIT-03, HBIT-04, STRK-01, STRK-05 evidence
- `.planning/phases/03-core-habit-loop/03-05-SUMMARY.md` — HBIT-01, HBIT-02, HBIT-05 evidence
- `.planning/phases/03-core-habit-loop/03-06-SUMMARY.md` — PRAY-02, PRAY-03, STRK-02, STRK-03, STRK-04 evidence + PRAY-04 deferral note
- `.planning/phases/04-game-engine-and-progression/04-VERIFICATION.md` — Reference format for VERIFICATION.md
- `.planning/phases/08-critical-integration-wiring/08-VERIFICATION.md` — Simplest reference format
- `.planning/STATE.md` — FOUN-01 partial status confirmed (EAS Build blocker documented)
- `.planning/REQUIREMENTS.md` — Current checkbox state and traceability table
- `.planning/ROADMAP.md` — Phase completion state and inline checkbox discrepancies

---

## Metadata

**Confidence breakdown:**
- What needs to be written: HIGH — clearly defined by CONTEXT.md and existing formats
- Current implementation status per requirement: HIGH — SUMMARY.md files are committed execution records
- Which checkboxes are stale: HIGH — direct comparison of REQUIREMENTS.md vs SUMMARY.md facts
- Test counts and pass/fail: MEDIUM — known from SUMMARY.md but must be re-run to confirm no regressions from Phases 7-8

**Research date:** 2026-03-18
**Valid until:** Indefinite — this is a one-time audit, not an ongoing research area
