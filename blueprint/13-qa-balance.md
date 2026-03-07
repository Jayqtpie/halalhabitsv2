# 13 — QA and Balance Plan

> **Requirement:** BLUE-13
> **Cross-references:** [Game Design Bible](./03-game-design-bible.md) · [Feature Systems](./05-feature-systems.md) · [UI Design Tokens](./08-ui-design-tokens.md) · [Data Model](./11-data-model.md) · [Telemetry](./12-telemetry.md) · [Content Pack](./15-content-pack.md)

---

## Test Strategy Overview

Testing follows a pyramid model adapted for a solo-dev React Native game app. The game engine's pure TypeScript design makes unit testing the highest-leverage activity.

### Test Pyramid

```
        ┌─────────┐
        │  Manual  │   Visual QA, adab compliance, animation smoothness
        │  (few)   │   pixel art rendering, real-device feel
        ├─────────┤
        │   E2E   │   Critical user paths (onboarding, habit completion,
        │  (some) │   streak break + recovery, level up)
        ├─────────┤
        │  Integ  │   Zustand ↔ SQLite, Privacy Gate enforcement,
        │  (more) │   sync engine, prayer time calculation
        ├─────────┤
        │  Unit   │   Game engine (XP, streaks, quests, titles, leveling),
        │ (most)  │   date/timezone utilities, copy string validation
        └─────────┘
```

### Layer Details

| Layer | Scope | Framework | Run Frequency |
|-------|-------|-----------|---------------|
| **Unit** | Pure TS game engine functions: XP calculation, streak logic, quest matching, title unlock checks, level-up thresholds | Jest (or Vitest) | Every commit (pre-commit hook) |
| **Integration** | Zustand store interactions, SQLite read/write round-trips, Privacy Gate data classification, telemetry event validation | Jest + expo-sqlite mock | Every PR / pre-push |
| **E2E** | Critical user paths through the full React Native app | Maestro (YAML-based, no flaky selectors) | Before each release, weekly during active dev |
| **Manual** | Visual QA (pixel art crispness, animation 60fps, color accuracy), haptic feel, adab copy compliance, real-device testing | Human checklist | Each phase completion |

---

## XP / Streak Simulation Validation

These simulations reproduce and validate the three player archetypes from the [Game Design Bible](./03-game-design-bible.md). Each simulation runs as an automated unit test with assertions on expected outcomes.

### Archetype Definitions

| Archetype | Daily Behavior | Habits Active | Streak Pattern |
|-----------|---------------|---------------|----------------|
| **Casual Crescent** | 2-3 habits/day, misses 2 days/week | 5 habits | Breaks every 5-7 days, uses Mercy Mode |
| **Consistent Star** | 5-6 habits/day, misses 1 day/2 weeks | 7 habits | Sustained 14-30 day streaks |
| **Power Minaret** | 7-8 habits/day, rarely misses | 10 habits | 60+ day streaks, hits multiplier cap |

### Simulation Test Cases

Each test runs a deterministic simulation for the specified duration and asserts the player reaches the expected level range.

| Test ID | Archetype | Duration | Expected Level Range | Key Assertions |
|---------|-----------|----------|---------------------|----------------|
| `SIM-01` | Casual Crescent | 7 days | 3-5 | Mercy Mode activates at least once; XP never negative |
| `SIM-02` | Casual Crescent | 30 days | 7-10 | Recovery XP is not exploitable (less XP than consistent play) |
| `SIM-03` | Casual Crescent | 90 days | 12-16 | At least 1 title unlocked |
| `SIM-04` | Consistent Star | 7 days | 5-8 | Streak multiplier reaches 1.7x+ |
| `SIM-05` | Consistent Star | 30 days | 14-18 | 3+ titles unlocked including 1 Rare |
| `SIM-06` | Consistent Star | 90 days | 22-28 | Weekly quest completion rate > 80% |
| `SIM-07` | Consistent Star | 365 days | 38-48 | Multiple Rare titles, approaching Legendary |
| `SIM-08` | Power Minaret | 7 days | 7-10 | Multiplier hits 3.0x cap; soft daily XP cap triggers |
| `SIM-09` | Power Minaret | 30 days | 20-25 | Soft cap prevents runaway progression |
| `SIM-10` | Power Minaret | 90 days | 30-38 | Level gap between Power and Consistent narrows due to cap |
| `SIM-11` | Power Minaret | 365 days | 50-65 | Does NOT reach Level 100 (aspirational target preserved) |

### Balance Assertions (All Archetypes)

These assertions must pass for every simulation:

- [ ] XP total is never negative at any point in the simulation
- [ ] Streak multiplier never exceeds 3.0x
- [ ] Soft daily XP cap triggers correctly (50% diminishing returns above ~500 XP/day)
- [ ] Mercy Mode recovery quest XP is strictly less than what the player would have earned with consistent play
- [ ] No level-down — XP total is monotonically non-decreasing
- [ ] Level 100 requires 1+ years of Power Minaret play (aspirational ceiling)

### Exploit Testing

| Exploit Vector | Description | Expected Mitigation | Test |
|---------------|-------------|-------------------|------|
| **Rapid habit creation** | Create 20 easy habits, complete all daily for max XP | Max 20 active habits (enforced in Habit Forge). Soft daily XP cap at ~500 XP reduces returns. | Create 20 Easy (10 XP) habits, complete all: verify daily XP is capped |
| **Habit frequency gaming** | Set habit to "custom: 10x per day" to earn XP repeatedly | Frequency sets *requirement*, not bonus. Daily habits earn XP once per day per habit. Weekly habits earn XP once per period. | Create daily habit, complete twice: verify only 1 XP award |
| **Mercy Mode cycling** | Intentionally break streak, use Mercy Mode recovery for XP | Recovery quest XP < streak continuation XP. 25% streak credit, not 100%. Max 3 recovery attempts before passive mode. | Break 14-day streak, complete recovery: verify net XP < 14 days of continuation |
| **Clock manipulation** | Set device clock forward to earn future-day completions | Non-adversarial design: not blocked. Noted as accepted risk (see [Feature Systems](./05-feature-systems.md)). | Document only — not tested |
| **Archive/restore cycling** | Archive habit to freeze streak, restore later | Archived habits lose active streak. Reactivation starts streak at 0. | Archive 10-day streak, restore: verify streak is 0 |

---

## Timezone Edge Cases

All times reference the user's **local device timezone** unless otherwise specified. "Today" starts at midnight local time (00:00), not Fajr.

| # | Edge Case | Scenario | Expected Behavior | Test Priority |
|---|-----------|----------|-------------------|:-------------:|
| 1 | **Late-night completion** | User completes habit at 11:58 PM. App processes at 12:01 AM due to background delay. | Completion is credited to the day the user tapped the button (client timestamp at tap time, not server receipt). Client-side timestamp is authoritative. | High |
| 2 | **Timezone travel (westbound)** | User in NYC (UTC-5) completes habits, flies to LA (UTC-8). Gets 3 extra hours in "today." | Day boundary follows device timezone. The user's "today" extends — they can complete more habits. No streak penalty. No double-credit (each habit earns XP once per calendar day in current timezone). | High |
| 3 | **Timezone travel (eastbound)** | User in LA flies to NYC. Loses 3 hours. Already completed habits for "today" in LA. | Previously completed habits remain completed. If the user hasn't completed some habits and it's now past midnight in new timezone, those are missed for that day. Streak logic uses local-midnight boundary. | High |
| 4 | **DST spring-forward** | Clock jumps from 1:59 AM to 3:00 AM. User's midnight-to-midnight day is 23 hours. | Habit completion uses calendar date, not hour count. 23-hour day still counts as a full day. Streaks unaffected. | Medium |
| 5 | **DST fall-back** | Clock repeats 1:00-2:00 AM. User's day is 25 hours. | Calendar date logic — 25-hour day is still one day. No duplicate completions from the repeated hour. | Medium |
| 6 | **Prayer time across DST** | Isha prayer window crosses DST boundary. Prayer time calculated as 8:30 PM but clock changes at 2:00 AM. | adhan-js recalculates prayer times daily. Each day's prayer times use that day's DST state. No manual adjustment needed — the library handles this. | Medium |
| 7 | **Day boundary definition** | When does "today" start? Fajr (Islamic day) or midnight (civil day)? | Midnight local time (00:00). Islamic day start (Maghrib/Fajr) would confuse habit tracking UX and break streak logic for non-prayer habits. Users can set prayer-specific windows via habit time windows. | High |
| 8 | **Ramadan across timezones** | User fasting in one timezone, travels mid-fast to another. | Fasting habit completion is a single daily check-in, not duration-tracked. User marks it complete when they break fast. Timezone change doesn't affect this. | Low |
| 9 | **Offline for multiple days** | User has no connectivity for 3 days. Completions are queued locally. Device timezone may have changed during offline period. | Queued completions use the timestamp captured at completion time (client clock). When syncing, the server accepts client timestamps. Streaks are calculated from completion timestamps, not sync time. | High |
| 10 | **Midnight completion race** | User taps complete at 11:59:59 PM. Network latency means server receives at 12:00:01 AM. | Client timestamp is authoritative. Server stores both client and server timestamps. Streak and day-credit logic always use client timestamp. | Medium |

**Design principle:** The client timestamp at the moment of user action is always authoritative for day-boundary decisions. Server timestamps are stored for sync conflict resolution but never override the user's perceived day.

---

## Streak Edge Cases

| # | Edge Case | Scenario | Expected Behavior | Rationale |
|---|-----------|----------|-------------------|-----------|
| 1 | **Pause mid-streak** | User pauses a habit with a 14-day active streak. | Streak is **frozen** — preserved but not counting. When resumed, streak continues from 14. Days while paused don't count as missed OR completed. | Pausing is intentional and should not punish the user. |
| 2 | **Archive mid-streak** | User archives a habit with a 14-day active streak. | Streak is **stopped** — historical record preserved but streak resets to 0 if habit is ever reactivated. | Archiving signals "I'm done with this." Different intent than pausing. |
| 3 | **Reactivate archived habit** | User reactivates an archived habit (previously had 14-day streak). | Streak starts at **0**. Previous streak data is in history (viewable in calendar) but active streak resets. | Clean start matches user intent. Historical data preserved for personal reference. |
| 4 | **Two habits with same name** | User creates two custom habits both named "Morning Routine." | Each habit has a unique ID. Streaks, completions, and XP are tracked per habit ID, not name. Both function independently. | Names are display labels, not identifiers. |
| 5 | **Frequency change (daily to weekly)** | User changes habit from daily to weekly (e.g., Mondays only). | Streak **resets to 0**. The definition of "consecutive" changes fundamentally (daily vs weekly), so the old streak is incomparable. | Per [Feature Systems](./05-feature-systems.md) edit rules: frequency change resets streak. |
| 6 | **Frequency change (weekly to daily)** | User changes habit from weekly to daily. | Streak **resets to 0**. Same rationale as above — "consecutive" means something different. | Consistency with Rule 5. |
| 7 | **Time window widened** | User widens habit time window from "6-8 AM" to "6 AM - 12 PM." | Streak **preserved**. Wider window is strictly more permissive. | Per edit rules: widening preserves streak. |
| 8 | **Time window narrowed** | User narrows habit time window from "6 AM - 12 PM" to "6-8 AM." | Streak **resets to 0**. Narrower window means past completions may not have qualified under new rules. | Per edit rules: narrowing resets streak. |
| 9 | **Multiple completions same day** | User taps complete on the same habit twice in one day. | Second tap is a no-op. One completion per habit per calendar day (or per frequency period for weekly). XP awarded once. | Prevents accidental double-taps and intentional XP farming. |
| 10 | **Midnight boundary and streaks** | User completes habit at 11:59 PM Monday. Next completion at 12:01 AM Tuesday. | Both count. Monday's streak day is covered. Tuesday's streak day starts at midnight. The 2-minute gap is fine — streak is per-calendar-day, not 24-hour rolling. | Calendar-day model, not rolling-window. |
| 11 | **Mercy Mode declined** | User breaks streak, Mercy Mode activates, user ignores it. Recovery quest expires after 3 days. | Streak resets to 0. No partial credit. User can start a new streak normally. No negative consequence beyond lost streak. No shame notification. | Recovery is optional. Declining it is a valid choice. |
| 12 | **Mercy Mode during pause** | User pauses a habit, then unpauses after the streak-break window would have passed. | Streak is intact — paused habits don't experience breaks. Unpausing resumes the frozen streak count. | Pause = intentional freeze, not abandonment. |

---

## Accessibility QA Checklist

Reference: [UI Design Tokens](./08-ui-design-tokens.md) for color values and spacing.

### Screen Reader Compatibility

- [ ] All interactive elements have accessible labels (not just icons)
- [ ] Habit completion button: "Complete [habit name]. Current streak: [N] days"
- [ ] XP gain announcement: "[amount] XP earned" (live region update)
- [ ] Level-up announcement: "Level up! You are now level [N]" (alert role)
- [ ] Navigation tabs have descriptive labels: "Home," "Habits," "Quests," "Profile"
- [ ] Pixel art decorative elements marked as `accessibilityElementsHidden` / `importantForAccessibility="no"`
- [ ] Quest cards: read quest description, progress, and reward
- [ ] Muhasabah prompts: full prompt text is accessible, response fields are labeled

### Touch Targets

- [ ] All tappable elements meet 44x44 pt minimum (iOS HIG / Material 48dp)
- [ ] Habit completion tap area extends to full list row (not just the checkbox icon)
- [ ] Close/dismiss buttons are at least 44x44 pt even if visually smaller
- [ ] Tab bar icons have adequate spacing (no accidental adjacent taps)

### Color and Contrast

- [ ] Text on dark backgrounds meets WCAG AA (4.5:1 for body, 3:1 for large text)
- [ ] Emerald-on-dark-charcoal primary buttons: verify 4.5:1 minimum
- [ ] Gold XP text on dark backgrounds: verify readability
- [ ] Streak counter colors are distinguishable without color alone (include number, not just color)
- [ ] Error states use icon + text, not just red color

### Motion and Animation

- [ ] All animations respect `prefers-reduced-motion` / `accessibilityReduceMotion`
- [ ] Reduced motion mode: XP gain shows number change without floating animation
- [ ] Reduced motion mode: level-up shows static celebration, no particle effects
- [ ] Reduced motion mode: HUD environment is static (no ambient animations)
- [ ] No essential information conveyed only through animation

### Typography and Scaling

- [ ] App supports Dynamic Type / font scaling up to 200%
- [ ] Layout does not break at largest font size (elements wrap or scroll, never clip)
- [ ] Pixel art elements (icons, HUD) do not scale with text (they use fixed point sizes)
- [ ] Minimum body text size: 16pt at default scaling

### RTL Readiness

- [ ] Layout uses logical properties (start/end, not left/right) via i18next
- [ ] Arabic text renders correctly in any user-input field (habit names, niyyah)
- [ ] Navigation direction reverses in RTL mode
- [ ] Icons that imply direction (arrows, progress bars) flip in RTL mode
- [ ] Not required for v1 launch, but architecture must not block it

---

## Content Sensitivity Checklist

The adab compliance review process ensures all user-facing text aligns with the project's Islamic etiquette principles. This is not optional — it is a release gate.

### Review Process

1. **Every user-facing string** goes through the content sensitivity check before release
2. **Automated scan:** CI/CD pipeline greps all copy strings against the forbidden patterns list below
3. **Manual review:** After automated scan, a human reviews all notification copy, Mercy Mode messages, and Muhasabah prompts
4. **Religious content:** All Quranic ayat and hadith references must include source (surah:ayah or hadith collection + number). A knowledgeable person should review these before release. Flag as `NEEDS_REVIEW` in the codebase until reviewed.

### Forbidden Patterns (Automated Scan)

These phrases or framings must NEVER appear in user-facing copy:

| Pattern | Why It Is Forbidden | Example of Violation |
|---------|--------------------|--------------------|
| "you missed" | Shame framing | "You missed Fajr today" |
| "you failed" | Shame framing | "You failed to complete your habits" |
| "your iman" | App cannot measure spiritual state | "Your iman is getting stronger" |
| "your taqwa" | App cannot measure spiritual state | "Increase your taqwa level" |
| "worship score" | Conflates discipline with worship quality | "Your worship score: 85%" |
| "prayer streak lost" | Shame framing for missed prayer | "Your prayer streak was lost" |
| "you broke" | Accusatory framing | "You broke your streak" |
| "don't give up" | Implies the user is about to fail | "Don't give up now!" |
| "falling behind" | Comparison/competition framing | "You're falling behind" |
| "others are" / "other users" | Social comparison (riya risk) | "Other users completed 5 habits today" |
| "punishment" / "penalty" | Punitive framing | "Streak penalty applied" |
| "sinful" / "sin" / "haram" | Moral judgment | "Avoid sinful screen time" |

### Approved Patterns

These framings embody the project's wise-mentor voice:

| Pattern | Why It Works | Example |
|---------|-------------|---------|
| "your momentum" | Effort-based, forward-looking | "Your momentum is building" |
| "your discipline" | Measures effort, not spirituality | "Your discipline grows stronger" |
| "recovery available" | Opens a door, doesn't close one | "Recovery path available" |
| "continue your journey" | Ongoing, no end-state judgment | "Continue your journey" |
| "new day, new opportunity" | Fresh start framing | "A new day brings new opportunity" |
| "your consistency" | Behavioral, measurable | "Your consistency is remarkable" |
| "well done" / "excellent" | Simple affirmation | "Well done. +15 XP" |
| "ready for" | Invitational, not demanding | "Ready for Dhuhr?" |
| "bismillah" | Islamic opening, reverent | "Bismillah. Let's begin." |
| "alhamdulillah" | Gratitude framing | "Alhamdulillah. Another day of growth." |

### Copy Review Workflow

```
Developer writes copy → Automated grep scan → Manual adab review → Merge
                              ↓ (fail)              ↓ (flag)
                        Fix forbidden patterns   Add NEEDS_REVIEW tag
```

### Religious Content Protocol

- All Quranic references use standard format: "Surah [Name], [Number]:[Ayah]"
- All hadith references include collection name and number: "Sahih Muslim, [Number]"
- No AI-generated tafsir or interpretation — only direct quotation
- Content should be reviewed by someone knowledgeable in Islamic studies before v1 launch
- Until reviewed, content is tagged `NEEDS_SCHOLARLY_REVIEW` in the codebase

---

*Section 13 of 16 — Master Blueprint*
*Requirement: BLUE-13*
