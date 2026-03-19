# XP Economy Model — v2.0 Sources

This document proves that the soft daily cap (`applySoftCap` in `xp-engine.ts`) prevents
hyperinflation when all v2.0 XP sources (boss battles, detox, Friday bonus, duo quests) are
added to the economy. All numbers are derived from the actual values in `xp-engine.ts` (CAP=500,
50% yield above cap, streak cap 3.0x) and `habitStore.ts` (XP_MAP base values).

---

## XP Sources Summary

| Source | Base XP | Multiplier | Cap Subject | Phase |
|---|---|---|---|---|
| salah_fajr | 50 | streak + friday | yes | v1.0 |
| salah_dhuhr | 15 | streak + friday | yes | v1.0 |
| salah_asr | 15 | streak + friday | yes | v1.0 |
| salah_maghrib | 15 | streak + friday | yes | v1.0 |
| salah_isha | 15 | streak + friday | yes | v1.0 |
| quran | 20 | streak + friday | yes | v1.0 |
| dhikr | 10 | streak + friday | yes | v1.0 |
| fasting | 25 | streak + friday | yes | v1.0 |
| muhasabah | 20 | streak + friday | yes | v1.0 |
| custom | 15 | streak + friday | yes | v1.0 |
| quest_completion | 25-100 | none | yes | v1.0 |
| boss_defeat | 200-500 | none | yes | v2.0 Phase 14 |
| detox_daily | 50-150 | none | yes | v2.0 Phase 13 |
| detox_weekly_deep | 300 | none | yes | v2.0 Phase 13 |
| detox_completion | 50-300 | none | yes | v2.0 Phase 13 |
| friday_bonus | 2x multiplier | stacks with streak | yes (applied before cap) | v2.0 Phase 12 |
| duo_quest | 50-150 | none | yes | v2.0 Phase 16 |

**Total 5 salah base XP:** 50 + 15 + 15 + 15 + 15 = **110 XP**

---

## Soft Daily Cap Mechanics

The `applySoftCap(earnedXP, dailyTotal)` function in `src/domain/xp-engine.ts`:

- **Threshold:** 500 XP per day
- **Below threshold:** 100% yield (full face value)
- **Above threshold:** 50% yield (`floor(earnedXP * 0.5)`)
- **Straddles boundary:** headroom at 100%, remainder at 50%

**Formula:**

```
if dailyTotal >= 500:
  cappedXP = floor(earnedXP * 0.5)
elif earnedXP <= (500 - dailyTotal):
  cappedXP = earnedXP
else:
  headroom = 500 - dailyTotal
  cappedXP = headroom + floor((earnedXP - headroom) * 0.5)
```

**Streak multiplier cap:** 3.0x maximum (applied before Friday multiplier)

**Friday multiplier:** 2x applied on top of streak multiplier. Maximum effective multiplier = 3.0 * 2.0 = 6.0x.

---

## Scenario Modeling

### Regular Day (no bonus multipliers)

Player completes all 5 salah + quran + dhikr with streak multiplier 2.0x (mid-range):

| Action | Base XP | Multiplier | Earned XP | Running Total |
|---|---|---|---|---|
| All 5 salah | 110 | 2.0x | floor(110 * 2.0) = 220 | 220 |
| quran | 20 | 2.0x | floor(20 * 2.0) = 40 | 260 |
| dhikr | 10 | 2.0x | floor(10 * 2.0) = 20 | 280 |
| quest (mid) | — | none | 75 | 355 |
| muhasabah | 20 | 2.0x | floor(20 * 2.0) = 40 | 395 |

**Regular day max with streak 2.0x: ~395 XP (under cap, no reduction)**

All XP awards fall within the 500 XP cap. The player receives full face value for every action.

---

### Friday — 2x Multiplier Active

Friday doubles the effective multiplier. Streak multiplier is capped at 3.0x, so the maximum
effective multiplier is 3.0 * 2.0 = 6.0x.

**Scenario: All 5 salah at max streak (3.0x) on Friday (6.0x effective):**

| Action | Base XP | Effective Multiplier | Raw Earned | Cap Applied | Capped XP |
|---|---|---|---|---|---|
| All 5 salah | 110 | 6.0x | 660 | Straddles: 500 full + 160 at 50% | 580 |
| quran | 20 | 6.0x | 120 | Already over cap — 50% | 60 |
| dhikr | 10 | 6.0x | 60 | At 50% | 30 |
| fasting | 25 | 6.0x | 150 | At 50% | 75 |
| muhasabah | 20 | 6.0x | 120 | At 50% | 60 |

Running total after salah: 580 XP (over cap)
Running total after all habits: 580 + 60 + 30 + 75 + 60 = **805 XP**

Raw (no cap) would be: 660 + 120 + 60 + 150 + 120 = 1,110 XP

**Friday max-streak day: ~805 XP — cap reduced earnings from raw 1,110 to 805 (27% reduction)**

---

### Worst Case: Friday + Boss Defeat + Deep Detox

Maximum possible single-day XP. Requires extreme scenario: streak 3.0x, Friday, boss defeat
on same day, and 8-hour deep detox completion on same day.

| Action | Raw Earned | Daily Total Before | Cap Applied | Capped XP |
|---|---|---|---|---|
| All 5 salah (6.0x) | 660 | 0 | Straddles: 500 + 160 at 50% | 580 |
| quran (6.0x) | 120 | 580 | Over cap — 50% | 60 |
| dhikr (6.0x) | 60 | 640 | Over cap — 50% | 30 |
| fasting (6.0x) | 150 | 670 | Over cap — 50% | 75 |
| muhasabah (6.0x) | 120 | 745 | Over cap — 50% | 60 |
| Quest completion (max) | 100 | 805 | Over cap — 50% | 50 |
| Boss defeat (max 500) | 500 | 855 | Over cap — 50% | 250 |
| Deep detox completion (300) | 300 | 1,105 | Over cap — 50% | 150 |
| Duo quest bonus (150) | 150 | 1,255 | Over cap — 50% | 75 |

**Raw total (no cap): ~2,160 XP**

**After cap: ~1,330 XP (worst case, 38% reduction)**

---

## Conclusion: Cap Proof

The soft daily cap (`applySoftCap`, CAP=500) successfully bounds XP even in the worst-case
scenario. Here is the level-up proof using actual `xpToNextLevel` values from `xp-engine.ts`:

| Level | XP to Next Level | Worst-Case Days to Level Up |
|---|---|---|
| 10 | 2,302 | ~1.7 worst-case days minimum |
| 15 | floor(40 * 15^1.85) ≈ 4,742 | ~3.6 worst-case days |
| 20 | floor(40 * 20^1.85) ≈ 10,752 | ~8.1 worst-case days |

**Key findings:**

1. **No single-day level-up at level 10+.** The worst-case cap output (~1,330 XP) is less
   than the XP required for level 10 (2,302 XP). A player cannot level up in a single day
   at level 10 or higher, regardless of which v2.0 XP sources activate simultaneously.

2. **Logarithmic progression maintained.** The 50% above-cap yield ensures each additional
   XP source has diminishing returns on a single day, preserving the intended curve.

3. **Regular play stays well-balanced.** A normal day without Friday or v2.0 bonuses yields
   ~280-395 XP, giving level 5-8 in the first week (design intent: "fast early leveling").

4. **All v2.0 sources accounted for.** `boss_defeat`, `detox_completion`, `friday_bonus`,
   and `duo_quest` are all subject to the same `applySoftCap` gate. No source bypasses it.

5. **XP total never decreases.** Streak resets reduce the multiplier but cannot remove
   already-earned XP. The cap only slows earning on peak days — it never penalizes.

The soft daily cap at 500 XP with 50% above-cap yield is sufficient to prevent hyperinflation
across all v2.0 reward scenarios while maintaining a rewarding and balanced game economy.
