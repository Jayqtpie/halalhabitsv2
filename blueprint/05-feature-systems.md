# 05 - Feature Systems Detailed Specs

> **Section:** BLUE-05 | **Status:** v1 Complete
> **Cross-references:** [03 - Game Design Bible](./03-game-design-bible.md) | [04 - Worldbuilding](./04-worldbuilding.md) | [06 - Information Architecture](./06-information-architecture.md) | [07 - Screen Specs](./07-screen-specs.md)

---

## V1 Feature Systems

These six features ship in v1. Each is fully specced with purpose, rules, states, transitions, edge cases, and copy tone.

---

### 1. Habit Forge

**Purpose:** The habit creation and management system. Players build their discipline practice by selecting from preset Islamic habits or creating custom ones. The Habit Forge is the foundation of all XP, streaks, and progression -- every other system feeds from it.

#### Preset Islamic Habits Library

All presets come with sensible defaults. Players can modify frequency and time window after creation.

| Preset Habit | Category | Default Frequency | Base XP | Time Window |
|-------------|----------|-------------------|---------|-------------|
| Fajr Prayer | Salah | Daily | 15 XP | Fajr adhan to sunrise |
| Dhuhr Prayer | Salah | Daily | 15 XP | Dhuhr adhan to Asr adhan |
| Asr Prayer | Salah | Daily | 15 XP | Asr adhan to Maghrib adhan |
| Maghrib Prayer | Salah | Daily | 15 XP | Maghrib adhan to Isha adhan |
| Isha Prayer | Salah | Daily | 15 XP | Isha adhan to midnight |
| Quran Reading | Worship | Daily | 20 XP | None (anytime) |
| Morning Adhkar | Dhikr | Daily | 10 XP | Fajr to Dhuhr |
| Evening Adhkar | Dhikr | Daily | 10 XP | Asr to Isha |
| General Dhikr | Dhikr | Daily | 10 XP | None (anytime) |
| Voluntary Fasting | Fasting | Weekly (Mon/Thu) | 25 XP | Fajr to Maghrib |
| Dua After Salah | Worship | Daily | 10 XP | None (anytime) |
| Tahajjud / Qiyam al-Layl | Salah | Daily | 20 XP | Last third of night to Fajr |
| Sadaqah / Charity | Character | Weekly | 15 XP | None (anytime) |
| Surah Al-Kahf (Friday) | Worship | Weekly (Friday) | 20 XP | Friday (all day) |
| Istighfar (100x) | Dhikr | Daily | 10 XP | None (anytime) |

**Custom habit creation rules:**
- **Name:** 3-50 characters, no profanity filter (trust the user), trimmed whitespace
- **Frequency:** Daily, Weekly (select days), or Custom (X times per Y days)
- **Time window:** Optional start/end times. If set, completion only counts within the window. If not set, anytime counts.
- **Difficulty tier:** Easy (10 XP), Medium (15 XP), Hard (20 XP), Intense (25 XP) -- player selects based on personal assessment
- **Category:** Player assigns to Salah, Worship, Dhikr, Fasting, Character, or Custom
- **Icon:** Selected from a preset icon library (pixel art icons)

#### Habit States and Transitions

```
[created] --> [active] --> [paused] --> [active] (resume)
                |                          |
                v                          v
            [archived] <-----------  [archived]
                |
                v
            [deleted] (permanent, after 30-day archive)
```

| State | Description | Visible in | Earns XP | Streak Active |
|-------|------------|------------|----------|---------------|
| Active | Currently tracked, appears in daily list | Daily habits list | Yes | Yes |
| Paused | Temporarily suspended by user | Paused habits section | No | Frozen (streak preserved, not counting) |
| Archived | No longer active, historical data preserved | Archive in settings | No | Stopped |
| Deleted | Permanently removed after 30 days in archive | Nowhere | No | Destroyed |

#### Edit Rules

| Field | Editable Mid-Streak | Streak Impact |
|-------|-------------------|---------------|
| Name | Yes | None |
| Frequency | Yes, but changing frequency resets streak | Streak resets to 0 |
| Time window | Yes (widening preserves, narrowing resets) | Preserves if wider, resets if narrower |
| Difficulty tier / XP | No (locked after first completion) | N/A |
| Category | Yes | None |
| Icon | Yes | None |

#### Edge Cases

| Edge Case | Behavior |
|-----------|----------|
| Duplicate habit name | Allowed -- players may have "Quran Reading" custom alongside the preset. Different habits can share names. |
| Maximum habit limit | 20 active habits. Attempting to create a 21st shows: "You have 20 active habits. Pause or archive one to make room." No shame, just clarity. |
| Reactivate archived habit | Habit returns to Active state with streak reset to 0. Historical completion data is preserved. |
| Pause during active streak | Streak is frozen at current count. When resumed, the streak continues from the frozen count. No penalty for pausing. |
| Complete habit multiple times in one day | Only one completion per frequency period. Second tap shows: "Already completed for today. Your consistency is noted." |
| Habit with time window -- completed outside window | Completion does not count. Copy: "This habit's time window is [X] to [Y]. You can complete it during that window." |
| All 5 salah presets added at once | Allowed and encouraged during onboarding. Each is independent with its own streak. |

**Copy tone:** Functional and encouraging. The Habit Forge is a tool, not a personality. Copy is clear, concise, and uses the wise mentor voice only for milestone moments ("Your third habit. The forge is heating up.").

---

### 2. Quest Board

**Purpose:** A daily and weekly challenge system that provides variety, short-term goals, and bonus XP beyond regular habit completions. Quests prevent the daily routine from feeling monotonous by introducing achievable micro-challenges.

#### Quest Types

| Type | Difficulty | XP Reward | Duration | Slots Available |
|------|-----------|-----------|----------|----------------|
| Daily Quest | Easy | 25-50 XP | Expires at midnight local time | 3 per day |
| Weekly Quest | Medium | 100-200 XP | Expires Sunday midnight local time | 2 per week |
| Stretch Quest | Hard | 300-500 XP | Expires Sunday midnight local time | 1 per week |

#### Quest Examples

**Daily Quests (25-50 XP):**
- "Complete all 5 salah today" (50 XP)
- "Complete 3 habits before Dhuhr" (30 XP)
- "Complete your Quran reading and dhikr today" (35 XP)
- "Check in your first habit before 9 AM" (25 XP)
- "Complete Muhasabah tonight" (25 XP)

**Weekly Quests (100-200 XP):**
- "Maintain a 7-day streak on any habit" (150 XP)
- "Complete all daily quests for 5 out of 7 days" (200 XP)
- "Log 20 total habit completions this week" (100 XP)
- "Complete Fajr prayer 5 days this week" (150 XP)
- "Complete Muhasabah 5 nights this week" (125 XP)

**Stretch Quests (300-500 XP):**
- "Complete 50 total habit check-ins this week" (500 XP)
- "Maintain streaks on 5 habits simultaneously for the full week" (400 XP)
- "Complete all 5 salah every day for a full week" (500 XP)
- "Complete every daily quest this week" (350 XP)

#### Quest Rotation and Generation

Quests are generated from a template pool, not randomly. The system:
1. Selects quests relevant to the player's active habits (no quests for habits the player does not have)
2. Avoids repeating the same quest template within 7 days
3. Ensures at least one quest per day is easily achievable (25-30 XP range) to maintain engagement
4. Scales quest difficulty with player level (higher-level players get slightly harder variants)
5. Never generates quests that are impossible given the player's current habit set

#### Quest States and Transitions

```
[available] --> [in-progress] --> [completed]
                    |
                    v
                [expired]
```

| State | Description | Display |
|-------|------------|---------|
| Available | Quest is on the board, not yet started | Shows on Quest Board with requirements and reward |
| In-Progress | Player has made partial progress (auto-detected from habit completions) | Progress bar shows completion percentage |
| Completed | All quest conditions met | Celebration animation, XP awarded, marked with checkmark |
| Expired | Time window passed without completion | Greyed out, "Expired" label, no penalty copy |

**Note:** Quests auto-track progress. The player does not "accept" a quest -- they simply complete habits and the quest board reflects their progress. This removes friction.

#### Edge Cases

| Edge Case | Behavior |
|-----------|----------|
| Quest expires mid-progress | Quest moves to "expired" state. No penalty, no shame copy. The board simply refreshes with new quests. Copy: "New challenges await." |
| All daily quests completed early (e.g., by noon) | Board shows "All daily quests complete!" with encouraging copy: "Your discipline outpaced the day. Rest well." No new daily quests until tomorrow. |
| All weekly quests completed early | Board shows weekly complete state. No new weekly quests until next week. |
| Timezone boundary (midnight) | Quests expire at midnight in the player's local timezone. If player completes at 11:59 PM, it counts. If they complete at 12:01 AM, it counts toward the next day's quests. |
| Player has no active habits | Quest Board shows empty state: "Add a habit in the Habit Forge to unlock quests." No quests generated. |
| Player pauses a habit mid-quest | If the quest depends on the paused habit, quest becomes unachievable. It does not auto-expire -- it remains until its time window closes naturally. |

**Copy tone:** Energetic but grounded. Quests use action-oriented language: "Complete," "Maintain," "Log." Completion copy uses the wise mentor voice: "Your dedication today has earned this." Never: "You crushed it!" or "Amazing performance!"

---

### 3. Salah Streak Shield

**Purpose:** A prayer-time-aware streak protection system that accounts for the unique nature of Islamic prayer. Unlike generic habit streaks, the Salah Streak Shield understands that each prayer has a specific window (from adhan-js calculations) and that completing salah within its window is the meaningful action.

#### How It Works

1. Each of the 5 daily salah has its own individual streak counter
2. Prayer time windows are calculated locally using the `adhan-js` library based on the player's location and selected calculation method (ISNA, MWL, Egyptian, Umm al-Qura, etc.)
3. Completing a salah habit within its time window increments that salah's streak by 1
4. The "shield" protects the streak: as long as the player completes within the window, the streak continues
5. Missing a salah window breaks ONLY that specific salah's streak -- other salah streaks are unaffected
6. There is also an "Overall Salah Streak" that counts consecutive days where all 5 prayers were completed within their windows

#### Streak Rules

| Rule | Description |
|------|-------------|
| Window start | Adhan time for that prayer (calculated by adhan-js) |
| Window end | Adhan time for the next prayer (Isha ends at midnight or last third of night, configurable) |
| Completion method | Single tap on the salah habit within the window |
| Late completion | Completing after the window closes does NOT count for streak (but still earns base XP as a makeup prayer) |
| Early completion | Cannot complete before the window opens |
| Multiple taps | Only one completion per window per salah |

#### Integration with adhan-js

- Player grants location permission (or manually sets city/coordinates)
- Player selects calculation method during onboarding (default: auto-detect based on region)
- Prayer times recalculated daily at midnight local time
- Times displayed in local 12-hour or 24-hour format (user preference)
- Isha end time configurable: midnight (default), last third of night, or Fajr adhan

#### Edge Cases

| Edge Case | Behavior |
|-----------|----------|
| Travel (shortened prayers) | App does not differentiate between full and shortened prayers. A tap is a tap. The player's intention and honesty are trusted. |
| Timezone change (travel) | Prayer times recalculate based on current device location. Streaks are not broken by timezone changes -- the system checks completion against the local prayer window at the time of completion. |
| Missing one salah but completing the other four | Only the missed salah's individual streak resets. The other four continue. Overall Salah Streak resets (since not all 5 were completed). |
| Fajr streak and oversleeping | If the Fajr window passes without completion, the Fajr streak resets. Mercy Mode may activate (see below). No shame copy. |
| Location permission denied | Player can manually set location (city search or coordinates). Prayer times still calculate correctly. |
| Player in extreme latitude (polar regions) | Adhan-js handles high-latitude methods. App surfaces the calculated times without modification. If times are unusual, no special handling -- the library manages it. |
| Clock manipulation | The app uses device time. If a player manipulates their clock to cheat, the app does not detect or prevent this. The player's discipline is their own. We do not build an adversarial system. |

**Copy tone:** Salah streaks use reverent, simple language. "Fajr: 14 days." No exclamation marks on prayer streaks. Milestone copy is warm: "Forty dawns. Your consistency speaks." On streak break: no copy at all for the break itself -- Mercy Mode handles recovery messaging.

---

### 4. Mercy Mode

**Purpose:** A compassionate recovery system that activates when a habit streak breaks. Mercy Mode reframes failure as a natural part of discipline, provides a structured recovery path, and rewards the player for returning -- not punishes them for leaving. This is a core philosophical pillar of HalalHabits: recovery is always available, shame is never present.

**Design principle:** "Mercy Mode ships WITH streaks (same phase, never separate)." Streaks and recovery are two sides of the same system.

#### Trigger Conditions

Mercy Mode activates when:
- A daily habit has zero completions for 1 full day (the frequency window passes with no check-in)
- A weekly habit has zero completions for its full frequency window
- A custom-frequency habit misses its defined completion window

Mercy Mode does NOT activate when:
- A habit is paused (pausing freezes streaks, no break occurs)
- A habit is archived
- The player completes a habit late (late completions still earn XP, just not streak credit)

#### Recovery Quest Generation

When Mercy Mode activates for a habit:
1. A recovery quest is automatically generated, tailored to the broken habit
2. The recovery quest is achievable in 2-3 days (not punishing, not trivial)
3. Only one recovery quest per broken habit at a time

**Recovery quest examples:**
- Fajr streak broken: "Rise Again -- Complete Fajr prayer 2 out of the next 3 days"
- Quran reading streak broken: "Return to the Book -- Complete Quran reading 2 days in a row"
- General habit broken: "Rebuild -- Complete [habit name] 3 times in the next 4 days"

#### Recovery Rewards

| Reward | Description |
|--------|-------------|
| Partial streak credit | Streak restarts at 25% of the pre-break streak (rounded down, minimum 1). E.g., a 20-day streak that breaks and recovers restarts at 5. |
| Recovery XP bonus | 50 XP bonus on recovery quest completion (on top of normal habit XP) |
| Title progress | Recovery completions count toward title progress (e.g., "The Resilient" title requires 3 successful recoveries) |

#### Mercy Mode Messages (5+ Examples)

These messages appear when Mercy Mode activates. They blend brief Islamic wisdom with game recovery action. The tone is warm, never disappointed, never shaming.

1. **"The door of tawbah (returning) is always open. Recovery quest unlocked -- rebuild your momentum."**

2. **"Every sunrise is a fresh start. Your streak paused, but your journey did not. A recovery path is ready for you."**

3. **"The Prophet (peace be upon him) said the most beloved deeds to Allah are the most consistent, even if small. Start small. A recovery quest awaits."**

4. **"Discipline is not perfection -- it is returning. You are here now, and that matters. Your recovery quest is ready."**

5. **"A tree does not stop growing because one leaf falls. Your roots are strong. Recovery quest unlocked."**

6. **"Missing a day does not erase the days you showed up. Your effort stands. Let us rebuild together."**

7. **"The strongest among us are not those who never fall, but those who rise every time. Recovery quest activated."**

#### States and Transitions

```
[inactive] --> streak breaks --> [active]
                                    |
                                    v
                            [recovery-in-progress]
                                    |
                           +--------+--------+
                           |                 |
                           v                 v
                     [recovered]      [recovery-failed]
                           |                 |
                           v                 v
                     [inactive]        [active] (new recovery quest generated)
```

| State | Description | Display |
|-------|------------|---------|
| Inactive | No broken streaks, Mercy Mode is dormant | Not visible |
| Active | Streak just broke, Mercy Mode has activated | Notification with Mercy Mode message, recovery quest appears |
| Recovery-in-progress | Player is working on the recovery quest | Progress indicator on the habit, recovery quest on Quest Board |
| Recovered | Recovery quest completed successfully | Celebration moment, streak credit restored, "Recovered" badge on habit |
| Recovery-failed | Recovery quest expired without completion | New recovery quest generated (slightly easier), encouraging message |

#### Edge Cases

| Edge Case | Behavior |
|-----------|----------|
| Multiple habits break simultaneously | Each habit gets its own independent Mercy Mode instance and recovery quest. The player sees all recovery quests at once but can tackle them in any order. |
| Recovery quest fails (expires) | A new, slightly easier recovery quest is generated. Copy: "No rush. A new path is ready when you are." Maximum 3 consecutive failed recoveries before Mercy Mode simply stays active without generating new quests (the player can restart anytime by completing the habit once). |
| Player ignores Mercy Mode for days | Mercy Mode stays active indefinitely. It does not escalate, nag, or send guilt notifications. When the player returns, the recovery quest is waiting. Copy on return: "Welcome back. Your recovery quest is here." |
| Mercy Mode active + new streak forming | If the player starts completing the habit again (even without finishing the recovery quest), the new streak counts. The recovery quest can still be completed for the bonus XP and partial streak credit, which gets added to the new streak. |
| Player has paused habit, then unpauses after missing time | No Mercy Mode activation. Paused habits do not trigger streak breaks. On unpause, streak resumes from frozen count. |
| Mercy Mode for a weekly habit | Recovery quest window is 7-10 days (proportional to the habit's frequency). Same recovery mechanics, just longer window. |

**Copy tone:** The warmest, most compassionate voice in the entire app. Mercy Mode copy is the single most important copy in HalalHabits. Every message must pass this test: "Would a kind, wise mentor say this to someone who missed a day?" If the answer is no, it does not ship.

---

### 5. Identity Titles

**Purpose:** An achievement and identity system that gives players a visible marker of their discipline journey. Titles are not just badges -- they are identity statements that the player chooses to display, representing who they are becoming through consistent effort.

**Full title table:** See [04 - Worldbuilding](./04-worldbuilding.md#identity-titles) for the complete list of 26 titles across Common, Rare, and Legendary tiers.

#### Display Rules

- **Profile:** Current title displayed prominently below player name
- **HUD:** Title shown in a compact badge on the Home HUD (e.g., "Lv. 23 -- The Steadfast")
- **Title selection:** Player chooses which earned title to display. Defaults to most recently earned.
- **Unearned titles:** Visible in a "Titles" gallery with locked state showing unlock condition and progress

#### Title Unlock Flow

1. Player meets unlock condition (tracked automatically from habit, streak, quest, and level data)
2. System detects unlock condition met
3. **Unlock notification:** Full-screen celebration moment with:
   - Title name in large text with rarity glow effect (Common: emerald, Rare: sapphire, Legendary: gold)
   - Flavor text displayed below
   - Particle effect (jewel-tone colored, matching rarity)
   - Copy: "New title earned: [Title Name]"
   - Option to equip immediately or dismiss
4. Title added to player's earned collection
5. If player has title notifications enabled, a push notification is also sent (for titles earned while app is backgrounded, e.g., a streak milestone crossing midnight)

#### Title Progress Tracking

For titles with numeric unlock conditions, the app shows progress:
- "The Steadfast: 28/40 consecutive Fajr prayers" (progress bar)
- "The Unbreakable: 67/100 consecutive days" (progress bar)
- Progress is visible in the Titles gallery for each locked title
- No progress tracking for level-based titles (level progress is already visible on HUD)
- Closest-to-unlock title is highlighted: "You are 12 days away from The Steadfast"

#### Edge Cases

| Edge Case | Behavior |
|-----------|----------|
| Streak breaks while close to title | Progress resets to current streak count. If Fajr streak was 38/40 and breaks, it resets to 0/40. Mercy Mode recovery does not restore title progress (only streak credit). |
| Multiple titles unlocked simultaneously | Each gets its own celebration screen, shown sequentially. Rare + Legendary titles get priority display order. |
| Player earns title while app is closed | Title is awarded on next app open. Celebration screen plays immediately on launch. |
| All titles earned | Gallery shows "All titles earned" state with special copy: "You have earned every mark of discipline this journey offers. Wear them with quiet pride." |

**Copy tone:** Title copy uses the wise mentor voice at its most impactful. Title names use a mix of English descriptive names and Arabic honorifics (with inline translation). Flavor text is poetic but grounded -- never corny, never over-the-top.

---

### 6. Muhasabah (Nightly Reflection)

**Purpose:** A brief, structured nightly reflection ritual. Muhasabah means "self-accounting" in Arabic -- the practice of reviewing one's day with honesty and setting intention for tomorrow. In HalalHabits, this is a 30-60 second guided reflection, not journaling. It is always optional, always private, and always gentle.

#### Prompt Structure

Each Muhasabah session presents 2-3 short prompts. The player taps a response option or types a brief note (1-2 sentences max, not a journal entry).

**Standard prompts (rotate nightly, 3 shown per session):**

| Prompt | Response Format | Purpose |
|--------|----------------|---------|
| "What went well today?" | Tap from today's completions or type brief note | Gratitude and acknowledgment |
| "What is one thing you would improve?" | Tap a preset option or type brief note | Honest self-assessment without shame |
| "Set one intention for tomorrow" | Tap a suggested intention or type custom | Forward-looking commitment |
| "Which habit felt most meaningful today?" | Tap from today's completed habits | Mindfulness about purpose |
| "How would you describe your energy today?" | Tap from 3 options: Strong / Steady / Low | Self-awareness check |
| "Is there someone you want to make dua for tonight?" | Type a name (stored locally, never synced) | Spiritual connection |

**Prompt rotation:** The system selects 2-3 prompts per night, avoiding repeats within a 3-day window. "Set one intention for tomorrow" appears every session (always the last prompt).

#### Duration and UX

- **Target time:** 30-60 seconds
- **Maximum prompts per session:** 3
- **Input method:** Primarily tap-based (select from today's data or preset options). Free text is optional and limited to 140 characters.
- **Visual design:** Calm, dark-themed screen with emerald accent. No animations. No gamification elements on this screen. This is a quiet moment.

#### Privacy

- **ALWAYS device-only. NEVER synced.** This is a hard constraint from the adab safety rails.
- Muhasabah responses are stored in a PRIVATE SQLite table
- No analytics events capture response content (only "muhasabah_completed" or "muhasabah_skipped" events, no content)
- Player can delete all Muhasabah history from settings
- Muhasabah data is excluded from any export that includes sync-eligible data

#### Skippability

- Muhasabah is ALWAYS skippable
- Skip button is prominent and accessible (not hidden, not made to feel like a failure)
- Skip copy: "Not tonight? That is okay. See you tomorrow." (Never: "Are you sure?" or "You will miss out on XP!")
- No penalty for skipping (no streak impact, no negative copy, no nagging)
- A gentle Muhasabah reminder notification can be sent in the evening (configurable, default: 9 PM local), but the notification copy is invitational: "A moment of reflection awaits, whenever you are ready."

#### XP

- **10 XP** for completing Muhasabah (gentle nudge, not coercive)
- XP is awarded for completing the session (answering all prompts), not for specific content
- Skipping earns 0 XP (not negative XP -- there is no negative XP in HalalHabits)

#### Edge Cases

| Edge Case | Behavior |
|-----------|----------|
| Player opens Muhasabah at 11:59 PM | Session counts for today if started before midnight. If prompts are answered after midnight, they still count for the day the session was started. |
| Player already completed Muhasabah today | Shows "Reflection complete for today" with a review of their responses. No option to redo (prevents obsessive re-entry). |
| No habits completed today | Prompts shift to compassion-forward variants: "Today was quiet. What is one small step you could take tomorrow?" No reference to missed habits. No guilt. |
| Player completes Muhasabah but skips free-text fields | Session still counts as complete. Free text is always optional. |
| First-ever Muhasabah | Brief intro copy: "Muhasabah is the practice of reflecting on your day with honesty and kindness. This takes 30 seconds. You can skip anytime." |
| Player has Muhasabah reminder but has already completed it | Notification is suppressed. No redundant reminders. |

**Copy tone:** The quietest, most reverent voice in the app. Muhasabah copy is never energetic, never gamified, never "hype." It is the wise mentor at their most gentle: "A moment of reflection awaits." The screen feels like a quiet room, not a game interface.

---

## V2 Feature Systems (Deferred -- Economy Summaries)

These features are deferred to v2 and beyond. They are summarized here for economy coherence -- XP values and unlock conditions are defined so the v1 game economy can account for future expansion without rebalancing.

---

### 7. Nafs Boss Arena (v2 -- BOSS-01)

> **Status:** Deferred to v2. See [04 - Worldbuilding](./04-worldbuilding.md#enemy-and-boss-archetypes-v2-reference) for boss archetype descriptions.

The Nafs Boss Arena pits players against personified struggles (The Procrastinator, The Distractor, The Doubter, The Glutton, The Comparer). Boss battles are multi-day challenges where defeating a boss requires sustained discipline over 5-7 days (e.g., completing a specific habit streak or set of habits). Boss defeat awards 200-500 XP depending on boss difficulty tier, plus a unique boss-specific title. Bosses unlock at Level 15+ and appear every 2-3 weeks. The economy impact is moderate: a dedicated player defeats 1-2 bosses per month, adding 400-1000 XP/month on top of regular habit XP. Bosses provide narrative variety and connect the worldbuilding layer to gameplay mechanics.

---

### 8. Dopamine Detox Dungeon (v2 -- BOSS-02)

> **Status:** Deferred to v2.

The Dopamine Detox Dungeon is a structured anti-doomscrolling challenge. Players voluntarily enter a "dungeon" (a timed challenge mode) where they commit to avoiding specified digital distractions (social media, news feeds, video apps) for a set period (2-8 hours). The app does not enforce screen time -- it trusts the player's honesty (consistent with the non-adversarial design philosophy). Completing a dungeon session awards 50-150 XP based on duration. The dungeon resets daily and has a weekly "deep dungeon" variant (full-day detox) worth 300 XP. Economy impact: an engaged player adds 150-450 XP/week from detox challenges. The feature connects to the anti-distraction audience segment identified in the executive vision.

---

### 9. Friday Power-Ups (v2 -- FRDY-01)

> **Status:** Deferred to v2.

Friday Power-Ups provide Jumu'ah-specific bonuses that celebrate the blessed day of the week. On Fridays, all habit completions earn a 2x XP multiplier (stacking with streak multiplier). A special Friday-only quest appears: "Surah Al-Kahf Challenge" (read Surah Al-Kahf before Maghrib for 100 bonus XP). Friday salah (Dhuhr slot) carries additional significance in the UI -- a special animation and acknowledgment for attending Jumu'ah. Economy impact: Fridays become the highest XP-earning day, adding approximately 100-200% more XP than a regular day for an active player. This creates a weekly rhythm that mirrors the Islamic week's natural cadence. The 2x multiplier does not apply to quest XP (only habit completions) to prevent economy inflation.

---

### 10. Accountability Duos (v2 -- SOCL-01, SOCL-02)

> **Status:** Deferred to v2.

Accountability Duos allow two players to form a private mutual accountability partnership. Each player can see their partner's limited, non-worship progress data only: current level, active streak count (not which habits), and whether they completed habits today (yes/no, not which ones). Worship-specific data (salah logs, Muhasabah responses, specific habit names) is never shared -- this is enforced by the Privacy Gate at the data layer. Duos can send each other a single daily encouragement message from a preset library (no free text to prevent social pressure). The feature is opt-in and either partner can dissolve the duo instantly. Privacy considerations are paramount: the Duo partner should never feel surveilled, and the system must not enable controlling or judgmental behavior. A "mute" option allows either partner to hide their progress temporarily without dissolving the duo.

---

### 11. Barakah Economy (v2 -- SHOP-01, SHOP-02)

> **Status:** Deferred to v2.

The Barakah Economy is a cosmetic shop system using an in-app currency called "Barakah Coins." Players earn Barakah Coins through long-term milestones (not daily habits -- this separates the cosmetic economy from the discipline economy). Milestone examples: reaching Level 25 (100 coins), earning a Legendary title (200 coins), completing a seasonal event (150 coins). Barakah Coins purchase visual customizations only: HUD environment themes (alternate color palettes), profile frame borders, title display effects (glow, shimmer), and pixel art companion creatures (a cat, a falcon, a turtle). There is no pay-to-win, no purchasable XP, no purchasable streak protection. Future monetization (if any) would allow purchasing Barakah Coins with real money, but all items remain cosmetic. The economy is designed so that a free player who plays for 6+ months can unlock most items. Currency model: earn-only in v2, potential real-money purchase in v3+.

---

## Cross-References

- **[03 - Game Design Bible](./03-game-design-bible.md):** XP values, streak multiplier formula, quest XP ranges, and leveling curve are defined in the Game Design Bible. This document references those values but the Bible is the source of truth.
- **[04 - Worldbuilding](./04-worldbuilding.md):** Identity Titles table, boss archetypes, and seasonal events are defined in Worldbuilding. This document specs the mechanical systems; Worldbuilding provides the narrative layer.
- **[06 - Information Architecture](./06-information-architecture.md):** Feature systems inform the navigation model and screen hierarchy. Every feature here maps to one or more screens in the IA.
- **[07 - Screen Specs](./07-screen-specs.md):** Each feature system has corresponding screen specs with layouts, components, interactions, and edge states.
