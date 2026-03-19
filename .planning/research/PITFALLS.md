# Domain Pitfalls

**Domain:** Gamified Islamic habit-building mobile app (React Native/Expo + Supabase)
**Researched:** 2026-03-07 (v1.0) / Updated 2026-03-19 (v2.0 Social & Battle Systems)
**Overall Confidence:** MEDIUM-HIGH (v1.0 pitfalls from training data; v2.0 pitfalls from training data + web search verification)

---

## v2.0 Critical Pitfalls

Mistakes specific to adding social features, boss battles, detox challenges, and power-ups to the existing offline-first system. These are the pitfalls that cause rewrites, data corruption, adab violations, or user churn at scale.

---

### Pitfall A: Offline-First Architecture Contamination from Social Features

**What goes wrong:** Social features (buddy connections, duo quests, shared habits, messaging) require server state as the source of truth. The v1.0 system treats SQLite as the single source of truth. Naively bolting social sync on top creates two competing sources of truth — one for personal data (SQLite) and one for social data (Supabase), with no clear arbitration strategy. This leads to ghost states: "Buddy says you didn't complete the duo quest" while locally your SQLite shows completion.

**Why it happens:** The offline-first pattern solves personal data well. But social data is inherently relational and shared — "did BOTH users complete this?" has no meaningful offline answer. Developers try to extend the existing sync engine with social data, not recognizing these require fundamentally different sync semantics.

**Consequences:**
- Duo quest completion states disagree between the two users' devices
- Buddy habit progress shows stale data for hours/days if one user is offline
- Shared habit goals can't be verified without server authority
- The v1.0 sync engine (designed for personal data) generates conflicts on social records
- Users see partner data that is 24+ hours stale with no staleness indicator

**Prevention:**
- Establish a hard architectural boundary: personal habit data = SQLite source of truth (existing v1.0 model), social/shared data = Supabase source of truth (new v2.0 model). Never mix these.
- Social features should gracefully degrade offline: "You're offline — buddy data will refresh when reconnected" is acceptable. Corrupted state is not.
- Duo quests must resolve on the server, not on either device. When offline, show pending state. Never grant rewards locally for a duo quest until server confirms both sides.
- Extend the Privacy Gate concept: personal worship data stays local, social interaction data is server-authoritative and requires connectivity.
- Add a connectivity-aware layer that shows staleness timestamps on all buddy/social data.

**Detection (warning signs):**
- Duo quest marked complete on User A's device but incomplete on User B's device
- Shared habit goal progress diverges between buddies
- XP granted for duo quest before server confirmation, then "taken back" on sync

**Phase relevance:** Must be decided in the architecture phase of v2.0, before any social feature code is written. Retrofitting this boundary after social tables are built is near-impossible.

**Confidence:** HIGH — this is a documented pattern in offline-first literature and Supabase's own documentation confirms it is server-first.

---

### Pitfall B: Riya (Ostentation) Seeping Through Social Accountability Features

**What goes wrong:** Buddy systems designed for "private accountability" gradually develop features that create social performance pressure. Habit completion notifications to buddies ("Ali just completed Fajr!") — even between two people — become a display of worship. Users start completing Salah to impress their buddy, not for the sake of Allah. The adab safety rails explicitly prohibit public worship display, but private doesn't automatically mean safe.

**Why it happens:** Product designers see high engagement from social accountability features in fitness apps (Strava, Duolingo, Fitbit). They copy the "friend activity feed" pattern without recognizing that workout completion is fundamentally different from Salah completion in Islamic ethics. What's motivating in fitness becomes potentially riya in worship.

**Consequences:**
- Community backlash from users who realize the app is enabling riya-adjacent behavior
- Scholars advising against use
- Users who are sensitive to this issue (and the target demographic often is) will self-exclude
- App store reviews mentioning "this made me feel like I'm showing off my prayers"
- Trust damage that cannot be undone

**Prevention:**
- Salah logs, Muhasabah entries, and other worship data remain completely invisible to buddies — always. This is already in the v1.0 Privacy Gate; v2.0 must never weaken it.
- Buddy visibility should be limited to: streak presence (not which habits), quest participation (not worship completion), and XP progress (which is framed as discipline, not worship quality).
- Shared habits that buddies create together should be for character/lifestyle habits (reading Quran for X minutes, no social media until Dhuhr) — never for the Salah log.
- Duo quest notifications should reference shared challenge progress, not "Ali prayed Fajr." Prefer: "Your Duo Quest is 60% complete!" over "Ali completed his morning habit."
- Add a clear in-app explanation when setting up buddies: "Your buddy never sees your prayer logs or Muhasabah. Shared visibility is limited to [list]."
- Have at least two practicing Muslims with knowledge of riya concerns review every buddy-facing notification before shipping.

**Detection:**
- Beta testers describe buddy features as "showing off my deen to my friend"
- Notification copy that references specific worship act completion (even accidentally)
- Users strategically completing habits right before messaging a buddy

**Phase relevance:** Social feature blueprint phase. Every buddy-visible data point must be explicitly approved. The default should be "not visible to buddy" and visibility must be deliberately unlocked per data type.

**Confidence:** HIGH — riya is a well-documented Islamic concern and the target demographic (practicing Muslims 16-35) will be attuned to it.

---

### Pitfall C: In-App Chat Moderation in a Religious Context Is Harder Than Generic Chat

**What goes wrong:** Standard profanity blocklists (English-only, generic bad words) miss two categories of problem content that are specific to Islamic community apps: (1) sectarian provocation — content that attacks Sunni/Shia/Sufi practices in a way that inflames division, and (2) religiously-framed manipulation — content that uses Islamic language to shame, judge spiritually, or pressure users ("if you don't complete this you're not a real Muslim"). Generic AI moderation models are not trained on Islamic community norms.

**Why it happens:** Developers use off-the-shelf moderation (Stream AutoMod, OpenAI moderation endpoint, bad-words npm package) and assume it covers community needs. It does not. These tools catch profanity in English well. They miss Arabic profanity, culturally specific sectarian attacks, and Islamic language used in manipulative ways.

**Consequences:**
- Sectarian disputes in buddy chats drive user churn from minority sects
- Spiritually manipulative messages ("your iman is weak if you don't do this") appear valid to the moderation system
- Arabic-language content goes unmoderated
- App associated with community conflict instead of spiritual growth

**Prevention:**
- Build a custom blocklist for the app's specific context: sect-attack phrases, spiritually judgmental language, Arabic profanity (use WebPurify which supports Arabic moderation as a starting point — verified by web search).
- Establish community guidelines that explicitly prohibit: spiritual shaming, sectarian provocation, claims about another user's Islamic standing, and unsolicited religious correction.
- Since chat is only between confirmed buddies (up to 20), this limits exposure — but does not eliminate the problem.
- Consider using server-side Supabase Edge Functions with a moderation step before message delivery, so flagged messages can be held for review.
- Provide an easy in-app report mechanism: reporting a buddy chat message should be one tap, with clear categories ("This message is spiritually harmful to me").
- Ship v2.0 with human moderation capacity for reported messages — do not rely solely on automated moderation for a religious community app.

**Detection:**
- Beta users report receiving messages that feel judgmental or sectarian
- Review of chat logs in beta shows slang, Arabic content, or coded shaming that automated moderation missed
- Users unfriending buddies at high rates shortly after connecting

**Phase relevance:** Messaging feature design and infrastructure phase. The moderation pipeline must be designed before the messaging feature ships.

**Confidence:** MEDIUM — based on web search results showing Stream AutoMod limitations + WebPurify Arabic support + analysis of Islamic community dynamics. Specific Islamic community moderation at this scale is not well-documented.

---

### Pitfall D: XP Economy Hyperinflation from Stacking Multipliers

**What goes wrong:** v2.0 introduces multiple simultaneous XP boosts: 2x Friday Power-Up, boss battle bonus rewards, duo quest completion bonuses, and potentially detox challenge completion XP. A user who completes a duo quest on a Friday during an active boss battle could earn 4-8x their baseline XP for a single action. Within weeks of v2.0 launching, engaged users reach level caps or render the level curve meaningless. The existing v1.0 level curve (designed around 1x XP) breaks.

**Why it happens:** Each feature team adds XP rewards in isolation, reasoning locally: "Boss battle should give a big reward." "Friday is special, make it 2x." "Duo quest completion should feel epic." Nobody models the combined effect. Classic game economy mistake — additive multipliers without a ceiling create hyperinflation.

**Consequences:**
- Users who play optimally (complete duo quests on Fridays during boss battles) level up 5-10x faster than solo players
- Titles earned through aggressive multiplier stacking feel hollow — "I'm 'Guardian of Dawn' but only because I gamed the Friday XP"
- Non-social users (no buddies) feel disadvantaged — the game is now better for social players in a way that undermines fairness
- Level curve breakage requires a retroactive rebalance that feels like punishment to early users

**Prevention:**
- Before implementing any v2.0 XP source, build an XP economy spreadsheet that models: baseline daily XP, 2x Friday XP, boss battle rewards, duo quest rewards, and detox rewards — all simultaneously at 100% participation.
- Implement a daily XP cap that multipliers cannot exceed. Friday 2x means you hit the cap with less effort, not that the cap doubles.
- Model multipliers as soft bonuses (reaching the daily cap faster, not infinite XP beyond cap) rather than true multipliers.
- Boss battle rewards should be structured XP within the existing curve — not massive bonuses that dwarf daily habit XP.
- Detox challenge XP should be meaningful but not larger than completing all daily habits — it's an alternative path, not a shortcut.
- After modeling, compare: "What is the maximum XP a fully engaged v2.0 user can earn in one week?" vs "What is the maximum a v1.0 user could earn?" The ratio should be at most 1.5x, not 4-8x.

**Detection:**
- Modeled max-engagement XP per week in v2.0 is more than 2x the v1.0 equivalent
- First week of v2.0 beta users are already at level caps from v1.0 by day 3
- Title unlock conditions that took months in v1.0 are reachable in days in v2.0

**Phase relevance:** Economy design phase, before any v2.0 feature is coded. This is a pre-code modeling task.

**Confidence:** HIGH — XP hyperinflation from stacking multipliers is a well-documented game economy failure pattern, verified by multiple game economy design sources.

---

### Pitfall E: Boss Battle State Persistence Across Days on a Mobile Device

**What goes wrong:** Nafs Boss Arena runs multi-day battles (3-7 day arcs). The boss HP, daily damage dealt, battle phase, and active buffs must survive: app kills, device restarts, OS updates, time-zone changes, and the user not opening the app for 1-2 days. If boss state is stored only in memory or in a cache that gets cleared, users return to find their 5-day boss battle reset to zero.

**Why it happens:** Multi-day state is more complex than daily habit completion records. Developers store battle state in AsyncStorage or memory without thinking through the full persistence lifecycle. The boss battle entity has more complex state transitions than a simple habit log row.

**Consequences:**
- User at 80% boss HP on day 4 opens app on day 5 to find the battle reset
- User who didn't open the app for 2 days discovers boss auto-lost without their knowledge
- Inconsistent boss state between local SQLite and Supabase (especially if the user was offline during daily damage calculation)
- Daily damage not credited if the user didn't open the app that day — silent failure

**Prevention:**
- Boss battle state must be persisted in SQLite with explicit schema: `boss_battles` table with `battle_id`, `boss_archetype`, `started_at`, `expected_end_at`, `current_hp`, `max_hp`, `daily_damage_dealt` (array or joined table), `status` (active/won/lost/abandoned).
- Daily damage should be calculated server-side by a Supabase Edge Function (scheduled or triggered on daily login), not client-side. If the user doesn't open the app, the server still processes that day's state.
- Design boss battles as time-locked events: a boss starts on day X and ends on day X+N regardless of whether the user plays every day. Missing days means less damage dealt (and potentially failing), but does not require the user to "be there" for the timer to tick.
- On app open, always sync boss state from server before showing the boss arena. Never trust local state alone for boss HP.
- Handle the case where a user was offline for 2+ days during a boss battle: show a clear "You were away for N days — here's what happened" summary on reconnect.

**Detection:**
- Boss HP in SQLite doesn't match Supabase after 3 days
- Users reporting boss "reset" after phone restart
- Daily damage logging inconsistent when user opens app at midnight

**Phase relevance:** Boss battle architecture phase. State schema and server-side daily processing must be designed before boss battle UI is built.

**Confidence:** HIGH — multi-day state persistence in mobile apps is a well-known problem area. The async multiplayer literature confirms "ghosting" (player abandonment) and state divergence are the primary failure modes for async multi-day mechanics.

---

### Pitfall F: Dopamine Detox Timer Cannot Survive iOS Background Kill

**What goes wrong:** The Dopamine Detox Dungeon runs 2-8 hour voluntary "no phone" challenges. The challenge timer must survive the user locking their phone, switching apps, and the app being backgrounded for hours. On iOS, React Native's JS thread pauses when the app is backgrounded or the screen locks. The timer stops. A user who locks their phone for 2 hours returns to find the timer showing 2 hours less than expected — or shows the wrong elapsed time entirely.

**Why it happens:** This is a documented iOS/React Native limitation: `setInterval` and JavaScript timers do not fire when the app is backgrounded on iOS (confirmed by multiple GitHub issues on `react-native-background-timer`, React Native core issue #1282). Developers assume "I'll just use a timer" without accounting for the platform's lifecycle.

**Consequences:**
- 4-hour detox challenge timer shows only 30 minutes elapsed after the phone was locked for 3.5 hours
- XP is not granted at challenge completion because the timer never finished
- Users feel cheated: "I did the detox and the app doesn't know it"
- Worse: a timer-based lock (if implemented to enforce the detox) releases too early or never releases

**Prevention:**
- Never rely on in-memory JavaScript timers for the detox challenge duration. Store `challenge_started_at` timestamp in SQLite and calculate elapsed time as `Date.now() - challenge_started_at` on every app open.
- This means the "timer" is wall-clock based, not tick-based. When the user opens the app, compute elapsed time from stored start timestamp. If `elapsed >= challenge_duration`, the challenge is complete — regardless of whether the app was open.
- Use `expo-task-manager` with a background fetch task to check challenge completion periodically on Android (iOS has strict limitations on background tasks beyond audio/location/voip).
- For challenge completion notification ("Your detox is complete!"), use a pre-scheduled local notification via `expo-notifications` at `started_at + duration`. This fires reliably even when the app is backgrounded.
- The detox challenge completion should also be verified on next app open: if `started_at + duration < now`, complete the challenge — even if the user was offline and the notification didn't fire.

**Detection:**
- iOS device locked for 2 hours shows detox timer having only ticked 5 minutes
- Users report completing the full challenge duration but not receiving XP
- Challenge completion notifications arriving hours late or not at all

**Phase relevance:** Detox Dungeon implementation phase. The timer architecture must use wall-clock time from the start — not tick-based.

**Confidence:** HIGH — confirmed by multiple GitHub issues (react-native-background-timer #69, React Native core #1282) and Expo documentation. This is a well-known React Native/iOS limitation.

---

### Pitfall G: Friday Power-Up Timezone Edge Cases and Continuous Activation

**What goes wrong:** "2x XP on Fridays" seems simple. It is not. A user in UTC+14 (Line Islands) hits Friday 14 hours before a user in UTC-12 (Baker Island). A user who crosses the International Date Line on a Thursday experiences two Fridays in a row — or skips Friday entirely. The Supabase server that grants the 2x multiplier runs in UTC, which may disagree with the user's local Friday. Users near timezone boundaries notice the multiplier turning on/off at seemingly random times.

**Why it happens:** Developers check `new Date().getDay() === 5` on the server (UTC) without accounting for user timezone. This is correct for UTC users and wrong for everyone else.

**Consequences:**
- Users in UTC+13/+14 see Friday XP on Thursday
- Users in UTC-10 to -12 see Friday XP on Saturday
- Users crossing timezones mid-Friday lose the multiplier mid-session
- Manipulation: users learn to change device timezone settings to extend their "Friday"

**Prevention:**
- Friday detection must use the user's local timezone, not server UTC. Store the user's timezone in their profile (already used for prayer times with adhan-js — reuse this). Calculate local Friday server-side using the stored timezone.
- Gate the Friday multiplier on local time: `isUserLocalFriday(user.timezone, Date.now())`. This must be consistent across all XP grants (client grant + server verification).
- For the Surah Al-Kahf challenge specifically: treat Friday as a 24-hour window from Fajr on the user's local Friday to Fajr on their local Saturday. This aligns with Islamic day reckoning.
- Handle the timezone manipulation attack: server verifies Friday status using stored profile timezone, not a client-supplied timezone at grant time. Users cannot change their "grant timezone" mid-session.

**Detection:**
- Users in Australia or Pacific islands report 2x XP appearing on the wrong day
- Server logs show XP grants on Saturday (UTC) for users whose local time is Friday

**Phase relevance:** Friday Power-Up implementation. Timezone handling must be part of the initial design, not a post-ship fix.

**Confidence:** MEDIUM — day-of-week detection across timezones is a known problem. The specific Islamic calendar alignment for Jumu'ah timing is inferred from prayer time app patterns; no authoritative source on this specific edge case was found.

---

### Pitfall H: Buddy Invite Code Abuse and Username Search Privacy

**What goes wrong:** Username search for buddy connections creates a privacy leak: any user can search for any username and learn that person is a HalalHabits user. Combined with the app's explicit Muslim identity focus, this is a meaningful privacy risk for users in countries with religious minority pressures. Invite codes can be mass-distributed, enabling strangers to connect and send messages to users who did not intend to be discoverable.

**Why it happens:** Developers think "it's just a username" without considering that app membership itself is sensitive data for some users. The app's name and purpose make membership a form of religious identity disclosure.

**Consequences:**
- Users in vulnerable regions (authoritarian governments, anti-Muslim contexts) can be identified as Muslim by their app membership
- Invite codes posted publicly on social media lead to strangers connecting
- Users receive messages from people they don't know and feel unsafe
- Privacy-conscious users refuse to use buddy features, eliminating the social layer

**Prevention:**
- Username search should return zero results unless the searched username has opted into discoverability in their settings. Default to not discoverable.
- Invite codes should be single-use or expire within 48 hours. No persistent public invite links.
- When accepting a buddy request, show the user who is requesting (name, avatar, when they joined) and require explicit confirmation. Never auto-accept.
- Add a "Block and Report" feature from day one of buddy connections — not a later addition.
- Clearly communicate in onboarding: "Your account is private by default. Your buddy never sees your prayer logs."
- Consider limiting invite-code distribution: each user gets N invite codes per month to share with people they know personally.

**Detection:**
- Users report receiving buddy requests from strangers
- Users in privacy-sensitive regions complain about being findable by name
- Invite codes appearing in public Islamic community forums

**Phase relevance:** Social system design phase. Privacy architecture for the social layer must be specified before building the invite/discovery system.

**Confidence:** HIGH — Muslim app privacy sensitivity is documented in real incidents (Muslim Pro location data scandal) and is a well-known concern in the community. Islamic social app discoverability is a genuine risk vector.

---

## v2.0 Moderate Pitfalls

---

### Pitfall I: Supabase Realtime Connection Limits in a Buddy-Active App

**What goes wrong:** Each active buddy relationship with live chat requires a Supabase Realtime WebSocket subscription. A user with 20 buddies who all happen to be online simultaneously requires 20 concurrent channel subscriptions. Supabase's free tier enforces connection and channel limits that an active social app can exceed quickly. When limits are hit, new subscriptions fail silently — messages stop arriving, and users think the app is broken.

**Why it happens:** Developers build on the free tier and test with 2-3 simultaneous connections. The app ships, a moderately active user base forms, and the limit is hit in production. Supabase's documentation confirms: "Connections will be disconnected if your project is generating too many messages per second."

**Consequences:**
- Message delivery fails silently for active users with many buddies
- Realtime subscription failures cause "ghost" online status (user appears online but messages don't arrive)
- Database "presence" feature (online/offline) breaks under load

**Prevention:**
- Architect chat as pull-first with push for active sessions: on app open, always poll for missed messages via REST. Use Realtime only for the active foreground session.
- Implement a single multiplexed channel per user (not one per buddy conversation) where possible.
- Design for Supabase Pro plan limits from the start — budget for the upgrade in the project plan.
- Add a "polling fallback" that activates when WebSocket connection fails: fall back to polling every 30 seconds so messages are not lost.
- Monitor connection counts from day one of beta, before connection limits are hit in production.

**Detection:**
- Users with many buddies report messages arriving late or not at all
- Supabase Realtime dashboard shows connections near or at plan limits
- Chat messages appear after app restart (indicating they were queued, not real-time)

**Phase relevance:** Social infrastructure phase. Multiplexed channel design must be decided before messaging is implemented.

**Confidence:** MEDIUM — Supabase Realtime limits are documented. The specific impact on a 20-buddy architecture is inferred, not directly tested.

---

### Pitfall J: Duo Quest "Ghost Partner" — One User Abandons, Other Is Stuck

**What goes wrong:** User A and User B accept a duo quest. User B stops using the app (life happens, Ramadan, exams). User A completes their half of the duo quest daily for 7 days and never gets credit because the server is waiting for both sides to complete. User A has no way to exit the quest, reassign it, or get partial credit. The duo quest system requires both players to be active — which in practice never lasts long enough.

**Why it happens:** Duo quest systems are designed for the happy path (both users active). The abandonment path is not modeled. Duolingo Friends Quests face this same problem — the partner fails to contribute and the quest expires incomplete.

**Consequences:**
- User A (the engaged player) is punished for User B's inactivity
- User A becomes frustrated with the social system entirely ("buddy features don't work")
- User B feels guilty when they return and see they blocked their buddy's progress
- Duo quests become abandoned so frequently that the feature feels broken

**Prevention:**
- Duo quests should have individual and shared reward tiers: "Complete your half = individual reward. Both halves complete = bonus shared reward." Individual progress is always credited.
- Include a "pause duo quest" feature: if a buddy is inactive for 48 hours, the duo quest pauses (no penalty to either player) until they return.
- Allow exiting a duo quest after 72 hours of partner inactivity, with partial credit for days completed.
- Show realistic completion rate statistics when creating a duo quest: "Duo quests have a higher success rate when both buddies open the app at least 3 times this week."
- Frame duo quests as collaborative bonuses, not requirements. The core loop (solo habits) should be rewarding enough that duo quest abandonment doesn't feel devastating.

**Detection:**
- Beta users who create duo quests with inactive buddies report feeling "stuck" or "punished"
- Completion rate for duo quests in beta is below 30%

**Phase relevance:** Duo quest design phase. The abandonment path must be specified alongside the happy path.

**Confidence:** MEDIUM — the ghost partner pattern is documented in async co-op games. Verified by Duolingo Friends Quest UX patterns and async multiplayer game design literature.

---

### Pitfall K: Boss Archetype Copy Trivializing Internal Spiritual Struggle

**What goes wrong:** The Nafs Boss Arena pits users against personified struggles: Procrastination, Anger, Arrogance, Distraction, Despair. This concept is compelling and Islamically grounded (nafs al-ammara). The pitfall is in the execution: copy and visuals that make the nafs battle feel like punching cartoon villains. "DEFEAT ARROGANCE!" with a big health bar and damage numbers trivializes what Islam treats as a serious internal jihad. Scholars or users with deeper Islamic literacy will find this tone disrespectful.

**Why it happens:** Game designers default to combat metaphor (boss HP, damage, defeat). The Islamic concept of nafs struggle is about growth, awareness, and mercy — not violence or defeat. The two framings are in tension.

**Consequences:**
- Islamic scholars or community leaders object to the "fighting your nafs" combat framing as theologically inappropriate
- Users feel the feature is disrespectful to the concept of tazkiyah (purification of the soul)
- The feature that could have been the app's deepest differentiator becomes its most controversial

**Prevention:**
- Frame boss battles as "discipline challenges against inner struggles," not "fighting" or "defeating" — language matters here.
- Boss HP should represent "how much this struggle has receded through consistent discipline" — not damage dealt. Reframe: "Resistance Fading" instead of "Boss HP."
- Avoid violent visual metaphors: no swords, punches, or battle damage. Prefer: a dark cloud lifting, a chain weakening, a weight becoming lighter — visual metaphors aligned with Islamic tazkiyah concepts.
- Each boss archetype needs copy written by someone with Islamic literacy: Procrastination connects to niyyah (intention), Anger to hilm (forbearance), Arrogance to tawadu (humility). The Islamic framing makes the feature deeper, not shallower.
- Test boss copy with 3+ practicing Muslims of different backgrounds before launch.

**Detection:**
- Beta users describe boss battles as "cool but kind of weird for an Islamic app"
- Any beta tester with religious knowledge expresses discomfort
- Boss visuals look like a standard mobile RPG battle screen

**Phase relevance:** Boss battle design phase. Visual and copy direction must be established before any UI is built.

**Confidence:** HIGH — based on the app's own adab safety rails and the known sensitivity around gamifying Islamic concepts.

---

### Pitfall L: Detox Challenge Encouraging Phone Absence Makes App-Level Features Unreachable

**What goes wrong:** The Dopamine Detox Dungeon encourages users to put down their phone for 2-8 hours. During this period, the user may miss: the Fajr habit tracking window, a duo quest reminder, a boss battle daily damage opportunity, or a Friday Power-Up window. The feature that is supposed to help users is directly competing with other features that require phone interaction. A perfectly executed 8-hour detox on a Friday means missing the Friday 2x XP window for most of the day.

**Why it happens:** Features are designed in isolation. The team building detox challenges optimizes for "users should put the phone down." The team building Friday Power-Ups optimizes for "engagement on Fridays." The conflict between them is not caught until users experience it.

**Prevention:**
- Detox challenges should not count against any daily habit streak — if a user is in a verified detox, the streak remains intact regardless of non-completion.
- The detox challenge itself should grant enough XP to be comparable to completing all daily habits — so the user is not economically punished for the feature.
- Friday detox challenges should grant double XP (same 2x Friday multiplier applies to detox completion) — a user doing a phone detox on a Friday is showing exemplary discipline.
- Duo quest daily progress should not expire during a partner's active detox — pause that partner's daily window.
- Design the detox feature as a "superpower" that amplifies other systems, not one that competes with them.

**Detection:**
- Beta users report not doing detox challenges because "I don't want to miss my streak"
- Users complete detox challenges only on weekdays they know have no other time-sensitive features
- Users describe the detox challenge as "punishing"

**Phase relevance:** Detox and cross-feature integration design phase. Conflict modeling between all v2.0 features must happen before any individual feature ships.

**Confidence:** HIGH — this is a cross-feature dependency conflict, a pattern well-documented in product design. The specific interaction is unique to this app but the meta-pattern is universal.

---

## v2.0 Minor Pitfalls

---

### Pitfall M: Friday Surah Al-Kahf Challenge Without Content Integrity

**What goes wrong:** The Surah Al-Kahf challenge is a significant religious practice with hadith basis (reading Surah Al-Kahf on Fridays). The app cannot verify whether the user actually read it. If the challenge is just a checkbox with 2x XP reward, users will tap it without reading. The feature becomes a game mechanic that trivializes the practice. Alternatively: if the app provides Surah Al-Kahf text for the challenge, the Quranic text must be meticulously correct — any text error in a Quranic display is a serious failure.

**Prevention:**
- Frame the challenge as a commitment, not a verification: "Mark as read when you've completed your recitation of Surah Al-Kahf." This is honest about the app's inability to verify and puts intention on the user.
- If Quranic text is displayed: use a well-established, verified Quranic text source (Tanzil API or pre-loaded verified text). Never display self-typed or LLM-generated Quranic text. Have the text verified by at least one person with Quranic knowledge before shipping.
- Include a transliteration and translation, but make the Arabic primary.
- The challenge notification should include the hadith basis (with proper attribution) for context, not just a game prompt.

**Phase relevance:** Friday Power-Up content review phase.

**Confidence:** HIGH — Quranic text accuracy is non-negotiable; this is documented Islamic app guidance.

---

### Pitfall N: Shared Habit Goals Syncing to Wrong User's Local Data

**What goes wrong:** When buddies create a shared habit goal ("We'll both read Quran for 10 minutes before Dhuhr"), the shared goal must exist in both users' SQLite databases as a habit entity. If the sync logic creates duplicate habit IDs, or if one user's edit to the shared habit overwrites the other's, data inconsistency occurs. One user sees the habit as "completed today," the other sees it as "not started."

**Prevention:**
- Shared habits should have server-assigned UUIDs with a `shared_habit_id` field that cannot be overwritten locally.
- Use server as the source of truth for shared habit definitions (not individual habit completions — those are still personal).
- The shared habit completion is tracked per user independently: User A's completion of the shared habit is stored in User A's local SQLite. Shared progress visibility is computed server-side.
- Never allow one buddy to edit the shared habit goal after both have accepted it — require mutual consent for changes (or simply prohibit editing shared habits entirely in v2.0).

**Phase relevance:** Shared habit design phase.

**Confidence:** MEDIUM — inferred from general distributed data design patterns.

---

### Pitfall O: RLS Policy Gaps Exposing Buddy Data Across Users

**What goes wrong:** v2.0 adds buddy relationship tables, shared habits, duo quest records, and message tables. Each of these requires careful RLS policies. A gap in RLS means: User A can read User C's buddy messages (even without being a buddy), or User B can see User A's shared habit completion details. With social features, RLS complexity scales non-linearly — the v1.0 patterns (user can only read their own rows) no longer cover all cases.

**Prevention:**
- For buddy data: RLS policy must verify `auth.uid() IN (buddy_a_id, buddy_b_id)` for any buddy-relationship-gated row.
- For message tables: sender and receiver must both have RLS access — but only to their own conversation, not others'.
- For duo quest tables: both quest participants have read access; only the server (via Edge Function with service key) has write access to quest state.
- Write RLS policy tests for every new v2.0 table before shipping: attempt to read another user's buddy data from a different user's authenticated session.
- Maintain a "RLS policy map" document that explicitly states who can read/write each table and under what conditions.

**Phase relevance:** Social backend phase.

**Confidence:** HIGH — Supabase RLS complexity with relational social data is a well-known challenge, confirmed in Supabase documentation.

---

## Phase-Specific Warnings (v2.0)

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Social architecture design | Offline-first and social-online coexistence | Establish hard boundary: personal = SQLite, social = Supabase authoritative, before any code |
| Buddy system design | Riya via private accountability features | Default to minimum buddy visibility; each visible data point must be explicitly approved |
| Messaging design | Arabic/religious context moderation failure | Custom blocklist + reporter flow before messaging ships |
| XP economy rebalancing | Multiplier stacking inflating level curve | Economy spreadsheet model with all v2.0 sources before any feature is coded |
| Boss battle design | Nafs framing trivializing spiritual struggle | Islamic-literate copy review; reframe combat metaphor as resistance/lifting |
| Boss battle implementation | Multi-day state failing on device restart | Wall-clock timestamps in SQLite, server-side daily state processing |
| Detox challenge implementation | iOS timer killed when backgrounded | Wall-clock `started_at` + pre-scheduled local notification at `started_at + duration` |
| Friday Power-Up | Wrong day in non-UTC timezones | Use stored user timezone (already in profile) for local Friday detection server-side |
| Duo quest design | Ghost partner blocking engaged user | Individual reward tier + 48-hour inactivity pause + exit after 72 hours |
| Cross-feature integration | Detox competing with streaks/XP windows | Detox counts as streak preservation; streak never penalized during verified detox |
| Social backend (RLS) | Buddy data leaking across user boundaries | RLS policy tests for every new v2.0 table, buddy-pair scoped policies |
| Invite system | Username search privacy leak | Opt-in discoverability by default; single-use expiring invite codes |
| Surah Al-Kahf content | Quranic text error | Pre-loaded verified text from Tanzil or equivalent, reviewed before ship |
| Supabase Realtime | Connection limits with 20-buddy architecture | Multiplexed channel design + polling fallback, plan for Pro tier |

---

## Sources

**v1.0 pitfalls (Pitfalls 1-15):**
- Training data knowledge of React Native/Expo ecosystem, gamification design patterns, Islamic app design considerations, offline-first architecture patterns. Confidence: MEDIUM overall.

**v2.0 pitfalls (Pitfalls A-O), verified via web search 2026-03-19:**
- Offline-first + social tension: [How We Added Offline Sync Without Breaking Everything](https://medium.com/@saritasa/how-we-added-offline-sync-to-a-mobile-app-without-breaking-everything-1b739c23a23b), [Build an offline-first app — Android Developers](https://developer.android.com/topic/architecture/data-layer/offline-first) — MEDIUM confidence
- Supabase Realtime limits: [Supabase Realtime Limits docs](https://supabase.com/docs/guides/realtime/limits), [Stack Diagnosis: max connections](https://drdroid.io/stack-diagnosis/supabase-realtime-the-client-has-reached-the-maximum-number-of-allowed-connections) — HIGH confidence for documented limits
- iOS background timer kill: [react-native-background-timer issue #69](https://github.com/ocetnik/react-native-background-timer/issues/69), [React Native core issue #1282](https://github.com/facebook/react-native/issues/1282) — HIGH confidence, confirmed bug reports
- Chat moderation Arabic support: [WebPurify multilingual](https://www.webpurify.com/profanity-filter/), [Stream AutoMod React Native](https://getstream.io/chat/docs/react-native/moderation/) — MEDIUM confidence for Islamic-specific limitations
- XP economy inflation: [Designing Game Economies: Inflation, Resource Management](https://medium.com/@msahinn21/designing-game-economies-inflation-resource-management-and-balance-fa1e6c894670), [Progression & XP Inflation in MMORPGs](https://clockwork-labs.medium.com/progression-xp-inflation-in-mmorpgs-5b8e52e75ea7) — HIGH confidence for documented game economy patterns
- Async multi-day mechanics: [Asynchronous Multiplayer: Reclaiming Time in Mobile Gaming](https://www.wayline.io/blog/asynchronous-multiplayer-reclaiming-time-mobile-gaming) — MEDIUM confidence
- Muslim app privacy sensitivity: [When Data Privacy Becomes a Subject of Faith](https://www.yesmagazine.org/social-justice/2021/06/16/app-data-collection-muslims-in-tech), [Muslim Pro location data incident, Buzzfeed](https://www.buzzfeednews.com/article/ikrd/pillars-app) — HIGH confidence for documented privacy concern
