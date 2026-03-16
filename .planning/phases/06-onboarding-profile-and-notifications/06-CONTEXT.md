# Phase 6: Onboarding, Profile & Notifications - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

New users experience a compelling first launch that sets their Niyyah, creates their character, selects starter habits, and teaches navigation through an interactive HUD tour. Returning users manage their profile (RPG character sheet with stats, titles, streaks) and settings (grouped sections with per-prayer notification controls). A notification system invites users back with prayer reminders, Muhasabah nudges, and optional milestone/quest/motivation alerts — never guilt-based.

</domain>

<decisions>
## Implementation Decisions

### Onboarding flow
- Single narrative journey, not disconnected steps — each screen flows into the next
- Flow order: Welcome splash → Character creation → Niyyah motivations → Starter habit bundles → Interactive HUD tour
- Total target: ~90 seconds + ~15-20 sec guided tour
- Character creation: Pick from preset pixel art characters (3-5 scholar/student looks), then optionally customize (skin tone, outfit color, accessory)
- Niyyah: Multi-select up to 3 motivations from curated list (e.g., "Strengthen my salah", "Build daily discipline", "Grow closer to Allah", "Break bad habits", "Find consistency")
- Niyyah options rotate seasonally — e.g., "Prepare for Ramadan" only appears during Sha'ban/Ramadan, not after. Context-aware based on Islamic calendar month
- Selected motivations shown on profile and can influence quest suggestions
- Habit selection: Starter pack bundles (2-3 curated bundles like "Beginner Path", "Salah Focus", "Full Discipline") with "Customize my own" option that opens the existing PresetLibrary
- Final moment: Interactive guided tour on HUD — spotlight on prayer mat ("Tap here for your habits"), spotlight on quest board, then "You're ready. Go." Teaches navigation by doing
- Tour is skippable

### Profile screen
- RPG character sheet layout — game-first, not dashboard
- Top section: Character sprite (from onboarding creation), active Identity Title, level display
- Stats grid: 3 cards showing XP total, best active streak, days active
- Titles section: Trophy case grid of all 26 titles — earned ones glow with pixel art icon, locked ones show silhouette + unlock condition hint. Tappable for details
- Streak section: Horizontal streak bars per habit showing current streak length. Best streak highlighted
- Niyyah display: Shows selected motivations from onboarding
- "Your Data" shortcut link → dedicated screen showing what's stored locally, export as JSON, delete everything
- "Edit character" option to re-customize appearance
- Settings accessible from profile via gear icon or link

### Notification strategy
- Prayer reminders: Smart — notification X minutes before prayer time (user-configurable: 5/10/15/30 min, default 10) PLUS gentle follow-up 30 min after if not yet completed
- Follow-up copy is invitational only: "Dhuhr window is still open" / "There's still time for Asr" — NEVER "You missed Dhuhr!"
- Gentle follow-up is an optional toggle (default ON), configurable per-prayer
- Muhasabah: Both push notification at user's set time (default 9pm, already in settingsStore) AND in-app HUD cue (glowing journal). Neither shames if skipped
- Additional notification types (all opt-in, default OFF):
  - Streak milestones: Celebrate at 3, 7, 14, 30, 60, 90 days ("7-day Fajr streak — mashallah")
  - Quest expiring: "Daily quest expires in 2 hours" / "Weekly quest ends tomorrow"
  - Morning motivation: One short line at Fajr time, rotating curated hadith or encouragement
- All notification categories individually toggleable by user (NOTF-04)

### Settings organization
- Grouped sections on a single scrollable screen: Prayer, Notifications, Appearance, About
- Prayer section: Calculation method picker (ISNA, MWL, Egyptian, etc.), location (auto-detect / manual city search)
- Notifications section: "Prayer reminders" tappable row → opens per-prayer sub-screen (each prayer has: reminder toggle, lead time picker, gentle follow-up toggle). Muhasabah reminder time picker. Streak milestones toggle. Quest expiring toggle. Morning motivation toggle
- Appearance section: Sound toggle, Haptics toggle, Arabic terminology toggle
- Arabic terminology toggle: Default ON — shows Arabic terms with inline English context ("Muhasabah (reflection)"). OFF shows English only ("reflection"). Applied app-wide via i18n
- About section: Version, credits, support link
- Data management accessed from Profile ("Your Data"), not duplicated in Settings

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

</decisions>

<specifics>
## Specific Ideas

- Onboarding should feel like starting an RPG — "Begin your journey" → create character → set intention → choose your path → enter the world
- Character creation loads a preset first, then user can optionally customize on top of it (not blank-slate creation)
- The guided HUD tour at the end teaches by doing, not reading — user actually taps objects to learn navigation
- Profile is an RPG character sheet, not a settings page with stats — the character sprite and title are the hero, stats are the supporting cast
- Trophy case creates a "gotta catch 'em all" motivation for titles without being manipulative — locked titles show silhouettes with unlock conditions as aspirational goals
- Notification copy follows the wise mentor voice: encouraging, never nagging. "Your discipline grows stronger" not "Don't break your streak!"

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `settingsStore` (src/stores/settingsStore.ts): Already has prayerCalcMethod, darkMode, soundEnabled, hapticEnabled, muhasabahReminderTime, location — extend for new notification preferences and Arabic toggle
- `PresetLibrary` (src/components/habits/PresetLibrary.tsx): Existing preset habit selection component — reusable in "Customize my own" onboarding path
- `gameStore` (src/stores/gameStore.ts): Level, XP, titles, quests — Profile screen reads all of this
- `habitStore` (src/stores/habitStore.ts): Streak data for profile streak timeline
- `TitleGrid` (src/components/quests/): Existing title grid component from Phase 4 — adaptable for profile trophy case
- `CharacterSprite` (src/components/hud/): Pixel character with idle animation from Phase 5 — reusable on profile and onboarding
- `PlaceholderScreen` (src/components/ui/PlaceholderScreen.tsx): Currently on Profile tab — will be replaced
- `prayer-times` service (src/services/prayer-times.ts): Prayer time calculation for notification scheduling
- i18n infrastructure (i18next) from Phase 2 — Arabic terminology toggle hooks into this

### Established Patterns
- Zustand domain-split stores with useShallow selectors
- Store-repo-engine pattern: store orchestrates repos for DB and engine for logic
- Privacy Gate table-level classification
- Pure TypeScript domain modules (no React imports)
- Reanimated for 60fps animations

### Integration Points
- `app/(tabs)/profile.tsx`: Replace PlaceholderScreen with real profile
- New route needed: Settings screen (sub-route from profile or modal)
- New route needed: Prayer reminders sub-screen
- New route needed: Your Data screen
- New route needed: Onboarding flow (conditional on first launch)
- `settingsStore`: Extend with notification preferences, Arabic toggle, onboarding completion flag
- Notification system: expo-notifications for scheduling prayer/Muhasabah/milestone notifications
- `gameStore` + `habitStore`: Profile reads from both for stats display

</code_context>

<deferred>
## Deferred Ideas

- Voice pack system (changeable app personality) — future polish
- Gear icon redesign on habits screen — carried from Phase 3
- Gradual within-environment evolution — carried from Phase 5
- Character customization shop (cosmetic items) — v2 Barakah Shop
- Niyyah editing/updating after onboarding — could be in profile settings later
- Notification smart scheduling (AI-optimized timing) — future iteration

</deferred>

---

*Phase: 06-onboarding-profile-and-notifications*
*Context gathered: 2026-03-16*
