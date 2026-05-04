# REQ.md

## Meta
- Last updated: 2026-05-04
- Owner: lower
- Status: active

## 1. Product Brief
- Product/Feature: WEEK ALT
- One-line value proposition: A single-page mini dashboard screener for a selected group of altcoins.
- Why now: The owner needs a fast personal decision-support view for speculative altcoin tracking, with a path to later public sharing.

## 2. Target Audience (ICP)
- Primary segment: Crypto speculators.
- Secondary segment: None at this stage.
- Context of use: Fast market checks during web sessions.
- Pain points: Fragmented data across tabs, slow manual comparison of key price levels.

## 3. Business Goals
- Goal 1: Provide reliable real-time screening for a fixed altcoin list.
- Goal 2: Preserve user-edited data locally between sessions.
- Goal 3: Prepare the app for future public publishing via GitHub Pages.

## 4. Jobs To Be Done
- When market conditions change, I want to see core altcoin metrics in one view so I can react faster.
- Core functional job: Screen and compare altcoins by key technical/reference levels.
- Emotional/social job: Reduce uncertainty and improve confidence in speculative decisions.

## 5. Scope
### In scope
- Single-file web app: `altdash.html`.
- Current predefined coin list remains unchanged.
- English-only UI.
- Auto-save with local storage.
- CSV export and CSV import for portfolio rows.
- Key displayed metrics: real `PRICE`, `PWH/PWL`, `ATH`, `ATL`.

### Out of scope
- Mobile-first optimization (web-first priority).
- Backend services, auth, and multi-user sync.
- Hard project deadline commitments.

## 6. Functional Requirements
1. FR-001: The app must load as a one-page dashboard from `altdash.html` with product name `WEEK ALT`.
2. FR-002: The app must fetch and display real price-related market data for configured coins.
3. FR-003: The app must support local persistence and CSV import/export of coin rows.

## 7. Non-Functional Requirements
- Performance: Fast initial load and responsive table interactions on desktop web.
- Reliability: Graceful fallback when API requests fail.
- Security: No secret keys stored in client code.
- Accessibility: Basic keyboard usability and readable contrast.
- Localization: English only.

## 8. User Scenarios
1. Happy path: User opens dashboard, refreshes data, reviews `PRICE/PWH/PWL/ATH/ATL`, and updates notes.
2. Edge case: Some API calls fail; last saved local data still remains usable.
3. Failure/recovery: User imports malformed CSV; app rejects invalid rows and keeps existing valid dataset.

## 9. Acceptance Criteria
1. Given the dashboard is loaded, when refresh is triggered, then `PRICE`, `ATH`, and `ATL` values are updated from APIs where mappings exist.
2. Given a valid CSV file, when import is executed, then rows are parsed and persisted to local storage.
3. Given user edits any row, when page is reloaded, then edits remain available from local storage.

## 10. Success Metrics
- North star metric: Daily active personal use with all key metrics visible in one page.
- Leading indicators: Refresh success rate, import success rate, local-save persistence success.
- Guardrail metrics: API failure frequency and corrupted import rate.

## 11. Risks and Assumptions
- Assumption 1: Public APIs remain available without auth for current usage volume.
- Risk 1 + mitigation: API limits or outages can break updates; mitigation is resilient UI with preserved local data and clear status.

## 12. Open Questions
1. Which release stage should be first for GitHub Pages: private preview or fully public page?
