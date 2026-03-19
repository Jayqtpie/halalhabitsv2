---
phase: 01-master-blueprint
plan: 06
subsystem: design-docs
tags: [telemetry, qa, testing, delivery-roadmap, xp-balance, accessibility, privacy]

requires:
  - phase: 01-master-blueprint plans 01-05
    provides: XP formula, streak mechanics, feature systems, data model, tech architecture, screen specs, UI tokens
provides:
  - Privacy-safe telemetry event catalog (21 events) with north-star metric
  - QA strategy with XP simulation validation, timezone/streak edge case catalogs
  - Content sensitivity checklist with forbidden/approved copy patterns
  - Delivery roadmap with per-phase deliverables, risks, and definition of done
  - 14-day sprint template for all build phases
affects: [01-07, 02, 03, 04, 05, 06, 07]

tech-stack:
  added: []
  patterns: [event-catalog table format, edge-case-catalog format, risk-matrix format]

key-files:
  created:
    - blueprint/12-telemetry.md
    - blueprint/13-qa-balance.md
    - blueprint/14-delivery-roadmap.md
  modified: []

key-decisions:
  - "North-star metric: DAU-Completion (daily active users who complete 1+ habits)"
  - "Client timestamp is authoritative for day-boundary decisions (not server)"
  - "Day boundary is midnight local time (00:00), not Fajr or Maghrib"
  - "Burnout alert threshold: 3+ indicators triggering simultaneously"
  - "Maximum 2 A/B experiments active simultaneously (solo dev constraint)"
  - "15-week total timeline estimate with 20% contingency buffer"

patterns-established:
  - "Telemetry event format: name, category, payload, privacy-safe annotation"
  - "Edge case catalog format: scenario, expected behavior, test priority"
  - "Phase delivery format: deliverables, risks (probability/impact/mitigation), definition of done"

requirements-completed: [BLUE-12, BLUE-13, BLUE-14]

duration: 6min
completed: 2026-03-07
---

# Plan 01-06: Telemetry, QA/Balance, and Delivery Roadmap Summary

**21 privacy-safe telemetry events with DAU-Completion north star, XP simulation test suite (11 cases across 3 archetypes), 22 timezone/streak edge cases, accessibility/adab checklists, and 6-phase delivery roadmap with 15-week timeline**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-07T22:03:59Z
- **Completed:** 2026-03-07T22:10:21Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- 21 telemetry events defined with payloads and privacy annotations -- zero worship data in any event
- North-star metric (DAU-Completion) with secondary metric (Weekly Active Days) and retention targets
- 5 burnout indicators with trailing-average measurement and 3-indicator alert threshold
- 6 anti-metric traps documenting dangerous optimization targets to avoid
- A/B test framework with deterministic hash variant assignment and 5 initial experiments
- 11 XP simulation test cases validating all 3 player archetypes at 7/30/90/365 day marks
- 5 exploit vectors with specific mitigations and test descriptions
- 10 timezone edge cases with expected behavior (client-timestamp-authoritative design)
- 12 streak edge cases covering pause, archive, frequency change, Mercy Mode
- Accessibility QA checklist: screen reader, touch targets, color contrast, motion, typography, RTL
- Content sensitivity checklist with 12 forbidden patterns and 10 approved patterns
- 6 app-build phases with granular deliverables, risk matrices, and definitions of done
- Cross-phase dependency diagram showing linear build order
- 7 project-level risks with probability/impact/mitigation analysis
- 14-day sprint template reusable across all build phases
- 15-week total timeline estimate (12 weeks + 20% buffer)

## Task Commits

1. **Task 1: Telemetry Plan + QA/Balance Plan** -- `560d0da` (docs)
2. **Task 2: Delivery Roadmap** -- `b0771e8` (docs)

## Files Created
- `blueprint/12-telemetry.md` -- Privacy-safe event catalog, north-star metric, retention metrics, burnout indicators, A/B test framework, anti-metric traps
- `blueprint/13-qa-balance.md` -- Test strategy, XP simulation validation, timezone edge cases, streak edge cases, accessibility QA, content sensitivity checklist
- `blueprint/14-delivery-roadmap.md` -- Per-phase deliverables, cross-phase dependencies, project risks, sprint template, timeline estimate

## Decisions Made
- North-star metric is DAU-Completion (not pure DAU) -- measures both engagement and core value delivery
- Client timestamp is authoritative for all day-boundary decisions -- server timestamps stored for sync but never override user's perceived day
- Day boundary is midnight local time (00:00), not Islamic day start (Fajr/Maghrib) -- because Fajr-based days would confuse non-prayer habit tracking
- Burnout indicators use 30-day personal baseline comparison, not absolute thresholds -- respects individual usage patterns
- Solo dev constraint: max 2 concurrent A/B experiments
- Total build timeline estimated at 15 weeks (12 weeks base + 20% contingency)

## Deviations from Plan
None -- plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None -- no external service configuration required.

## Next Phase Readiness
- All three operational/validation sections complete (12, 13, 14)
- Wave 3 plan 01-07 (Content Pack + Build Handoff) can proceed
- QA edge case catalogs are specific enough to write test cases from in Phase 3+
- Delivery roadmap provides clear scope for all 6 build phases

---
*Phase: 01-master-blueprint*
*Completed: 2026-03-07*
