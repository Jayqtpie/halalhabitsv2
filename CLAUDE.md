# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

HalalHabits: Ferrari 16-Bit Edition — a game-first Islamic discipline platform. React Native (Expo) + Supabase, offline-first, with a "modern pixel revival" aesthetic (jewel tones, pixel art characters/icons on modern mobile UI).

**Current state:** Pre-code. Phase 1 (Master Blueprint) is in progress — creating a 16-section design document before any code is written.

## Skill Routing

### UI/UX Skill Rule
- For any app-facing UI/UX task, Claude must read and follow the `ui-ux-pro-max` skill before proposing solutions or making changes.
- This includes screen design, UX flows, layout, spacing, typography, color usage, navigation patterns, accessibility, component structure, design systems, visual polish, microcopy, and frontend implementation details tied to user experience.
- Treat `ui-ux-pro-max` as the default skill for all HalalHabits mobile interface work.

### When to Use It
Use `ui-ux-pro-max` for:
- new screens
- redesigns of existing screens
- onboarding
- habit tracking flows
- game HUD/interface
- settings/account screens
- streaks, XP, levels, rewards, and progression UI
- empty states, error states, success states
- accessibility and readability improvements
- component-library and design-token decisions

### When Not to Use It
Do not use `ui-ux-pro-max` for:
- backend logic
- database design
- auth implementation
- Supabase configuration
- sync engine work
- business logic
- infra/devops
unless the task directly changes the user-facing experience.

### HalalHabits UI Standard
All UI work should align with this product direction:
- modern mobile UI with pixel-art soul
- game-first clarity over visual clutter
- premium, polished, emotionally warm presentation
- reverent, adab-safe interaction patterns
- no manipulative gamification
- no shame-based UX
- strong readability and calm hierarchy on small screens
- components should be reusable, consistent, and mobile-first

## Planning System

This project uses GSD (Get Shit Done) for planning and execution. All planning artifacts live in `.planning/`:

- `PROJECT.md` — Vision, constraints, key decisions
- `REQUIREMENTS.md` — 62 v1 requirements (BLUE-*, FOUN-*, HBIT-*, etc.)
- `ROADMAP.md` — 7 phases from Blueprint through Backend/Sync
- `STATE.md` — Current progress and session continuity
- `phases/XX-name/` — Per-phase context, research, plans, and verification
- `config.json` — GSD workflow settings (YOLO mode, balanced profile)

## Adab Safety Rails (Hard Constraints)

These are non-negotiable across all code, copy, and design:

1. No public worship leaderboards (riya concern)
2. No iman/taqwa scoring — app cannot measure spiritual state
3. No shame copy for missed days — ever
4. No addiction dark patterns (infinite variable reward spam, guilt loops)
5. Privacy-first: all worship data (salah logs, Muhasabah) stays on device only
6. Religious copy must be reverent — Arabic terms with inline context by default
7. Recovery paths always available (Mercy Mode)
8. XP is effort-based ("discipline score"), never spiritual judgment

## Planned Architecture (from Phase 2 onward)

- **Frontend:** React Native (Expo) with Expo Router, development builds (not Expo Go), EAS Build
- **Local DB:** SQLite (expo-sqlite or WatermelonDB — decision pending Phase 2 spike)
- **State:** Zustand with domain-split stores (habits, game, ui, settings)
- **Rendering:** Skia (FilterQuality.None for pixel art) + Reanimated for 60fps animations
- **Backend:** Supabase (Postgres, Auth, Edge Functions, Row-Level Security)
- **Prayer times:** adhan-js library for local calculation
- **Privacy Gate:** Module classifying data as private (device-only) vs syncable
- **Game engine:** Pure TypeScript functions, no React imports, fully unit-testable
- **i18n:** i18next for future RTL/Arabic support

## Design Decisions (from Phase 1 Context)

- Modern pixel revival aesthetic (Celeste/Hyper Light Drifter era) with deep jewel tones
- Home HUD is a game world scene that evolves with player level
- Non-HUD screens use modern mobile UI with pixel art soul
- Wise mentor voice personality ("Your discipline grows stronger")
- 20+ Identity Titles with rarity tiers
- Fast early leveling (level 5-8 in first week), logarithmic curve after
- Streak multiplier resets on miss, but XP total never decreases
- Curated Quranic ayat and hadith at key moments (vetted for accuracy)
