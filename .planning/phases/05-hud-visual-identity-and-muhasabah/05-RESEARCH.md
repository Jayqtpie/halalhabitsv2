# Phase 5: HUD, Visual Identity, and Muhasabah - Research

**Researched:** 2026-03-15
**Domain:** React Native Skia scene rendering, sprite animation, interactive HUD, Muhasabah flow
**Confidence:** HIGH (stack confirmed), MEDIUM (spritesheet animation patterns), HIGH (data layer)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full immersive pixel art scene — the entire Home screen IS the game world
- Player character sprite with 2-4 frame idle animation (spritesheet)
- Interactive tappable objects navigate to other tabs (quest board, prayer mat, journal)
- HUD stat overlays on top: level badge, XP bar, best active streak count, next prayer countdown
- 4 environments gated by level: Quiet Study → Growing Garden → Scholar's Courtyard → Living Sanctuary
- Dramatic reveal transition on environment unlock
- Real-time day/night cycle based on local time
- Muhasabah: 3-screen guided flow (emoji scale → highlight pick → tomorrow focus) + closing ayah
- Muhasabah is PRIVATE (device-only, never synced — enforced by Privacy Gate)
- Muhasabah is skippable with zero penalty or shame
- ~10-15 XP for Muhasabah completion (effort-based)
- AI-generated pixel art assets imported as PNGs/spritesheets

### Claude's Discretion
- Rendering architecture (hybrid PNG + Skia effects vs pure PNG with Reanimated)
- Exact level thresholds for environment transitions
- Spritesheet animation implementation details (Skia frame cycling)
- Interactive object hit areas and visual feedback
- Day/night cycle implementation (gradient overlays, tint shifts)
- HUD overlay layout, positioning, and translucency
- Muhasabah prompt rotation logic and content
- Quranic ayah/hadith selection and storage (curated set)
- Environment reveal animation implementation
- Pixel art icon set for habit cards

### Deferred Ideas (OUT OF SCOPE)
- Voice pack system (changeable app personality)
- Arabic terminology toggle
- Gear icon redesign on habits screen
- Gradual within-environment evolution (progressive detail additions between level thresholds)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HUD-01 | Home screen displays game-world HUD with current level, XP bar, streak count, and active quests | gameStore has currentLevel/totalXP/quests; habitStore has streaks; Canvas + Reanimated overlay pattern |
| HUD-02 | HUD uses 16-bit pixel art aesthetic with crisp rendering (Skia FilterQuality.None) | Skia Image sampling: `{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }` — FilterQuality.None is old API |
| HUD-03 | XP gain and level-up animations are smooth 60fps (Reanimated) | Reanimated 4.1.1 installed; existing XPProgressBar/CelebrationManager reusable on HUD |
| HUD-04 | Haptic feedback on habit completion, level-up, and quest completion | expo-haptics 15.0.8 installed; already used in Phase 4 |
| MUHA-01 | Nightly Muhasabah presents structured reflection prompts (30-60 seconds) | 3-screen modal flow driven by Zustand muhasabahStore; prayer-times.ts provides Isha time |
| MUHA-02 | User can review today's completions and set intention for tomorrow | habitStore.completions available; tomorrow focus is quick-pick enum |
| MUHA-03 | Muhasabah data is private (device-only, never synced) | muhasabah_entries already PRIVATE in privacy-gate; table already in schema.ts + migration 0000 |
| MUHA-04 | User can skip Muhasabah without penalty or shame | Skip path at every screen; no XP deducted, no shame copy |
</phase_requirements>

---

## Summary

Phase 5 builds the immersive game-world Home HUD that makes HalalHabits feel like a premium retro RPG. The core architecture is a full-screen `Canvas` component from `@shopify/react-native-skia` rendering layered pixel art backgrounds, a day/night tint overlay, and an animated character sprite — with invisible `Pressable` views floating above the Canvas for tap detection. React Native views (not Skia drawables) handle HUD stat overlays and celebration triggers, using `expo-blur` for the translucent glass effect.

The critical installation gap: `@shopify/react-native-skia` is **not installed** in the project. The CONTEXT.md described it as "already installed" but the package.json and node_modules confirm it is absent. Wave 0 must install it (`npx expo install @shopify/react-native-skia`). The compatible version for Expo SDK 54 + RN 0.81 is `^2.2.3` (confirmed via Expo changelog and Skia docs stating `react-native@>=0.79` support).

The Muhasabah data layer is simpler than expected: `muhasabah_entries` table already exists in migration `0000_dark_mandrill.sql` and is already classified as `PRIVATE` in the Privacy Gate module. No new migration is needed — only a new `muhasabahRepo` and `muhasabahStore` following the established store-repo-engine pattern.

**Primary recommendation:** Use Skia Canvas as the scene rendering layer (backgrounds, character sprite, day/night tint), with standard React Native views layered above for HUD overlays and touch targets. Do not try to make the entire HUD interactive within Skia — invisible Pressable overlays are the established pattern.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @shopify/react-native-skia | ^2.2.3 | Pixel art scene rendering, sprite animation | GPU-accelerated, Reanimated integration, already in design tokens |
| react-native-reanimated | ~4.1.1 | 60fps animations on UI thread | Already installed; Skia integrates directly with shared values |
| expo-haptics | ~15.0.8 | XP gain, level-up, quest completion feedback | Already installed; established in Phase 4 |
| expo-blur | (not installed) | Translucent HUD stat overlay glass effect | Part of Expo Go; no native build required |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| adhan (already installed) | ^4.4.3 | Isha time for Muhasabah trigger | Already in prayer-times.ts service |
| expo-linear-gradient | (via expo) | Alternate to Skia gradient for RN-layer overlays | When gradient is on RN view layer, not Canvas |
| react-native-worklets | 0.5.1 (installed) | Required peer dep for Reanimated 4 | Already installed as peer dep |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Skia Atlas (spritesheet) | `useImage` + manual rect clipping | Atlas is SOTA for spritesheet; manual clipping is fine for ≤4 frames |
| expo-blur HUD overlay | Skia BackdropFilter | Skia BackdropFilter works but requires Canvas wrapping; expo-blur simpler for RN-layer use |
| Invisible Pressable overlays | react-native-skia-gesture | Skia-gesture adds complexity; invisible Pressables are simpler for defined tap zones |

**Installation (Wave 0):**
```bash
npx expo install @shopify/react-native-skia expo-blur
```

---

## Architecture Patterns

### Recommended Screen Structure (Home HUD)
```
app/(tabs)/index.tsx         # Home tab entry — replaces PlaceholderScreen
src/
├── components/
│   ├── hud/
│   │   ├── HudScene.tsx          # Full-screen Canvas with layered PNG backgrounds
│   │   ├── CharacterSprite.tsx   # Atlas-based idle animation within Canvas
│   │   ├── DayNightOverlay.tsx   # Skia Rect with animated tint color
│   │   ├── SceneObjects.tsx      # Invisible Pressable overlays for tap zones
│   │   ├── HudStatBar.tsx        # RN view layer: level + XP + streak + prayer
│   │   └── EnvironmentReveal.tsx # Reanimated fade/zoom transition overlay
│   └── muhasabah/
│       ├── MuhasabahModal.tsx    # Container: 3-screen modal flow
│       ├── MuhasabahStep1.tsx    # Emoji mood scale
│       ├── MuhasabahStep2.tsx    # Highlight pick from today's completions
│       ├── MuhasabahStep3.tsx    # Tomorrow focus quick-pick
│       └── MuhasabahClosing.tsx  # Ayah/hadith display + XP award
├── domain/
│   └── muhasabah-engine.ts      # Pure TS: Isha trigger check, ayah rotation
├── stores/
│   └── muhasabahStore.ts        # Zustand: muhasabah modal state, today's entry
└── db/
    └── repos/
        └── muhasabahRepo.ts     # DB CRUD for muhasabah_entries (PRIVATE)
```

### Pattern 1: Layered Canvas + RN View Architecture
**What:** The home screen uses a `Canvas` for pixel art rendering with RN views floating above for stat overlays and touch handling. The layer order is: Canvas (bottom) → Invisible Pressable tap zones (absolute) → HUD stat bar (absolute, top).
**When to use:** Whenever you need both GPU-rendered pixel art AND standard RN interactive components on the same screen.

```typescript
// Source: Shopify react-native-skia docs (Canvas overview + Gestures)
export function HomeHudScreen() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Layer 1: Skia pixel art scene */}
      <Canvas style={StyleSheet.absoluteFill}>
        <HudScene />
        <DayNightOverlay />
        <CharacterSprite />
      </Canvas>

      {/* Layer 2: Invisible Pressable tap zones for interactive objects */}
      <SceneObjects />

      {/* Layer 3: HUD stat overlay (expo-blur glass effect) */}
      <HudStatBar />
    </View>
  );
}
```

### Pattern 2: Pixel Art Image Rendering with Nearest-Neighbor Sampling
**What:** Load environment PNG backgrounds with `useImage`, render with `FilterMode.Nearest` to prevent antialiasing blur on scaled pixel art.
**When to use:** All pixel art PNG assets (backgrounds, character sprite, icons).

```typescript
// Source: https://shopify.github.io/react-native-skia/docs/images/
import { Canvas, Image, useImage, FilterMode, MipmapMode } from '@shopify/react-native-skia';

function HudScene() {
  const bg = useImage(require('../../../assets/environments/quiet-study.png'));
  if (!bg) return null;

  return (
    <Image
      image={bg}
      x={0}
      y={0}
      width={screenWidth}
      height={screenHeight}
      fit="cover"
      sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
    />
  );
}
```

**CRITICAL NOTE:** `FilterQuality.None` is the **old API** (pre-1.0). The current API uses `sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}`. The design token comment referencing `FilterQuality.None` is outdated — update usage in implementation.

### Pattern 3: Spritesheet Animation (Atlas + Reanimated)
**What:** Load character sprite PNG as an Atlas, cycle frames using `useRectBuffer` driven by a Reanimated clock-based derived value.
**When to use:** Any animated spritesheet (character idle, object pulse animations).

```typescript
// Source: Shopify react-native-skia Atlas docs + community patterns
import { Atlas, useImage, useRectBuffer, useRSXformBuffer, Skia, FilterMode, MipmapMode } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

const FRAME_COUNT = 4;
const FRAME_WIDTH = 32;   // px — matches spritesheet layout
const FRAME_HEIGHT = 48;

function CharacterSprite({ x, y }: { x: number; y: number }) {
  const spriteSheet = useImage(require('../../../assets/sprites/character-idle.png'));
  const frameIndex = useSharedValue(0);

  // Advance frame every 200ms for ~5fps idle animation
  React.useEffect(() => {
    frameIndex.value = withRepeat(
      withTiming(FRAME_COUNT - 1, { duration: 200 * FRAME_COUNT, easing: Easing.steps(FRAME_COUNT) }),
      -1,
      false,
    );
  }, []);

  const sprites = useRectBuffer(FRAME_COUNT, (rect, i) => {
    'worklet';
    rect.setXYWH(i * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT);
  });

  const transforms = useRSXformBuffer(1, (rsxform) => {
    'worklet';
    rsxform.set(1, 0, x, y);
  });

  // Derive which sprite rect to show
  const activeSpriteRects = useDerivedValue(() => {
    'worklet';
    const frame = Math.floor(frameIndex.value);
    // Return single-element buffer for current frame
    return [{ x: frame * FRAME_WIDTH, y: 0, width: FRAME_WIDTH, height: FRAME_HEIGHT }];
  });

  if (!spriteSheet) return null;

  return (
    <Atlas
      image={spriteSheet}
      sprites={sprites}
      transforms={transforms}
      sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
    />
  );
}
```

**Simpler alternative for 2-4 frames (recommended for MVP):** Use `useImage` with manual rect clipping via Skia `Image` + `clip` prop. This avoids Atlas complexity for very small frame counts.

```typescript
// Manual frame cycling — simpler for ≤4 frames
function CharacterSprite({ x, y }: { x: number; y: number }) {
  const spriteSheet = useImage(require('../../../assets/sprites/character.png'));
  const frame = useSharedValue(0);
  const FRAME_W = 32, FRAME_H = 48, FRAME_COUNT = 4;

  useEffect(() => {
    frame.value = withRepeat(
      withTiming(FRAME_COUNT, { duration: 800, easing: Easing.steps(FRAME_COUNT, false) }),
      -1, false
    );
  }, []);

  const clipRect = useDerivedValue(() => ({
    x: Math.floor(frame.value) * FRAME_W,
    y: 0,
    width: FRAME_W,
    height: FRAME_H,
  }));

  if (!spriteSheet) return null;
  // Clip to current frame region, draw at scene position
  return (
    <Group clip={clipRect} transform={[{ translateX: x - clipRect.value.x }, { translateY: y }]}>
      <Image
        image={spriteSheet}
        x={0} y={0}
        width={FRAME_W * FRAME_COUNT} height={FRAME_H}
        sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
      />
    </Group>
  );
}
```

### Pattern 4: Day/Night Tint Overlay
**What:** A semi-transparent colored Rect drawn over the entire scene, with color animated by Reanimated based on current local hour. The Skia `interpolateColors` function converts Reanimated values to Skia-compatible color format.
**When to use:** Day/night cycle affecting the entire scene.

```typescript
// Source: Shopify skia docs (Animations + Color Filters)
import { Rect, interpolateColors } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

// Time-of-day segments (0-24h mapped to 0-1)
const TIME_STOPS = [0, 0.22, 0.42, 0.75, 0.92, 1]; // midnight, dawn, day, evening, night, midnight
const TINT_COLORS = [
  'rgba(20, 15, 60, 0.55)',   // midnight — deep indigo
  'rgba(255, 180, 80, 0.20)', // dawn — golden orange
  'rgba(0, 0, 0, 0.00)',      // day — no tint
  'rgba(255, 100, 40, 0.25)', // evening — warm orange
  'rgba(20, 15, 80, 0.50)',   // night — indigo
  'rgba(20, 15, 60, 0.55)',   // midnight — wrap
];

function DayNightOverlay() {
  const timeProgress = useSharedValue(getTimeProgress()); // 0–1 within 24h

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      timeProgress.value = getTimeProgress();
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const tintColor = useDerivedValue(() =>
    interpolateColors(timeProgress.value, TIME_STOPS, TINT_COLORS)
  );

  return <Rect x={0} y={0} width={screenWidth} height={screenHeight} color={tintColor} />;
}

function getTimeProgress(): number {
  const now = new Date();
  return (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
}
```

### Pattern 5: Invisible Pressable Tap Zones for Scene Objects
**What:** Invisible `Pressable` views absolutely positioned over the pixel art scene at the coordinates matching quest board, prayer mat, and journal objects. The Skia Canvas has no built-in per-object touch detection — overlay views are the recommended pattern per official docs.
**When to use:** All interactive scene objects.

```typescript
// Source: Shopify react-native-skia gestures docs
// "overlay an animated view on it, ensuring the same transformations are mirrored"
function SceneObjects({ onTapQuestBoard, onTapPrayerMat, onTapJournal }: Props) {
  return (
    <>
      {/* Quest Board tap zone */}
      <Pressable
        style={[styles.tapZone, { left: 40, top: 120, width: 60, height: 60 }]}
        onPress={onTapQuestBoard}
        hitSlop={12}
      />
      {/* Prayer mat tap zone */}
      <Pressable
        style={[styles.tapZone, { left: 180, top: 200, width: 50, height: 40 }]}
        onPress={onTapPrayerMat}
        hitSlop={12}
      />
      {/* Journal tap zone (visible glow when Muhasabah available) */}
      <Pressable
        style={[styles.tapZone, { right: 40, top: 160, width: 55, height: 55 }]}
        onPress={onTapJournal}
        hitSlop={12}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tapZone: {
    position: 'absolute',
    // transparent — invisible over scene
  },
});
```

### Pattern 6: HUD Stat Overlay (expo-blur glass panel)
**What:** A translucent panel at the bottom of the Home screen showing level, XP bar, streak, and next prayer. Uses `expo-blur` `BlurView` for the glass/frosted effect. Reuse existing `XPProgressBar` and `LevelBadge` components.
**When to use:** The persistent stats overlay on the Home HUD.

```typescript
// Source: Expo BlurView docs
import { BlurView } from 'expo-blur';

function HudStatBar() {
  return (
    <BlurView
      intensity={60}
      tint="dark"
      style={styles.statBar}
    >
      <LevelBadge />
      <XPProgressBar />
      <StreakDisplay />
      <PrayerCountdown />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  statBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: safeAreaBottom,
    paddingHorizontal: 16,
    paddingTop: 12,
    overflow: 'hidden', // Required for blur + borderRadius
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
```

### Pattern 7: Environment Reveal Animation
**What:** When player levels up into a new environment threshold, a Reanimated opacity sequence: current scene fades out (0.8s), new background fades in (1.2s) while CelebrationManager-style overlay shows "New Area Unlocked" text.
**When to use:** Level-gate environment transitions.

```typescript
// Source: Reanimated withSequence + withTiming docs
import { useSharedValue, withSequence, withTiming, withDelay } from 'react-native-reanimated';

function EnvironmentReveal({ newEnvironment, onComplete }: Props) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 400 }),       // Overlay fades in (blackout)
      withDelay(200, withTiming(1, { duration: 0 })), // Hold (swap background)
      withTiming(0, { duration: 1200 }),      // Fade out revealing new world
    );
  }, []);
  // ...
}
```

### Pattern 8: Muhasabah 3-Screen Modal Flow
**What:** A full-screen modal (React Navigation modal stack or StyleSheet.absoluteFillObject overlay) presenting 3 sequential screens. State managed in `muhasabahStore`. Each step writes partial data; final step commits full entry to DB and awards XP via existing `gameStore.awardXP`.
**When to use:** Muhasabah flow triggered by Isha time or journal tap.

```typescript
// muhasabahStore.ts — follows existing store-repo-engine pattern
interface MuhasabahState {
  isOpen: boolean;
  currentStep: 0 | 1 | 2 | 'closing';
  todayEntry: Partial<MuhasabahDraft>;
  open: () => void;
  close: () => void;
  setMoodRating: (rating: 1 | 2 | 3 | 4 | 5) => void;
  setHighlight: (habitId: string) => void;
  setFocusIntent: (intent: 'momentum' | 'try_harder' | 'rest') => void;
  submit: (userId: string) => Promise<void>; // writes to DB, awards XP
}
```

### Anti-Patterns to Avoid
- **Skia for UI controls:** Don't draw buttons, text inputs, or list items inside Canvas. Skia is for the pixel art scene only — all interactive UI is standard RN views.
- **useImage inside the Skia Canvas tree per-frame:** Call `useImage` at component level (not inside render), it's a hook that triggers async loading.
- **Transform animations on Group with Reanimated on Android:** Animated `transform` prop on a `Group` has a known performance regression on Android (GitHub issue #3327). Prefer translating individual children or use a wrapper Animated.View outside Canvas.
- **FilterQuality.None (old API):** This enum was removed. Use `sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}`.
- **Global tint via Skia ColorFilter on entire Canvas:** Instead, draw a transparent tinted Rect over the background layers inside Canvas — simpler and avoids filter stack complexity.
- **Muhasabah XP via direct DB write:** Use `gameStore.awardXP(userId, 12, 1.0, 'muhasabah')` — never write to xp_ledger directly from components.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pixel art rendering without blur | Custom shader / canvas scaling hacks | `sampling={{ filter: FilterMode.Nearest }}` prop on Skia Image | Edge case: different GPU drivers handle upscaling differently; Skia handles this correctly across iOS/Android |
| Sprite frame cycling | Manual setInterval + useState frame counter | Reanimated `withRepeat` + `withTiming(Easing.steps)` | setInterval is JS thread; Reanimated runs on UI thread at 60fps |
| Translucent overlay glass effect | Custom semi-transparent View + manual blur simulation | `expo-blur` BlurView | Platform blur APIs on iOS (UIVisualEffectView) vs Android differ enormously; expo-blur handles both |
| Haptic feedback mapping | Direct Vibration API | `expo-haptics` ImpactFeedbackStyle/NotificationFeedbackType | iOS Taptic engine intensity is non-linear; expo-haptics maps correctly |
| Day/night color interpolation | Reanimated `interpolateColor` | Skia `interpolateColors` | Reanimated's interpolateColor uses RN color format which is incompatible with Skia's color format |
| Muhasabah PRIVATE enforcement | Ad-hoc "don't sync this" comment | `assertSyncable('muhasabah_entries')` before any sync queue write | Privacy Gate already enforces this; calling assertSyncable throws if violated |

**Key insight:** The biggest risk in this phase is over-engineering the Skia scene. Everything interactive, text-based, and stateful belongs in React Native views layered above the Canvas — not drawn inside it.

---

## Common Pitfalls

### Pitfall 1: Skia Not Installed (Critical)
**What goes wrong:** The CONTEXT.md states Skia is "already installed" but it is absent from `package.json` and `node_modules`. Any code importing from `@shopify/react-native-skia` will crash immediately.
**Why it happens:** CONTEXT.md was written before researching actual package.json.
**How to avoid:** Wave 0 task MUST run `npx expo install @shopify/react-native-skia expo-blur` before any scene code is written.
**Warning signs:** Import error `Cannot find module '@shopify/react-native-skia'` at startup.

### Pitfall 2: FilterQuality.None is Not the Current API
**What goes wrong:** The design tokens and CONTEXT.md reference `FilterQuality.None`. This enum does not exist in react-native-skia 2.x — importing it throws a runtime error.
**Why it happens:** API changed between 0.x/1.x and 2.x releases.
**How to avoid:** Use `sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}` on all pixel art Image components.
**Warning signs:** TypeScript error `Property 'None' does not exist on type 'typeof FilterQuality'`.

### Pitfall 3: useImage Returns null Until Loaded
**What goes wrong:** Rendering a Skia `Image` with a null image prop crashes or shows nothing. If you don't null-check, you'll see white screens or errors.
**Why it happens:** `useImage` is async — assets load from the bundle on first render.
**How to avoid:** Always guard: `if (!bg) return null;` or use a loading state before rendering the Canvas.
**Warning signs:** Blank screen on first app open.

### Pitfall 4: Group Transform Performance on Android
**What goes wrong:** Applying an animated `transform` prop (from Reanimated shared value) to a Skia `Group` causes severe frame drops on Android (confirmed GitHub issue #3327).
**Why it happens:** Skia's Android renderer doesn't optimize transform-only redraws as efficiently as iOS.
**How to avoid:** For the character sprite position, prefer to animate `x` and `y` props directly on the `Image` component rather than wrapping in a transformed `Group`. Alternatively, wrap the entire Canvas in an `Animated.View` and translate at the RN layer.
**Warning signs:** Smooth iOS, choppy Android.

### Pitfall 5: Muhasabah Table Already Exists — Don't Create a Migration
**What goes wrong:** Creating a new migration `0003_muhasabah_entries.sql` when the table already exists causes a migration conflict error on existing installs.
**Why it happens:** `muhasabah_entries` was in migration `0000_dark_mandrill.sql` from Phase 2 (initial schema).
**How to avoid:** Only create the `muhasabahRepo` module; do NOT generate a new migration for this table.
**Warning signs:** "table muhasabah_entries already exists" SQLite error on app launch.

### Pitfall 6: Muhasabah XP Not Going Through gameStore
**What goes wrong:** Writing XP directly to `xp_ledger` table from muhasabahRepo bypasses the game engine's daily cap, quest progress tracking, and celebration queue.
**Why it happens:** It seems simpler to write directly to the DB from the repo.
**How to avoid:** Always call `gameStore.awardXP(userId, 12, 1.0, 'muhasabah')` to award Muhasabah XP. The XP pipeline is fully established.
**Warning signs:** XP appears in DB but no float label or celebration fires.

### Pitfall 7: Isha Time Not Available for Muhasabah Trigger
**What goes wrong:** Trying to trigger Muhasabah "at Isha time" when the user has no location set — prayer-times.ts returns null/errors for missing coordinates.
**Why it happens:** Location permission may not be granted, or user skipped location setup.
**How to avoid:** Muhasabah trigger has two modes: (a) Isha time detection when location is available, (b) fixed 9:00 PM fallback using `settings.muhasabahReminderTime` (already in DB schema). The journal tap is always available as a manual entry point.
**Warning signs:** Muhasabah never triggers for users without location.

### Pitfall 8: BlurView on Android Requires BlurTargetView
**What goes wrong:** `expo-blur` BlurView on Android doesn't blur without wrapping the content in `BlurTargetView` and passing its ref.
**Why it happens:** Android blur API requires identifying what to blur.
**How to avoid:** On Android, use `blurMethod="dimezisBlurView"`. Wrap the scene content (Canvas layer) in `BlurTargetView`. Alternatively, for the HUD stat bar, use a semi-transparent `rgba` background as Android fallback (acceptable trade-off for MVP).
**Warning signs:** HUD looks blurred on iOS but transparent/solid on Android.

---

## Code Examples

Verified patterns from official sources:

### expo-haptics for Game Events
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/haptics/
import * as Haptics from 'expo-haptics';

// Habit completion — medium impact
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// XP gain — light
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Level up — notification success (strongest positive)
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Quest complete — medium
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Environment unlock — notification success
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

### Muhasabah Repo Pattern (follows existing repos)
```typescript
// src/db/repos/muhasabahRepo.ts
import { db } from '../client';
import { muhasabahEntries } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const muhasabahRepo = {
  async create(entry: typeof muhasabahEntries.$inferInsert) {
    return db.insert(muhasabahEntries).values(entry).returning();
  },

  async getByUserId(userId: string, limit = 30) {
    return db
      .select()
      .from(muhasabahEntries)
      .where(eq(muhasabahEntries.userId, userId))
      .orderBy(desc(muhasabahEntries.createdAt))
      .limit(limit);
  },

  async getTodayEntry(userId: string, todayDateStr: string) {
    const rows = await db
      .select()
      .from(muhasabahEntries)
      .where(eq(muhasabahEntries.userId, userId))
      .orderBy(desc(muhasabahEntries.createdAt))
      .limit(1);
    const entry = rows[0];
    return entry?.createdAt?.startsWith(todayDateStr) ? entry : null;
  },

  async getStreak(userId: string): Promise<number> {
    // Count consecutive days with entries ending today
    // Implementation: fetch last 30 entries, count contiguous daily coverage
    const entries = await muhasabahRepo.getByUserId(userId, 30);
    if (!entries.length) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < entries.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const entryDate = new Date(entries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);
      if (entryDate.getTime() === expected.getTime()) { streak++; }
      else break;
    }
    return streak;
  },
};
```

### Muhasabah Engine (pure TS, no React)
```typescript
// src/domain/muhasabah-engine.ts
import type { PrayerWindow } from '../types/habits';

/**
 * Check if current time is within or after Isha window (Muhasabah available).
 * Falls back to 21:00 if no Isha window provided.
 */
export function isMuhasabahTime(
  ishaWindow: PrayerWindow | null,
  now = new Date(),
): boolean {
  if (!ishaWindow) {
    // Fallback: 9 PM local
    return now.getHours() >= 21;
  }
  return now >= ishaWindow.start;
}

// Curated closing content (vetted Quranic ayat + hadith)
export const CLOSING_CONTENT = [
  {
    id: 'quran_2_286',
    type: 'ayah' as const,
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: 'Allah does not burden a soul beyond that it can bear.',
    source: 'Quran 2:286',
  },
  // ... additional vetted content
] as const;

export function getClosingContent(index: number) {
  return CLOSING_CONTENT[index % CLOSING_CONTENT.length];
}
```

### Environment Level Gate Thresholds
Based on XP curve (`xpForLevel(n)` canonical values from Phase 4):
```typescript
// src/domain/hud-environment.ts
export type EnvironmentId = 'quiet_study' | 'growing_garden' | 'scholars_courtyard' | 'living_sanctuary';

export function getEnvironmentForLevel(level: number): EnvironmentId {
  if (level >= 20) return 'living_sanctuary';    // Aspirational (month 2-3)
  if (level >= 12) return 'scholars_courtyard';   // ~3-4 weeks consistent
  if (level >= 6)  return 'growing_garden';       // ~1 week consistent
  return 'quiet_study';                           // Default start
}
```

Level 5 = unlocked per week 1 plan; Level 6 gate is aggressive but achievable. Adjust if playtesting shows level 6 reached too fast.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `FilterQuality.None` for pixel art | `sampling={{ filter: FilterMode.Nearest }}` | Skia 1.0 / 2.x | Old code will crash; all pixel art rendering must use new API |
| Separate animation library for Skia | Direct Reanimated shared/derived values as Skia props | Skia 1.0+ | No `createAnimatedComponent` needed; Skia + Reanimated are natively integrated |
| Canvas `useTouchHandler` for tap detection | Overlay RN views / react-native-gesture-handler GestureDetector | Skia 1.0+ | `useTouchHandler` still works for global canvas gestures but overlay pattern is recommended for per-element detection |
| React Navigation Modal for multi-step flows | `StyleSheet.absoluteFillObject` overlay (Phase 4 established pattern) | Phase 4 decision | Celebration overlays use absoluteFillObject — Muhasabah should match this pattern for consistency |

**Deprecated/outdated:**
- `FilterQuality` enum: Removed in Skia 2.x. Use `FilterMode` + `MipmapMode`.
- `useTouchHandler` on Canvas: Functional but not recommended for per-object detection. Use Pressable overlays.
- Reanimated 3 `createAnimatedComponent` wrapping Skia components: Unnecessary — Skia accepts Reanimated values directly.

---

## Open Questions

1. **Spritesheet asset format and dimensions**
   - What we know: Assets will be AI-generated PNGs; 2-4 frame idle animation
   - What's unclear: Exact spritesheet layout (horizontal strip vs grid), frame dimensions, if frames include transparency
   - Recommendation: Define a fixed convention before asset creation: horizontal strip, 4 frames, each frame 32x48px (or 48x64px for larger display), power-of-2 dimensions preferred for GPU texture efficiency

2. **Android BlurView acceptability for HUD**
   - What we know: expo-blur requires `BlurTargetView` wrapping on Android and `blurMethod="dimezisBlurView"`
   - What's unclear: Whether the added Android complexity is worth it for MVP vs using a semi-transparent `rgba(0,0,0,0.6)` background
   - Recommendation: Use semi-transparent RN View for Android (detected via Platform.OS) and BlurView for iOS. Keep UI code conditional on platform.

3. **muhasabahStore streak integration with gameStore checkTitles**
   - What we know: `gameStore.checkTitles` has `muhasabahStreak: 0` hardcoded as a Phase 5 TODO
   - What's unclear: How checkTitles will get the muhasabah streak value (cross-store access like habitStore)
   - Recommendation: Follow the established pattern — dynamic import `muhasabahStore.getState()` inside `checkTitles`, same as habitStore cross-store access. No architectural changes needed.

---

## Validation Architecture

> nyquist_validation is true in .planning/config.json — validation section is included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | jest-expo 54.0.17 |
| Config file | jest.config.js (or package.json jest section) |
| Quick run command | `npm test -- --testPathPattern="muhasabah\|hud" --no-coverage` |
| Full suite command | `npm test -- --no-coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HUD-01 | gameStore provides level/XP/quests to HUD | unit | `npm test -- --testPathPattern="gameStore" --no-coverage` | ✅ (existing) |
| HUD-02 | Pixel art sampling config is correct | unit (snapshot/type) | `npm test -- --testPathPattern="hud-scene" --no-coverage` | ❌ Wave 0 |
| HUD-03 | XPProgressBar renders within HUD overlay | unit | `npm test -- --testPathPattern="HudStatBar" --no-coverage` | ❌ Wave 0 |
| HUD-04 | Haptic calls triggered on game events | unit (mock) | `npm test -- --testPathPattern="haptics" --no-coverage` | ❌ Wave 0 |
| MUHA-01 | isMuhasabahTime returns true after Isha | unit | `npm test -- --testPathPattern="muhasabah-engine" --no-coverage` | ❌ Wave 0 |
| MUHA-02 | muhasabahStore.setHighlight updates draft | unit | `npm test -- --testPathPattern="muhasabahStore" --no-coverage` | ❌ Wave 0 |
| MUHA-03 | muhasabahRepo.create writes to PRIVATE table | unit (privacy gate) | `npm test -- --testPathPattern="muhasabahRepo" --no-coverage` | ❌ Wave 0 |
| MUHA-04 | Muhasabah close() resets state without penalty | unit | `npm test -- --testPathPattern="muhasabahStore" --no-coverage` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="muhasabah-engine|muhasabahStore|muhasabahRepo" --no-coverage`
- **Per wave merge:** `npm test -- --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/domain/muhasabah-engine.test.ts` — covers MUHA-01 (isMuhasabahTime, getClosingContent)
- [ ] `__tests__/stores/muhasabahStore.test.ts` — covers MUHA-02, MUHA-04
- [ ] `__tests__/db/muhasabahRepo.test.ts` — covers MUHA-03 (privacy gate assertion)
- [ ] `__tests__/domain/hud-environment.test.ts` — covers environment threshold logic
- [ ] `@shopify/react-native-skia` mock in jest setup — required for any component tests using Canvas/Image

---

## Sources

### Primary (HIGH confidence)
- Shopify/react-native-skia official docs (images, atlas, animations, gestures, canvas) — sampling API, Atlas pattern, Canvas API
- https://docs.expo.dev/versions/latest/sdk/haptics/ — ImpactFeedbackStyle enum values confirmed
- https://docs.expo.dev/versions/latest/sdk/blur-view/ — BlurView API, Android BlurTargetView requirement
- Project codebase inspection: schema.ts, client.ts, privacy-gate.ts, migrations/ — confirmed muhasabah_entries exists in 0000, Skia not in package.json

### Secondary (MEDIUM confidence)
- https://github.com/Shopify/react-native-skia/issues/3327 — Android Group transform performance regression (verified by GitHub issue, not official docs)
- https://expo.dev/changelog/sdk-54 + Reanimated GitHub discussion #8778 — Expo SDK 54 requires Reanimated ~4.1.x confirmed
- WebSearch + multiple sources confirming Skia 2.2.3 compatible with Expo SDK 54 + RN 0.81

### Tertiary (LOW confidence)
- Spritesheet animation via Atlas + worklets (documented in community tutorials, Atlas docs; exact `useRectBuffer` + single-frame selection pattern not in official example)
- Environment level thresholds (Level 6/12/20) — derived from XP simulation data from Phase 4, not from a spec

---

## Metadata

**Confidence breakdown:**
- Standard stack (Skia, Reanimated, expo-haptics, expo-blur): HIGH — all verified against official docs and package.json
- Skia not installed finding: HIGH — direct package.json inspection confirmed
- Architecture patterns (Canvas + RN overlay): HIGH — from official Skia gesture docs
- Spritesheet animation (Atlas worklet): MEDIUM — Atlas API confirmed, exact worklet pattern from community
- Day/night tint (interpolateColors): HIGH — Skia docs confirm Reanimated interpolateColor incompatibility; interpolateColors exists in Skia
- Muhasabah data layer: HIGH — schema, migrations, and privacy gate directly inspected
- Environment level thresholds: LOW — derived, not from a spec document

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (Skia minor versions move monthly; verify before implementation)
