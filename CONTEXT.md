# CONTEXT.md

## Meta
- Last updated: 2026-04-29
- Owner: lower
- Status: active

## 1. System Overview
- Product domain: Manual-first crypto watchlist dashboard
- High-level architecture: Client-only SPA with external market-data adapters and local persistence
- Core modules: UI board, market adapter, storage adapter, formatting/validation utils

## 2. Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: None (v1)
- Database: None (v1)
- Infra/Hosting: Static hosting compatible
- CI/CD: Not configured in v1 repository state

## 3. Repository Map
- `/`: docs + app config
- `/src`: app source
- `/src/services`: market adapter
- `/src/lib`: storage, formatting, validation
- `/src/test`: unit/integration tests

## 4. Global Rules
- Coding standards: TypeScript strict mode, small typed modules
- Branching strategy: feature branches from main (prefix `codex/` when needed)
- Versioning policy: incremental v1.x
- Error handling policy: fail-soft for network data; never drop manual user data
- Logging/observability policy: minimal console-based in v1 if needed

## 5. Domain Model
- Entities: `AltRow`, `DashboardMetrics`, `RowTag`, `RowNote`
- Relationships: Rows keyed by coin ticker; manual data attached per coin
- Invariants: Priority and TREND must match allowed option lists

## 6. API Contracts
- Public endpoints:
  - Coingecko global metrics
  - Coingecko simple price
  - Coingecko coin search
  - BlockchainCenter altcoin season index
  - Alternative.me fear and greed
- Internal endpoints/events: none
- Request/response contracts: normalized into typed internal interfaces
- Backward compatibility rules: graceful fallback to `null`/`N/A`

## 7. Data & Storage
- Schemas:
  - `week-alt-board.watchlist`: string[]
  - `week-alt-board.notes`: Record<coin, { comment, thought }>
  - `week-alt-board.tags`: Record<coin, { priority, trend }>
- Migration policy: permissive parser with defaults
- Retention policy: browser local persistence
- Backup/recovery: manual export not in v1

## 8. Security & Compliance
- AuthN/AuthZ: not applicable in v1
- Secrets handling: no private secrets in client
- PII/data classification: no PII expected
- Compliance constraints: none defined for v1

## 9. Performance Constraints
- Latency SLO: first useful paint under 2s on desktop
- Throughput target: single-user local workflow
- Cost constraints: zero backend cost for v1

## 10. Architecture Decision Log (ADR-lite)
1. Decision: Local-first board without backend
   - Context: Need fast MVP in 1-2 days
   - Choice: Store manual fields in localStorage and fetch market data on demand
   - Consequences: No cross-device sync in v1

2. Decision: Manual refresh only
   - Context: Reduce complexity and avoid unnecessary API calls
   - Choice: User-triggered refresh button
   - Consequences: Data can be stale between refreshes

## 11. Dependencies
- External services: Coingecko, Alternative.me, BlockchainCenter
- Third-party SDKs: React ecosystem
- Known limitations: Some coin symbol->id mappings may require resolver fallback

## 12. Operational Runbook
- Start: `npm install && npm run dev`
- Build: `npm run build`
- Test: `npm run test`
- Deploy: static bundle from `dist/`
- Rollback: redeploy previous static bundle
