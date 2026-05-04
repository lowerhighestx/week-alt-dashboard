# CONTEXT.md

## Meta
- Last updated: 2026-05-04
- Owner: lower
- Status: active

## 1. System Overview
- Product domain: Crypto market screening for altcoins.
- High-level architecture: Single static HTML application with embedded CSS/JS and client-side API calls.
- Core modules: market widgets, screener table, local persistence, CSV transfer, modal/hover edit UI.

## 2. Tech Stack
- Frontend: Vanilla HTML/CSS/JavaScript in `altdash.html`.
- Backend: None.
- Database: None (browser `localStorage`).
- Infra/Hosting: Local file/web now; planned GitHub Pages publish.
- CI/CD: Not configured yet.

## 3. Repository Map
- `/`: project docs and `altdash.html`.
- `/app`: not used.
- `/api`: not used.
- `/tests`: not used yet.
- `/docs`: represented by root markdown files.

## 4. Global Rules
- Coding standards: Keep implementation simple and readable; prefer explicit logic over framework abstractions.
- Branching strategy: Feature branches from main (to be formalized later).
- Versioning policy: Manual semantic tags later when public releases start.
- Error handling policy: Do not block UI on partial API failures; show stale data safely.
- Logging/observability policy: Browser console + in-UI status/toast feedback.

## 5. Domain Model
- Entities: `CoinRow`, `MarketSnapshot`, `ColumnConfig`, `FilterState`.
- Relationships: `CoinRow` drives table and summary widgets; `MarketSnapshot` updates global/ticker widgets.
- Invariants: Coin symbol is uppercase; numeric fields are parseable numbers; `altdash.html` remains the main runtime artifact.

## 6. API Contracts
- Public endpoints:
  - CoinGecko `/coins/markets`, `/global`, `/coins/{id}/ohlc`.
  - Alternative.me `/fng`.
- Internal endpoints/events: None.
- Request/response contracts: JSON responses mapped by coin id/symbol.
- Backward compatibility rules: UI should not crash on missing fields; retain previous values when data is absent.

## 7. Data & Storage
- Schemas: In-memory coin objects with key metrics (`price`, `pwh`, `pwl`, `ath`, `lastLow`, etc.).
- Migration policy: Lightweight localStorage key migration when schema changes.
- Retention policy: Persist data until user resets browser storage or imports replacement data.
- Backup/recovery: CSV export/import for manual backup and restore.

## 8. Security & Compliance
- AuthN/AuthZ: Not applicable (single-user client app).
- Secrets handling: No secrets in source; only public API usage.
- PII/data classification: No personal/sensitive data expected.
- Compliance constraints: None defined for current personal phase.

## 9. Performance Constraints
- Latency SLO: Initial render should feel immediate on desktop; refresh operations should complete within API constraints.
- Throughput target: Manual refresh usage for small fixed coin list.
- Cost constraints: Zero-cost hosting and free public API tiers.

## 10. Architecture Decision Log (ADR-lite)
1. Decision: Keep app as a single HTML file.
   - Context: Fast iteration, personal use, simple deployment path to GitHub Pages.
   - Choice: No framework/build pipeline in phase 1.
   - Consequences: Easy shipping and portability; reduced modularity/test tooling by default.

## 11. Dependencies
- External services: CoinGecko API, Alternative.me Fear & Greed API.
- Third-party SDKs: None.
- Known limitations: API rate limits and occasional response gaps.

## 12. Operational Runbook
- Start: Open `altdash.html` in browser.
- Build: Not required (static file).
- Test: Manual checks + future scripted checks.
- Deploy: Publish the same file via GitHub Pages.
- Rollback: Restore previous `altdash.html` and/or local CSV snapshot.
