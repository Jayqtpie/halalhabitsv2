# Phase 5: HUD, Visual Identity, and Muhasabah - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

The app looks and feels like a premium retro RPG with a full-screen game-world Home HUD, smooth 60fps animations, haptic feedback, and a private nightly reflection ritual. This phase builds the immersive Home screen scene with pixel art environments, interactive objects, HUD stat overlays, animated character sprite, real-time day/night cycle, and the Muhasabah reflection flow. XP bar, level badge, and celebration overlays already exist from Phase 4 (on habits screen) — this phase moves game identity to the Home HUD as the primary game surface.

</domain>

<decisions>
## Implementation Decisions

### Home HUD composition
- Full immersive pixel art scene — the entire Home screen IS the game world
- Player character sprite visible in the scene (small pixel figure, scholar/student aesthetic)
- Character has animated idle loop (2-4 frame breathing/movement spritesheet animation)
- Interactive tappable objects in the scene navigate to other tabs (quest board → quests, prayer mat → habits, journal → Muhasabah)
- HUD stat overlays on top of the scene: level badge, XP progress bar, best active streak count, next prayer time countdown
- Stats overlay is minimal/translucent — doesn't obscure the pixel art

### Pixel art asset approach
- AI-generated pixel art for environments and character sprites
- Assets created externally, imported as PNGs/spritesheets
- Rendering approach: Claude's discretion (research hybrid PNG + Skia effects approach vs pure PNG)
- Skia with FilterQuality.None for crisp pixel rendering (already established in design tokens)
- Replace emoji habit card icons with custom pixel art icons (migration from Phase 3 deferral)

### HUD environments
- 4 environments triggered by level-based thresholds (Claude to determine exact level gates, aligned with XP curve)
  - Quiet Study → Growing Garden → Scholar's Courtyard → Living Sanctuary
- Dramatic reveal transition on environment unlock — old scene fades, new scene emerges, special celebration moment
- Each environment has a distinct mood/color palette:
  - Quiet Study: warm candlelight ambiance
  - Growing Garden: fresh morning light
  - Scholar's Courtyard: golden afternoon
  - Living Sanctuary: starlit night serenity
- Real-time day/night cycle — scene shifts between dawn/day/evening/night based on local time
  - Lanterns light up at night, moon appears, etc.
  - Supports Muhasabah nighttime prompt naturally

### Muhasabah reflection flow
- Guided prompts with taps, 3 screens:
  1. "How was your discipline today?" — emoji scale (5 options)
  2. "Pick your highlight" — shows today's completed habits, user selects one
  3. "Tomorrow's focus" — quick-pick options (Keep momentum / Try harder on ___ / Rest & recover)
- 30-60 seconds to complete, mostly tapping (minimal typing)
- Entry point: Home HUD visual cue after Isha time (moon rises, lantern glows, journal object appears/pulses)
- Tapping the journal object or visual cue opens Muhasabah
- Closing screen: curated Quranic ayah or hadith, thematically matched to gratitude/reflection, rotating selection
- Small XP reward for completion (~10-15 XP, effort-based, consistent with philosophy)
- Muhasabah data is PRIVATE (device-only, never synced — enforced by Privacy Gate)
- Skippable with zero penalty or shame — no "you missed reflection" messaging

### Claude's Discretion
- Rendering architecture (hybrid PNG + Skia effects vs pure PNG with Reanimated)
- Exact level thresholds for environment transitions
- Spritesheet animation implementation details (Skia frame cycling)
- Interactive object hit areas and visual feedback
- Day/night cycle implementation (gradient overlays, tint shifts)
- HUD overlay layout, positioning, and translucency
- Muhasabah prompt rotation logic and content
- Quranic ayah/hadith selection and storage (curated set, vetted for accuracy)
- Environment reveal animation implementation
- Pixel art icon set for habit cards (which icons for which habit types)

</decisions>

<specifics>
## Specific Ideas

- The Home screen should feel like opening a game — not a dashboard. The pixel world IS the product identity.
- Interactive objects in the scene make the tab bar supplementary, not primary — tapping the quest board in the world is more immersive than tapping a tab icon.
- Day/night cycle ties the game world to real life — when the player opens the app at Fajr, the scene shows dawn. At Isha, the scene is nighttime with the Muhasabah journal glowing.
- Environment transitions should feel like unlocking a new area in an RPG — a genuine moment of progression, not just a background swap.
- Muhasabah closing ayah adds spiritual warmth without making the reflection feel like a religious obligation — it's a gift at the end.
- Pixel character with idle animation makes the world feel alive even when you're just checking your stats.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `gameStore` (src/stores/gameStore.ts): Full game state with level, XP, titles, quests, celebrations — HUD reads from this
- `XPProgressBar` (src/components/game/XPProgressBar.tsx): XP bar component, currently on habits screen — can be adapted for HUD overlay
- `LevelBadge` (src/components/game/LevelBadge.tsx): Level display component — reusable on HUD
- `CelebrationManager` (src/components/game/CelebrationManager.tsx): Level-up and title unlock overlays — extend for environment reveal
- `prayer-times` service (src/services/prayer-times.ts): Isha time calculation for Muhasabah trigger
- `colors.ts` (src/tokens/colors.ts): Already has `hud` semantic colors (overlayBg, overlayBorder, xpBarBg, xpBarFill, xpBarGlow)
- `settingsStore` (src/stores/settingsStore.ts): Location data for prayer times
- `PlaceholderScreen` (src/components/ui/PlaceholderScreen.tsx): Currently used on Home tab — will be replaced

### Established Patterns
- Pure TypeScript domain modules (no React imports) — for Muhasabah data logic
- Store-repo-engine pattern: store orchestrates repos for DB and engine for logic
- Zustand domain-split stores with useShallow selectors
- Reanimated for 60fps animations (used in Phase 4 celebrations)
- Privacy Gate table-level classification (Muhasabah table will be PRIVATE)

### Integration Points
- `app/(tabs)/index.tsx`: Home tab placeholder → replace with HUD scene
- `gameStore.loadGame()`: Already loads level, XP, titles, quests — HUD subscribes to this
- `habitStore.streaks`: Streak data for HUD overlay
- `prayer-times.ts`: Next prayer countdown for HUD + Isha detection for Muhasabah trigger
- `xp_ledger` + `userRepo.updateXP()`: Muhasabah XP reward flows through existing XP pipeline
- New DB table needed: `muhasabah_entries` (PRIVATE classification)
- New DB migration needed for muhasabah schema

</code_context>

<deferred>
## Deferred Ideas

- Voice pack system (changeable app personality) — Phase 6 or future
- Arabic terminology toggle — Phase 6 settings
- Gear icon redesign on habits screen — future polish (carried from Phase 3)
- Gradual within-environment evolution (progressive detail additions between level thresholds) — future polish

</deferred>

---

*Phase: 05-hud-visual-identity-and-muhasabah*
*Context gathered: 2026-03-15*
