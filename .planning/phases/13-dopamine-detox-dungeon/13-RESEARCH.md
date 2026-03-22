# Phase 13: Dopamine Detox Dungeon - Research

**Researched:** 2026-03-22
**Domain:** Timed session management, Expo background state, XP economy, Skia canvas theming, streak protection hooks, push notification scheduling
**Confidence:** HIGH

---

## Summary

Phase 13 builds the Dopamine Detox Dungeon — a voluntary timed challenge where the player commits to avoiding digital distractions for 2-8 hours, earns XP on completion, and has habit streaks protected during the active window. The schema (`detox_sessions`), types (`DetoxSession`/`NewDetoxSession`), XP source registration (`'detox_completion'`), and Privacy Gate classification (`LOCAL_ONLY`) are all already in place from Phase 11. No new npm packages are required.

The phase introduces four new code units: `detoxRepo` (data access), `detox-engine` (pure TypeScript domain logic), `detoxStore` (Zustand orchestration), and a suite of UI components layered onto the existing HUD and habit card surfaces. The most architecturally critical requirements are timestamp-based timer persistence (DTOX-02), streak protection with time-window overlap logic (DTOX-06), and XP proportional penalty calculation (DTOX-04). These require careful pure-function design to remain testable.

The Expo Notifications scheduling pattern for the "Dungeon Cleared!" push notification is already established in `notification-service.ts` — a one-shot `type: 'date'` trigger scheduled at session start using the computed end time. The HUD canvas transformation uses the existing Skia layer architecture in `HudScene.tsx`, extended by a `dungeonActive` prop that swaps tint and adds torch Rect overlays. The UI-SPEC has been approved and defines all component specifications, tokens, copy, and motion contracts. The planner should treat `13-UI-SPEC.md` as the authoritative visual reference.

**Primary recommendation:** Build the four code units in dependency order — detoxRepo → detox-engine → detoxStore → UI — writing Jest tests for each pure-function unit before moving forward. The streak protection hook must be added to `streak-engine.ts` as a pure function (`isProtectedByDetox`) and called from `habitStore` at the streak-break check site.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Entry point is a pixel dungeon door icon on the HUD — tapping opens a bottom sheet with duration selection and session controls

**D-02:** Duration selection uses preset chip buttons (2hr, 4hr, 6hr, 8hr) — no slider or custom input

**D-03:** Daily vs Deep variants presented via a toggle at the top of the dungeon sheet — "Daily" shows 2-6hr presets, "Deep" shows 6-8hr presets. Deep badge shows "once per week" and greys out if already used this week

**D-04:** Dungeon door icon is pixel art style (dungeon gate) that glows when tappable — fits the HUD game-world aesthetic

**D-05:** During an active session, the HUD transforms into a full dungeon theme — stone walls, torches, different color palette. The entire game-world scene reflects "in dungeon" state

**D-06:** A countdown timer appears near the dungeon door on the HUD; opening the dungeon sheet shows full timer + progress details

**D-07:** When the player backgrounds the app and returns, a brief "Welcome back" toast shows ("Still in the dungeon — X hours remaining") then the timer resumes from the stored startedAt timestamp

**D-08:** A push notification fires when the detox timer completes while the app is backgrounded — celebratory tone: "Dungeon cleared! You earned X XP"

**D-09:** Early exit confirmation uses compassionate mentor voice: "Leaving the dungeon early? You'll lose X XP, but your courage in trying still counts. Exit or keep going?"

**D-10:** XP penalty is proportional to time remaining — exit at 50% complete = lose 50% of potential XP reward. Fair and intuitive scaling

**D-11:** Player gets one retry per day if they exit early — the penalty from the first attempt still applies. Daily dungeon allows one re-entry; weekly deep allows one re-entry per week

**D-12:** Dungeon completion triggers a full "Dungeon Cleared!" fanfare screen — XP award animation, dungeon crumbling/opening visual, mentor praise. HUD transitions back from dungeon theme to normal

**D-13:** Habit cards show a visible shield/dungeon icon during an active session indicating "protected — no penalty while in dungeon"

**D-14:** Streak protection only covers habits whose completion window overlaps with the detox session — starting a 2hr detox at 10am does NOT protect evening habits

**D-15:** A detox-specific Identity Title should exist (e.g., "Dungeon Master" or "The Unplugged") that progresses with completed detox sessions — gives long-term motivation

### Claude's Discretion

- Exact dungeon theme pixel art design and color palette (stone walls, torches, etc.)
- Timer UI layout within the dungeon sheet
- Welcome-back toast animation and duration
- Push notification scheduling implementation (Expo Notifications)
- Detox title name, rarity tier, and progression thresholds
- XP penalty rounding behavior for partial hours
- Dungeon-cleared fanfare animation specifics (Skia/Reanimated)
- How the shield indicator looks on habit cards

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DTOX-01 | User can start a voluntary detox challenge with duration selection (2-8 hours) | detoxRepo.create, detoxStore.startSession, DungeonSheet component, DungeonDoorIcon on HUD |
| DTOX-02 | Active session displays countdown timer that survives app backgrounding (timestamp-based) | Wall-clock delta from `startedAt` ISO string; AppState listener for foreground detection; no Reanimated per-second updates needed |
| DTOX-03 | Completing a detox session awards XP based on duration (50-150 daily, 300 deep weekly) | `detox-engine.calculateDetoxXP(variant, durationHours)` pure function; gameStore.awardXP with sourceType 'detox_completion' |
| DTOX-04 | User can exit detox early with confirmation and XP cost penalty | `detox-engine.calculatePenalty(startedAt, durationHours, baseXP)` proportional to elapsed fraction; EarlyExitConfirmation dialog |
| DTOX-05 | Daily variant resets daily; weekly deep variant (6-8hr) available once per week | `detoxRepo.getThisWeekDeepSession(userId)` and `detoxRepo.getTodaySession(userId)` queries; weekly boundary using ISO week or Sunday-midnight anchor |
| DTOX-06 | Active detox session preserves habit streaks (no penalty for missed habits during detox) | `isProtectedByDetox(habitScheduleWindow, detoxStartedAt, detoxDurationHours)` pure function added to streak-engine.ts; called from habitStore streak-break check site |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

| Constraint | Impact on Phase 13 |
|------------|-------------------|
| React Native (Expo) + Supabase, offline-first | `detoxSessions` is LOCAL_ONLY — no sync queue enqueue in detoxRepo (contrast with questRepo pattern) |
| No shame copy for missed days | Early exit dialog and retry-exhausted state use mentor voice copy from UI-SPEC, never negative framing |
| No addiction dark patterns | One retry limit per day/week enforced at domain level; no infinite retry |
| Privacy-first: detox data stays on device | detoxRepo MUST NOT call `assertSyncable` or enqueue to sync_queue |
| XP is effort-based, never spiritual judgment | Detox XP awarded for time commitment, not spiritual worth |
| Game Engine: pure TypeScript, no React imports | `detox-engine.ts` must have zero React imports; pure functions only |
| Zustand domain-split stores | `detoxStore` is a new domain-split Zustand store separate from habitStore/gameStore |
| Skia (FilterMode.Nearest) + Reanimated for animations | Dungeon theme uses Skia Rect/Circle inside Canvas; toast uses Reanimated `withTiming` |
| `ui-ux-pro-max` skill governs all UI work | All component decisions deferred to 13-UI-SPEC.md which was produced by ui-ux-pro-max |
| No public worship leaderboards | No public detox leaderboard — game GAME-02 (personal best) is deferred to future requirements |

---

## Standard Stack

### Core (all pre-installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-sqlite / Drizzle ORM | Established in Phase 2 | detoxRepo data access | All repos in project use this pattern |
| Zustand | Established in Phase 2 | detoxStore state | Project-wide store pattern |
| @shopify/react-native-skia | Established in Phase 5 | Dungeon HUD theme rendering | HudScene.tsx already uses Skia Canvas |
| react-native-reanimated | Established in Phase 5 | Toast/fanfare animations | All existing animations use Reanimated |
| expo-notifications | Established in Phase 6 | "Dungeon Cleared!" push notification | notification-service.ts already uses this API |
| expo-haptics | Established in Phase 4 | Fanfare haptic burst | gameStore uses `Haptics.impactAsync` |

**No new npm packages required.** All tools already installed and in use.

### Supporting

| Library | Purpose | When to Use |
|---------|---------|-------------|
| React Native `AppState` | Detect app foreground/background transitions for "welcome back" toast | Used in detoxStore or component mounting |

---

## Architecture Patterns

### Recommended File Structure

```
src/
├── domain/
│   └── detox-engine.ts          # Pure functions: XP calc, penalty calc, streak protection, variant gating
├── db/
│   └── repos/
│       └── detoxRepo.ts         # Drizzle CRUD + queries (no sync queue — LOCAL_ONLY)
├── stores/
│   └── detoxStore.ts            # Zustand: startSession, completeSession, exitEarly, loadActiveSession
├── components/
│   ├── hud/
│   │   ├── HudScene.tsx         # Modified: add dungeonActive prop, dungeon overlay layers
│   │   └── DungeonDoorIcon.tsx  # New: pixel art icon with glow ring + countdown badge
│   │   └── WelcomeBackToast.tsx # New: RN View sibling outside Canvas (same as FridayMessageBanner)
│   ├── detox/
│   │   ├── DungeonSheet.tsx         # New: bottom sheet with toggle, chips, CTA, active timer
│   │   ├── DetoxCountdownTimer.tsx  # New: shared HUD (pixel font) and sheet (Inter) variants
│   │   ├── DungeonClearedFanfare.tsx # New: full-screen overlay, ZoomIn spring, XP count-up
│   │   └── EarlyExitConfirmation.tsx # New: RN Modal dialog with penalty preview
│   └── habits/
│       └── HabitCard.tsx        # Modified: add DetoxShieldBadge when detox active + overlap
__tests__/
├── domain/
│   └── detox-engine.test.ts     # Wave 0 — covers DTOX-01 through DTOX-06 logic
├── db/
│   └── detoxRepo.test.ts        # Wave 0 — CRUD + query verification
```

### Pattern 1: Pure Domain Engine (detox-engine.ts)

**What:** All detox business logic lives in one pure TypeScript file with no React or DB imports. Functions receive plain data arguments and return plain data results.

**When to use:** Any rule that can be expressed as a pure function. Streak protection check, XP calculation, penalty calculation, variant eligibility — all go here.

**Example:**
```typescript
// Source: established pattern from src/domain/streak-engine.ts and friday-engine.ts

/**
 * Calculate the base XP reward for a completed detox session.
 * Daily: 50 XP (2h) → 150 XP (6h), linear scaling.
 * Deep weekly: fixed 300 XP.
 */
export function calculateDetoxXP(variant: 'daily' | 'deep', durationHours: number): number {
  if (variant === 'deep') return 300;
  // Daily: 50 XP base + 25 XP per hour above 2h (capped at 6h for daily)
  const clampedHours = Math.min(Math.max(durationHours, 2), 6);
  return 50 + (clampedHours - 2) * 25;
}

/**
 * Calculate proportional XP penalty for early exit.
 * Penalty = baseXP * (remainingFraction), rounded to nearest integer.
 * remainingFraction = timeRemaining / totalDuration
 */
export function calculateEarlyExitPenalty(
  startedAt: string,
  durationHours: number,
  baseXP: number,
  now: string,
): number {
  const startMs = new Date(startedAt).getTime();
  const nowMs = new Date(now).getTime();
  const totalMs = durationHours * 60 * 60 * 1000;
  const elapsedMs = Math.min(nowMs - startMs, totalMs);
  const remainingFraction = Math.max(0, (totalMs - elapsedMs) / totalMs);
  return Math.round(baseXP * remainingFraction);
}

/**
 * Check whether a habit's completion window overlaps with the detox session.
 * Used to determine which habits show the shield badge and receive streak protection.
 *
 * @param habitWindowStart - ISO string: start of habit's scheduled completion window
 * @param habitWindowEnd   - ISO string: end of habit's scheduled completion window
 * @param sessionStart     - ISO string: detox session startedAt
 * @param sessionEnd       - ISO string: detox session end (startedAt + durationHours)
 */
export function isProtectedByDetox(
  habitWindowStart: string,
  habitWindowEnd: string,
  sessionStart: string,
  sessionEnd: string,
): boolean {
  const hStart = new Date(habitWindowStart).getTime();
  const hEnd = new Date(habitWindowEnd).getTime();
  const sStart = new Date(sessionStart).getTime();
  const sEnd = new Date(sessionEnd).getTime();
  // Overlap: habit window and session window intersect
  return hStart < sEnd && hEnd > sStart;
}

/**
 * Determine whether the deep variant is available this week.
 * Returns false if a completed or active deep session already exists this week.
 */
export function isDeepVariantAvailableThisWeek(
  existingDeepSession: { status: string } | null,
): boolean {
  if (!existingDeepSession) return true;
  return existingDeepSession.status === 'abandoned'; // abandoned means early-exited with no retry remaining
}
```

### Pattern 2: Repo Pattern (detoxRepo.ts)

**What:** Follows the exact same CRUD + query structure as `questRepo.ts` and `habitRepo.ts`. Uses `getDb()`, Drizzle ORM, returns typed results. **Critical difference from other repos: no sync queue enqueue.** The `detox_sessions` table is `LOCAL_ONLY` per Privacy Gate — no `assertSyncable` call, no `syncQueueRepo.enqueue`.

**Example:**
```typescript
// Source: pattern from src/db/repos/questRepo.ts (with sync queue calls removed)

export const detoxRepo = {
  async create(data: NewDetoxSession) {
    const db = getDb();
    return db.insert(detoxSessions).values(data).returning();
    // NO sync queue enqueue — detox_sessions is LOCAL_ONLY
  },

  async getActiveSession(userId: string) {
    const db = getDb();
    const rows = await db
      .select()
      .from(detoxSessions)
      .where(and(eq(detoxSessions.userId, userId), eq(detoxSessions.status, 'active')));
    return rows[0] ?? null;
  },

  async getTodaySessions(userId: string) {
    const db = getDb();
    const { dayStart, dayEnd } = getDayBoundaries();
    return db
      .select()
      .from(detoxSessions)
      .where(and(
        eq(detoxSessions.userId, userId),
        gte(detoxSessions.startedAt, dayStart),
        lt(detoxSessions.startedAt, dayEnd),
      ));
  },

  async getThisWeekDeepSession(userId: string) {
    const db = getDb();
    const weekStart = thisWeekStart(); // same helper pattern as gameStore
    return db
      .select()
      .from(detoxSessions)
      .where(and(
        eq(detoxSessions.userId, userId),
        eq(detoxSessions.variant, 'deep'),
        gte(detoxSessions.startedAt, weekStart),
      ));
  },

  async complete(id: string, xpEarned: number, endedAt: string) {
    const db = getDb();
    return db
      .update(detoxSessions)
      .set({ status: 'completed', xpEarned, endedAt })
      .where(eq(detoxSessions.id, id))
      .returning();
  },

  async exitEarly(id: string, xpPenalty: number, endedAt: string) {
    const db = getDb();
    return db
      .update(detoxSessions)
      .set({ status: 'abandoned', xpPenalty, endedAt })
      .where(eq(detoxSessions.id, id))
      .returning();
  },
};
```

### Pattern 3: Timestamp-Based Timer (DTOX-02)

**What:** The countdown timer never stores "remaining seconds". It always recalculates remaining time as `(startedAt + durationHours*3600*1000) - Date.now()`. This means the timer is accurate after any app kill/background/restart.

**When to use:** Any displayed time value related to the session.

```typescript
// Source: established principle, consistent with streak timestamps in streak-engine.ts

function getRemainingMs(startedAt: string, durationHours: number): number {
  const endMs = new Date(startedAt).getTime() + durationHours * 60 * 60 * 1000;
  return Math.max(0, endMs - Date.now());
}

// In component: setInterval every 1000ms, no Reanimated per-tick (UI-SPEC contract)
const [remaining, setRemaining] = useState(() => getRemainingMs(session.startedAt, session.durationHours));
useEffect(() => {
  const id = setInterval(() => setRemaining(getRemainingMs(session.startedAt, session.durationHours)), 1000);
  return () => clearInterval(id);
}, [session.startedAt, session.durationHours]);
```

### Pattern 4: Push Notification Scheduling (D-08)

**What:** When a session starts, schedule a one-shot `expo-notifications` trigger at the computed session end time. If the user completes the session while foregrounded, cancel the notification before awarding XP (to prevent a spurious "Dungeon Cleared" push while the fanfare is already showing).

**Pattern:**
```typescript
// Source: notification-service.ts pattern (type: 'date' trigger)

// At session start:
const endDate = new Date(new Date(startedAt).getTime() + durationHours * 60 * 60 * 1000);
const notificationId = await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Dungeon Cleared!',
    body: `You held strong. +${baseXP} XP added to your journey.`,
    sound: true,
  },
  trigger: { type: 'date', date: endDate } as any,
});
// Store notificationId in detoxStore state so it can be cancelled on foreground completion

// At foreground completion (before fanfare):
await Notifications.cancelScheduledNotificationAsync(notificationId);
```

### Pattern 5: HudScene Dungeon Theme (D-05)

**What:** `HudScene` receives a `dungeonActive: boolean` prop. When true, two additional Skia layers are drawn above the background image but below the character: a semi-opaque `Rect` with dungeon stone fill, and two `Circle` shapes for torch flicker via Reanimated `useSharedValue`.

**Key constraint (established in Phase 12):** React Native Views (WelcomeBackToast, DungeonDoorIcon tap handler) are siblings to the Canvas, not inside it. The Canvas only renders Skia drawing primitives.

```typescript
// Source: HudScene.tsx architecture + UI-SPEC Component 4

// Inside Canvas (when dungeonActive):
{dungeonActive && (
  <>
    <Rect x={0} y={0} width={screenW} height={screenH}
      color="rgba(26,20,16,0.30)" />
    <Circle cx={screenW * 0.15} cy={screenH * 0.4} r={6}
      color="#C8621A" opacity={leftTorchOpacity} />
    <Circle cx={screenW * 0.85} cy={screenH * 0.4} r={6}
      color="#C8621A" opacity={rightTorchOpacity} />
  </>
)}
// DayNightOverlay tint replaced with dungeon shadow when dungeonActive
```

### Pattern 6: Streak Protection Hook (DTOX-06)

**What:** `isProtectedByDetox` is added as a pure export in `streak-engine.ts`. In `habitStore`, during the streak-break check (currently `detectStreakBreak`), before applying a break, check if the missed day's window overlaps with an active detox session. If protected, skip the break logic.

**Integration site:**
```typescript
// In habitStore — at the streak-break detection call site
const activeDetox = useDetoxStore.getState().activeSession;
if (activeDetox && isProtectedByDetox(
  habit.scheduledWindowStart,  // from habit definition or prayer times
  habit.scheduledWindowEnd,
  activeDetox.startedAt,
  getSessionEnd(activeDetox),
)) {
  // Skip detectStreakBreak — streak is protected
  return;
}
const breakResult = detectStreakBreak(streak.lastCompletedAt, now, streak.currentCount);
```

### Anti-Patterns to Avoid

- **Sync queue enqueue in detoxRepo:** `detox_sessions` is `LOCAL_ONLY`. Never call `assertSyncable('detox_sessions')` or `syncQueueRepo.enqueue`. The privacy gate will throw if this is attempted — see `privacy-gate.ts` which classifies `detox_sessions` as `LOCAL_ONLY`.
- **Reanimated per-tick timer updates:** Do not use `useSharedValue` + `withTiming` for the seconds countdown. Use `setInterval` with `useState` for timer state (UI-SPEC Interaction Contract for Active Session Timer).
- **Storing remaining seconds:** Never store `remainingSeconds` in the DB or store. Always derive from `startedAt` + `durationHours` + `Date.now()`. This ensures correctness across restarts.
- **Penalty applied before confirmation:** XP penalty must not be written to DB until the player confirms the early exit dialog. The penalty is computed and shown in the dialog, applied only on confirmation.
- **Habit window assumptions without prayer data:** The streak protection overlap check (D-14) requires the habit's scheduled window start/end. For salah habits, this comes from `prayer-times.ts` window data. For custom habits, a default full-day window should be used (00:00–23:59 local) — which means they are always protected during any active detox.
- **New title added to seed data without a new unlockType:** The detox title must use an existing unlockType or require a new one added to `TitleCondition.unlockType` in `title-engine.ts` and `TitleSeedEntry.unlockType` in `title-seed-data.ts`. The recommended approach is to add `'detox_completions'` as a new unlock type, mirroring `'quest_completions'`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Countdown timer display | Custom clock state with reset-on-background logic | `startedAt` timestamp + `Date.now()` delta in `setInterval` | Wall-clock delta is naturally resilient to app kills, DST, and device restarts |
| XP soft cap | Custom per-feature cap logic | `applySoftCap()` in `xp-engine.ts` via `gameStore.awardXP()` | All XP flows through this single gate — detox XP must too |
| Weekly reset detection | Custom day-counting logic | Same `thisWeekStart()` helper pattern already in `gameStore.ts` | Consistent week boundary across the app |
| Push notification scheduling | Custom background task | `expo-notifications` `type: 'date'` trigger | Already used for prayer reminders; same API |
| Haptic feedback | Platform-specific native calls | `expo-haptics` `impactAsync` | Already used in gameStore for quest completion |
| UUID generation | `Math.random()` | `generateId()` from `src/utils/uuid.ts` | Consistent across all entities in the project |

---

## Common Pitfalls

### Pitfall 1: Forgetting to cancel the scheduled notification on foreground completion

**What goes wrong:** Player completes the dungeon while the app is open. Fanfare plays. 30 seconds later a push notification arrives saying "Dungeon Cleared!" — this looks like a bug and creates a confusing double-reward experience.

**Why it happens:** The notification is scheduled at session start with a `type: 'date'` trigger. If the session is completed foregrounded, nothing cancels it.

**How to avoid:** Store the `notificationId` returned by `scheduleNotificationAsync` in detoxStore state. In `detoxStore.completeSession()`, call `Notifications.cancelScheduledNotificationAsync(notificationId)` before awarding XP and triggering the fanfare.

**Warning signs:** Manual QA — complete a session while foregrounded; a notification that fires 0–30s later is the symptom.

### Pitfall 2: Streak protection applying to habits whose window does NOT overlap

**What goes wrong:** Player starts a 2-hour detox at 10am. They miss Isha salah at 8pm. The app incorrectly shows the Isha streak as protected, and `detectStreakBreak` is skipped.

**Why it happens:** The overlap check in `isProtectedByDetox` is applied without correct `habitWindowEnd` data. If the prayer window end is not supplied correctly, all habits default to "full day" windows.

**How to avoid:** For salah habits, load the prayer window from `prayer-times.ts` at the time of the streak check. The habit's `type` field determines which prayer window to use. Only custom habits (without prayer windows) should use the full-day default.

**Warning signs:** Unit tests for `isProtectedByDetox` with explicit non-overlapping windows return incorrect `true`.

### Pitfall 3: Deep variant re-entrability confusion

**What goes wrong:** The `isDeepVariantAvailableThisWeek` check passes for an `'abandoned'` session (early exit), but D-11 says "weekly deep allows one re-entry per week." This means: one early exit is allowed, but if the player exits the re-entry also early, no further entries are permitted.

**Why it happens:** The "re-entry" concept is distinct from "first entry." The code must track: (1) how many deep sessions exist this week, and (2) whether any is `completed` or `active`.

**How to avoid:** Query `detoxRepo.getThisWeekDeepSession` and count total sessions. If count === 0 → available. If count === 1 and status === 'abandoned' → re-entry available. If count >= 2, OR count === 1 and status is 'completed' or 'active' → unavailable. Apply same logic for daily sessions (scoped to today instead of this week).

**Warning signs:** Player can enter the deep dungeon three times in a week; only 2 should be allowed.

### Pitfall 4: Timer drift from `setInterval` alone

**What goes wrong:** `setInterval(fn, 1000)` fires at ~1000ms but drifts over time due to JS event loop pressure, especially in React Native. After 2 hours the timer may be 10-20 seconds behind.

**Why it happens:** `setInterval` is not a clock. The callback fires after at least N ms but can be delayed by heavy render cycles.

**How to avoid:** Never accumulate timer state. Always compute `getRemainingMs(startedAt, durationHours)` fresh from wall clock on each tick. The interval is just a "re-render trigger", not the source of truth.

**Warning signs:** Timer display is visibly behind the actual elapsed time after several minutes.

### Pitfall 5: Drizzle Symbol.for('drizzle:Name') vs _.name

**What goes wrong:** Drizzle table SQL names are accessed via `Symbol.for('drizzle:Name')` rather than `.name` (known issue from Phase 11 Accumulated Context in STATE.md).

**Why it happens:** This is a known Drizzle quirk discovered during Phase 11 auto-validation. Accessing `.name` on a Drizzle table returns the TypeScript variable name, not the SQL table name.

**How to avoid:** If any detoxRepo code needs to reference the table name string (e.g., for Privacy Gate `assertSyncable` — though detoxRepo should not need this), use `Symbol.for('drizzle:Name')`. This is documented in STATE.md Accumulated Context.

---

## Code Examples

Verified patterns from existing codebase:

### XP Award Flow (detox completion)
```typescript
// Source: gameStore.ts awardXP pattern

// In detoxStore.completeSession():
const baseXP = calculateDetoxXP(session.variant, session.durationHours);
const xpResult = await gameStore.awardXP(userId, baseXP, 1.0, 'detox_completion', session.id);
// multiplier is 1.0 — detox XP is not affected by streak or Friday multiplier
// sourceType 'detox_completion' is already registered in src/types/common.ts line 44
```

### Notification Scheduling Pattern
```typescript
// Source: src/services/notification-service.ts lines 89-99

await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Dungeon Cleared!',
    body: `You held strong. +${baseXP} XP added to your journey.`,
    sound: true,
  },
  trigger: {
    type: 'date',
    date: endDate,
  } as any,   // 'as any' is established project convention for expo-notifications trigger types
});
```

### Reanimated Spring (fanfare, matches LevelUpOverlay)
```typescript
// Source: ui-ux-pro-max skill + existing LevelUpOverlay pattern

const scale = useSharedValue(0.85);
useEffect(() => {
  scale.value = withSpring(1, { damping: 15, stiffness: 150 });
}, []);
const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
```

### AppState Foreground Detection (welcome-back toast)
```typescript
// Source: React Native AppState API, established pattern

import { AppState } from 'react-native';
useEffect(() => {
  const sub = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active' && activeSession) {
      setShowWelcomeBack(true);
      setTimeout(() => setShowWelcomeBack(false), 3000);
    }
  });
  return () => sub.remove();
}, [activeSession]);
```

### Reduced Motion Check (all animation components)
```typescript
// Source: UI-SPEC Interaction Contracts + ui-ux-pro-max skill

import { AccessibilityInfo } from 'react-native';
const [reduceMotion, setReduceMotion] = useState(false);
useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
}, []);
// Pass reduceMotion to child animation components to skip withTiming/withSpring
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Expo Go development builds | EAS development builds (`--dev-client`) | Phase 2 | Expo Go cannot test custom native modules; all testing done on device/simulator via EAS |
| React Native `Animated` | `react-native-reanimated` | Phase 5 | Reanimated runs on UI thread — no JS bridge bottleneck on animations |
| Skia default bilinear sampling | `FilterMode.Nearest` + `MipmapMode.Nearest` | Phase 5 | Required for pixel art assets to remain crisp without blurring |

---

## Open Questions

1. **Habit window source for non-salah habits in isProtectedByDetox**
   - What we know: Salah habits have prayer windows via `prayer-times.ts`. Custom habits have no defined window.
   - What's unclear: Should the planner define a "default window" concept for custom habits, or should all non-salah habits always be protected during any active detox?
   - Recommendation: Use a full-day window (00:00–23:59 local) for all non-salah habits. This makes streak protection simpler and more generous — consistent with the no-shame philosophy.

2. **detox_completions unlockType for the new Identity Title**
   - What we know: `TitleCondition.unlockType` is a union type defined in `title-engine.ts` and `title-seed-data.ts`. Currently has no `'detox_completions'` member.
   - What's unclear: Should the planner add `'detox_completions'` to both type unions and implement the evaluation case, or repurpose an existing type?
   - Recommendation: Add `'detox_completions'` as a new unlockType. The `PlayerStats` interface in `title-engine.ts` also needs a `detoxCompletions: number` field. This requires a minor update to `gameStore.checkTitles` to query `detoxRepo.getCompletedCount(userId)`.

3. **Notification identifier storage between app kills**
   - What we know: `Notifications.scheduleNotificationAsync` returns a `string` identifier. detoxStore has no persistence middleware.
   - What's unclear: If the app is killed immediately after session start, the notification identifier is lost from Zustand state. On relaunch, the session is loaded from SQLite but the notification ID is not available to cancel.
   - Recommendation: Store the scheduled notification ID in the `detoxSessions` row (add an `notificationId` column) OR accept that it cannot be cancelled after an app kill (the notification fires but the XP is awarded at fanfare anyway — duplicate reward risk is low since the XP was not yet awarded). Given schema is already defined without this column, the simpler approach is: on `loadActiveSession`, cancel all scheduled notifications and re-schedule using the stored `startedAt`. This is the safer pattern.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 13 has no external dependencies beyond the project's existing stack. All tools (expo-notifications, Skia, Reanimated, Drizzle, Zustand) are already installed and verified in earlier phases.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (via `jest-expo`) |
| Config file | `jest.config.js` (root) |
| Quick run command | `npx jest __tests__/domain/detox-engine.test.ts --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DTOX-01 | `calculateDetoxXP(variant, durationHours)` returns correct XP for all valid inputs | unit | `npx jest __tests__/domain/detox-engine.test.ts -t "calculateDetoxXP" --no-coverage` | ❌ Wave 0 |
| DTOX-02 | `getRemainingMs(startedAt, durationHours)` returns 0 after session end; correct value mid-session | unit | `npx jest __tests__/domain/detox-engine.test.ts -t "getRemainingMs" --no-coverage` | ❌ Wave 0 |
| DTOX-03 | `calculateDetoxXP('daily', 4)` returns 100; `calculateDetoxXP('deep', 8)` returns 300 | unit | `npx jest __tests__/domain/detox-engine.test.ts -t "XP values" --no-coverage` | ❌ Wave 0 |
| DTOX-04 | `calculateEarlyExitPenalty` at 50% elapsed returns 50% of baseXP | unit | `npx jest __tests__/domain/detox-engine.test.ts -t "calculateEarlyExitPenalty" --no-coverage` | ❌ Wave 0 |
| DTOX-05 | `isDeepVariantAvailableThisWeek(null)` returns true; `isDeepVariantAvailableThisWeek({status:'completed'})` returns false | unit | `npx jest __tests__/domain/detox-engine.test.ts -t "variant availability" --no-coverage` | ❌ Wave 0 |
| DTOX-06 | `isProtectedByDetox` returns true when windows overlap; false when they do not | unit | `npx jest __tests__/domain/detox-engine.test.ts -t "isProtectedByDetox" --no-coverage` | ❌ Wave 0 |
| DTOX-01,05 | `detoxRepo.create` inserts row; `getTodaySessions` returns it; `getThisWeekDeepSession` query works | integration | `npx jest __tests__/db/detoxRepo.test.ts --no-coverage` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest __tests__/domain/detox-engine.test.ts --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/domain/detox-engine.test.ts` — covers DTOX-01 through DTOX-06 domain logic
- [ ] `__tests__/db/detoxRepo.test.ts` — covers DTOX-01 and DTOX-05 repo queries

*(Existing test infrastructure covers everything else — no new framework installation needed.)*

---

## Sources

### Primary (HIGH confidence)
- `src/db/schema.ts` lines 253-268 — `detoxSessions` table column definitions verified directly
- `src/types/common.ts` line 44 — `'detox_completion'` XPSourceType verified directly
- `src/services/privacy-gate.ts` line 46 — `detox_sessions: 'LOCAL_ONLY'` verified directly
- `src/domain/xp-engine.ts` — `applySoftCap`, `calculateXP` signatures verified
- `src/stores/gameStore.ts` — `awardXP` signature and orchestration pattern verified
- `src/domain/streak-engine.ts` — function signatures and streak break detection logic verified
- `src/domain/title-engine.ts` — `TitleCondition.unlockType` union and `PlayerStats` interface verified
- `src/components/hud/HudScene.tsx` — Canvas layer architecture and sibling-View pattern verified
- `src/services/notification-service.ts` — `type: 'date'` trigger pattern verified
- `.planning/phases/13-dopamine-detox-dungeon/13-UI-SPEC.md` — All component specs, tokens, copy, and motion contracts verified
- `src/domain/xp-economy-v2.md` — Detox XP values and soft cap proof verified
- `src/domain/title-seed-data.ts` — 26 existing titles, no detox title present — confirms new title needed

### Secondary (MEDIUM confidence)
- `src/db/repos/questRepo.ts` — Repo pattern template (Drizzle + sync queue); detoxRepo omits sync queue per LOCAL_ONLY classification
- `src/stores/habitStore.ts` — Streak check call site location for `isProtectedByDetox` integration

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified as installed in existing phases
- Architecture: HIGH — patterns verified directly from production codebase
- Pitfalls: HIGH — most derived from direct code reading + known STATE.md accumulated issues
- Open Questions: MEDIUM — solutions are clear but require planner decisions on type union changes

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable stack — 30-day window)
