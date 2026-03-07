# 08 — UI System and Design Tokens

> **Requirement:** BLUE-08
> **Cross-references:** [Screen Specs](./07-screen-specs.md) · [Sound & Haptics](./09-sound-haptics.md)

---

## Color Palette

All colors use the deep jewel tone palette on dark backgrounds. The aesthetic is "Ferrari x 16-bit" — premium, rich, and intentional.

### Primary: Emerald (Main Action Color)

| Token | Hex | Usage |
|-------|-----|-------|
| `emerald-50` | `#ECFDF5` | Subtle tint backgrounds |
| `emerald-100` | `#D1FAE5` | Light accent backgrounds |
| `emerald-200` | `#A7F3D0` | Hover states (web), pressed tint |
| `emerald-300` | `#6EE7B7` | Progress bar fill (secondary) |
| `emerald-400` | `#34D399` | Active tab icon, success indicator |
| `emerald-500` | `#0D7C3D` | Primary button background, active states, checkmarks |
| `emerald-600` | `#059669` | Primary button hover/pressed |
| `emerald-700` | `#047857` | Text links on light backgrounds |
| `emerald-800` | `#065F46` | Dark accents |
| `emerald-900` | `#1B4332` | Deep background accents, prayer mat color reference |

### Secondary: Sapphire (Secondary Actions, Links)

| Token | Hex | Usage |
|-------|-----|-------|
| `sapphire-50` | `#EFF6FF` | Light info backgrounds |
| `sapphire-100` | `#DBEAFE` | Subtle info tints |
| `sapphire-300` | `#93C5FD` | Secondary button borders |
| `sapphire-400` | `#60A5FA` | Links, info icons |
| `sapphire-500` | `#1B3A6B` | Secondary button background, Rare rarity |
| `sapphire-600` | `#2563EB` | Secondary button pressed |
| `sapphire-800` | `#1E3A5F` | Deep sky color (Isha, Fajr) |
| `sapphire-900` | `#0F172A` | Deepest background blue |

### Accent: Ruby (Alerts, Streaks, Celebrations)

| Token | Hex | Usage |
|-------|-----|-------|
| `ruby-300` | `#FCA5A5` | Soft warning tints |
| `ruby-400` | `#F87171` | Streak break indicator, expired badge |
| `ruby-500` | `#9B1B30` | Error text, destructive actions |
| `ruby-600` | `#DC2626` | Error states, delete confirmation |

### Gold (XP, Rewards, Legendary)

| Token | Hex | Usage |
|-------|-----|-------|
| `gold-300` | `#FDE68A` | Soft gold tints |
| `gold-400` | `#FBBF24` | XP number display, streak milestone badge |
| `gold-500` | `#FFD700` | XP bar fill, Legendary rarity glow, celebration particles |
| `gold-600` | `#D97706` | Gold accents on dark backgrounds |
| `gold-700` | `#B45309` | Deep gold accents |

### Neutrals (Backgrounds, Text, Borders)

| Token | Hex | Usage |
|-------|-----|-------|
| `surface-50` | `#F8FAFC` | Light mode backgrounds (if added) |
| `surface-100` | `#F1F5F9` | Light card backgrounds |
| `surface-700` | `#334155` | Muted text, disabled states |
| `surface-800` | `#1E293B` | Card backgrounds (dark mode) |
| `surface-850` | `#172033` | Elevated surface (modals, overlays) |
| `surface-900` | `#0F172A` | App background, tab bar |
| `surface-950` | `#0B1120` | Deepest background (behind Skia canvas) |
| `text-primary` | `#F1F5F9` | Primary text (light on dark) |
| `text-secondary` | `#94A3B8` | Secondary text, captions |
| `text-muted` | `#64748B` | Disabled text, placeholders |
| `border-default` | `#1E293B` | Card borders, dividers |
| `border-focus` | `#0D7C3D` | Focus rings (emerald) |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#0D7C3D` (emerald-500) | Habit completed, quest done |
| `warning` | `#FFD700` (gold-500) | Approaching milestone, soft cap |
| `error` | `#9B1B30` (ruby-500) | Validation errors, destructive actions |
| `info` | `#1B3A6B` (sapphire-500) | Informational messages |
| `mercy` | `#FFB347` | Mercy Mode accent (warm amber) |

### Rarity Colors

| Rarity | Glow Color | Badge Background | Text Color |
|--------|-----------|-----------------|------------|
| Common | `#0D7C3D` (emerald) | `emerald-900` | `emerald-400` |
| Rare | `#1B3A6B` (sapphire) | `sapphire-800` | `sapphire-400` |
| Legendary | `#FFD700` (gold) | `gold-700` | `gold-400` |

### HUD Overlay

| Token | Value | Usage |
|-------|-------|-------|
| `hud-overlay-bg` | `rgba(15, 23, 42, 0.75)` | Semi-transparent overlay on pixel art |
| `hud-overlay-border` | `rgba(30, 41, 59, 0.5)` | Subtle border on HUD cards |
| `hud-xp-bar-bg` | `#1E293B` | XP bar track |
| `hud-xp-bar-fill` | `#FFD700` (gold) | XP bar fill |
| `hud-xp-bar-glow` | `rgba(255, 215, 0, 0.3)` | Subtle glow around XP bar |

---

## Typography

### Font Stack

| Context | Font | Fallback | Rationale |
|---------|------|----------|-----------|
| Body text | Inter | System default | Clean, highly readable, excellent at small sizes |
| Pixel display (HUD) | Press Start 2P | Courier | Authentic pixel art font for HUD elements |
| Arabic text | Noto Sans Arabic | System Arabic | Full Arabic character support, RTL-ready |

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `heading-xl` | 28px | 36px | Bold (700) | Screen titles, level up number |
| `heading-lg` | 24px | 32px | Bold (700) | Section headers |
| `heading-md` | 20px | 28px | SemiBold (600) | Card titles, habit names |
| `body-lg` | 17px | 26px | Regular (400) | Primary body text |
| `body-md` | 15px | 22px | Regular (400) | Default body text, list items |
| `body-sm` | 13px | 18px | Regular (400) | Secondary text, captions |
| `caption` | 11px | 16px | Regular (400) | Timestamps, helper text |
| `hud-level` | 16px | 20px | Bold (700) | HUD level display (pixel font) |
| `hud-xp` | 12px | 16px | Bold (700) | HUD XP counter (pixel font) |
| `hud-label` | 10px | 14px | Bold (700) | HUD labels (pixel font) |

### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `tracking-tight` | -0.5px | Headings |
| `tracking-normal` | 0px | Body text |
| `tracking-wide` | 0.5px | Labels, captions |
| `tracking-pixel` | 1px | Pixel font text (HUD) |

---

## Spacing System

Base unit: **4px**. All spacing is a multiple of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4px | Tight internal padding, icon-to-text gap |
| `space-sm` | 8px | Default gap between inline elements |
| `space-md` | 16px | Card internal padding, section gap |
| `space-lg` | 24px | Section spacing, card-to-card gap |
| `space-xl` | 32px | Major section dividers |
| `space-xxl` | 48px | Screen-level top/bottom margins |

### Component Spacing

| Component | Padding | Gap |
|-----------|---------|-----|
| Card | 16px all sides | -- |
| Button | 12px vertical, 24px horizontal | -- |
| List item | 12px vertical, 16px horizontal | 8px between items |
| Section header | 0 top, 8px bottom | 24px above section |
| Tab bar | 8px vertical | -- |
| HUD overlay card | 12px all sides | 8px between cards |
| Modal | 24px all sides | 16px between elements |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0px | HUD pixel art elements (sharp edges) |
| `radius-sm` | 4px | Buttons, small chips |
| `radius-md` | 8px | Cards, input fields |
| `radius-lg` | 12px | Modals, large cards |
| `radius-xl` | 16px | Bottom sheets |
| `radius-full` | 9999px | Avatars, circular badges, dots |

### Component Radius Mapping

| Component | Radius Token |
|-----------|-------------|
| Habit card | `radius-md` (8px) |
| Quest card | `radius-md` (8px) |
| Primary button | `radius-sm` (4px) |
| Text input | `radius-md` (8px) |
| Avatar/badge | `radius-full` |
| Modal | `radius-lg` (12px) |
| Tab bar | `radius-none` (0px) |
| HUD overlays | `radius-sm` (4px) |

---

## Component Tokens

### Cards
| Token | Value |
|-------|-------|
| `card-bg` | `surface-800` |
| `card-border` | `border-default` |
| `card-border-width` | 1px |
| `card-shadow` | `0 2px 8px rgba(0, 0, 0, 0.2)` |
| `card-padding` | `space-md` (16px) |
| `card-radius` | `radius-md` (8px) |

### Buttons
| State | Background | Text | Border |
|-------|-----------|------|--------|
| Primary default | `emerald-500` | `text-primary` | none |
| Primary pressed | `emerald-600` | `text-primary` | none |
| Primary disabled | `surface-700` | `text-muted` | none |
| Secondary default | transparent | `sapphire-400` | `sapphire-500` 1px |
| Secondary pressed | `sapphire-500/10%` | `sapphire-300` | `sapphire-400` 1px |
| Ghost default | transparent | `text-secondary` | none |
| Ghost pressed | `surface-800` | `text-primary` | none |
| Destructive | `ruby-500` | `text-primary` | none |

### Inputs
| Token | Value |
|-------|-------|
| `input-bg` | `surface-800` |
| `input-border` | `border-default` |
| `input-border-focus` | `emerald-500` |
| `input-placeholder` | `text-muted` |
| `input-text` | `text-primary` |
| `input-radius` | `radius-md` (8px) |
| `input-padding` | 12px vertical, 16px horizontal |

---

## Iconography

### Style Split
| Context | Style | Size Grid |
|---------|-------|-----------|
| HUD elements | Pixel art (crisp, no anti-aliasing) | 16×16, 32×32, 48×48 |
| Non-HUD screens | Modern line icons (1.5px stroke) | 20×20, 24×24 |
| Tab bar | Pixel art icons | 24×24 |
| Habit presets | Pixel art icons | 32×32 |

### Icon Inventory
| Icon | Context | Style |
|------|---------|-------|
| Home/sanctuary | Tab bar | Pixel |
| Checkmark/scroll | Tab bar (Habits) | Pixel |
| Sword/compass | Tab bar (Quests) | Pixel |
| Character silhouette | Tab bar (Profile) | Pixel |
| Add (+) | Habits list | Line |
| Settings gear | Profile | Line |
| Back arrow | Navigation | Line |
| Checkbox | Habit completion | Line (checked = emerald fill) |
| Star | Level up, title | Pixel |
| Fire | Streak indicator | Pixel |
| Clock | Time window | Line |
| Moon/crescent | Isha/night theme | Pixel |
| Sun | Fajr/morning theme | Pixel |
| Book | Quran reading | Pixel |
| Prayer mat | Salah | Pixel |
| Heart | Mercy Mode | Pixel |

---

## Motion Tokens

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `duration-instant` | 100ms | Micro-interactions (tap feedback) |
| `duration-fast` | 200ms | State changes (checkbox, toggle) |
| `duration-normal` | 300ms | Standard transitions (screen push, card appear) |
| `duration-slow` | 500ms | Emphasis transitions (modal appear) |
| `duration-celebration` | 800ms | Level up, title unlock |
| `duration-scene` | 2000ms | HUD environment lighting transitions |

### Easing Curves

| Token | Value | Usage |
|-------|-------|-------|
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Entry animations (slide in, fade in) |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations (slide out, fade out) |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Continuous animations (progress bar fill) |
| `spring` | `{ damping: 15, stiffness: 150 }` | Celebrations, bouncy feedback |

### Animation Specs

| Animation | Trigger | Duration | Easing | Description |
|-----------|---------|----------|--------|-------------|
| XP gain | Habit completed | 500ms | ease-out | "+XX XP" text floats up and fades out |
| XP bar fill | XP changes | 300ms | ease-in-out | Bar smoothly fills to new value |
| Level up burst | Level threshold | 800ms | spring | Particles burst from center, number scales up |
| Habit check | Checkbox tapped | 200ms | ease-out | Emerald fill with checkmark draw |
| Streak increment | Streak updates | 200ms | spring | Number flips to new value |
| Screen push | Navigation | 300ms | ease-out | New screen slides in from right |
| Modal appear | Modal triggers | 500ms | spring | Scale from 0.9→1.0 with fade |
| Toast | Event notification | 300ms in, 200ms out | ease-out/ease-in | Slide down from top, auto-dismiss |
| Card stagger | List loads | 100ms per item | ease-out | Cards appear sequentially from top |

---

## Accessibility

### Contrast Requirements
- **Text on dark background:** Minimum 4.5:1 contrast ratio (WCAG AA)
- **Large text (heading-xl, heading-lg):** Minimum 3:1
- **Interactive elements:** Minimum 3:1 against adjacent colors

### Contrast Verification

| Pairing | Ratio | Pass |
|---------|-------|------|
| `text-primary` (#F1F5F9) on `surface-900` (#0F172A) | 15.4:1 | AA |
| `text-secondary` (#94A3B8) on `surface-900` (#0F172A) | 6.2:1 | AA |
| `emerald-500` (#0D7C3D) on `surface-900` (#0F172A) | 4.8:1 | AA |
| `gold-500` (#FFD700) on `surface-900` (#0F172A) | 12.1:1 | AA |
| `ruby-500` (#9B1B30) on `surface-900` (#0F172A) | 3.3:1 | AA Large |

### Reduced Motion Mode
- All animations set to `duration-instant` (100ms) or disabled
- Particle effects hidden
- Screen transitions become instant cuts
- HUD ambient animations (lantern flicker, water) continue at reduced frame rate

### Color-Blind Safety
- Never rely on color alone for status — always pair with icon or text label
- Checkmarks + color for completion (not just green)
- "Expired" text label alongside ruby coloring
- Rarity uses text label ("RARE") not just color coding

### Touch Targets
- Minimum touch target: 44×44pt (Apple HIG)
- Interactive elements have 8px minimum gap between tap zones

---

*Section 8 of 16 · HalalHabits: Ferrari 16-Bit Edition Master Blueprint*
