# Technology Stack

**Project:** HalalHabits: Ferrari 16-Bit Edition
**Researched:** 2026-03-07
**Overall Confidence:** MEDIUM (web verification tools unavailable; recommendations based on training data through early 2025 plus strong ecosystem knowledge -- verify latest versions before `npm install`)

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React Native | 0.76+ | Cross-platform mobile runtime | Required by project constraints. New Architecture (Fabric + TurboModules) is now default, enabling better animation performance critical for game UI | MEDIUM |
| Expo SDK | 52+ | Managed workflow, build tooling, OTA updates | Solo dev needs managed builds (EAS Build), OTA updates, and the massive Expo module ecosystem. SDK 52 ships with RN 0.76+ and New Architecture by default | MEDIUM |
| TypeScript | 5.x | Type safety | Non-negotiable for a solo dev project of this scope. Catches bugs before runtime, self-documents data models | HIGH |

**Version note:** Expo SDK 52 was the latest at my knowledge cutoff (late 2024 release). SDK 53 may exist by March 2026. Run `npx create-expo-app@latest --template blank-typescript` to get the current recommended version. Do NOT pin to an old SDK.

### Backend & Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Supabase | Latest JS client v2 | Auth, Postgres DB, Realtime, Edge Functions | Required by project constraints. Row-Level Security (RLS) is perfect for the privacy-first worship data model. Postgres handles relational habit/quest/streak data far better than NoSQL | HIGH |
| @supabase/supabase-js | ^2.x | Client SDK | Official React Native compatible client. Handles auth session persistence, typed queries | HIGH |
| supabase (CLI) | Latest | Local development, migrations, Edge Functions | Run Postgres locally, write and test migrations, deploy Edge Functions for server-side logic (prayer time calculations, streak validation) | HIGH |

### Offline-First & Local Storage

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| WatermelonDB | ^0.27 | Local SQLite database with sync | Purpose-built for React Native offline-first. Lazy-loads records, handles tens of thousands of habit entries without perf issues. Has a sync protocol designed for Supabase/Postgres backends | HIGH |
| @nozbe/watermelondb | ^0.27 | WatermelonDB package | SQLite-backed, observable queries (re-renders on data change), built-in sync primitives. Far superior to MMKV or AsyncStorage for relational data | HIGH |
| react-native-mmkv | ^3.x | Fast key-value storage | For non-relational data: user preferences, UI state, cached prayer times, theme settings. 30x faster than AsyncStorage | HIGH |

**Why WatermelonDB over alternatives:**
- **Over AsyncStorage:** AsyncStorage is a flat key-value store. Habit data is relational (habits -> entries -> quests -> streaks). You need queries, not serialized JSON blobs.
- **Over SQLite directly (expo-sqlite):** WatermelonDB adds the sync protocol, observable queries, and lazy loading you'd otherwise build yourself. The sync adapter maps cleanly onto Supabase's Postgres.
- **Over Legend State + Supabase sync:** Legend State's sync plugin is newer and less battle-tested for complex relational data. WatermelonDB's sync protocol is mature and well-documented.
- **Over PowerSync:** PowerSync is a strong alternative (Postgres-native sync, works with Supabase). Consider it if WatermelonDB's sync adapter proves too manual. But WatermelonDB has a longer track record in RN.

**Sync architecture:** WatermelonDB handles local CRUD. A custom sync function pulls/pushes changes to Supabase via `supabase.from('table').select()` and `supabase.from('table').upsert()`. Privacy-sensitive worship data stays local-only (never synced). Non-sensitive data (profile, settings, cosmetic unlocks) syncs for cross-device support.

### State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Zustand | ^5.x | Global UI state | Minimal API, no boilerplate, excellent TypeScript support. Perfect for game state (current XP, active quests, HUD data). Tiny bundle size (~1KB) | HIGH |
| WatermelonDB observables | -- | Database-driven reactive state | For any UI that displays persisted data (habit lists, streak counts, history), use WatermelonDB's `withObservables` or `useObservable` hooks directly. Do NOT duplicate DB state into Zustand | HIGH |

**Why Zustand over alternatives:**
- **Over Redux/RTK:** Overkill for a solo dev mobile app. Redux's ceremony (slices, actions, reducers, selectors) slows development without proportional benefit at this scale.
- **Over Jotai:** Jotai is atomic, great for forms. Zustand is better for game-state shaped data (a single store with XP, streaks, quests, active buffs).
- **Over Legend State:** Legend State is powerful but adds complexity. Its observables overlap with WatermelonDB's observables, creating confusion about source of truth.
- **Over React Context:** Context re-renders all consumers on any change. Game HUD updates XP, streak, quest progress frequently -- Context would cause perf issues.

### Animation & Game UI

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| react-native-reanimated | ^3.x | Core animation engine | Worklet-based animations run on UI thread (60fps). Essential for: HUD transitions, XP bar fills, streak flame effects, screen transitions. The foundation everything else builds on | HIGH |
| react-native-skia | ^1.x (@shopify/react-native-skia) | 2D drawing, pixel art rendering, custom shaders | Skia is how you get the 16-bit RPG aesthetic. Draw pixel-art sprites, custom progress bars, particle effects, retro UI chrome. GPU-accelerated. This is the "Ferrari" in "Ferrari x 16-bit" | HIGH |
| lottie-react-native | ^7.x | Pre-built animations (celebrations, transitions) | For complex multi-frame animations (level-up celebrations, quest complete fanfares) that are easier to design in After Effects than code. Export as Lottie JSON, render natively | HIGH |
| react-native-gesture-handler | ^2.x | Touch gestures | Swipe to dismiss, long-press for details, drag for custom interactions. Required by Reanimated for gesture-driven animations | HIGH |

**Why this animation stack (not a game engine):**
- **Over React Native Game Engine / Flame / Unity:** This is a habit app with game aesthetics, not a real-time game. You don't need a game loop, physics engine, or entity-component system. Skia + Reanimated gives you the pixel art rendering and smooth animations without the complexity of a game engine.
- **Over expo-gl / Three.js:** 3D is wrong for 16-bit aesthetic. Skia is purpose-built for 2D drawing and is maintained by Shopify with active RN support.
- **Over plain Animated API:** The old Animated API runs on the JS thread and drops frames during heavy computation. Reanimated's worklets are mandatory for smooth game-feel UI.

**Pixel art rendering strategy:**
1. Create sprite sheets (PNG) for characters, items, UI elements in pixel art style
2. Use Skia's `drawImage` / `drawImageRect` to render sprite regions
3. Use Reanimated to drive sprite animation frames (walking cycles, idle animations)
4. Use Skia's `Paint` with `FilterQuality.None` to keep pixel art crisp (no anti-aliasing blur)
5. Skia Atlas API for rendering multiple sprites efficiently (quest board, inventory)

### Navigation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| expo-router | ^4.x | File-based routing | Convention over configuration. Nested layouts map perfectly to game screens (HUD as persistent layout, tabs for main sections). Deep linking for notifications built-in | HIGH |
| react-native-screens | (bundled) | Native screen containers | Expo Router uses this under the hood. Ensures screens are native views, not JS-rendered, for smooth transitions | HIGH |

**Why expo-router over React Navigation directly:**
- Expo Router IS React Navigation underneath, but with file-based routing that reduces boilerplate dramatically.
- TypeScript route types are auto-generated from the file structure.
- Deep linking (for notification tap -> specific screen) works with zero config.

### Notifications & Scheduling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| expo-notifications | ^0.28+ | Push and local notifications | Local notifications for prayer reminders, habit nudges, evening Muhasabah prompt. Push via Supabase Edge Functions for future features. Expo handles APNs/FCM abstraction | HIGH |
| expo-task-manager | ^12.x | Background tasks | Schedule recurring notification logic, background sync when app is backgrounded. Required for reliable prayer time notifications | MEDIUM |
| expo-background-fetch | ^12.x | Periodic background execution | Refresh prayer times daily, pre-compute quest resets at midnight. Works with task-manager | MEDIUM |

**Prayer time notifications:** Calculate locally using a prayer time library (adhan-js, see below). Schedule as local notifications. Do NOT rely on push notifications for prayer times -- they must work offline.

### Islamic-Specific Libraries

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| adhan | ^4.x | Prayer time calculation | Industry-standard prayer time library. Supports all major calculation methods (MWL, ISNA, Egypt, Karachi, etc.). Pure JS, works offline. Actively maintained | HIGH |
| Intl.DateTimeFormat (built-in) | -- | Hijri calendar dates | Modern JS engines support `islamic-umalqura` calendar. No external library needed for Hijri date display | MEDIUM |

**Why adhan over alternatives:**
- **Over IslamicFinder API / Aladhan API:** Those require network. Prayer times MUST work offline -- this is a hard constraint. Calculate locally, cache results.
- **Over praytimes.js:** Unmaintained. adhan is actively maintained and used by major Islamic apps.

### UI & Design System

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tamagui | ^1.x | Styled components + design tokens | Compiles styles at build time (fast). Token system maps to game UI tokens (colors, spacing, typography). Cross-platform web-ready if ever needed | MEDIUM |
| expo-font | (bundled) | Custom pixel fonts | Load retro/pixel fonts (e.g., Press Start 2P, custom Arabic pixel font). Essential for 16-bit aesthetic | HIGH |
| expo-haptics | (bundled) | Haptic feedback | Tactile feedback on XP gain, streak break, level up. "Ferrari" = precision feel | HIGH |
| expo-av or expo-audio | (bundled) | Sound effects | 8-bit/chiptune sound effects for game events. Short clips, not music streaming | HIGH |
| react-native-safe-area-context | ^4.x | Safe area handling | Notch/island avoidance. Bundled with Expo | HIGH |

**Why Tamagui over alternatives:**
- **Over NativeWind/Tailwind:** Tailwind's utility classes don't map well to a design token system for game UI. You need semantic tokens ($hudBackground, $xpBarFill, $pixelBorder) not utility classes.
- **Over Styled Components / Emotion:** No build-time optimization. Runtime style computation hurts perf on lower-end Android devices.
- **Over Unistyles:** Unistyles is good but newer. Tamagui has broader adoption and better docs.
- **Over rolling your own StyleSheet:** You'll reinvent tokens, themes, and responsive scaling. Don't.

**Alternative consideration:** If Tamagui feels heavy for the retro aesthetic, **Unistyles 2.0** is a lighter alternative that still supports themes and design tokens. This is a choose-one-and-commit decision -- pick during Phase 1 scaffolding.

### Testing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Jest | ^29.x | Unit testing | Bundled with Expo. Test XP calculations, streak logic, quest state machines | HIGH |
| React Native Testing Library | ^12.x | Component testing | Test screen rendering, user interactions. Encourages testing behavior not implementation | HIGH |
| Maestro | Latest | E2E mobile testing | YAML-based, visual, no flaky selectors. Test critical flows: complete habit -> see XP -> check streak. Free for solo dev | MEDIUM |

**Why Maestro over Detox:**
- Detox is powerful but requires significant setup and maintenance. Maestro's YAML flows are 10x faster to write and more reliable.
- Solo dev constraint means testing must be low-friction or it won't happen.

### Build & Deploy

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| EAS Build | (Expo service) | Cloud builds for iOS/Android | No need for local Xcode builds (huge time saver on Windows). Handles code signing, provisioning | HIGH |
| EAS Submit | (Expo service) | App Store/Play Store submission | Automated store submission from CI | HIGH |
| EAS Update | (Expo service) | OTA updates | Push JS bundle updates without store review. Critical for rapid iteration post-launch | HIGH |

### Developer Tooling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ESLint | ^9.x | Linting | Flat config format. Use @expo/eslint-config as base | MEDIUM |
| Prettier | ^3.x | Formatting | Consistent code style, no debates | HIGH |
| Husky + lint-staged | Latest | Pre-commit hooks | Lint and format on commit. Prevents broken code from entering repo | HIGH |

## Alternatives Considered (and Rejected)

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Offline DB | WatermelonDB | expo-sqlite raw | No sync protocol, no observables, you'd build WatermelonDB features manually |
| Offline DB | WatermelonDB | PowerSync | Strong option but adds a paid service dependency. Re-evaluate if WatermelonDB sync proves painful |
| Offline DB | WatermelonDB | Legend State persistence | Less mature for complex relational data; overlaps with Zustand |
| State | Zustand | Redux Toolkit | Too much ceremony for solo dev. Zustand does the same with 90% less code |
| State | Zustand | MobX | Proxy-based reactivity can cause subtle bugs. Zustand's explicit subscriptions are safer |
| Animation | Reanimated + Skia | React Native Game Engine | Overkill. No physics or game loop needed. Adds complexity without benefit |
| Animation | Reanimated + Skia | expo-gl + Three.js | 3D is wrong aesthetic. Skia is 2D-native and far simpler |
| Styling | Tamagui | NativeWind | Utility classes don't map to game design tokens. Need semantic token system |
| Styling | Tamagui | Dripsy | Less actively maintained, smaller community |
| Navigation | expo-router | React Navigation bare | expo-router IS React Navigation + file-based routing + auto deep linking. No reason to go bare |
| Notifications | expo-notifications | OneSignal / Notifee | External dependency for something Expo handles natively. OneSignal adds a service dependency |
| Testing E2E | Maestro | Detox | Higher setup cost, more flaky, harder to maintain for solo dev |
| Prayer times | adhan (local) | Aladhan API | Must work offline. Network dependency is unacceptable for prayer times |

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| Firebase / Firestore | Project chose Supabase (Postgres). Firestore's NoSQL model is wrong for relational habit data |
| AsyncStorage | Too slow, no querying, no sync. Only acceptable for tiny key-value data (use MMKV instead) |
| React Context for global state | Re-renders all consumers. Game HUD updates frequently. Performance disaster |
| Animated (old API) | JS thread animations. Will drop frames during game UI transitions. Use Reanimated |
| Expo Go for development | Use development builds (expo-dev-client). Expo Go doesn't support native modules like WatermelonDB, Skia |
| Any CSS-in-JS with runtime overhead | StyleSheet or build-time compiled only. Runtime CSS kills mobile perf |
| Unity / Godot for game UI | Massive bundle size, bridge overhead, wrong tool for a habit app. Skia handles 2D game aesthetics |
| GraphQL (Apollo, URQL) | Supabase's PostgREST is simpler and sufficient. GraphQL adds complexity without benefit here |

## Installation

```bash
# Create project
npx create-expo-app@latest halalhabits --template blank-typescript

# Core Expo modules (install via npx expo install for version compatibility)
npx expo install expo-router expo-notifications expo-task-manager expo-background-fetch
npx expo install expo-font expo-haptics expo-av expo-image expo-secure-store
npx expo install react-native-safe-area-context react-native-screens
npx expo install react-native-gesture-handler

# Animation & Rendering
npx expo install react-native-reanimated
npx expo install @shopify/react-native-skia
npm install lottie-react-native

# Backend
npm install @supabase/supabase-js

# Offline & Storage
npm install @nozbe/watermelondb
npm install react-native-mmkv

# State Management
npm install zustand

# Islamic
npm install adhan

# UI Framework (choose one -- verify latest)
npm install tamagui @tamagui/config

# Dev Dependencies
npm install -D typescript @types/react jest @testing-library/react-native
npm install -D eslint prettier husky lint-staged

# NOTE: WatermelonDB requires a development build (not Expo Go)
# Run: npx expo prebuild  (generates native projects)
# Then: npx expo run:ios  or use EAS Build
```

**Important:** Always use `npx expo install` for Expo-ecosystem packages. It resolves the correct version for your SDK. Using `npm install` directly can cause version mismatches.

## Architecture Decision: Development Builds Required

WatermelonDB and Skia both require native modules not available in Expo Go. From Day 1:

1. Run `npx expo prebuild` to generate `ios/` and `android/` directories
2. Use `npx expo run:ios` locally (Mac) or EAS Build (any platform including Windows)
3. Install `expo-dev-client` for development build with hot reload
4. This is standard practice for production Expo apps in 2025+

Since you're developing on Windows, use **EAS Build** for iOS builds from the start. Android can be built locally or via EAS.

## Version Verification Checklist

Before starting development, verify these versions are current:

- [ ] Expo SDK: Check https://expo.dev/changelog for latest SDK
- [ ] React Native: Expo SDK pins the RN version -- don't pick separately
- [ ] Supabase JS: Check https://github.com/supabase/supabase-js/releases
- [ ] WatermelonDB: Check https://github.com/Nozbe/WatermelonDB/releases
- [ ] Skia: Check https://github.com/Shopify/react-native-skia/releases
- [ ] Reanimated: Check https://github.com/software-mansion/react-native-reanimated/releases
- [ ] Tamagui: Check https://github.com/tamagui/tamagui/releases
- [ ] adhan: Check https://github.com/batoulapps/adhan-js/releases

## Sources

- Training data knowledge (Expo SDK 51/52 era, late 2024). Confidence: MEDIUM for versions, HIGH for architecture patterns
- WatermelonDB sync documentation and community patterns: well-established by 2024
- Shopify Skia for React Native: established as the standard 2D rendering solution by 2024
- Reanimated 3.x with New Architecture: stable since 2024
- Supabase React Native guide: established pattern with @supabase/supabase-js v2
- adhan-js: industry standard since 2020, actively maintained through 2024+

**Honest gap:** I could not verify exact latest versions (WebSearch/WebFetch unavailable). All version numbers are minimums from my training data. The architecture and library choices are HIGH confidence; exact version pins are MEDIUM confidence. Run the verification checklist above before scaffolding.
