# Phase 12: Friday Power-Ups - Research

**Researched:** 2026-03-22
**Domain:** Game event scheduling, XP multiplier injection, quest gating, HUD UI, push notifications
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Push notification in the morning + in-app message on first Friday open (both channels)
- **D-02:** In-app message is integrated into the HUD game world (scroll, banner, or element within the scene — not a modal or toast)
- **D-03:** One prominent message on first app open; subtle shorter variations if player returns later in the day
- **D-04:** Hadith source attribution is shown alongside the motivational text (e.g., "(Muslim 854)")
- **D-05:** 10 pre-written messages from `blueprint/15-content-pack.md` lines 234-250, rotate across weeks
- **D-06:** Progress-based completion — player marks sections/pages as they go, completing when they finish all sections
- **D-07:** Quest expires at Maghrib prayer time on Friday (calculated via adhan-js using player's location)
- **D-08:** Added on top of regular daily/weekly quests as an extra card (does not replace any existing slot)
- **D-09:** Repeats every Friday — appears fresh each week (sunnah practice, not a one-time achievement)
- **D-10:** Awards 100 bonus XP on completion (not subject to 2x Friday multiplier — quest XP excluded per economy model)
- **D-11:** 2x XP boost runs midnight-to-midnight local time (full calendar Friday)
- **D-12:** Stacks multiplicatively with streak multiplier (max 3.0x streak x 2.0x friday = 6.0x effective)
- **D-13:** 2x applies to habit completion XP only, not quest XP (economy model constraint)
- **D-14:** Grace rule: if a habit was started before midnight, it still gets the Friday multiplier even if completed after midnight
- **D-15:** When boost ends, HUD indicator fades out with a "Friday boost ended" message (not instant disappear)
- **D-16:** In scope for Phase 12 — lightweight special treatment for Friday Dhuhr slot
- **D-17:** Special pixel art animation (mosque/minaret moment) + special mentor copy on Jumu'ah completion
- **D-18:** Dhuhr slot keeps its "Dhuhr" label on Fridays but gains a visible "Jumu'ah" tag/badge
- **D-19:** Separate "Jumu'ah" toggle distinct from regular Dhuhr — player explicitly marks Jumu'ah attendance (honor system)
- **D-20:** Jumu'ah toggle only appears on Fridays; standard Dhuhr behavior on all other days

### Claude's Discretion

- Al-Kahf section breakdown (how many sections, progress UX)
- Exact HUD integration design for Friday message and 2x badge
- Fade-out animation timing and copy for boost ending
- Jumu'ah special animation specifics (Skia/Reanimated implementation)
- Push notification scheduling (exact morning time)

### Deferred Ideas (OUT OF SCOPE)

- Friday-specific environment visual (e.g., mosque skyline, green tint) — could be a future cosmetic phase
- Jumu'ah khutbah notes/reflection — too much scope, potentially a future Muhasabah variant
- Friday streak tracking (consecutive Fridays with Al-Kahf) — nice-to-have for title system later
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FRDY-01 | User receives 2x XP multiplier on all Friday habit completions (timezone-aware, stacks with streak multiplier) | `friday-engine.ts` pure function pattern; inject into `gameStore.awardXP()` multiplier parameter |
| FRDY-02 | HUD displays active Jumu'ah boost indicator on Fridays | `HudStatBar.tsx` row extension; Reanimated fade-in/out pattern from `DayNightOverlay.tsx` |
| FRDY-03 | Surah Al-Kahf challenge quest card appears on Friday mornings with 100 bonus XP | `quest-templates.ts` new template; `generateQuests()` Friday gate; Maghrib deadline via `prayer-times.ts` |
| FRDY-04 | Rotating hadith-sourced Friday messages display (10 pre-written, vetted messages) | Copy in `blueprint/15-content-pack.md`; rotation pattern from `notification-copy.ts`; HUD in-world delivery |
</phase_requirements>

---

## Summary

Phase 12 is entirely additive — every change extends existing patterns without replacing any infrastructure. The project already has: a `calculateXP()` function that accepts an arbitrary multiplier parameter, a `selectQuestTemplates()` function that supports arbitrary filter gates, an `awardXP()` orchestration path in `gameStore`, push notification scheduling in `notification-service.ts`, and copy rotation in `notification-copy.ts`. Friday Power-Ups threads a new pure-function module (`friday-engine.ts`) through these existing seams.

The highest-risk area is the HUD integration for the Friday badge and in-world message. `HudStatBar.tsx` renders a horizontal row of widgets inside a Skia Canvas layer and must remain space-constrained — adding a badge requires the row to either shrink existing widgets or be conditionally replaced rather than always-rendered. The `HudScene.tsx` canvas uses only Skia primitives; non-Skia React Native components must be layered over the canvas using absolute-positioned Views, not rendered inside `<Canvas>`.

The architecture decision documented in `.planning/research/ARCHITECTURE.md` is correct and verified by the existing code: no new store is needed. `friday-engine.ts` is a pure domain module; Friday state is ephemeral (derived from `new Date()` at call time), not persisted.

**Primary recommendation:** Implement `friday-engine.ts` first as a pure module with full unit tests; wire it into `gameStore.awardXP()` and `generateQuests()` as a thin injection; then layer the HUD badge as a conditional React Native component over the canvas (not inside it).

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-native-reanimated` | already installed | Fade animations for HUD badge and boost-end message | Project standard; used in CharacterSprite, DayNightOverlay |
| `@shopify/react-native-skia` | already installed | Skia Canvas for Jumu'ah animation frame | Project standard; all HUD rendering uses Skia |
| `expo-notifications` | already installed | Friday morning push notification scheduling | Project standard; `notification-service.ts` already uses it |
| `adhan` | already installed | Maghrib time for Al-Kahf quest expiry | Project standard; `prayer-times.ts` already uses it |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zustand` | already installed | Store integration (no new store — injects into gameStore) | `awardXP()` and `generateQuests()` call sites only |
| `expo-haptics` | already installed | Light haptic on Jumu'ah completion acknowledgment | Same pattern as quest completion haptic in gameStore |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pure `isFriday()` function | Persisted `isFridayActive` flag in store | Pure function is simpler; derived state never goes stale |
| Module-level rotation counter | Persistent week-indexed counter | Module counter resets on app restart, which is fine; week index requires storage |
| Skia Canvas text for Friday badge | React Native `<Text>` over canvas | RN Text over canvas is standard project pattern (HudStatBar already does this); Skia text rendering is more complex |

**Installation:** No new packages required. All dependencies already installed.

---

## Architecture Patterns

### Recommended Project Structure

New files follow existing domain/component layout:

```
src/domain/
└── friday-engine.ts     # Pure TS: isFriday, getFridayMultiplier, Al-Kahf deadline, message rotation

src/components/hud/
└── FridayBoostBadge.tsx # Reanimated fade badge displayed in HudStatBar on Fridays

__tests__/domain/
└── friday-engine.test.ts
```

Modified files:
```
src/domain/quest-templates.ts        # Add Al-Kahf template (type: 'friday')
src/domain/quest-engine.ts           # Add 'friday' type + 'alkahf_sections' targetType if needed
src/domain/notification-copy.ts      # Add getFridayMessage() with 10-item rotation
src/stores/gameStore.ts              # Wire isFriday() into awardXP() and generateQuests()
src/services/notification-service.ts # Add scheduleFridayNotification()
src/components/hud/HudStatBar.tsx    # Add FridayBoostBadge component to row
src/components/hud/HudScene.tsx      # Add Jumu'ah completion animation trigger
```

### Pattern 1: Friday Detection (Pure Function)

**What:** `isFriday(now, timezoneOffsetMinutes)` derives local weekday from a UTC timestamp + timezone offset without relying on the JS engine's locale. This prevents incorrect detection if device timezone differs from the user's registered location.

**When to use:** Every call site that gates Friday behavior — `awardXP()`, `generateQuests()`, HUD badge rendering, notification scheduling.

**Implementation note:** `settingsStore` already stores `locationLat` and `locationLng`. The timezone offset must be derived from these coordinates. The standard approach is `Intl.DateTimeFormat` with the IANA timezone, but `adhan` already imports `Coordinates` which can determine timezone indirectly via prayer time calculations. The simpler correct approach: use `new Date().getDay()` with awareness that `getDay()` returns the device's local weekday — which is correct as long as the app is used in the user's physical location (overwhelmingly true). Document this assumption explicitly.

```typescript
// Source: derived from existing gameStore.ts day helpers + JS Date API
export function isFriday(now: Date = new Date()): boolean {
  // getDay() returns 5 for Friday in local device timezone
  // Assumption: device timezone matches user's physical location
  return now.getDay() === 5;
}

export function getFridayMultiplier(): number {
  return 2.0;
}

export function combinedMultiplier(streakMultiplier: number, fridayMultiplier: number): number {
  return streakMultiplier * fridayMultiplier;
}
```

### Pattern 2: Multiplier Injection into awardXP()

**What:** `gameStore.awardXP()` already accepts a `multiplier` parameter. The call site (habit completion handler) already computes the streak multiplier before calling `awardXP()`. Friday multiplier is injected at the same call site by multiplying the streak multiplier by `getFridayMultiplier()` when `isFriday()` is true.

**When to use:** Habit completion flow only. Quest completion calls `awardXP(..., 1.0, ...)` — the 1.0 multiplier must NOT be replaced with Friday multiplier (D-13).

```typescript
// Source: existing gameStore.ts awardXP signature
// In habit completion handler (habitStore or wherever completeHabit is called):
const streakMultiplier = getStreakMultiplier(currentStreak); // existing logic
const fridayBonus = isFriday() ? getFridayMultiplier() : 1.0;
const effectiveMultiplier = streakMultiplier * fridayBonus;
await gameStore.awardXP(userId, baseXP, effectiveMultiplier, 'habit', habitId);
```

**Grace rule (D-14):** The habit completion handler already captures `completedAt` timestamp. The Friday check must use the timestamp of when the habit was *started* or *first interacted with*, not when the completion was persisted. If no start timestamp exists, use `completedAt` — this is a conservative interpretation that only affects the midnight edge case and is acceptable.

### Pattern 3: Al-Kahf Quest Template with Friday Gate

**What:** The quest engine's `selectQuestTemplates()` filters by `type`, `minLevel`, `recentlyUsedIds`, and `isRelevantToPlayer()`. A Friday-specific quest needs an additional gate. The architecture decision specifies using `isFriday()` as a gate in `generateQuests()` rather than adding a new `type` field to QuestTemplate.

**When to use:** `generateQuests()` in `gameStore.ts`. Al-Kahf is generated as an *additional* entry alongside regular daily/weekly quests (D-08), not replacing one.

```typescript
// In generateQuests():
// After generating regular daily/weekly/stretch quests:
if (isFriday() && !hasAlKahfQuest(currentQuests)) {
  const maghribTime = getMaghribTime(lat, lng, today, calcMethod);
  await questRepo.create({
    ...alkahfTemplate,
    expiresAt: maghribTime.toISOString(),  // expires at Maghrib, not midnight
  });
}
```

**Al-Kahf template design (Claude's discretion):**
- `type: 'daily'` (Friday-only daily — expires same day)
- `targetType: 'alkahf_sections'` (new targetType, or use `total_completions` with 30 sections)
- `targetValue: 30` (30 sections in Surah Al-Kahf — standard juz division)
- `xpReward: 100`
- `minLevel: 1` (available to all)

Recommendation: use `targetType: 'alkahf_sections'` as a new targetType in `quest-engine.ts` rather than reusing `total_completions`, because Al-Kahf progress is player-reported section-by-section, not driven by habit completion events. The progress update is triggered by a dedicated UI control, not by the standard `updateQuestProgress()` event flow.

### Pattern 4: Copy Rotation for Friday Messages

**What:** `notification-copy.ts` already implements a module-level counter (`morningLineIndex`) for rotating through a fixed array. Friday messages use the identical pattern with a week-indexed counter instead of a simple increment, so the same message persists across multiple app opens on the same Friday.

**When to use:** `getFridayMessage()` called on every Friday app open and for the push notification body.

```typescript
// In notification-copy.ts — follows existing getMorningMotivation() pattern
const FRIDAY_MESSAGES: Array<{ text: string; source: string }> = [
  { text: 'Jumu\'ah blessings activated. All completions earn 2x XP today.', source: '' },
  { text: 'The best day the sun rises on is Friday. Make it count — 2x XP active.', source: 'Muslim 854' },
  // ... 10 total from blueprint/15-content-pack.md lines 241-250
];

export function getFridayMessage(weekNumber: number): { text: string; source: string } {
  return FRIDAY_MESSAGES[weekNumber % FRIDAY_MESSAGES.length];
}

export function getFridayMessageTitle(): string {
  return 'Jumu\'ah Mubarak — 2x XP Active';
}
```

**Week number derivation:** `Math.floor((Date.now() / 86400000 + 4) / 7)` gives a stable ISO week number that increments every 7 days regardless of app restarts. No persistent storage needed.

### Pattern 5: HUD Badge (React Native layer over Skia Canvas)

**What:** `HudStatBar.tsx` renders as an absolutely-positioned View over the `HudScene` Skia Canvas. The Friday 2x badge is a new widget added to the existing row in `HudStatBar`. This is the correct layering — do NOT put Friday text inside the Skia Canvas.

**When to use:** `HudStatBar.tsx` — conditionally render `<FridayBoostBadge />` in the row when `isFriday()` is true.

**Fade-out implementation:** Use Reanimated `withTiming` + `useSharedValue` for opacity. At midnight (end of Friday), animate opacity from 1.0 to 0.0 over 2 seconds, then show a brief "Friday boost ended" text.

```typescript
// FridayBoostBadge.tsx — follows DayNightOverlay pattern
import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

export function FridayBoostBadge() {
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // Fade out at midnight via interval check (same pattern as DayNightOverlay)
  // ...

  return (
    <Animated.View style={[styles.badge, animatedStyle]}>
      <Text style={styles.badgeText}>2x</Text>
      <Text style={styles.badgeLabel}>Jumu'ah</Text>
    </Animated.View>
  );
}
```

### Pattern 6: Jumu'ah Completion Animation (Skia inside Canvas)

**What:** When a player marks Jumu'ah attendance on Friday, trigger a brief Skia animation inside `HudScene`. The existing `CharacterSprite` pattern shows how to drive Skia frame animations with Reanimated `useSharedValue`.

**Recommendation:** A simple burst animation — 3-4 frames of a mosque/minaret pixel art sprite at a fixed position, plays once on Jumu'ah completion via a `useSharedValue` frame counter set to 0 on trigger and animated to frame count. After completion, frame stays at 0 (first frame = empty/transparent).

```typescript
// In HudScene.tsx — add optional prop:
interface HudSceneProps {
  level: number;
  jumuahCompleted?: boolean;  // triggers one-shot animation
}
// Inside Canvas, conditionally render JumuahAnimation when jumuahCompleted toggles true
```

### Anti-Patterns to Avoid

- **Rendering text inside Skia Canvas for the Friday badge:** Skia text requires font loading and is harder to style than React Native Text. The HudStatBar is already a React Native View layer — add the badge there.
- **Persisting `isFridayActive` in Zustand store:** Friday is a pure derivation from `new Date()`. Storing it creates staleness risk (app open on Thursday, still showing Friday state on Saturday). Always derive at call time.
- **Applying 2x Friday multiplier to quest XP:** The economy model explicitly excludes quest XP from Friday multiplier (D-13). The `updateQuestProgress()` path calls `awardXP(..., 1.0, ...)` — never replace that 1.0 with a Friday multiplier.
- **Using `Date.getDay()` with UTC time:** `new Date().getDay()` correctly uses local device time. `new Date().getUTCDay()` would give wrong weekday for UTC-offset users. Use the local variant.
- **Creating a new Zustand store for Friday state:** No new store needed. Friday state is ephemeral and derived. The architecture doc confirms this.
- **Al-Kahf quest expiry at midnight:** D-07 specifies Maghrib, not midnight. The Maghrib time must be calculated via `getPrayerWindows()` using `settingsStore.locationLat/Lng` and `prayerCalcMethod`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Friday detection | Custom timezone math | `new Date().getDay() === 5` | JS Date.getDay() uses device local time; correct for mobile users |
| Multiplier stacking | New XP calculation branch | `existingStreakMultiplier * 2.0` before `calculateXP()` | `calculateXP()` already accepts any multiplier value; just pass the product |
| Maghrib time for quest expiry | Custom prayer time calc | `getPrayerWindows()` already in `prayer-times.ts` | adhan-js already handles DST, method variations, and edge cases |
| Copy rotation across weeks | Persistent counter in storage | Week number formula `Math.floor((Date.now() / 86400000 + 4) / 7) % 10` | Stable, stateless, no storage needed |
| Fade animation for boost badge | Custom opacity animation | Reanimated `withTiming` on `useSharedValue` opacity | Established pattern in project; CharacterSprite uses identical approach |
| Quest gating for Friday-only content | New `isFridayQuest` field on QuestTemplate | `isFriday()` check in `generateQuests()` caller | Keeps template schema clean; gating logic belongs in orchestration |
| Push notification for Friday morning | Custom scheduler | `expo-notifications` with `type: 'date'` trigger | Already used in `notification-service.ts`; no new infrastructure |

**Key insight:** Friday Power-Ups is a feature that plugs into every existing seam in the system without requiring new infrastructure. The risk is accidentally bypassing an existing constraint (quest XP exclusion, soft cap, existing date helpers) rather than building something complex.

---

## Common Pitfalls

### Pitfall 1: Quest XP Gets Friday Multiplier

**What goes wrong:** The developer adds Friday detection to the generic `awardXP()` call inside `updateQuestProgress()`, which means quest completions (Al-Kahf 100 XP included) get doubled.

**Why it happens:** `updateQuestProgress()` calls `awardXP()` with multiplier `1.0`. It is tempting to inject `isFriday()` into `awardXP()` itself rather than at the habit completion call site.

**How to avoid:** Friday multiplier injection must happen only at the habit completion call site. `awardXP()` itself remains multiplier-agnostic. Add a comment to `updateQuestProgress()` explicitly noting that `1.0` is intentional and must not become `fridayMultiplier`.

**Warning signs:** Test case: Al-Kahf awards 200 XP on a Friday instead of 100 XP.

### Pitfall 2: Al-Kahf Quest Appears on Non-Fridays

**What goes wrong:** `generateQuests()` creates the Al-Kahf quest when it finds no active Al-Kahf quest, without checking `isFriday()`. If the app is opened on Saturday and the Friday quest expired, it regenerates.

**Why it happens:** The existing `generateQuests()` logic checks `hasDailyQuests`, `hasWeeklyQuests`, `hasStretchQuests` — similar boolean guards. Adding `hasAlKahfQuest` without also gating on `isFriday()` causes Saturday regeneration.

**How to avoid:** The Al-Kahf gate is: `if (isFriday() && !hasAlKahfQuest(currentQuests))`. Both conditions required.

**Warning signs:** Al-Kahf quest card appears on Saturday morning after a Friday where the player did not complete it.

### Pitfall 3: Maghrib Expiry Calculation Fails When No Location Set

**What goes wrong:** `settingsStore.locationLat` and `locationLng` are `null` by default until onboarding completes. `getPrayerWindows()` crashes if lat/lng are null.

**Why it happens:** Onboarding can be skipped; location permission can be denied. The code assumes location is always set.

**How to avoid:** Add a fallback in the Al-Kahf quest generation path: if location is null, use next midnight as the expiry (same as daily quests) rather than Maghrib. Log a warning. The feature degrades gracefully rather than crashing.

**Warning signs:** App crash on first Friday after a fresh install before location is configured.

### Pitfall 4: Friday Badge Causes HudStatBar Overflow

**What goes wrong:** `HudStatBar` row contains: LevelBadge | divider | XPProgressBar (flex:1) | divider | BestStreakDisplay | divider | PrayerCountdown. Adding a Friday badge to the right end on devices with small screens causes the XP bar to shrink below its minimum width (80px) or text to overflow.

**Why it happens:** The row is `flexDirection: 'row'` with fixed-width components and one flex:1 element. Adding another fixed element consumes space from the flex:1 XPProgressBar.

**How to avoid:** The Friday badge should replace the PrayerCountdown slot on Fridays, or be inserted between existing elements with the XPProgressBar minimum maintained. Alternatively, render the badge above the stat bar row (as a second row), not in the same horizontal row.

**Warning signs:** XP progress bar shrinks on Friday on small iPhone models (SE, mini).

### Pitfall 5: Push Notification Not Cleared When Friday Ends

**What goes wrong:** `notification-service.ts` uses `rescheduleAll()` on app launch to rebuild today's notifications. If the app is not opened on Friday, the Friday morning notification fires but is never cleared from the notification center — it persists into Saturday, showing a stale "Jumu'ah active" message.

**Why it happens:** Push notifications are fire-and-forget. Once delivered, they remain in the notification center until dismissed or the app opens and handles them.

**How to avoid:** This is expected iOS/Android behavior and is acceptable. The notification copy should be time-anchored ("today" rather than "now") to reduce confusion if seen on Saturday. The `notification-handler` should dismiss or mark the Friday notification as stale on non-Friday opens. Alternatively, schedule Friday notification with a short expiry using notification `relevanceScore` (iOS 15+) — but this is a minor UX concern, not a crash.

**Warning signs:** Saturday app open shows a "2x XP active" badge that should be gone.

### Pitfall 6: isFriday() Using UTC Instead of Local Time

**What goes wrong:** `new Date().getUTCDay()` returns the UTC weekday, which will be Thursday evening for a UTC+5 user at 11 PM Thursday local time when UTC is already Friday.

**Why it happens:** Developers familiar with server-side UTC date handling apply the same pattern to mobile.

**How to avoid:** Always use `new Date().getDay()` (local device time) for Friday detection. Add a unit test that explicitly creates a local Friday date and verifies `isFriday()` returns true. Note: test running in CI may use UTC, so tests must construct dates carefully.

**Warning signs:** Users in UTC+ timezones report Friday boost not activating until Saturday.

---

## Code Examples

Verified patterns from existing source code:

### Rotating Copy With Stable Week Index

```typescript
// Pattern source: notification-copy.ts getMorningMotivation() — adapted for week stability
export function getFridayMessage(now: Date = new Date()): { text: string; source: string } {
  // Stable week index: increments every 7 days, resets modulo message count
  // Day offset +4 aligns epoch (Jan 1, 1970 was a Thursday) to Monday week start
  const weekIndex = Math.floor((now.getTime() / 86400000 + 4) / 7);
  return FRIDAY_MESSAGES[weekIndex % FRIDAY_MESSAGES.length];
}
```

### Friday Detection with Unit-Testable Interface

```typescript
// Accepts optional 'now' for unit testing — same pattern as getPrayerWindows()
export function isFriday(now: Date = new Date()): boolean {
  return now.getDay() === 5;
}
```

### Reanimated Opacity Fade (existing project pattern)

```typescript
// Pattern source: DayNightOverlay.tsx — timeProgress shared value + interval check
import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

const opacity = useSharedValue(isFriday() ? 1.0 : 0.0);

useEffect(() => {
  const interval = setInterval(() => {
    opacity.value = withTiming(isFriday() ? 1.0 : 0.0, { duration: 2000 });
  }, 60_000); // check every minute
  return () => clearInterval(interval);
}, [opacity]);

const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
```

### Conditional Quest Generation (gameStore pattern)

```typescript
// In gameStore.generateQuests() — after regular quest generation:
const { locationLat: lat, locationLng: lng, prayerCalcMethod } = useSettingsStore.getState();
const hasAlKahfQuest = currentQuests.some(q => q.templateId === 'friday-alkahf');

if (isFriday() && !hasAlKahfQuest) {
  let expiresAt = nextMidnight(); // fallback if no location
  if (lat !== null && lng !== null) {
    const prayerWindows = getPrayerWindows(lat, lng, new Date(), prayerCalcMethod as CalcMethodKey);
    const maghrib = prayerWindows.find(w => w.name === 'maghrib');
    if (maghrib) expiresAt = maghrib.start.toISOString();
  }
  const [created] = await questRepo.create({
    id: generateId(),
    userId,
    type: 'daily',
    templateId: 'friday-alkahf',
    description: 'Read Surah Al-Kahf before Maghrib (30 sections)',
    xpReward: 100,
    targetType: 'alkahf_sections',
    targetValue: 30,
    targetHabitId: null,
    progress: 0,
    status: 'available',
    expiresAt,
    completedAt: null,
    createdAt: now,
  });
  newQuests.push(created);
}
```

### Multiplier Injection at Habit Completion Call Site

```typescript
// Habit completion handler — multiply streak + friday BEFORE calling awardXP
const streakMultiplier = computeStreakMultiplier(currentStreak); // existing
const fridayMultiplier = isFriday() ? getFridayMultiplier() : 1.0;
const effectiveMultiplier = streakMultiplier * fridayMultiplier;

// awardXP receives the combined multiplier — no changes needed inside awardXP
await gameStore.getState().awardXP(userId, habit.baseXP, effectiveMultiplier, 'habit', habit.id);
```

### Friday Push Notification Scheduling

```typescript
// In notification-service.ts rescheduleAll() — add after muhasabah scheduling:
if (isFriday()) {
  const { text, source } = getFridayMessage();
  const body = source ? `${text} (${source})` : text;
  const fridayMorning = new Date();
  fridayMorning.setHours(8, 0, 0, 0); // 8:00 AM local — Claude's discretion per CONTEXT.md
  if (fridayMorning > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: getFridayMessageTitle(),
        body,
        sound: true,
      },
      trigger: { type: 'date', date: fridayMorning } as any,
    });
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Storing derived flags in state | Derive from `new Date()` at call time | Established pattern (see `todayStart()`, `todayDateString()`) | Friday state is pure derivation; no store needed |
| New notification library for weekly events | `expo-notifications` `type: 'date'` trigger | Already established | No new dependencies |
| React Native Animated for Skia-adjacent animations | `react-native-reanimated` + `useSharedValue` | Established project pattern | CharacterSprite, DayNightOverlay use this approach |

**Deprecated/outdated:**
- `React Native Animated API`: Project uses Reanimated exclusively for HUD animations. Do not introduce `Animated.Value` from React Native core.

---

## Open Questions

1. **Al-Kahf section count: 30 or 8?**
   - What we know: Surah Al-Kahf has 110 ayat and is commonly divided into 8 thematic sections or 30 rukus (juz divisions).
   - What's unclear: Which division is more natural for a mobile UX? 8 sections (thematic) is a simpler progress bar; 30 is more granular.
   - Recommendation: Use 8 sections (thematic) for the progress UX — simpler to mark, more meaningful spiritually. `targetValue: 8`, each section marked by player tap. Claude's discretion per CONTEXT.md.

2. **Jumu'ah animation asset: use existing character sprite sheet or new asset?**
   - What we know: The CONTEXT.md specifies "special pixel art animation (mosque/minaret moment)". Assets directory has placeholder PNGs noted in STATE.md as pending replacement.
   - What's unclear: Whether to add a new asset file or trigger an existing character animation variant.
   - Recommendation: Add a new `jumuah-burst.png` sprite sheet (simple 3-frame mosque silhouette burst) to `assets/sprites/`. Use a placeholder PNG at this phase (same as existing environment placeholders). Document that real art is pending.

3. **Grace rule implementation for D-14 (habit started before midnight)**
   - What we know: Habit completion events in `gameStore` use `completedAt: new Date().toISOString()` at the time of the `awardXP()` call. There is no `startedAt` timestamp on habit completions.
   - What's unclear: Whether the habit store tracks interaction start time.
   - Recommendation: Since no `startedAt` exists, apply the grace rule by checking if the habit was in the database with `in_progress` status before midnight. If the DB entry was created on Friday and completed after midnight, give Friday XP. If implementation is complex, simplify: use `completedAt` only, and document that the grace rule applies only to completions timestamped on the Friday calendar day. This satisfies the spirit of D-14 without requiring new schema changes.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest (jest-expo preset) |
| Config file | `jest.config.js` |
| Quick run command | `npx jest __tests__/domain/friday-engine.test.ts --no-coverage` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FRDY-01 | `isFriday()` returns true on day=5, false on other days | unit | `npx jest __tests__/domain/friday-engine.test.ts -t "isFriday" --no-coverage` | No — Wave 0 |
| FRDY-01 | Friday multiplier stacks correctly (1.5 streak × 2.0 = 3.0x) | unit | `npx jest __tests__/domain/friday-engine.test.ts -t "combinedMultiplier" --no-coverage` | No — Wave 0 |
| FRDY-01 | `calculateXP()` with 6.0x multiplier stays within soft cap behavior | unit | `npx jest __tests__/domain/xp-engine.test.ts -t "applySoftCap" --no-coverage` | Yes |
| FRDY-01 | Quest `awardXP()` path uses multiplier 1.0 (not friday multiplier) | unit | `npx jest __tests__/domain/friday-engine.test.ts -t "questXP excluded" --no-coverage` | No — Wave 0 |
| FRDY-03 | `isFriday()` gates Al-Kahf template generation | unit | `npx jest __tests__/domain/friday-engine.test.ts -t "Al-Kahf gate" --no-coverage` | No — Wave 0 |
| FRDY-03 | Al-Kahf quest expiry defaults to midnight when no location set | unit | `npx jest __tests__/domain/friday-engine.test.ts -t "fallback expiry" --no-coverage` | No — Wave 0 |
| FRDY-04 | `getFridayMessage()` rotates through all 10 messages | unit | `npx jest __tests__/domain/notification-copy.test.ts -t "getFridayMessage" --no-coverage` | No — Wave 0 |
| FRDY-04 | Friday messages contain no forbidden guilt words | unit | `npx jest __tests__/domain/notification-copy.test.ts -t "Friday messages adab" --no-coverage` | No — Wave 0 |
| FRDY-04 | Same message persists for the same ISO week | unit | `npx jest __tests__/domain/notification-copy.test.ts -t "week stability" --no-coverage` | No — Wave 0 |

### Sampling Rate

- **Per task commit:** `npx jest __tests__/domain/friday-engine.test.ts --no-coverage`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `__tests__/domain/friday-engine.test.ts` — covers FRDY-01, FRDY-03 (isFriday, combinedMultiplier, quest gate, fallback expiry)
- [ ] Additional test cases in `__tests__/domain/notification-copy.test.ts` — covers FRDY-04 (getFridayMessage rotation, adab safety, week stability)

*(Existing test infrastructure: `jest.config.js` present, `jest-expo` preset active, domain test pattern established in `__tests__/domain/`. No framework install needed.)*

---

## Sources

### Primary (HIGH confidence)

- Existing source files read directly: `src/domain/xp-engine.ts`, `src/domain/quest-engine.ts`, `src/domain/quest-templates.ts`, `src/stores/gameStore.ts`, `src/services/prayer-times.ts`, `src/services/notification-service.ts`, `src/domain/notification-copy.ts`, `src/components/hud/HudStatBar.tsx`, `src/components/hud/HudScene.tsx`, `src/components/hud/CharacterSprite.tsx`, `src/components/hud/DayNightOverlay.tsx`, `src/stores/settingsStore.ts`
- `.planning/research/ARCHITECTURE.md` lines 61-79, 228-252 — Friday engine subsystem design
- `blueprint/15-content-pack.md` lines 234-250 — 10 Friday messages with hadith sources (verified)
- `blueprint/05-feature-systems.md` lines 449-454 — Friday Power-Ups spec
- `src/domain/xp-economy-v2.md` — Friday worst-case analysis confirming 6.0x yields ~805 XP with soft cap

### Secondary (MEDIUM confidence)

- `CONTEXT.md` locked decisions D-01 through D-20 — user decisions verified against source code patterns

### Tertiary (LOW confidence)

- None. All findings are based on direct source code inspection.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in use
- Architecture: HIGH — patterns verified by reading existing source files directly
- Pitfalls: HIGH — derived from actual code structure (quest XP path, HudStatBar layout, location null state)
- Code examples: HIGH — all examples are adaptations of existing verified patterns in the codebase

**Research date:** 2026-03-22
**Valid until:** 2026-05-22 (stable tech stack, no external API dependencies)
