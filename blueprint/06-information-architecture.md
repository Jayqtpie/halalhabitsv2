# 06 — Information Architecture and UX Flows

> **Requirement:** BLUE-06
> **Cross-references:** [Player Fantasy](./02-player-fantasy.md) · [Feature Systems](./05-feature-systems.md) · [Screen Specs](./07-screen-specs.md)

---

## Navigation Model

### Tab Bar Structure

The app uses a bottom tab bar with 4 primary tabs. The tab bar is persistent across all main screens and uses pixel art icons with jewel tone active states.

```
┌──────────────────────────────────────────────┐
│                                              │
│              [Active Screen]                 │
│                                              │
├──────────┬──────────┬──────────┬─────────────┤
│  🏠 Home │ 📿 Habits│ ⚔ Quests │ 👤 Profile  │
│  (HUD)   │          │          │             │
└──────────┴──────────┴──────────┴─────────────┘
```

| Tab | Screen | Style | Icon |
|-----|--------|-------|------|
| Home | Home HUD | Full pixel immersion (Skia canvas) | Pixel art house/sanctuary |
| Habits | Habits List | Modern UI with pixel accents | Pixel art checkmark/scroll |
| Quests | Quest Board | Modern UI with pixel accents | Pixel art sword/compass |
| Profile | Profile | Modern UI with pixel accents | Pixel art character silhouette |

**Tab bar styling:**
- Background: `surface-900` (near-black)
- Active icon: Emerald-500 (`#0D7C3D`) with label
- Inactive icon: Neutral-500 (muted grey) without label
- Tab bar hidden during: onboarding flow, Muhasabah (full-screen), celebration modals

### Screen Categorization

| Category | Screens | Navigation Type |
|----------|---------|----------------|
| **Tabs** | Home HUD, Habits List, Quest Board, Profile | Bottom tab switches |
| **Stack Push** | Habit Detail, Habit Create/Edit, Settings, Titles Gallery | Push onto tab's stack |
| **Modals** | Level Up Celebration, Title Unlock, Mercy Mode Overlay | Modal overlay on current screen |
| **Full-Screen Flow** | Onboarding (3 screens), Muhasabah | Dedicated flow, tab bar hidden |

### Screen Inventory

| # | Screen | Type | Purpose |
|---|--------|------|---------|
| 1 | Onboarding — Welcome | Flow | Introduce app personality, set expectations |
| 2 | Onboarding — Niyyah | Flow | Set personal intention for discipline journey |
| 3 | Onboarding — Habit Selection | Flow | Choose 2-5 starter habits from preset library |
| 4 | Home HUD | Tab | Game world view — level, XP, streaks, today's snapshot |
| 5 | Habits List | Tab | Daily checklist — all active habits with completion status |
| 6 | Habit Detail | Stack | Individual habit stats — streak history, heatmap, edit |
| 7 | Habit Create/Edit | Stack | Form — name, frequency, time window, difficulty, icon |
| 8 | Quest Board | Tab | Available quests — daily, weekly, stretch with progress |
| 9 | Profile | Tab | Identity — title, level, XP, earned titles, stats |
| 10 | Titles Gallery | Stack | All titles — earned and locked with progress indicators |
| 11 | Settings | Stack | Preferences — notifications, prayer calc, privacy, data |
| 12 | Muhasabah | Full-Screen | Nightly reflection — 2-3 prompts, 30-60 seconds |
| 13 | Mercy Mode Overlay | Modal | Recovery prompt — compassionate message + quest |
| 14 | Level Up Celebration | Modal | Level milestone — animation, unlocks, new environment |
| 15 | Title Unlock | Modal | Title earned — rarity animation, flavor text, equip option |

## Key User Paths

### Path 1: First Launch → Home HUD

The onboarding flow must complete in under 2 minutes (ONBR-04).

```
App Install → Launch
       │
       ▼
┌─────────────────┐
│  Welcome Screen  │  "Your discipline journey begins."
│  [Begin Journey] │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Niyyah Screen   │  "What brings you here?"
│  [3 options]     │  Player taps one intention
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Habit Selection  │  Pick 2-5 habits from presets
│ [Continue]       │  Toggle on/off, see XP preview
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Home HUD      │  Game world + "Level 1 — The Seeker"
│  First view      │  XP bar visible, first title earned
└─────────────────┘

Total time: 60-90 seconds
```

### Path 2: Daily Morning Habit Completion

```
Fajr Notification
  "Fajr time has entered."
       │
       ▼
┌─────────────────┐
│    Home HUD      │  Morning lighting on game world
│                  │  Today's habit count: 0/5
└────────┬────────┘
         │ Tap "Habits" tab
         ▼
┌─────────────────┐
│   Habits List    │  Fajr shows time window active
│  [✓ Tap Fajr]   │  Single tap → completion
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  XP Animation    │  "+15 XP" floats up
│  Streak: 8 days  │  Streak counter increments
│  Quest: 1/3      │  Daily quest progress updates
└────────┬────────┘
         │ Auto-return or tap back
         ▼
┌─────────────────┐
│    Home HUD      │  XP bar updated
│  Habits: 1/5     │
└─────────────────┘

Total time: 5-10 seconds
```

### Path 3: Streak Break → Mercy Mode → Recovery

```
Missed day detected
  (Fajr window passed, no completion)
       │
       ▼
  No notification sent.
  Streak resets silently.
       │
       ▼ (Next app open)
┌─────────────────────────────┐
│    Mercy Mode Overlay        │
│                              │
│  "The door of tawbah is      │
│   always open."              │
│                              │
│  Recovery Quest:             │
│  "Complete Fajr 2 of the    │
│   next 3 days"              │
│                              │
│  [Begin Recovery]  [Dismiss] │
└────────────┬────────────────┘
             │ Tap Begin
             ▼
┌─────────────────┐
│  Quest Board     │  Recovery quest appears
│  (Recovery tab)  │  Progress: 0/2
└────────┬────────┘
         │ (Over next 2-3 days)
         ▼
┌──────────────────────────┐
│  Recovery Complete!       │
│                          │
│  "Momentum rebuilt."     │
│  Streak: Rebuilt — 3 days│
│  +50 XP bonus            │
│                          │
│  [Continue]              │
└──────────────────────────┘
```

### Path 4: Quest Completion

```
┌─────────────────┐
│   Quest Board    │  See active quests
│                  │  Daily: "Complete 3 habits" (2/3)
└────────┬────────┘
         │ Player completes 3rd habit (on Habits screen)
         ▼
┌─────────────────┐
│ Quest Complete!  │  Toast notification on any screen
│ "+35 XP"        │  Quest card flips to "Completed"
└────────┬────────┘
         │ Tap toast or visit Quest Board
         ▼
┌─────────────────┐
│   Quest Board    │  Completed quest shows checkmark
│  Daily: ✓ Done   │  Other quests still active
└─────────────────┘
```

### Path 5: Evening Muhasabah

```
Evening notification (9 PM default)
  "A moment of reflection awaits."
       │
       ▼
┌──────────────────────────┐
│   Muhasabah Screen       │
│                          │
│  "What went well today?" │
│  [Fajr] [Quran] [Dhikr] │  Tap from today's completions
│                          │
│  [Skip]                  │  Always visible, no shame
└────────┬─────────────────┘
         │ Answer or skip
         ▼
┌──────────────────────────┐
│  "Set one intention for  │
│   tomorrow."             │
│                          │
│  [Pray Fajr on time]    │  Preset options
│  [Read Quran]            │
│  [Type custom...]        │
│                          │
│  [Complete]              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  "Reflection complete.   │
│   +10 XP"                │
│                          │
│  Today: 245 XP earned    │
│  Streak: 12 days         │
│                          │
│  [Return to Home]        │
└──────────────────────────┘
```

### Path 6: Level Up

```
Habit completion pushes XP past threshold
       │
       ▼
┌──────────────────────────────┐
│   Level Up Celebration        │
│                              │
│       ★ LEVEL 10 ★           │
│                              │
│   "Your discipline speaks    │
│    for itself."              │
│                              │
│   Unlocked:                  │
│   🏔 New Environment         │
│   🏷 Title: "The Dedicated"  │
│                              │
│   [Continue]                 │
└──────────────────────────────┘

If environment unlock:
  Home HUD transitions to new environment on return.

If title unlock:
  Title Unlock modal chains after Level Up modal.
```

### Path 7: Title Unlock

```
Milestone reached (e.g., 40 consecutive Fajr)
       │
       ▼
┌──────────────────────────────┐
│   Title Unlocked!             │
│                              │
│   ✦ The Steadfast ✦          │
│   [RARE]                     │
│                              │
│   "Forty dawns — a number    │
│    of transformation."       │
│                              │
│   [Equip Title]  [Dismiss]   │
└──────────────────────────────┘

Equip → Profile and HUD show new title
Dismiss → Title saved to collection, current title unchanged
```

## Onboarding-to-Day-30 Journey Map

| Day | Player State | App Experience | Key Mechanic |
|-----|-------------|----------------|--------------|
| **0** | Curious newcomer | Welcome → Niyyah → Habits → Home HUD | First title: "The Seeker" |
| **1** | First completions | Complete 2-5 habits, see XP, reach level 2 | Core loop established |
| **2-3** | Building rhythm | Level 3-4, first daily quest completed | Quest Board engagement |
| **3-5** | Momentum growing | Level 4-5, "The Newcomer" title, 3-5 day streaks | Title collection starts |
| **7** | First week done | Level 5-8, weekly quest rotation, "The Awakening" | Weekly cadence begins |
| **7-10** | Risk: first streak break | Mercy Mode may activate, recovery quest | Mercy Mode proves itself |
| **14** | Rhythm established | Level 8-10, approaching rare titles, 7+ day streaks | Streak multiplier meaningful |
| **21** | Habit identity forming | Level 10-12, streak multiplier near cap, HUD may evolve | Identity transformation |
| **30** | One month milestone | Level 12-15, rare titles appearing, weekly summary shows consistency | Monthly celebration |

## Drop-Off Risk Analysis

| Risk Point | Probability | Cause | Mitigation | Feature |
|-----------|-------------|-------|-----------|---------|
| **Day 2-3** | HIGH (40-50% of new users) | Novelty fades, forgot to open app | Fast early leveling (level 3-4 by day 2-3), first title unlock, gentle notification | XP curve, titles, notifications |
| **Day 7-10** | MEDIUM (20-30%) | First significant streak break → feels like failure | Mercy Mode activates immediately, recovery quest is achievable in 2-3 days, no shame copy | Mercy Mode |
| **Day 14** | MEDIUM (15-20%) | Routine fatigue — same habits, same quests | Weekly quest rotation brings variety, rare titles becoming visible as goals | Quest Board, titles |
| **Day 30** | LOW-MEDIUM (10-15%) | Content plateau — seen everything, game layer feels thin | HUD environment transition (visual renewal), rare title unlocks, stretch quests | HUD evolution, long-loop |
| **Day 60+** | LOW (5-10%) | Achievement fatigue — most common/rare titles earned | Legendary title chase (100+ day commitments), v2 features teased | Legendary titles |

**Key insight:** The highest risk is Day 2-3 (novelty fade). The primary defense is fast early wins — the player must feel tangible progress (level-ups, first title) before novelty wears off. Every other risk point has a dedicated feature-level mitigation.

---

*Section 6 of 16 · HalalHabits: Ferrari 16-Bit Edition Master Blueprint*
