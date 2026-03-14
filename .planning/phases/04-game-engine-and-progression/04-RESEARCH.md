# Phase 4: Game Engine and Progression - Research

**Researched:** 2026-03-14
**Domain:** Game progression system (XP engine, leveling, titles, quests, celebrations/animations, haptics)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**XP feedback on completion**
- Floating number animation rises from the completed card in pixel font (Press Start 2P)
- Shows full breakdown: "15 x 1.5x = +22 XP" — transparent about multiplier math
- Emerald/jewel-tone color, fades as it floats up
- Haptic pulse accompanies the XP float (already exists from Phase 3 completion)

**XP bar on habits screen**
- Persistent XP progress bar below the daily progress bar on habits tab
- Format: "Lv 8  ██████────  340/680 XP"
- On level-up: bar fills to 100%, brief glow/flash, resets to 0 and starts filling from new level's progress
- Animated transitions on XP gain (bar fills incrementally)

**Active title on habits screen**
- Active title displayed next to level badge in habits header: "Lv 8 · The Steadfast"
- Moves to HUD in Phase 5 — habits screen placement is temporary home

**Level-up celebration**
- Full-screen modal overlay for every level-up
- Level number animates in large, pixel font, with particle/glow effects
- Wise mentor voice copy at each milestone range
- Shows unlocks earned at this level
- "Continue" button to dismiss (not auto-dismiss)
- Heavy haptic burst on level-up

**Title unlock celebration**
- Full-screen modal (same style as level-up) for standalone title unlocks
- Shows: title name, Arabic subtitle if applicable, rarity badge, flavor text
- "Equip" and "Later" buttons
- If title unlocks during a level-up, bundle into the level-up screen (no two modals)

**Title viewing and equipping**
- Tab toggle at top of Quests screen: "Quests | Titles"
- Titles grouped by rarity: Common, Rare, Legendary with count
- Locked titles: name visible, greyed, tap to see unlock condition with progress bar
- One active title at a time

**Quest Board layout and behavior**
- Grouped sections: Daily (3 slots), Weekly (2), Stretch (1)
- Auto-track progress — no "accept" button
- Completed quests stay visible as mini-trophy until cycle resets
- Daily regenerate at midnight local, weekly at Sunday midnight
- Expired quests silently disappear
- No repeat of same quest template within 7 days
- Quest Board locked until Level 5

**XP formula (locked):** 40 x level^1.85
**Streak multiplier (locked):** 1.0x base, +0.1x/day, cap 3.0x
**Soft daily XP cap (locked):** ~500 XP (50% diminishing returns, invisible)

### Claude's Discretion
- Quest generation algorithm (template selection, difficulty scaling with level)
- Exact animation implementations (Reanimated specifics for floats, modals, progress bars)
- XP bar component design details (colors, height, animation easing)
- Level-up copy for non-milestone levels (Claude writes per-range copy)
- Title seed data migration structure
- Progression engine internal architecture (single module vs split)

### Deferred Ideas (OUT OF SCOPE)
- Voice pack system (changeable app personality) — Phase 6 or future
- Arabic terminology toggle — Phase 6 settings
- Gear icon redesign on habits screen — future polish
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAME-01 | User earns XP for habit completions (effort-based) | xp-engine pure TS module pattern; inject into habitStore.completeHabit() |
| GAME-02 | User levels up through XP accumulation with logarithmic progression curve | Level formula 40 x level^1.85; levelForXp() binary search or precomputed table |
| GAME-03 | User unlocks Identity Titles at milestone thresholds | titleRepo + title-engine; event-driven check post-completion |
| GAME-04 | Quest Board presents daily and weekly quests with rotating variety | quest-engine template system; questStore orchestration; Quests tab implementation |
| GAME-05 | User can complete quests for bonus XP and progression | Quest progress auto-tracked from completion events; XP reward via xp-engine |
| GAME-06 | XP economy modeled and balanced (levels 1-100 progression curve) | Simulation shows level 5 in week 1, level 20 in month 2-3; soft cap at 500 XP/day |
</phase_requirements>

---

## Summary

Phase 4 builds three interlocking systems: (1) a pure-TypeScript XP/leveling engine, (2) a title unlock engine, and (3) a quest rotation engine — all wired into the existing `habitStore.completeHabit()` flow. The pattern established by `streak-engine.ts` is the template: pure functions, no React imports, fully unit-testable. The Zustand `gameStore` shell already exists with the right fields; Phase 4 fleshes out the actions and wires them to repos.

Animations use React Native Reanimated 4 (already installed, `~4.1.1`). The key finding is that Reanimated 4 on Expo SDK 54 requires `react-native-worklets` as a peer dependency — it is NOT in package.json yet and must be added before any worklet-based animations will work in development builds. For Expo Go compatibility, this must match the version Expo SDK 54 ships. The `babel-preset-expo` handles the Babel plugin automatically; no manual babel.config.js change is needed.

Haptics are handled by `expo-haptics` (already installed, `~15.0.8`). The celebration sequence is `notificationAsync(Success)` for quest completion, and a manual sequence of `impactAsync(Heavy)` calls for level-up. The XP float uses `selectionAsync()` as a light acknowledgment already tied to the Phase 3 completion haptic.

**Primary recommendation:** Build `src/domain/xp-engine.ts`, `src/domain/title-engine.ts`, and `src/domain/quest-engine.ts` as pure TS modules following the streak-engine template. Wire them through `gameStore` actions that call the repos. Add `react-native-worklets` to dependencies before writing any Reanimated animation code.

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | ~4.1.1 | Floating XP number, XP bar fill, modal entering/exiting | UI-thread animations at 60fps; established in Phase 3 |
| expo-haptics | ~15.0.8 | Haptic bursts on XP gain, level-up, quest complete | Already installed; Taptic Engine on iOS |
| zustand | ^5.0.11 | gameStore orchestration | Already established pattern |
| drizzle-orm | ^0.45.1 | Typed DB access via repos | Already established pattern |
| expo-sqlite | ~16.0.10 | Underlying storage | Already established |

### Required Addition (not yet installed)
| Library | Version | Purpose | Why Needed |
|---------|---------|---------|------------|
| react-native-worklets | match SDK 54 | Peer dep for Reanimated 4 worklets | Reanimated 4.1+ requires it; missing from package.json causes native crashes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pure TS domain modules | Redux Toolkit + thunks | Over-engineered; TS functions simpler, more testable |
| Reanimated 4 worklets | CSS transitions (Reanimated 4 new API) | CSS transitions good for simple enter/exit; worklets needed for gesture-driven and XP float |
| expo-haptics sequences | react-native-haptic-feedback | Not needed; expo-haptics covers all required patterns |

**Installation:**
```bash
npx expo install react-native-worklets
```

Note: `babel-preset-expo` automatically configures the worklets babel plugin. Do NOT manually add `react-native-worklets/plugin` to `babel.config.js` — it causes conflicts.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── domain/
│   ├── xp-engine.ts          # XP calculation, level derivation, soft cap
│   ├── title-engine.ts       # Title unlock condition checking
│   ├── quest-engine.ts       # Quest template selection, rotation, progress eval
│   └── streak-engine.ts      # (existing — template for above)
├── stores/
│   └── gameStore.ts          # (existing shell — add actions: loadGame, awardXP, checkTitles, loadQuests)
├── db/repos/
│   ├── xpRepo.ts             # (existing)
│   ├── questRepo.ts          # (existing — add getByUser, getCompleted, getByType)
│   ├── userRepo.ts           # (existing — updateXP already present)
│   └── titleRepo.ts          # (MISSING — must create: getAll, getUserTitles, grantTitle, setActive)
└── components/
    ├── game/
    │   ├── XPFloatLabel.tsx   # Floating "+22 XP" animation
    │   ├── XPProgressBar.tsx  # Persistent bar below daily progress bar
    │   ├── LevelUpModal.tsx   # Full-screen celebration modal
    │   └── TitleUnlockModal.tsx # Full-screen title unlock modal
    └── quests/
        ├── QuestCard.tsx      # Individual quest row with progress bar
        ├── QuestSection.tsx   # Daily/Weekly/Stretch section header + cards
        └── TitleGrid.tsx      # Rarity-grouped title browser
```

### Pattern 1: Pure TS Domain Module (XP Engine)

**What:** A module of pure functions with no React, no DB, no side effects. Receives data, returns data.
**When to use:** All game logic — XP calculation, level derivation, soft cap, title checking.
**Example** (modeled on streak-engine.ts):

```typescript
// src/domain/xp-engine.ts
// Source: streak-engine.ts pattern, established in Phase 3

export interface XPResult {
  baseXP: number;
  multiplier: number;
  earnedXP: number;       // after multiplier
  cappedXP: number;       // after soft daily cap
  dailyTotalAfter: number;
  newLevel: number;
  didLevelUp: boolean;
  previousLevel: number;
}

/** XP required to REACH a given level from level 1. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(40 * Math.pow(level - 1, 1.85));
}

/** Total XP required to advance FROM level to level+1. */
export function xpForNextLevel(level: number): number {
  return xpForLevel(level + 1) - xpForLevel(level);
}

/** Derive current level from total accumulated XP. O(log n) binary search. */
export function levelForXP(totalXP: number): number {
  let lo = 1, hi = 100;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (xpForLevel(mid) <= totalXP) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Apply soft daily cap: above 500 XP earned today, returns 50% of remainder. */
export function applySoftCap(earnedXP: number, dailyTotal: number): number {
  const CAP = 500;
  if (dailyTotal >= CAP) return Math.floor(earnedXP * 0.5);
  const headroom = CAP - dailyTotal;
  if (earnedXP <= headroom) return earnedXP;
  const belowCap = headroom;
  const aboveCap = earnedXP - headroom;
  return belowCap + Math.floor(aboveCap * 0.5);
}

/** Calculate full XP result for a habit completion. */
export function calculateXP(
  baseXP: number,
  multiplier: number,
  currentTotalXP: number,
  dailyTotalXP: number,
): XPResult {
  const earned = Math.floor(baseXP * multiplier);
  const capped = applySoftCap(earned, dailyTotalXP);
  const newTotal = currentTotalXP + capped;
  const previousLevel = levelForXP(currentTotalXP);
  const newLevel = levelForXP(newTotal);
  return {
    baseXP,
    multiplier,
    earnedXP: earned,
    cappedXP: capped,
    dailyTotalAfter: dailyTotalXP + capped,
    newLevel,
    didLevelUp: newLevel > previousLevel,
    previousLevel,
  };
}
```

### Pattern 2: Title Engine (Event-Driven Unlock Check)

**What:** Pure function that evaluates all title unlock conditions against current completion stats. Returns newly-unlocked titles.
**When to use:** Called after every habit completion, after gameStore has updated XP/level.

```typescript
// src/domain/title-engine.ts
// Unlock types mirror titles schema: 'level_reach', 'habit_streak', 'total_completions', 'salah_streak'

export interface TitleUnlockCondition {
  id: string;
  unlockType: string;
  unlockValue: number;
  unlockHabitType: string | null;
}

export interface PlayerStats {
  currentLevel: number;
  habitStreaks: Record<string, number>;      // habitId -> currentCount
  habitTypes: Record<string, string>;        // habitId -> type (salah, custom, etc)
  salahConsecutiveDays: number;              // derived from salah streak data
  totalCompletions: number;
}

/** Returns IDs of titles whose unlock conditions are now met. */
export function checkTitleUnlocks(
  conditions: TitleUnlockCondition[],
  alreadyUnlocked: Set<string>,
  stats: PlayerStats,
): string[] {
  const newlyUnlocked: string[] = [];
  for (const title of conditions) {
    if (alreadyUnlocked.has(title.id)) continue;
    if (isTitleUnlocked(title, stats)) {
      newlyUnlocked.push(title.id);
    }
  }
  return newlyUnlocked;
}

function isTitleUnlocked(title: TitleUnlockCondition, stats: PlayerStats): boolean {
  switch (title.unlockType) {
    case 'level_reach':
      return stats.currentLevel >= title.unlockValue;
    case 'habit_streak': {
      if (title.unlockHabitType) {
        // All habits of this type must have streak >= unlockValue
        const matching = Object.entries(stats.habitTypes)
          .filter(([, type]) => type === title.unlockHabitType)
          .map(([id]) => stats.habitStreaks[id] ?? 0);
        return matching.length > 0 && matching.every(s => s >= title.unlockValue);
      }
      return Object.values(stats.habitStreaks).some(s => s >= title.unlockValue);
    }
    case 'salah_streak':
      return stats.salahConsecutiveDays >= title.unlockValue;
    case 'total_completions':
      return stats.totalCompletions >= title.unlockValue;
    default:
      return false;
  }
}
```

### Pattern 3: Quest Engine (Template-Based Rotation)

**What:** Pure functions for template selection (no-repeat within 7 days) and progress evaluation against completion events.
**When to use:** Quest generation at midnight or first app open of new day. Progress tracking on each habit completion.

```typescript
// src/domain/quest-engine.ts

export interface QuestTemplate {
  id: string;
  type: 'daily' | 'weekly' | 'stretch';
  description: string;
  targetType: 'any_completion' | 'habit_type' | 'streak_reach' | 'daily_complete_all';
  targetValue: number;
  targetHabitType?: string;
  minLevel: number;    // quest only available if player >= minLevel
  xpReward: number;
}

/** Select N templates avoiding recentlyUsedIds. Falls back to oldest if depleted. */
export function selectQuestTemplates(
  pool: QuestTemplate[],
  type: 'daily' | 'weekly' | 'stretch',
  count: number,
  playerLevel: number,
  recentlyUsedIds: Set<string>,
  now: Date,
): QuestTemplate[] {
  const eligible = pool.filter(
    t => t.type === type && t.minLevel <= playerLevel && !recentlyUsedIds.has(t.id)
  );
  // If not enough fresh templates, allow repeats from least-recently-used
  const source = eligible.length >= count ? eligible : pool.filter(
    t => t.type === type && t.minLevel <= playerLevel
  );
  return shuffle(source).slice(0, count);
}

/** Evaluate how much progress a completion event contributes to a quest. */
export function evaluateQuestProgress(
  quest: { targetType: string; targetValue: number; targetHabitType?: string | null; progress: number },
  event: { habitType: string; completedCount: number; allCompleted: boolean },
): number {
  switch (quest.targetType) {
    case 'any_completion': return Math.min(quest.targetValue, quest.progress + 1);
    case 'habit_type':
      if (event.habitType === quest.targetHabitType) return Math.min(quest.targetValue, quest.progress + 1);
      return quest.progress;
    case 'daily_complete_all': return event.allCompleted ? quest.targetValue : quest.progress;
    default: return quest.progress;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

### Pattern 4: Store-Repo-Engine Wiring (gameStore actions)

**What:** gameStore orchestrates the engine functions and repos. Follows the established pattern from habitStore.
**When to use:** All game state mutations go through gameStore actions.

```typescript
// src/stores/gameStore.ts (additions to existing shell)
// Pattern: same as habitStore.completeHabit() structure

awardXP: async (userId, baseXP, multiplier, sourceType, sourceId) => {
  const state = get();
  const dailyTotal = await xpRepo.getDailyTotal(userId, today());
  const result = calculateXP(baseXP, multiplier, state.totalXP, dailyTotal);

  // 1. Write to ledger
  await xpRepo.create({ userId, amount: result.cappedXP, sourceType, sourceId, earnedAt: now(), createdAt: now() });

  // 2. Update user record
  await userRepo.updateXP(userId, state.totalXP + result.cappedXP, result.newLevel);

  // 3. Update local state
  set({ totalXP: state.totalXP + result.cappedXP, currentLevel: result.newLevel });

  // 4. Return result so habitStore can trigger celebration
  return result;
},
```

### Pattern 5: XP Float Animation (Reanimated 4 Worklet)

**What:** A positioned `Animated.View` that floats upward and fades out over ~1.2s.
**When to use:** Immediately after `completeHabit()` resolves, positioned over the tapped card.

```typescript
// src/components/game/XPFloatLabel.tsx
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS } from 'react-native-reanimated';

// Source: Reanimated 4 docs - useSharedValue + useAnimatedStyle pattern

export function XPFloatLabel({ xpText, onDone }: { xpText: string; onDone: () => void }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-80, { duration: 1200 });
    opacity.value = withDelay(600, withTiming(0, { duration: 600, }, () => {
      runOnJS(onDone)(); // NOTE: in Reanimated 4, runOnJS is re-exported but scheduleOnRN is the new name
    }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.xpFloat, style]}>{xpText}</Animated.Text>
  );
}
// Position with absolute layout over the habit card using onLayout to measure card position
```

### Pattern 6: XP Progress Bar Animation

**What:** A shared-value-driven width animation using `useAnimatedStyle`. On level-up, sequence: fill to 100% → flash → reset to 0% → fill from new base.
**When to use:** XPProgressBar component, persistent on habits screen.

```typescript
// Core animation pattern
const progress = useSharedValue(currentProgress); // 0.0 to 1.0

// On XP gain:
progress.value = withTiming(newProgress, { duration: 800, easing: Easing.out(Easing.cubic) });

// On level-up (sequence):
progress.value = withSequence(
  withTiming(1.0, { duration: 400 }),               // fill to 100%
  withDelay(200, withTiming(1.0, { duration: 100 })), // glow hold (CSS glow via Reanimated)
  withTiming(0, { duration: 0 }),                   // instant reset
  withTiming(newProgressInNewLevel, { duration: 600 }), // fill from new base
);
```

### Pattern 7: Level-Up Modal

**What:** React Native `Modal` with `Animated.View` using Reanimated entering/exiting presets. The Modal's visible prop controls mount/unmount; the Animated.View handles the animation.
**When to use:** When `XPResult.didLevelUp === true` after an award.

```typescript
// Known issue: Reanimated entering/exiting inside RN Modal has reported glitches on
// react-native-screens. Prefer custom overlay (absolute positioned View over full screen)
// over Modal component if glitches appear.

// Safe pattern: use a state-driven full-screen overlay with ZoomIn entering:
{showLevelUp && (
  <Animated.View entering={ZoomIn.duration(400)} style={styles.overlay}>
    <LevelUpContent level={newLevel} onContinue={() => setShowLevelUp(false)} />
  </Animated.View>
)}
```

### Anti-Patterns to Avoid

- **Reading shared values during render:** `sharedValue.value` in JSX causes re-render loops. Only read in `useAnimatedStyle` or worklets.
- **Two celebration modals at once:** If title unlocks during level-up, bundle into LevelUpModal. Never stack modals.
- **runOnJS for every animation callback:** Only use `runOnJS`/`scheduleOnRN` when you need to call non-worklet JS code (like setState) from a worklet.
- **Animating layout properties (width/height as absolute px):** Animate `scaleX` or use a fixed-width container with an inner View whose width changes. Layout thrash kills 60fps.
- **Quest "accept" button:** Auto-track by design. No accept button. This is an intentional UX decision (adab: no pressure mechanics).
- **Shame copy on expired quests:** Expired quests must disappear silently. No "You missed it" state.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth XP bar animation | Custom Animated API animations | `useSharedValue` + `useAnimatedStyle` in Reanimated 4 | Runs on UI thread; JS Animated API is slower, janky on older devices |
| Haptic patterns | Custom vibration timing loops | `expo-haptics` with `impactAsync(Heavy)` repeated | iOS Taptic Engine requires system APIs; direct vibration API only on Android |
| Level derivation performance | Linear scan from level 1 to 100 | Binary search `levelForXP()` or precomputed lookup table | With 100 levels, linear scan is negligible; but binary search is O(log n) and cleaner |
| Quest no-repeat tracking | Full DB query per template check | In-memory Set of last 7 days' used template IDs | Simple, fast; persist to AsyncStorage or SQLite settings column |
| Animation entering/exiting on modals | Manual opacity/scale sequencing | Reanimated `ZoomIn`, `FadeIn` layout animation presets | Tested, composable, handles interruption correctly |

**Key insight:** Game logic in this domain is deceptively simple to get wrong (soft caps, streak multiplier rounding, level boundary conditions). Pure TS functions with full unit test coverage catch edge cases before they reach users.

---

## Common Pitfalls

### Pitfall 1: react-native-worklets Missing
**What goes wrong:** App starts, Reanimated animations throw native crash: "Native part of Worklets module was not initialized." or similar.
**Why it happens:** Reanimated 4.1+ depends on `react-native-worklets` as a peer dep. It is NOT in this project's package.json yet.
**How to avoid:** Run `npx expo install react-native-worklets` before writing any animation code. Do NOT add the babel plugin manually — `babel-preset-expo` handles it.
**Warning signs:** Any Reanimated import crashes immediately; native logs show worklets module not found.

### Pitfall 2: Level-Up Modal Glitches Inside React Native Modal
**What goes wrong:** Reanimated entering/exiting animations on `Animated.View` inside a `<Modal>` component cause visual glitches or animation doesn't fire on iOS.
**Why it happens:** Known interaction issue between `react-native-screens` and Reanimated layout animations inside RN Modal (GitHub issue #2545 on react-native-screens).
**How to avoid:** Use an absolute-positioned full-screen overlay View in the component tree (not inside Modal) with a high zIndex. Control visibility with state, not Modal's visible prop.
**Warning signs:** Animation fires on Android but not iOS, or first animation is skipped.

### Pitfall 3: Floating XP Label Position Drift
**What goes wrong:** The XP float label appears at (0, 0) or in the wrong position when habits are scrolled.
**Why it happens:** Measuring position with `onLayout` gives position relative to the component's parent, not the screen. With FlatList, items scroll off screen so positions change.
**How to avoid:** Use `ref.current.measureInWindow(callback)` (not `measure`) to get absolute screen coordinates. Position the float label in a portal-like overlay at the root layout level.
**Warning signs:** Float label appears at top-left or jumps to wrong location on scroll.

### Pitfall 4: XP Double-Counting on Retry
**What goes wrong:** If `completeHabit()` throws after writing to `xp_ledger` but before updating `users.totalXp`, a retry creates a second XP ledger entry.
**Why it happens:** Two separate DB writes with no transaction.
**How to avoid:** The XP ledger is the source of truth. `users.totalXp` is a denormalized cache. On app load, always recompute from `xpRepo.getLifetimeTotal()` and reconcile. Use `userRepo.updateXP` after the ledger write succeeds.
**Warning signs:** Player's displayed XP doesn't match ledger sum.

### Pitfall 5: Quest Progress Race on Fast Completions
**What goes wrong:** User completes 3 habits in rapid succession; quest progress updates step on each other.
**Why it happens:** Each `completeHabit()` call reads quest progress, increments, and writes — concurrent calls can read stale values.
**How to avoid:** Run quest progress updates sequentially inside the store action. The existing `habitStore` is not concurrent (Zustand actions are synchronous), but async DB writes can interleave. Use `questRepo.updateProgress()` with an atomic increment at SQL level if needed: `SET progress = MIN(progress + 1, target_value)`.
**Warning signs:** Quest shows "2/5" when 3 completions have fired.

### Pitfall 6: Soft Cap Invisible to Player but Visible in Ledger
**What goes wrong:** Player notices their XP sometimes doesn't match their mental math ("I should have gotten 30 XP but only got 15").
**Why it happens:** Soft cap is invisible by design, but the XP float shows the uncapped amount.
**How to avoid:** The XP float label MUST show the capped amount (`cappedXP`, not `earnedXP`). The breakdown format "15 x 1.5x = +22 XP" should use the final capped number. The cap itself is never mentioned in UI.
**Warning signs:** Player posts confusion about XP math — check if float shows earnedXP vs cappedXP.

### Pitfall 7: Title Check Performance on Every Completion
**What goes wrong:** Checking all 26 titles after every completion is slow if it requires DB queries for each condition.
**Why it happens:** Naive implementation queries streak counts, completion totals per-title check.
**How to avoid:** Build a `PlayerStats` snapshot once per completion event (collect all needed data in one round-trip), then run `checkTitleUnlocks()` synchronously against that snapshot. The 26-title check is O(26) pure computation once stats are loaded.
**Warning signs:** Habit completion feels laggy after adding title check.

---

## Code Examples

Verified patterns from official sources and established project patterns:

### XP Formula Verification (Formula Balancing)
```typescript
// Verified against locked formula: 40 * level^1.85
// Level thresholds (XP needed to REACH each level):
// Level 1:   0 XP       (starting)
// Level 2:   40 XP      (first milestone)
// Level 5:   ~540 XP    (achievable in week 1 at 5 habits/day)
// Level 10:  ~2,900 XP
// Level 20:  ~13,000 XP (~month 2-3)
// Level 50:  ~110,000 XP
// Level 100: ~610,000 XP (aspirational)
//
// At 5 habits/day, avg 25 XP each, 1.5x avg multiplier = ~187 XP/day
// Soft cap: effectively ~350-450 XP/day at 5 habits
// Level 5 in ~4 days is achievable — validates game balance
```

### Haptic Sequences
```typescript
// Source: expo-haptics docs (docs.expo.dev/versions/latest/sdk/haptics/)
import * as Haptics from 'expo-haptics';

// Habit completion (already in Phase 3 — keep as-is):
await Haptics.selectionAsync();

// Quest completion:
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Level-up (heavy burst — fire 3x with delay for dramatic effect):
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
await new Promise(r => setTimeout(r, 100));
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
await new Promise(r => setTimeout(r, 80));
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);

// Title unlock:
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

### titleRepo (Missing — Must Create)
```typescript
// src/db/repos/titleRepo.ts — pattern follows xpRepo.ts
import { eq, and } from 'drizzle-orm';
import { getDb } from '../client';
import { titles, userTitles } from '../schema';
import type { NewUserTitle } from '../../types/database';

export const titleRepo = {
  async getAll() {
    return getDb().select().from(titles).orderBy(titles.sortOrder);
  },
  async getUserTitles(userId: string) {
    return getDb().select().from(userTitles).where(eq(userTitles.userId, userId));
  },
  async grantTitle(data: NewUserTitle) {
    return getDb().insert(userTitles).values(data).onConflictDoNothing().returning();
  },
  async setActive(userId: string, titleId: string | null) {
    // Delegates to userRepo.setActiveTitle — keep in userRepo
  },
};
```

### Quest Expiry (Midnight Reset)
```typescript
// Called on app foreground / first render of quests tab
// 1. expire old quests (silent)
await questRepo.expireOld();

// 2. Check if daily quests need regeneration
const active = await questRepo.getActive(userId);
const dailyActive = active.filter(q => q.type === 'daily');
if (dailyActive.length < 3) {
  // Generate new daily quests
  const recentIds = await getRecentTemplateIds(userId, 7); // last 7 days
  const templates = selectQuestTemplates(DAILY_TEMPLATES, 'daily', 3, level, recentIds, new Date());
  for (const t of templates) {
    await questRepo.create({ ...questFromTemplate(t, userId) });
  }
}
```

### Entering/Exiting Modal Animation (Reanimated 4)
```typescript
// Source: Reanimated 4 docs - layout animations
// Use absolute overlay, NOT React Native Modal, to avoid known glitch

import Animated, { ZoomIn, FadeOut } from 'react-native-reanimated';

// In root layout or habits screen:
{showLevelUp && (
  <Animated.View
    entering={ZoomIn.duration(350).springify()}
    exiting={FadeOut.duration(200)}
    style={StyleSheet.absoluteFillObject} // covers full screen
  >
    <LevelUpModal level={newLevel} unlockedTitles={unlocked} onContinue={dismiss} />
  </Animated.View>
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `runOnJS()` for JS callbacks from worklets | `scheduleOnRN()` (new name) | Reanimated 4.x | `runOnJS` still re-exported, not urgent to change yet |
| `restDisplacementThreshold` on withSpring | `energyThreshold` (single param) | Reanimated 4.x | Remove old params; new default behavior is safe |
| Reanimated babel plugin in babel.config.js | `babel-preset-expo` handles automatically | Expo SDK 54 | Do NOT add plugin manually — causes conflicts |
| Modal for celebrations | Absolute-positioned overlay with zIndex | Community pattern 2024+ | Avoids known react-native-screens glitch with Reanimated in Modal |
| Linear level scan | Binary search `levelForXP()` | Always best practice | Cleaner, no practical perf difference at 100 levels |

**Deprecated/outdated:**
- `addWhitelistedNativeProps`/`addWhitelistedUIProps`: Removed in Reanimated 4, were no-ops
- `useWorkletCallback`: Removed in Reanimated 4
- `combineTransition`: Removed in Reanimated 4

---

## Open Questions

1. **Quest template dataset**
   - What we know: Quest engine architecture is clear; `targetType` enum defined
   - What's unclear: The full set of 20+ quest templates (descriptions, difficulty tiers, minLevel gates) needs to be written as seed data. This is content work, not engineering.
   - Recommendation: Write 20 daily templates, 8 weekly templates, 3 stretch templates as a TypeScript constant in `src/domain/quest-templates.ts`. Scale XP rewards by type: daily 25-50 XP, weekly 80-150 XP, stretch 200-400 XP.

2. **Title seed data migration**
   - What we know: 26 titles exist in Blueprint (10 Common, 10 Rare, 6 Legendary); `titles` table schema is defined
   - What's unclear: Exact unlock conditions for all 26 titles haven't been enumerated in code
   - Recommendation: Create a new Drizzle migration that seeds all 26 titles. Title unlock conditions must map to the four `unlockType` values in the schema.

3. **PlayerStats data collection for title checks**
   - What we know: We need `salahConsecutiveDays` (consecutive days all 5 salah completed) — this doesn't directly exist in current schema
   - What's unclear: Whether to derive this from streak data or add a dedicated column
   - Recommendation: Derive from streak data: a "salah consecutive days" counter = min streak count among all active salah habits. This is computable without a new column.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest-expo ~54.0.17 |
| Config file | jest.config.js (or package.json jest field) |
| Quick run command | `npm test -- --testPathPattern=domain/xp-engine` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAME-01 | XP calculation with multiplier and soft cap | unit | `npm test -- --testPathPattern=domain/xp-engine` | ❌ Wave 0 |
| GAME-02 | Level derivation from total XP; level-up detection | unit | `npm test -- --testPathPattern=domain/xp-engine` | ❌ Wave 0 |
| GAME-03 | Title unlock condition evaluation | unit | `npm test -- --testPathPattern=domain/title-engine` | ❌ Wave 0 |
| GAME-04 | Quest template selection (no repeat within 7 days) | unit | `npm test -- --testPathPattern=domain/quest-engine` | ❌ Wave 0 |
| GAME-05 | Quest progress evaluation per completion event | unit | `npm test -- --testPathPattern=domain/quest-engine` | ❌ Wave 0 |
| GAME-06 | XP economy simulation (level thresholds match design targets) | unit | `npm test -- --testPathPattern=domain/xp-engine` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=domain/` (runs all domain tests, < 5s)
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/domain/xp-engine.test.ts` — covers GAME-01, GAME-02, GAME-06
- [ ] `__tests__/domain/title-engine.test.ts` — covers GAME-03
- [ ] `__tests__/domain/quest-engine.test.ts` — covers GAME-04, GAME-05

*(No framework gaps — jest-expo already installed and working from Phase 2/3)*

---

## Sources

### Primary (HIGH confidence)
- Reanimated 4 Migration Guide: https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/ — confirmed useSharedValue/withTiming/useAnimatedStyle are unchanged; withSpring parameter changes documented
- Expo Haptics docs: https://docs.expo.dev/versions/latest/sdk/haptics/ — all haptic types and enums verified
- Expo SDK 54 changelog: https://expo.dev/changelog/sdk-54 — confirmed Reanimated v4 + react-native-worklets requirement
- Project codebase: streak-engine.ts, gameStore.ts, xpRepo.ts, questRepo.ts, schema.ts — all read directly

### Secondary (MEDIUM confidence)
- FreeCodeCamp Reanimated v4 guide: https://www.freecodecamp.org/news/how-to-create-fluid-animations-with-react-native-reanimated-v4/ — CSS transition vs worklet guidance verified against official docs
- Reanimated discussion #8778: https://github.com/software-mansion/react-native-reanimated/discussions/8778 — react-native-worklets version matching in Expo Go
- Reanimated entering/exiting docs: https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/ — FadeIn, ZoomIn, SlideIn confirmed available

### Tertiary (LOW confidence)
- react-native-screens issue #2545 (Modal + Reanimated glitch): GitHub — community-reported, not official doc. Warrants testing before committing to Modal approach.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from package.json and official docs
- Architecture: HIGH — directly modeled on existing streak-engine.ts and store patterns in this codebase
- Animation APIs: HIGH — Reanimated 4 docs and migration guide verified
- Pitfalls: MEDIUM/HIGH — react-native-worklets gap verified from Expo SDK 54 changelog; Modal glitch LOW (community-reported)
- XP balance numbers: MEDIUM — formula is locked; simulation math is straightforward arithmetic

**Research date:** 2026-03-14
**Valid until:** 2026-06-14 (Reanimated and Expo stable ecosystem — 90 days)
