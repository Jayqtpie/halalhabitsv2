# 01 — Executive Product Vision

> **Requirement:** BLUE-01
> **Cross-references:** [Player Fantasy](./02-player-fantasy.md) · [Game Design Bible](./03-game-design-bible.md)

---

## Product Statement

HalalHabits: Ferrari 16-Bit Edition is a game-first Islamic discipline platform that turns daily worship anchors and character habits into a premium retro RPG experience. Players earn XP for real-world consistency — not perceived piety — leveling up through a game world that evolves with their discipline. It combines the motivational pull of progression-based games with the reverence and privacy that Islamic practice demands, wrapped in a modern pixel revival aesthetic inspired by Celeste and Hyper Light Drifter.

## Market Gap Analysis

The Islamic app market serves over 1.8 billion Muslims, yet the dominant players share a critical blindspot: they are **utility-first, not motivation-first**.

### Existing Landscape

| App | What It Does Well | Where It Falls Short |
|-----|-------------------|---------------------|
| **Muslim Pro** | Prayer times, Quran reader, community | Pure utility — no behavioral motivation, no game mechanics, no identity progression |
| **Pillars** | Clean habit tracking for Muslims | Tracker-first — no game feel, no XP, no evolving world, shallow engagement loop |
| **Tarteel** | AI-powered Quran recitation | Single-feature tool — doesn't address habit building or daily discipline |
| **Productive / Habitica** | General habit tracking with gamification | No Islamic context — feels disconnected from spiritual practice, culturally generic |

### The Gap

No product in the market combines these four elements:

1. **Game-first discipline** — not a tracker with badges, but a genuine game economy where consistency unlocks progression, titles, and world evolution
2. **Effort-based XP** — rewards the act of showing up, never claims to measure spiritual state or closeness to Allah
3. **Offline-first privacy** — worship data stays on the player's device; the app never knows what du'a you made or how your Muhasabah went
4. **Mercy-forward recovery** — when players miss a day, they get a recovery quest and compassionate encouragement, not a guilt notification

The young Muslim who games (18-30, digitally native, plays mobile or console regularly) has no app that speaks their language. Existing Islamic apps feel like obligations. HalalHabits feels like a challenge they chose.

## Differentiation Narrative

HalalHabits is not a habit tracker with an Islamic skin. It is not a prayer reminder with points. It is a **discipline game** where the player's real-world Islamic practice is the controller.

**What makes it different:**

- **Game-first, not tracker-first.** The Home screen is a pixel art game world, not a checklist. Progress is visual, spatial, and evolving — your discipline literally builds your world.
- **Effort-based XP, not worship scoring.** You earn XP for completing the action. The app never says "your iman is level 12" or "your taqwa score dropped." It says "your discipline grows stronger."
- **Offline-first privacy.** Salah logs, Muhasabah reflections, and habit completion data never leave the device. The cloud stores your XP, settings, and profile — never your worship.
- **Modern pixel revival aesthetic.** Deep jewel tones (emerald, sapphire, ruby, gold) on dark backgrounds. Pixel art characters and environments with modern lighting and particle effects. Premium, not nostalgic-kitsch.
- **Mercy-forward recovery.** Streaks motivate, but broken streaks don't punish. Mercy Mode activates with compassionate recovery quests. The door of tawbah is always open — mechanically and thematically.
- **Identity Titles, not leaderboards.** Players earn titles like "The Steadfast" (40 consecutive Fajr prayers) that reflect their personal journey. No public ranking. No comparison. Your growth is yours.

## Target Audience

### Primary Persona: The Disciplined Gamer

- **Age:** 18-30
- **Profile:** Muslim who games regularly (mobile, console, or PC), wants to build stronger Islamic habits, turned off by guilt-based apps and dry checklist tools
- **Pain points:** Inconsistency in salah timing, struggles with doomscrolling, wants structure but not rigidity, finds existing Islamic apps uninspiring
- **Motivation:** Wants to see tangible progress in discipline, responds to game mechanics (XP, levels, achievements), values privacy in worship
- **What hooks them:** The game world, fast early leveling, Identity Titles that feel earned
- **What keeps them:** The daily return loop (streaks, quests, world evolution), Mercy Mode when they slip

### Secondary Persona: The Seeking Newcomer

- **Age:** 18-35
- **Profile:** New Muslim or returning-to-practice Muslim learning the basics, needs Arabic-with-context approach ("Complete your Dhikr (remembrance) session")
- **Pain points:** Overwhelmed by the breadth of Islamic practice, unsure where to start, intimidated by apps that assume existing knowledge
- **Motivation:** Wants a guided, low-pressure on-ramp to consistent habits
- **What hooks them:** The Niyyah (intention-setting) onboarding, curated preset habit library, gentle mentor voice
- **What keeps them:** Progressive disclosure (start with 2-3 habits, expand naturally), no shame for learning pace

## Core Value Proposition

> **Build real-world Islamic discipline through game mechanics that motivate behavior without claiming to measure spiritual worth.**

The app measures effort, not faith. It rewards consistency, not perfection. It builds identity through titles, not comparison through leaderboards. And when you fall, it opens a door — never points a finger.

## Adab Safety Rails

These eight constraints are non-negotiable across all code, copy, and design. They exist because Islamic ethics demand that any tool touching worship must be built with adab (proper conduct) toward the sacred.

| # | Rail | Why It Exists |
|---|------|---------------|
| 1 | **No public worship leaderboards** | Publicizing worship for comparison invites riya (showing off) — a spiritual harm the Prophet (peace be upon him) warned against explicitly. Private discipline is more beloved. |
| 2 | **No iman/taqwa scoring** | No app, algorithm, or human can measure someone's spiritual state before Allah. Claiming to score iman is theologically incoherent and spiritually dangerous. |
| 3 | **No shame copy for missed days** | "You missed Fajr again" is guilt manipulation, not motivation. Islam teaches that the best of those who sin are those who repent — the app must embody that. |
| 4 | **No addiction dark patterns** | Infinite variable reward spam, artificial urgency, and guilt loops exploit the same psychology as doomscrolling — the exact behavior the audience wants to escape. |
| 5 | **Privacy-first: worship data stays on device** | A Muslim's relationship with Allah is private. Salah logs, du'a records, and Muhasabah reflections are between the servant and the Creator. No server should store them. |
| 6 | **Religious copy must be reverent** | Arabic terms carry spiritual weight. "Smash that salah button!" trivializes sacred acts. The tone must be that of a wise, respectful mentor — never a hype-beast influencer. |
| 7 | **Recovery paths always available (Mercy Mode)** | Allah's mercy encompasses all things (Quran 7:156). An app that locks out recovery or punishes failure contradicts the Islamic principle it claims to serve. |
| 8 | **XP is effort-based, never spiritual judgment** | The app can observe that you tapped "completed Fajr." It cannot know the quality of your prayer, your khushu', or your sincerity. XP reflects discipline, not devotion. |

## Success Metrics

### North Star Metric

**Daily Active Users who complete 1+ habits** — this measures whether the core loop works. A player who opens the app and completes at least one habit is experiencing the value proposition.

### Supporting Metrics

| Metric | What It Tells Us | Target |
|--------|-----------------|--------|
| **7-day retention** | Does the game hook survive the first week? | >40% |
| **30-day retention** | Does the meta loop sustain engagement? | >20% |
| **Streak length distribution** | Are players building consistency or churning at day 2-3? | Median >5 days |
| **Mercy Mode recovery rate** | When streaks break, do players come back? | >60% recover |
| **Quests completed per week** | Are quests adding variety or being ignored? | >3 per active user |
| **Muhasabah completion rate** | Is reflection adding value without pressure? | >30% (optional feature) |
| **Title unlock rate** | Are progression milestones well-paced? | First title by day 5 |
| **Session duration** | Is engagement healthy (3-10 min) or excessive? | 3-10 min daily avg |

### Anti-Metrics (What We Refuse to Optimize)

- **Time-in-app beyond 15 min/day** — we are not building a doomscrolling replacement
- **Notification open rate at the cost of guilt copy** — invitational notifications only
- **Streak length at the cost of player wellbeing** — streaks motivate but Mercy Mode protects

---

*Section 1 of 16 · HalalHabits: Ferrari 16-Bit Edition Master Blueprint*
