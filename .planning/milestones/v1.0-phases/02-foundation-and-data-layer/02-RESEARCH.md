# Phase 2: Foundation and Data Layer - Research

**Researched:** 2026-03-08
**Domain:** React Native (Expo) scaffold, SQLite persistence, Zustand state management, Privacy Gate, design tokens, i18n
**Confidence:** HIGH

## Summary

Phase 2 builds the app skeleton from scratch -- no code exists yet. The stack is locked by CONTEXT.md: Expo SDK 55 (latest stable, released 2026-03-03) with expo-sqlite, Zustand domain-split stores, Expo Router tab navigation, i18next for i18n, and a design token system. The critical architectural decisions are: (1) using Drizzle ORM on top of expo-sqlite for typed queries and managed migrations, (2) Zustand persist middleware with a custom SQLite storage adapter, (3) Privacy Gate as a table-level classification module that wraps all data writes, and (4) a two-tier design token system (primitives + semantic) that supports future dark/light mode switching.

The user is on Windows 11 and needs EAS Build for iOS (cloud builds). Development builds are required -- Expo Go is explicitly excluded. The blueprint already defines the complete data model (12 entities), navigation structure (4 tabs), token palette, and directory layout. Phase 2 implements the infrastructure; no feature logic (habits, XP, quests) ships.

**Primary recommendation:** Use expo-sqlite + Drizzle ORM for typed queries and migration management, Zustand v5 with domain-split stores, and ship all 4 tab placeholders with a custom pixel-accented tab bar from day one.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use **expo-sqlite** (not WatermelonDB) -- lighter, direct SQL control, fewer abstractions
- Typed DAO/repository layer: components call `habitRepo.getActive()`, SQL stays in one place
- Game engine and data access both follow "pure TypeScript functions, no React imports" pattern
- Supabase is Phase 7 cloud sync -- SQLite is the local source of truth
- All 4 tabs ship in Phase 2: Home, Habits, Quests, Profile -- with placeholder screens for unbuilt features
- Custom pixel-accented tab bar: pixel art icons, jewel-tone active states, pixel border/glow details
- Tab bar sets the "modern mobile UI with pixel art soul" tone from first launch
- Placeholder screens show tab name and phase indicator (not empty/broken-feeling)
- Full token system in Phase 2: colors (jewel tones), typography, spacing scale, border radius, shadows, elevation
- Phase 5 adds HUD-specific pixel art rendering on top of this token foundation
- **Font comparison spike**: build a test screen comparing real pixel font vs clean modern font for headings
- **Dark/light mode spike**: build a comparison showing both modes with jewel-tone palette
- Token system supports dual mode either way
- **Table-level classification**: entire tables are private or syncable (not per-row flags)
- **Code-level guard enforcement**: single SQLite database, Privacy Gate module wraps sync operations and refuses to include private tables
- **Visible in settings**: "Data Privacy" screen shows users what stays on-device vs what syncs
- **Private data**: salah completion logs, worship habit completion timestamps, Muhasabah reflections
- **Syncable data**: XP totals, levels, titles, settings, profile, non-worship habit data

### Claude's Discretion
- Migration approach (manual versioned SQL vs migration library -- evaluate tradeoffs)
- Screen transition style (platform defaults vs custom crossfade -- match Ferrari x 16-bit feel)
- Modal presentation (bottom sheet vs full-screen push -- choose based on action type)
- Token architecture depth (primitives + semantic vs full 3-tier -- balance structure vs solo dev speed)

### Deferred Ideas (OUT OF SCOPE)
- Voice pack system (changeable app personality) -- Phase 6 or future customization phase
- Arabic terminology toggle (Arabic with context / Arabic only / English-first) -- Phase 6 settings
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUN-01 | Expo project scaffold with development builds (not Expo Go) and EAS Build pipeline | Expo SDK 55 setup, EAS Build cloud configuration for Windows dev, development build with expo-dev-client |
| FOUN-02 | Expo Router navigation structure with tab-based layout | Expo Router file-based routing with (tabs) group, custom tab bar component, stack navigation for sub-screens |
| FOUN-03 | SQLite database schema with migrations for habits, completions, streaks, XP, titles, quests, muhasabah | expo-sqlite + Drizzle ORM for typed schema + migration generation, all 12 entities from blueprint data model |
| FOUN-04 | Zustand state management with domain-split stores (habits, game, ui, settings) | Zustand v5 with separate stores per domain, persist middleware with custom storage adapter, TypeScript types |
| FOUN-05 | Privacy Gate module classifying data as private (device-only) vs syncable | Table-level privacy classification map, guard function wrapping data operations, test coverage for classification |
| FOUN-06 | Design token system (colors, typography, spacing, 16-bit aesthetic tokens) | Two-tier token system (primitives + semantic), dark/light mode structure, font loading (Inter + Press Start 2P) |
| FOUN-07 | i18n infrastructure (i18next) for future RTL/Arabic support | i18next + react-i18next setup, RTL-ready layout patterns (start/end not left/right), translation JSON structure |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo | ~55.0.x | Framework & build system | Latest stable (released 2026-03-03), React Native 0.83 |
| expo-sqlite | (bundled with SDK 55) | Local SQLite database | Expo-native, modern async API, WAL mode, no native linking hassle |
| drizzle-orm | latest | Typed queries + migration management | Type-safe SQL, generates migration files, `useMigrations` hook for startup |
| drizzle-kit | latest (dev) | Migration generation CLI | `npx drizzle-kit generate` produces numbered SQL files |
| expo-router | (bundled with SDK 55) | File-based navigation | Tab + stack layouts, deep linking, typed routes |
| zustand | ^5.x | State management | Lightweight, domain-split stores, persist middleware, RN-compatible |
| i18next | ^24.x | Internationalization | Industry standard, RTL support, React Native compatible |
| react-i18next | ^15.x | React bindings for i18next | useTranslation hook, I18nextProvider |
| expo-font | (bundled) | Custom font loading | Load Inter + Press Start 2P pixel font |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-dev-client | (bundled) | Development builds | Required -- replaces Expo Go per project constraints |
| babel-plugin-inline-import | latest (dev) | Bundle .sql migration files | Required by Drizzle for Expo -- imports SQL as strings |
| uuid | ^10.x | Generate UUIDs for entity PKs | All entities use UUID primary keys per data model |
| expo-localization | (bundled) | Detect device locale | Initial language detection for i18next |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Drizzle ORM | Manual versioned SQL files | Manual SQL is simpler but loses type safety, migration tracking, and schema-as-code; Drizzle adds ~50KB but provides typed queries matching the DAO pattern |
| Drizzle ORM | WatermelonDB | Locked out by CONTEXT.md -- user chose expo-sqlite for simplicity |
| MMKV for Zustand persist | SQLite-backed custom adapter | MMKV is faster for key-value but adds another native dependency; SQLite adapter keeps one storage engine |
| AsyncStorage | SQLite | AsyncStorage has 6MB iOS limit and is slower; SQLite is already the primary DB |

**Installation:**
```bash
npx create-expo-app@latest halalhabits --template blank-typescript
cd halalhabits
npx expo install expo-sqlite expo-font expo-localization expo-dev-client
npm install drizzle-orm zustand i18next react-i18next uuid
npm install -D drizzle-kit babel-plugin-inline-import @types/uuid
```

**EAS Setup (Windows -- cloud builds for iOS):**
```bash
npm install -g eas-cli
eas login
eas build:configure
# Creates eas.json with development, preview, production profiles
eas build --platform android --profile development
eas build --platform ios --profile development
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx     # Tab bar layout (custom pixel tab bar)
│   │   ├── index.tsx       # Home HUD (placeholder)
│   │   ├── habits.tsx      # Habits List (placeholder)
│   │   ├── quests.tsx      # Quest Board (placeholder)
│   │   └── profile.tsx     # Profile (placeholder)
│   └── _layout.tsx         # Root layout (providers, font loading)
├── components/
│   └── ui/                 # Shared UI components (buttons, cards)
├── db/
│   ├── schema.ts           # Drizzle schema definitions (all 12 entities)
│   ├── client.ts           # Database initialization + Drizzle instance
│   ├── migrations/         # Generated SQL migration files
│   └── repos/              # DAO/repository layer
│       ├── habitRepo.ts
│       ├── userRepo.ts
│       ├── questRepo.ts
│       └── index.ts
├── stores/
│   ├── habitStore.ts       # Habits, completions, streaks
│   ├── gameStore.ts        # XP, level, titles, quests
│   ├── uiStore.ts          # Modals, toasts, animation states
│   └── settingsStore.ts    # User preferences
├── services/
│   └── privacy-gate.ts     # Privacy classification + guard
├── tokens/
│   ├── colors.ts           # Jewel tone palette (primitives + semantic)
│   ├── typography.ts       # Type scale, font families
│   ├── spacing.ts          # 4px base spacing system
│   ├── radius.ts           # Border radius tokens
│   ├── motion.ts           # Duration + easing tokens
│   └── index.ts            # Unified export
├── i18n/
│   ├── config.ts           # i18next initialization
│   └── locales/
│       └── en/
│           └── translation.json
├── types/
│   ├── database.ts         # Inferred types from Drizzle schema
│   └── common.ts           # Shared types (Privacy classification enum, etc.)
└── utils/
    ├── uuid.ts             # UUID generation helper
    └── date.ts             # Date utilities
```

### Pattern 1: DAO/Repository Layer (Locked Decision)
**What:** All SQL queries are encapsulated in repository modules. Components and stores never write raw SQL.
**When to use:** Every data access operation.
**Example:**
```typescript
// src/db/repos/habitRepo.ts
// Pure TypeScript, no React imports -- matches game engine pattern
import { eq, and } from 'drizzle-orm';
import { getDb } from '../client';
import { habits } from '../schema';

export const habitRepo = {
  async getActive(userId: string) {
    const db = getDb();
    return db.select().from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.status, 'active')))
      .orderBy(habits.sortOrder);
  },

  async create(data: NewHabit) {
    const db = getDb();
    return db.insert(habits).values(data).returning();
  },

  async archive(habitId: string) {
    const db = getDb();
    return db.update(habits)
      .set({ status: 'archived', updatedAt: new Date().toISOString() })
      .where(eq(habits.id, habitId));
  },
};
```

### Pattern 2: Privacy Gate Guard
**What:** A module that hardcodes table-level privacy classifications and provides a guard function that prevents private data from being queued for sync.
**When to use:** Every data write that could potentially be synced.
**Example:**
```typescript
// src/services/privacy-gate.ts
export type PrivacyLevel = 'PRIVATE' | 'SYNCABLE' | 'LOCAL_ONLY';

const PRIVACY_MAP: Record<string, PrivacyLevel> = {
  habit_completions: 'PRIVATE',
  streaks: 'PRIVATE',
  muhasabah_entries: 'PRIVATE',
  niyyah: 'PRIVATE',
  users: 'SYNCABLE',
  habits: 'SYNCABLE',
  xp_ledger: 'SYNCABLE',
  titles: 'SYNCABLE',
  user_titles: 'SYNCABLE',
  quests: 'SYNCABLE',
  settings: 'SYNCABLE',
  sync_queue: 'LOCAL_ONLY',
} as const;

export function getPrivacyLevel(tableName: string): PrivacyLevel {
  const level = PRIVACY_MAP[tableName];
  if (!level) throw new Error(`Unknown table: ${tableName}. All tables must have privacy classification.`);
  return level;
}

export function isSyncable(tableName: string): boolean {
  return getPrivacyLevel(tableName) === 'SYNCABLE';
}

export function assertSyncable(tableName: string): void {
  if (!isSyncable(tableName)) {
    throw new Error(`PRIVACY VIOLATION: Attempted to sync ${tableName} (classified as ${getPrivacyLevel(tableName)})`);
  }
}
```

### Pattern 3: Zustand Domain-Split Store with Persist
**What:** Separate stores per domain, each with optional persistence to SQLite via a custom storage adapter.
**When to use:** All application state.
**Example:**
```typescript
// src/stores/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sqliteStorage } from './sqliteStorage';

interface SettingsState {
  prayerCalcMethod: string;
  darkMode: 'auto' | 'dark' | 'light';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  setPrayerCalcMethod: (method: string) => void;
  setDarkMode: (mode: 'auto' | 'dark' | 'light') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      prayerCalcMethod: 'ISNA',
      darkMode: 'auto',
      soundEnabled: true,
      hapticEnabled: true,
      setPrayerCalcMethod: (method) => set({ prayerCalcMethod: method }),
      setDarkMode: (mode) => set({ darkMode: mode }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => sqliteStorage),
      partialize: (state) => ({
        // Only persist data fields, not actions
        prayerCalcMethod: state.prayerCalcMethod,
        darkMode: state.darkMode,
        soundEnabled: state.soundEnabled,
        hapticEnabled: state.hapticEnabled,
      }),
    }
  )
);
```

### Pattern 4: Design Token Two-Tier System
**What:** Primitives (raw values) + semantic tokens (contextual meanings). Supports dark/light mode by swapping semantic layer.
**When to use:** All UI styling.
**Example:**
```typescript
// src/tokens/colors.ts
// Tier 1: Primitives (never used directly in components)
const palette = {
  emerald50: '#ECFDF5',
  emerald500: '#0D7C3D',
  emerald600: '#059669',
  sapphire500: '#1B3A6B',
  ruby500: '#9B1B30',
  gold500: '#FFD700',
  surface800: '#1E293B',
  surface900: '#0F172A',
  surface950: '#0B1120',
  // ... full palette from blueprint
} as const;

// Tier 2: Semantic (components use these)
export const colors = {
  // Dark mode (default)
  dark: {
    background: palette.surface900,
    backgroundDeep: palette.surface950,
    surface: palette.surface800,
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    primary: palette.emerald500,
    primaryPressed: palette.emerald600,
    secondary: palette.sapphire500,
    error: palette.ruby500,
    xp: palette.gold500,
    mercy: '#FFB347',
    border: '#1E293B',
    borderFocus: palette.emerald500,
  },
  // Light mode (same keys, different values -- spike will determine if shipped)
  light: {
    background: '#F8FAFC',
    backgroundDeep: '#FFFFFF',
    surface: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    primary: palette.emerald500,
    primaryPressed: palette.emerald600,
    secondary: palette.sapphire500,
    error: palette.ruby500,
    xp: palette.gold500,
    mercy: '#FFB347',
    border: '#E2E8F0',
    borderFocus: palette.emerald500,
  },
} as const;
```

### Anti-Patterns to Avoid
- **Importing SQL directly in components:** All database access must go through the DAO/repository layer. Components call `habitRepo.getActive()`, never `db.select().from(habits)`.
- **Bypassing Privacy Gate for sync:** Never add items to the sync queue without calling `assertSyncable(tableName)` first. The gate is structural, not optional.
- **Hardcoding colors/spacing:** Always use token values. Never write `color: '#0D7C3D'` in a component -- write `color: colors.dark.primary`.
- **Monolithic Zustand store:** Keep stores domain-split. The habitStore should not know about quest logic.
- **Using left/right in styles:** Always use `start`/`end` (paddingStart, marginEnd) for RTL readiness.

## Discretion Recommendations

### Migration Approach: Use Drizzle ORM (Recommended)
**Recommendation:** Drizzle ORM over manual versioned SQL.
**Why:** The blueprint defines 12 entities with complex relationships. Drizzle provides schema-as-TypeScript-code (catches type errors at build time), automatic migration generation via `drizzle-kit generate`, the `useMigrations` hook for startup migration execution, and typed query results that flow directly into the DAO layer. The alternative (manual `001_initial.sql` files with `PRAGMA user_version`) works but requires maintaining SQL strings separately from TypeScript types, duplicating schema definitions.
**Tradeoff:** Drizzle adds ~50KB bundle size and requires babel/metro config changes. Worth it for a 12-entity schema that grows through 5 more phases.

### Screen Transition Style: Platform Defaults with Subtle Customization
**Recommendation:** Use Expo Router's default platform transitions (iOS slide, Android fade) but customize the tab bar switch animation.
**Why:** Custom crossfade transitions between stack screens fight platform conventions and confuse users. The "Ferrari x 16-bit" feel comes from the tab bar design and screen content, not from non-standard transitions. Save animation budget for Phase 5 (HUD, level-up celebrations).
**Exception:** The Muhasabah and onboarding flows (full-screen, tab bar hidden) can use a custom fade-in for a contemplative feel.

### Modal Presentation: Bottom Sheet for Actions, Full-Screen for Flows
**Recommendation:** Use bottom sheets for quick actions (habit options, confirmations) and full-screen modals for immersive flows (Muhasabah, onboarding, celebrations).
**Why:** Bottom sheets are the modern mobile convention for contextual actions. Full-screen modals signal "you're entering a different mode." The blueprint already categorizes screens this way (modals vs full-screen flows).

### Token Architecture: Two-Tier (Primitives + Semantic)
**Recommendation:** Two-tier system, not three-tier. Primitives (palette) + Semantic (contextual meaning). Skip the "component token" middle layer.
**Why:** A solo developer maintaining a three-tier system (primitive -> semantic -> component) creates more indirection than value. Two tiers give clear separation (raw colors vs contextual usage) without over-engineering. Component-specific tokens can be added in Phase 5 when HUD components need them.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SQL migrations | Manual version tracking + raw SQL execution | Drizzle ORM migrations + `useMigrations` hook | Migration ordering, schema drift, type safety -- Drizzle handles all of this |
| UUID generation | Custom UUID function | `uuid` package (v4) | RFC 4122 compliance, cryptographic randomness |
| Font loading | Manual asset loading + state tracking | `expo-font` with `useFonts` hook | Handles loading states, caching, error recovery |
| Tab navigation | Custom tab bar from scratch | Expo Router `Tabs` component with custom `tabBar` prop | Navigation state, deep linking, back button handling -- customize appearance only |
| i18n string management | Custom key-value lookup | i18next with JSON namespace files | Pluralization, interpolation, context, RTL detection, namespace splitting |
| Async storage for Zustand | Custom serialization layer | Zustand `persist` middleware with `createJSONStorage` | Handles hydration, partial persistence, versioning, merge strategies |

**Key insight:** This phase is infrastructure. Every hand-rolled solution here becomes tech debt that 5 subsequent phases must build on. Use proven libraries and spend engineering time on the Privacy Gate (genuinely novel) and the pixel tab bar (brand-defining).

## Common Pitfalls

### Pitfall 1: expo-sqlite Legacy API Usage
**What goes wrong:** Using the old `expo-sqlite` API that was removed in SDK 52+.
**Why it happens:** Training data and old tutorials reference `SQLite.openDatabase()` (sync, callback-based). The modern API is `SQLite.openDatabaseAsync()` or `openDatabaseSync()`.
**How to avoid:** Always use `expo-sqlite` (not `expo-sqlite/legacy`). Use `openDatabaseAsync`, `getAllAsync`, `runAsync` methods. Wrap with `SQLiteProvider` + `useSQLiteContext`.
**Warning signs:** Import from `expo-sqlite/legacy`, callback-style APIs, `_db.transaction()` calls.

### Pitfall 2: Drizzle Metro/Babel Misconfiguration
**What goes wrong:** App crashes at startup because Metro can't resolve `.sql` migration files.
**Why it happens:** Drizzle generates migrations as `.sql` files. Metro doesn't recognize `.sql` by default. Missing `babel-plugin-inline-import` or `sourceExts` config.
**How to avoid:** Configure both: (1) Add `babel-plugin-inline-import` with `extensions: [".sql"]` to babel.config.js. (2) Add `'sql'` to `config.resolver.sourceExts` in metro.config.js.
**Warning signs:** "Unable to resolve module" errors pointing at `.sql` files.

### Pitfall 3: Zustand v5 useShallow Requirement
**What goes wrong:** Components crash with "Maximum update depth exceeded" when selecting multiple fields from a store.
**Why it happens:** Zustand v5 removed the implicit shallow comparison for object selectors. `const { a, b } = useStore(s => ({ a: s.a, b: s.b }))` causes infinite re-renders.
**How to avoid:** Always use `useShallow` for multi-field selectors: `const { a, b } = useStore(useShallow(s => ({ a: s.a, b: s.b })))`. Or select individual fields with separate hooks.
**Warning signs:** Component unmounting immediately after mounting, "Maximum update depth" errors.

### Pitfall 4: Privacy Gate Bypass via Direct DB Access
**What goes wrong:** A future developer (or Phase 3+ code) writes directly to the sync queue for a private table.
**Why it happens:** No structural enforcement -- just convention.
**How to avoid:** Make the Privacy Gate the ONLY path for sync queue writes. The `assertSyncable()` function should throw if called with a private table name. Write tests that verify every private table is blocked.
**Warning signs:** Any code that writes to `sync_queue` without calling `assertSyncable` first.

### Pitfall 5: Windows EAS Build Limitations
**What goes wrong:** Attempting local builds on Windows fails.
**Why it happens:** EAS local builds only support macOS and Linux. Windows requires WSL or cloud builds.
**How to avoid:** Always use cloud EAS builds (`eas build --platform ios` / `eas build --platform android`). Do not attempt `--local` flag on Windows.
**Warning signs:** "Local builds are not supported on Windows" errors.

### Pitfall 6: Hardcoding Left/Right Styles
**What goes wrong:** RTL layout breaks when Arabic/Urdu support is added in the future.
**Why it happens:** Natural habit to write `paddingLeft`, `marginRight`, `textAlign: 'left'`.
**How to avoid:** Always use `paddingStart`/`paddingEnd`, `marginStart`/`marginEnd`, `textAlign: 'auto'`. Use `I18nManager.isRTL` checks only when truly needed.
**Warning signs:** Any `left`/`right` in StyleSheet definitions (except for absolute positioning of decorative elements).

## Code Examples

### Database Initialization with Drizzle + expo-sqlite
```typescript
// src/db/client.ts
// Source: Drizzle ORM docs + Expo SQLite docs
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('halalhabits.db');
expoDb.execSync("PRAGMA journal_mode = 'wal'");

export const db = drizzle(expoDb, { schema });
export function getDb() { return db; }
```

### App Root Layout with Providers
```typescript
// src/app/_layout.tsx
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '../db/client';
import migrations from '../../drizzle/migrations';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter': require('../../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
    'PressStart2P': require('../../assets/fonts/PressStart2P-Regular.ttf'),
  });

  const { success: migrationSuccess, error: migrationError } = useMigrations(db, migrations);

  if (!fontsLoaded || !migrationSuccess) {
    // Show splash / loading screen
    return null;
  }

  if (migrationError) {
    // Handle migration failure
    throw migrationError;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Slot />
    </I18nextProvider>
  );
}
```

### Custom Pixel Tab Bar
```typescript
// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../components/ui/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="habits" options={{ title: 'Habits' }} />
      <Tabs.Screen name="quests" options={{ title: 'Quests' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

### i18next Configuration
```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en/translation.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: Localization.getLocales()[0]?.languageCode ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| expo-sqlite legacy API (callbacks) | expo-sqlite async API (Promises) | SDK 52 (Nov 2024) | Legacy removed in SDK 52; must use openDatabaseAsync/openDatabaseSync |
| Expo Go for development | Development builds (expo-dev-client) | SDK 50+ (recommended) | Required for native modules like SQLite; Expo Go too limited |
| Zustand v4 object selectors | Zustand v5 requires useShallow | Zustand 5.0 (2024) | Object selectors without useShallow cause infinite re-renders |
| AsyncStorage for persistence | MMKV or SQLite-backed storage | 2024-2025 | AsyncStorage has 6MB iOS limit; SQLite already in use = no extra dependency |
| Manual SQL migration files | Drizzle ORM schema-as-code | 2024-2025 | Type safety, auto-generation, useMigrations hook |
| Expo SDK 52 | Expo SDK 55 (stable) | 2026-03-03 | React Native 0.83, latest improvements |

**Deprecated/outdated:**
- `expo-sqlite/legacy`: Removed in SDK 52. Do not use.
- `CRSQLite` support in expo-sqlite: Deprecated.
- Zustand v4 object selector pattern: Causes crashes in v5 without `useShallow`.

## Open Questions

1. **Pixel art icon assets for tab bar**
   - What we know: Blueprint specifies pixel art icons (16x16, 24x24, 32x32) for tabs (home/sanctuary, checkmark/scroll, sword/compass, character silhouette)
   - What's unclear: Whether to use pre-made pixel art icon packs, commission custom icons, or create simple placeholder icons in Phase 2
   - Recommendation: Use simple geometric pixel-style placeholder icons in Phase 2 (colored squares/shapes at 24x24). Real pixel art assets are Phase 5 scope. The tab bar component structure should support swapping icons easily.

2. **Press Start 2P font licensing and availability**
   - What we know: Blueprint specifies Press Start 2P for pixel display text. It's a Google Font (OFL license, free).
   - What's unclear: Whether it renders well at the specified sizes on mobile, especially `hud-label` at 10px
   - Recommendation: Include in the font comparison spike. Bundle the TTF file. The spike will determine if it's used for headings or reserved for HUD-only.

3. **Zustand persist storage adapter for SQLite**
   - What we know: Zustand's persist middleware needs a `StateStorage` interface (`getItem`, `setItem`, `removeItem`). Most examples use AsyncStorage or MMKV.
   - What's unclear: No widely-adopted SQLite adapter exists. Need to write a thin custom adapter.
   - Recommendation: Write a simple key-value table (`_zustand_store(key TEXT PRIMARY KEY, value TEXT)`) and implement the 3-method interface. This is ~20 lines of code, not a hand-roll concern.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (bundled with Expo) + @testing-library/react-native |
| Config file | None -- Wave 0 creates jest.config.js |
| Quick run command | `npx jest --testPathPattern=<file> --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUN-01 | Expo project builds successfully | smoke | `npx expo export --platform web` (build check) | No -- Wave 0 |
| FOUN-02 | Tab navigation renders 4 tabs | unit | `npx jest --testPathPattern=tabs --no-coverage` | No -- Wave 0 |
| FOUN-03 | SQLite schema creates all tables, migrations run | unit | `npx jest --testPathPattern=database --no-coverage` | No -- Wave 0 |
| FOUN-04 | Zustand stores initialize with correct defaults | unit | `npx jest --testPathPattern=stores --no-coverage` | No -- Wave 0 |
| FOUN-05 | Privacy Gate blocks private tables from sync | unit | `npx jest --testPathPattern=privacy --no-coverage` | No -- Wave 0 |
| FOUN-06 | Design tokens export all required values | unit | `npx jest --testPathPattern=tokens --no-coverage` | No -- Wave 0 |
| FOUN-07 | i18next initializes, translation keys resolve | unit | `npx jest --testPathPattern=i18n --no-coverage` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=<relevant> --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `jest.config.js` -- Jest configuration for Expo + TypeScript
- [ ] `tests/db/database.test.ts` -- covers FOUN-03 (schema creation, migrations)
- [ ] `tests/services/privacy-gate.test.ts` -- covers FOUN-05 (classification, blocking)
- [ ] `tests/stores/stores.test.ts` -- covers FOUN-04 (store initialization)
- [ ] `tests/tokens/tokens.test.ts` -- covers FOUN-06 (token completeness)
- [ ] `tests/i18n/i18n.test.ts` -- covers FOUN-07 (initialization, key resolution)
- [ ] Framework install: `npm install -D jest @testing-library/react-native @testing-library/jest-native jest-expo` -- test dependencies

## Sources

### Primary (HIGH confidence)
- [Expo SQLite docs](https://docs.expo.dev/versions/latest/sdk/sqlite/) -- API patterns, SQLiteProvider, query methods, WAL mode
- [Drizzle ORM Expo SQLite docs](https://orm.drizzle.team/docs/connect-expo-sqlite) -- Setup, metro/babel config, migration generation, useMigrations hook
- [Expo Router docs](https://docs.expo.dev/router/basics/layout/) -- Tab layout, file-based routing, custom tab bar
- [Expo SDK 55 changelog](https://expo.dev/changelog/sdk-55) -- Latest stable version (2026-03-03), React Native 0.83
- [EAS Build docs](https://docs.expo.dev/build/introduction/) -- Cloud build setup, development profiles

### Secondary (MEDIUM confidence)
- [Zustand v5 guide](https://jsdev.space/howto/zustand5-react/) -- v5 breaking changes, useShallow requirement
- [Zustand persist discussion](https://github.com/pmndrs/zustand/discussions/1533) -- Custom storage recommendations for React Native
- [i18next React Native guide](https://medium.com/@devanshtiwari365/how-to-build-a-multi-language-app-with-i18n-in-react-native-2025-edition-24318950dd8c) -- Setup pattern, RTL integration
- [Expo RTL guide](https://geekyants.com/blog/implementing-rtl-right-to-left-in-react-native-expo---a-step-by-step-guide) -- I18nManager, forceRTL, layout patterns
- [EAS Build on Windows](https://jmake.medium.com/a-practical-guide-to-running-expo-eas-builds-on-windows-fbc697236f9e) -- Windows-specific guidance

### Tertiary (LOW confidence)
- Zustand SQLite storage adapter pattern -- inferred from AsyncStorage/MMKV adapter examples, no official SQLite adapter exists; custom implementation needed (~20 LOC)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified via official docs; Expo SDK 55 confirmed as latest stable
- Architecture: HIGH -- directory structure and patterns defined in blueprint; DAO/Privacy Gate patterns well-understood
- Pitfalls: HIGH -- expo-sqlite API change (SDK 52), Zustand v5 breaking change, Drizzle metro config all verified
- Discretion recommendations: MEDIUM -- Drizzle vs manual SQL is a judgment call; transition/modal recommendations are experience-based

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable ecosystem, Expo SDK 56 expected Q2 2026)
