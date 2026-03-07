# 15 -- Content Pack

> **Requirement:** BLUE-15 | **Status:** v1 Complete
> **Cross-references:** [04 - Worldbuilding](./04-worldbuilding.md) | [07 - Screen Specs](./07-screen-specs.md) | [09 - Sound & Haptics](./09-sound-haptics.md) | [05 - Feature Systems](./05-feature-systems.md)

---

## Adab Copy Guide

All user-facing copy in HalalHabits must pass these rules. This guide is the reference for every string in this document and all future copy.

**Voice:** Wise mentor -- calm, encouraging, slightly formal. Like a respected older sibling who games. Never preachy, never casual to the point of irreverence.

**Arabic terms:** Always include inline context on first use per screen. Format: "Arabic term (English meaning)."

### Do / Don't Pairs

| # | DO (use this) | DON'T (never use) | Why Not |
|---|---------------|-------------------|---------|
| 1 | "Your momentum is building" | "You're falling behind" | Implies failure; shame-based framing violates the prophetic principle of gentle encouragement |
| 2 | "Recovery quest available" | "You failed your streak" | Labels the player as a failure; Islam teaches that every stumble is an opportunity, not a verdict |
| 3 | "Your discipline grows stronger" | "Your iman score increased" | No app can quantify iman (faith); claiming to measure spiritual state is theologically presumptuous |
| 4 | "Ready for Dhuhr?" | "You missed Dhuhr!" | Guilt-based notification; the Prophet (peace be upon him) never shamed companions for missed prayers |
| 5 | "Continue your journey" | "Don't give up now" | "Don't give up" implies the player was about to quit; assumes negative intent |
| 6 | "A new day, a fresh start" | "You broke your streak yesterday" | Dwelling on yesterday's miss creates guilt loops; Islam emphasizes each day as a new opportunity |
| 7 | "Your consistency speaks volumes" | "You're better than 80% of users" | Public or comparative metrics encourage riya (showing off worship); worship is between the servant and Allah |
| 8 | "Rest is part of the journey" | "You've been inactive for 3 days" | Counting inactive days creates pressure; even the Prophet (peace be upon him) emphasized moderation in worship |
| 9 | "Your evening reflection awaits" | "You haven't done Muhasabah today" | Tracking non-completion of voluntary acts creates obligation where none should exist |
| 10 | "Welcome back, traveler" | "We missed you!" | "We missed you" is a guilt trigger disguised as friendliness; manipulative retention copy |
| 11 | "Set your niyyah (intention)" | "Promise to do better" | Niyyah is internal and between the servant and Allah; "promise to do better" implies past inadequacy |
| 12 | "Bismillah -- let's begin" | "Time to grind!" | "Grind" reduces worship-adjacent actions to labor; bismillah frames the action with reverence |

### Copy Rules Summary

1. **Never quantify spiritual state.** XP measures effort/discipline, never iman, taqwa, or closeness to Allah.
2. **Never reference missed days negatively.** Mention recovery opportunities, not failures.
3. **Never compare players to each other.** No leaderboards, no percentiles, no "streak rank."
4. **Always offer a path forward.** Every state (including zero habits, broken streak, long absence) has a positive next step.
5. **Arabic terms get inline context.** "Dhikr (remembrance)" not just "Dhikr."
6. **Celebration is effort-based.** "You showed up 7 days straight" not "Allah is pleased with you."
7. **Muhasabah is always optional.** Copy never implies obligation to reflect.

---

## Section 1: Microcopy (40 Strings)

### Buttons (8)

| ID | Location | Copy String |
|----|----------|-------------|
| MC-B01 | Habit completion | "Complete" |
| MC-B02 | Mercy Mode entry | "Begin Recovery" |
| MC-B03 | Onboarding niyyah | "Set My Niyyah" |
| MC-B04 | Quest detail | "View Quest" |
| MC-B05 | Habit creation | "Add to My Practice" |
| MC-B06 | Muhasabah start | "Begin Reflection" |
| MC-B07 | Onboarding finish | "Start My Journey" |
| MC-B08 | Profile title select | "Equip Title" |

### Empty States (8)

| ID | Location | Copy String |
|----|----------|-------------|
| MC-E01 | Habits list (no habits) | "Your practice begins with a single step. Tap + to add your first habit." |
| MC-E02 | Quest board (no quests) | "New quests arrive each day. Check back after your first habit completion." |
| MC-E03 | Titles collection (none earned) | "Your first title awaits. Build consistency and watch your identity grow." |
| MC-E04 | Streak display (no streak) | "Every journey starts at day one. Complete a habit to begin building momentum." |
| MC-E05 | Habit history (no completions) | "Your story hasn't been written yet. Today is a good day to start." |
| MC-E06 | Muhasabah history (none) | "Reflection is a private practice. Your first entry will appear here when you're ready." |
| MC-E07 | Notifications (none) | "All clear. Your next reminder will appear when a prayer window opens." |
| MC-E08 | Quest completion history | "Conquered quests appear here. Accept your first quest from the Quest Board." |

### Success Messages (8)

| ID | Location | Copy String |
|----|----------|-------------|
| MC-S01 | Habit completed | "Done. Your discipline grows stronger." |
| MC-S02 | Quest completed | "Quest conquered. That took real commitment." |
| MC-S03 | Streak milestone (7 days) | "Seven days of momentum. Your consistency speaks for itself." |
| MC-S04 | Streak milestone (30 days) | "Thirty days. This is no longer a streak -- it's who you are." |
| MC-S05 | Level up | "Level {X} achieved. New horizons await." |
| MC-S06 | Title unlocked | "New title earned: {title_name}. Wear it with quiet pride." |
| MC-S07 | Recovery complete | "Recovery complete. Your momentum is restored." |
| MC-S08 | All daily habits done | "Everything complete. You showed up today -- that matters." |

### Error Messages (8)

| ID | Location | Copy String |
|----|----------|-------------|
| MC-R01 | Network error | "Connection lost. Your progress is saved locally and will sync when you're back online." |
| MC-R02 | Save failed | "Something went wrong saving. Try again in a moment -- your data is safe." |
| MC-R03 | Invalid habit name | "Habit names need 3-50 characters. Keep it clear and meaningful." |
| MC-R04 | Max habits reached | "You've reached 20 active habits. Archive one to make room, or focus on what you have." |
| MC-R05 | Location unavailable | "Location not available. Prayer times need your location to calculate accurately." |
| MC-R06 | Duplicate habit | "You already have this habit active. Consider customizing it instead." |
| MC-R07 | Session expired | "Your session has expired. Sign in again to continue." |
| MC-R08 | Generic fallback | "Something unexpected happened. Your data is safe -- try again shortly." |

### Onboarding (8)

| ID | Location | Copy String |
|----|----------|-------------|
| MC-O01 | Welcome headline | "Your discipline journey begins here." |
| MC-O02 | Welcome subtitle | "A game-first approach to building Islamic habits. Earn XP. Build streaks. Watch your world grow." |
| MC-O03 | Niyyah prompt | "What brings you here? Set your niyyah (intention) -- the foundation of every good deed." |
| MC-O04 | Niyyah placeholder | "I want to build consistency in my daily worship..." |
| MC-O05 | Habit selection header | "Choose your starting habits. You can always add more later." |
| MC-O06 | Habit selection tip | "Start with 2-3 habits. Consistency beats quantity -- always." |
| MC-O07 | Tutorial: XP | "Complete habits to earn XP. XP measures your discipline effort, not your spiritual worth." |
| MC-O08 | Tutorial: Mercy Mode | "Missed a day? No judgment. Mercy Mode helps you recover your momentum with a recovery quest." |

---

## Section 2: Quest Lines (20 Strings)

### Daily Quests (8)

| ID | Quest Name | Description | Completion Message |
|----|-----------|-------------|-------------------|
| QD-01 | Salah Sweep | "Complete all 5 daily salah (prayers) today." | "All five prayers, one day. The foundation holds." |
| QD-02 | Morning Devotion | "Complete 3 habits before Dhuhr (midday prayer)." | "Your morning was well spent. Momentum secured." |
| QD-03 | Quran Companion | "Read Quran for at least 10 minutes today." | "Time with the Book. That investment compounds." |
| QD-04 | Dhikr Dedication | "Complete any dhikr (remembrance) habit today." | "A moment of remembrance. Simple but powerful." |
| QD-05 | Evening Closer | "Complete all remaining habits before Isha (night prayer)." | "Day wrapped up strong. Your consistency shows." |
| QD-06 | Double Down | "Complete any 2 habits within a single hour." | "Focused effort, real results. Well played." |
| QD-07 | First Light | "Complete a habit before sunrise." | "Before the world woke up, you showed up." |
| QD-08 | Reflection Point | "Complete your Muhasabah (self-reflection) tonight." | "You took time to look inward. That takes courage." |

### Weekly Quests (7)

| ID | Quest Name | Description | Completion Message |
|----|-----------|-------------|-------------------|
| QW-01 | Streak Builder | "Maintain a 7-day streak on any single habit." | "Seven straight days. Your discipline is undeniable." |
| QW-02 | Habit Machine | "Complete 30 habit check-ins this week." | "Thirty completions in seven days. Relentless consistency." |
| QW-03 | Dawn Patrol | "Pray Fajr within its time window 5 days this week." | "Fajr, five times. The hardest prayer, consistently met." |
| QW-04 | Full Spectrum | "Complete at least one habit from 3 different categories this week." | "Breadth and depth. A well-rounded practice." |
| QW-05 | Quran Week | "Read Quran 5 out of 7 days this week." | "Five days with the Book this week. Knowledge builds." |
| QW-06 | No Zero Days | "Complete at least 1 habit every day this week." | "Seven days, no zeros. That's what momentum looks like." |
| QW-07 | Friday Focus | "Complete all habits on Jumu'ah (Friday)." | "The best day of the week, fully honored." |

### Stretch Quests (5)

| ID | Quest Name | Description | Completion Message |
|----|-----------|-------------|-------------------|
| QS-01 | Ironclad | "Complete 50 check-ins this week." | "Fifty. That's not a streak -- that's a statement." |
| QS-02 | The Marathon | "Maintain streaks on all active habits for 14 consecutive days." | "Two weeks, every habit, no gaps. Legendary discipline." |
| QS-03 | Five Pillars | "Complete all 5 salah every day for 7 consecutive days." | "35 prayers, 7 days, zero missed. The Steadfast would be proud." |
| QS-04 | Centurion | "Reach 100 total habit completions." | "One hundred completions. You've built something real." |
| QS-05 | Night Owl | "Complete Tahajjud (night prayer) or Quran reading after Isha 5 times this week." | "Five nights of extra devotion. The quiet hours reward those who show up." |

---

## Section 3: Boss Encounter Messages (20 Strings)

> **v2 -- Pre-written for future Nafs Boss Arena.**
> These messages support the Nafs Boss Arena feature planned for v2. Boss archetypes represent internal spiritual struggles (nafs), not external enemies. Tone is respectful -- these are parts of the self that every believer wrestles with.

### The Procrastinator (Nafs al-Ammara -- The Commanding Self)

| Phase | Message |
|-------|---------|
| Intro | "Tomorrow seems like a better day, doesn't it? But tomorrow, I'll say the same thing. I always do." |
| Taunt | "Just five more minutes. Then five more after that. Time is my favorite weapon." |
| Player Winning | "Wait -- you're actually doing it now? That wasn't supposed to happen." |
| Defeated | "You chose action over delay. I have no power over the one who begins." |

### The Distractor (Scattered Attention)

| Phase | Message |
|-------|---------|
| Intro | "Oh, you were about to start? Let me show you something interesting first..." |
| Taunt | "There's always something more exciting than discipline. Don't you want to check?" |
| Player Winning | "How are you still focused? Most people would have looked away by now." |
| Defeated | "Your attention held firm. I couldn't pull you away. Well done." |

### The Doubter (Waswasa -- Whispers of Doubt)

| Phase | Message |
|-------|---------|
| Intro | "Does any of this really matter? You'll probably quit in a week anyway." |
| Taunt | "Other people are better at this than you. Why bother competing?" |
| Player Winning | "Still going? I thought for sure the doubt would stop you by now." |
| Defeated | "Your actions silenced me. Doubt cannot survive in the face of consistency." |

### The Comparer (Comparing to Others' Worship)

| Phase | Message |
|-------|---------|
| Intro | "Look at how disciplined everyone else is. You're so far behind." |
| Taunt | "They started after you and they're already ahead. What does that say about you?" |
| Player Winning | "Wait, you're not even looking at anyone else? That's... unexpected." |
| Defeated | "You ran your own race. Comparison lost its grip on you today." |

### The Perfectionist (All-or-Nothing Thinking)

| Phase | Message |
|-------|---------|
| Intro | "If you can't do it perfectly, why do it at all? One missed day ruins everything." |
| Taunt | "You already missed one. The streak is broken. Might as well stop entirely." |
| Player Winning | "You came back after a miss? That's not how all-or-nothing works." |
| Defeated | "Imperfect progress defeated me. You chose 'good enough' over 'nothing at all.'" |

---

## Section 4: Mercy Mode Messages (20 Strings)

> Per design decision: Mercy Mode uses blended tone -- brief Islamic wisdom + game recovery action. Each message has two parts: [Islamic wisdom line] + [Game action line].

| ID | Islamic Wisdom Line | Game Action Line | Source |
|----|-------------------|------------------|--------|
| MM-01 | "The door of tawbah (repentance) is always open." | "Recovery quest unlocked -- rebuild your momentum." | Hadith: "Allah extends His hand at night for those who sinned during the day, and extends His hand during the day for those who sinned at night." (Muslim 2759) |
| MM-02 | "Every sunrise is a new beginning." | "Complete {habit} twice in the next 2 days to restore your streak." | General Islamic principle |
| MM-03 | "Allah does not burden a soul beyond what it can bear." | "Your recovery quest is lighter than usual -- one step at a time." | Quran 2:286 |
| MM-04 | "The most beloved deeds to Allah are those done consistently, even if small." | "Complete any habit today to start rebuilding." | Hadith: Bukhari 6464 |
| MM-05 | "Whoever draws close to Allah by a hand's span, Allah draws close by an arm's length." | "Your first completion will restore 25% of your previous streak." | Hadith: Bukhari 7405 |
| MM-06 | "Do not belittle any good deed, even meeting your brother with a cheerful face." | "Even one completion today counts as progress. Begin when ready." | Hadith: Muslim 2626 |
| MM-07 | "Verily, with hardship comes ease." | "Recovery mode activated. The path back is simpler than you think." | Quran 94:6 |
| MM-08 | "The best of you are those who start something good and finish it." | "Finish your recovery quest to unlock your streak multiplier again." | General Islamic wisdom |
| MM-09 | "Allah loves the servant who, when they do something, they do it with excellence." | "Take your time with recovery. Quality over speed." | Hadith: at-Tabarani (hasan) |
| MM-10 | "Every person stumbles. The noble ones are those who rise again." | "Recovery quest available. Your momentum is waiting." | Based on Hadith: Tirmidhi 2499 |
| MM-11 | "Patience is a light." | "Your streak paused, not lost. Complete the recovery quest to resume." | Hadith: Muslim 223 |
| MM-12 | "He who treads a path seeking knowledge, Allah makes the path to Jannah easy for him." | "Keep learning, keep growing. One habit completion restarts the engine." | Hadith: Muslim 2699 |
| MM-13 | "Turn to Allah with hope, not fear." | "No pressure, no rush. Your recovery quest has no time limit." | General Quranic theme (Quran 39:53) |
| MM-14 | "The prayer of a servant is not rejected as long as they do not pray for something sinful." | "Make dua and begin your recovery. Every small step is heard." | Hadith: Muslim 2735 |
| MM-15 | "Take on only what you can sustain." | "Your recovery quest asks for just one completion. Start there." | Based on Hadith: Bukhari 6464 |
| MM-16 | "A journey of a thousand miles begins with bismillah." | "Say bismillah and tap Complete. That's all it takes to start again." | Adapted wisdom |
| MM-17 | "Allah is gentle and loves gentleness in all things." | "Be gentle with yourself. Recovery isn't a sprint." | Hadith: Muslim 2593 |
| MM-18 | "No one who does good deeds will be treated unjustly." | "Your past completions still count. Your XP total never decreases." | Quran 18:30 |
| MM-19 | "The earth was made a place of prostration and purification." | "Wherever you are, you can begin again. One prayer, one step." | Hadith: Bukhari 335 |
| MM-20 | "Seek help through patience and prayer." | "Recovery quest ready. Complete it at your own pace." | Quran 2:45 |

---

## Section 5: Friday Power-Up Messages (10 Strings)

> **v2 -- Pre-written for future Jumu'ah bonuses.**
> Friday (Jumu'ah) is the best day of the week in Islam. These messages accompany a 2x XP multiplier on Fridays.

| ID | Message | Source |
|----|---------|--------|
| FP-01 | "Jumu'ah blessings activated. All completions earn 2x XP today." | -- |
| FP-02 | "The best day the sun rises on is Friday. Make it count -- 2x XP active." | Hadith: Muslim 854 |
| FP-03 | "Friday: a day of gathering, gratitude, and double rewards. 2x XP until Maghrib." | General Islamic teaching |
| FP-04 | "There is an hour on Friday during which no Muslim asks Allah for anything but He grants it. 2x XP is our small way of honoring that." | Hadith: Bukhari 935 |
| FP-05 | "Send salawat upon the Prophet (peace be upon him) today. Your efforts earn double." | Hadith: Abu Dawud 1047 |
| FP-06 | "Jumu'ah mubarak. Every habit completion today earns 2x XP -- a Friday gift." | -- |
| FP-07 | "Adam was created on Friday. The Hour will come on a Friday. Today, your discipline earns double." | Hadith: Muslim 854 |
| FP-08 | "Read Surah Al-Kahf. Complete your habits. Earn double XP. Jumu'ah at its finest." | Based on Hadith about Surah Al-Kahf on Friday (Bayhaqi) |
| FP-09 | "Friday blessings: 2x XP on all completions. The best day for the best effort." | -- |
| FP-10 | "Jumu'ah power-up active. Stack your completions -- every one counts double today." | -- |

---

## Section 6: Notification Templates (20 Strings)

> Per design decision: "All notification copy is invitational, never guilt-based." Notifications use the wise mentor voice and respect the player's autonomy.

### Prayer Reminders (5)

| ID | Type | Title | Body |
|----|------|-------|------|
| NT-P01 | Fajr reminder | "Fajr window open" | "The dawn is here. Ready for Fajr (dawn prayer)?" |
| NT-P02 | Dhuhr reminder | "Dhuhr time" | "Midday prayer window is open. Ready for Dhuhr?" |
| NT-P03 | Asr reminder | "Asr time" | "Afternoon prayer window is open. Ready for Asr?" |
| NT-P04 | Maghrib reminder | "Maghrib time" | "The sun has set. Ready for Maghrib (sunset prayer)?" |
| NT-P05 | Isha reminder | "Isha time" | "Night has arrived. Ready for Isha (night prayer)?" |

### Habit Reminders (5)

| ID | Type | Title | Body |
|----|------|-------|------|
| NT-H01 | Morning habits | "Morning check-in" | "Your morning practice awaits. Start with one habit." |
| NT-H02 | Quran reading | "Quran time" | "Your daily Quran session is ready when you are." |
| NT-H03 | Evening habits | "Evening practice" | "Your evening habits are waiting. Wrap up the day strong." |
| NT-H04 | Dhikr reminder | "Dhikr moment" | "A moment of dhikr (remembrance) goes a long way." |
| NT-H05 | General reminder | "Habit check-in" | "You have habits ready to complete. Open when you're ready." |

### Muhasabah Prompts (3)

| ID | Type | Title | Body |
|----|------|-------|------|
| NT-M01 | Evening reflection | "Muhasabah time" | "The day is ending. A brief reflection can bring clarity." |
| NT-M02 | Gentle nudge | "A moment for reflection" | "Your evening Muhasabah (self-reflection) is ready when you are." |
| NT-M03 | Alternative prompt | "Reflect & recharge" | "30 seconds of reflection. Review your day, set tomorrow's intention." |

### Streak Celebrations (3)

| ID | Type | Title | Body |
|----|------|-------|------|
| NT-S01 | 7-day streak | "Streak milestone!" | "7 days of consistency on {habit}. Your momentum is real." |
| NT-S02 | 14-day streak | "Two weeks strong" | "14 days straight. You're building something lasting." |
| NT-S03 | 30-day streak | "Monthly milestone" | "30 days. This habit is part of who you are now." |

### Quest Updates (2)

| ID | Type | Title | Body |
|----|------|-------|------|
| NT-Q01 | New quest | "New quest available" | "A fresh quest just appeared on your Quest Board. Ready to accept?" |
| NT-Q02 | Quest expiring | "Quest expiring soon" | "Your current quest expires today. Complete it to earn bonus XP." |

### Level Up (2)

| ID | Type | Title | Body |
|----|------|-------|------|
| NT-L01 | Level up | "Level up!" | "You've reached Level {X}! Open the app to see what's new." |
| NT-L02 | New unlock | "New unlock available" | "Your discipline unlocked something new. Check your profile." |

---

## Copy Count Verification

| Category | Target | Actual | Status |
|----------|--------|--------|--------|
| Microcopy | 40 | 40 | PASS |
| Quest Lines | 20 | 20 | PASS |
| Boss Encounters | 20 | 20 | PASS |
| Mercy Mode | 20 | 20 | PASS |
| Friday Power-Ups | 10 | 10 | PASS |
| Notification Templates | 20 | 20 | PASS |
| **Total** | **130** | **130** | **PASS** |

---

## Adab Compliance Checklist

- [x] No shame copy anywhere in 130 strings
- [x] No spiritual judgment or iman/taqwa scoring language
- [x] No guilt-based notifications or reminders
- [x] All Arabic terms include inline context (English meaning)
- [x] Recovery/Mercy Mode messages are invitational, not punitive
- [x] XP framed as "discipline effort" throughout, never spiritual worth
- [x] Boss encounter messages treat nafs as internal struggles, not external enemies
- [x] Every empty state has a positive path forward
- [x] No comparative language (no "better than others" or ranking references)
- [x] Hadith and Quran references include source citations

---

*Section 15 of 16 | HalalHabits Ferrari 16-Bit Edition Blueprint*
*Cross-references: [04 - Worldbuilding](./04-worldbuilding.md) | [07 - Screen Specs](./07-screen-specs.md) | [09 - Sound & Haptics](./09-sound-haptics.md)*
