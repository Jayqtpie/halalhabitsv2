# Phase 12: Friday Power-Ups - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Every Friday becomes a distinct game event — players see a 2x XP boost on the HUD, receive the Surah Al-Kahf quest card, and read one of 10 vetted hadith-sourced Friday messages. From ROADMAP.md: FRDY-01 through FRDY-04.

</domain>

<decisions>
## Implementation Decisions

### Friday Message Delivery
- **D-01:** Push notification in the morning + in-app message on first Friday open (both channels)
- **D-02:** In-app message is integrated into the HUD game world (scroll, banner, or element within the scene — not a modal or toast)
- **D-03:** One prominent message on first app open; subtle shorter variations if player returns later in the day
- **D-04:** Hadith source attribution is shown alongside the motivational text (e.g., "(Muslim 854)")
- **D-05:** 10 pre-written messages from `blueprint/15-content-pack.md` lines 234-250, rotate across weeks

### Al-Kahf Quest Mechanics
- **D-06:** Progress-based completion — player marks sections/pages as they go, completing when they finish all sections
- **D-07:** Quest expires at Maghrib prayer time on Friday (calculated via adhan-js using player's location)
- **D-08:** Added on top of regular daily/weekly quests as an extra card (does not replace any existing slot)
- **D-09:** Repeats every Friday — appears fresh each week (sunnah practice, not a one-time achievement)
- **D-10:** Awards 100 bonus XP on completion (not subject to 2x Friday multiplier — quest XP excluded per economy model)

### Friday Boost Window
- **D-11:** 2x XP boost runs midnight-to-midnight local time (full calendar Friday)
- **D-12:** Stacks multiplicatively with streak multiplier (max 3.0x streak x 2.0x friday = 6.0x effective)
- **D-13:** 2x applies to habit completion XP only, not quest XP (economy model constraint)
- **D-14:** Grace rule: if a habit was started before midnight, it still gets the Friday multiplier even if completed after midnight
- **D-15:** When boost ends, HUD indicator fades out with a "Friday boost ended" message (not instant disappear)

### Jumu'ah Salah Recognition
- **D-16:** In scope for Phase 12 — lightweight special treatment for Friday Dhuhr slot
- **D-17:** Special pixel art animation (mosque/minaret moment) + special mentor copy on Jumu'ah completion
- **D-18:** Dhuhr slot keeps its "Dhuhr" label on Fridays but gains a visible "Jumu'ah" tag/badge
- **D-19:** Separate "Jumu'ah" toggle distinct from regular Dhuhr — player explicitly marks Jumu'ah attendance (honor system)
- **D-20:** Jumu'ah toggle only appears on Fridays; standard Dhuhr behavior on all other days

### Claude's Discretion
- Al-Kahf section breakdown (how many sections, progress UX)
- Exact HUD integration design for Friday message and 2x badge
- Fade-out animation timing and copy for boost ending
- Jumu'ah special animation specifics (Skia/Reanimated implementation)
- Push notification scheduling (exact morning time)

</decisions>

<specifics>
## Specific Ideas

- Friday message in the HUD should feel like part of the game world — not a system notification overlaid on it
- Al-Kahf quest is progress-based (sections), not just a binary toggle — respects the actual reading practice
- Jumu'ah is a separate toggle from Dhuhr because they are spiritually distinct acts — the app should recognize that
- Fade-out on boost ending gives closure to the Friday event rather than abruptly cutting it

</specifics>

<canonical_refs>
## Canonical References

### Friday Power-Ups spec
- `blueprint/05-feature-systems.md` lines 449-456 — Friday Power-Ups mechanics, Al-Kahf challenge, economy impact
- `blueprint/15-content-pack.md` lines 234-250 — 10 pre-written Friday messages with hadith sources

### XP Economy
- `src/domain/xp-economy-v2.md` — Friday worst-case analysis (6.0x effective yields ~805 XP after cap)
- `src/domain/xp-engine.ts` — Core XP calculation with multiplier parameter and soft cap

### Integration points
- `src/stores/gameStore.ts` — `awardXP()` orchestration, `todayStart()`/day detection helpers
- `src/domain/quest-engine.ts` — Quest selection and progress evaluation
- `src/domain/quest-templates.ts` — 31 existing templates, Al-Kahf will be added here
- `src/components/hud/HudStatBar.tsx` — Current level/XP display (Friday badge goes here)
- `src/components/hud/HudScene.tsx` — Main HUD rendering (Friday message integration)
- `src/services/prayer-times.ts` — adhan-js wrapper for Maghrib time (Al-Kahf deadline)
- `src/stores/settingsStore.ts` — User location for timezone-aware Friday detection
- `src/domain/notification-copy.ts` — Existing copy patterns (mentor voice, rotation)

### Architecture
- `.planning/research/ARCHITECTURE.md` lines 62-79, 228-250 — Friday engine subsystem design

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `xp-engine.ts` `calculateXP(baseXP, multiplier, ...)` — Already accepts multiplier param; inject friday multiplier before calling
- `quest-templates.ts` — Add Al-Kahf template to existing pool with Friday gate
- `notification-copy.ts` `getMorningMotivation()` — Pattern for rotating copy (module-level counter)
- `blueprint/15-content-pack.md` — 10 Friday messages pre-written and sourced
- `prayer-times.ts` `getPrayerWindows()` — Provides Maghrib time for Al-Kahf deadline

### Established Patterns
- Pure domain functions in `src/domain/` (no React imports, fully testable)
- Zustand stores orchestrate domain + repo calls
- Quest gating via `minLevel` and `isRelevantToPlayer()` — add `isFriday()` gate
- Copy functions return strings, stateless or with module-level rotation counter
- Skia + Reanimated for HUD animations (60fps)

### Integration Points
- `gameStore.awardXP()` — Multiply by friday multiplier before `calculateXP()` call
- `gameStore.generateQuests()` — Gate Al-Kahf template with `isFriday()` check
- `HudStatBar.tsx` — Add Friday 2x badge component
- `HudScene.tsx` — Integrate Friday message as game-world element
- Habit completion flow — Add Jumu'ah toggle when Dhuhr + Friday detected

</code_context>

<deferred>
## Deferred Ideas

- Friday-specific environment visual (e.g., mosque skyline, green tint) — could be a future cosmetic phase
- Jumu'ah khutbah notes/reflection — too much scope, potentially a future Muhasabah variant
- Friday streak tracking (consecutive Fridays with Al-Kahf) — nice-to-have for title system later

</deferred>

---

*Phase: 12-friday-power-ups*
*Context gathered: 2026-03-22*
