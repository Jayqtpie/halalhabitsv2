# Phase 16: Shared Activities & Duo Quests - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 16-shared-activities-duo-quests
**Areas discussed:** Shared habit proposal flow, Duo quest catalog & creation, Inactivity & timeout handling, Progress display & privacy

---

## Shared Habit Proposal Flow

### Q1: How should a player propose a shared habit to a buddy?

| Option | Description | Selected |
|--------|-------------|----------|
| From buddy profile | Tap buddy -> profile -> 'Propose Shared Habit'. Contextual entry point. | ✓ |
| From habit list | Long-press on existing habit -> 'Share with buddy' -> pick buddy. | |
| Both entry points | Available from both surfaces. More discoverable but two flows. | |

**User's choice:** From buddy profile
**Notes:** Consistent with where duo quests will also be started.

### Q2: Which habit types can be shared with a buddy?

| Option | Description | Selected |
|--------|-------------|----------|
| Custom habits only | Only Habit Forge custom habits. Salah/worship stay private. | |
| Any non-worship habit | Custom + character habits. Excludes salah and Muhasabah. | ✓ |
| Any habit type | All habits including salah. Conflicts with Privacy Gate. | |

**User's choice:** Any non-worship habit
**Notes:** Broader than custom-only but still respects Privacy Gate. Character habits (focus, kindness) are eligible.

### Q3: When a buddy receives a shared habit proposal, how do they respond?

| Option | Description | Selected |
|--------|-------------|----------|
| In-app notification + accept/decline | Badge on buddy tab, pending section. Consistent with Phase 15. | ✓ |
| Auto-accept | Immediately active for both. Buddy has no say. | |
| Accept with customization | Buddy can rename or adjust frequency. More UI complexity. | |

**User's choice:** In-app notification + accept/decline
**Notes:** Follows existing buddy request pattern.

### Q4: Can a player end a shared habit unilaterally?

| Option | Description | Selected |
|--------|-------------|----------|
| Either player can end it | Any player can stop. Other keeps as personal habit. | ✓ |
| Proposer only | Only proposer can cancel. | |
| Mutual agreement | Both must agree. Could leave someone stuck. | |

**User's choice:** Either player can end it
**Notes:** No one is locked in.

---

## Duo Quest Catalog & Creation

### Q1: Should duo quests be template-based or player-created?

| Option | Description | Selected |
|--------|-------------|----------|
| Template-based | Pre-built curated catalog. Follows quest-engine pattern. | |
| Player-created | Players write own quest. Maximum flexibility. | |
| Templates + custom | Both curated catalog AND custom creation. | ✓ |

**User's choice:** Templates + custom
**Notes:** Best of both worlds.

### Q2: For custom duo quests, how should adab safety be handled?

| Option | Description | Selected |
|--------|-------------|----------|
| Client-side filter only | Leo-profanity filter on client. Lightweight. | ✓ |
| No filter needed | Trust the social graph. No filter. | |
| Server-side Edge Function | Route through Supabase Edge Function. | |

**User's choice:** Client-side filter only
**Notes:** Leo-profanity already in stack for Phase 17.

### Q3: How does a player start a duo quest?

| Option | Description | Selected |
|--------|-------------|----------|
| From buddy profile | Same entry point as shared habits. | ✓ |
| From quest board | Duo quests on existing Quest Board. Pick quest then buddy. | |
| Both entry points | Both surfaces. More discoverable. | |

**User's choice:** From buddy profile
**Notes:** Consistent pattern with shared habit proposal.

### Q4: How many duo quests can a pair have active at once?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 active per pair | Simple, focused. Complete one first. | |
| Up to 3 per pair | Allows parallel quests. More engaging. | ✓ |
| Unlimited | No cap. Risk of quest fatigue. | |

**User's choice:** Up to 3 per pair
**Notes:** Allows parallel quests like reading + exercise + detox.

---

## Inactivity & Timeout Handling

### Q1: What does a paused duo quest (48h inactivity) look like?

| Option | Description | Selected |
|--------|-------------|----------|
| Yellow warning banner | 'Paused — waiting for [buddy]'. Gentle, no shame. | ✓ |
| Grayed-out card | Quest dims with 'Paused' overlay. Might feel punishing. | |
| Notification only | Card normal, notification sent. Easy to miss. | |

**User's choice:** Yellow warning banner on quest card
**Notes:** Gentle UX, no shame copy.

### Q2: How should partial XP work at 72h exit?

| Option | Description | Selected |
|--------|-------------|----------|
| Proportional to own progress | 60% done = 60% individual XP. No bonus. | ✓ |
| Fixed partial reward | Flat 50% of individual XP. Simpler math. | |
| Full individual, no bonus | 100% individual XP, zero bonus. Generous. | |

**User's choice:** Proportional to own progress
**Notes:** Fair and transparent.

### Q3: Should shared habits also have inactivity handling?

| Option | Description | Selected |
|--------|-------------|----------|
| Duo quests only | Shared habits are ongoing, no timeout. Streak just stalls. | ✓ |
| Both features | Apply 48h/72h to shared habits too. | |

**User's choice:** Duo quests only
**Notes:** Shared habits have no deadline, no expiry — they're ongoing.

---

## Progress Display & Privacy

### Q1: Where should shared activities be visible?

| Option | Description | Selected |
|--------|-------------|----------|
| Buddy profile screen | On each buddy's profile. No new navigation. | |
| Dedicated 'Activities' tab | New sub-tab aggregating all shared activities. | ✓ |
| Inline in habit list | Distributed across existing surfaces. | |

**User's choice:** Dedicated 'Activities' tab
**Notes:** Sub-tab inside buddy screen (not new top-level tab).

### Q2: Where should Activities tab live in navigation?

| Option | Description | Selected |
|--------|-------------|----------|
| Sub-tab inside buddy screen | 'Buddies' + 'Activities' sub-tabs. Keeps social grouped. | ✓ |
| New top-level tab | Own tab in main tab bar. Tab bar already crowded. | |
| Section on buddy profile | Per-buddy view + global 'All Activities'. | |

**User's choice:** Sub-tab inside buddy screen
**Notes:** Keeps social features grouped without adding a top-level tab.

### Q3: Duo quest progress card display?

| Option | Description | Selected |
|--------|-------------|----------|
| Combined progress bar + status | Single bar, aggregate %. No who-did-what. Warm mentor copy. | ✓ |
| Two anonymous bars | 'You' and 'Partner' bars. More detailed but competitive. | |
| Milestone checkpoints | Dots filling in. Visual but less precise. | |

**User's choice:** Combined progress bar + status
**Notes:** DUOQ-05 compliant — aggregate only.

### Q4: Shared habit progress display?

| Option | Description | Selected |
|--------|-------------|----------|
| Shared streak count only | Days BOTH completed. 'Shared streak: 5 days'. | ✓ |
| Completion indicator (today) | Binary checkmark for today's pair completion. | |
| You decide | Claude picks. | |

**User's choice:** Shared streak count only
**Notes:** Motivating without exposing individual completion data.

---

## Claude's Discretion

- Duo quest template content and XP values
- Activities sub-tab navigation implementation
- Component styling details
- Confirmation dialog design
- Custom quest creation form layout

## Deferred Ideas

None — discussion stayed within phase scope
