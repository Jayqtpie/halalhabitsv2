# Phase 1: Master Blueprint - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete 16-section implementation-ready design document that eliminates ambiguity before any code is written. Covers executive vision, game design, worldbuilding, feature systems, UX flows, screen specs, UI tokens, sound/haptics, tech architecture, data model, telemetry, QA plan, delivery roadmap, content pack, and build handoff. The output is documentation only — no code in this phase.

</domain>

<decisions>
## Implementation Decisions

### Visual Identity
- Modern pixel revival aesthetic (Celeste/Hyper Light Drifter era) — pixel art with modern lighting, particles, and effects
- Deep jewel tone color palette: emerald, sapphire, ruby, gold on dark backgrounds — premium feel with Islamic geometric art influence
- Home HUD is a game world scene (pixel art environment like mosque courtyard or study room) that evolves as player levels up — progress IS the world
- All screens outside HUD use modern mobile UI with pixel art soul — pixel characters, icons, and animations give retro personality without sacrificing usability
- HUD = full pixel immersion; habits list, settings, profile = modern UI with pixel accents

### Game Economy Feel
- Fast early wins: player should hit level 5-8 in first week with consistent habits, then curve flattens logarithmically
- 20+ Identity Titles at launch with rarity tiers (common, rare, legendary) — rich collectible ecosystem
- Varied challenge board: mix of daily (easy), weekly (medium), and stretch quests (hard) with rotating variety
- Streak multiplier resets only on miss — XP total never goes down, but consecutive-day bonus multiplier resets to 1x
- No XP loss for missed days — mercy-forward philosophy baked into the economy

### Adab Voice & Copy Tone
- Default voice: wise mentor — calm, encouraging, slightly formal, like a respected older sibling who games ("Your discipline grows stronger")
- Arabic terms with inline context: "Complete your Dhikr (remembrance) session" — teaches as it goes, accessible to new Muslims
- Mercy Mode uses blended tone: brief Islamic wisdom + game recovery action ("The door of tawbah is always open. Recovery quest unlocked — rebuild your momentum.")
- Curated Quranic ayat and hadith references at key moments: streak milestones, Mercy Mode activation, Muhasabah prompts, title unlocks — vetted for accuracy
- All copy must pass adab safety rails: no shame, no spiritual judgment, no guilt language

### Blueprint Format
- 16 separate markdown files in a /blueprint directory (section-per-file), cross-referenced with links
- Full wireframe-level screen specs: purpose, layout description, component list, interaction notes, animation specs, copy examples, edge states, and ASCII mockups
- Full copy deck: actual text strings for all UI (buttons, notifications, errors, celebrations, Mercy Mode) — ready to drop into code
- XP formula defined with simulation table: level 1-100 showing XP required, estimated days to reach, and unlocks at each milestone

### Claude's Discretion
- Exact pixel art asset descriptions (sprite dimensions, animation frame counts)
- Typography choices within the jewel tone / modern pixel aesthetic
- Information architecture navigation patterns
- Specific sound effect descriptions and haptic mappings
- Data model normalization and migration strategy details
- Telemetry event naming conventions
- QA test case specifics

</decisions>

<specifics>
## Specific Ideas

- HUD environment should evolve visually as player progresses — not just numbers changing, the world itself transforms
- Titles should feel like real achievements tied to Islamic discipline milestones (e.g., "The Steadfast" at 40 consecutive Fajr)
- Mercy Mode messaging should never feel like a punishment notification — it should feel like a door opening
- The blueprint should be detailed enough that a developer can build any screen without asking clarifying questions (success criteria #1)
- Content pack (BLUE-15) needs actual copy strings: 40 microcopy, 20 quest lines, 20 boss encounters, 20 mercy mode messages, 10 Friday power-ups, 20 notification templates

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- No codebase exists yet — Phase 1 is pure documentation

### Established Patterns
- None — this phase establishes the patterns all subsequent phases will follow

### Integration Points
- Blueprint output feeds directly into Phase 2 (Foundation) through Phase 7 (Backend)
- Screen specs inform component architecture in Phase 2
- Game Design Bible informs game engine in Phase 4
- UI tokens inform design system in Phase 2

</code_context>

<deferred>
## Deferred Ideas

- Voice pack system: changeable app voice personality in settings (wise mentor is default, future options like hype coach or quiet companion)
- Arabic terminology toggle: setting to switch between "Arabic with context", "Arabic only", or "English-first" display modes
- These are settings/personalization features — belong in Phase 6 (Onboarding, Profile, and Notifications) or a future customization phase

</deferred>

---

*Phase: 01-master-blueprint*
*Context gathered: 2026-03-07*
