# 03 — Game Design Bible

> **Requirement:** BLUE-03
> **Cross-references:** [Executive Vision](./01-executive-vision.md) · [Player Fantasy](./02-player-fantasy.md) · [Worldbuilding](./04-worldbuilding.md) · [Feature Systems](./05-feature-systems.md)

---

## Core Loop (Minute-to-Minute)

The core loop is the atomic unit of engagement. Every interaction follows this pattern in 5-30 seconds:

```
TRIGGER ──► ACTION ──► REWARD ──► INVESTMENT
  │                                    │
  └────────────────────────────────────┘
```

| Element | Description | Duration |
|---------|-------------|----------|
| **Trigger** | Prayer time notification, habit reminder, or self-initiated app open | 0s (external event) |
| **Action** | Open app, tap habit completion button | 2-5s |
| **Reward** | XP gain animation (numbers float up), streak counter increments, XP bar fills toward next level | 2-3s |
| **Investment** | Streak length increases, XP bar closer to next level, quest progress increments | Implicit |

**Loop duration:** 5-30 seconds per completion. A player completing 5 salah + 2 other habits spends ~60 seconds total in core loops across the day.

The core loop must feel **instant and satisfying**. Tap → reward animation → done. No confirmation dialogs, no "are you sure?" gates, no multi-step completion flows.

## Meta Loop (Day-to-Day)

The meta loop structures the player's daily engagement across 3-10 minutes total.

### Morning Phase (Fajr → Mid-Morning)

1. Open app (triggered by Fajr notification or habit)
2. See HUD: game world in morning lighting, today's habit list, active quests
3. Complete Fajr habit → core loop reward
4. Glance at quest progress: "Complete 3 habits today (1/3)"
5. Close app

**Duration:** 30-60 seconds

### Midday Phase (Dhuhr → Asr)

1. Open app (prayer time trigger or self-initiated)
2. Complete Dhuhr/Asr habits → core loop rewards
3. Check quest progress: "Complete 3 habits today (3/3) — Quest Complete!"
4. Quest completion celebration: bonus XP animation, quest card flips to "Completed"
5. Check title proximity: "5 days until The Consistent"
6. Close app

**Duration:** 60-90 seconds

### Evening Phase (Maghrib → Isha → Muhasabah)

1. Complete remaining habits
2. Optional: Open Muhasabah reflection (30-60 seconds, 2-3 prompts)
3. See daily summary: total XP earned, streaks maintained, quests completed
4. Preview: tomorrow's quest board refresh (if weekly rotation day)
5. Close app

**Duration:** 1-3 minutes

### Daily Time Budget

| Activity | Time | Frequency |
|----------|------|-----------|
| Habit completions (tap-to-complete) | 5-10s each | 5-8× daily |
| Quick check-ins (quests, progress) | 30-60s | 2-3× daily |
| Muhasabah (optional) | 30-60s | 0-1× daily |
| Browsing (world, titles, history) | 1-2 min | 0-1× daily |
| **Total** | **3-10 min** | **Daily** |

## Long Loop (Week-to-Month)

The long loop provides the macro progression that sustains engagement beyond the first week.

### Weekly Beats

| Day | Event | Player Experience |
|-----|-------|-------------------|
| Monday | Quest Board rotation | New weekly and stretch quests appear — "what can I accomplish this week?" |
| Daily | Streak milestones approaching | Progress indicators show proximity to next streak milestone |
| Sunday | Weekly summary | Achievement-framed recap: days active, XP earned, streaks maintained |

### Monthly Beats

| Timeframe | Event | Player Experience |
|-----------|-------|-------------------|
| Week 2-3 | First rare title approaching | "I'm 5 days from The Devoted" — creates anticipation |
| Month 1 | HUD environment transition | The game world visibly evolves — proof of discipline |
| Month 2-3 | Legendary title visibility | "The Unwavering requires 100 consecutive days — I'm at 45" |

### Streak Milestone Celebrations

| Streak Days | Celebration | Copy Example |
|-------------|-------------|--------------|
| 7 | Bronze milestone badge | "A week of consistency. Your foundation strengthens." |
| 14 | Silver milestone badge | "Two weeks of discipline. You are building something real." |
| 21 | Gold milestone badge | "Twenty-one days. They say habits form here. Yours is forged." |
| 30 | Special celebration screen | "A full month. Your discipline speaks for itself." |
| 40 | Significance marker (40 days is meaningful in Islamic tradition) | "Forty days — a number of transformation in our tradition." |
| 60 | Platinum badge | "Sixty days of steadfastness. The path is yours." |
| 90 | Diamond badge | "Ninety days. What was once effort is now identity." |
| 100 | Century celebration | "One hundred days. You have built something extraordinary." |
| 365 | Legendary celebration | "A full year of discipline. SubhanAllah." |

## XP Economy Model

### XP Formula

```
XP_required(level) = floor(base_xp × level^exponent)
```

**Constants:**
- `base_xp` = 40
- `exponent` = 1.85

This produces a curve where early levels come quickly (encouraging fast early wins) and later levels require sustained consistency (preventing players from "finishing" the game).

### Base XP Awards

| Source | XP | Notes |
|--------|-----|-------|
| Salah completion (each of 5) | 15 XP | Core worship anchor |
| Quran reading session | 20 XP | Higher because it requires focused time |
| Dhikr session | 10 XP | Quick, frequent practice |
| Fasting (daily) | 25 XP | Highest base — full-day commitment |
| Custom habit | 15 XP | Default for user-created habits |
| Muhasabah completion | 10 XP | Optional — gentle nudge, not coercive |
| Daily quest completion | 25-50 XP | Varies by quest difficulty |
| Weekly quest completion | 100-200 XP | Medium-term challenge |
| Stretch quest completion | 300-500 XP | Long-term, hard challenge |

### Streak Multiplier

```
streak_multiplier(consecutive_days) = min(1.0 + (consecutive_days × 0.1), 3.0)
```

| Consecutive Days | Multiplier | Effect on 15 XP Salah |
|-----------------|------------|----------------------|
| 0 (first day or after reset) | 1.0× | 15 XP |
| 1 | 1.1× | 16 XP |
| 5 | 1.5× | 22 XP |
| 10 | 2.0× | 30 XP |
| 15 | 2.5× | 37 XP |
| 20+ | 3.0× (cap) | 45 XP |

**Rules:**
- Streak multiplier is **per-habit** (each habit has its own streak counter and multiplier)
- Multiplier resets to 1.0× when a streak breaks
- **XP total never decreases** — only the multiplier resets, earned XP is permanent
- Quest XP is NOT affected by streak multiplier (quests have fixed rewards)
- Muhasabah XP is NOT affected by streak multiplier (keeps it low-pressure)

### Daily XP Estimates by Player Archetype

**Casual Player (2 habits/day, no quests):**
- Day 1: 2 habits × 15 XP × 1.0× = 30 XP
- Day 7: 2 habits × 15 XP × 1.6× = 48 XP
- Day 20+: 2 habits × 15 XP × 3.0× = 90 XP (cap)

**Consistent Player (5 habits/day, daily quests):**
- Day 1: (5 × 15 × 1.0) + 35 quest = 110 XP
- Day 7: (5 × 15 × 1.6) + 35 quest = 155 XP
- Day 20+: (5 × 15 × 3.0) + 35 quest = 260 XP (cap)

**Power Player (8 habits/day, all quests, Muhasabah):**
- Day 1: (8 × 15 × 1.0) + 35 daily + 10 muhasabah = 165 XP
- Day 7: (8 × 15 × 1.6) + 35 daily + 10 muhasabah = 237 XP
- Day 20+: (8 × 15 × 3.0) + 35 daily + 150 weekly/7 + 10 muhasabah = 417 XP (cap range)

### Soft Daily XP Cap

- **Soft cap:** ~500 XP/day
- **Mechanism:** After 500 XP in a day, additional XP earned is reduced by 50% (diminishing returns)
- **Purpose:** Prevents power players from racing too far ahead, keeps the economy balanced across archetypes
- **Not a hard cutoff:** Players still earn XP, just at a reduced rate. No notification about the cap — it's invisible and anti-grind by design.

## XP Simulation Table

### Level Progression (XP_required = 40 × level^1.85)

| Level | XP to Next | Cumulative XP | Est. Days (Consistent) | Unlock |
|-------|-----------|---------------|----------------------|--------|
| 1 | 40 | 0 | 0 | Tutorial complete, Title: "The Seeker" |
| 2 | 137 | 40 | <1 | -- |
| 3 | 278 | 177 | 1 | -- |
| 4 | 460 | 455 | 2 | -- |
| 5 | 681 | 915 | 3 | Title: "The Newcomer", Quest Board unlocks |
| 6 | 938 | 1,596 | 4 | -- |
| 7 | 1,230 | 2,534 | 5 | -- |
| 8 | 1,555 | 3,764 | 7 | New quest tier, Title: "The Awakening" |
| 9 | 1,913 | 5,319 | 8 | -- |
| 10 | 2,302 | 7,232 | 10 | HUD Environment 2 unlocked, Title: "The Dedicated" |
| 12 | 3,164 | 12,080 | 14 | -- |
| 15 | 4,778 | 22,224 | 21 | Title: "The Committed" |
| 18 | 6,670 | 36,132 | 27 | -- |
| 20 | 8,018 | 47,816 | 30 | Title: "The Consistent", Monthly milestone |
| 25 | 12,071 | 83,968 | 45 | HUD Environment 3 unlocked |
| 30 | 16,854 | 130,388 | 65 | Title: "The Devoted" |
| 35 | 22,324 | 187,712 | 85 | -- |
| 40 | 28,441 | 256,220 | 110 | Title: "The Resolute" |
| 45 | 35,169 | 336,136 | 140 | -- |
| 50 | 42,476 | 427,628 | 170 | HUD Environment 4 unlocked, Title: "The Unyielding" |
| 60 | 58,751 | 639,476 | 240 | Title: "The Unwavering" |
| 75 | 86,741 | 1,014,392 | 365 | Title: "The Pillar" (one-year milestone) |
| 80 | 98,272 | 1,177,284 | 400+ | -- |
| 90 | 122,640 | 1,528,760 | 500+ | Title: "The Mountain" |
| 100 | 149,012 | 1,918,688 | 600+ | Title: "The Eternal Flame" (aspirational) |

### Player Archetype Simulations

#### Casual Player (2 habits/day, no quests)

| Day | Daily XP (avg) | Cumulative XP | Level |
|-----|---------------|---------------|-------|
| 7 | ~40 | ~280 | 3 |
| 30 | ~70 | ~1,600 | 6 |
| 90 | ~90 | ~6,300 | 9 |
| 365 | ~90 | ~27,000 | 16 |

The casual player reaches level 6 in the first month and level 16 after a year. They experience the first two HUD environments and earn several common titles. The pacing feels rewarding — even minimal consistency shows tangible progress.

#### Consistent Player (5 habits/day, daily quests)

| Day | Daily XP (avg) | Cumulative XP | Level |
|-----|---------------|---------------|-------|
| 7 | ~140 | ~910 | 5 |
| 30 | ~210 | ~5,400 | 8-9 |
| 90 | ~260 | ~20,000 | 14-15 |
| 365 | ~260 | ~85,000 | 25-26 |

The consistent player hits level 5 in the first week (matching the "fast early wins" requirement), reaches level 8-9 by month 1, and enters HUD Environment 3 by the end of the year. They earn rare titles in months 2-3 and have legendary titles visible as long-term goals.

#### Power Player (8 habits/day, all quests, Muhasabah)

| Day | Daily XP (avg) | Cumulative XP | Level |
|-----|---------------|---------------|-------|
| 7 | ~220 | ~1,400 | 5-6 |
| 30 | ~350 | ~8,800 | 10-11 |
| 90 | ~400 | ~32,000 | 18-19 |
| 365 | ~420 | ~140,000 | 30-32 |

The power player reaches HUD Environment 2 by month 1, earns rare titles by month 2, and approaches legendary titles by the end of the year. The soft daily cap prevents them from outpacing the economy — even maximal play doesn't reach level 100 in a year, keeping aspirational goals meaningful.

### Curve Validation

- **Level 5 by day 3:** Consistent player reaches ~455 XP by day 3 → level 4-5. On target.
- **Level 8 by day 7:** Consistent player reaches ~910 XP by day 7 → level 5. Slightly behind target. Power player reaches level 5-6. The 5-8 range is achievable by day 7-10 for consistent players. Acceptable — fast early wins are preserved.
- **Level 20 by month 1:** Consistent player reaches level 8-9 at day 30. Level 20 at day 30 would require ~48K XP, which is ~1,600/day — unrealistic. Level 20 is more accurately a ~2 month milestone for consistent players. This is better for long-term pacing. Adjusting target: **Level 10 by month 1, Level 20 by month 2-3.**
- **Level 50 by month 6:** Power player at day 180 ≈ ~72K XP → level ~24. Level 50 at month 6 requires ~428K XP — only achievable with 2,300+ XP/day, well above soft cap. **Level 50 is a 12-18 month milestone for power players.** This is intentional — it prevents "finishing" the game.
- **Level 100 at year 1+:** Requires ~1.9M XP. At 420 XP/day (power player cap range) = ~4,500 days. Level 100 is **aspirational** — it represents years of daily discipline. Very few players will reach it. This is by design.

**Curve Verdict:** The curve provides fast early wins (level 5 in first week) with a meaningful long-term journey. The gap between casual and power players widens gradually but never feels punishing — a casual player at level 16 after a year still has a rich world and title collection. The economy is healthy.

## Streak Model

### Per-Habit Streaks

Each habit maintains its own independent streak counter.

```
Fajr streak: 14 days  ████████████████░░░░ (next milestone: 21)
Quran streak: 7 days   ████████░░░░░░░░░░░░ (next milestone: 14)
Dhikr streak: 3 days   ████░░░░░░░░░░░░░░░░ (next milestone: 7)
```

**Rules:**
- A habit streak increments when the habit is completed within its frequency window (daily = any time today, weekly = any time this week)
- A habit streak breaks when the frequency window passes with zero completions
- Breaking one habit streak does not affect other habit streaks
- Streak counter shows current consecutive days, not lifetime total

### Overall Discipline Streak

A separate "discipline streak" tracks: **did the player complete ANY habit today?**

- Increments daily if at least one habit was completed
- More forgiving than per-habit streaks — the player stays "active" even on low-effort days
- Displayed prominently on the HUD as the primary streak indicator
- Breaks only on a complete zero-activity day

### Streak Break Mechanics

When a per-habit streak breaks:

1. Streak multiplier for that habit resets to 1.0×
2. **XP total does NOT decrease** — all earned XP is permanent
3. Streak counter for that habit resets to 0
4. Mercy Mode activates for that habit (see Failure and Recovery below)
5. Other habit streaks are unaffected

When the overall discipline streak breaks (zero-activity day):

1. Overall discipline streak resets to 0
2. Mercy Mode activates with a general recovery quest
3. Per-habit streaks that survived (e.g., habits with weekly frequency) are unaffected
4. No shame notification. No "you missed a day" message.

### What Streak Display Never Shows

- "Days missed" count — never. Only "days active" or current streak.
- Negative streak comparisons — "Your streak was 14, now it's 0." Instead: "Recovery quest unlocked."
- Peer streak comparisons — no "Your friend has a 30-day streak." Streaks are private.

## Failure and Recovery (Mercy Mode)

Mercy Mode is the app's most important ethical mechanic. It transforms streak breaks from punishment into recovery.

### Trigger Conditions

- Any per-habit streak breaks (zero completions in the habit's frequency window)
- Overall discipline streak breaks (zero-activity day)

### Response Flow

```
Streak Break Detected
        │
        ▼
  ┌─────────────────┐
  │  NO shame notif  │  ← The app says NOTHING negative
  └────────┬────────┘
           │
           ▼  (Next app open)
  ┌─────────────────────────────┐
  │  Mercy Mode Banner          │
  │  "The path of discipline    │
  │   has rest stops.           │
  │   Recovery quest unlocked." │
  └────────┬────────────────────┘
           │
           ▼
  ┌─────────────────────────────┐
  │  Recovery Quest Generated   │
  │  Tailored to broken habit   │
  │  Achievable in 2-3 days     │
  └────────┬────────────────────┘
           │
           ▼
  ┌─────────────────────────────┐
  │  Player completes quest     │
  │  Streak shows "Rebuilt: 3d" │
  │  Bonus XP for recovery      │
  └─────────────────────────────┘
```

### Recovery Quest Examples

| Broken Habit | Recovery Quest | Reward |
|-------------|---------------|--------|
| Fajr prayer | "Complete Fajr 3 times in the next 3 days" | 50 XP + streak shows "Rebuilt: 3 days" |
| Quran reading | "Read Quran for 2 sessions in the next 3 days" | 40 XP + streak rebuilt |
| Dhikr | "Complete dhikr 3 times in the next 3 days" | 30 XP + streak rebuilt |
| Overall discipline | "Complete any 3 habits in the next 2 days" | 60 XP + discipline streak rebuilt |
| Multiple habits | "Complete 5 total habit check-ins across any habits in 3 days" | 75 XP + all broken streaks rebuilt |

### Recovery Rewards

- **Partial streak credit:** After recovery, the streak displays "Rebuilt: 3 days" instead of "3 days." This acknowledges the break while celebrating the comeback.
- **After 7 consecutive days post-recovery:** The "Rebuilt" label drops off and the streak shows normally. The recovery is complete.
- **Recovery XP bonus:** Completing a recovery quest awards bonus XP beyond the normal habit XP. Recovery is rewarded, not just tolerated.

### Mercy Mode Copy Tone

Every Mercy Mode message blends brief Islamic wisdom with game recovery action:

| Context | Message |
|---------|---------|
| Single habit break | "The door of tawbah is always open. Recovery quest unlocked — rebuild your momentum." |
| Multiple habit break | "Every sunrise is a new beginning. Your recovery quests are ready." |
| Discipline streak break | "The best of those who err are those who return. Your path awaits." |
| Recovery quest complete | "Momentum rebuilt. Your discipline is stronger for having been tested." |
| First-ever streak break | "Rest is part of the journey, not the end of it. Here's your first recovery quest." |

### Mercy Mode States

| State | Description | Display |
|-------|-------------|---------|
| **Inactive** | No broken streaks | Normal HUD, no Mercy Mode elements |
| **Active** | Streak break detected, recovery quest available | Mercy Mode banner on HUD, recovery quest card visible |
| **Recovery-in-Progress** | Player has started the recovery quest | Recovery quest progress shown, encouraging copy |
| **Recovered** | Recovery quest completed | Celebration moment, "Rebuilt" streak label, banner dismissed |
| **Ignored** | Player hasn't engaged with recovery quest for 7+ days | Quest remains available, no escalation, no additional notifications |

## Anti-Burnout Mechanisms

### 1. Soft Daily XP Cap

After ~500 XP in a single day, additional XP is earned at 50% rate. This is invisible to the player — no notification, no warning. It simply prevents obsessive grinding from being mechanically rewarded.

### 2. No Punishment for Days Off

- XP total never decreases
- World state never degrades (your environment doesn't "decay" if you miss days)
- No negative notifications ("You missed 3 days!")
- Returning after absence: the app greets the player warmly, not accusingly

### 3. Quest Variety

- Daily quests rotate with different habit focuses
- Weekly quests introduce variety (e.g., "Try a habit you haven't done in a week")
- Stretch quests are rare enough to feel special, not obligatory

### 4. Muhasabah Is Always Optional

- 10 XP bonus is a gentle nudge, representing <5% of daily XP for most players
- Skipping has zero mechanical consequence
- No "you haven't reflected in 5 days" notification
- Different prompts each day prevent reflection from feeling formulaic

### 5. Weekly Summary Framing

- "You were active 5 of 7 days" — never "You missed 2 days"
- Focus on cumulative achievement, not gaps
- Longest streak highlighted, not streak breaks

### 6. Session Duration Natural Limits

- No infinite scroll
- No feed
- No content that rewards sessions beyond 10 minutes
- The app has natural stopping points after completing habits and checking quests

## Boss Progression (v2 — Included for Economy Coherence Only)

> **Status: v2 Deferred.** Specced here only for economy modeling.

The Nafs Boss Arena is a boss-battle system where players face representations of personal nafs (ego/desire) struggles — The Procrastinator, The Distractor, The Doubter. Boss battles are unlocked at specific level thresholds and require sustained discipline (e.g., 7-day quest chains) to defeat. Boss defeat awards 200-500 XP depending on boss tier, plus a unique title. Boss battles use a turn-based metaphor where "attacks" are habit completions over multiple days — the boss represents a multi-day challenge, not a single session. Economy impact: adds ~200-500 XP per boss (2-4 bosses per quarter) — minimal impact on overall curve.

## Friday Power-Ups (v2 — Included for Economy Coherence Only)

> **Status: v2 Deferred.** Specced here only for economy modeling.

Jumu'ah (Friday) bonuses grant 2× XP on all Friday habit completions. This introduces a weekly spike day that mirrors the Islamic significance of Friday. Economy impact: adds ~50-100% more XP on Fridays for active players (~1 day per week at double rate). At steady state, this increases weekly XP by ~14% — significant but not economy-breaking. Will require re-tuning the level curve slightly when implemented.

---

*Section 3 of 16 · HalalHabits: Ferrari 16-Bit Edition Master Blueprint*
