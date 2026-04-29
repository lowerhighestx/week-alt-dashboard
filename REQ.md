# REQ.md

## Meta
- Last updated: 2026-04-29
- Owner: lower
- Status: active

## 1. Product Brief
- Product/Feature: Week alt board v1
- One-line value proposition: A fast manual decision board for altcoin watchlist management with live market context.
- Why now: Need a repeatable weekly workflow with less noise and one-screen visibility.

## 2. Target Audience (ICP)
- Primary segment: Solo crypto trader / active speculator
- Secondary segment: Small private trading groups
- Context of use: Weekly and daily planning sessions before execution
- Pain points: Scattered data sources, manual copy/paste, no single place for notes and priorities

## 3. Business Goals
- Goal 1: Reduce time to review market context to under 2 minutes
- Goal 2: Keep watchlist notes and priorities consistent across sessions
- Goal 3: Make weekly board updates deterministic and repeatable

## 4. Jobs To Be Done
- When I review the market, I want all key signals and my manual notes in one screen so I can decide faster.
- Core functional job: Track watchlist coins with market cap, live price, trend, priority, comment, and thought.
- Emotional/social job: Maintain confidence and discipline in weekly plan execution.

## 5. Scope
### In scope
- Single-page web dashboard
- Top widgets: BTC dominance, Altcoin index, Fear & Greed, Price now summary
- Main table columns: COIN, Priority, TREND, Cap, Price now, COMMENT, Thought
- Manual refresh button for market data
- Local persistence for manual fields and watchlist

### Out of scope
- Authentication and multi-user collaboration
- Backend database/API
- Auto-refresh scheduler
- Legacy columns (ATH, stoploss, percentages)

## 6. Functional Requirements
1. FR-001: User can refresh market data manually and see updated widget/table market fields.
2. FR-002: User can edit Priority, TREND, COMMENT, Thought for each row.
3. FR-003: Manual fields persist after page reload.
4. FR-004: Watchlist loads with predefined tickers from initial setup.
5. FR-005: Partial source failure does not erase manual data and app remains usable.

## 7. Non-Functional Requirements
- Performance: Initial render under 2s on standard desktop after bundle load.
- Reliability: Partial API failures degrade gracefully.
- Security: No secrets in client; public endpoints only.
- Accessibility: Keyboard-accessible inputs/selects; visible focus states.
- Localization: UI language is English in v1.

## 8. User Scenarios
1. Happy path: User opens app, clicks Refresh, sees updated widgets and prices, then updates notes.
2. Edge case: Coin id cannot be resolved; row keeps manual fields and shows N/A for market fields.
3. Failure/recovery: One provider fails; app shows warning but allows editing and preserving manual state.

## 9. Acceptance Criteria
1. Given app is open, when user clicks Refresh, then market widgets and market columns update.
2. Given user edits COMMENT/Thought/Priority/TREND, when page reloads, then values are restored.
3. Given one or more API endpoints fail, when refresh completes, then manual data remains unchanged and board stays interactive.

## 10. Success Metrics
- North star metric: Weekly board completion rate (all planned rows reviewed).
- Leading indicators: Refresh usage per session, manual fields completion rate.
- Guardrail metrics: Data fetch failure rate, UI errors per session.

## 11. Risks and Assumptions
- Assumption 1: Public API endpoints remain available without private keys for v1 volume.
- Risk 1 + mitigation: Endpoint instability; use tolerant parsing and partial-failure fallback.

## 12. Open Questions
1. Final long-term token universe governance (fixed list vs dynamic list).
2. Need for export/import workflow in v2.
