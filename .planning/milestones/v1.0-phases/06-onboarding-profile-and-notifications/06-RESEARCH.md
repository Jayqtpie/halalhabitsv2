# Phase 6: Onboarding, Profile & Notifications - Research

**Researched:** 2026-03-16
**Domain:** React Native (Expo) — first-launch onboarding, RPG profile screen, local notification scheduling
**Confidence:** HIGH (core stack verified against official docs; pattern decisions supported by existing codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Onboarding flow:**
- Single narrative journey, not disconnected steps — each screen flows into the next
- Flow order: Welcome splash → Character creation → Niyyah motivations → Starter habit bundles → Interactive HUD tour
- Total target: ~90 seconds + ~15-20 sec guided tour
- Character creation: Pick from preset pixel art characters (3-5 scholar/student looks), then optionally customize (skin tone, outfit color, accessory)
- Niyyah: Multi-select up to 3 motivations from curated list. Rotate seasonally using Islamic calendar month detection
- Selected motivations shown on profile and can influence quest suggestions
- Habit selection: Starter pack bundles ("Beginner Path", "Salah Focus", "Full Discipline") with "Customize my own" opening existing PresetLibrary
- Final moment: Interactive guided tour on HUD — spotlight on prayer mat, quest board, then "You're ready. Go."
- Tour is skippable

**Profile screen:**
- RPG character sheet layout — game-first, not dashboard
- Top: CharacterSprite + active Identity Title + level display
- Stats grid: XP total, best active streak, days active
- Titles: Trophy case grid of 26 titles — earned ones glow, locked ones show silhouette + unlock condition hint
- Streak section: Horizontal streak bars per habit, best streak highlighted
- Niyyah display: Shows selected motivations from onboarding
- "Your Data" shortcut → screen showing what's stored locally, export as JSON, delete everything
- "Edit character" option
- Settings accessible from profile via gear icon

**Notification strategy:**
- Prayer reminders: X minutes before prayer (5/10/15/30 min, default 10) PLUS gentle follow-up 30 min after if not completed
- Follow-up copy is invitational only ("Dhuhr window is still open") — NEVER "You missed Dhuhr!"
- Gentle follow-up is an optional toggle (default ON), configurable per-prayer
- Muhasabah: Push notification at user's set time (default 9pm) AND in-app HUD cue (glowing journal)
- Additional types (all opt-in, default OFF): Streak milestones, Quest expiring, Morning motivation
- All categories individually toggleable

**Settings organization:**
- Grouped sections, single scrollable screen: Prayer, Notifications, Appearance, About
- Prayer section: Calculation method picker, location (auto-detect / manual city search)
- Notifications section: "Prayer reminders" row → per-prayer sub-screen (toggle, lead time picker, follow-up toggle). Muhasabah time picker. Streak milestones toggle. Quest expiring toggle. Morning motivation toggle
- Appearance section: Sound toggle, Haptics toggle, Arabic terminology toggle
- Arabic terminology toggle: Default ON. OFF shows English only. Applied app-wide via i18n
- About section: Version, credits, support link
- Data management from Profile ("Your Data"), not duplicated in Settings

### Claude's Discretion
- Exact character preset designs and customization options (skin tones, outfit colors, accessories)
- Onboarding screen transitions and animation details
- Starter pack bundle composition (which habits in each bundle)
- Trophy case grid layout, rarity border styling, locked title silhouette design
- Streak bar visual design (colors, animation)
- Notification scheduling implementation (expo-notifications, background tasks)
- Prayer reminder sub-screen layout details
- Islamic calendar month detection for seasonal Niyyah options
- Export data format and implementation
- Tour spotlight/tooltip implementation

### Deferred Ideas (OUT OF SCOPE)
- Voice pack system (changeable app personality) — future polish
- Gear icon redesign on habits screen — carried from Phase 3
- Gradual within-environment evolution — carried from Phase 5
- Character customization shop (cosmetic items) — v2 Barakah Shop
- Niyyah editing/updating after onboarding — could be in profile settings later
- Notification smart scheduling (AI-optimized timing) — future iteration

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ONBR-01 | First-launch onboarding includes Niyyah (intention setting) flow | Niyyah table exists in SQLite schema; `settingsStore` needs `onboardingComplete` flag; Islamic calendar via `Intl.DateTimeFormat` for seasonal filtering |
| ONBR-02 | User selects initial habits from preset library during onboarding | `PresetLibrary` component already exists and is reusable; starter pack bundles are new wrappers around existing presets |
| ONBR-03 | Onboarding communicates game metaphor and XP philosophy clearly | `CharacterSprite` from Phase 5 already exists; `gameStore.currentLevel` and `totalXP` readable from first load |
| ONBR-04 | Onboarding completable in under 2 minutes | 5-screen linear flow (Welcome, Character, Niyyah, Habits, HUD tour); each screen must be ≤20 seconds; tour is skippable |
| PROF-01 | User can view profile with title, level, XP, streak history, and achievements | `gameStore` has level/XP/titles; `habitStore` has streaks; `TitleGrid` component reusable; existing `CharacterSprite` for sprite display |
| PROF-02 | User can access settings for notifications, prayer calculation method, and privacy controls | `settingsStore` already has `prayerCalcMethod`, `darkMode`, `soundEnabled`, `hapticEnabled`; extend with notification prefs and Arabic toggle |
| PROF-03 | User can export or delete all personal data | `expo-file-system` + `expo-sharing` for JSON export; cascade delete via `userRepo`; new "Your Data" screen |
| PROF-04 | Dark mode supported (default or system-auto) | `settingsStore.darkMode` already exists with `'auto'` default; `useColorScheme` hook wires Appearance API |
| NOTF-01 | User receives prayer time reminders | `expo-notifications` + `scheduleNotificationAsync` with `DateTriggerInput`; prayer times from existing `prayer-times.ts` service |
| NOTF-02 | User receives gentle evening Muhasabah reminder | `DailyTriggerInput` with hour/minute from `settingsStore.muhasabahReminderTime`; existing 9pm default |
| NOTF-03 | Notification copy is invitational, never guilt-based | Content copy domain module; all notification body text pre-defined, no dynamic "missed" language |
| NOTF-04 | User can configure or disable any notification category | Per-prayer and per-category toggles in `settingsStore`; notification reschedule on settings change |

</phase_requirements>

---

## Summary

Phase 6 delivers the first-launch experience, the persistent identity layer (profile), and the notification infrastructure. All three domains build on existing Phase 2-5 foundations rather than introducing new architectural primitives.

**Onboarding** is a 5-screen linear flow gated by `Stack.Protected` in Expo Router, using the existing `CharacterSprite`, `PresetLibrary`, and `habitStore` APIs. The `onboardingComplete` flag lives in `settingsStore` (persisted via SQLite). The Niyyah table already exists in the DB schema. Seasonal Niyyah filtering uses `Intl.DateTimeFormat` with the `islamic` calendar extension — no extra library needed.

**Profile** replaces the `PlaceholderScreen` on the Profile tab with a read-only RPG character sheet. All data already exists in `gameStore`, `habitStore`, and the `TitleGrid` component. The "Your Data" feature requires two new packages: `expo-file-system` (write JSON to cache dir) and `expo-sharing` (native share sheet). Data deletion is a cascade via `userRepo`.

**Notifications** require installing `expo-notifications` (not yet in the project). The `prayer-times.ts` service already calculates exact prayer times — the notification layer wraps these in `scheduleNotificationAsync` calls. Prayer follow-up notifications use a secondary `DateTriggerInput` set to prayer start + 30 min. The Muhasabah reminder uses `DailyTriggerInput`. All scheduling must be re-run whenever settings change (method, location, lead time).

**Primary recommendation:** Install `expo-notifications` + `expo-file-system` + `expo-sharing`, extend `settingsStore` with 10 new notification preference fields, add `onboardingComplete` flag, and write a `NotificationService` pure module that reads `settingsStore` + `prayer-times.ts` to schedule/cancel all notifications idempotently.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-notifications | ~0.32.x (SDK 54 compatible) | Schedule local push notifications | Official Expo SDK; supports `DateTriggerInput`, `DailyTriggerInput`, per-prayer scheduling |
| expo-router Stack.Protected | ~6.0.x (already installed) | First-launch guard for onboarding | SDK 53+ official pattern; replaces manual redirect logic |
| expo-file-system | ~18.x (SDK 54 compatible) | Write JSON export to cache dir before sharing | Official Expo SDK; already transitively available |
| expo-sharing | ~13.x (SDK 54 compatible) | Trigger native OS share sheet for JSON export | Official Expo SDK; cross-platform (iOS share sheet, Android intent) |
| Intl.DateTimeFormat (built-in) | Native JS | Detect current Hijri month for seasonal Niyyah | Zero-dependency; `'en-u-ca-islamic'` locale supported in Hermes/JSC |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-haptics | ~15.x (already installed) | Haptic feedback on notification permission grant, character selection | Already installed; use for onboarding micro-moments |
| react-native-reanimated | ~4.1.x (already installed) | Spotlight overlay for HUD tour, stat bar animations on profile | Already installed; `FadeIn`, `withTiming` for tour highlights |
| expo-location | ~19.x (already installed) | Location permission request for prayer calculation method setup | Already installed from Phase 3 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `Intl.DateTimeFormat` + `'islamic'` | `moment-hijri` npm package | Native `Intl` has zero bundle cost and works in Hermes; `moment-hijri` adds 60KB+; avoid for a single month detection |
| `expo-notifications` scheduling | Background fetch + custom timer | `expo-notifications` is the Expo-blessed path; custom timers break on iOS background termination |
| `expo-sharing` | `react-native-share` | `expo-sharing` is managed workflow compatible; `react-native-share` requires native linking |

**Installation:**
```bash
npx expo install expo-notifications expo-file-system expo-sharing
```

---

## Architecture Patterns

### Recommended Project Structure

```
app/
├── (onboarding)/           # Onboarding group — guarded by Stack.Protected
│   ├── _layout.tsx         # Stack navigator for linear flow
│   ├── welcome.tsx         # Screen 1: Welcome splash
│   ├── character.tsx       # Screen 2: Character creation
│   ├── niyyah.tsx          # Screen 3: Niyyah selection
│   ├── habits.tsx          # Screen 4: Starter pack selection
│   └── tour.tsx            # Screen 5: Interactive HUD tour
├── (tabs)/
│   ├── profile.tsx         # Replace PlaceholderScreen with ProfileScreen
│   └── _layout.tsx         # Existing tab layout (no changes needed)
├── settings.tsx            # Settings screen (push from profile)
├── prayer-reminders.tsx    # Per-prayer sub-screen (push from settings)
└── your-data.tsx           # Data management (push from profile)

src/
├── services/
│   └── notification-service.ts   # Pure TS module: schedule/cancel all notifications
├── domain/
│   └── niyyah-options.ts         # Curated motivations + seasonal filter logic
│   └── starter-packs.ts          # 3 starter habit bundle definitions
├── stores/
│   └── settingsStore.ts          # Extend with 10 new notification pref fields + onboardingComplete
└── components/
    ├── onboarding/
    │   ├── CharacterPicker.tsx    # 3-5 preset sprites + customization layer
    │   ├── NiyyahSelector.tsx     # Multi-select chip list (max 3)
    │   ├── StarterPackSelector.tsx
    │   └── HudTourOverlay.tsx     # Spotlight + tooltip overlay
    ├── profile/
    │   ├── ProfileHeader.tsx      # CharacterSprite + title + level
    │   ├── StatsGrid.tsx          # 3 stat cards
    │   ├── TrophyCase.tsx         # Adapts existing TitleGrid
    │   ├── StreakBars.tsx         # Horizontal bars per habit
    │   └── NiyyahDisplay.tsx      # Selected motivations chips
    └── settings/
        ├── SettingsList.tsx       # Grouped scrollable settings
        └── PrayerReminderRow.tsx  # Per-prayer toggle + lead time
```

### Pattern 1: Onboarding Guard with Stack.Protected

**What:** `Stack.Protected` wraps the onboarding group with `guard={!onboardingComplete}`. Once the user completes onboarding and the flag is set in `settingsStore`, the guard flips and the onboarding group becomes permanently inaccessible.

**When to use:** Any first-launch or first-time-setup flow. The guard is read from `settingsStore` which is persisted via SQLite — survives app restarts.

```typescript
// Source: https://docs.expo.dev/router/advanced/protected/
// app/_layout.tsx (root Stack)
import { useSettingsStore } from '../src/stores/settingsStore';

export default function RootLayout() {
  const onboardingComplete = useSettingsStore(s => s.onboardingComplete);

  return (
    <Stack>
      <Stack.Protected guard={!onboardingComplete}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ presentation: 'card' }} />
      <Stack.Screen name="prayer-reminders" options={{ presentation: 'card' }} />
      <Stack.Screen name="your-data" options={{ presentation: 'card' }} />
    </Stack>
  );
}
```

**Guard logic:** When `onboardingComplete` is `false` (or `undefined` on first launch), the `(onboarding)` group is accessible and `(tabs)` is also accessible (tabs don't need guarding — first load auto-redirects to onboarding via guard behavior). When `onboardingComplete` becomes `true`, Expo Router removes onboarding from navigation history automatically.

### Pattern 2: NotificationService — Pure TS Module

**What:** All notification scheduling lives in a single pure TypeScript module that reads prayer times and settings, then calls `expo-notifications` APIs. This makes it testable and keeps scheduling logic out of UI components.

**When to use:** Call `NotificationService.rescheduleAll()` on: app startup (if permissions granted), location change, prayer method change, notification preference change.

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/notifications/
// src/services/notification-service.ts

import * as Notifications from 'expo-notifications';
import { getPrayerWindows } from './prayer-times';
import type { CalcMethodKey, PrayerName } from '../types/habits';

export interface NotificationPrefs {
  prayerEnabled: Record<PrayerName, boolean>;
  prayerLeadMinutes: Record<PrayerName, number>;
  prayerFollowUpEnabled: Record<PrayerName, boolean>;
  muhasabahEnabled: boolean;
  muhasabahHour: number;
  muhasabahMinute: number;
  streakMilestonesEnabled: boolean;
  questExpiringEnabled: boolean;
  morningMotivationEnabled: boolean;
}

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return status === 'granted';
}

export async function rescheduleAll(
  lat: number,
  lng: number,
  calcMethod: CalcMethodKey,
  prefs: NotificationPrefs,
): Promise<void> {
  // Cancel all existing scheduled notifications (idempotent)
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!prefs.muhasabahEnabled && !Object.values(prefs.prayerEnabled).some(Boolean)) {
    return; // Nothing to schedule
  }

  const today = new Date();
  const windows = getPrayerWindows(lat, lng, today, calcMethod);

  for (const window of windows) {
    const name = window.name as PrayerName;

    if (prefs.prayerEnabled[name]) {
      const leadMs = prefs.prayerLeadMinutes[name] * 60 * 1000;
      const triggerDate = new Date(window.start.getTime() - leadMs);

      if (triggerDate > today) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: getPrayerReminderTitle(name),
            body: getPrayerReminderBody(name),
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });
      }

      // Follow-up: 30 min after prayer start if enabled
      if (prefs.prayerFollowUpEnabled[name]) {
        const followUpDate = new Date(window.start.getTime() + 30 * 60 * 1000);
        if (followUpDate > today) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: getFollowUpTitle(name),
              body: getFollowUpBody(name),  // "Dhuhr window is still open"
              sound: false,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: followUpDate,
            },
          });
        }
      }
    }
  }

  // Muhasabah daily reminder
  if (prefs.muhasabahEnabled) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for Muhasabah',
        body: 'A moment of reflection awaits.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: prefs.muhasabahHour,
        minute: prefs.muhasabahMinute,
        repeats: true,
      },
    });
  }
}
```

### Pattern 3: Hijri Month Detection for Seasonal Niyyah

**What:** Use `Intl.DateTimeFormat` with `'en-u-ca-islamic'` locale to get the current Hijri month number. Filter the Niyyah options array based on which months they're visible in.

**When to use:** On every launch of the Niyyah screen. Zero-dependency, zero bundle cost.

```typescript
// Source: MDN Intl.DateTimeFormat + Islamic calendar (verified: Hermes supports 'islamic' calendar)
// src/domain/niyyah-options.ts

export interface NiyyahOption {
  id: string;
  text: string;
  /** Hijri months this option appears in (1-12). undefined = always visible */
  visibleMonths?: number[];
}

function getCurrentHijriMonth(): number {
  const fmt = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric' });
  const parts = fmt.formatToParts(new Date());
  const monthPart = parts.find(p => p.type === 'month');
  return parseInt(monthPart?.value ?? '1', 10);
}

export function getAvailableNiyyahOptions(): NiyyahOption[] {
  const hijriMonth = getCurrentHijriMonth();
  return NIYYAH_OPTIONS.filter(opt =>
    !opt.visibleMonths || opt.visibleMonths.includes(hijriMonth)
  );
}

// Sha'ban = 8, Ramadan = 9 in Hijri
export const NIYYAH_OPTIONS: NiyyahOption[] = [
  { id: 'strengthen-salah', text: 'Strengthen my salah' },
  { id: 'daily-discipline', text: 'Build daily discipline' },
  { id: 'grow-closer', text: 'Grow closer to Allah' },
  { id: 'break-bad-habits', text: 'Break bad habits' },
  { id: 'find-consistency', text: 'Find consistency' },
  { id: 'prepare-ramadan', text: 'Prepare for Ramadan', visibleMonths: [8, 9] },
];
```

### Pattern 4: Data Export + Delete

**What:** Read all user-owned tables from SQLite, serialize as JSON, write to `FileSystem.cacheDirectory`, then call `Sharing.shareAsync()` to trigger native share sheet. Delete uses `userRepo` cascade.

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/filesystem/
// Source: https://docs.expo.dev/versions/latest/sdk/sharing/
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportUserData(userId: string): Promise<void> {
  const data = await collectAllUserData(userId); // reads all repos
  const json = JSON.stringify(data, null, 2);
  const path = `${FileSystem.cacheDirectory}halalhabits-export.json`;
  await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(path, {
    mimeType: 'application/json',
    dialogTitle: 'Export your HalalHabits data',
  });
}
```

### Anti-Patterns to Avoid

- **Scheduling notifications inside React components:** Side-effectful scheduling belongs in `NotificationService`, triggered by settings changes in `settingsStore` actions — not in `useEffect` hooks. `useEffect` re-runs on re-render; notification scheduling must be idempotent and one-time.
- **Hardcoding notification identifiers:** iOS/Android both enforce a 64-notification limit per app. Prayer reminders generate 10 notifications per day (5 prayers × 2 per prayer). Muhasabah is a daily repeating trigger (counts as 1). Stay well under the limit; do NOT schedule a week ahead for non-repeating triggers.
- **Using `AsyncStorage` for the `onboardingComplete` flag:** All settings are in `settingsStore` backed by `sqliteStorage`. Adding a separate `AsyncStorage` key would create divergent storage paths. Extend `settingsStore`.
- **Checking notification permission inside onboarding screens:** Request permission at the notification settings screen (when user first enables a category), not as a blocker in onboarding. Forcing permission dialogs during onboarding increases early abandonment.
- **Embedding navigation logic in `NotificationService`:** The service is a pure module (no React imports). Navigation from a notification tap is handled by Expo Router's notification response listener in the root layout.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Notification scheduling | Custom timer/interval system | `expo-notifications scheduleNotificationAsync` | Background timer reliability varies by OS; iOS terminates background tasks; expo-notifications uses native OS scheduling |
| File sharing / export | Custom server upload or clipboard | `expo-file-system` + `expo-sharing` | Cross-platform native share sheet; works offline; handles iOS/Android differences automatically |
| Onboarding route guarding | Manual `router.replace()` in `useEffect` | `Stack.Protected guard={...}` | Official SDK 53+ pattern; handles back navigation, deep links, and history pruning automatically |
| Hijri calendar conversion | Arithmetic lunar month calculation | `Intl.DateTimeFormat` with `'u-ca-islamic'` | Native JS, zero bundle cost, correct for tabular Islamic calendar |
| Character sprite customization | Full Skia-based pixel editor | Composited PNG layers (base + skin tone overlay + accessory overlay) | Pixel art sprites are static assets; layer compositing with Skia Image at runtime is simpler than interactive editing |

**Key insight:** All three major domains (notifications, data management, routing) have official Expo SDK solutions. The custom code lives only in the domain logic layer (notification copy, niyyah filtering, starter packs).

---

## Common Pitfalls

### Pitfall 1: Notification Scheduling Doesn't Survive App Restart on Android

**What goes wrong:** Prayer notifications scheduled with `DateTriggerInput` are cancelled when Android reboots the device. The app must reschedule them on next launch.

**Why it happens:** Android clears scheduled alarms on reboot unless the app registers a `BOOT_COMPLETED` receiver. `expo-notifications` config plugin handles this automatically with `android.permission.RECEIVE_BOOT_COMPLETED` in the manifest.

**How to avoid:** Add `expo-notifications` to `app.json` plugins with the config plugin (see Standard Stack). The plugin adds the boot receiver automatically. Reschedule all notifications in the app's root `useEffect` on startup (only if permissions granted and location available).

**Warning signs:** Notifications work in testing session but fail after device power cycle.

### Pitfall 2: iOS Notification Limit (64 Scheduled Notifications)

**What goes wrong:** iOS silently drops notifications beyond the 64-item limit. Scheduling 5 prayers × 2 (reminder + follow-up) × 7 days = 70 notifications exceeds the limit.

**Why it happens:** iOS enforces a hard cap of 64 scheduled local notifications per app.

**How to avoid:** Schedule only today's notifications for `DateTriggerInput` (non-repeating). Use `DailyTriggerInput` (counts as 1 slot) for Muhasabah. Today's maximum: 10 prayer notifications + 1 Muhasabah = 11 total. Reschedule tomorrow's at app launch.

**Warning signs:** Later prayers in the day stop notifying while earlier ones work.

### Pitfall 3: `Intl.DateTimeFormat` Hijri Calendar — Hermes Compatibility

**What goes wrong:** Hermes JS engine (used in React Native) has incomplete `Intl` support in older versions. The `'u-ca-islamic'` calendar extension may return incorrect values or throw.

**Why it happens:** Hermes `Intl` support improved significantly in RN 0.73+. The project uses RN 0.81.5, which includes a modern Hermes with full `Intl` support including Islamic calendar.

**How to avoid:** Wrap in try/catch with a fallback to Gregorian month (safe default — just show all Niyyah options). Test the Hijri detection in `__tests__/domain/niyyah-options.test.ts`.

**Warning signs:** Seasonal options appear out-of-season or not at all.

### Pitfall 4: onboardingComplete Flag Not Available on Root Layout Mount

**What goes wrong:** `settingsStore` uses `persist` middleware backed by SQLite. SQLite reads are async, but `Stack.Protected` evaluates the guard synchronously on mount. If the store hasn't hydrated yet, `onboardingComplete` is `undefined` (falsy), and the onboarding group briefly flashes before being hidden.

**Why it happens:** Zustand `persist` with async storage (`sqliteStorage`) hydrates after first render.

**How to avoid:** Add a `hydrated` flag to `settingsStore` (the store already uses `persist`; check Zustand's `onFinishHydration` callback). Gate the root layout render with a loading state until hydration completes (existing pattern used for `gameStore.loadGame`).

```typescript
// settingsStore extension
const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hydrated: false,
      onboardingComplete: false,
      // ... existing fields
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => sqliteStorage),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);
```

**Warning signs:** Onboarding briefly appears on returning users, or app gets stuck on blank screen.

### Pitfall 5: Delete All Data Breaks Active Session

**What goes wrong:** Deleting the user record cascades to all related tables. If `gameStore` and `habitStore` still hold in-memory state from the deleted user, the app crashes with FK or null reference errors.

**Why it happens:** Stores load on startup and hold userId-keyed data. After cascade delete, the userId record no longer exists but stores still reference it.

**How to avoid:** After successful data deletion, reset all stores to their initial state and navigate to the onboarding flow. Reset `settingsStore.onboardingComplete = false` to re-trigger the onboarding guard.

**Warning signs:** App crashes or shows stale data after "Delete everything" action.

### Pitfall 6: Arabic Terminology Toggle Requires i18n Namespace Structure

**What goes wrong:** Toggling "Arabic terminology" off mid-session requires all Arabic terms to have English-only alternatives ready in the i18n translation files. If keys are missing, `t('key')` returns the key string itself.

**Why it happens:** i18next falls back to key name when translation is missing. Arabic terms like "Muhasabah" may only exist in the Arabic-terminology-on namespace.

**How to avoid:** Define two sets of translations in the i18n setup — `ar-terms` (default ON) and `en-only` namespaces. Both must cover every Islamic term used in the app. Toggling switches the active namespace. Audit existing strings in Phase 5 components before implementing toggle.

**Warning signs:** After toggling, some strings revert to raw key names like `muhasabah.reflection`.

---

## Code Examples

Verified patterns from official sources:

### Requesting Notification Permissions (expo-notifications)

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/notifications/
import * as Notifications from 'expo-notifications';

async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return status === 'granted';
}
```

### Schedule a Daily Repeating Notification (Muhasabah)

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/notifications/
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Time for Muhasabah',
    body: 'Your reflection awaits.',
    sound: true,
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: 21,   // 9 PM
    minute: 0,
    repeats: true,
  },
});
```

### Schedule a One-Time Prayer Reminder

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/notifications/
const triggerDate = new Date(prayerStart.getTime() - leadMinutes * 60 * 1000);

await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Dhuhr',
    body: 'Ready for Dhuhr?',
    sound: true,
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: triggerDate,
  },
});
```

### app.json Plugin Config for expo-notifications

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#0a0a14",
          "defaultChannel": "default",
          "enableBackgroundRemoteNotifications": false
        }
      ]
    ]
  }
}
```

### Export Data with expo-file-system + expo-sharing

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/filesystem/
//         https://docs.expo.dev/versions/latest/sdk/sharing/
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const json = JSON.stringify(exportData, null, 2);
const path = `${FileSystem.cacheDirectory}halalhabits-export.json`;
await FileSystem.writeAsStringAsync(path, json, {
  encoding: FileSystem.EncodingType.UTF8,
});
await Sharing.shareAsync(path, {
  mimeType: 'application/json',
  dialogTitle: 'Export your HalalHabits data',
});
```

### Stack.Protected Onboarding Guard

```typescript
// Source: https://docs.expo.dev/router/advanced/protected/
// Evaluated on every render; Expo Router handles redirect automatically
<Stack.Protected guard={!onboardingComplete}>
  <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
</Stack.Protected>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `router.replace('/login')` in `useEffect` | `Stack.Protected guard={...}` | Expo SDK 53 (2024) | Eliminates flash-of-wrong-screen and handles deep links correctly |
| `AsyncStorage` for notification identifiers | Cancel-all + reschedule pattern | expo-notifications v0.30+ | Simpler; no identifier bookkeeping needed |
| `moment-hijri` npm package | `Intl.DateTimeFormat` with `u-ca-islamic` | Hermes ≥ RN 0.73 (2023) | Zero bundle cost for calendar conversion |
| Expo Go push notifications | Development builds required | Expo SDK 54 (2024) | Project already uses dev builds (FOUN-01 complete) |

**Deprecated/outdated:**
- `Notifications.SchedulableTriggerInputTypes` was NOT needed in older expo-notifications (used raw objects); now required for TypeScript correctness in SDK 54.
- `expo-permissions` package: Deprecated since SDK 44; permissions are now requested directly via each module (e.g., `Notifications.requestPermissionsAsync()`).

---

## Open Questions

1. **Hermes + `Intl` Islamic calendar support on target devices**
   - What we know: RN 0.81.5 + modern Hermes has full Intl; project is on SDK 54 (RN 0.81)
   - What's unclear: Actual device testing has not been done; some Android versions may have limited ICU data for Islamic calendar
   - Recommendation: Implement with try/catch fallback; add a test in `__tests__/domain/niyyah-options.test.ts` that verifies non-null Hijri month output

2. **CharacterSprite customization layer approach**
   - What we know: `CharacterSprite.tsx` exists in Phase 5 using Skia for pixel art character; Claude's Discretion area
   - What's unclear: Whether the character customization (skin tone, outfit color, accessory) should be Skia image layer compositing or pre-rendered PNG variants
   - Recommendation: Pre-rendered PNG variants per customization combination (3-5 skins × 3-4 outfits = 12-20 assets); Skia compositing is more complex and overkill for ≤20 combinations

3. **Notification reschedule trigger pattern**
   - What we know: Must reschedule when location, calc method, or lead time changes
   - What's unclear: Whether reschedule should be synchronous in `settingsStore` action or deferred to a useEffect watcher
   - Recommendation: Add a `rescheduleNotifications()` action to `settingsStore` that calls `NotificationService.rescheduleAll()` with current state; call it from each setter that affects prayer times

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | jest-expo (already configured) |
| Config file | `jest.config.js` at project root |
| Quick run command | `npx jest --testPathPattern="domain/niyyah\|services/notification" --passWithNoTests` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ONBR-01 | Niyyah options filter by Hijri month correctly | unit | `npx jest __tests__/domain/niyyah-options.test.ts -x` | ❌ Wave 0 |
| ONBR-02 | Starter pack bundles contain valid preset habit IDs | unit | `npx jest __tests__/domain/starter-packs.test.ts -x` | ❌ Wave 0 |
| ONBR-03 | Onboarding complete flag persists after store rehydration | unit | `npx jest __tests__/stores/settingsStore.test.ts -x` | ❌ Wave 0 |
| ONBR-04 | Onboarding screen count ≤ 5 screens | manual | Visual walkthrough < 2 min | N/A |
| PROF-01 | Profile reads correct level/XP/titles from gameStore | unit | `npx jest __tests__/stores/stores.test.ts -x` | ✅ (extend) |
| PROF-02 | settingsStore exposes all notification pref fields | unit | `npx jest __tests__/stores/settingsStore.test.ts -x` | ❌ Wave 0 |
| PROF-03 | Export JSON contains all expected data tables | unit | `npx jest __tests__/services/data-export.test.ts -x` | ❌ Wave 0 |
| PROF-04 | darkMode 'auto' reads system color scheme | manual | Visual check on dark/light device | N/A |
| NOTF-01 | NotificationService schedules correct count of prayer notifications | unit | `npx jest __tests__/services/notification-service.test.ts -x` | ❌ Wave 0 |
| NOTF-02 | Muhasabah daily trigger uses correct hour/minute | unit | `npx jest __tests__/services/notification-service.test.ts -x` | ❌ Wave 0 |
| NOTF-03 | No notification body text contains "missed" or guilt language | unit | `npx jest __tests__/domain/notification-copy.test.ts -x` | ❌ Wave 0 |
| NOTF-04 | Disabled prayer category results in 0 scheduled notifications for that prayer | unit | `npx jest __tests__/services/notification-service.test.ts -x` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx jest --testPathPattern="domain/niyyah\|domain/notification-copy\|services/notification" --passWithNoTests`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `__tests__/domain/niyyah-options.test.ts` — covers ONBR-01 (seasonal filtering)
- [ ] `__tests__/domain/starter-packs.test.ts` — covers ONBR-02 (bundle habit IDs)
- [ ] `__tests__/domain/notification-copy.test.ts` — covers NOTF-03 (adab copy guard)
- [ ] `__tests__/services/notification-service.test.ts` — covers NOTF-01, NOTF-02, NOTF-04
- [ ] `__tests__/services/data-export.test.ts` — covers PROF-03 (export format)
- [ ] `__tests__/stores/settingsStore.test.ts` — covers ONBR-03, PROF-02 (new fields)

---

## Sources

### Primary (HIGH confidence)

- [expo-notifications official docs](https://docs.expo.dev/versions/latest/sdk/notifications/) — scheduling API, trigger types, permission request, Android channel, iOS limits
- [Expo Router Protected Routes](https://docs.expo.dev/router/advanced/protected/) — `Stack.Protected guard` API, redirect behavior, first-launch pattern
- [expo-file-system docs](https://docs.expo.dev/versions/latest/sdk/filesystem/) — `writeAsStringAsync`, `cacheDirectory`
- [expo-sharing docs](https://docs.expo.dev/versions/latest/sdk/sharing/) — `shareAsync` signature and options
- Existing codebase: `settingsStore.ts`, `prayer-times.ts`, `gameStore.ts`, `habitStore.ts`, `0000_dark_mandrill.sql` — verified by direct read

### Secondary (MEDIUM confidence)

- [Expo blog: Protected routes announcement](https://expo.dev/blog/simplifying-auth-flows-with-protected-routes) — confirmed SDK 53+ availability; verified against docs
- [Expo SDK 54 push notification requirement](https://gist.github.com/Xansiety/5e8d264c5391b7e287705efbca70b80f) — dev builds required for push; local notifications still work without push setup — cross-verified with official docs
- MDN `Intl.DateTimeFormat` with `u-ca-islamic` — standard web API; Hermes compatibility inferred from RN 0.81 release notes (no direct official RN page for this specific case)

### Tertiary (LOW confidence)

- Hermes + Islamic calendar `Intl` support on Android devices: inferred from RN 0.81 Hermes upgrade, not directly tested. Flag for device validation in Wave 0 tests.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages are official Expo SDK; already in ecosystem or trivially installable
- Architecture: HIGH — patterns derived from existing codebase structure + official Expo Router docs
- Notification scheduling: HIGH — verified against official expo-notifications docs
- Hijri calendar: MEDIUM — `Intl` API verified; Hermes device compatibility is inferred, not device-tested
- Pitfalls: HIGH — derived from known Expo limitations (64-notification iOS limit is documented; Android boot clearing is documented)

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (Expo SDK stable; 30-day window before checking for expo-notifications API changes)
