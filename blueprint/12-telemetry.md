# 12 — Telemetry and Experimentation Plan

> **Requirement:** BLUE-12
> **Cross-references:** [Tech Architecture](./10-tech-architecture.md) · [Game Design Bible](./03-game-design-bible.md) · [Feature Systems](./05-feature-systems.md) · [Data Model](./11-data-model.md)

---

## Privacy Principles

Telemetry exists to improve the product, not to surveil worship. These principles are non-negotiable.

1. **No worship data in telemetry.** No salah times, no Quran reading sessions, no Muhasabah content, no dhikr counts, no fasting logs. The app tracks *that* a habit was completed, never *which* habit.
2. **No PII.** No names, no emails, no GPS coordinates. Location is city-level only (for prayer time calculation method, never transmitted as telemetry).
3. **Behavioral patterns only.** Did the user open the app? Did they complete *a* habit (count, not identity)? Did they level up? These are product health signals, not worship surveillance.
4. **Opt-out available.** Users can disable all telemetry from Settings. When opted out, zero events are sent — no "essential analytics" loophole.
5. **On-device aggregation preferred.** Where possible, aggregate on-device before transmitting (e.g., send "completed 5 habits today" not 5 individual events).
6. **No cross-referencing to reconstruct worship patterns.** Even if individual events are safe, combinations must not reveal which prayers a user performs. Title rarity is sent (not title name), quest type is sent (not quest content).

---

## North Star Metric

**DAU-Completion: Daily Active Users who complete 1+ habits**

| Attribute | Detail |
|-----------|--------|
| **Definition** | Unique users who open the app AND complete at least one habit in a calendar day (user's local timezone) |
| **Why this metric** | Measures both engagement (they opened it) AND core value delivery (they used it for its purpose). Pure DAU rewards doomscrolling; DAU-Completion rewards discipline. |
| **Target (Month 1)** | 60% of installed users are DAU-Completion on any given day |
| **Target (Month 3)** | 40% D30 retention among DAU-Completion users |
| **Anti-gaming** | Only counts real habit completions, not app opens or settings changes |

**Secondary North Star: Weekly Active Days**

Average number of days per week a user completes 1+ habits. Target: 5.0+ days/week for retained users. This measures consistency — the core product promise.

---

## Event Catalog

All events are privacy-safe by design. The `Privacy` column confirms each event passes the worship-data test.

| # | Event Name | Category | Payload | Privacy Safe | Notes |
|---|-----------|----------|---------|:------------:|-------|
| 1 | `app_opened` | Session | `{ day_of_week, session_number, hours_since_last }` | Yes | No location, no time-of-day (could reveal prayer patterns) |
| 2 | `app_backgrounded` | Session | `{ session_duration_seconds }` | Yes | Duration only, no screen visited |
| 3 | `habit_completed` | Core | `{ habit_count_today, xp_earned, streak_length, multiplier }` | Yes | Count-only — never habit name, type, or category |
| 4 | `quest_started` | Core | `{ quest_tier, quest_slot }` | Yes | Tier (daily/weekly), not quest content |
| 5 | `quest_completed` | Core | `{ quest_tier, xp_earned }` | Yes | No quest description |
| 6 | `level_up` | Progression | `{ new_level, total_xp }` | Yes | Level number only |
| 7 | `title_unlocked` | Progression | `{ title_rarity }` | Yes | Rarity tier (Common/Rare/Legendary), NOT title name (would reveal worship patterns) |
| 8 | `streak_milestone` | Progression | `{ milestone_days, habit_count_at_milestone }` | Yes | Milestone number (7, 14, 30, 60, 90, 180, 365), not which habit |
| 9 | `streak_broken` | Recovery | `{ streak_length_at_break, habits_affected_count }` | Yes | Length only, not which habits |
| 10 | `mercy_mode_activated` | Recovery | `{ streak_length_at_break }` | Yes | No habit identity |
| 11 | `mercy_mode_completed` | Recovery | `{ recovery_duration_days, xp_earned }` | Yes | Duration and reward only |
| 12 | `mercy_mode_expired` | Recovery | `{ recovery_duration_days }` | Yes | Player didn't complete recovery |
| 13 | `muhasabah_completed` | Engagement | `{ duration_seconds }` | Yes | No content, no prompts, no responses — duration only |
| 14 | `muhasabah_skipped` | Engagement | `{}` | Yes | Binary signal only |
| 15 | `onboarding_completed` | Funnel | `{ duration_seconds, habits_selected_count, niyyah_set }` | Yes | Count of habits, not which ones. Niyyah is boolean (set/not), no content. |
| 16 | `onboarding_step_viewed` | Funnel | `{ step_name, duration_seconds }` | Yes | Step name is generic (welcome, niyyah, habits, done) |
| 17 | `settings_changed` | Engagement | `{ setting_category }` | Yes | Category only (notifications, prayer_method, privacy, display), never the value |
| 18 | `notification_tapped` | Engagement | `{ notification_type }` | Yes | Type (prayer_reminder, muhasabah, quest_refresh), not content |
| 19 | `notification_dismissed` | Engagement | `{ notification_type }` | Yes | Mirrors tapped event for dismiss |
| 20 | `error_occurred` | Health | `{ error_type, screen }` | Yes | Crash/error category, no user data |
| 21 | `telemetry_opted_out` | Meta | `{}` | Yes | Last event sent before telemetry stops |

**Total: 21 events.** All pass the privacy test: no event payload can identify which worship practice a user performs.

### Event Naming Convention

- Lowercase snake_case
- Past tense for completed actions (`habit_completed`, `quest_started`)
- Category prefix not used in event name (category is a metadata field)
- All events include implicit fields: `event_id` (UUID), `user_id` (anonymous hash), `timestamp` (UTC), `app_version`, `platform` (iOS/Android)

---

## Retention Metrics

Derived from the event catalog above. Calculated server-side from aggregated event data.

| Metric | Definition | Target | Source Events |
|--------|-----------|--------|---------------|
| **D1 Retention** | % of new users who return Day 1 after install | 65% | `app_opened` |
| **D7 Retention** | % of new users who return Day 7 | 40% | `app_opened` |
| **D14 Retention** | % of new users who return Day 14 | 30% | `app_opened` |
| **D30 Retention** | % of new users who return Day 30 | 25% | `app_opened` |
| **Weekly Active Days** | Average days/week user completes 1+ habits | 5.0 | `habit_completed` |
| **Streak Length Distribution** | Histogram of active streak lengths (buckets: 1-3, 4-7, 8-14, 15-30, 31-60, 60+) | Median > 7 days | `streak_milestone`, `streak_broken` |
| **Completion Rate** | % of active habits completed per day per user | 70%+ | `habit_completed` |
| **Mercy Mode Recovery Rate** | % of Mercy Mode activations that complete recovery | 50%+ | `mercy_mode_activated`, `mercy_mode_completed` |

---

## Burnout Indicators

These signals detect when a user may be losing motivation before they churn. Monitored as trailing 7-day averages compared to the user's personal baseline (previous 30-day average).

| # | Indicator | Signal | Measurement | Alert When |
|---|-----------|--------|-------------|------------|
| 1 | **Declining daily completions** | User completing fewer habits week-over-week | 7-day completion count vs. 30-day avg | Drops below 60% of personal baseline for 2 consecutive weeks |
| 2 | **Muhasabah skip rate increasing** | User skipping reflections more often | 7-day skip rate vs. 30-day avg | Skip rate exceeds 80% after previously being below 50% |
| 3 | **Session duration shortening** | User spending less time per session | 7-day avg session vs. 30-day avg | Drops below 50% of personal baseline |
| 4 | **Mercy Mode frequency increasing** | User hitting Mercy Mode more often | Mercy Mode activations per 30-day window | 3+ activations in a 30-day window |
| 5 | **Quest engagement dropping** | User not starting or completing quests | 7-day quest completion rate vs. baseline | Drops below 30% of personal baseline |

**Alert threshold:** If 3+ indicators trigger simultaneously for a single user, flag the pattern for product review. This is an aggregate product signal — no individual user is contacted or shamed. The alert informs product decisions (e.g., "are our quests getting stale?"), never user-facing interventions.

**Important:** Burnout indicators are computed server-side on anonymized, aggregated data. They are never shown to the user. They never trigger guilt notifications. They exist solely to improve the product.

---

## A/B Test Framework

### Infrastructure

Simple variant assignment via deterministic hash:

```
variant = hash(user_id + experiment_name) % num_variants
```

- No external A/B testing SDK required
- Variant assignment is deterministic and stable (same user always gets same variant)
- Experiment definitions stored in a remote config table (Supabase)
- Client fetches active experiments on app launch, caches locally
- Results aggregated server-side from event payloads that include `experiment_variants: { exp_name: variant }`

### Initial A/B Test Ideas

| # | Experiment | Hypothesis | Variants | Primary Metric |
|---|-----------|-----------|----------|---------------|
| 1 | **Quest rotation frequency** | More frequent quest rotation increases engagement | A: Weekly refresh, B: Daily partial refresh (2 of 5 quests rotate) | Quest completion rate |
| 2 | **Mercy Mode message variants** | Different recovery framing affects recovery completion | A: Islamic wisdom focus, B: Game mechanic focus, C: Blended (current) | Mercy Mode recovery rate |
| 3 | **XP multiplier cap** | Lower cap reduces perceived punishment on streak break | A: 3.0x cap (current), B: 2.5x cap, C: 2.0x cap | Streak break churn rate |
| 4 | **Onboarding flow length** | Shorter onboarding reduces drop-off | A: 4 steps (current), B: 3 steps (skip niyyah initially), C: 5 steps (add tutorial) | Onboarding completion rate, D7 retention |
| 5 | **Muhasabah prompt style** | Prompt framing affects completion rate | A: Question format ("What went well?"), B: Statement format ("Reflect on one blessing") | Muhasabah completion rate |

### Guardrails

- Maximum 2 experiments active simultaneously (solo dev cannot analyze more)
- Minimum 100 users per variant before drawing conclusions
- No experiments that affect adab safety rails (copy tone, privacy, shame language)
- No experiments on worship-adjacent features that could feel manipulative

---

## Anti-Metric Traps

Metrics that should be explicitly avoided as optimization targets. These are traps that lead products toward dark patterns.

| # | Trap Metric | Why It Is Dangerous | What to Track Instead |
|---|------------|--------------------|--------------------|
| 1 | **Session length** | Optimizing for time-in-app incentivizes addiction patterns. HalalHabits should be a 3-10 minute/day app. Longer sessions mean the UI is confusing, not engaging. | Session *count* per day (frequency > duration) |
| 2 | **Notification tap rate** | Optimizing for taps leads to clickbait notifications and eventually spam. | Notification *relevance* (did user complete a habit within 30 min of tapping?) |
| 3 | **Individual worship patterns** | Tracking which prayers a user completes creates a surveillance tool. Even well-intentioned "insights" become a spiritual judgment engine. | Aggregate completion count only |
| 4 | **Engagement score** | Any composite "engagement" metric will eventually become an internal iman/taqwa score by proxy. Discipline is not worship quality. | Individual metrics kept separate, never composited into a single score |
| 5 | **Streak length as success metric** | Optimizing for streak length punishes recovery and incentivizes the team to make Mercy Mode harder. | Mercy Mode recovery rate (healthy recovery = product success) |
| 6 | **Daily Active Users (alone)** | Pure DAU rewards opening the app without doing anything useful. | DAU-Completion (opened AND completed 1+ habits) |

---

## Implementation Notes

### Phase 2 (Foundation) Telemetry Setup

- Install a lightweight analytics client (Supabase Edge Function endpoint or simple REST API)
- Implement event dispatcher with privacy gate check (events pass through same Privacy Gate as data)
- Add telemetry opt-out toggle to Settings store
- Implement on-device event batching (send every 5 minutes or on app background, whichever comes first)
- All events go through a `TelemetryService.track(eventName, payload)` interface — single point of control

### Event Validation

- Every event payload is validated against a schema before dispatch
- Unknown fields are stripped (defense against accidentally leaking data)
- Privacy Gate audit: automated test that no event payload contains fields from the PRIVATE data classification (see [Data Model](./11-data-model.md))

---

*Section 12 of 16 — Master Blueprint*
*Requirement: BLUE-12*
