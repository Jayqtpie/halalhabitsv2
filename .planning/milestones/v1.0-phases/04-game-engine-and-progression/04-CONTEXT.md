# Phase 4: Game Engine and Progression - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Habit completions feed a balanced game economy with XP, levels, titles, and quests that motivate discipline without implying spiritual judgment. This phase builds the progression engine (pure TypeScript), wires XP into the completion flow, implements the Quest Board screen, and adds level-up/title-unlock celebrations. HUD visual identity (pixel art scene) is Phase 5. Profile screen is Phase 6.

</domain>

<decisions>
## Implementation Decisions

### XP feedback on completion
- Floating number animation rises from the completed card in pixel font (Press Start 2P)
- Shows full breakdown: "15 x 1.5x = +22 XP" — transparent about multiplier math
- Emerald/jewel-tone color, fades as it floats up
- Haptic pulse accompanies the XP float (already exists from Phase 3 completion)

### XP bar on habits screen
- Persistent XP progress bar below the daily progress bar on habits tab
- Format: "Lv 8  ██████────  340/680 XP"
- On level-up: bar fills to 100%, brief glow/flash, resets to 0 and starts filling from new level's progress
- Animated transitions on XP gain (bar fills incrementally)

### Active title on habits screen
- Active title displayed next to level badge in habits header: "Lv 8 · The Steadfast"
- Moves to HUD in Phase 5 — habits screen placement is temporary home

### Level-up celebration
- Full-screen modal overlay for every level-up
- Level number animates in large, pixel font, with particle/glow effects
- Wise mentor voice copy at each milestone range:
  - Level 5: "Your discipline grows stronger."
  - Level 10: "A new horizon opens before you."
  - Level 20: "Consistency is becoming your nature."
  - Level 50: "Few have walked this far. MashaAllah."
- Shows unlocks earned at this level (new title, environment unlock, Quest Board unlock)
- "Continue" button to dismiss (not auto-dismiss — let the player savor it)
- Heavy haptic burst on level-up

### Title unlock celebration
- Full-screen modal (same style as level-up) for standalone title unlocks
- Shows: title name in pixel font, Arabic subtitle if applicable, rarity badge (Common/Rare/Legendary), flavor text
- "Equip" and "Later" buttons — player can immediately equip or dismiss
- If title unlocks during a level-up, bundle into the level-up screen (don't show two modals)

### Title viewing and equipping
- Tab toggle at top of Quests screen: "Quests | Titles"
- Titles section grouped by rarity: Common, Rare, Legendary with count (e.g., "Common 4/10")
- Unlocked titles: name, rarity badge, tap to view details + equip
- Locked titles: name visible but greyed, rarity shown, tap to see unlock condition with progress bar (e.g., "Fajr 40 consecutive days ████────── 12/40")
- Active title highlighted with emerald accent
- One active title at a time — tap another unlocked title to switch

### Quest Board layout and behavior
- Grouped sections: Daily Quests (3 slots), Weekly Quests (2 slots), Stretch Quest (1 slot)
- Each quest is a card with: description, progress bar, progress count (e.g., "3/5"), XP reward
- Auto-track progress — no "accept" button. Quests just progress as player completes habits
- Completed quests: checkmark, emerald "Completed! +50 XP" state, stays visible as mini-trophy until cycle resets
- Quest generation: daily quests regenerate at midnight local time, weekly at Sunday midnight
- Expired quests silently disappear — no penalty, no "you missed it" message (adab-safe)
- No repeat of same quest template within 7 days
- Quest Board locked until Level 5: locked state shows "Quest Board unlocks at Level 5" with current level progress

### Claude's Discretion
- Quest generation algorithm (template selection, difficulty scaling with level)
- Exact animation implementations (Reanimated specifics for floats, modals, progress bars)
- XP bar component design details (colors, height, animation easing)
- Level-up copy for non-milestone levels (Claude writes per-range copy)
- Title seed data migration structure
- Progression engine internal architecture (single module vs split)

</decisions>

<specifics>
## Specific Ideas

- The XP float with full breakdown ("15 x 1.5x = +22 XP") teaches the multiplier system passively — players learn that streaks matter without reading docs
- Level-up should feel like a genuine RPG moment — not a toast that slides away. The player earned this.
- Quest Board locked state at pre-Level 5 creates a clear early goal and prevents new user overwhelm
- Completed quests staying visible as "trophies" until reset gives satisfaction of seeing a full board of greens
- Title progress bars on locked titles give players concrete goals to chase — "12/40 Fajr" is motivating

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `xpRepo` (src/db/repos/xpRepo.ts): XP ledger CRUD — create, getByUser, getDailyTotal, getLifetimeTotal
- `userRepo` (src/db/repos/userRepo.ts): Has `updateXP(id, totalXP, level)` method ready
- `questRepo` (src/db/repos/questRepo.ts): Quest lifecycle — create, updateProgress, complete, expireOld
- `gameStore` (src/stores/gameStore.ts): Zustand store shell with currentLevel, totalXP, titles, activeTitle fields
- `streak-engine` (src/domain/streak-engine.ts): Pure TS module, returns multiplier for XP calculation
- `habitStore.completeHabit()`: Has `xpEarned: 0` placeholder ready for XP injection
- Design tokens: colors, typography, spacing all available
- DB schema: users, xp_ledger, titles, user_titles, quests tables all exist with proper columns

### Established Patterns
- Pure TypeScript domain modules (no React imports) — streak-engine is the template
- Store-repo-engine pattern: store orchestrates repos for DB and engine for logic
- Zustand domain-split stores with useShallow selectors
- Drizzle ORM for typed SQL

### Integration Points
- `habitStore.completeHabit()` → inject XP calculation after streak update
- `users.totalXp` + `users.currentLevel` → level calculation target
- `habit_completions.xpEarned` → currently 0, needs real values
- `xp_ledger` → decoupled from worship data for privacy
- Quests tab: `app/(tabs)/quests.tsx` exists as placeholder
- `titles` table needs seed data (26 titles from Blueprint)
- Missing: `titleRepo` for title queries and grants

</code_context>

<deferred>
## Deferred Ideas

- Voice pack system (changeable app personality) — Phase 6 or future
- Arabic terminology toggle — Phase 6 settings
- Gear icon redesign on habits screen — future polish

</deferred>

---

*Phase: 04-game-engine-and-progression*
*Context gathered: 2026-03-10*
