# Phase 3: Core Habit Loop - Research

**Researched:** 2026-03-09
**Domain:** Habit tracking, Islamic prayer time calculation, streak/recovery mechanics, React Native UI
**Confidence:** HIGH

## Summary

Phase 3 builds the product's core value loop: creating Islamic habits (preset + custom), completing them with satisfying feedback, calculating prayer time windows via adhan-js, tracking streaks, and recovering compassionately through Mercy Mode. The foundation from Phase 2 provides a solid base -- schema, repos, stores, tokens, and privacy gate are all in place. The primary new dependencies are `adhan` (prayer times), `expo-location` (coordinates), and `expo-haptics` (completion feedback). Reanimated is needed for animations but requires careful version selection given the Expo Go constraint.

The architecture follows the established DAO/repository pattern: new repos for completions and streaks, a pure-TypeScript prayer time service, domain logic in the habit store, and React Native screens consuming store state. All completion and streak data is PRIVATE (device-only) per the Privacy Gate.

**Primary recommendation:** Build data layer first (repos + services), then screens, then animations/polish. Prayer time service should be a pure function wrapper around adhan-js that takes coordinates + method + date and returns typed prayer windows. Streak and Mercy Mode logic should be pure TypeScript functions with no React dependencies, making them fully unit-testable.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Stacked card layout for habit list with icon, name, time window, streak count, tap-to-complete
- Completion feedback: jewel-tone glow burst, checkmark stamp with scale animation, streak tick-up, haptic pulse
- Completed cards dimmed with checkmark, sink to bottom; uncompleted stay at top
- Daily progress summary at top: "3 of 7 complete" with jewel-tone progress bar
- Salah habits always in chronological prayer time order (Fajr -> Isha) at top; non-salah below in user-set order
- Preset library: ~15 presets in categories (Salah 5, Quran 2, Dhikr 2, Dua 1, Fasting 2, Character 3)
- Salah prayers individually selectable (not all-or-nothing)
- Salah cards show time window with status badges: Active (within window), Upcoming (next prayer), Passed (window ended)
- Salah habits completable anytime (no locking), but Streak Shield XP bonus only within window
- Location: auto-detect with permission on first salah add, manual city search as fallback
- Mercy Mode per-habit (not global), triggers on streak break
- Mercy Mode banner: "Your momentum paused. The door of tawbah is always open." with "Begin Recovery"
- Recovery path: 3 consecutive days -> 25% of pre-break streak restored
- "Start fresh" option (reset to 0) always available, presented as equally valid
- Prayer calculation method selectable (ISNA, MWL, Egyptian, etc.)

### Claude's Discretion
- Custom habit creation form details (fields, validation, complexity level)
- Loading/empty states for habit list
- Exact animations (Reanimated specifics) for completion burst and card reordering
- Calendar/heatmap view design for habit history (HBIT-06)
- Edit/archive habit flow details (HBIT-05)
- Streak display design on individual habit cards
- Prayer calculation method selection UI placement

### Deferred Ideas (OUT OF SCOPE)
- Voice pack system (changeable app personality) -- Phase 6 or future
- Arabic terminology toggle -- Phase 6 settings
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HBIT-01 | Create habits from preset Islamic library | Preset data structure, creation flow, habitRepo.create |
| HBIT-02 | Create custom habits with name, frequency, time window | Custom form fields, validation, frequency types |
| HBIT-03 | Complete habit with single-tap check-in | completionRepo, streak update, haptic feedback, Reanimated animation |
| HBIT-04 | View daily habit list with completion status | Habit list screen, sorting logic (salah first), progress bar |
| HBIT-05 | Edit or archive habits | Edit form, archive flow, habitRepo.update/archive |
| HBIT-06 | View habit history in calendar/heatmap | Calendar component, completionRepo date queries |
| PRAY-01 | Calculate prayer times locally using adhan | adhan-js library, PrayerTimes API, Coordinates |
| PRAY-02 | Select calculation method (ISNA, MWL, Egyptian, etc.) | CalculationMethod enum, settings store integration |
| PRAY-03 | Display contextual time windows on salah habits | Prayer time service, status badges (Active/Upcoming/Passed) |
| PRAY-04 | Prayer time notifications before salah window | expo-notifications scheduling (NOTE: likely Phase 6 scope -- notifications infrastructure) |
| STRK-01 | View streak count per habit and overall | Streak repo, streak display on cards, aggregate calculation |
| STRK-02 | Salah Streak Shield protects when completed within window | Time window check in completion logic, XP tier differentiation |
| STRK-03 | Mercy Mode activates on streak break with compassionate recovery | Streak break detection, banner UI, adab-safe copy |
| STRK-04 | Recover streak through Mercy Mode completion tasks | 3-day recovery tracker, 25% streak restoration logic |
| STRK-05 | Streak display frames consistency as "momentum" not "perfection" | Copy and UI design -- "momentum" language throughout |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| adhan | 4.4.3 | Islamic prayer time calculation | Only serious prayer time library for JS; high-precision astronomical algorithms from "Astronomical Algorithms" by Jean Meeus; MIT license; used by major Muslim apps |
| expo-location | ~18.x (SDK 54 compatible) | Get user GPS coordinates for prayer times | Expo SDK built-in; works with Expo Go; handles permissions cross-platform |
| expo-haptics | ~14.x (SDK 54 compatible) | Haptic feedback on habit completion | Expo SDK built-in; works with Expo Go; simple API (selectionAsync, impactAsync, notificationAsync) |
| react-native-reanimated | 4.1.x | Layout animations for card completion/reordering | Required for 60fps animations; SDK 54 ships with Reanimated 4.x in Expo Go |
| drizzle-orm | 0.45.1 (installed) | Typed SQL for completion and streak repos | Already in use from Phase 2 |
| zustand | 5.0.11 (installed) | State management for habit/completion/streak state | Already in use from Phase 2 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-notifications | ~0.32.x (SDK 54) | Prayer time reminders (PRAY-04) | NOTE: Full notification infrastructure is Phase 6. For Phase 3, only schedule local notifications for prayer times if time permits; otherwise defer to Phase 6. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| adhan | praytimes.org JS lib | adhan is actively maintained with TypeScript types, praytimes is older with no npm package |
| expo-location | react-native-geolocation | expo-location works with Expo Go, RN geolocation requires native module |
| Reanimated layout animations | LayoutAnimation (RN built-in) | LayoutAnimation is simpler but less control; Reanimated supports entering/exiting per-item |

**Installation:**
```bash
npx expo install adhan expo-location expo-haptics react-native-reanimated
```

**Important Reanimated note for SDK 54 + Expo Go:** Expo Go for SDK 54 ships with Reanimated pre-compiled. Use `npx expo install` (not npm install) to get the Expo-compatible version. The babel plugin is handled automatically by `babel-preset-expo` in SDK 54 -- do NOT manually add `react-native-reanimated/plugin` or `react-native-worklets/plugin` to babel.config.js.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── db/
│   └── repos/
│       ├── habitRepo.ts          # (exists) habit CRUD
│       ├── completionRepo.ts     # NEW: habit completion CRUD + date queries
│       ├── streakRepo.ts         # NEW: streak CRUD + break detection
│       └── index.ts              # re-export all repos
├── services/
│   ├── privacy-gate.ts           # (exists)
│   ├── prayer-times.ts           # NEW: adhan-js wrapper service
│   └── location.ts               # NEW: expo-location wrapper
├── stores/
│   ├── habitStore.ts             # (exists, extend with completions/streaks)
│   └── settingsStore.ts          # (exists, extend with location)
├── domain/
│   ├── presets.ts                # NEW: Islamic habit preset definitions
│   ├── streak-engine.ts         # NEW: pure streak logic (break detection, mercy mode, recovery)
│   └── habit-sorter.ts          # NEW: sorting logic (salah chronological, then user order)
├── components/
│   ├── habits/
│   │   ├── HabitCard.tsx         # NEW: individual habit card with status
│   │   ├── HabitList.tsx         # NEW: sorted list with progress bar
│   │   ├── PresetLibrary.tsx     # NEW: categorized preset selection
│   │   ├── CustomHabitForm.tsx   # NEW: create/edit custom habit
│   │   ├── CompletionBurst.tsx   # NEW: animated completion feedback
│   │   └── MercyModeBanner.tsx   # NEW: streak break recovery UI
│   ├── prayer/
│   │   ├── PrayerTimeWindow.tsx  # NEW: time window badge display
│   │   └── CalcMethodPicker.tsx  # NEW: calculation method selector
│   └── calendar/
│       └── HabitCalendar.tsx     # NEW: calendar/heatmap for HBIT-06
└── types/
    ├── database.ts               # (exists) Drizzle-inferred types
    └── habits.ts                 # NEW: domain types (PresetHabit, PrayerWindow, MercyModeState)
```

### Pattern 1: Pure Domain Logic (streak-engine)
**What:** All streak calculation, break detection, and Mercy Mode logic lives in pure TypeScript functions with no React or database imports.
**When to use:** Any business logic that can be expressed as `(input) => output`.
**Example:**
```typescript
// src/domain/streak-engine.ts
// Pure functions -- no React, no DB, fully testable

export interface StreakState {
  currentCount: number;
  longestCount: number;
  multiplier: number;
  lastCompletedAt: string | null;
  isRebuilt: boolean;
  mercyMode?: MercyModeState;
}

export interface MercyModeState {
  active: boolean;
  recoveryDay: number; // 0-3 (0 = not started)
  preBreakStreak: number;
}

export function processCompletion(
  streak: StreakState,
  completedAt: string,
  dayBoundary: string // midnight local time ISO
): StreakState {
  const isConsecutive = isNextDay(streak.lastCompletedAt, completedAt, dayBoundary);
  const newCount = isConsecutive ? streak.currentCount + 1 : 1;
  const newMultiplier = Math.min(1.0 + (newCount - 1) * 0.1, 3.0);

  return {
    currentCount: newCount,
    longestCount: Math.max(newCount, streak.longestCount),
    multiplier: newMultiplier,
    lastCompletedAt: completedAt,
    isRebuilt: false,
  };
}

export function detectStreakBreak(
  streak: StreakState,
  currentDate: string,
  dayBoundary: string
): { broken: boolean; mercyMode: MercyModeState } {
  // Streak is broken if last completion was more than 1 day ago
  // Returns MercyModeState with preBreakStreak for recovery
}

export function processRecovery(
  mercy: MercyModeState,
  day: number // 1, 2, or 3
): { complete: boolean; restoredStreak: number } {
  if (day >= 3) {
    return {
      complete: true,
      restoredStreak: Math.floor(mercy.preBreakStreak * 0.25),
    };
  }
  return { complete: false, restoredStreak: 0 };
}
```

### Pattern 2: Service Layer (prayer-times)
**What:** Thin wrapper around adhan-js that provides app-specific types and handles timezone conversion.
**When to use:** External library integration.
**Example:**
```typescript
// src/services/prayer-times.ts
import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from 'adhan';

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerWindow {
  name: PrayerName;
  displayName: string;
  start: Date;
  end: Date;  // next prayer's start time
  status: 'active' | 'upcoming' | 'passed';
}

export type CalcMethodKey = 'ISNA' | 'MWL' | 'Egyptian' | 'Karachi' | 'UmmAlQura' | 'MoonsightingCommittee';

const CALC_METHOD_MAP: Record<CalcMethodKey, () => any> = {
  ISNA: () => CalculationMethod.NorthAmerica(),
  MWL: () => CalculationMethod.MuslimWorldLeague(),
  Egyptian: () => CalculationMethod.Egyptian(),
  Karachi: () => CalculationMethod.Karachi(),
  UmmAlQura: () => CalculationMethod.UmmAlQura(),
  MoonsightingCommittee: () => CalculationMethod.MoonsightingCommittee(),
};

export function getPrayerWindows(
  lat: number,
  lng: number,
  date: Date,
  method: CalcMethodKey
): PrayerWindow[] {
  const coords = new Coordinates(lat, lng);
  const params = CALC_METHOD_MAP[method]();
  const times = new PrayerTimes(coords, date, params);

  // Build windows from consecutive prayer times
  const prayers: { name: PrayerName; displayName: string; time: Date }[] = [
    { name: 'fajr', displayName: 'Fajr', time: times.fajr },
    { name: 'dhuhr', displayName: 'Dhuhr', time: times.dhuhr },
    { name: 'asr', displayName: 'Asr', time: times.asr },
    { name: 'maghrib', displayName: 'Maghrib', time: times.maghrib },
    { name: 'isha', displayName: 'Isha', time: times.isha },
  ];

  const now = new Date();
  return prayers.map((p, i) => {
    const end = i < prayers.length - 1 ? prayers[i + 1].time : getNextFajr(lat, lng, date, method);
    const status: PrayerWindow['status'] =
      now >= p.time && now < end ? 'active' :
      now < p.time ? 'upcoming' : 'passed';
    return { ...p, start: p.time, end, status };
  });
}
```

### Pattern 3: Store Extension (habitStore)
**What:** Extend the existing habitStore to include completion tracking, streak state, and daily view data.
**When to use:** Adding domain state that components consume.
**Example:**
```typescript
// Extend habitStore with completion and streak methods
interface HabitState {
  // ... existing fields ...
  completions: Record<string, HabitCompletion[]>; // keyed by date string
  streaks: Record<string, StreakState>;            // keyed by habitId
  mercyModes: Record<string, MercyModeState>;     // keyed by habitId

  completeHabit: (habitId: string, userId: string) => Promise<void>;
  loadDailyState: (userId: string, date: string) => Promise<void>;
  startRecovery: (habitId: string) => Promise<void>;
  resetStreak: (habitId: string) => Promise<void>;
}
```

### Anti-Patterns to Avoid
- **Business logic in components:** Streak calculation, break detection, prayer time computation must NOT live in React components. Use domain/ and services/ layers.
- **Storing derived state:** Don't store "is completed today" in the database. Derive it from completions table + current date.
- **Global Mercy Mode:** Mercy Mode is PER-HABIT. Missing Fajr does not affect Quran reading streak.
- **Locking salah completion to time windows:** Users can complete salah anytime. Time window only affects XP tier (Streak Shield bonus). Never prevent completion.
- **Shame language anywhere:** "You missed X" is forbidden. "Your momentum paused" is the pattern. Review all copy against adab safety rails.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Prayer time calculation | Custom astronomical algorithms | adhan-js | Solar position math has edge cases at extreme latitudes, DST transitions, leap seconds |
| Location permissions | Manual permission checks per platform | expo-location requestForegroundPermissionsAsync | Handles iOS/Android permission dialogs, settings deep-links, denial states |
| Haptic feedback | Vibration API calls | expo-haptics | Abstracts iOS Taptic Engine vs Android vibration; respects system haptic settings |
| Date/time zones | Manual UTC offset math | Date objects from adhan-js (UTC-based) + Intl.DateTimeFormat for display | Timezone math is notoriously error-prone; adhan already returns UTC Date objects |
| Layout animations | Manual translateY/opacity with Animated API | Reanimated entering/exiting + layout animations | Per-item animations with proper cleanup, gesture handler integration |
| Calendar/heatmap | Custom grid layout with date math | Consider react-native-calendars or build simple grid | Date edge cases (month boundaries, leap years) are deceptively complex |

**Key insight:** Prayer time calculation is the most dangerous hand-roll. The Islamic community has specific expectations for accuracy (within 1-2 minutes) and adhan-js is the established standard with extensive testing.

## Common Pitfalls

### Pitfall 1: Timezone Confusion with Prayer Times
**What goes wrong:** Prayer times calculated in UTC but displayed without conversion, showing wrong times.
**Why it happens:** adhan-js returns Date objects in UTC. Developers forget to format for local timezone.
**How to avoid:** Always use `Intl.DateTimeFormat` or `toLocaleTimeString()` for display. Store raw UTC Date objects for comparison logic.
**Warning signs:** Prayer times off by several hours during testing.

### Pitfall 2: Day Boundary Edge Cases
**What goes wrong:** Completion at 11:59 PM counted for wrong day, or Isha window crossing midnight breaks streak logic.
**Why it happens:** Day boundary is midnight local time (per project decision), but Isha can extend past midnight.
**How to avoid:** Use a `getHabitDay(date: Date): string` function that returns YYYY-MM-DD in local time. All completion queries should use this normalized day string. For Isha, the prayer window extends past midnight but the completion still counts for the calendar day when the user tapped.
**Warning signs:** Streaks breaking incorrectly around midnight, duplicate completions.

### Pitfall 3: Location Permission Denial
**What goes wrong:** User denies location permission and app crashes or shows blank prayer times.
**Why it happens:** No fallback for denied permissions.
**How to avoid:** Always have manual city search as fallback (per CONTEXT.md decision). Show clear but non-pushy explanation of why location is needed. Cache last known location. Handle "denied" and "never ask again" states gracefully.
**Warning signs:** App crash on permission denial, no way to set location manually.

### Pitfall 4: Streak Multiplier Accumulation Bug
**What goes wrong:** Multiplier exceeds 3.0x cap, or resets incorrectly on same-day re-completion.
**Why it happens:** Completion logic doesn't check if habit was already completed today.
**How to avoid:** Before processing completion, check if habitId + today already has a completion record. If yes, ignore (idempotent). Cap multiplier at 3.0x in the pure function.
**Warning signs:** XP values growing unexpectedly, multiplier > 3.0.

### Pitfall 5: Mercy Mode State Corruption
**What goes wrong:** Recovery counter resets, or multiple Mercy Mode states active for same habit.
**Why it happens:** State not persisted correctly between app sessions, or streak break re-detected on next app open.
**How to avoid:** Persist Mercy Mode state in streaks table (isRebuilt, rebuiltAt columns exist). Use a dedicated `mercy_recovery_day` column or encode in a JSON field. Check for existing Mercy Mode state before creating new one.
**Warning signs:** Recovery progress lost after app restart, banner appearing for habits that are mid-recovery.

### Pitfall 6: Reanimated + Expo Go Plugin Conflicts
**What goes wrong:** Build crashes with "react-native-worklets" or "reanimated plugin" errors.
**Why it happens:** SDK 54 has Reanimated pre-bundled in Expo Go. Manually adding babel plugins causes conflicts.
**How to avoid:** Use `npx expo install react-native-reanimated` (not npm). Do NOT add any reanimated/worklets babel plugin -- `babel-preset-expo` handles it automatically in SDK 54.
**Warning signs:** Metro bundler crash mentioning "worklets", "plugin" errors on startup.

### Pitfall 7: Adab Safety Rail Violations in Copy
**What goes wrong:** Shame language slips into streak break messages, guilt-based framing in Mercy Mode.
**Why it happens:** Default habit-tracker patterns from secular apps creep in during implementation.
**How to avoid:** Review ALL user-facing strings against adab safety rails. Use the locked copy from CONTEXT.md. Never say "You missed X" or "You failed." Pattern: "Your momentum paused" / "The door of tawbah is always open."
**Warning signs:** Any copy mentioning "missed," "failed," "lost," "broke" in negative framing.

## Code Examples

### adhan-js Prayer Time Calculation
```typescript
// Source: adhan-js GitHub README + METHODS.md
import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from 'adhan';

const coordinates = new Coordinates(40.7128, -74.0060); // NYC
const params = CalculationMethod.NorthAmerica(); // ISNA method
const date = new Date();
const prayerTimes = new PrayerTimes(coordinates, date, params);

// Access individual prayer times (returns Date objects in UTC)
console.log(prayerTimes.fajr);    // Date
console.log(prayerTimes.sunrise); // Date
console.log(prayerTimes.dhuhr);   // Date
console.log(prayerTimes.asr);     // Date
console.log(prayerTimes.maghrib); // Date
console.log(prayerTimes.isha);    // Date

// Current and next prayer
const current = prayerTimes.currentPrayer();  // Prayer enum
const next = prayerTimes.nextPrayer();        // Prayer enum
const nextTime = prayerTimes.timeForPrayer(next); // Date
```

### Calculation Methods Available in adhan-js
```typescript
// All available built-in methods:
CalculationMethod.NorthAmerica()         // ISNA - Fajr 15, Isha 15
CalculationMethod.MuslimWorldLeague()    // MWL - Fajr 18, Isha 17
CalculationMethod.Egyptian()             // Egyptian General Authority - Fajr 19.5, Isha 17.5
CalculationMethod.Karachi()              // University of Islamic Sciences - Fajr 18, Isha 18
CalculationMethod.UmmAlQura()            // Umm al-Qura - Fajr 18.5, Isha 90min interval
CalculationMethod.MoonsightingCommittee() // Moonsighting Committee - seasonal adjustments
CalculationMethod.Dubai()                // UAE - Fajr 18.2, Isha 18.2
CalculationMethod.Qatar()                // Qatar - Fajr 18, Isha 90min
CalculationMethod.Kuwait()               // Kuwait - Fajr 18, Isha 17.5
CalculationMethod.Singapore()            // Singapore - Fajr 20, Isha 18
CalculationMethod.Tehran()               // Tehran - Fajr 17.7, Isha 14
CalculationMethod.Turkey()               // Turkey - Fajr 18, Isha 17
CalculationMethod.Other()                // Custom angles - defaults to 0

// Customization:
const params = CalculationMethod.NorthAmerica();
params.madhab = Madhab.Hanafi; // Changes Asr calculation
```

### expo-location Permission + Coordinates
```typescript
// Source: Expo documentation
import * as Location from 'expo-location';

async function getCoordinates(): Promise<{ lat: number; lng: number } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null; // Fall back to manual city search
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Low, // Low accuracy is fine for prayer times (city-level)
  });

  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
  };
}
```

### expo-haptics Completion Feedback
```typescript
// Source: Expo documentation
import * as Haptics from 'expo-haptics';

// On habit completion tap:
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// On streak milestone:
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Respect user settings:
const { hapticEnabled } = useSettingsStore(useShallow(s => ({ hapticEnabled: s.hapticEnabled })));
if (hapticEnabled) {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
```

### Reanimated Layout Animations for Card List
```typescript
// Source: Reanimated docs - entering/exiting animations
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

// Define animations outside component for performance
const enterAnimation = FadeIn.duration(300);
const exitAnimation = FadeOut.duration(200);

function HabitCard({ habit, onComplete }: Props) {
  return (
    <Animated.View
      entering={enterAnimation}
      exiting={exitAnimation}
      layout={Layout.springify()}
    >
      {/* Card content */}
    </Animated.View>
  );
}
```

### Completion Repository Pattern
```typescript
// Following established habitRepo pattern
import { eq, and, gte, lt } from 'drizzle-orm';
import { getDb } from '../client';
import { habitCompletions } from '../schema';

export const completionRepo = {
  async getForDate(habitId: string, dateStart: string, dateEnd: string) {
    const db = getDb();
    return db.select().from(habitCompletions)
      .where(and(
        eq(habitCompletions.habitId, habitId),
        gte(habitCompletions.completedAt, dateStart),
        lt(habitCompletions.completedAt, dateEnd),
      ));
  },

  async getForDateRange(habitId: string, startDate: string, endDate: string) {
    // For calendar/heatmap view
    const db = getDb();
    return db.select().from(habitCompletions)
      .where(and(
        eq(habitCompletions.habitId, habitId),
        gte(habitCompletions.completedAt, startDate),
        lt(habitCompletions.completedAt, endDate),
      ));
  },

  async create(data: NewHabitCompletion) {
    const db = getDb();
    return db.insert(habitCompletions).values(data).returning();
  },
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Expo Go for dev | Development builds recommended | Expo SDK 54+ | Expo Go works but is the last SDK to support old architecture; plan migration path |
| Reanimated v3 | Reanimated v4 with worklets | SDK 54 | v4 requires New Architecture; Expo Go ships compatible version |
| Manual prayer calc | adhan-js | Stable since v4.4.3 | De facto standard; no recent updates needed (astronomical algorithms are stable) |
| LayoutAnimation (RN) | Reanimated layout animations | 2023+ | Per-item control, entering/exiting, springify |

**Deprecated/outdated:**
- `react-native-reanimated/plugin` babel plugin: Replaced by `react-native-worklets/plugin` in Reanimated 4, but in SDK 54 with Expo Go, babel-preset-expo handles this automatically. Do NOT manually configure.

## Open Questions

1. **PRAY-04: Prayer Time Notifications**
   - What we know: expo-notifications can schedule local notifications; notification copy must be invitational ("Ready for Dhuhr?" not "You missed Dhuhr!")
   - What's unclear: Whether to implement notification scheduling in Phase 3 or defer to Phase 6 (Onboarding, Profile & Notifications). NOTF-01 through NOTF-04 are mapped to Phase 6 in ROADMAP.
   - Recommendation: Implement the prayer time calculation and display in Phase 3 (PRAY-01 to PRAY-03). Defer PRAY-04 notifications to Phase 6 where notification infrastructure is built. Add a TODO comment in the prayer time service.

2. **Reanimated Version in Expo Go**
   - What we know: SDK 54 is the last SDK supporting old architecture. Reanimated 4.x works in Expo Go SDK 54.
   - What's unclear: Exact pre-compiled Reanimated version in Expo Go SDK 54 binary.
   - Recommendation: Use `npx expo install react-native-reanimated` to get the exact compatible version. If layout animations cause issues in Expo Go, fall back to basic Animated API for Phase 3 and revisit when moving to development builds.

3. **Calendar/Heatmap Component for HBIT-06**
   - What we know: Need to show past completions in calendar or heatmap view.
   - What's unclear: Whether to use a library (react-native-calendars) or build a simple custom grid.
   - Recommendation: Build a simple custom calendar grid. The data model is straightforward (array of dates with completions). A custom grid avoids adding another dependency and can match the pixel aesthetic. Use a month-view grid with colored cells (jewel-tone green for completed days).

4. **Mercy Mode Persistence Schema**
   - What we know: Streaks table has isRebuilt and rebuiltAt columns. Mercy Mode needs recovery day tracking (day 1/2/3 of recovery).
   - What's unclear: Where to store recoveryDay and preBreakStreak values.
   - Recommendation: Add `mercyRecoveryDay` (integer, 0-3) and `preBreakStreak` (integer) columns to the streaks table via a new migration, OR store as a JSON blob in a new column. The migration approach is cleaner given Drizzle's typed schema.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest via jest-expo ~54.0.17 |
| Config file | jest.config.js |
| Quick run command | `npm test -- --testPathPattern="habits\|prayer\|streak" --no-coverage` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HBIT-01 | Create habit from preset library | unit | `npm test -- --testPathPattern="presets" -t "create from preset"` | No - Wave 0 |
| HBIT-02 | Create custom habit | unit | `npm test -- --testPathPattern="habits" -t "custom habit"` | No - Wave 0 |
| HBIT-03 | Complete habit single-tap | unit | `npm test -- --testPathPattern="completion" -t "complete habit"` | No - Wave 0 |
| HBIT-04 | View daily habit list | unit | `npm test -- --testPathPattern="habit-sorter" -t "sort"` | No - Wave 0 |
| HBIT-05 | Edit or archive habit | unit | `npm test -- --testPathPattern="habits" -t "archive"` | Partial - exists in stores.test.ts |
| HBIT-06 | Calendar/heatmap view | unit | `npm test -- --testPathPattern="completion" -t "date range"` | No - Wave 0 |
| PRAY-01 | Calculate prayer times | unit | `npm test -- --testPathPattern="prayer" -t "prayer times"` | No - Wave 0 |
| PRAY-02 | Select calculation method | unit | `npm test -- --testPathPattern="prayer" -t "calculation method"` | No - Wave 0 |
| PRAY-03 | Display time windows | unit | `npm test -- --testPathPattern="prayer" -t "window status"` | No - Wave 0 |
| PRAY-04 | Prayer notifications | manual-only | Manual test on device | N/A - defer to Phase 6 |
| STRK-01 | Streak count display | unit | `npm test -- --testPathPattern="streak" -t "streak count"` | No - Wave 0 |
| STRK-02 | Salah Streak Shield | unit | `npm test -- --testPathPattern="streak" -t "streak shield"` | No - Wave 0 |
| STRK-03 | Mercy Mode activation | unit | `npm test -- --testPathPattern="streak" -t "mercy mode"` | No - Wave 0 |
| STRK-04 | Mercy Mode recovery | unit | `npm test -- --testPathPattern="streak" -t "recovery"` | No - Wave 0 |
| STRK-05 | Momentum framing | manual-only | Copy review against adab rails | N/A |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="habits|prayer|streak" --no-coverage`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before /gsd:verify-work

### Wave 0 Gaps
- [ ] `__tests__/domain/streak-engine.test.ts` -- covers STRK-01, STRK-02, STRK-03, STRK-04
- [ ] `__tests__/domain/habit-sorter.test.ts` -- covers HBIT-04 sorting logic
- [ ] `__tests__/services/prayer-times.test.ts` -- covers PRAY-01, PRAY-02, PRAY-03
- [ ] `__tests__/db/completionRepo.test.ts` -- covers HBIT-03, HBIT-06 date queries
- [ ] `__tests__/domain/presets.test.ts` -- covers HBIT-01 preset definitions
- [ ] Install adhan as dev dep or mock for unit tests

## Sources

### Primary (HIGH confidence)
- [adhan-js GitHub](https://github.com/batoulapps/adhan-js) - API, calculation methods, usage patterns
- [Expo Location docs](https://docs.expo.dev/versions/latest/sdk/location/) - permissions, coordinates API
- [Expo Haptics docs](https://docs.expo.dev/versions/latest/sdk/haptics/) - feedback types, platform behavior
- [Reanimated entering/exiting docs](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/) - layout animation API
- [Expo SDK 54 changelog](https://expo.dev/changelog/sdk-54) - Reanimated compatibility, Expo Go status
- Existing codebase (schema.ts, habitRepo.ts, habitStore.ts, privacy-gate.ts) - established patterns

### Secondary (MEDIUM confidence)
- [Expo SDK 54 upgrade guide](https://expo.dev/blog/expo-sdk-upgrade-guide) - Reanimated 4 + babel plugin guidance
- [adhan-js METHODS.md](https://github.com/batoulapps/adhan-js/blob/master/METHODS.md) - full calculation method list with angle details
- [Libraries.io adhan](https://libraries.io/npm/adhan) - version 4.4.3, last published ~4 years ago (stable, not abandoned)

### Tertiary (LOW confidence)
- Reanimated 4.x exact behavior in Expo Go SDK 54 -- community reports vary; needs validation during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - adhan-js is the established standard, expo-location and expo-haptics are Expo built-ins, all work with Expo Go
- Architecture: HIGH - follows established Phase 2 patterns (repo layer, Zustand stores, pure domain logic)
- Pitfalls: HIGH - timezone issues, permission handling, and copy safety are well-documented problem areas
- Reanimated compatibility: MEDIUM - SDK 54 + Expo Go + Reanimated 4 is a known edge case; fallback plan documented

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable libraries, unlikely to change)
