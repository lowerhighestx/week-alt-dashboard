# STATE.md

## Meta
- Last updated: 2026-04-29 15:40
- Owner: lower
- Current phase: build

## 1. Current Objective
- Sprint/iteration goal: Deliver Week alt board v1 MVP with manual-first table and market widgets
- Deadline: 2026-05-01
- Definition of done: Working board + refresh + local persistence + mobile readability + baseline tests

## 2. Status Snapshot
- Overall: on-track
- Completion: 85%
- Main blocker: Need dependency install and final test/build verification in current environment

## 3. Active Tasks
| ID | Task | Owner | Status | ETA | Notes |
|---|---|---|---|---|---|
| TASK-001 | Scaffold React+Vite+TS app | lower | done | 2026-04-29 | Completed |
| TASK-002 | Implement widgets + table schema | lower | done | 2026-04-29 | Completed |
| TASK-003 | Implement market adapters + local persistence | lower | done | 2026-04-29 | Completed |
| TASK-004 | Run tests/build and fix issues | lower | in-progress | 2026-04-29 | Pending install/verification |

## 4. Backlog (Long Horizon)
| Priority | Item | Impact | Effort | Status |
|---|---|---|---|---|
| P0 | Export/import board state | high | med | todo |
| P1 | Dynamic watchlist management UI | med | med | todo |
| P1 | Advanced analytics columns toggle | med | med | todo |

## 5. Recently Completed
- 2026-04-29: Implemented v1 UI, data provider contract, local storage model, and baseline tests.

## 6. Risks
| Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|
| External API instability | med | med | Fail-soft parsing and partial response handling | lower |
| Coin id mismatch for niche symbols | med | low | Resolver fallback and N/A display | lower |

## 7. Decisions Since Last Update
- Decision: Keep v1 backend-free and local-first.
- Why: Ship MVP within 1-2 days.
- Tradeoff: No sync across devices.

## 8. Next 3 Actions
1. Install dependencies and run tests/build locally.
2. Fix any test/build issues and confirm responsive behavior.
3. Prepare first polish pass against visual reference screenshot.

## 9. Handoff Notes
- What the next contributor should do first: run `npm install`, `npm run test`, `npm run build`.
- What to avoid: introducing backend or extra columns before v1 acceptance.
