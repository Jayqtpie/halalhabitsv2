# Phase 3: Core Habit Loop - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can track Islamic habits daily, see prayer-aware time windows, build streaks, and recover compassionately when they miss. This is the complete daily discipline loop — the product's reason to exist. Game engine (XP, leveling, titles, quests) is Phase 4. HUD visual identity is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Habit list layout & completion
- Stacked card layout — each habit is a card with icon, name, time window (if applicable), streak count, and tap-to-complete button
- Completion feedback: jewel-tone glow burst, checkmark stamps in with scale animation, streak count ticks up, brief haptic pulse
- Completed cards shift to "completed" state (muted/dimmed with checkmark) and sink to bottom of list
- Uncompleted habits stay at the top, completed habits slide below — clear visual separation
- Daily progress summary at top: "3 of 7 complete" with jewel-tone progress bar

### Habit list ordering
- Salah habits always appear in chronological prayer time order (Fajr → Isha) at the top of the list
- Non-salah habits appear below salah in user-set sort order
- This ordering is automatic — not configurable

### Islamic preset library & creation flow
- Tap "+" → categorized preset library screen with categories: Salah (5), Quran (Daily Reading, Memorization), Dhikr (Morning Adhkar, Evening Adhkar), Dua (Daily Dua), Fasting (Monday/Thursday, White Days), Character (Gratitude, Patience, Charity)
- ~15 presets total covering worship + self-improvement
- "Create custom" option at the bottom of preset library
- Salah prayers are individually selectable (not all-or-nothing) — a new Muslim might start with 2-3

### Custom habit creation
- Claude's discretion on exact fields and complexity — balance simplicity vs configurability

### Prayer time integration
- Salah cards show time window with status badge: 🟢 Active (within window), ⏳ Upcoming (next prayer with "In X hours"), — Passed (window ended)
- Salah habits are completable anytime, even outside window — no locking
- Salah Streak Shield bonus only applies when completed within the prayer time window (differentiated XP tier, no shaming for late completion)
- Prayer times calculated locally via adhan-js based on user location and selected calculation method
- Location: auto-detect with permission request on first salah habit add, manual city search as fallback/override

### Mercy Mode recovery
- Triggers per-habit (not global) — missing Fajr only affects Fajr's streak
- Activation: gentle banner at top of habits tab on next visit after streak break
- Banner copy: "Your momentum paused. The door of tawbah is always open." with "Begin Recovery" button
- Banner is dismissible but persistent until recovery starts or user completes today's habits
- Recovery path: 3-day rebuild — complete the habit for 3 consecutive days
- Recovery progress shown as 3-step visual tracker with encouraging copy at each step
- On recovery completion: 25% of pre-break streak is restored, celebratory message
- Skip option always available: "Start fresh" resets to streak 0 with no partial credit — no judgment either way
- Both paths (recovery and fresh start) are presented as equally valid choices

### Claude's Discretion
- Custom habit creation form details (fields, validation, complexity level)
- Loading/empty states for habit list
- Exact animations (Reanimated specifics) for completion burst and card reordering
- Calendar/heatmap view design for habit history (HBIT-06)
- Edit/archive habit flow details (HBIT-05)
- Streak display design on individual habit cards
- Prayer calculation method selection UI placement

</decisions>

<specifics>
## Specific Ideas

- The habit list should feel like a daily quest board — each card is a mission to complete, not a chore to check off
- Mercy Mode messaging must feel like "a door opening" — never a punishment notification (from Phase 1 context)
- Salah time windows give the app a living, breathing quality that static habit trackers lack — this is a differentiator
- The 3-day recovery path should feel achievable and motivating, not like a penalty box

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `habitRepo` (src/db/repos/habitRepo.ts): CRUD operations for habits table — needs completion and streak repos added
- `useHabitStore` (src/stores/habitStore.ts): Zustand store with load/add/archive — needs completion tracking, streak state
- `PlaceholderScreen` (src/components/ui/PlaceholderScreen.tsx): Currently used for habits tab — will be replaced
- `CustomTabBar` (src/components/ui/CustomTabBar.tsx): Tab navigation already functional
- Design tokens (src/tokens/): colors, typography (Press Start 2P + Inter), spacing, radius, motion — ready to use
- Privacy Gate (src/services/privacy-gate.ts): habit_completions and streaks classified as PRIVATE — enforced
- `uuid` utility (src/utils/uuid.ts) and `date` utility (src/utils/date.ts) available

### Established Patterns
- DAO/repository pattern: pure TypeScript, no React imports (habitRepo as template)
- Zustand domain-split stores: store calls repo, components use useShallow selectors
- Drizzle ORM for typed SQL access
- SQLite as source of truth, Zustand as read cache

### Integration Points
- `habits` table schema ready with all needed columns (presetKey, category, type, frequency, timeWindowStart/End, difficultyTier, baseXp)
- `habitCompletions` table ready (habitId, completedAt, xpEarned, streakMultiplier)
- `streaks` table ready (habitId, currentCount, longestCount, multiplier, isRebuilt, rebuiltAt)
- `settings` table has prayerCalcMethod, locationLat/Lng, locationName columns
- Tab navigation: habits tab at app/(tabs)/habits.tsx needs real content
- adhan-js planned but not yet installed — needs npm install and service creation

</code_context>

<deferred>
## Deferred Ideas

- Voice pack system (changeable app personality) — Phase 6 or future
- Arabic terminology toggle — Phase 6 settings
- Both carried forward from Phase 1 and Phase 2 context

</deferred>

---

*Phase: 03-core-habit-loop*
*Context gathered: 2026-03-09*
