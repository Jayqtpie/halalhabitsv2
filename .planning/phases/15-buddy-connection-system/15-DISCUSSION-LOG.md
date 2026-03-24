# Phase 15: Buddy Connection System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 15-buddy-connection-system
**Areas discussed:** Connection flow, Buddy list & status, Buddy profile view, Discoverability & privacy

---

## Connection Flow

### Invite Sharing

| Option | Description | Selected |
|--------|-------------|----------|
| Share sheet | Tap 'Invite' generates code, opens native share sheet (WhatsApp, iMessage, copy). Code is short alphanumeric like 'HH-A7K3'. | ✓ |
| QR code + manual | Shows QR code on screen plus copyable text code as fallback | |
| Deep link | Generates halalhabits://invite/CODE URL that opens app directly | |

**User's choice:** Share sheet
**Notes:** None

### Code Entry Location

| Option | Description | Selected |
|--------|-------------|----------|
| Buddy list screen | Prominent 'Enter Code' button on the buddy list screen — tap, type/paste, confirm | ✓ |
| Dedicated add-buddy screen | Separate screen with 'Enter Code' and 'Search by Username' as tabs | |
| You decide | Claude picks best UX pattern | |

**User's choice:** Buddy list screen
**Notes:** None

### Request Notification

| Option | Description | Selected |
|--------|-------------|----------|
| Badge + push | Badge on buddy tab icon + push notification. Request visible in pending section. | |
| In-app only | Badge on buddy tab icon, pending section on buddy list. No push notification. | ✓ |
| You decide | Claude picks based on existing notification patterns | |

**User's choice:** In-app only
**Notes:** None

### Block Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Silent removal | Blocked user disappears from both lists. Blocked person sees buddy as 'removed'. Can't re-request. | ✓ |
| Visible block | Blocked user removed, sees 'This user is unavailable' on search/re-invite. | |
| You decide | Claude picks based on adab safety principles | |

**User's choice:** Silent removal
**Notes:** None

---

## Buddy List & Status

### List Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Simple list | Vertical list of buddy cards — avatar/initial, username, online dot, streak count. Pending section at top. | ✓ |
| Grid of avatars | 2-3 column grid with avatars/initials and names below. More visual, less info density. | |
| You decide | Claude picks based on app patterns | |

**User's choice:** Simple list
**Notes:** None

### Online Status

| Option | Description | Selected |
|--------|-------------|----------|
| Last active time | Green dot = active in last 15 min, gray dot = offline. Shows 'Active 2h ago'. Via Supabase presence/heartbeat. | ✓ |
| Simple online/offline | Green or gray dot only, no timestamp. Simpler to implement. | |
| Active today badge | Badge if buddy has logged any habit today. Privacy-friendly, doesn't track app usage. | |

**User's choice:** Last active time
**Notes:** None

### Empty State

| Option | Description | Selected |
|--------|-------------|----------|
| Illustration + CTA | Pixel-art illustration of two characters, warm mentor copy, plus 'Invite a Buddy' and 'Enter Code' buttons | ✓ |
| Minimal CTA | Just buttons with one-line prompt. No illustration. | |
| You decide | Claude picks based on existing empty state patterns | |

**User's choice:** Illustration + CTA
**Notes:** None

---

## Buddy Profile View

### Profile Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Tap buddy in list | Opens profile as detail screen (push navigation). Shows XP, streak, title, level. | ✓ |
| Bottom sheet | Half-sheet overlay for quick glance without leaving list. | |
| You decide | Claude picks best navigation pattern | |

**User's choice:** Tap buddy in list (push navigation)
**Notes:** None

### Profile Data Shown

| Option | Description | Selected |
|--------|-------------|----------|
| XP + streak + title + level | XP total, streak count, identity title, level. Feels like viewing friend's RPG character. | ✓ |
| Minimal: XP + streak only | Strictly what BUDY-06 says. Nothing else. | |
| You decide | Claude picks within adab/privacy constraints | |

**User's choice:** XP + streak + title + level
**Notes:** None

### Profile Actions

| Option | Description | Selected |
|--------|-------------|----------|
| Remove + block actions | Three-dot menu or bottom actions: 'Remove Buddy' and 'Block'. Simple for Phase 15. | ✓ |
| Just viewing | No actions on profile — remove/block only from list via swipe/long-press. | |
| You decide | Claude picks based on UX best practices | |

**User's choice:** Remove + block actions
**Notes:** None

---

## Discoverability & Privacy

### Opt-in Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Settings toggle, off by default | Toggle in Settings: 'Allow others to find me by username'. Off by default. | |
| Onboarding choice | Ask during buddy onboarding first-time screen. Changeable in settings later. | ✓ |
| On by default | Discoverable by default with option to turn off. | |

**User's choice:** Onboarding choice (first-time buddy screen)
**Notes:** None

### Search UX

| Option | Description | Selected |
|--------|-------------|----------|
| Inline search bar | Search bar at top of buddy list. Debounced Supabase query. Only discoverable users. | ✓ |
| Separate search screen | Dedicated 'Find Buddies' screen from buddy list. | |
| You decide | Claude picks cleanest UX pattern | |

**User's choice:** Inline search bar
**Notes:** None

### Rate Limiting

| Option | Description | Selected |
|--------|-------------|----------|
| Soft limit | Max 10 pending outbound requests at a time. No time cooldown. | ✓ |
| No limit | No limits, trust users. Simpler implementation. | |
| You decide | Claude picks sensible limit | |

**User's choice:** Soft limit (10 pending max)
**Notes:** None

---

## Claude's Discretion

- Navigation structure for buddy screens within Expo Router
- Heartbeat/presence implementation approach
- Buddy card component styling
- Confirmation dialogs for remove/block

## Deferred Ideas

None — discussion stayed within phase scope
