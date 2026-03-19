# Phase 2: Foundation and Data Layer - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Expo scaffold with development builds, tab-based navigation, SQLite local persistence with migrations, Zustand state management, Privacy Gate module, design token system, and i18n infrastructure. This phase delivers the skeleton that all subsequent phases plug into. No feature logic (habits, XP, quests) — just the foundation.

</domain>

<decisions>
## Implementation Decisions

### SQLite Strategy
- Use **expo-sqlite** (not WatermelonDB) — lighter, direct SQL control, fewer abstractions
- Typed DAO/repository layer: components call `habitRepo.getActive()`, SQL stays in one place
- Game engine and data access both follow "pure TypeScript functions, no React imports" pattern
- Supabase is Phase 7 cloud sync — SQLite is the local source of truth

### Navigation & Tab Structure
- All 4 tabs ship in Phase 2: Home, Habits, Quests, Profile — with placeholder screens for unbuilt features
- Custom pixel-accented tab bar: pixel art icons, jewel-tone active states, pixel border/glow details
- Tab bar sets the "modern mobile UI with pixel art soul" tone from first launch
- Placeholder screens show tab name and phase indicator (not empty/broken-feeling)

### Design Token System
- Full token system in Phase 2: colors (jewel tones), typography, spacing scale, border radius, shadows, elevation
- Phase 5 adds HUD-specific pixel art rendering on top of this token foundation
- **Font comparison spike**: build a test screen comparing real pixel font (Press Start 2P / Silkscreen style) vs clean modern font for headings — user decides after seeing both in-app
- **Dark/light mode spike**: build a comparison showing both modes with jewel-tone palette — user decides after visual review. Token system structured to support either outcome (second color set is same token keys, different values)
- Token system supports dual mode either way — if both modes ship, each component needs visual QA in both

### Privacy Gate
- **Table-level classification**: entire tables are private or syncable (not per-row flags)
- **Code-level guard enforcement**: single SQLite database, Privacy Gate module wraps sync operations and refuses to include private tables
- **Visible in settings**: "Data Privacy" screen shows users what stays on-device vs what syncs — builds trust, aligns with PROF-03
- **Private data**: salah completion logs, worship habit completion timestamps, Muhasabah reflections
- **Syncable data**: XP totals, levels, titles, settings, profile, non-worship habit data

### Claude's Discretion
- Migration approach (manual versioned SQL vs migration library — evaluate tradeoffs)
- Screen transition style (platform defaults vs custom crossfade — match Ferrari x 16-bit feel)
- Modal presentation (bottom sheet vs full-screen push — choose based on action type)
- Token architecture depth (primitives + semantic vs full 3-tier — balance structure vs solo dev speed)

</decisions>

<specifics>
## Specific Ideas

- Tab bar should feel premium and game-like from first launch — this is the user's first impression of the "Ferrari x 16-bit" brand
- Font and dark mode decisions are deferred to visual spikes — build comparison screens so the user can see options in-app before committing
- DAO layer pattern mirrors the game engine philosophy: pure TypeScript, no React imports, fully unit-testable
- Privacy transparency screen reinforces the app's ethical positioning — "we don't just promise privacy, we show you"

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- No codebase exists yet — Phase 2 creates the initial scaffold

### Established Patterns
- None — this phase establishes patterns for all subsequent phases:
  - DAO/repository pattern for data access
  - Zustand domain-split stores for state
  - Design token consumption pattern
  - Privacy classification convention

### Integration Points
- Blueprint docs (.planning/phases/01-master-blueprint/) contain detailed screen specs, data model, and UI token definitions that inform implementation
- Token system feeds into every subsequent phase's UI work
- SQLite schema grows incrementally through migrations in Phases 3-7
- Privacy Gate must be in place before Phase 7 sync engine

</code_context>

<deferred>
## Deferred Ideas

- Voice pack system (changeable app personality) — Phase 6 or future customization phase
- Arabic terminology toggle (Arabic with context / Arabic only / English-first) — Phase 6 settings
- Both carried forward from Phase 1 context

</deferred>

---

*Phase: 02-foundation-and-data-layer*
*Context gathered: 2026-03-07*
