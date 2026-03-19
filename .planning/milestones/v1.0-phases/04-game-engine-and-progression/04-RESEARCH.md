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
- Shows full breakdown: "15 x 1.5x = +22 XP" -- transparent about multiplier math
- Emerald/jewel-tone color, fades as it floats up
- Haptic pulse accompanies the XP float (already exists from Phase 3 completion)

**XP bar on habits screen**
- Persistent XP progress bar below the daily progress bar on habits tab
- Format: "Lv 8  ██████────  340/680 XP"
- On level-up: bar fills to 100%, brief glow/flash, resets to 0 and starts filling from new level's progress
- Animated transitions on XP gain (bar fills incrementally)

**Active title on habits screen**
- Active title displayed next to level badge in habits header: "Lv 8 . The Steadfast"
- Moves to HUD in Phase 5 -- habits screen placement is temporary home

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
- Auto-track progress -- no "accept" button
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
- Voice pack system (changeable app personality) -- Phase 6 or future
- Arabic terminology toggle -- Phase 6 settings
- Gear icon redesign on habits screen -- future polish
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAME-01 | User earns XP for habit completions (effort-based) | xp-engine pure TS module; inject into habitStore.completeHabit() at the `xpEarned: 0` placeholder |
| GAME-02 | User levels up through XP accumulation with logarithmic progression curve | Level formula 40 x level^1.85; levelForXp() binary search; level-up detection in calculateXP() |
| GAME-03 | User unlocks Identity Titles at milestone thresholds | titleRepo (missing) + title-engine; event-driven check post-completion; 26 titles from blueprint seed data |
| GAME-04 | Quest Board presents daily and weekly quests with rotating variety | quest-engine template system; questStore orchestration; Quests tab with Titles sub-tab |
| GAME-05 | User can complete quests for bonus XP and progression | Quest progress auto-tracked from completion events; XP reward via xp-engine on quest complete |
| GAME-06 | XP economy modeled and balanced (levels 1-100 progression curve) | Blueprint simulation validated; level 5 in week 1, level 20 in month 2-3; soft cap at 500 XP/day |
</phase_requirements>

---

## Summary

Phase 4 builds three interlocking pure-TypeScript domain modules: (1) an XP/leveling engine, (2) a title unlock engine, and (3) a quest rotation engine. These wire into the existing `habitStore.completeHabit()` flow where `xpEarned: 0` is the explicit placeholder waiting for XP injection. The pattern established by `streak-engine.ts` is the template: pure functions, no React imports, fully unit-testable. The Zustand `gameStore` shell already exists with `currentLevel`, `totalXP`, `titles`, `activeTitle` fields and basic setters; Phase 4 adds orchestration actions (awardXP, checkTitles, loadQuests) following the store-repo-engine pattern from `habitStore`.

The UI layer adds: an XP float label animation (Reanimated 4 shared values), a persistent XP progress bar on the habits screen, level-up and title-unlock celebration overlays, and the Quest Board tab (replacing the placeholder). All animations use React Native Reanimated 4.1.1 (already installed). The `react-native-worklets` peer dependency is already installed as a transitive dependency (v0.7.4) but is NOT in package.json -- it must be added explicitly via `npx expo install react-native-worklets` to prevent version drift. New Architecture is already enabled (`newArchEnabled: true` in app.json), which is required for Reanimated 4. These native modules are precompiled in Expo Go SDK 54, so animations will work without a dev build.

Haptics use `expo-haptics` (already installed, ~15.0.8). The celebration sequence is `notificationAsync(Success)` for quest completion and a manual sequence of `impactAsync(Heavy)` calls for level-up. The XP float uses `selectionAsync()` already tied to the Phase 3 completion haptic.

**Primary recommendation:** Build `src/domain/xp-engine.ts`, `src/domain/title-engine.ts`, and `src/domain/quest-engine.ts` as pure TS modules following the streak-engine template. Wire them through `gameStore` actions that call the repos. Add `react-native-worklets` to package.json explicitly before writing any animation code.

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
| react-native-worklets | 0.7.4 (transitive) | Peer dep for Reanimated 4 worklets | Installed transitively; needs explicit package.json entry |

### Required Addition
| Library | Version | Purpose | Why Needed |
|---------|---------|---------|------------|
| react-native-worklets | (explicit) | Peer dep for Reanimated 4 | Already installed transitively (v0.7.4) but NOT in package.json; must add explicitly to prevent version drift |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pure TS domain modules | Redux Toolkit + thunks | Over-engineered; TS functions simpler, more testable |
| Reanimated 4 worklets | CSS transitions (Reanimated 4 new API) | CSS transitions good for simple enter/exit; worklets needed for XP float positioning |
| expo-haptics sequences | react-native-haptic-feedback | Not needed; expo-haptics covers all required patterns |
| Absolute overlay for modals | React Native Modal component | Known Reanimated animation glitches inside RN Modal with react-native-screens |

**Installation:**
```bash
npx expo install react-native-worklets
```

Note: `babel-preset-expo` automatically configures the worklets babel plugin. Do NOT manually add `react-native-worklets/plugin` to `babel.config.js` -- adding both causes "Duplicate plugin/preset detected" error.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── domain/
│   ├── xp-engine.ts          # XP calculation, level derivation, soft cap
│   ├── title-engine.ts       # Title unlock condition checking
│   ├── quest-engine.ts       # Quest template selection, rotation, progress eval
│   ├── quest-templates.ts    # Static quest template pool (20 daily, 8 weekly, 3 stretch)
│   ├── title-seed-data.ts    # 26 titles from blueprint with unlock conditions
│   └── streak-engine.ts      # (existing -- template for above)
├── stores/
│   └── gameStore.ts          # (existing shell -- add actions: loadGame, awardXP, checkTitles, loadQuests, generateQuests)
├── db/repos/
│   ├── xpRepo.ts             # (existing)
│   ├── questRepo.ts          # (existing -- add getByUser, getCompleted, getByType, getRecentTemplateIds)
│   ├── userRepo.ts           # (existing -- updateXP already present)
│   └── titleRepo.ts          # (MISSING -- must create: getAll, getUserTitles, grantTitle)
└── components/
    ├── game/
    │   ├── XPFloatLabel.tsx   # Floating "+22 XP" animation
    │   ├── XPProgressBar.tsx  # Persistent bar below daily progress bar
    │   ├── LevelBadge.tsx     # "Lv 8 . The Steadfast" header element
    │   ├── LevelUpOverlay.tsx # Full-screen celebration overlay (NOT Modal)
    │   └── TitleUnlockOverlay.tsx # Full-screen title unlock overlay
    └── quests/
        ├── QuestCard.tsx      # Individual quest row with progress bar
        ├── QuestSection.tsx   # Daily/Weekly/Stretch section header + cards
        ├── QuestLockedState.tsx # Level < 5 locked state
        └── TitleGrid.tsx      # Rarity-grouped title browser with progress
```

### Pattern 1: Pure TS Domain Module (XP Engine)

**What:** A module of pure functions with no React, no DB, no side effects. Receives data, returns data.
**When to use:** All game logic -- XP calculation, level derivation, soft cap, title checking.
**Example** (modeled on streak-engine.ts):

```typescript
// src/domain/xp-engine.ts
// Source: streak-engine.ts pattern, established in Phase 3

export interface XPResult {
  baseXP: number;
  multiplier: number;
  earnedXP: number;       // after multiplier, before cap
  cappedXP: number;       // after soft daily cap -- THIS is what UI displays
  dailyTotalAfter: number;
  newTotalXP: number;
  newLevel: number;
  didLevelUp: boolean;
  previousLevel: number;
}

/** XP required to REACH a given level (cumulative from level 1). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Sum of xpToNext for levels 1 through level-1
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += Math.floor(40 * Math.pow(l, 1.85));
  }
  return total;
}

/** XP required to advance FROM current level to level+1. */
export function xpToNextLevel(level: number): number {
  return Math.floor(40 * Math.pow(level, 1.85));
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
  return headroom + Math.floor((earnedXP - headroom) * 0.5);
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
    newTotalXP: newTotal,
    newLevel,
    didLevelUp: newLevel > previousLevel,
    previousLevel,
  };
}
```

**IMPORTANT NOTE on XP formula:** The blueprint states `XP_required(level) = floor(base_xp * level^exponent)` which gives XP to advance FROM a level (not cumulative). The `xpForLevel()` cumulative function must SUM these values. The simulation table in the blueprint (Section 03) shows:
- Level 1 -> 2: 40 XP needed
- Level 2 -> 3: ~137 XP needed
- Level 5 cumulative: ~915 XP

These are the authoritative numbers from the locked Game Design Bible.

### Pattern 2: Title Engine (Event-Driven Unlock Check)

**What:** Pure function that evaluates all title unlock conditions against current player stats. Returns newly-unlocked title IDs.
**When to use:** Called after every habit completion and XP award, once stats snapshot is built.

```typescript
// src/domain/title-engine.ts

export interface TitleCondition {
  id: string;
  unlockType: 'level_reach' | 'habit_streak' | 'habit_type_streak' |
               'total_completions' | 'quest_completions' | 'mercy_recoveries' |
               'simultaneous_streaks' | 'muhasabah_streak' | 'habit_count';
  unlockValue: number;
  unlockHabitType: string | null;
}

export interface PlayerStats {
  currentLevel: number;
  habitStreaks: Record<string, number>;      // habitId -> currentCount
  habitTypes: Record<string, string>;        // habitId -> type
  totalCompletions: number;
  questCompletions: number;
  mercyRecoveries: number;
  muhasabahStreak: number;
  activeHabitCount: number;
  simultaneousStreaks14: number;  // how many habits have 14+ day streaks
  simultaneousStreaks90: number;  // how many habits have 90+ day streaks
}

/** Returns IDs of titles newly unlocked. Pure function, no side effects. */
export function checkTitleUnlocks(
  conditions: TitleCondition[],
  alreadyUnlocked: Set<string>,
  stats: PlayerStats,
): string[] {
  return conditions
    .filter(t => !alreadyUnlocked.has(t.id) && isTitleUnlocked(t, stats))
    .map(t => t.id);
}
```

### Pattern 3: Quest Engine (Template-Based Rotation)

**What:** Pure functions for template selection (no-repeat within 7 days) and progress evaluation.
**When to use:** Quest generation at midnight or first app open of new day. Progress tracking on each habit completion.

```typescript
// src/domain/quest-engine.ts

export interface QuestTemplate {
  id: string;
  type: 'daily' | 'weekly' | 'stretch';
  description: string;
  targetType: 'any_completion' | 'habit_type' | 'all_salah' | 'streak_reach' |
              'daily_complete_all' | 'muhasabah' | 'total_completions';
  targetValue: number;
  targetHabitType?: string;
  minLevel: number;
  xpReward: number;
}

/** Select N templates avoiding recentlyUsedIds within 7 days. */
export function selectQuestTemplates(
  pool: QuestTemplate[],
  type: 'daily' | 'weekly' | 'stretch',
  count: number,
  playerLevel: number,
  activeHabitTypes: Set<string>,
  recentlyUsedIds: Set<string>,
): QuestTemplate[] {
  // 1. Filter by type, level, and relevance to active habits
  const eligible = pool.filter(t =>
    t.type === type &&
    t.minLevel <= playerLevel &&
    !recentlyUsedIds.has(t.id) &&
    isRelevantToPlayer(t, activeHabitTypes)
  );
  // 2. Ensure at least one "easy" quest (25-30 XP) for daily
  // 3. Shuffle and take count
  return shuffle(eligible).slice(0, count);
}

/** Evaluate quest progress increment from a completion event. */
export function evaluateQuestProgress(
  quest: { targetType: string; targetValue: number; targetHabitType?: string | null; progress: number },
  event: { habitType: string; allSalahComplete: boolean; allHabitsComplete: boolean },
): number {
  // Returns new progress value (clamped to targetValue)
}
```

### Pattern 4: Store-Repo-Engine Wiring (gameStore actions)

**What:** gameStore orchestrates engine functions and repos, following habitStore pattern.
**When to use:** All game state mutations go through gameStore actions.

```typescript
// src/stores/gameStore.ts (additions to existing shell)

awardXP: async (userId, baseXP, multiplier, sourceType, sourceId) => {
  const state = get();
  const today = new Date().toISOString().split('T')[0];
  const dailyTotal = await xpRepo.getDailyTotal(userId, today);
  const result = calculateXP(baseXP, multiplier, state.totalXP, dailyTotal);

  // 1. Write to ledger (source of truth)
  await xpRepo.create({
    id: generateId(), userId, amount: result.cappedXP,
    sourceType, sourceId, earnedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  // 2. Update denormalized user record
  await userRepo.updateXP(userId, result.newTotalXP, result.newLevel);

  // 3. Update local state
  set({ totalXP: result.newTotalXP, currentLevel: result.newLevel });

  // 4. Return result for celebration triggers
  return result;
},
```

### Pattern 5: XP Float Animation (Reanimated 4)

**What:** A positioned `Animated.View` that floats upward and fades out over ~1.2s.
**When to use:** Immediately after `completeHabit()` resolves, positioned over the tapped card.

```typescript
// src/components/game/XPFloatLabel.tsx
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS
} from 'react-native-reanimated';

export function XPFloatLabel({ xpText, onDone }: { xpText: string; onDone: () => void }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-80, { duration: 1200 });
    opacity.value = withDelay(600, withTiming(0, { duration: 600 }, () => {
      runOnJS(onDone)();
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
// Position with absolute layout; use ref.measureInWindow() for screen coords
```

### Pattern 6: XP Progress Bar Animation

**What:** Shared-value-driven width animation. On level-up: fill to 100% -> flash -> reset -> fill from new base.

```typescript
import { withSequence, withTiming, withDelay, Easing } from 'react-native-reanimated';

// Normal XP gain:
progress.value = withTiming(newProgress, { duration: 800, easing: Easing.out(Easing.cubic) });

// Level-up sequence:
progress.value = withSequence(
  withTiming(1.0, { duration: 400 }),                    // fill to 100%
  withDelay(200, withTiming(1.0, { duration: 100 })),    // glow hold
  withTiming(0, { duration: 0 }),                        // instant reset
  withTiming(newProgressInNewLevel, { duration: 600 }),   // fill from new base
);
```

### Pattern 7: Celebration Overlays (NOT React Native Modal)

**What:** State-driven full-screen overlay using absolute positioning and Reanimated layout animations.
**Why not Modal:** Known interaction issue between `react-native-screens` and Reanimated entering/exiting inside RN Modal (animations may not fire on iOS).

```typescript
import Animated, { ZoomIn, FadeOut } from 'react-native-reanimated';

// In root layout or habits screen:
{showLevelUp && (
  <Animated.View
    entering={ZoomIn.duration(350).springify()}
    exiting={FadeOut.duration(200)}
    style={StyleSheet.absoluteFillObject}
  >
    <LevelUpContent level={newLevel} unlockedTitles={unlocked} onContinue={dismiss} />
  </Animated.View>
)}
```

### Anti-Patterns to Avoid

- **Reading shared values during render:** `sharedValue.value` in JSX causes re-render loops. Only read in `useAnimatedStyle` or worklets.
- **Two celebration modals at once:** If title unlocks during level-up, bundle into LevelUpOverlay. Never stack overlays.
- **runOnJS for every animation callback:** Only use `runOnJS` when calling non-worklet JS from a worklet (like setState).
- **Animating layout properties (width/height as absolute px):** Use a percentage-width inner View or `scaleX` transform. Layout thrash kills 60fps.
- **Quest "accept" button:** Auto-track by design. No accept button (adab: no pressure mechanics).
- **Shame copy on expired quests:** Expired quests silently disappear. No "You missed it" message.
- **Showing earnedXP instead of cappedXP in float:** The XP float MUST show the post-cap amount. The soft cap is invisible.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth XP bar animation | Custom RN Animated API | `useSharedValue` + `useAnimatedStyle` (Reanimated 4) | UI-thread execution; JS Animated API drops frames on older devices |
| Haptic patterns | Custom vibration timing | `expo-haptics` with `impactAsync(Heavy)` repeated | iOS Taptic Engine requires system APIs |
| Level derivation | Linear scan 1-100 | Binary search `levelForXP()` | Cleaner code; same practical speed |
| Quest no-repeat tracking | Full DB query per template | In-memory Set of last 7 days' template IDs from `questRepo` | Simple, fast |
| Modal enter/exit animation | Manual opacity/scale sequencing | Reanimated `ZoomIn`, `FadeIn` layout animation presets | Handles interruption correctly |
| UUID generation | Math.random-based IDs | `uuid` library (v13, already installed) via `generateId()` | Collision-safe, established pattern |

**Key insight:** Game logic in this domain is deceptively simple to get wrong (soft caps, streak multiplier rounding, level boundary conditions, XP formula interpretation as per-level vs cumulative). Pure TS functions with full unit test coverage catch edge cases before they reach users.

---

## Common Pitfalls

### Pitfall 1: react-native-worklets Not in package.json
**What goes wrong:** Version drift -- Reanimated upgrades but worklets stays at old transitive version, causing native crashes.
**Why it happens:** `react-native-worklets` (v0.7.4) is installed as a transitive dep of `react-native-reanimated` but not declared in package.json.
**How to avoid:** Run `npx expo install react-native-worklets` to pin it in package.json at the SDK 54-compatible version. Do NOT add the babel plugin manually -- `babel-preset-expo` handles it automatically.
**Warning signs:** "Duplicate plugin/preset detected" error if babel plugin added manually.

### Pitfall 2: Level-Up Overlay Glitches Inside React Native Modal
**What goes wrong:** Reanimated entering/exiting animations on `Animated.View` inside a `<Modal>` component cause visual glitches or animation doesn't fire on iOS.
**Why it happens:** Known interaction between `react-native-screens` and Reanimated layout animations inside RN Modal.
**How to avoid:** Use an absolute-positioned full-screen overlay View in the component tree with `StyleSheet.absoluteFillObject`. Control visibility with state, not Modal's visible prop.
**Warning signs:** Animation fires on Android but not iOS, or first animation is skipped.

### Pitfall 3: Floating XP Label Position Drift
**What goes wrong:** XP float label appears at (0, 0) or wrong position when habits are scrolled in FlatList.
**Why it happens:** `onLayout` gives position relative to parent, not screen. FlatList items scroll.
**How to avoid:** Use `ref.current.measureInWindow(callback)` to get absolute screen coordinates. Position the float label in a portal-like overlay at the root layout level.
**Warning signs:** Float label appears at top-left or jumps on scroll.

### Pitfall 4: XP Double-Counting on Retry
**What goes wrong:** If `completeHabit()` throws after writing to `xp_ledger` but before updating `users.totalXp`, a retry creates a second XP ledger entry.
**Why it happens:** Two separate DB writes with no transaction.
**How to avoid:** The XP ledger is the source of truth. `users.totalXp` is a denormalized cache. On app load, always recompute from `xpRepo.getLifetimeTotal()` and reconcile.
**Warning signs:** Player's displayed XP doesn't match ledger sum.

### Pitfall 5: Quest Progress Race on Fast Completions
**What goes wrong:** User completes 3 habits in rapid succession; quest progress updates step on each other.
**Why it happens:** Concurrent async DB writes can read stale progress values.
**How to avoid:** Use atomic increment at SQL level: `SET progress = MIN(progress + 1, target_value)`. Or serialize quest updates within the store action.
**Warning signs:** Quest shows "2/5" when 3 completions have fired.

### Pitfall 6: Soft Cap Visible in XP Float
**What goes wrong:** Player notices XP doesn't match mental math ("I should have gotten 30 XP but only got 15").
**Why it happens:** XP float shows pre-cap `earnedXP` instead of post-cap `cappedXP`.
**How to avoid:** The float label MUST display `cappedXP`. The breakdown format "15 x 1.5x = +22 XP" should use the final capped number. The cap itself is never mentioned in UI.
**Warning signs:** Player confusion about XP math.

### Pitfall 7: Title Check Performance
**What goes wrong:** Checking 26 titles after every completion is slow if it queries DB per-title.
**Why it happens:** Naive implementation runs separate queries for each title condition.
**How to avoid:** Build a `PlayerStats` snapshot once per completion event (one round-trip), then run `checkTitleUnlocks()` synchronously against it. The 26-title check is O(26) pure computation.
**Warning signs:** Habit completion feels laggy after adding title check.

### Pitfall 8: XP Formula Interpretation
**What goes wrong:** Confusing "XP required to reach level N" (cumulative) with "XP to advance from level N to N+1" (per-level).
**Why it happens:** The blueprint formula `40 * level^1.85` gives the per-level XP cost. The cumulative function must sum these.
**How to avoid:** Unit tests that verify cumulative XP against the blueprint simulation table values (Level 5 = 915 cumulative, Level 10 = 7,232 cumulative, etc.).
**Warning signs:** Players level up way too fast or too slow compared to blueprint targets.

---

## Code Examples

Verified patterns from official sources and established project patterns:

### XP Formula Verification
```typescript
// Verified against Game Design Bible (blueprint/03-game-design-bible.md)
// Formula: xp_to_next(level) = floor(40 * level^1.85)
// Cumulative thresholds from blueprint simulation table:
//   Level 1:     0 XP (starting)
//   Level 2:    40 XP
//   Level 5:   915 XP (achievable in week 1 at 5 habits/day)
//   Level 10: 7,232 XP
//   Level 20: 47,816 XP (~month 2-3 for consistent player)
//   Level 50: 427,628 XP
//   Level 100: 1,918,688 XP (aspirational -- years)
```

### Haptic Sequences
```typescript
// Source: expo-haptics docs (docs.expo.dev/versions/latest/sdk/haptics/)
import * as Haptics from 'expo-haptics';

// Habit completion (already in Phase 3 -- keep as-is):
await Haptics.selectionAsync();

// Quest completion:
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Level-up (heavy burst -- fire 3x with delay for dramatic effect):
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
await new Promise(r => setTimeout(r, 100));
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
await new Promise(r => setTimeout(r, 80));
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);

// Title unlock:
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

### titleRepo (Missing -- Must Create)
```typescript
// src/db/repos/titleRepo.ts -- pattern follows xpRepo.ts
import { eq } from 'drizzle-orm';
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
};
```

### Title Seed Data (26 Titles from Blueprint)
```typescript
// src/domain/title-seed-data.ts
// Source: blueprint/04-worldbuilding.md -- Identity Titles section
// All 26 titles with unlock conditions mapped to schema's unlockType enum

export const TITLE_SEED_DATA = [
  // --- Common (10) ---
  { name: 'The Beginner', rarity: 'common', unlockType: 'onboarding', unlockValue: 1, unlockHabitType: null,
    flavorText: 'Every journey of a thousand miles begins with a single step.', sortOrder: 1 },
  { name: 'The Willing', rarity: 'common', unlockType: 'total_completions', unlockValue: 1, unlockHabitType: null,
    flavorText: 'The intention has become action. This is where discipline begins.', sortOrder: 2 },
  { name: 'The Early Riser', rarity: 'common', unlockType: 'habit_type_streak', unlockValue: 3, unlockHabitType: 'fajr',
    flavorText: 'You chose dawn over comfort. Your discipline is stirring.', sortOrder: 3 },
  // ... (remaining 23 titles follow same pattern)
  // --- Rare (10) ---
  { name: 'The Steadfast (Al-Sabir)', rarity: 'rare', unlockType: 'habit_type_streak', unlockValue: 40, unlockHabitType: 'fajr',
    flavorText: 'Forty dawns. The sun rose and you rose with it. Steadfastness is yours.', sortOrder: 11 },
  // ...
  // --- Legendary (6) ---
  { name: 'The Unbreakable', rarity: 'legendary', unlockType: 'habit_streak', unlockValue: 100, unlockHabitType: null,
    flavorText: 'One hundred days without breaking. Your word to yourself is iron.', sortOrder: 21 },
  // ...
];
```

### Quest Template Pool Structure
```typescript
// src/domain/quest-templates.ts
// Source: blueprint/05-feature-systems.md -- Quest Board section

export const QUEST_TEMPLATES: QuestTemplate[] = [
  // --- Daily (20 templates, 3 active per day, 25-50 XP) ---
  { id: 'daily-all-salah', type: 'daily', description: 'Complete all 5 salah today',
    targetType: 'all_salah', targetValue: 5, minLevel: 1, xpReward: 50 },
  { id: 'daily-3-habits', type: 'daily', description: 'Complete 3 habits today',
    targetType: 'any_completion', targetValue: 3, minLevel: 1, xpReward: 30 },
  // ...
  // --- Weekly (8 templates, 2 active per week, 100-200 XP) ---
  { id: 'weekly-7-streak', type: 'weekly', description: 'Maintain a 7-day streak on any habit',
    targetType: 'streak_reach', targetValue: 7, minLevel: 5, xpReward: 150 },
  // ...
  // --- Stretch (3 templates, 1 active per week, 300-500 XP) ---
  { id: 'stretch-50-completions', type: 'stretch', description: 'Complete 50 total habit check-ins this week',
    targetType: 'total_completions', targetValue: 50, minLevel: 8, xpReward: 500 },
  // ...
];
```

### Quest Expiry and Regeneration
```typescript
// Called on app foreground / first render of quests tab
// 1. Expire old quests (silent -- no shame copy)
await questRepo.expireOld();

// 2. Check if daily quests need regeneration
const active = await questRepo.getActive(userId);
const dailyActive = active.filter(q => q.type === 'daily');
if (dailyActive.length < 3) {
  const recentIds = await questRepo.getRecentTemplateIds(userId, 7);
  const templates = selectQuestTemplates(
    QUEST_TEMPLATES, 'daily', 3, level, activeHabitTypes, recentIds
  );
  for (const t of templates) {
    await questRepo.create(questFromTemplate(t, userId));
  }
}
```

### Level-Up Mentor Copy
```typescript
// src/domain/level-copy.ts
// Source: CONTEXT.md locked decisions + Claude's discretion for non-milestone levels

export function getLevelUpCopy(level: number): string {
  // Milestone copy (locked from CONTEXT.md):
  if (level === 5) return 'Your discipline grows stronger.';
  if (level === 10) return 'A new horizon opens before you.';
  if (level === 20) return 'Consistency is becoming your nature.';
  if (level === 50) return 'Few have walked this far. MashaAllah.';

  // Range copy (Claude's discretion):
  if (level <= 3) return 'The journey has begun. Keep going.';
  if (level <= 7) return 'Momentum is building. You can feel it.';
  if (level <= 15) return 'Your path is becoming clear.';
  if (level <= 30) return 'Discipline is becoming habit.';
  if (level <= 75) return 'The mountain bows to the persistent.';
  return 'You walk where few dare to tread.';
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `runOnJS()` for JS callbacks from worklets | `scheduleOnRN()` (new name) | Reanimated 4.x | `runOnJS` still re-exported as alias, not urgent |
| `restDisplacementThreshold` on withSpring | `energyThreshold` (single param) | Reanimated 4.x | Remove old params if used |
| Reanimated babel plugin in babel.config.js | `babel-preset-expo` handles automatically | Expo SDK 54 | Do NOT add plugin manually -- causes conflicts |
| Modal for celebrations | Absolute-positioned overlay with zIndex | Community pattern 2024+ | Avoids react-native-screens glitch with Reanimated in Modal |
| Old Architecture | New Architecture (required for Reanimated 4) | Expo SDK 54 | Already enabled in app.json |

**Deprecated/outdated in Reanimated 4:**
- `addWhitelistedNativeProps`/`addWhitelistedUIProps`: Removed, were no-ops
- `useWorkletCallback`: Removed
- `combineTransition`: Removed
- Old Architecture support: Removed from Reanimated 4

---

## Open Questions

1. **Quest template dataset completeness**
   - What we know: Architecture is clear; 3 example categories from blueprint; targetType enum defined
   - What's unclear: Full set of 20+ quest templates needs writing as content
   - Recommendation: Write 20 daily, 8 weekly, 3 stretch templates in `quest-templates.ts`. Ensure templates reference only habits the player has (filter by `activeHabitTypes`). Scale: daily 25-50 XP, weekly 100-200 XP, stretch 300-500 XP.

2. **Title seed data migration approach**
   - What we know: 26 titles fully defined in blueprint; `titles` table exists; schema has all needed columns
   - What's unclear: Whether to use Drizzle migration or runtime seed check
   - Recommendation: Runtime seed check in `gameStore.loadGame()` -- if `titles` table is empty, insert all 26. This avoids migration ordering issues and works for both fresh installs and existing users. The titles table is "seed data" (game config, not user data), so idempotent insert is clean.

3. **Quests that depend on streak data (e.g., "Maintain a 7-day streak")**
   - What we know: `streak_reach` quest type needs to evaluate current streak state
   - What's unclear: Whether to check once daily or on every completion
   - Recommendation: Check on every completion -- streaks only change on completion events anyway. Build the quest progress evaluation into the same post-completion flow that handles XP and titles.

4. **Integration point for XP into completeHabit()**
   - What we know: `habitStore.completeHabit()` has `xpEarned: 0` placeholder at line 222
   - What's unclear: Whether to call `gameStore.awardXP()` from within `habitStore.completeHabit()` (cross-store call) or have the UI layer orchestrate
   - Recommendation: Have `habitStore.completeHabit()` return the completion result, then the UI layer (or a coordinating action) calls `gameStore.awardXP()`. This keeps stores decoupled. Alternatively, `habitStore.completeHabit()` can call `gameStore.getState().awardXP()` directly -- Zustand allows cross-store access via `getState()`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest-expo ~54.0.17 |
| Config file | jest.config.js |
| Quick run command | `npm test -- --testPathPattern=domain/` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAME-01 | XP calculation with multiplier and soft cap | unit | `npm test -- --testPathPattern=domain/xp-engine` | No -- Wave 0 |
| GAME-02 | Level derivation from total XP; level-up detection | unit | `npm test -- --testPathPattern=domain/xp-engine` | No -- Wave 0 |
| GAME-03 | Title unlock condition evaluation for all 26 titles | unit | `npm test -- --testPathPattern=domain/title-engine` | No -- Wave 0 |
| GAME-04 | Quest template selection (no repeat within 7 days, level-gated) | unit | `npm test -- --testPathPattern=domain/quest-engine` | No -- Wave 0 |
| GAME-05 | Quest progress evaluation per completion event | unit | `npm test -- --testPathPattern=domain/quest-engine` | No -- Wave 0 |
| GAME-06 | XP economy simulation matches blueprint targets | unit | `npm test -- --testPathPattern=domain/xp-engine` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=domain/` (runs all domain tests, < 5s)
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/domain/xp-engine.test.ts` -- covers GAME-01, GAME-02, GAME-06
- [ ] `__tests__/domain/title-engine.test.ts` -- covers GAME-03
- [ ] `__tests__/domain/quest-engine.test.ts` -- covers GAME-04, GAME-05

*(No framework gaps -- jest-expo already installed and working from Phase 2/3 with 6 existing test files)*

---

## Sources

### Primary (HIGH confidence)
- Project codebase: streak-engine.ts, gameStore.ts, xpRepo.ts, questRepo.ts, schema.ts, habitStore.ts, habits.tsx -- all read directly
- Blueprint: 03-game-design-bible.md -- XP formula, simulation table, streak model, quest types, anti-burnout mechanics
- Blueprint: 04-worldbuilding.md -- All 26 Identity Titles with unlock conditions and flavor text
- Blueprint: 05-feature-systems.md -- Quest Board spec, quest examples, states, edge cases
- app.json -- confirmed `newArchEnabled: true`
- package.json -- confirmed all dependency versions

### Secondary (MEDIUM confidence)
- [Expo SDK 54 changelog](https://expo.dev/changelog/sdk-54) -- confirmed Reanimated 4 + react-native-worklets pairing
- [Reanimated Getting Started](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) -- babel-preset-expo auto-configuration
- [Expo Haptics docs](https://docs.expo.dev/versions/latest/sdk/haptics/) -- all haptic types and enums verified
- [Reanimated entering/exiting docs](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/) -- ZoomIn, FadeIn, FadeOut confirmed
- [Reanimated Discussion #8778](https://github.com/software-mansion/react-native-reanimated/discussions/8778) -- worklets version matching in Expo Go

### Tertiary (LOW confidence)
- react-native-screens interaction with Reanimated in Modal: Community-reported pattern, not official doc. Warrants testing before committing to overlay approach; overlay is safer default.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- verified from package.json, node_modules, and official docs
- Architecture: HIGH -- directly modeled on existing streak-engine.ts and store patterns in codebase
- Animation APIs: HIGH -- Reanimated 4 docs verified; worklets confirmed installed
- Pitfalls: HIGH -- worklets gap verified; Modal glitch is community-reported but overlay pattern is safe default
- XP balance numbers: HIGH -- formula locked; blueprint simulation table provides authoritative checkpoints
- Title/Quest content: HIGH -- all 26 titles and quest specs come from blueprint docs in this repo

**Research date:** 2026-03-14
**Valid until:** 2026-06-14 (Reanimated and Expo stable ecosystem -- 90 days)
