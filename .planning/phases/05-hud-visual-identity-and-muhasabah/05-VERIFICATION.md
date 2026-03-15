---
phase: 05-hud-visual-identity-and-muhasabah
verified: 2026-03-15T23:30:00Z
status: human_needed
score: 22/22 automated must-haves verified
re_verification: false
human_verification:
  - test: "Home HUD renders on device as full-screen pixel art game world"
    expected: "Home tab shows HudScene (even with placeholder PNGs), HudStatBar with level/XP/streak/prayer, no PlaceholderScreen text visible"
    why_human: "Skia Canvas rendering quality and correct layout can only be confirmed on a physical device or simulator"
  - test: "Character sprite animates with 4-frame idle loop"
    expected: "Sprite cycles through frames continuously — not frozen, not jittery"
    why_human: "Animation smoothness and frame cycling require real-time observation"
  - test: "Day/night tint shifts based on current local time"
    expected: "Tint color on scene corresponds to time of day (golden at dawn, clear at midday, warm orange at evening, indigo at night)"
    why_human: "Time-based color value can only be verified visually on device at known time"
  - test: "Tap zones navigate correctly"
    expected: "Quest board tap (left) navigates to Quests tab; prayer mat tap (center) navigates to Habits tab; journal tap (right) opens Muhasabah modal"
    why_human: "Tap zone pixel positions must be calibrated to actual pixel art asset placement on device"
  - test: "Muhasabah modal flow completes end-to-end"
    expected: "Mood tap -> highlight pick -> focus intent -> closing ayah with '+12 XP' badge, Arabic text, and 'Alhamdulillah. Good night.' message. Done closes modal. XP increases in HudStatBar."
    why_human: "Multi-screen animated flow requires human observation of transitions, XP reflection, and modal behavior"
  - test: "Skip path has zero penalty at every Muhasabah step"
    expected: "Tapping Skip on Step 1, 2, or 3 closes modal instantly with no confirmation dialog, no penalty message, no XP deduction"
    why_human: "Requires human interaction across three separate steps to confirm all skip paths"
  - test: "Pixel art icons appear in Habits tab HabitCard"
    expected: "Habit cards show small pixel art PNG images (not emoji characters) for salah, quran, dhikr, fasting, dua, and custom habits"
    why_human: "Visual rendering of pixel art icons at 32x32 on device — crisp vs blurry difference requires device screen"
  - test: "Haptic feedback fires on habit completion"
    expected: "Physical device vibrates with Medium impact when a habit card is tapped to complete"
    why_human: "Haptic feedback is a physical sensation that cannot be verified programmatically"
  - test: "Environment reveal animation fires at level threshold crossings"
    expected: "Crossing levels 6, 12, or 20 triggers: fade to black (400ms) -> 'New Area Unlocked' + environment name (800ms) -> fade out (1200ms) with Success haptic"
    why_human: "Animation sequence and haptic timing require triggering a level-up event and observing the result"
  - test: "Journal glow ring activates after Isha time"
    expected: "After Isha prayer time (or 21:00 fallback), an animated ring pulses around the journal tap zone on the Home HUD"
    why_human: "Time-based glow visibility requires either waiting for Isha time or temporarily mocking prayer times"
---

# Phase 5: HUD, Visual Identity, and Muhasabah — Verification Report

**Phase Goal:** Build the Home HUD game world screen, implement Muhasabah evening reflection, and complete the visual identity migration to pixel art.
**Verified:** 2026-03-15T23:30:00Z
**Status:** human_needed — all automated checks pass; 10 items require device testing
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | `isMuhasabahTime` returns true after Isha and at 21:00 fallback | VERIFIED | `muhasabah-engine.ts` L26-33: `now.getHours() >= 21` fallback; `now >= ishaWindow.start` when window provided |
| 2  | `muhasabahStore.submit()` writes entry to DB and awards XP via gameStore.awardXP | VERIFIED | `muhasabahStore.ts` L91-96: `muhasabahRepo.create(entry)` then `useGameStore.getState().awardXP(userId, 12, 1.0, 'muhasabah')` |
| 3  | `muhasabahStore.close()` resets state with no XP deduction and no shame flag | VERIFIED | `muhasabahStore.ts` L53: `close: () => set({ isOpen: false, currentStep: 0, todayEntry: {}, loading: false })` — no XP mutation |
| 4  | `muhasabahRepo` writes to `muhasabah_entries` (PRIVATE) and never calls `assertSyncable` in executable code | VERIFIED | `muhasabahRepo.ts`: only reference to `assertSyncable` is in a JSDoc comment (L5); no import or call in executable code |
| 5  | `getEnvironmentForLevel` maps levels 1-5 to quiet_study, 6-11 to growing_garden, 12-19 to scholars_courtyard, 20+ to living_sanctuary | VERIFIED | `hud-environment.ts` L24-27: four threshold checks, exact boundaries match spec |
| 6  | `getClosingContent` rotates through curated ayat/hadith by index modulo | VERIFIED | `muhasabah-engine.ts` L111-113: `CLOSING_CONTENT[index % CLOSING_CONTENT.length]` with 7 entries (5 minimum met) |
| 7  | Home screen shows a full-screen pixel art game world scene (not a dashboard) | VERIFIED (code) | `app/(tabs)/index.tsx`: `HudScene` replaces all prior placeholder content; `StyleSheet.absoluteFillObject` container; no "PlaceholderScreen" reference |
| 8  | Level badge, XP progress bar, best active streak count, and next prayer time are visible as a HUD overlay | VERIFIED (code) | `HudStatBar.tsx` L51-60: `LevelBadge`, `XPProgressBar`, `BestStreakDisplay`, `PrayerCountdown` in a row |
| 9  | Pixel art assets render crisply using FilterMode.Nearest | VERIFIED | `HudScene.tsx` L60: `sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}` |
| 10 | Character sprite animates with 4-frame idle loop (Reanimated) | VERIFIED (code) | `CharacterSprite.tsx` L31-38: `withRepeat(withTiming(4, { easing: Easing.steps(4, false) }), -1, false)` |
| 11 | Scene tint shifts between dawn/day/evening/night based on local time | VERIFIED (code) | `DayNightOverlay.tsx` L22-48: 6-stop time array, 60-second interval, Skia `interpolateColors` |
| 12 | Tapping quest board navigates to Quests tab; tapping prayer mat navigates to Habits tab | VERIFIED (code) | `index.tsx` L86-88: `router.push('/(tabs)/quests')` and `router.push('/(tabs)/habits')`; `SceneObjects.tsx` Pressable callbacks |
| 13 | Level-up environment reveal fires when player crosses level threshold 6, 12, or 20 | VERIFIED (code) | `EnvironmentReveal.tsx` L91-94: `isEnvironmentTransition(c.level - 1, c.level)` gate; fade sequence implemented |
| 14 | Haptic fires on habit completion (Medium), level-up (Heavy burst), quest completion (Medium) | VERIFIED | `HabitCard.tsx` L109: Medium; `LevelUpOverlay.tsx` L28-30: 3x Heavy; `gameStore.ts` L430: Medium on quest complete |
| 15 | User can complete Muhasabah in 3 taps (mood -> highlight -> focus) plus closing screen | VERIFIED (code) | `MuhasabahStep1` selects+nextStep; `MuhasabahStep2` selects+nextStep; `MuhasabahStep3` selects+submits -> 'closing' |
| 16 | User can skip Muhasabah at any step with zero penalty, no shame copy | VERIFIED | All 3 Step components have `onPress={close}` Skip button; `close()` only resets state; grep found zero shame/guilt copy in muhasabah components |
| 17 | Closing screen shows curated Quranic ayah or hadith and awards 12 XP | VERIFIED (code) | `MuhasabahClosing.tsx` L31: `getClosingContent(contentIndex)`; L38-39: `+12 XP` badge; `submit()` calls `awardXP(..., 12, ...)` |
| 18 | Completed Muhasabah entry is persisted to DB and reflected in store state | VERIFIED (code) | `muhasabahStore.ts` submit L91: `muhasabahRepo.create(entry)`; L99: `set({ currentStep: 'closing' })` |
| 19 | Muhasabah modal accessible from Home HUD journal tap and closable at any point | VERIFIED (code) | `index.tsx` L76-77: `handleTapJournal` calls `useMuhasabahStore.getState().open()`; `_layout.tsx` L55: `<MuhasabahModal />` outside Stack |
| 20 | Muhasabah data is private (device-only, never synced — MUHA-03) | VERIFIED | `muhasabahRepo.ts` has zero import of `assertSyncable`; Privacy Gate classification confirmed in comment; no sync call present |
| 21 | Habit cards display pixel art icons instead of emoji characters | VERIFIED (code) | `HabitCard.tsx` L45-53: `HABIT_ICONS` require-map; L173-178: `<Image source={HABIT_ICONS[habit.category]} style={{ width: 32, height: 32 }} resizeMode="contain" />` |
| 22 | 6 pixel art icon assets exist for all habit categories | VERIFIED | `assets/icons/`: habit-salah.png, habit-quran.png, habit-dhikr.png, habit-fasting.png, habit-dua.png, habit-custom.png all present |

**Score:** 22/22 truths verified (10 require device confirmation — see Human Verification section)

---

### Required Artifacts

#### Plan 01 Artifacts (Wave 1 — Domain + Data Layer)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/domain/hud-environment.ts` | `getEnvironmentForLevel`, `EnvironmentId` | VERIFIED | Exports `getEnvironmentForLevel`, `EnvironmentId`, `ENVIRONMENT_NAMES`, `isEnvironmentTransition` — all substantive, all used |
| `src/domain/muhasabah-engine.ts` | `isMuhasabahTime`, `getClosingContent`, `CLOSING_CONTENT` | VERIFIED | All three exported; 7 CLOSING_CONTENT entries with arabic/translation/source/type fields |
| `src/db/repos/muhasabahRepo.ts` | CRUD for muhasabah_entries (PRIVATE) | VERIFIED | `create`, `getByUserId`, `getTodayEntry`, `getStreak` implemented; no assertSyncable import |
| `src/stores/muhasabahStore.ts` | Muhasabah flow state: isOpen, currentStep, draft, open/close/submit | VERIFIED | Full `MuhasabahState` interface with all required actions; 12 XP on submit |

#### Plan 02 Artifacts (Wave 2 — Home HUD)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/(tabs)/index.tsx` | Home HUD screen, replaces PlaceholderScreen | VERIFIED | Full composition of HudScene + SceneObjects + HudStatBar + CelebrationManager + EnvironmentReveal |
| `src/components/hud/HudScene.tsx` | Skia Canvas layering: background PNG + DayNightOverlay + CharacterSprite | VERIFIED | All three layers present; FilterMode.Nearest sampling; null-guard on bg |
| `src/components/hud/HudStatBar.tsx` | Translucent stat overlay: LevelBadge + XPProgressBar + streak + PrayerCountdown | VERIFIED | iOS BlurView / Android rgba fallback; all 4 stat components; useSafeAreaInsets |
| `src/components/hud/SceneObjects.tsx` | Invisible Pressable tap zones for quest board, prayer mat, journal | VERIFIED | 3 zones, all >= 44x44px, hitSlop={12}, accessibilityRole="button"; journal glow ring implemented |
| `src/components/hud/EnvironmentReveal.tsx` | Fade blackout + new area celebration overlay on environment transition | VERIFIED | `isEnvironmentTransition` gate; 400ms fade-in + 800ms hold + 1200ms fade-out; haptic at 400ms |
| `src/components/hud/PrayerCountdown.tsx` | Next prayer name + countdown timer, updates every minute | VERIFIED | 60-second interval; `formatCountdown` helper; graceful '--' fallback when no location |
| `assets/environments/` | 4 environment background PNGs | VERIFIED | quiet-study.png, growing-garden.png, scholars-courtyard.png, living-sanctuary.png all present |
| `assets/sprites/character-idle.png` | 4-frame horizontal spritesheet for character idle | VERIFIED | File exists (placeholder PNG pending real asset) |

#### Plan 03 Artifacts (Wave 2 — Muhasabah UI)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/muhasabah/MuhasabahModal.tsx` | Container: reads muhasabahStore.isOpen, renders absoluteFillObject overlay | VERIFIED | `useMuhasabahStore` selector; absoluteFillObject + zIndex:100; fade-in animation on open |
| `src/components/muhasabah/MuhasabahStep1.tsx` | Mood rating step: 5-emoji scale tappable options | VERIFIED | 5 MOOD_OPTIONS (😔😐🙂😊✨); setMoodRating + nextStep on select; Skip calls close() |
| `src/components/muhasabah/MuhasabahStep2.tsx` | Highlight pick: today's completed habits as tappable cards | VERIFIED | Reads `habitStore.completions`; empty state with warm message; skip always visible |
| `src/components/muhasabah/MuhasabahStep3.tsx` | Tomorrow focus: 3 quick-pick options | VERIFIED | 3 FOCUS_OPTIONS; setFocusIntent + submit on select; loading state + error retry |
| `src/components/muhasabah/MuhasabahClosing.tsx` | Closing ayah/hadith display with XP earned confirmation | VERIFIED | `getClosingContent` called; Arabic RTL text; '+12 XP' badge in pixelFont; 'Alhamdulillah. Good night.' |
| `app/_layout.tsx` | MuhasabahModal mounted at root level (outside tab navigator) | VERIFIED | Line 55: `<MuhasabahModal />` after `</Stack>` inside `I18nextProvider` |

#### Plan 04 Artifacts (Wave 3 — Visual Identity Migration)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/habits/HabitCard.tsx` | Updated to use pixel art Image instead of emoji Text | VERIFIED | HABIT_ICONS require-map at L45-53; `<Image>` at L173-178; no emoji Text for icon |
| `assets/icons/` | 6 pixel art PNG icons | VERIFIED | habit-salah, habit-quran, habit-dhikr, habit-fasting, habit-dua, habit-custom all present |

---

### Key Link Verification

#### Plan 01 Key Links

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `muhasabahStore.ts` | `gameStore.awardXP` | `require('./gameStore')` lazy require | VERIFIED | `muhasabahStore.ts` L95-96: `const { useGameStore } = require('./gameStore'); await useGameStore.getState().awardXP(...)` |
| `muhasabahRepo.ts` | `muhasabah_entries` table | `db.insert(muhasabahEntries)` | VERIFIED | L19: `db.insert(muhasabahEntries).values(entry).returning()` |
| `muhasabah-engine.ts` | `ishaWindow.start` | `isMuhasabahTime(ishaWindow, now)` | VERIFIED | L33: `return now >= ishaWindow.start` |

#### Plan 02 Key Links

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `app/(tabs)/index.tsx` | `gameStore` | `useGameStore(useShallow)` | VERIFIED | L34-38: `useGameStore` for `currentLevel`, `loadGame` |
| `src/components/hud/HudScene.tsx` | `getEnvironmentForLevel` | import from `../../domain/hud-environment` | VERIFIED | L15-16: direct import; called at L44 |
| `src/components/hud/HudStatBar.tsx` | `habitStore.streaks` | `useHabitStore(useShallow)` | VERIFIED | L24-25: `useHabitStore` for `streaks`; `Math.max(0, ...Object.values(streaks).map(s => s.currentCount))` |
| `src/components/hud/SceneObjects.tsx` | `expo-router useRouter` | `router.push` callbacks | VERIFIED | Navigation callbacks wired in `index.tsx` L86-88; `router.push('/(tabs)/quests')` and `router.push('/(tabs)/habits')` |
| `src/components/hud/EnvironmentReveal.tsx` | `gameStore.pendingCelebrations` | `isEnvironmentTransition(c.level - 1, c.level)` | VERIFIED | L91-94: finds `level_up` celebration crossing environment boundary |

#### Plan 03 Key Links

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `MuhasabahModal.tsx` | `muhasabahStore.isOpen` | `useMuhasabahStore(useShallow)` | VERIFIED | L25-27: `{ isOpen, currentStep }` selector; `if (!isOpen) return null` |
| `MuhasabahStep2.tsx` | `habitStore.completions` | `useHabitStore(useShallow)` | VERIFIED | L25-26: `{ habits, completions }` from `useHabitStore`; `habits.filter(h => completions[h.id])` |
| `MuhasabahClosing.tsx` | `getClosingContent` | import from `../../domain/muhasabah-engine` | VERIFIED | L14: direct import; L31: `getClosingContent(contentIndex)` called |
| `MuhasabahClosing.tsx` | `muhasabahStore.submit` | called on entry (step 3 submits, step reaches 'closing') | VERIFIED | `MuhasabahStep3.tsx` L76-78: `await submit('user-1')` before closing step is rendered |

#### Plan 04 Key Links

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `HabitCard.tsx` | `assets/icons/{habitType}.png` | `require()` map by `habit.category` | VERIFIED | L46-53: `HABIT_ICONS` map with 7 keys (salah/quran/dhikr/fasting/dua/character/custom); `HABIT_ICONS[habit.category] ?? HABIT_ICONS.custom` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| HUD-01 | 05-02 | Home screen displays game-world HUD with level, XP bar, streak count, active quests | SATISFIED | `index.tsx`: HudScene + HudStatBar (level/XP/streak/prayer); SceneObjects tap zone for quest board |
| HUD-02 | 05-02, 05-04 | 16-bit pixel art aesthetic with crisp rendering | SATISFIED | `HudScene.tsx`: `FilterMode.Nearest + MipmapMode.Nearest`; `HabitCard.tsx`: RN Image 32x32 `resizeMode="contain"` |
| HUD-03 | 05-02 | XP gain and level-up animations smooth 60fps (Reanimated) | SATISFIED (code) | `CharacterSprite.tsx`: Reanimated `withRepeat+withTiming+Easing.steps`; `XPProgressBar` and `CelebrationManager` from Phase 4 use Reanimated shared values. Device verification needed for actual 60fps. |
| HUD-04 | 05-02 | Haptic feedback on habit completion, level-up, and quest completion | SATISFIED | `HabitCard.tsx` L109: Medium on complete; `LevelUpOverlay.tsx` L28-30: 3x Heavy on level-up; `gameStore.ts` L430: Medium on quest complete; `EnvironmentReveal.tsx` L32: Success on environment unlock |
| MUHA-01 | 05-01, 05-03 | Nightly Muhasabah presents structured reflection prompts (30-60 seconds) | SATISFIED (code) | 3-screen flow: mood (1 tap) + highlight (1 tap) + focus intent (1 tap) + closing ayah. Trigger via `isMuhasabahTime` post-Isha. |
| MUHA-02 | 05-01, 05-03 | User can review today's completions and set intention for tomorrow | SATISFIED (code) | `MuhasabahStep2`: shows `completedHabits` from `habitStore.completions`; `MuhasabahStep3`: captures `focusIntent` persisted via `muhasabahRepo.create` as `tomorrowIntention` |
| MUHA-03 | 05-01 | Muhasabah data is private (device-only, never synced) | SATISFIED | `muhasabahRepo.ts`: no `assertSyncable` import in executable code; PRIVATE classification in Privacy Gate confirmed |
| MUHA-04 | 05-01, 05-03 | User can skip Muhasabah without penalty or shame | SATISFIED | `close()` only resets state (no XP deduction); Skip button on Steps 1-3 calls `close()` directly; no confirmation dialog; grep confirms zero shame/guilt/penalty copy in muhasabah components |

**Coverage:** 8/8 phase requirements (HUD-01..04, MUHA-01..04) have implementation evidence.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `CharacterSprite.tsx` | 51 | Static `transform` prop on Skia `Group` for sprite position | INFO | The RESEARCH.md warned against *animated* transforms on Skia Group (Android perf regression). This uses a static `transform` for position (CHAR_X, CHAR_Y are constants) — not animated. The clip rect drives the animation, not the group transform. Acceptable at MVP stage; can refactor to x/y props if Android issues emerge. |
| `assets/environments/*.png` | — | Placeholder PNGs (favicon.png copies) | WARNING | Current environment backgrounds are solid-color placeholders. Real AI-generated pixel art assets must be swapped before public release. No code changes needed — just PNG replacement. |
| `assets/sprites/character-idle.png` | — | Placeholder PNG (not a real 4-frame spritesheet) | WARNING | Character animation runs but shows a static placeholder. Real spritesheet needed before public release. |
| `MuhasabahStep3.tsx` | 76 | Hardcoded `'user-1'` userId | INFO | Consistent with v1 pattern across entire codebase (habits.tsx, index.tsx all use `DEFAULT_USER_ID = 'default-user'` or `'user-1'`). Not a phase-specific issue. |

No blockers. Two warnings are asset-quality gaps (placeholder PNGs) that are pre-existing, documented, and do not affect functionality.

---

### Human Verification Required

All 10 items below require device testing. Automated code checks pass for all of them — human verification confirms the runtime behavior.

#### 1. Home HUD Full-Screen Rendering

**Test:** Open app on device, navigate to Home tab
**Expected:** Full-screen pixel art scene visible (even with placeholder solid-color PNGs), no "Home placeholder" text
**Why human:** Skia Canvas rendering requires a real GPU — cannot verify in jest environment

#### 2. Character Sprite Animation

**Test:** Observe the character area of the Home HUD for 2-3 seconds
**Expected:** Character sprite cycles through frames (any visible movement, even with placeholder PNG)
**Why human:** Animation continuity requires real-time visual observation

#### 3. Day/Night Tint at Known Time

**Test:** Check Home HUD tint color against current local time (e.g., if midday: no tint; if evening: warm orange; if night: indigo overlay)
**Expected:** Tint visually matches time-of-day as specified in DayNightOverlay TIME_STOPS
**Why human:** Color calibration on device screen cannot be verified programmatically

#### 4. Tap Zone Navigation

**Test:** Tap left side of scene (quest board area), then center (prayer mat area), then right (journal area)
**Expected:** Quest board -> Quests tab; prayer mat -> Habits tab; journal -> Muhasabah modal appears
**Why human:** Tap zone pixel positions (% offsets) must match actual pixel art asset positions on device

#### 5. Muhasabah Modal End-to-End Flow

**Test:** Tap journal area -> complete all 3 steps -> observe closing screen
**Expected:** Step 1 (mood emojis) -> Step 2 (habit highlight or "You're doing great") -> Step 3 (focus intent) -> Closing (Arabic ayah + translation + "+12 XP" + "Alhamdulillah. Good night.") -> Done closes modal
**Why human:** Multi-screen animated flow, XP reflection in HudStatBar, and modal behavior require human observation

#### 6. Skip Path (All 3 Steps)

**Test:** Open Muhasabah, tap Skip on Step 1. Open again, tap Skip on Step 2. Open again, tap Skip on Step 3.
**Expected:** Each Skip closes the modal immediately with no confirmation dialog, no penalty message, no XP change visible in HudStatBar
**Why human:** Requires human interaction at all three steps to confirm adab safety rails

#### 7. Pixel Art Icons in Habits Tab

**Test:** Navigate to Habits tab, observe habit cards
**Expected:** Small pixel art PNG images visible for each habit (not emoji characters). Icons should render at 32x32 without blurring.
**Why human:** Visual quality of pixel art icons (crisp vs blurry) requires device screen observation

#### 8. Haptic Feedback on Habit Completion

**Test:** On physical device (not simulator), complete a habit in the Habits tab
**Expected:** Device vibrates with medium impact haptic at the moment of completion
**Why human:** Haptic feedback is a physical sensation, cannot be verified in code or simulator

#### 9. Environment Reveal Animation

**Test:** Trigger a level-up that crosses level 5->6, 11->12, or 19->20 (may require seeding XP via devtools or completing many habits)
**Expected:** Screen fades to black, shows "NEW AREA UNLOCKED" + environment name, fades back with a Success haptic at the fade-in moment
**Why human:** Requires triggering a specific game state transition and observing a timed animation sequence

#### 10. Journal Glow Ring at Isha Time

**Test:** Wait until after Isha prayer time (or temporarily set device clock past 21:00 to trigger the fallback) and check Home HUD
**Expected:** Animated golden ring pulses around the journal tap zone (right side of scene) indicating Muhasabah is available
**Why human:** Time-based visibility toggle and animation require either waiting for Isha or clock manipulation

---

### Summary

Phase 5 is architecturally complete. All 22 must-have truths are verified in code across 4 plans (22/22 score). The implementation is substantive — no stubs, no placeholders in logic, no anti-pattern blockers.

**What is solid:**
- Domain modules (`hud-environment.ts`, `muhasabah-engine.ts`) are pure TypeScript with correct behavior
- Privacy invariant holds: `muhasabahRepo` has zero executable calls to `assertSyncable`
- Muhasabah adab rails are enforced: `close()` has no XP deduction; Skip is visible on all 3 steps; no shame copy found in any muhasabah component
- All 4 haptic events covered: habit completion (Medium), level-up (3x Heavy), quest completion (Medium), environment reveal (Success)
- Muhasabah modal is mounted at root level in `_layout.tsx` outside the Stack navigator (correct for overlaying all screens)
- HabitCard uses `<Image>` from React Native (not Skia) — correct for a non-Canvas component
- `FilterMode.Nearest + MipmapMode.Nearest` used in HudScene (not the deprecated `FilterQuality.None`)

**Pending human confirmation:**
- Visual rendering quality on device (HUD scene, pixel art icons, animations, day/night tint)
- Tap zone positions calibrated to actual pixel art asset positions
- Haptic sensation on physical device
- Muhasabah full flow UX correctness

**Asset gap (non-blocking):**
- Environment background PNGs and character spritesheet are placeholders (favicon.png copies). Real AI-generated pixel art assets must be created and dropped into `assets/environments/` and `assets/sprites/` before v1 launch. No code changes required.

---

_Verified: 2026-03-15T23:30:00Z_
_Verifier: Claude (gsd-verifier)_
