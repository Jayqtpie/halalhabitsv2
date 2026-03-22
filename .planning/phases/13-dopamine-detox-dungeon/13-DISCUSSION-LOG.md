# Phase 13: Dopamine Detox Dungeon - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-22
**Phase:** 13-dopamine-detox-dungeon
**Areas discussed:** Dungeon Entry & Navigation, Active Session Experience, Early Exit & Penalties, Completion & Streak Protection

---

## Dungeon Entry & Navigation

### Entry Point

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated tab/screen | A 'Dungeon' tab or screen accessible from the main navigation | |
| Card on Quest Board | Appears as a special quest card alongside daily/weekly quests | |
| HUD button | A dungeon door icon on the HUD that opens a modal/sheet | ✓ |

**User's choice:** HUD button
**Notes:** Quick access from the HUD without adding a full navigation tab.

### Duration Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Preset buttons | 3-4 preset chips (2hr, 4hr, 6hr, 8hr) — quick tap, no fiddling | ✓ |
| Slider | Drag a slider from 2-8 hours | |
| Scrollable wheel | iOS-style picker wheel | |

**User's choice:** Preset buttons
**Notes:** None

### Daily vs Deep Variant Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Same screen, toggle | Daily/Deep toggle at top of dungeon sheet | ✓ |
| Separate entry points | Two distinct dungeon doors or cards | |
| Auto-detect by duration | 6-8hr automatically counts as weekly deep | |

**User's choice:** Same screen, toggle
**Notes:** None

### HUD Icon Style

| Option | Description | Selected |
|--------|-------------|----------|
| Pixel dungeon door | Small pixel art dungeon gate that glows when tappable | ✓ |
| Shield icon | Shield with timer symbol | |
| You decide | Claude picks based on HUD aesthetic | |

**User's choice:** Pixel dungeon door
**Notes:** None

---

## Active Session Experience

### Active Session Display

| Option | Description | Selected |
|--------|-------------|----------|
| HUD dungeon state | HUD transforms subtly with countdown timer near dungeon door | |
| Persistent overlay banner | Sticky banner showing countdown on every screen | |
| Dungeon sheet only | Timer only visible when opening the dungeon sheet | |

**User's choice:** HUD dungeon state
**Notes:** Initially presented as subtle transformation, but user chose full dungeon theme in the follow-up question.

### Background Resume Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Silent resume | Timer recalculates, no fanfare | |
| Welcome back moment | Brief 'Still in the dungeon' toast on return | ✓ |
| You decide | Claude picks | |

**User's choice:** Welcome back moment
**Notes:** None

### Completion Push Notification

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, notify | Celebratory push notification on completion | ✓ |
| No notification | Player discovers on next app open | |
| You decide | Claude decides | |

**User's choice:** Yes, notify
**Notes:** None

### HUD Visual Change During Session

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle dungeon overlay | Slight visual shift — torch glow, vignette | |
| Full dungeon theme | HUD transforms into dungeon scene — stone walls, torches, new palette | ✓ |
| No visual change | Only icon and timer indicate active session | |
| You decide | Claude picks | |

**User's choice:** Full dungeon theme
**Notes:** Bold choice — the entire HUD game world transforms during an active session.

---

## Early Exit & Penalties

### Exit Confirmation Tone

| Option | Description | Selected |
|--------|-------------|----------|
| Compassionate | Mentor voice acknowledging effort, showing XP loss | ✓ |
| Neutral game-like | Straightforward game UI with penalty amount | |
| Encouraging challenge | Nudges to stay without guilt-tripping | |

**User's choice:** Compassionate
**Notes:** Consistent with app's no-shame, mentor-voice philosophy.

### XP Penalty Model

| Option | Description | Selected |
|--------|-------------|----------|
| Proportional to time left | Lose percentage of reward based on remaining time | ✓ |
| Flat penalty | Fixed XP deduction regardless of exit timing | |
| No XP earned, no penalty | Forfeit session, earn 0 XP, no negative | |
| You decide | Claude picks | |

**User's choice:** Proportional to time left
**Notes:** Exit at 50% = lose 50% of potential XP.

### Re-entry After Early Exit

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, one retry per day | One more attempt, penalty from first still applies | ✓ |
| No re-entry | Locked until next period | |
| Unlimited re-entry | Keep trying until completion | |

**User's choice:** Yes, one retry per day
**Notes:** None

---

## Completion & Streak Protection

### Completion Celebration

| Option | Description | Selected |
|--------|-------------|----------|
| Dungeon-cleared fanfare | Full 'Dungeon Cleared!' screen with XP animation, dungeon crumbling, mentor praise | ✓ |
| Subtle XP toast | Toast notification, quiet return to normal | |
| You decide | Claude picks | |

**User's choice:** Dungeon-cleared fanfare
**Notes:** Should feel like beating a level in a game.

### Streak Protection Communication

| Option | Description | Selected |
|--------|-------------|----------|
| Visible shield indicator | Shield/dungeon icon on habit cards during active session | ✓ |
| Silent protection | Protected behind the scenes, no visual | |
| Pre-session warning | Show protected habits before starting, no ongoing indicator | |

**User's choice:** Visible shield indicator
**Notes:** None

### Streak Protection Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Only overlapping habits | Only habits whose window falls during detox session | ✓ |
| All habits for the day | Starting any detox protects all habits for entire day | |
| You decide | Claude picks | |

**User's choice:** Only overlapping habits
**Notes:** Prevents gaming — a 2hr morning detox doesn't protect evening habits.

### Identity Title for Detox

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, a detox-specific title | Title like 'Dungeon Master' or 'The Unplugged' progressing with completions | ✓ |
| No dedicated title | Detox just awards XP, no title track | |
| You decide | Claude decides | |

**User's choice:** Yes, a detox-specific title
**Notes:** None

---

## Claude's Discretion

- Exact dungeon theme pixel art design and color palette
- Timer UI layout within the dungeon sheet
- Welcome-back toast animation and duration
- Push notification scheduling implementation
- Detox title name, rarity tier, and progression thresholds
- XP penalty rounding behavior
- Dungeon-cleared fanfare animation specifics
- Shield indicator visual design on habit cards

## Deferred Ideas

None — discussion stayed within phase scope
