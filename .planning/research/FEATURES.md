# Feature Landscape

**Domain:** Gamified Islamic habit-building mobile app — v2.0 Social & Battle Systems milestone
**Researched:** 2026-03-19
**Scope:** NEW features only. All v1.0 features (habit tracking, XP, streaks, Mercy Mode, Salah Shield, Quest Board, Muhasabah, Identity Titles, HUD, Onboarding, Profile, Auth, Sync) are already built and verified.

---

## v2.0 New Feature Set Overview

Five feature systems being added to an existing, working app:

1. **Private Accountability Buddies** — social connections, shared habits, duo quests, filtered chat
2. **Nafs Boss Arena** — multi-day boss battles against 5 archetypes of the ego
3. **Dopamine Detox Dungeon** — voluntary anti-doomscrolling time challenges
4. **Friday Power-Ups** — Jumu'ah 2x XP multiplier + Surah Al-Kahf challenge
5. **In-App Filtered Messaging** — chat between buddies with content moderation

---

## Table Stakes

Features the new systems must have to feel complete. Missing any of these makes the feature feel half-baked.

### Buddy System Table Stakes

| Feature | Why Expected | Complexity | Dependency |
|---------|--------------|------------|------------|
| Invite via code OR username search | Industry standard (Habitica, Cohorty, Accountable2You all use invite codes + username lookup) | Medium | Auth (already built), Supabase users table |
| Accept / decline / remove buddy | Users must be able to manage connections without being locked in | Low | Buddy relationship table |
| Buddy list view (up to 20) | Core management screen; 20-cap shown with clear visual of who's connected | Low | Buddy relationship table |
| See buddy's public progress summary | Accountability only works if you can see each other's effort — not private worship stats, just XP and habit completion rate | Medium | Privacy Gate (sync public stats only, never salah logs) |
| Shared habit goal creation | Both players commit to the same habit; completion tracked separately | Medium | Habit system (already built) |
| Duo quest mechanics | Both players must complete their conditions within the time window for quest credit | High | Quest Board (already built) + buddy relationship |
| Offline resilience | Buddy data syncs when online; app works fully offline without buddy features blocking solo use | Medium | Sync engine (already built) |

### Boss Battle Table Stakes

| Feature | Why Expected | Complexity | Dependency |
|---------|--------------|------------|------------|
| Boss health pool with visible progress bar | Users need to see they are making progress over multiple days | Low | Game engine (already built) |
| Daily contribution mechanic | Habit completions deal damage; missing habits = boss heals or counter-attacks | Medium | Game engine + habit tracking |
| Multi-day duration (3-14 days) | Boss battles in habit apps (Habitica model) last days to weeks; single-day is not a "battle" | Low | Scheduling / date tracking |
| Clear win/loss resolution | When HP reaches 0 (win) or time expires (loss), clear outcome screen with XP reward | Low | Game engine |
| Level unlock gate (Level 10+) | Already decided in PROJECT.md; prevents new users being overwhelmed | Low | Level system (already built) |
| 5 distinct boss archetypes | Nafs concept has specific Quranic/scholarly roots; five archetypes add identity and replayability | High | Content design |

### Dopamine Detox Table Stakes

| Feature | Why Expected | Complexity | Dependency |
|---------|--------------|------------|------------|
| User-initiated start (voluntary) | Must never be forced; Forest, Opal, BeTimeful all make sessions opt-in | Low | Timer system |
| Duration selection (2-8hr range) | Users want control over challenge length; fixed duration feels patronizing | Low | Timer system |
| Active session timer display | Users need to see how much time remains — Forest model | Low | Timer, HUD layer |
| Completion reward (XP + title progress) | Completing the session must feel meaningful; without reward, repeat rate drops sharply | Low | XP system (already built) |
| Early exit with cost | Session should have friction to abandon but not be unbreakable — Opal's "normal" mode model (delay + confirm) | Medium | Timer + state |
| Daily variant + weekly deep variant | PROJECT.md specifies this; daily (2-4hr) and weekly deep (6-8hr) are distinct challenges | Low | Scheduling + Quest Board |

### Friday Power-Ups Table Stakes

| Feature | Why Expected | Complexity | Dependency |
|---------|--------------|------------|------------|
| Friday detection from device calendar/date | System must automatically activate on Fridays; no user configuration | Low | Date/time (already handled via adhan-js) |
| 2x XP multiplier active all day Friday | Clear display in HUD showing multiplier is active | Low | XP system (already built) |
| Surah Al-Kahf challenge card | Weekly habit card appears on Friday morning; records completion | Low | Quest Board (already built) |
| Hadith/reminder copy for Friday | Culturally resonant; apps like DeenUp do simple weekly Al-Kahf tracking | Low | Content system |
| Multiplier visible to user | HUD must show "Jumu'ah Boost Active" or equivalent | Low | HUD (already built) |

### Messaging Table Stakes

| Feature | Why Expected | Complexity | Dependency |
|---------|--------------|------------|------------|
| 1:1 messaging between buddies only | No group chats, no open channels — keeps it private and safe | Medium | Buddy relationship + Supabase Realtime |
| Profanity / harmful content filter | Required for any platform with user-generated messaging; legal and trust risk without it | Medium | bad-words npm library or similar |
| Message history (persistent) | Users expect chat history; ephemeral-only chat feels unreliable | Medium | Supabase messages table |
| Report / block user | Safety valve; users must be able to escape bad interactions | Medium | Moderation table |
| Offline queue (send when back online) | App is offline-first; messages queued locally and sent on reconnect | Medium | Sync engine (already built) |

---

## Differentiators

Features that make v2.0 stand out from anything comparable in the Islamic app or gamified habit space.

### High-Value Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Nafs as boss archetype framing | No competitor has gamified the Islamic concept of nafs (Ammara, Lawwama, Mutmainna spectrum) as boss encounters; this is theologically grounded AND game-design novel | High | Requires careful content design; the 5 archetypes must map to real Islamic scholarship (Imam Al-Ghazali's categorization is the reference point) |
| Duo quest requiring both completions | Habitica's party model damages ALL members for one person's miss; this is seen as motivating but also stressful. HalalHabits' duo quest model (both must complete to claim reward) is cooperative without punishing — adab-aligned | High | Differentiates from Habitica's accountability-via-punishment model |
| Dopamine Detox as Islamic value, not just productivity | Framing screen detox as jihad al-nafs (struggle against the lower self) gives it spiritual meaning that Forest and Opal cannot provide | Medium | Copy and framing are the differentiator, not the mechanics |
| Friday as game event, not just calendar day | Making Jumu'ah a weekly "event" in the game world (HUD changes, multiplier active, special quest card) embeds Islamic rhythm into the game loop rather than overlaying it | Medium | No Islamic app treats Friday as a game event; this is novel |
| Buddy system without public leaderboards | Competing apps either have no social (Pillars) or have public pressure (Habitica guilds, Ramadan Challenge app's global ummah leaderboards). HalalHabits' private 1:1 accountability is the adab-safe middle ground | High | The constraint IS the differentiator for the Muslim audience concerned about riya |
| Boss counter-attack for missed habits | Missed habits cause the boss to heal or deal counter-damage; makes the multi-day battle feel alive and stakes-driven rather than just a slow XP grind | Medium | Adds drama without punishment-shaming; the consequence is mechanical, not moral |

### Secondary Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Mercy Mode integration with Boss Arena | If Mercy Mode is active during a boss battle, boss counter-attack is reduced (not eliminated); acknowledges life happens | Low | Ties v1 and v2 systems together elegantly |
| Identity Title unlock from dungeon completions | Completing Dopamine Detox sessions can contribute to specific Title conditions (e.g., "The Focused") | Low | Expands Title system naturally |
| Duo quests referencing existing Quest Board | Duo quests use the same quest infrastructure as solo quests; they are not a separate system | Medium | Reduces implementation surface |
| Surah Al-Kahf hadith rotating display | Each Friday surfaces a different verified hadith about the day's significance; builds a curated content library over time | Low | Content investment, low code complexity |

---

## Anti-Features

Features common in comparable apps that would be harmful or wrong for HalalHabits v2.0.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Public buddy leaderboards | Riya risk; comparing worship publicly is against Islamic adab. Ramadan Challenge app does this ("compete with global ummah") and it violates PROJECT.md's hard constraint | Private progress summary visible only to direct buddies |
| Buddy streaks displayed to others (salah, Muhasabah) | Private worship data (salah logs, Muhasabah reflections) must never be visible to buddies — Privacy Gate constraint from v1 | Share only non-worship stats: total XP this week, habit streak count (not which habits) |
| Boss battle party damage (Habitica model) | Habitica's mechanic where one person's miss harms the whole party is widely reported as stressful and guilt-inducing; contradicts Mercy Mode philosophy | Boss counter-attacks heal boss HP, don't damage the player's non-battle resources |
| Forced social features | Buddy system, duo quests, and messaging must be entirely optional; solo users must have full access to all features except duo quests | All v2 social features are opt-in; solo Nafs boss battles, solo dungeon runs |
| App-level screen locking (Opal-style deep lock) | React Native apps cannot enforce OS-level app blocking without MDM or Screen Time API (iOS restriction); false promise would break trust | Timer and tracking only; honor system + framing the challenge as a personal commitment (jihad al-nafs) |
| AI-generated religious copy for boss/Friday content | Hallucination risk with Islamic content is unacceptable; must be human-reviewed | All boss archetype descriptions, Friday hadith, and Nafs copy must be pre-written and reviewed before shipping |
| In-app video or voice messaging | Massively increases moderation surface area and infrastructure complexity for a solo dev | Text-only messaging; emoji reactions acceptable |
| Group chats or channels | Group moderation at scale is a full-time job; adds nothing for a max-20-buddy system | 1:1 messaging only; duo quest coordination happens in 1:1 chat |
| Automatic Friday push notifications about productivity | "Use your Jumu'ah time productively!" is misaligned with the spiritual weight of the day | Gentle, opt-in notification about 2x XP window; never productivity framing |
| Permanent session locks for Detox Dungeon | Users in genuine emergencies must be able to exit; hard locks are a safety risk and alienate users | Exit with friction (confirmation + XP cost penalty), not hard lock |

---

## Feature Dependencies

```
[v1 Already Built]
  Habit Tracking + Quest Board + XP System + Identity Titles + HUD
  Supabase Auth + RLS + Sync Engine + Privacy Gate
  Notification System + Profile + SQLite local store

[v2 New Dependencies]
  Buddy Relationship Table --> Buddy List View
  Buddy Relationship Table --> Shared Habit Goals
  Buddy Relationship Table --> Duo Quests
  Buddy Relationship Table --> 1:1 Messaging
  Buddy Relationship Table --> Progress Sharing (public stats only)

  Game Engine [v1] --> Nafs Boss Arena (boss HP, damage, counter-attack)
  Habit Tracking [v1] --> Nafs Boss Arena (completions deal damage)
  Identity Titles [v1] --> Nafs Boss Arena (win unlocks boss-specific title)
  Level System [v1] --> Nafs Boss Arena gate (Level 10+ unlock)
  Mercy Mode [v1] --> Nafs Boss Arena (reduced counter-attack when Mercy Mode active)

  Quest Board [v1] --> Dopamine Detox Dungeon (dungeon is a quest type)
  XP System [v1] --> Dopamine Detox Dungeon (completion grants XP)
  Identity Titles [v1] --> Dopamine Detox Dungeon (title condition contribution)
  HUD [v1] --> Dopamine Detox Dungeon (active session timer shown in HUD)

  adhan-js [v1] --> Friday Power-Ups (day detection already present)
  XP System [v1] --> Friday Power-Ups (2x multiplier wraps existing XP earn)
  Quest Board [v1] --> Friday Power-Ups (Al-Kahf challenge card is a quest)
  HUD [v1] --> Friday Power-Ups (Jumu'ah boost state shown in HUD)

  Supabase Realtime --> 1:1 Messaging (Broadcast + DB pattern)
  Sync Engine [v1] --> Messaging offline queue
  Profanity filter library --> Message content moderation
```

### Critical Path for v2.0

```
1. Supabase schema extensions (buddy relationships, messages, boss_battles tables)
2. Buddy invitation + connection system (invite code + username search)
3. Progress sharing layer (what public stats are safe to expose — Privacy Gate extension)
4. Friday Power-Ups (lowest complexity; quick win, activates every Friday)
5. Nafs Boss Arena solo mode (individual boss battles; no buddy dependency)
6. Dopamine Detox Dungeon (timer + honor system + XP reward)
7. Shared habit goals between buddies (extends v1 habit system)
8. Duo quests (extends v1 quest system; requires buddy relationship + shared habit tracking)
9. In-app messaging with content filtering (Supabase Realtime; most infrastructure complexity)
```

---

## Complexity Assessment

| Feature | Complexity | Bottleneck | Solo Dev Risk |
|---------|------------|------------|---------------|
| Friday Power-Ups | Low | Content writing (hadith review) | Low |
| Dopamine Detox Dungeon (timer only) | Low-Medium | HUD integration for active session | Low |
| Boss Arena (solo, basic HP system) | Medium | Game balance; boss archetype content | Medium |
| Buddy system (connection only) | Medium | Supabase schema + RLS for buddy visibility | Medium |
| Progress sharing (public stats) | Medium | Privacy Gate extension; what to expose safely | Medium |
| Shared habit goals | Medium | Two-user state reconciliation offline | Medium |
| 1:1 Messaging (basic) | Medium-High | Supabase Realtime setup + offline queue | High |
| Content moderation pipeline | Medium | Integration of profanity library + report flow | Medium |
| Duo quests | High | Requires buddy system + shared habits + quest system all wired | High |
| Boss counter-attack mechanic | Medium | Balance tuning; risk of feeling punishing | Medium |

---

## MVP Recommendation for v2.0 Milestone

### Phase A — Deliver first (lower risk, no buddy dependency)

1. **Friday Power-Ups** — Date detection is already in adhan-js; 2x XP wraps existing system; Al-Kahf quest card uses existing Quest Board. Ship in first sprint.
2. **Dopamine Detox Dungeon** — Timer + XP reward + honor system exit; HUD integration. No social dependency.
3. **Nafs Boss Arena (solo)** — HP system + daily damage + win/loss resolution + 5 boss archetype content. Level 10 gate already decided.

### Phase B — Deliver second (requires Supabase schema work)

4. **Buddy connection system** — Invite codes + username search + relationship table + RLS policies.
5. **Progress sharing** — Public XP/habit-count view for buddies; Privacy Gate extension vetted.
6. **Shared habit goals** — Both players track same habit; shared goal state.

### Phase C — Deliver last (highest complexity)

7. **Duo quests** — Requires Phase B buddy system + shared habits fully working.
8. **1:1 Messaging** — Supabase Realtime + offline queue + profanity filter + report flow.

### Defer

- **Group messaging** — Cut entirely; anti-feature for this context.
- **Boss battles between buddies** — Appealing but adds another layer of co-op complexity; solo boss arena validates the mechanic first.
- **Public boss leaderboards** — Anti-feature; violates adab safety rails.

---

## Competitive Context for v2.0 Features

| Feature | Habitica | Ramadan Challenge | Opal | Forest | **HalalHabits v2** |
|---------|----------|-------------------|------|--------|---------------------|
| Social accountability | Party (guilt-based) | Public global leaderboard | Friend screen time compare | Friends plant together | **Private buddies only (adab-safe)** |
| Boss battles | Party quests (group damage) | None | None | None | **Solo + optional duo; Islamic nafs framing** |
| Screen detox mechanic | None | None | Deep lock (OS-level) | Grow tree (honor system) | **Honor system + Islamic spiritual framing** |
| Friday/weekly special event | None | Ramadan-only | None | None | **Jumu'ah 2x XP + Al-Kahf challenge** |
| In-app chat | Guild chat (public, moderated) | None | None | None | **Private 1:1 filtered chat** |

---

## Sources

- [Habitica Wiki: Boss Mechanics](https://habitica.fandom.com/wiki/Boss) — Damage formula, health pools, party accountability model (HIGH confidence via wiki)
- [Habitica Gamification Case Study (2025)](https://trophy.so/blog/habitica-gamification-case-study) — Party boss accountability patterns (MEDIUM confidence)
- [Opal Screen Time App](https://www.opal.so/) — Voluntary lock mechanics, focus levels model (MEDIUM confidence)
- [Best Accountability Partner Apps 2025](https://bymilliepham.com/best-accountability-partner-apps) — Invite code patterns, connection UX (MEDIUM confidence)
- [Cohorty: Friend Accountability Apps 2025](https://www.cohorty.app/blog/friend-accountability-apps-build-habits-together-2025-guide) — Group accountability patterns, social habit features (MEDIUM confidence)
- [Stream.io: Profanity Filtering in React Native](https://getstream.io/blog/filtering-profanity-in-chat-with-react-native/) — Content moderation implementation patterns (HIGH confidence — official docs)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime) — Broadcast + DB pattern for chat; RLS for message security (HIGH confidence — official docs)
- [Dopamine Detox Apps (HealthyFax 2025)](https://healthyfax.com/2025/07/22/dopamine-detox-apps/) — Detox app mechanics, voluntary challenge patterns (MEDIUM confidence)
- [DeenUp: Surah Al-Kahf and Friday](https://www.deenup.app/blog/surah-al-kahf-friday-blessing) — Friday challenge patterns in Islamic apps (MEDIUM confidence)
- [Halal Leveling App](https://halalleveling.com/) — Competitor landscape for Islamic gamification (MEDIUM confidence)
- [Digital Detox 2026 trends](https://www.oneworldnews.com/joyousnews/digital-detox-2026/) — Dopamine detox as structured lifestyle practice (LOW confidence — news source)
- [Nafs in Islamic Psychology (ISIP)](https://www.isip.foundation/soul-islamic-psychology/) — Scholarly basis for nafs archetypes used in boss design (HIGH confidence for content framing)
- [Gamificationplus.uk: Best gamified habit apps 2026](https://gamificationplus.uk/which-gamified-habit-building-app-do-i-think-is-best-in-2026/) — Ecosystem overview (MEDIUM confidence)

**Confidence summary:**
- Friday Power-Ups mechanics: HIGH (simple date logic + existing XP system)
- Dopamine Detox honor-system model: HIGH (Forest is the proven reference; OS-level blocking not possible in RN)
- Nafs Boss Arena mechanics: HIGH (Habitica wiki is authoritative; Islamic content framing is training-data knowledge)
- Buddy system patterns: MEDIUM (industry standard UX, but RLS/privacy implementation needs careful verification)
- 1:1 Messaging via Supabase Realtime: HIGH (official docs, well-documented pattern)
- Content moderation via bad-words + report flow: MEDIUM (library exists, scale concerns minimal for private 1:1 chat)
- Islamic content (nafs archetypes, Friday hadith): MEDIUM (scholarly basis is solid; specific hadith selection requires human review before shipping)
