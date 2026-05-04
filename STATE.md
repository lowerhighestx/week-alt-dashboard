# STATE.md

## Meta
- Last updated: 2026-05-04 14:43
- Owner: lower
- Current phase: build

## 1. Current Objective
- Sprint/iteration goal: Establish project baseline docs in English and align implementation scope for WEEK ALT.
- Deadline: Not set.
- Definition of done: Core docs updated, scope aligned, next implementation tasks identified.

## 2. Status Snapshot
- Overall: on-track
- Completion: 75%
- Main blocker: No critical blocker; next focus is GitHub Pages preparation.

## 3. Active Tasks
| ID | Task | Owner | Status | ETA | Notes |
|---|---|---|---|---|---|
| TASK-001 | Populate REQ/CONTEXT/STATE/TDD/DESIGN in English | lower | done | 2026-05-04 | Based on confirmed user answers |
| TASK-002 | Add CSV import (export already exists) | lower | done | 2026-05-04 | Implemented with replace/merge prompt by coin symbol |
| TASK-003 | Align branding details to WEEK ALT in runtime text | lower | done | 2026-05-04 | Browser title aligned to WEEK ALT |

## 4. Backlog (Long Horizon)
| Priority | Item | Impact | Effort | Status |
|---|---|---|---|---|
| P0 | GitHub Pages deployment path | high | med | todo |
| P1 | Public release readiness (docs + safeguards) | med | med | todo |
| P1 | Basic regression checklist automation | med | med | todo |

## 5. Recently Completed
- 2026-05-04: Initial project answers captured and translated to English documentation baseline.
- 2026-05-04: Implemented CSV import + improved CSV export escaping + updated browser title to WEEK ALT.
- 2026-05-04: Fixed CoinGecko mapping for ASTER and added retry/backoff + slower pacing for PWH/PWL OHLC refresh.
- 2026-05-04: Added API reliability layer (retry + validation + health snapshots) and a separate `admin.html` diagnostics page.

## 6. Risks
| Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Public API rate limits | med | med | Throttling, partial refresh tolerance, preserve local data | lower |
| Importing malformed CSV | med | med | Validation, reject bad rows, keep last good state | lower |

## 7. Decisions Since Last Update
- Decision: Keep current default coin list unchanged for now.
- Why: User explicitly confirmed existing list.
- Tradeoff: Faster start, but less flexibility until import flow is finalized.

## 8. Next 3 Actions
1. Prepare GitHub Pages publish checklist.
2. Add lightweight import validation report (rows added/updated/skipped).
3. Add a quick backup/restore note in README for CSV workflow.

## 9. Handoff Notes
- What the next contributor should do first: Test CSV import flows in browser with real files (replace + merge modes).
- What to avoid: Breaking localStorage compatibility or overriding existing rows silently.
