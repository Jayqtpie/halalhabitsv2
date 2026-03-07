# Domain Pitfalls

**Domain:** Gamified Islamic habit-building mobile app (React Native/Expo + Supabase)
**Researched:** 2026-03-07
**Overall Confidence:** MEDIUM (based on training data; web search unavailable for verification)

---

## Critical Pitfalls

Mistakes that cause rewrites, user abandonment, or community backlash.

---

### Pitfall 1: Streak Tyranny — Punishing Real Life Instead of Rewarding Discipline

**What goes wrong:** Streaks become the product's emotional center. Users feel anxious about breaking them, then when they inevitably do (travel, illness, Ramadan schedule changes), the loss feels devastating and they abandon the app entirely. Duolingo's research showed that streak-break is the #1 churn event. For an Islamic app, this is worse: users associate prayer-guilt with your app.

**Why it happens:** Developers think streaks = retention. They copy Duolingo/Snapchat without understanding that those apps tolerate high churn because of massive user bases. A niche app cannot afford the 60-70% of users who quit after a streak break.

**Consequences:**
- Users associate app with guilt/shame (violates Adab Safety Rail #5)
- Streak anxiety becomes a dark pattern itself (violates Rail #4)
- Users who miss Fajr once feel like "the game is over" and uninstall
- Retention curve shows cliff-drops at day 7, 14, 30

**Prevention:**
- Mercy Mode must be a first-class system, not an afterthought bolted on
- Streaks should have "shields" and "recovery windows" designed from day one
- Frame streaks as "momentum" not "perfection" — show partial credit
- Never use language like "You broke your streak" — use "Your momentum paused, pick up where you left off"
- Cap the emotional weight of streaks: after 30 days, additional days shouldn't increase loss-aversion proportionally
- Implement "streak freezes" that are generous (not premium-gated)

**Detection (warning signs):**
- During playtesting, users express anxiety about opening the app after missing a day
- DAU/MAU drops sharply on days following streak breaks
- User feedback mentions "guilt" or "pressure"

**Phase relevance:** Phase A (Blueprint) must define Mercy Mode mechanics. Phase B (MVP) must ship with streak recovery from day one. Never ship streaks without recovery.

---

### Pitfall 2: Spiritual Quantification — Accidentally Measuring Iman

**What goes wrong:** Despite best intentions, the XP/level system creates an implicit hierarchy: "Level 12 Muslim is better than Level 5 Muslim." Users or critics interpret game scores as spiritual ranking. Community backlash from scholars or Islamic influencers calling it "gamifying worship" or "trivializing ibadah."

**Why it happens:** Game mechanics inherently create rankings and comparisons. Even without leaderboards, users mentally compare. The XP number next to Salah completion unavoidably implies "your prayers have a score."

**Consequences:**
- Religious community backlash that kills word-of-mouth (your primary growth channel)
- Users feel spiritually judged by an app
- Scholars advise against using it
- App becomes associated with bid'ah (innovation in worship) criticism

**Prevention:**
- XP framing must be "discipline score" not "worship score" — the language must be airtight
- Never show XP gains directly on prayer completion screens. Show XP in a separate game layer
- Use language like "consistency points" or "discipline XP" — never "prayer score" or "worship points"
- Have religious copy reviewed by at least 2-3 knowledgeable Muslims before launch
- Include an explicit disclaimer: "This app tracks your consistency habits. It does not measure the quality or acceptance of your worship."
- The game layer should feel like it rewards the *meta-habit* (showing up, being consistent) not the *act of worship itself*
- Consider: XP for "logged Fajr" not "prayed Fajr" — subtle but important distinction

**Detection:**
- Beta users describe their level as their "Islam level" or similar
- App store reviews mention spiritual judgment
- Islamic content creators criticize the concept

**Phase relevance:** Phase A (Blueprint) — XP philosophy language must be locked down. Phase B (MVP) — every string in the app touching worship must be reviewed for this.

---

### Pitfall 3: Timezone and Prayer Time Chaos

**What goes wrong:** Islamic prayer times are calculated based on geographic location and astronomical formulas. There are multiple calculation methods (MWL, ISNA, Egyptian, Umm al-Qura, etc.) that differ by up to 30+ minutes. Users travel across timezones. DST changes shift everything. A habit tracked at "Fajr" doesn't mean the same time everywhere or even the same time tomorrow.

**Why it happens:** Developers treat prayer times like fixed daily events (e.g., "morning routine at 7am"). Prayer times shift daily with sun position and vary dramatically by latitude. High-latitude locations (Scandinavia, Canada) have extreme Fajr/Isha times.

**Consequences:**
- Users in different regions get wrong prayer windows
- Streak broken because app thinks Fajr window ended, but user's local calculation method says otherwise
- Traveling users lose streaks when timezone shifts
- High-latitude users have impossible prayer windows (Fajr at 2am in summer)
- Day-boundary bugs: "today's habits" roll over at wrong time

**Prevention:**
- Use the Adhan/PrayerTimes library (or similar) with configurable calculation methods — let users pick their method
- Define "habit day" boundaries by Fajr-to-Fajr or Maghrib-to-Maghrib (Islamic day), NOT midnight
- Store all times as UTC internally, convert for display only
- Handle timezone changes gracefully: if user crosses timezone, don't retroactively invalidate completions
- For high-latitude locations, implement fallback calculation methods (nearest city, 1/7th of night, etc.)
- Test with: London summer Fajr (~2:30am), Reykjavik, Sydney (southern hemisphere inverted), Saudi Arabia, New York DST transition

**Detection:**
- Bug reports from users in extreme latitudes
- Streak breaks coinciding with DST transitions
- Users reporting "wrong prayer times"

**Phase relevance:** Phase A (Blueprint) — define which calculation methods to support and day-boundary logic. Phase B (MVP) — implement with at least 3 major calculation methods. This is foundational; getting it wrong early means data migration pain later.

---

### Pitfall 4: Offline-First Data Conflicts That Corrupt Habit History

**What goes wrong:** User completes habits offline on two devices (phone and tablet), or the same device has stale data. When sync resumes, conflicts arise: duplicate completions, lost completions, XP inconsistencies, streak data contradictions. Users lose trust in the app when their history seems wrong.

**Why it happens:** Offline-first is promised but conflict resolution is punted to "we'll figure it out." Supabase doesn't provide built-in offline-first with conflict resolution — it's a server-first database with a REST API. The gap between "works offline" and "syncs correctly after offline" is massive.

**Consequences:**
- Users complete Fajr, go offline, complete it again (or on another device) — now they have 2x XP or a missing entry
- Streak data becomes inconsistent between local and server
- Users lose trust: "I know I logged this, where did it go?"
- Data integrity issues compound over time and become unfixable

**Prevention:**
- Design the local data layer FIRST with conflict resolution strategy before touching Supabase
- Use CRDT-inspired approaches or last-write-wins with vector clocks for habit completions
- For habit completions specifically: idempotent by (user_id, habit_id, date) — completing the same habit on the same date twice is a no-op, not a duplicate
- Store a local operation log (event sourcing lite) that replays against the server
- Supabase sync should be one-directional push with server reconciliation, not bidirectional merge
- Use WatermelonDB or similar for the local database layer — it has built-in sync primitives designed for this pattern
- Test offline scenarios: airplane mode for 3 days, then sync. Two devices offline, then both sync. Mid-sync network failure.

**Detection:**
- Users report XP totals that don't match their habit history
- Duplicate entries in the database
- Streak counts that differ between devices

**Phase relevance:** Phase B (MVP) — this is an architecture decision that must be made before writing any data layer code. Retrofitting conflict resolution is a near-complete rewrite of the data layer.

---

### Pitfall 5: Game Economy Inflation and Meaningless Progression

**What goes wrong:** XP and levels come too fast or mean nothing. By week 2, users are "Level 15" but nothing has changed in their experience. Or: XP curves are linear, so Level 50 takes the same effort as Level 5, making levels feel cheap. Titles and rewards feel arbitrary because they're not tied to real behavioral change.

**Why it happens:** Developers focus on making early progression feel good (it does) but don't model the long-term economy. No one plans what Level 100 means or how XP rates should change at month 6. The economy is designed for the first 2 weeks, then breaks.

**Consequences:**
- "Number go up" loses its dopamine hit after 2-3 weeks
- Users plateau at a level and feel stuck — or reach max level too fast
- Titles feel meaningless ("Guardian of Dawn" after 3 days of Fajr?)
- No reason to keep engaging with the game layer — it becomes decoration

**Prevention:**
- Model the XP economy on a spreadsheet before building: plot levels 1-100, time-to-level, XP-per-action, and what unlocks at each tier
- Use logarithmic or exponential leveling curves — each level should take meaningfully more effort
- Tie titles to real consistency milestones: "Guardian of Dawn" requires 40 consecutive Fajr (a spiritually significant number), not 3
- Create XP sinks: cosmetic unlocks, title upgrades, and optional challenges that cost XP/effort
- Plan for 6-month and 12-month engagement — what does the game look like for a daily user after 6 months?
- Separate "total XP" (lifetime discipline) from "current level" (active engagement tier)

**Detection:**
- Playtesters reach high levels within days
- User feedback: "levels don't mean anything"
- Engagement metrics show game layer interactions dropping after week 2

**Phase relevance:** Phase A (Blueprint) — the 16-section design doc MUST include a full economy model with progression curves. Phase B (MVP) — implement with the modeled curves, but expect to tune based on real user data.

---

## Moderate Pitfalls

---

### Pitfall 6: React Native Animation Jank Killing the "Ferrari" Feel

**What goes wrong:** The app promises "Ferrari x 16-bit" premium feel, but React Native animations stutter at 30fps on mid-range Android devices. JS-driven animations block the main thread. Lottie animations for game elements cause frame drops. The app feels cheap instead of premium.

**Why it happens:** Developers prototype on iPhone 15 Pro, ship to Samsung Galaxy A14. React Native's JS bridge introduces latency for animations. Using Animated API from React Native core instead of Reanimated 3 means animations run on the JS thread instead of the UI thread.

**Prevention:**
- Use React Native Reanimated 3 for ALL animations — it runs on the UI thread via worklets
- Use `useAnimatedStyle` and `withTiming`/`withSpring` instead of Animated.Value
- Avoid Lottie for frequently-triggered animations (XP gains, habit completions) — use Reanimated + SVG instead
- Lottie is fine for one-off celebrations (level up, quest complete) but test on low-end Android
- Set a performance budget: all transitions must hit 60fps on a device 3 years old
- Profile with Flipper and the React Native performance monitor early and often
- Avoid `LayoutAnimation` on Android — it causes crashes and jank in some scenarios
- Sprite-based 16-bit animations should be sprite sheets rendered via Skia (@shopify/react-native-skia), not individual image swaps

**Detection:**
- Frame drops visible during habit completion animations
- Android users report "laggy" or "slow" app
- Performance monitor showing JS thread > 16ms per frame during animations

**Phase relevance:** Phase B (MVP) — choose Reanimated 3 + Skia from the start. Migrating from Animated API to Reanimated later is painful. The "16-bit premium" feel is a core differentiator that must work on day one.

---

### Pitfall 7: Muhasabah (Reflection) Becoming a Chore

**What goes wrong:** Nightly reflection is designed as a meaningful self-review, but becomes another checkbox. Users write "good" every night to get XP, or skip it entirely because it feels like homework. The feature that should create the deepest engagement becomes the most skipped.

**Why it happens:** Free-form text input has high cognitive load. Users are tired at night (when Muhasabah happens). The "right" amount of reflection varies wildly between users. Forcing depth backfires.

**Prevention:**
- Offer structured prompts, not blank text fields: "What was your best moment of discipline today?" with 3-4 tap-to-select options plus optional free text
- Make it 30-60 seconds max, not a journaling session
- Vary prompts daily so it doesn't feel repetitive
- Allow skip without penalty (but offer bonus XP for completion, never subtract for skipping)
- Consider a "mood + one word" minimal mode for tired nights
- Show past reflections as a personal growth timeline — make the history valuable so users want to contribute quality entries

**Detection:**
- Analytics show >50% skip rate for Muhasabah within first 2 weeks
- Free-text entries are 1-2 words long on average
- Users mention it feels "like homework" in feedback

**Phase relevance:** Phase A (Blueprint) — design the prompt system with minimal and deep modes. Phase B (MVP) — ship with structured prompts, not just a text box.

---

### Pitfall 8: Expo Build and OTA Update Footguns

**What goes wrong:** Expo's managed workflow limits native module access. When you need a native feature (background notifications for prayer times, precise alarm scheduling), you discover you need to eject or use a dev client. OTA updates via EAS Update can silently break the app if JS and native layers drift out of sync.

**Why it happens:** Expo's managed workflow is magical until it isn't. Developers start in managed, then need background task scheduling for prayer reminders, local notifications that fire at calculated prayer times, or background location for travel-aware prayer times.

**Prevention:**
- Start with Expo Dev Client (custom development build), not Expo Go — this gives native module access while keeping Expo tooling
- Use `expo-notifications` with scheduled local notifications for prayer reminders — this works in managed workflow
- For precise prayer-time scheduling, use `expo-task-manager` with background fetch (but test battery impact)
- Pin Expo SDK versions and test OTA updates on a staging channel before production
- Keep a "native escape hatch" plan: know which features would require a config plugin or custom native module
- Test on physical devices from day one — Expo Go on simulator hides real notification/background behavior

**Detection:**
- Discovering mid-build that a needed feature requires ejection
- OTA update causes crash for users on older native binary
- Prayer notifications firing at wrong times or not at all on Android (Doze mode kills background tasks)

**Phase relevance:** Phase B (MVP) — set up Expo Dev Client and EAS Build pipeline in the first sprint. This is infrastructure that gets harder to change later.

---

### Pitfall 9: Religious Content Copy That Offends or Alienates

**What goes wrong:** A well-meaning non-scholar writes game-flavored copy that trivializes Islamic concepts. "Level up your iman!" or "Unlock the Salah Power-Up!" reads as disrespectful. Or: copy is too sectarian (Sunni-only terminology alienates Shia users and vice versa). Or: Quranic verses used as "flavor text" for game elements feels irreverent.

**Why it happens:** Game designers think in game language. Islamic concepts don't map cleanly to game mechanics. What feels fun in a game context can feel blasphemous in a religious context. The line is context-dependent and requires Islamic literacy to navigate.

**Prevention:**
- Establish an "Adab Copy Guide" — a document listing acceptable and unacceptable language patterns
- Rules: never gamify Quranic ayat (don't use them as rewards or achievements), never imply levels of faith, never use casual/joking tone with Allah's names or prophetic traditions
- Keep game language and worship language in separate conceptual layers: the game rewards "discipline actions" and the Islamic layer provides "spiritual context"
- Use inclusive terminology: "Salah" not "Namaz" (or support both), avoid sect-specific fiqh positions
- Have 3+ practicing Muslims from different backgrounds review all copy before launch
- When in doubt, err toward reverent and understated over exciting and game-y

**Detection:**
- Beta testers from different Islamic backgrounds flag copy as inappropriate
- Social media criticism of screenshots/marketing materials
- Internal discomfort when reading game copy next to Islamic terminology

**Phase relevance:** Phase A (Blueprint) — create the Adab Copy Guide as part of the content pack section. Phase B (MVP) — every screen with Islamic content goes through adab review before shipping.

---

### Pitfall 10: Retention Through Guilt Instead of Intrinsic Motivation

**What goes wrong:** Push notifications become guilt trips: "You haven't prayed Fajr yet!" Missed-day messaging creates shame spirals. The app inadvertently becomes another source of religious guilt that users already struggle with. Users associate the app with feeling bad about themselves.

**Why it happens:** Standard mobile retention playbooks use loss-aversion and FOMO. These patterns work (in the short term) but are explicitly forbidden by Adab Safety Rails #4 and #5. The temptation to use them is strong because they measurably boost short-term metrics.

**Prevention:**
- Notifications should be invitations, not accusations: "Fajr window is open" not "You haven't prayed Fajr"
- Never reference what users DIDN'T do. Only reference what they CAN do.
- After-absence messaging: "Welcome back! Your journey continues." not "You've been gone for 5 days"
- Build re-engagement around curiosity (new quests available, new title within reach) not guilt (streak lost, falling behind)
- Implement a "notification tone" review: read every notification out loud and ask "does this sound like a supportive coach or a disappointed parent?"
- Track the ratio of positive to negative emotional triggers in the UX — aim for 5:1 positive

**Detection:**
- User feedback mentions feeling "guilted" or "shamed"
- Uninstall rate spikes after push notification campaigns
- Users disable notifications within the first week (signals notifications feel hostile)

**Phase relevance:** Phase A (Blueprint) — define notification philosophy and tone. Phase B (MVP) — implement with coach-mode language. Never ship guilt-based notifications, even as "growth experiments."

---

## Minor Pitfalls

---

### Pitfall 11: Day Boundary Edge Cases

**What goes wrong:** "Today's habits" roll over at midnight, but Islamic days begin at Maghrib. A user completes Isha at 11pm, then the app rolls over at midnight and shows it as tomorrow's progress. Or: Fajr at 4:30am — is that today or yesterday's Fajr?

**Prevention:**
- Define day boundaries explicitly in the data model: either use Fajr-to-Fajr (most intuitive for habits) or midnight-to-midnight (simpler)
- Document the choice and its implications
- Whatever you choose, be consistent — never mix day boundaries
- Store habit completions with both UTC timestamp and "habit day" date (which may differ from calendar date)

**Phase relevance:** Phase A (Blueprint) — day boundary definition. Phase B (MVP) — implement consistently across all habit types.

---

### Pitfall 12: Android Notification Reliability

**What goes wrong:** Android's battery optimization (Doze mode, app standby, OEM-specific killers like MIUI, Samsung, Huawei) silently kills background services. Prayer time notifications don't fire. Users miss reminders and blame the app.

**Prevention:**
- Use `expo-notifications` with exact alarm scheduling where possible
- Guide users through battery optimization exemption (unfortunately necessary on Android)
- Test on Samsung, Xiaomi, Huawei, and OnePlus specifically — each has unique background task killers
- Implement a "notification health check" that verifies notifications are working
- Reference dontkillmyapp.com for per-manufacturer workarounds

**Phase relevance:** Phase B (MVP) — Android notification testing must be a dedicated QA effort, not an afterthought.

---

### Pitfall 13: Supabase Row-Level Security Complexity

**What goes wrong:** RLS policies seem simple but become complex with relational habit data. A user's habit completions reference habits, which reference categories, which may be shared templates. Poorly written RLS policies either leak data between users or block legitimate reads, causing mysterious "empty state" bugs.

**Prevention:**
- Design RLS policies on paper before implementing
- Keep the data model flat where possible — deep joins through RLS policies are error-prone
- Test RLS by querying as different users (Supabase provides `auth.uid()` in policies)
- Use a service role for admin operations and never expose the service key to the client
- Log RLS denials in development to catch "silent empty results" bugs

**Phase relevance:** Phase B (MVP) — data model and RLS design in early sprints.

---

### Pitfall 14: Overbuilding the Game Layer Before Validating the Core Loop

**What goes wrong:** Developers spend 3 months on quest systems, boss battles, and elaborate progression trees before validating that users actually want to track Islamic habits with this app. The game layer is polished but nobody downloads the app because the core value proposition wasn't validated.

**Prevention:**
- MVP must validate: "Do Muslims want to track habits in a game-styled app?" before building Phase 2 features
- Ship the core loop (habit tracking + XP + streaks + Mercy Mode) and validate retention before building Nafs Boss Arena
- The Blueprint phase should plan for this: Phase B features are the minimum to test the hypothesis
- Measure: do users return daily? Do they complete habits? Do they engage with the game layer or ignore it?

**Detection:**
- Months into development with no user testing
- Building Phase 2 features before Phase B is shipped
- Game features getting more attention than core habit tracking UX

**Phase relevance:** Phase A (Blueprint) — scope Phase B to minimum viable game layer. Phase B — ship and validate before Phase 2.

---

### Pitfall 15: Accessibility and Internationalization Afterthoughts

**What goes wrong:** 16-bit pixel art with small text is unreadable for users with visual impairments. Arabic script rendering in a pixel-art UI breaks layout. RTL support is missing. App is English-only despite a global Muslim audience.

**Prevention:**
- Support dynamic text scaling from day one (React Native's `allowFontScaling`)
- Design pixel-art UI elements at sizes that remain readable at 1.5x text scale
- Plan for Arabic/RTL from the start — it's much harder to add later than to design for initially
- Use `I18next` or similar from the beginning, even if launching English-only — string extraction is painful to retrofit
- Test with VoiceOver/TalkBack for critical flows (habit completion, prayer tracking)

**Phase relevance:** Phase A (Blueprint) — RTL and i18n architecture decisions. Phase B (MVP) — English-first but with i18n infrastructure in place.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase A: Blueprint | Over-designing game economy without playtest data | Model on spreadsheet, but mark all numbers as "initial values, tune with data" |
| Phase A: Blueprint | Adab copy guide skipped as "we'll figure it out" | Make it a required section of the design doc |
| Phase B: Data layer | Choosing Supabase sync without local-first strategy | Decide on WatermelonDB / MMKV / SQLite + sync protocol before writing data code |
| Phase B: Animations | Prototyping with Animated API, planning to "switch later" | Start with Reanimated 3 + Skia from sprint 1 |
| Phase B: Notifications | Testing only on iOS, assuming Android works similarly | Dedicate QA time to Samsung/Xiaomi/Huawei notification testing |
| Phase B: Prayer times | Hardcoding one calculation method | Ship with configurable calculation methods from the start |
| Phase B: Streaks | Shipping streaks without Mercy Mode | Never ship streaks without recovery — they are the same feature |
| Phase 2: Social features | Public accountability becoming public worship display | Private Accountability Duos must never show worship completion details to partners |
| Phase 2: Boss battles | Nafs Boss Arena trivializing spiritual struggle | Frame as "discipline challenges" not "fighting your nafs" — maintain reverence |

---

## Sources

- Training data knowledge of React Native/Expo ecosystem, gamification design patterns, Islamic app design considerations, offline-first architecture patterns
- Confidence: MEDIUM overall — claims are based on well-established patterns in training data but could not be verified against current (2026) documentation due to web search unavailability
- Specific confidence notes:
  - React Native animation pitfalls (Reanimated 3, Skia): HIGH confidence from extensive training data
  - Supabase offline limitations: HIGH confidence — Supabase is known to be server-first
  - Streak psychology and gamification pitfalls: HIGH confidence — well-documented in behavioral design literature
  - Prayer time calculation complexity: HIGH confidence — well-known domain challenge
  - Expo managed workflow limitations: MEDIUM confidence — Expo evolves rapidly, specifics may have changed
  - Android notification reliability: HIGH confidence — this is a persistent, well-documented Android platform issue
