---
phase: 01-master-blueprint
plan: 05
subsystem: design-docs
tags: [data-model, api-contract, privacy, database-schema, sync]

requires:
  - phase: 01-01
    provides: XP economy, streak model
  - phase: 01-02
    provides: Feature systems (habits, quests, titles, Muhasabah)
provides:
  - Complete data model with 13 entities, privacy classifications, and relationship diagram
  - API contracts for sync endpoints
  - XPLedger privacy boundary pattern (decoupled from worship data)
affects: [01-06, 01-07]

tech-stack:
  added: []
  patterns: [privacy classification per entity, XPLedger decoupling pattern, numbered migrations]

key-files:
  created:
    - blueprint/11-data-model.md
  modified: []

key-decisions:
  - "13 entities: 4 PRIVATE (HabitCompletion, Streak, MuhasabahEntry, Niyyah), 7 SYNCABLE, 1 LOCAL ONLY (SyncQueue), 1 mixed"
  - "XPLedger decoupling: source_id is NULL for habit-sourced XP — preserves privacy boundary"
  - "Last-write-wins conflict resolution for settings; idempotent completions for habits"
  - "Numbered migration files run on app startup"

patterns-established:
  - "Privacy classification: PRIVATE entities never leave device, SYNCABLE eligible for sync"
  - "XPLedger decoupling: XP amount and source_type sync, but not the specific worship completion"
  - "Entity spec format: columns table, relationships, indexes, privacy justification"

requirements-completed: [BLUE-11]

duration: 10min
completed: 2026-03-07
---

# Plan 01-05: Data Model and API Contract Summary

**13-entity data model with privacy classifications (4 PRIVATE, 7 SYNCABLE, 1 LOCAL ONLY), XPLedger decoupling pattern for worship privacy, and sync API contracts**

## Performance

- **Duration:** ~10 min
- **Tasks:** 1
- **Files created:** 1

## Accomplishments
- 13 entities fully defined with columns, types, constraints, and relationships
- Every entity tagged PRIVATE or SYNCABLE with Islamic ethics justification
- Entity-relationship diagram showing all foreign keys and cardinality
- XPLedger privacy boundary pattern: records XP earned and source type but NOT which specific worship completion generated it
- API contracts for 5 sync/auth endpoints with request/response schemas
- Migration strategy with numbered files and version tracking
- Privacy boundary rules clearly separating device-only from syncable data

## Task Commits

1. **Task 1: Data Model and API Contract** — `3b7a65a` (docs)

## Files Created
- `blueprint/11-data-model.md` — All entities, relationships, privacy classifications, API contracts, migration strategy

## Decisions Made
- XPLedger source_id set to NULL for habit-sourced XP — this is the key privacy boundary that allows game economy to sync while worship data stays local
- SyncQueue classified as LOCAL ONLY (infrastructure, not user data)
- Batch sync push/pull model (not real-time) aligns with offline-first architecture

## Deviations from Plan
None — plan executed as specified.

## Issues Encountered
None.

## Next Phase Readiness
- Data model provides the schema reference for Phase 2 Foundation database setup
- Privacy classifications feed directly into Privacy Gate module implementation
- API contracts ready for Phase 7 Backend/Sync

---
*Phase: 01-master-blueprint*
*Completed: 2026-03-07*
