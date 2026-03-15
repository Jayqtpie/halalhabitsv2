---
phase: 05-hud-visual-identity-and-muhasabah
plan: 04
subsystem: ui

tags: [pixel-art, react-native, image, icons, habit-card, png]

requires:
  - phase: 05-02
    provides: Home HUD pixel art aesthetic established
  - phase: 05-03
    provides: Muhasabah modal flow complete
provides:
  - Pixel art PNG icons (32x32) for all 6 habit categories (salah/quran/dhikr/fasting/dua/custom)
  - HabitCard updated to render RN Image instead of emoji Text
  - Consistent pixel art visual identity across Home HUD + Habits tab
affects:
  - phase-06-onboarding (visual identity reference)
  - verify-work (Phase 5 overall verification)

tech-stack:
  added: []
  patterns:
    - "Pixel art PNGs via React Native Image (not Skia) in standard RN views"
    - "HABIT_ICONS require-map keyed by habit.category with 'custom' fallback"
    - "resizeMode='contain' at 32x32 for crisp pixel art without upscaling"

key-files:
  created:
    - assets/icons/habit-salah.png
    - assets/icons/habit-quran.png
    - assets/icons/habit-dhikr.png
    - assets/icons/habit-fasting.png
    - assets/icons/habit-dua.png
    - assets/icons/habit-custom.png
    - scripts/gen-icons.py
  modified:
    - src/components/habits/HabitCard.tsx

key-decisions:
  - "Use RN Image (not Skia Image) in HabitCard -- component is standard RN view, not inside Skia Canvas"
  - "Icons keyed by habit.category (PresetCategory), not habit.type -- category is the semantic icon selector"
  - "character category maps to habit-custom.png (generic) -- no dedicated icon needed for character habits"
  - "Python-generated pixel art PNGs at 32x32 with jewel tone palette matching app design system"
  - "Icon source PNG size matches render size (32x32) to avoid upscaling antialiasing"

patterns-established:
  - "Pixel art icon pattern: require() map by category, RN Image at 32x32, resizeMode contain"
  - "Icon comment block documents design intent for future asset replacement with real pixel art tools"

requirements-completed:
  - HUD-02

duration: 4min
completed: 2026-03-15
---

# Phase 05 Plan 04: Pixel Art Habit Icons Summary

**32x32 pixel art PNG icons for all 6 habit categories generated and wired into HabitCard via React Native Image, completing Phase 5 visual identity migration (emoji-free Habits tab)**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-15T22:52:40Z
- **Completed:** 2026-03-15T22:56:25Z
- **Tasks:** 1 of 2 (Task 2 is a human-verify checkpoint)
- **Files modified:** 8 (6 PNGs + HabitCard.tsx + gen-icons.py)

## Accomplishments

- Generated 6 pixel art PNG icons (32x32) using jewel tone palette: emerald (salah), sapphire/gold (quran), violet (dhikr), golden moon (fasting), amber (dua), gold star (custom)
- Replaced emoji `<Text>` element in HabitCard with `<Image>` from React Native using a require-map keyed by `habit.category`
- Added `character` category to icon map (maps to custom icon) for completeness against the full `PresetCategory` union type
- All 277 tests pass; `tsc --noEmit` clean on all app source files
- Python icon generation script saved in `scripts/gen-icons.py` for future iteration

## Task Commits

Each task was committed atomically:

1. **Task 1: Pixel art icon assets + HabitCard icon migration** - `35c09ed` (feat)

## Files Created/Modified

- `assets/icons/habit-salah.png` - Mihrab arch pixel art, emerald tones (32x32)
- `assets/icons/habit-quran.png` - Open book with gold star, sapphire/gold (32x32)
- `assets/icons/habit-dhikr.png` - Tasbih beads in a loop, violet/amethyst (32x32)
- `assets/icons/habit-fasting.png` - Crescent moon + stars, deep blue/golden (32x32)
- `assets/icons/habit-dua.png` - Raised open hands, warm amber (32x32)
- `assets/icons/habit-custom.png` - 4-pointed sparkle star, bright gold (32x32)
- `scripts/gen-icons.py` - Python PNG generator with pixel-art rendering logic
- `src/components/habits/HabitCard.tsx` - Emoji Text replaced with RN Image + HABIT_ICONS map

## Decisions Made

- Use `React Native Image` (not Skia Image) because HabitCard is a standard RN component, not inside a Skia Canvas
- Key icon map by `habit.category` (PresetCategory) rather than `habit.type` -- category is the semantic discriminator for icon selection
- `character` preset category mapped to `habit-custom.png` (generic sparkle) -- no distinct character icon needed for v1
- Icons generated at 32x32 and rendered at 32x32 to avoid upscaling and the antialiasing blur that defeats pixel art crispness
- `resizeMode="contain"` ensures source dimensions are respected within the 32x32 container

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Pre-existing TypeScript errors in `__tests__/` files (missing `@types/jest` in tsconfig `compilerOptions.types`) are unrelated to this plan and do not affect app compilation or test execution.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 5 is ready for human verification (`/gsd:verify-work` or checkpoint review)
- Checkpoint Task 2 (human-verify) is pending: user must confirm pixel art icons appear in Habits tab and Muhasabah full flow works end-to-end
- Real pixel art icons can be swapped in by replacing PNGs in `assets/icons/` -- no code changes needed
- Phase 6 (Onboarding, Profile & Notifications) can begin once Phase 5 verification is approved

---
*Phase: 05-hud-visual-identity-and-muhasabah*
*Completed: 2026-03-15*
