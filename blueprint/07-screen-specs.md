# 07 — Screen-by-Screen Product Spec

> **Requirement:** BLUE-07
> **Cross-references:** [Feature Systems](./05-feature-systems.md) · [Information Architecture](./06-information-architecture.md) · [UI Design Tokens](./08-ui-design-tokens.md)

---

## 1. Onboarding — Welcome

### Purpose
Introduce the app's personality and set expectations for the discipline journey ahead.

### Entry Points
- First app launch (fresh install)
- After data reset from settings

### Layout
```
╔══════════════════════════════════╗
║                                  ║
║     [HalalHabits Logo]           ║
║     Pixel art, jewel tones       ║
║                                  ║
║                                  ║
║     "Your discipline journey     ║
║      begins here."               ║
║                                  ║
║     A game-first approach to     ║
║     building Islamic habits.     ║
║     Earn XP. Build streaks.      ║
║     Watch your world grow.       ║
║                                  ║
║                                  ║
║   ┌────────────────────────┐     ║
║   │    Begin Your Journey   │     ║
║   └────────────────────────┘     ║
║                                  ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Logo | Image | Pixel art HalalHabits logo, subtle shimmer animation |
| Headline | Text | "Your discipline journey begins here." |
| Description | Text | 3-line value prop summary |
| CTA Button | Primary Button | "Begin Your Journey" → navigates to Niyyah |

### Interactions
- Tap CTA: Navigate to Niyyah screen
- No back button (first screen)
- No skip option (this IS the entry point)

### Animations
- Logo: Fade in with subtle pixel shimmer (0→1 opacity, 500ms, ease-out)
- Text: Staggered fade-in (300ms delay between headline and description)
- Button: Slide up from bottom (200ms, ease-out)

### Copy Examples
- Headline: "Your discipline journey begins here."
- Description: "A game-first approach to building Islamic habits. Earn XP. Build streaks. Watch your world grow."
- CTA: "Begin Your Journey"

### Edge States
| State | Display | Copy |
|-------|---------|------|
| First launch | Full welcome screen | As above |
| Returning after reset | Same welcome screen | Same copy |
| Loading | App splash screen (< 2 sec) | HalalHabits logo only |

---

## 2. Onboarding — Niyyah (Intention Setting)

### Purpose
Set a personal intention for the discipline journey. Niyyah (intention) is foundational in Islam — every action begins with it.

### Entry Points
- Welcome screen CTA
- Not revisitable after onboarding (intention stored locally)

### Layout
```
╔══════════════════════════════════╗
║  ← Back                         ║
║                                  ║
║     [Pixel art character]        ║
║     Wise mentor figure           ║
║                                  ║
║     "Every journey begins        ║
║      with intention.             ║
║      What brings you here?"      ║
║                                  ║
║   ┌────────────────────────────┐ ║
║   │ I want to pray more        │ ║
║   │ consistently               │ ║
║   └────────────────────────────┘ ║
║   ┌────────────────────────────┐ ║
║   │ I want to build better     │ ║
║   │ daily habits               │ ║
║   └────────────────────────────┘ ║
║   ┌────────────────────────────┐ ║
║   │ I want to strengthen my    │ ║
║   │ discipline                 │ ║
║   └────────────────────────────┘ ║
║                                  ║
║   Or write your own:             ║
║   ┌────────────────────────────┐ ║
║   │ [Type your intention...]   │ ║
║   └────────────────────────────┘ ║
║                                  ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Back button | Navigation | Return to Welcome |
| Mentor character | Pixel art image | Static wise mentor figure |
| Prompt text | Text | "Every journey begins with intention..." |
| Intention cards | Selectable cards | 3 preset options, single-select |
| Custom input | Text input | Optional free-text intention (140 char max) |
| Continue | Primary Button | Appears after selection, "Continue" |

### Interactions
- Tap intention card: Select (deselect others), Continue button appears
- Tap custom input: Keyboard opens, typing replaces card selection
- Tap Continue: Store niyyah locally (PRIVATE), navigate to Habit Selection

### Animations
- Mentor character: Fade in (300ms)
- Cards: Staggered slide-in from right (100ms apart, 200ms each)
- Selection: Card border glows emerald (150ms, spring easing)

### Copy Examples
- Prompt: "Every journey begins with intention. What brings you here?"
- Option 1: "I want to pray more consistently"
- Option 2: "I want to build better daily habits"
- Option 3: "I want to strengthen my discipline"
- Custom placeholder: "Type your intention..."

### Edge States
| State | Display | Copy |
|-------|---------|------|
| No selection | Continue button hidden | Prompt visible, cards ready |
| Card selected | Selected card has emerald border, Continue visible | -- |
| Custom text entered | Text input active, Continue visible | -- |
| Empty custom text submitted | Prevent submission | "Share a few words about your intention." |

---

## 3. Onboarding — Habit Selection

### Purpose
Choose 2-5 starter habits from the preset Islamic habits library to begin the journey.

### Entry Points
- Niyyah screen Continue button

### Layout
```
╔══════════════════════════════════╗
║  ← Back                         ║
║                                  ║
║  Choose your habits              ║
║  Select 2-5 to get started.      ║
║  You can always add more later.  ║
║                                  ║
║  SALAH                           ║
║  ┌──────────────────────────┐    ║
║  │ ☐ Fajr Prayer    +15 XP │    ║
║  │ ☐ Dhuhr Prayer   +15 XP │    ║
║  │ ☐ Asr Prayer     +15 XP │    ║
║  │ ☐ Maghrib Prayer +15 XP │    ║
║  │ ☐ Isha Prayer    +15 XP │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  WORSHIP                         ║
║  ┌──────────────────────────┐    ║
║  │ ☐ Quran Reading   +20 XP│    ║
║  │ ☐ Morning Adhkar  +10 XP│    ║
║  │ ☐ Evening Adhkar  +10 XP│    ║
║  └──────────────────────────┘    ║
║                                  ║
║  Selected: 0 of 2-5             ║
║  ┌────────────────────────┐      ║
║  │   Start Your Journey    │      ║
║  └────────────────────────┘      ║
║                                  ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Back button | Navigation | Return to Niyyah |
| Header text | Text | Instructions with "2-5" guidance |
| Category headers | Section header | "SALAH", "WORSHIP", "DHIKR", etc. |
| Habit toggles | Checkbox list | Name + XP preview per item |
| Selection counter | Badge | "Selected: N of 2-5" |
| CTA Button | Primary Button | Enabled when 2-5 selected |

### Interactions
- Tap habit: Toggle on/off with checkbox animation
- CTA enabled: When 2-5 habits selected
- CTA disabled: When fewer than 2 selected
- Tap CTA: Create habits, navigate to Home HUD, award "The Seeker" title

### Animations
- Checkbox: Emerald fill with checkmark draw (150ms)
- Counter: Number flip animation on change (100ms)
- CTA: Pulse when first enabled (300ms, once)

### Copy Examples
- Header: "Choose your habits"
- Subheader: "Select 2-5 to get started. You can always add more later."
- Counter: "Selected: 3 of 2-5"
- CTA (enabled): "Start Your Journey"
- CTA (disabled): "Select at least 2 habits"

### Edge States
| State | Display | Copy |
|-------|---------|------|
| No selection | CTA disabled (muted) | "Select at least 2 habits" |
| 1 selected | CTA still disabled | "Select at least 1 more" |
| 2-5 selected | CTA enabled (emerald) | "Start Your Journey" |
| 6+ attempted | 6th toggle blocked | "Maximum 5 during onboarding. Add more from Habits tab later." |
| All 5 salah selected | Special acknowledgment | Counter shows "All 5 prayers selected" |

---

## 4. Home HUD

### Purpose
The crown jewel — a pixel art game world scene showing the player's level, XP, streaks, and today's snapshot. Full pixel immersion via Skia canvas.

### Entry Points
- Default tab on app open
- "Home" tab in tab bar
- Return from onboarding (first time)

### Layout
```
╔══════════════════════════════════╗
║ ┌────────────────────────────┐   ║
║ │                            │   ║
║ │     [PIXEL ART SCENE]     │   ║
║ │                            │   ║
║ │  Game world environment    │   ║
║ │  (Skia canvas rendering)  │   ║
║ │                            │   ║
║ │  Prayer-time lighting      │   ║
║ │  Ambient animations        │   ║
║ │                            │   ║
║ └────────────────────────────┘   ║
║                                  ║
║ ┌─ Level & XP ──────────────┐   ║
║ │ Lv.12 The Consistent       │   ║
║ │ ████████████░░░░  3,240 XP │   ║
║ │           → Level 13: 860  │   ║
║ └────────────────────────────┘   ║
║                                  ║
║ ┌─ Today ────────────────────┐   ║
║ │ Habits: 3/5 ✓              │   ║
║ │ Streak: 12 days 🔥         │   ║
║ │ Quests: 1 active           │   ║
║ └────────────────────────────┘   ║
║                                  ║
║ ┌─────┬────────┬───────┬─────┐   ║
║ │Home │ Habits │Quests │Prof.│   ║
║ └─────┴────────┴───────┴─────┘   ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Pixel art scene | Skia Canvas | Environment matching player level, prayer-time lighting |
| Level badge | Overlay text | "Lv.12" with current title |
| XP progress bar | Progress bar | Emerald fill, shows XP to next level |
| XP counter | Text | Current / required XP |
| Today's snapshot | Info card | Habits done, streak count, active quests |
| Tab bar | Navigation | 4 tabs, Home active |

### Interactions
- Tap pixel art scene: No action (decorative, not interactive in v1)
- Tap Today's snapshot: Navigate to Habits List
- Tap Quests count: Navigate to Quest Board
- Swipe down: Pull-to-refresh today's data
- Long press level badge: Show detailed level info tooltip

### Animations
- Scene: Continuous ambient (lantern flicker, water flow, particle effects — 60fps Skia)
- XP bar: Smooth fill animation when XP changes (300ms, ease-out)
- Habit counter: Number flip on completion (200ms)
- Streak counter: Pulse on increment (200ms, spring)
- Prayer-time transition: Smooth lighting shift when prayer window changes (2000ms, linear)

### Copy Examples
- Level: "Lv.12 The Consistent"
- XP: "3,240 XP → Level 13: 860 more"
- Today: "Habits: 3/5 completed"
- Streak: "12 days"
- Quests: "1 quest active"

### Edge States
| State | Display | Copy |
|-------|---------|------|
| First visit (post-onboarding) | Environment 1, Level 1 | "Level 1 — The Seeker. Your journey begins." |
| No habits completed today | Today card shows 0/N | "Today awaits your first action." |
| All habits completed | Today card fully green | "All habits complete. Well done." |
| Mercy Mode active | Subtle amber border on Today card | "Recovery quest available" link |
| Environment transition | New environment loads with transition | Brief "World Evolved" overlay (2 sec) |
| Offline | Normal display (all data is local) | No change — offline-first |
| Loading (rare) | Skeleton of Today card | Shimmer placeholder |
| Error | Today card shows stale data | "Last updated: [time]" |

---

## 5. Habits List

### Purpose
Daily checklist view of all active habits with completion status, streak counts, and time windows for salah.

### Entry Points
- "Habits" tab in tab bar
- Tap Today's snapshot on Home HUD

### Layout
```
╔══════════════════════════════════╗
║  Habits              [+ Add]    ║
║  Today, March 7                  ║
║                                  ║
║  MORNING                         ║
║  ┌──────────────────────────┐    ║
║  │ ✅ Fajr Prayer           │    ║
║  │    Streak: 12 days  +22XP│    ║
║  │    ✓ 5:42 AM             │    ║
║  └──────────────────────────┘    ║
║  ┌──────────────────────────┐    ║
║  │ ☐ Morning Adhkar         │    ║
║  │    Streak: 5 days   +15XP│    ║
║  │    Before Dhuhr          │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  AFTERNOON                       ║
║  ┌──────────────────────────┐    ║
║  │ ☐ Dhuhr Prayer           │    ║
║  │    Streak: 12 days  +22XP│    ║
║  │    12:15 - 3:30 PM       │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  ANYTIME                         ║
║  ┌──────────────────────────┐    ║
║  │ ☐ Quran Reading           │    ║
║  │    Streak: 8 days   +32XP│    ║
║  └──────────────────────────┘    ║
║                                  ║
║ ┌─────┬────────┬───────┬─────┐   ║
║ │Home │ Habits │Quests │Prof.│   ║
║ └─────┴────────┴───────┴─────┘   ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Header | Text + Button | "Habits" title, "+ Add" creates new habit |
| Date | Subtitle | Today's date |
| Time-of-day sections | Section headers | "MORNING", "AFTERNOON", "EVENING", "ANYTIME" |
| Habit cards | List items | Completion checkbox, name, streak, XP preview, time window |
| Add button | Icon button | Navigate to Habit Create screen |

### Interactions
- Tap checkbox: Complete habit → XP animation → streak increment
- Tap habit card (not checkbox): Navigate to Habit Detail
- Tap "+ Add": Navigate to Habit Create
- Long press habit: Show quick actions (pause, archive)
- Pull down: Refresh data (recheck prayer times)

### Animations
- Checkbox completion: Emerald fill + checkmark draw (200ms) + XP float-up (+XX XP, 500ms)
- Streak increment: Number flip (200ms)
- Completed card: Slight opacity reduction (0.7), moved to bottom of section
- New habit added: Slide in from top (200ms)

### Copy Examples
- Header: "Habits"
- Date: "Today, March 7"
- Completed habit: "✓ 5:42 AM" (timestamp of completion)
- Streak: "Streak: 12 days"
- XP preview: "+22 XP" (base × current multiplier)
- Time window: "12:15 - 3:30 PM" (for salah)
- Empty add: "No habits yet. Tap + to start building."

### Edge States
| State | Display | Copy |
|-------|---------|------|
| No habits | Empty state illustration | "Your habit list is empty. Tap + to add your first habit." |
| All completed | All cards checked, celebration header | "All done for today. Your discipline speaks." |
| Salah window expired | Time window shows "Expired" in ruby | "Window closed" (no shame, just factual) |
| Salah window active | Time window shows in emerald | "Active now" |
| Mercy Mode on habit | Amber indicator on habit card | "Recovery quest active" |
| Offline | Normal (all local) | No change |
| Loading | Shimmer placeholder cards | -- |

---

## 6. Habit Detail

### Purpose
Individual habit statistics — streak history as calendar heatmap, total completions, XP earned, and edit/archive actions.

### Entry Points
- Tap habit card on Habits List

### Layout
```
╔══════════════════════════════════╗
║  ← Back             [⋮ Menu]    ║
║                                  ║
║  Fajr Prayer                     ║
║  Streak: 12 days                 ║
║  Longest: 28 days                ║
║                                  ║
║  ┌──────────────────────────┐    ║
║  │  MARCH 2026               │    ║
║  │  M  T  W  T  F  S  S     │    ║
║  │  ■  ■  ■  ■  ■  □  □     │    ║
║  │  ■  ■  □  ■  ■  ■  □     │    ║
║  │  ...                      │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  Stats                           ║
║  ┌──────────┬───────────────┐    ║
║  │ Total    │ 156           │    ║
║  │ XP Earned│ 3,420 XP      │    ║
║  │ Multiplier│ 2.2x         │    ║
║  │ Best Week│ 7/7           │    ║
║  └──────────┴───────────────┘    ║
║                                  ║
║  Title Progress                  ║
║  Dawn Guardian: 12/40 Fajr       ║
║  ████████░░░░░░░░░░░░            ║
║                                  ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Back button | Navigation | Return to Habits List |
| Menu | Overflow menu | Edit, Pause, Archive options |
| Habit name | Heading | Habit display name |
| Streak info | Stats row | Current streak, longest streak |
| Calendar heatmap | Calendar grid | Green fill = completed, empty = missed, month scrollable |
| Stats grid | Key-value grid | Total completions, XP earned, current multiplier, best week |
| Title progress | Progress bar | Closest related title with progress |

### Interactions
- Tap menu: Show Edit / Pause / Archive options
- Swipe calendar: Navigate months
- Tap calendar day: Show completion time for that day (if completed)

### Animations
- Calendar: Smooth month transition (200ms, horizontal slide)
- Stats: Counter roll-up on first load (300ms)

### Copy Examples
- Current streak: "Streak: 12 days"
- Longest: "Longest: 28 days"
- Multiplier: "2.2x"
- Title progress: "Dawn Guardian: 12/40 consecutive Fajr"

### Edge States
| State | Display | Copy |
|-------|---------|------|
| New habit (no data) | Empty calendar, stats at 0 | "Complete your first check-in to start tracking." |
| Mercy Mode active | Amber banner at top | "Recovery in progress. 1/2 days complete." |
| Paused habit | Grey overlay, "Paused" badge | "This habit is paused. Streak frozen at 12 days." |
| Archived | Read-only view from archive | "Archived. Historical data preserved." |
| Offline | Normal display | No change |

---

## 7. Habit Create/Edit

### Purpose
Form for creating a new habit or editing an existing one.

### Entry Points
- "+ Add" on Habits List
- "Edit" from Habit Detail menu
- Onboarding custom habit (future)

### Layout
```
╔══════════════════════════════════╗
║  ← Cancel            Save       ║
║                                  ║
║  New Habit                       ║
║                                  ║
║  Name                            ║
║  ┌──────────────────────────┐    ║
║  │ [Enter habit name...]    │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  Or choose a preset:             ║
║  ┌──────────────────────────┐    ║
║  │ Fajr Prayer  │ Quran     │    ║
║  │ Dhikr        │ Fasting   │    ║
║  │ Tahajjud     │ Sadaqah   │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  Frequency                       ║
║  [Daily ▼] [Weekly ▼] [Custom]  ║
║                                  ║
║  Time Window (optional)          ║
║  ┌───────────┐  ┌───────────┐   ║
║  │ Start     │  │ End       │   ║
║  └───────────┘  └───────────┘   ║
║                                  ║
║  Difficulty                      ║
║  [Easy 10XP] [Med 15XP]         ║
║  [Hard 20XP] [Intense 25XP]     ║
║                                  ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Cancel | Button | Discard and return |
| Save | Button | Validate and save habit |
| Name input | Text field | 3-50 characters |
| Preset grid | Selection grid | Tapping preset fills name + defaults |
| Frequency picker | Segmented control | Daily, Weekly, Custom |
| Time window | Time pickers | Optional start/end times |
| Difficulty | Radio group | Easy/Medium/Hard/Intense with XP preview |

### Interactions
- Tap preset: Auto-fill name, frequency, time window, difficulty
- Edit any auto-filled field: Override preset values
- Tap Save: Validate (name 3-50 chars, frequency set), create habit, return to Habits List

### Copy Examples
- Title (create): "New Habit"
- Title (edit): "Edit Habit"
- Name placeholder: "Enter habit name..."
- Preset label: "Or choose a preset:"
- Difficulty labels: "Easy (10 XP)" / "Medium (15 XP)" / "Hard (20 XP)" / "Intense (25 XP)"
- Save: "Save Habit"

### Edge States
| State | Display | Copy |
|-------|---------|------|
| Name too short | Red border on name field | "Name must be at least 3 characters." |
| Name too long | Character counter shows limit | "50 character limit" |
| Max habits reached (20) | Save disabled | "You have 20 active habits. Pause or archive one to make room." |
| Edit mode | Pre-filled form, some fields locked | Frequency note: "Changing frequency will reset your streak." |
| Unsaved changes + cancel | Confirmation dialog | "Discard changes?" |
| Offline | Normal (local operation) | No change |

---

## 8. Quest Board

### Purpose
Display available quests — daily, weekly, and stretch challenges with progress tracking.

### Entry Points
- "Quests" tab in tab bar
- Tap quest count on Home HUD

### Layout
```
╔══════════════════════════════════╗
║  Quest Board                     ║
║                                  ║
║  DAILY QUESTS                    ║
║  ┌──────────────────────────┐    ║
║  │ Complete 3 habits today   │    ║
║  │ ████████░░░░  2/3         │    ║
║  │ +35 XP        Expires 12AM│    ║
║  └──────────────────────────┘    ║
║  ┌──────────────────────────┐    ║
║  │ ✓ Complete Fajr today     │    ║
║  │ ████████████  Done!       │    ║
║  │ +25 XP        ✓ Earned    │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  WEEKLY QUESTS                   ║
║  ┌──────────────────────────┐    ║
║  │ Maintain 7-day streak     │    ║
║  │ ██████░░░░░░  5/7         │    ║
║  │ +150 XP     Expires Sun   │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  STRETCH                         ║
║  ┌──────────────────────────┐    ║
║  │ All 5 salah every day     │    ║
║  │ ██░░░░░░░░░░  2/7 days    │    ║
║  │ +500 XP     Expires Sun   │    ║
║  └──────────────────────────┘    ║
║                                  ║
║ ┌─────┬────────┬───────┬─────┐   ║
║ │Home │ Habits │Quests │Prof.│   ║
║ └─────┴────────┴───────┴─────┘   ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Header | Text | "Quest Board" |
| Section headers | Text | "DAILY QUESTS", "WEEKLY QUESTS", "STRETCH" |
| Quest cards | List items | Description, progress bar, XP reward, expiry |
| Progress bar | Progress indicator | Emerald fill proportional to completion |
| Completed indicator | Badge | Checkmark + "Done!" on completed quests |

### Interactions
- Tap quest card: No action (quests auto-track, no "accept" step)
- Pull down: Refresh quest data
- Quests auto-complete when conditions met (toast notification)

### Animations
- Quest completion: Card border flashes gold, progress bar fills to 100% (300ms), "Done!" badge slides in
- New quests (Monday rotation): Cards slide in from right (staggered, 100ms apart)

### Copy Examples
- Section: "DAILY QUESTS"
- Quest: "Complete 3 habits today"
- Progress: "2/3"
- Reward: "+35 XP"
- Expiry: "Expires 12 AM"
- Completed: "Done!" / "+35 XP earned"

### Edge States
| State | Display | Copy |
|-------|---------|------|
| No habits created | Empty board | "Add habits in the Habit Forge to unlock quests." |
| All daily quests done | Daily section shows all checked | "All daily quests complete. Rest well." |
| All quests done | Full board completed | "Every challenge conquered this week." |
| Quest expired | Greyed out card | "Expired" — no shame copy |
| Recovery quest active | Amber-bordered card at top | "Recovery Quest" label |
| Monday rotation | New cards replace old | "New quests available" header |
| Offline | Normal display | No change |
| Loading | Shimmer placeholder cards | -- |

---

## 9. Profile

### Purpose
Player identity screen — current title, level, XP, streak statistics, and earned titles showcase.

### Entry Points
- "Profile" tab in tab bar

### Layout
```
╔══════════════════════════════════╗
║  Profile               [⚙]      ║
║                                  ║
║     [Pixel Character Avatar]     ║
║                                  ║
║     ✦ The Consistent ✦          ║
║     Level 12                     ║
║     ████████████░░░░ 3,240 XP    ║
║                                  ║
║  ┌────────┬────────┬────────┐    ║
║  │ 12 day │ 156    │ 8      │    ║
║  │ streak │ habits │ titles │    ║
║  └────────┴────────┴────────┘    ║
║                                  ║
║  Earned Titles                   ║
║  ┌──────────────────────────┐    ║
║  │ [Seeker] [Newcomer]      │    ║
║  │ [Builder] [Consistent]   │    ║
║  │ [Awakening] [Dedicated]  │    ║
║  │ [Early Riser] [Reciter]  │    ║
║  │         View All →        │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  This Week                       ║
║  ┌──────────────────────────┐    ║
║  │ Active: 5/7 days          │    ║
║  │ XP Earned: 1,420          │    ║
║  │ Quests: 4 completed       │    ║
║  └──────────────────────────┘    ║
║                                  ║
║ ┌─────┬────────┬───────┬─────┐   ║
║ │Home │ Habits │Quests │Prof.│   ║
║ └─────┴────────┴───────┴─────┘   ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Settings gear | Icon button | Navigate to Settings |
| Avatar | Pixel art image | Player character, matches HUD |
| Title display | Text (styled by rarity) | Current active title with rarity glow |
| Level + XP | Progress bar + text | Current level, XP bar, XP count |
| Stats row | 3-column grid | Streak days, total habits, titles earned |
| Earned titles | Grid | Title badges, tap to view gallery |
| Weekly summary | Info card | Days active, XP earned, quests completed |

### Interactions
- Tap settings gear: Navigate to Settings
- Tap title: Navigate to Titles Gallery (can change active title)
- Tap "View All" on titles: Navigate to Titles Gallery
- Tap stats: No action (informational)

### Animations
- XP bar: Smooth fill on load (300ms)
- Title badges: Subtle glow pulse matching rarity color (continuous, subtle)
- Stats: Counter roll-up on first load (300ms)

### Copy Examples
- Title: "The Consistent" (with rarity styling)
- Level: "Level 12"
- Stats: "12 day streak" / "156 habits completed" / "8 titles earned"
- Weekly: "Active: 5 of 7 days this week"

### Edge States
| State | Display | Copy |
|-------|---------|------|
| New player | Level 1, "The Seeker", empty titles | "Your journey has begun." |
| No titles | Empty titles section | "Complete habits to earn your first title." |
| All titles earned | Full grid, special badge | "Every title earned. Remarkable." |
| Offline | Normal display | No change |
| Loading | Shimmer placeholders | -- |

---

## 10. Settings

### Purpose
App preferences — notifications, prayer calculation method, privacy controls, data management.

### Entry Points
- Settings gear on Profile screen

### Layout
```
╔══════════════════════════════════╗
║  ← Back    Settings              ║
║                                  ║
║  NOTIFICATIONS                   ║
║  ┌──────────────────────────┐    ║
║  │ Prayer Reminders    [ON] │    ║
║  │ Muhasabah Reminder  [ON] │    ║
║  │ Quest Expiry        [OFF]│    ║
║  │ Title Progress      [ON] │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  PRAYER TIMES                    ║
║  ┌──────────────────────────┐    ║
║  │ Calculation Method  [ISNA]│    ║
║  │ Location      [Auto GPS] │    ║
║  │ Isha End Time [Midnight] │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  APPEARANCE                      ║
║  ┌──────────────────────────┐    ║
║  │ Dark Mode         [Auto] │    ║
║  │ Sound Effects      [ON]  │    ║
║  │ Haptic Feedback    [ON]  │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  PRIVACY & DATA                  ║
║  ┌──────────────────────────┐    ║
║  │ Export My Data        →  │    ║
║  │ Delete Muhasabah Data →  │    ║
║  │ Delete All Data       →  │    ║
║  └──────────────────────────┘    ║
║                                  ║
║  About HalalHabits  v1.0        ║
║                                  ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Section headers | Text | "NOTIFICATIONS", "PRAYER TIMES", etc. |
| Toggle rows | Switch row | Label + on/off toggle |
| Picker rows | Selection row | Label + current value, tap to change |
| Action rows | Button row | Label + arrow, tap for action |

### Interactions
- Tap toggle: Flip setting (instant save)
- Tap calculation method: Show picker (ISNA, MWL, Egyptian, Umm al-Qura, etc.)
- Tap Export: Generate and share data file
- Tap Delete actions: Confirmation dialog before destructive action

### Copy Examples
- Delete confirmation: "This will permanently delete all your data including habits, streaks, and XP. This cannot be undone."
- Export: "Your data will be exported as a file you can save."

### Edge States
| State | Display | Copy |
|-------|---------|------|
| Location permission denied | Manual city entry | "Set your city for prayer times" |
| Export in progress | Loading spinner | "Preparing your data..." |
| Delete confirmation | Alert dialog | "Are you sure? This cannot be undone." |
| Offline | Normal (all settings local) | No change |

---

## 11. Muhasabah

### Purpose
Nightly reflection ritual — 2-3 card-based prompts, 30-60 seconds, always skippable, deeply private.

### Entry Points
- Evening notification tap
- Muhasabah tab/entry from Home HUD (if added)
- Manual navigation

### Layout
```
╔══════════════════════════════════╗
║                         [Skip]   ║
║                                  ║
║     Muhasabah                    ║
║     A moment of reflection       ║
║                                  ║
║  ┌──────────────────────────┐    ║
║  │                          │    ║
║  │  "What went well today?" │    ║
║  │                          │    ║
║  │  [Fajr ✓] [Quran ✓]     │    ║
║  │  [Dhikr ✓]               │    ║
║  │                          │    ║
║  │  Or type:                │    ║
║  │  ┌──────────────────┐   │    ║
║  │  │                  │   │    ║
║  │  └──────────────────┘   │    ║
║  │                          │    ║
║  └──────────────────────────┘    ║
║                                  ║
║          1 / 3                   ║
║                                  ║
║  ┌────────────────────────┐      ║
║  │        Next              │      ║
║  └────────────────────────┘      ║
║                                  ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Skip button | Text button | Always visible top-right, dismisses Muhasabah |
| Title | Text | "Muhasabah" |
| Subtitle | Text | "A moment of reflection" |
| Prompt card | Card | Question + response options |
| Tap options | Chip selection | Today's completed habits as tappable chips |
| Text input | Text field | Optional free-text (140 char max) |
| Progress dots | Indicator | "1 / 3" |
| Next/Complete | Primary button | Advance to next prompt or complete |

### Interactions
- Tap chip: Select response
- Tap Next: Advance to next prompt
- Tap Complete (on last prompt): Save responses (PRIVATE), award 10 XP, show summary
- Tap Skip: Dismiss with no penalty, no follow-up

### Animations
- Card transition: Horizontal slide between prompts (200ms, ease-out)
- Completion: Gentle emerald glow + "+10 XP" (300ms)
- No celebratory animations — this screen is quiet

### Copy Examples
- Prompt 1: "What went well today?"
- Prompt 2: "What is one thing you would improve?"
- Prompt 3: "Set one intention for tomorrow."
- Skip: "Not tonight? That is okay. See you tomorrow."
- Complete: "Reflection complete. +10 XP"

### Edge States
| State | Display | Copy |
|-------|---------|------|
| Already completed today | Summary of responses | "Reflection complete for today." |
| No habits completed today | Alternate prompts | "Today was quiet. What is one small step for tomorrow?" |
| First Muhasabah | Brief intro card first | "Muhasabah is the practice of reflecting on your day. This takes 30 seconds." |
| Offline | Normal (all private/local) | No change |
| Skip | Immediate dismiss | "Not tonight? That is okay." |

---

## 12. Mercy Mode Overlay

### Purpose
Compassionate recovery prompt that appears on streak break. NOT a separate screen — an overlay/modal on the current screen.

### Entry Points
- Auto-appears on first app open after a streak break
- Dismissable, re-accessible from Home HUD indicator

### Layout
```
╔══════════════════════════════════╗
║                                  ║
║  ┌──────────────────────────┐    ║
║  │                     [✕]  │    ║
║  │                          │    ║
║  │  [Pixel art: open door]  │    ║
║  │                          │    ║
║  │  "The door of tawbah     │    ║
║  │   is always open."       │    ║
║  │                          │    ║
║  │  Your Fajr streak paused.│    ║
║  │  A recovery path awaits. │    ║
║  │                          │    ║
║  │  Recovery Quest:          │    ║
║  │  "Complete Fajr 2 of the │    ║
║  │   next 3 days"           │    ║
║  │  Reward: +50 XP          │    ║
║  │                          │    ║
║  │  ┌────────────────────┐  │    ║
║  │  │  Begin Recovery     │  │    ║
║  │  └────────────────────┘  │    ║
║  │                          │    ║
║  │  [Not now]               │    ║
║  │                          │    ║
║  └──────────────────────────┘    ║
║                                  ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Close button | Icon (✕) | Dismiss overlay |
| Illustration | Pixel art | Open door motif — welcoming, not alarming |
| Mercy message | Text | Compassionate Islamic wisdom + game action |
| Streak info | Text | Which streak broke (no shame framing) |
| Recovery quest | Card | Quest description + reward |
| Begin Recovery | Primary button | Accept quest, add to Quest Board |
| Not now | Text link | Dismiss, quest remains available |

### Interactions
- Tap Begin Recovery: Quest added to Quest Board, overlay dismisses
- Tap Not now: Overlay dismisses, quest remains accessible from Quest Board
- Tap close (✕): Same as "Not now"
- Overlay does NOT block app usage — it's dismissable immediately

### Animations
- Overlay: Slide up from bottom (300ms, ease-out) with background dim
- Door illustration: Subtle glow/pulse (continuous)
- Dismiss: Slide down (200ms, ease-in)

### Copy Examples
- Message: "The door of tawbah is always open. Recovery quest unlocked — rebuild your momentum."
- Streak info: "Your Fajr streak paused." (NOT "broke" or "lost" or "reset")
- Quest: "Complete Fajr 2 of the next 3 days"
- Reward: "+50 XP recovery bonus"
- CTA: "Begin Recovery"
- Dismiss: "Not now"

### Edge States
| State | Display | Copy |
|-------|---------|------|
| Single habit break | One recovery quest | Specific to broken habit |
| Multiple habits broken | Multiple quests listed | "A few habits paused. Recovery quests ready." |
| First-ever break | Extra compassionate | "Rest is part of the journey, not the end of it." |
| Recovery already in progress | Progress shown | "Recovery in progress: 1/2 days" |
| Returning after long absence | Gentle welcome | "Welcome back. Your recovery quest is here." |

---

## 13. Level Up Celebration

### Purpose
Full-screen celebration modal when the player reaches a new level.

### Entry Points
- Triggers automatically when XP crosses level threshold

### Layout
```
╔══════════════════════════════════╗
║                                  ║
║                                  ║
║        ★  LEVEL 10  ★           ║
║                                  ║
║     [Particle burst animation]   ║
║                                  ║
║     "Your discipline speaks      ║
║      for itself."                ║
║                                  ║
║     Unlocked:                    ║
║     ┌────────────────────────┐   ║
║     │ 🏔 New Environment      │   ║
║     │ 🏷 "The Dedicated"      │   ║
║     └────────────────────────┘   ║
║                                  ║
║     ┌────────────────────────┐   ║
║     │      Continue           │   ║
║     └────────────────────────┘   ║
║                                  ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Level number | Large text | New level with star decorations |
| Particle burst | Animation | Jewel-tone particles burst outward |
| Celebration copy | Text | Level-specific wise mentor message |
| Unlocks list | Card list | Any titles, environments, or features unlocked |
| Continue button | Primary button | Dismiss, return to previous screen |

### Interactions
- Tap Continue: Dismiss modal
- If title unlocked: Title Unlock modal chains next
- Tap anywhere (not button): No action (prevent accidental dismiss)

### Animations
- Entry: Scale from center (0→1, 500ms, spring)
- Particles: Burst outward in jewel tones (800ms)
- Level number: Counter roll-up animation (300ms)
- Haptic: Triple tap pattern (light-medium-heavy)

### Copy Examples
- Level 5: "Something stirs. The path is becoming clear."
- Level 10: "Your discipline speaks for itself."
- Level 20: "Twenty levels. Consistency has a name."
- Level 50: "Fifty levels of endurance. SubhanAllah."

### Edge States
| State | Display | Copy |
|-------|---------|------|
| Level with no unlocks | No "Unlocked" section | Just level + celebration copy |
| Level with environment | Environment preview | "Your world has evolved" |
| Level with title | Title card | Shows title + "Equip?" |
| Multiple unlocks | Stacked unlock cards | Each unlock listed |
| Offline | Normal (all local) | No change |

---

## 14. Title Unlock

### Purpose
Celebration modal when the player earns a new Identity Title.

### Entry Points
- Automatic trigger on title condition met
- Chains after Level Up modal if both trigger simultaneously

### Layout
```
╔══════════════════════════════════╗
║                                  ║
║                                  ║
║     ✦ The Steadfast ✦           ║
║         [RARE]                   ║
║                                  ║
║   [Rarity particle animation]    ║
║                                  ║
║   "Forty dawns — a number of     ║
║    transformation. You are       ║
║    steadfast."                   ║
║                                  ║
║   ┌────────────────────────┐     ║
║   │     Equip Title         │     ║
║   └────────────────────────┘     ║
║                                  ║
║   [Keep current title]           ║
║                                  ║
╚══════════════════════════════════╝
```

### Components
| Component | Type | Behavior |
|-----------|------|----------|
| Title name | Large text | Title with decorative markers |
| Rarity badge | Badge | Common (emerald), Rare (sapphire), Legendary (gold) |
| Particle animation | Animation | Color matches rarity |
| Flavor text | Text | Title-specific flavor text from worldbuilding |
| Equip button | Primary button | Set as active title, dismiss |
| Keep current | Text link | Add to collection without equipping |

### Interactions
- Tap Equip: Set as active title, dismiss modal
- Tap Keep current: Save to collection, keep existing title, dismiss

### Animations
- Entry: Fade in with rarity-colored glow (500ms)
- Rarity particles: Common (emerald sparkle), Rare (sapphire shimmer), Legendary (gold burst with glow)
- Haptic: Long buzz for Legendary, medium for Rare, single tap for Common

### Edge States
| State | Display | Copy |
|-------|---------|------|
| First title ever | Extra intro | "Your first title. Wear it with intention." |
| Legendary title | Extra celebration | More elaborate particles, longer animation |
| Chained after level up | Smooth transition | Slide in after level up dismisses |

---

*Section 7 of 16 · HalalHabits: Ferrari 16-Bit Edition Master Blueprint*
