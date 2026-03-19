# Phase 1: Master Blueprint - Research

**Researched:** 2026-03-07
**Domain:** Game design documentation, product specification, XP economy modeling, Islamic UX principles
**Confidence:** HIGH

## Summary

Phase 1 is a documentation-only phase producing 16 interconnected markdown files in a `/blueprint` directory. No code is written. The challenge is not technical stack selection but rather producing implementation-ready specs that eliminate developer ambiguity across game design, UX flows, screen specs, data modeling, and content authoring.

The key insight from game design document best practices is that modern GDDs should be structured as linked, navigable documents (not monolithic PDFs) with clear hierarchies. Since this project uses markdown files with cross-references, that aligns perfectly. The critical success factor is specificity: every screen needs ASCII mockups, every interaction needs state descriptions, every copy string needs actual text, and the XP economy needs a simulation table proving the progression curve works.

**Primary recommendation:** Structure work as three waves -- (1) foundation sections that define systems other sections reference (vision, game design bible, worldbuilding, feature specs), (2) specification sections that apply those systems to concrete screens and data (UX flows, screen specs, UI tokens, data model, tech architecture), (3) operational sections that validate and package everything (telemetry, QA, content pack, delivery roadmap, handoff).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Modern pixel revival aesthetic (Celeste/Hyper Light Drifter era) -- pixel art with modern lighting, particles, and effects
- Deep jewel tone color palette: emerald, sapphire, ruby, gold on dark backgrounds -- premium feel with Islamic geometric art influence
- Home HUD is a game world scene (pixel art environment like mosque courtyard or study room) that evolves as player levels up -- progress IS the world
- All screens outside HUD use modern mobile UI with pixel art soul -- pixel characters, icons, and animations give retro personality without sacrificing usability
- HUD = full pixel immersion; habits list, settings, profile = modern UI with pixel accents
- Fast early wins: player should hit level 5-8 in first week with consistent habits, then curve flattens logarithmically
- 20+ Identity Titles at launch with rarity tiers (common, rare, legendary)
- Varied challenge board: mix of daily (easy), weekly (medium), and stretch quests (hard) with rotating variety
- Streak multiplier resets only on miss -- XP total never goes down, but consecutive-day bonus multiplier resets to 1x
- No XP loss for missed days -- mercy-forward philosophy baked into the economy
- Default voice: wise mentor -- calm, encouraging, slightly formal ("Your discipline grows stronger")
- Arabic terms with inline context: "Complete your Dhikr (remembrance) session"
- Mercy Mode uses blended tone: brief Islamic wisdom + game recovery action
- Curated Quranic ayat and hadith references at key moments -- vetted for accuracy
- All copy must pass adab safety rails: no shame, no spiritual judgment, no guilt language
- 16 separate markdown files in a /blueprint directory (section-per-file), cross-referenced with links
- Full wireframe-level screen specs with ASCII mockups
- Full copy deck: actual text strings for all UI
- XP formula defined with simulation table: level 1-100 showing XP required, estimated days to reach, and unlocks at each milestone

### Claude's Discretion
- Exact pixel art asset descriptions (sprite dimensions, animation frame counts)
- Typography choices within the jewel tone / modern pixel aesthetic
- Information architecture navigation patterns
- Specific sound effect descriptions and haptic mappings
- Data model normalization and migration strategy details
- Telemetry event naming conventions
- QA test case specifics

### Deferred Ideas (OUT OF SCOPE)
- Voice pack system: changeable app voice personality in settings (wise mentor is default, future options like hype coach or quiet companion)
- Arabic terminology toggle: setting to switch between "Arabic with context", "Arabic only", or "English-first" display modes
- These belong in Phase 6 or a future customization phase
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BLUE-01 | Executive product vision with market gap analysis and differentiation narrative | Wave 1 foundation -- sets context for all other sections; market gap analysis draws from PROJECT.md audience and ethics constraints |
| BLUE-02 | Player fantasy and behavioral model (first 60 seconds, daily return, identity transformation, behavioral science) | Wave 1 foundation -- behavioral hooks inform game loops and UX flows; use Nir Eyal's Hook Model adapted for ethical Islamic context |
| BLUE-03 | Game Design Bible (core/meta/long loops, progression, XP model, streak model, boss progression, failure/recovery, anti-burnout) | Wave 1 foundation -- XP formula and simulation table live here; logarithmic curve research informs level 1-100 design |
| BLUE-04 | Worldbuilding and lore framework (discipline metaphor, environments, enemy/boss archetypes, titles, seasonal events) | Wave 1 foundation -- title definitions and environment descriptions feed into screen specs and content pack |
| BLUE-05 | Feature systems detailed specs (Habit Forge, Quest Board, Salah Streak Shield, Nafs Boss Arena, Dopamine Detox Dungeon, Mercy Mode, Identity Titles, Friday Power-Ups, Muhasabah, Accountability Duos, Barakah economy) | Wave 1 foundation -- spec each feature's rules, states, and edge cases; note v2-deferred features (Boss Arena, Detox Dungeon, Friday Power-Ups, Duos, Barakah) still need specs for economy coherence |
| BLUE-06 | Information architecture and full UX flow (onboarding-to-day-30 journey, nav model, key paths, drop-off risks, edge states) | Wave 2 specification -- depends on feature systems (BLUE-05) and behavioral model (BLUE-02) |
| BLUE-07 | Screen-by-screen product spec (12+ screens with purpose, layout, components, interactions, animations, copy tone, edge states) | Wave 2 specification -- depends on UX flow (BLUE-06) and UI tokens (BLUE-08); ASCII mockups required |
| BLUE-08 | UI system and design tokens (colors, typography, spacing, radius, HUD components, cards/buttons/inputs, iconography, motion, accessibility modes) | Wave 2 specification -- jewel tone palette and pixel art aesthetic locked; define exact hex values, type scale, spacing units |
| BLUE-09 | Sound and haptic direction (sound identity, event map, haptic rules, audio boundaries, focus mode) | Wave 2 specification -- Claude's discretion area; map sound events to game actions |
| BLUE-10 | Greenfield tech architecture (frontend, backend, data, auth, sync, analytics, notifications, offline, config) | Wave 2 specification -- stack already decided (Expo, Supabase, Zustand, SQLite, Skia); document architecture decisions |
| BLUE-11 | Data model and API contract (entities, relationships, versioning, migration, privacy boundaries, endpoints, schemas) | Wave 2 specification -- privacy classification (private vs syncable) is critical; entity-relationship design for habits, completions, streaks, XP, titles, quests, muhasabah |
| BLUE-12 | Telemetry and experimentation plan (privacy-safe events, north-star metric, retention metrics, burnout indicators, A/B tests, anti-metric traps) | Wave 3 operational -- Claude's discretion on event naming; must respect privacy constraints |
| BLUE-13 | QA and balance plan (test strategy, XP/streak simulation, timezone edge cases, exploit testing, accessibility QA, content sensitivity checklist) | Wave 3 operational -- validates XP economy from BLUE-03; timezone and streak edge cases are critical |
| BLUE-14 | Delivery roadmap (Phase 0-4 with deliverables, dependencies, risks, staffing, definition of done) | Wave 3 operational -- maps to existing 7-phase roadmap; adds granular deliverables |
| BLUE-15 | Content pack (40 microcopy, 20 quest lines, 20 boss encounters, 20 mercy mode, 10 Friday power-ups, 20 notification templates) | Wave 3 operational -- actual copy strings; must pass adab safety rails |
| BLUE-16 | Final build handoff (founder brief, task tree, 14-day checklist, 30-day emergency cut plan, top 10 failure risks) | Wave 3 operational -- synthesis of all prior sections into actionable build plan |
</phase_requirements>

## Standard Stack

This phase produces documentation, not code. The "stack" is the tooling and format for creating the blueprint.

### Core
| Tool | Purpose | Why Standard |
|------|---------|--------------|
| Markdown files | Document format | Cross-referenced, version-controlled, readable by AI and humans |
| ASCII art mockups | Screen wireframes | Text-based, no external tools needed, embeddable in markdown |
| Markdown tables | XP simulation, data models, token definitions | Structured data within docs |
| Mermaid diagrams (optional) | UX flows, entity relationships | Renders in GitHub, VS Code |

### Blueprint File Structure
```
blueprint/
├── 01-executive-vision.md
├── 02-player-fantasy.md
├── 03-game-design-bible.md
├── 04-worldbuilding.md
├── 05-feature-systems.md
├── 06-information-architecture.md
├── 07-screen-specs.md
├── 08-ui-design-tokens.md
├── 09-sound-haptics.md
├── 10-tech-architecture.md
├── 11-data-model.md
├── 12-telemetry.md
├── 13-qa-balance.md
├── 14-delivery-roadmap.md
├── 15-content-pack.md
└── 16-build-handoff.md
```

## Architecture Patterns

### Pattern 1: Dependency-Ordered Authoring (Wave Structure)

**What:** Write blueprint sections in dependency order so later sections can reference earlier ones.
**When to use:** Always -- sections reference each other heavily.

**Wave 1 -- Foundation (BLUE-01 through BLUE-05):**
These sections define the systems, rules, and vocabulary that all other sections reference. The Game Design Bible (BLUE-03) is the most critical -- it establishes the XP formula, streak mechanics, and progression curve that screen specs, data models, and QA plans all depend on.

**Wave 2 -- Specification (BLUE-06 through BLUE-11):**
These sections apply foundation systems to concrete deliverables: screens, tokens, data schemas, and architecture. They depend on Wave 1 being stable. Screen specs (BLUE-07) is the most labor-intensive -- 12+ screens with full ASCII mockups, component lists, copy examples, and edge states.

**Wave 3 -- Operational (BLUE-12 through BLUE-16):**
These sections validate, package, and prepare for handoff. They reference everything from Waves 1 and 2. The content pack (BLUE-15) requires writing 130+ individual copy strings.

### Pattern 2: Screen Spec Template

**What:** Consistent format for every screen specification.
**When to use:** BLUE-07 (screen-by-screen specs).

```markdown
## [Screen Name]

### Purpose
[One sentence: what this screen does for the user]

### Entry Points
- [How user gets here]

### Layout
[ASCII mockup]

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| [name] | [button/card/list/etc] | [what it does] |

### Interactions
- [Tap X]: [result]
- [Swipe Y]: [result]
- [Long press Z]: [result]

### Animations
- [trigger]: [animation description, duration, easing]

### Copy Examples
- [element]: "[exact text string]"

### Edge States
| State | Display | Copy |
|-------|---------|------|
| Empty (no habits) | [what shows] | "[text]" |
| Loading | [what shows] | -- |
| Error | [what shows] | "[text]" |
| Offline | [what shows] | "[text]" |
```

### Pattern 3: XP Economy Simulation Table

**What:** A table proving the progression curve works with real numbers.
**When to use:** BLUE-03 (Game Design Bible).

The XP formula should use an exponential curve for XP-to-next-level (not logarithmic -- the user wants fast early levels then flattening, which means XP required per level increases exponentially). Common formula:

```
XP_required(level) = base_xp * (level ^ exponent)
```

Where `base_xp` and `exponent` are tuned so:
- Level 1-5: achievable in days 1-3 (1-2 habits/day)
- Level 5-8: achievable by end of week 1 (3-5 habits/day)
- Level 20: ~1 month of consistent use
- Level 50: ~6 months
- Level 100: aspirational (1+ year of daily discipline)

The simulation table should include:

| Level | XP Required | Cumulative XP | Est. Days | Unlock |
|-------|-------------|---------------|-----------|--------|
| 1 | 0 | 0 | 0 | Tutorial complete |
| 2 | 50 | 50 | 1 | -- |
| 5 | 200 | 600 | 3 | Title: "The Beginner" |
| 8 | 500 | 2100 | 7 | New quest tier |
| ... | ... | ... | ... | ... |

Key variables to define:
- Base XP per habit completion (e.g., 10-25 XP depending on habit difficulty)
- Streak multiplier formula (e.g., 1.0x base, +0.1x per consecutive day, capped at 3.0x)
- Quest bonus XP ranges (daily: 20-50, weekly: 100-200, stretch: 300-500)
- XP formula exponent (tuned to match time-to-level targets)

### Pattern 4: Data Entity with Privacy Classification

**What:** Every data entity tagged as PRIVATE (device-only) or SYNCABLE.
**When to use:** BLUE-11 (data model).

```markdown
### Entity: HabitCompletion
**Privacy:** PRIVATE (worship data -- never leaves device)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| habit_id | UUID | FK -> Habit |
| completed_at | DATETIME | When completed |
| xp_earned | INT | XP awarded |

**Relationships:**
- belongs_to: Habit (many-to-one)
- triggers: XPLedger entry (one-to-one)
```

### Anti-Patterns to Avoid

- **Vague screen specs:** "Shows habits" instead of exact layout, component list, and edge states -- makes developers guess
- **Placeholder copy:** "TODO: write copy" defeats the purpose of a blueprint; every string must be final-draft quality
- **XP economy without simulation:** Defining a formula without running it through 100 levels with realistic daily play patterns leads to broken progression
- **Mixing v1 and v2 features in specs:** Boss Arena, Dopamine Detox Dungeon, Friday Power-Ups, and Accountability Duos are v2 -- spec them for economy coherence but clearly mark as deferred
- **Inconsistent cross-references:** Section 7 references a feature defined in section 5 by a different name -- use a consistent glossary

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XP simulation | Mental math or gut feel | Markdown table with formula-derived values for all 100 levels | Economy breaks are invisible without simulation; players hit walls or blast through content |
| Screen specs without mockups | Prose-only descriptions | ASCII art wireframes inline | Text descriptions are ambiguous; a 10-line ASCII mockup eliminates 90% of layout questions |
| Color palette definition | "Use emerald green" | Exact hex values with semantic names (#0D7C3D = emerald-500, #1B4332 = emerald-900) | "Emerald" means different things to different people |
| Copy consistency | Ad-hoc writing per section | Adab Copy Guide (do/don't examples) written first, then applied | Without a guide, tone drifts between sections |
| Feature edge states | "Handle errors gracefully" | Explicit table: state -> display -> copy for every screen | Edge states are where apps feel broken; must be specified |

## Common Pitfalls

### Pitfall 1: Blueprint Scope Creep
**What goes wrong:** Each section expands to cover edge cases and future features, turning a blueprint into a 500-page novel nobody reads.
**Why it happens:** Completionism instinct -- wanting to solve every problem upfront.
**How to avoid:** Each section has a clear word budget and scope. V2 features get a one-paragraph summary, not full specs. Screen specs cover the 12-15 core screens, not every modal and toast.
**Warning signs:** A single section exceeding 3000 words; specs for features marked as "deferred."

### Pitfall 2: XP Economy That Doesn't Add Up
**What goes wrong:** The formula looks elegant but produces absurd time-to-level values (level 10 in 2 hours, or level 15 takes 6 months).
**Why it happens:** Not running actual numbers with realistic daily play scenarios.
**How to avoid:** Define 3 player archetypes (casual: 2 habits/day, consistent: 5 habits/day, power: 8+ habits/day) and simulate each through 30/90/365 days. Verify the curve matches design intent.
**Warning signs:** No simulation table; formula chosen for mathematical elegance not gameplay feel.

### Pitfall 3: Adab Violations in Copy
**What goes wrong:** Copy that subtly shames ("You missed Fajr again"), implies spiritual measurement ("Your iman score is low"), or trivializes worship ("Smash that prayer button!").
**Why it happens:** Game copy conventions (urgency, competition, FOMO) conflict with Islamic adab principles.
**How to avoid:** Write the Adab Copy Guide (do/don't pairs) BEFORE any other copy. Every copy string gets checked against the guide. Include specific forbidden patterns: no "you missed," no "you failed," no spiritual scoring language.
**Warning signs:** Copy that would feel wrong if read aloud in a masjid.

### Pitfall 4: Screen Specs Without Edge States
**What goes wrong:** Developer builds the happy path, ships, and users see blank screens, broken layouts, or confusing messages in error/empty/offline states.
**Why it happens:** Edge states are boring to spec but critical for quality.
**How to avoid:** Every screen spec MUST include: empty state, loading state, error state, offline state, and any domain-specific states (e.g., streak broken, first-time use).
**Warning signs:** Screen specs that only describe the "data present, online, no errors" view.

### Pitfall 5: Data Model Without Privacy Annotations
**What goes wrong:** During Phase 7 (sync), developers don't know which tables sync to Supabase and which stay local, causing either privacy violations or missing sync.
**Why it happens:** Privacy classification seems like an implementation detail, not a design decision.
**How to avoid:** Every entity in the data model gets a PRIVATE or SYNCABLE tag with justification. The Privacy Gate module in Phase 2 is built from this classification.
**Warning signs:** Data model with no privacy column; entities where classification is ambiguous.

### Pitfall 6: Content Pack Volume Underestimation
**What goes wrong:** BLUE-15 requires 130+ individual copy strings (40 microcopy + 20 quest lines + 20 boss encounters + 20 mercy mode + 10 Friday power-ups + 20 notifications). This is a significant creative writing effort.
**Why it happens:** "Write 20 quest lines" sounds easy until you're writing #14 and they all sound the same.
**How to avoid:** Use templates/formulas for each copy category. Quest lines follow: [verb] + [quantity] + [habit type] + [time frame] + [reward teaser]. Batch-write by category, not one at a time.
**Warning signs:** Copy strings that feel repetitive or formulaic without variety.

## Code Examples

Not applicable -- this phase produces documentation, not code. See Architecture Patterns above for document templates and formats.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Monolithic 100-page GDD | Linked markdown files, section-per-file | ~2020 onward | Navigable, maintainable, version-controlled |
| Figma-only wireframes | ASCII/text wireframes for specs, Figma for polish | Growing trend in AI-assisted dev | Faster iteration, embeddable in docs, no tool dependency |
| "Design as you build" | Blueprint-first with simulation tables | Established game design practice | Prevents mid-build redesigns, especially for economy systems |
| Generic habit app copy | Culturally-grounded, adab-compliant copy with do/don't guides | Emerging in Islamic tech space | Prevents offensive or insensitive content that alienates core audience |

## Open Questions

1. **V2 Feature Depth in Blueprint**
   - What we know: Boss Arena, Dopamine Detox Dungeon, Friday Power-Ups, Accountability Duos, and Barakah Shop are v2-deferred
   - What's unclear: How much detail to include for v2 features in the blueprint -- enough for economy coherence vs full specs
   - Recommendation: Include one-paragraph summaries with economy impact (XP values, unlock conditions) but NOT full screen specs or copy decks. Mark clearly as "v2 -- spec for economy modeling only."

2. **Pixel Art Asset Specificity**
   - What we know: Claude's discretion on sprite dimensions and animation frame counts
   - What's unclear: How detailed asset descriptions need to be for a solo dev who will likely use AI-generated or purchased pixel art
   - Recommendation: Define art direction (style references, color constraints, resolution targets) and list required assets by screen, but don't over-specify frame counts. A "pixel art asset manifest" with descriptions is more useful than technical sprite sheet specs.

3. **Quranic/Hadith Content Vetting**
   - What we know: Curated ayat and hadith at key moments, vetted for accuracy
   - What's unclear: Who vets? Solo dev may not have scholarly authority
   - Recommendation: Use only well-known, widely-cited ayat and sahih hadith. Include source references (surah:ayah, hadith collection + number). Note in blueprint that all religious content should be reviewed by a knowledgeable person before release.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual review (documentation phase -- no automated tests) |
| Config file | none |
| Quick run command | `grep -r "TODO\|TBD\|PLACEHOLDER" blueprint/` (find incomplete sections) |
| Full suite command | Manual checklist review against success criteria |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BLUE-01 | Executive vision document exists with market gap analysis | manual-only | `test -f blueprint/01-executive-vision.md` | Wave 0 |
| BLUE-02 | Player fantasy document with behavioral model | manual-only | `test -f blueprint/02-player-fantasy.md` | Wave 0 |
| BLUE-03 | Game Design Bible with XP simulation table (100 levels) | manual-only | `grep -c "Level.*XP.*Days" blueprint/03-game-design-bible.md` | Wave 0 |
| BLUE-04 | Worldbuilding with 20+ titles defined | manual-only | `grep -c "Title:" blueprint/04-worldbuilding.md` | Wave 0 |
| BLUE-05 | Feature systems with all v1 features specced | manual-only | `test -f blueprint/05-feature-systems.md` | Wave 0 |
| BLUE-06 | Information architecture with nav model and UX flows | manual-only | `test -f blueprint/06-information-architecture.md` | Wave 0 |
| BLUE-07 | Screen specs for 12+ screens with ASCII mockups | manual-only | `grep -c "ASCII\|mockup\|┌\|┐\|└\|┘\|│\|─" blueprint/07-screen-specs.md` | Wave 0 |
| BLUE-08 | UI tokens with hex color values and type scale | manual-only | `grep -c "#[0-9A-Fa-f]" blueprint/08-ui-design-tokens.md` | Wave 0 |
| BLUE-09 | Sound and haptic direction | manual-only | `test -f blueprint/09-sound-haptics.md` | Wave 0 |
| BLUE-10 | Tech architecture document | manual-only | `test -f blueprint/10-tech-architecture.md` | Wave 0 |
| BLUE-11 | Data model with privacy classifications | manual-only | `grep -c "PRIVATE\|SYNCABLE" blueprint/11-data-model.md` | Wave 0 |
| BLUE-12 | Telemetry plan with privacy-safe events | manual-only | `test -f blueprint/12-telemetry.md` | Wave 0 |
| BLUE-13 | QA plan with XP simulation validation | manual-only | `test -f blueprint/13-qa-balance.md` | Wave 0 |
| BLUE-14 | Delivery roadmap with phases and dependencies | manual-only | `test -f blueprint/14-delivery-roadmap.md` | Wave 0 |
| BLUE-15 | Content pack with 130+ copy strings | manual-only | Count copy strings in blueprint/15-content-pack.md | Wave 0 |
| BLUE-16 | Build handoff with task tree and risk list | manual-only | `test -f blueprint/16-build-handoff.md` | Wave 0 |

### Sampling Rate
- **Per task commit:** Verify file exists and section headers match template
- **Per wave merge:** Cross-reference check (do screen specs reference features defined in BLUE-05?)
- **Phase gate:** Full success criteria checklist before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `blueprint/` directory -- needs creation
- [ ] All 16 markdown files -- none exist yet
- [ ] Adab Copy Guide -- should be created early as a reference for all copy-writing tasks
- [ ] XP formula constants -- need to be derived from time-to-level targets before BLUE-03

## Sources

### Primary (HIGH confidence)
- [PROJECT.md, REQUIREMENTS.md, CONTEXT.md] -- Project-specific decisions and constraints (authoritative)
- [GameDesign Math: RPG Level-based Progression](https://www.davideaversa.it/blog/gamedesign-math-rpg-level-based-progression/) -- XP curve formulas and logarithmic/exponential analysis
- [Quantitative Design: How to Define XP Thresholds](https://www.gamedeveloper.com/design/quantitative-design---how-to-define-xp-thresholds-) -- Professional game economy balancing methodology
- [My Approach to Economy Balancing Using Spreadsheets](https://www.gamedeveloper.com/design/my-approach-to-economy-balancing-using-spreadsheets) -- Simulation table methodology

### Secondary (MEDIUM confidence)
- [Game Design Document: Steps & Best Practices for 2025](https://document360.com/blog/write-game-design-document/) -- GDD structure best practices
- [Complete GDD Guide: Structure, Templates, and Real Examples](https://whimsygames.co/blog/game-design-instructions-examples/) -- Section organization patterns
- [Islamic App Development Guidelines](https://riseuplabs.com/islamic-app-development-guidelines/) -- Religious content sensitivity
- [Islamic Lifestyle Applications: Meeting Spiritual Needs](https://www.tandfonline.com/doi/full/10.1080/10447318.2025.2595545) -- Academic research on Islamic app design principles
- [Mockdown: ASCII Wireframe Editor](https://www.mockdown.design/about) -- Text-based wireframe methodology

### Tertiary (LOW confidence)
- [Daily Muslim App UX Case Study](https://www.themeaningofislam.org/blog/daily-muslim-habits-app-a-ux-case-study) -- Single case study, useful for reference but not authoritative

## Metadata

**Confidence breakdown:**
- Document structure: HIGH -- well-established GDD and product spec patterns; user locked specific format decisions
- XP economy modeling: HIGH -- mathematical formulas well-documented; simulation table approach is standard practice
- Adab/Islamic UX: MEDIUM -- principles are clear from user constraints; specific copy quality depends on execution
- Screen spec completeness: HIGH -- template pattern is well-defined; the challenge is volume not methodology

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (documentation patterns are stable; no fast-moving dependencies)
