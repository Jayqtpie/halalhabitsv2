# 09 — Sound and Haptic Direction

> **Requirement:** BLUE-09
> **Cross-references:** [Screen Specs](./07-screen-specs.md) · [UI Design Tokens](./08-ui-design-tokens.md)

---

## Sound Identity

**Audio aesthetic:** 16-bit chiptune-influenced, but refined and minimal. Sounds are crisp, warm, and brief — inspired by the satisfying audio cues in Celeste and Stardew Valley, not the constant soundtrack of an arcade game.

**Core principle:** Sound is **event-driven, not ambient**. There is no background music in v1. Every sound exists to reinforce a specific player action or system event. The absence of constant audio makes each cue more meaningful.

**Mood:** Calm, rewarding, never urgent. Sounds should feel like a gentle affirmation, not an alarm. Mercy Mode sounds are warm (not warning tones). Level-up sounds are triumphant but brief (not over-the-top fanfare). Prayer-related sounds are reverent.

**Audio palette:** Warm digital tones — sine waves and soft square waves, light reverb, no harsh frequencies. Think "chiptune played on a warm amp" rather than "raw 8-bit bleeps."

---

## Event-to-Sound Map

| Event | Sound Description | Duration | Volume | Priority |
|-------|-------------------|----------|--------|----------|
| Habit completion | Soft chime: ascending two-note tone (C5→E5), sine wave with light decay | 200ms | 70% | Medium |
| Streak increment | Quick ascending arpeggio (3 notes: C5→E5→G5), crisp square wave | 300ms | 70% | Medium |
| XP gain | Coin-collect sound: bright bell tone with metallic shimmer | 150ms | 60% | Low |
| Level up | Triumphant chiptune fanfare: 4-note ascending melody (C4→E4→G4→C5) with harmony, sustained final note | 1500ms | 85% | High |
| Title unlock (Common) | Warm chime with emerald sparkle effect: single bell tone with reverb | 500ms | 75% | High |
| Title unlock (Rare) | Richer chime with sapphire shimmer: two-note chord with harmonic overtones | 800ms | 80% | High |
| Title unlock (Legendary) | Grand fanfare: 6-note ascending melody with harmonic bloom, warm sustain, subtle choir pad | 2000ms | 90% | Critical |
| Quest complete | Achievement jingle: 3-note ascending with final resolution, bright and satisfying | 500ms | 75% | High |
| Mercy Mode activation | Gentle warm tone: soft sine wave with slow attack, like a door gently opening, slightly rising pitch | 400ms | 60% | Medium |
| Recovery complete | Warm resolution: descending then ascending 3-note phrase, like "tension → relief" | 600ms | 75% | High |
| Button tap | Subtle click: short percussive pop, very quiet | 50ms | 40% | Low |
| Navigation transition | Soft whoosh: brief white noise sweep, low-pass filtered | 100ms | 30% | Low |
| Muhasabah prompt | Gentle bell: single clear tone with long decay, like a meditation bell | 300ms | 50% | Low |
| Error / invalid action | Soft low tone: muted square wave, two quick descending notes | 200ms | 50% | Medium |
| Streak milestone (7, 14, 21...) | Special ascending arpeggio: 5 notes ascending with warmth, longer sustain than regular streak | 600ms | 80% | High |
| Daily summary view | Gentle resolve: soft 2-note chord settling | 300ms | 50% | Low |

---

## Haptic Rules

Haptic feedback uses the device's haptic engine (Taptic Engine on iOS, vibration API on Android). All haptics respect the device's haptic preference setting and can be independently disabled in HalalHabits settings.

| Event | Haptic Pattern | Intensity | iOS Type |
|-------|---------------|-----------|----------|
| Habit completion | Single tap | Medium | `impactMedium` |
| Streak increment | Double tap (100ms gap) | Light-Medium | `impactLight` × 2 |
| XP gain | No haptic (too frequent, would be annoying) | -- | -- |
| Level up | Triple tap pattern: light → medium → heavy (80ms gaps) | Ascending | `impactLight` → `impactMedium` → `impactHeavy` |
| Title unlock (Common) | Single tap | Medium | `impactMedium` |
| Title unlock (Rare) | Double tap | Medium-Heavy | `impactMedium` × 2 |
| Title unlock (Legendary) | Long buzz (200ms) | Heavy | `impactHeavy` + custom 200ms |
| Quest complete | Double tap | Medium | `impactMedium` × 2 |
| Mercy Mode activation | Gentle single tap | Light | `impactLight` |
| Button tap | Very light tap | Light | `selectionChanged` |
| Error / invalid action | Short sharp tap | Medium | `notificationError` |
| Streak milestone | Triple ascending tap | Medium | `notificationSuccess` |
| Checkbox toggle | Very light tap | Light | `selectionChanged` |
| Pull-to-refresh release | Single tap | Light | `impactLight` |

---

## Audio Boundaries

### Silent Mode Respect
- All sounds **always** respect device silent mode (iOS mute switch, Android Do Not Disturb)
- When silent mode is active, all HalalHabits sounds are suppressed — no exceptions
- Haptics still function in silent mode (unless separately disabled)

### In-App Sound Control
- Master sound toggle in Settings (on/off)
- When off, all sounds are suppressed regardless of device settings
- Haptic toggle is independent of sound toggle
- No per-event sound customization in v1 (simplicity)

### Prayer Time Awareness
- If prayer time window is active (Fajr/Dhuhr/Asr/Maghrib/Isha), the app should be aware that the user may be praying
- No sounds play on habit completion during active prayer windows **if the habit being completed is the corresponding salah** — this respects the sacred act
- Sounds resume normally for non-salah habit completions during prayer windows
- Implementation: check if `completed_habit.type === 'salah' && current_prayer_window.is_active` → suppress sound for that specific completion

### Focus Mode
- A "Focus Mode" setting (future consideration for v2) would suppress all sounds and reduce haptics to minimum
- In v1, the per-app sound toggle serves this purpose

---

## Volume Mixing

### Mix Rules
- Default volume: 70% of device media volume
- Sounds **never overlap** — if a new sound triggers while one is playing, the new sound takes priority and the current sound fades quickly (50ms fade)
- Exception: Level-up sound (high priority) will interrupt any current sound
- Priority queue: Critical > High > Medium > Low
  - Critical: Legendary title unlock only
  - High: Level up, title unlock, quest complete, streak milestone
  - Medium: Habit complete, streak increment, Mercy Mode, errors
  - Low: XP gain, button tap, navigation, Muhasabah prompt

### Volume Scaling
- Sounds at Low priority play at base volume (60-70%)
- Sounds at High priority play at elevated volume (75-90%)
- Critical sounds play at 90% — still not maximum, never jarring
- All volumes scale with device volume setting

---

## Audio Technical Notes

### File Format
- Sound files: `.mp3` for compression or `.wav` for quality (small files, < 50KB each)
- Total audio bundle: < 500KB (all sounds combined)
- Preloaded on app start for instant playback (no loading lag)

### Sound Generation
- Sounds can be generated procedurally (chiptune synthesis) or recorded
- For v1: pre-recorded `.mp3` files are simpler to implement
- For future: consider `expo-audio` or `react-native-sound` library

### No Background Music (v1)
- No ambient music, no lobby music, no screen-specific music
- The app's audio identity is defined by its event cues, not its soundtrack
- Background music is a v2 consideration with careful implementation (loop quality, battery, user preference)

---

*Section 9 of 16 · HalalHabits: Ferrari 16-Bit Edition Master Blueprint*
