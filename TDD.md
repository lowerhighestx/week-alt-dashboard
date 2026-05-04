# TDD.md

## Meta
- Last updated: 2026-05-04
- Owner: lower
- Status: active

## 1. Testing Strategy
- Primary approach: Test-driven behavior checks for core data flows (`refresh`, `persist`, `import/export`).
- Test pyramid ratio: Manual integration-heavy now; evolve toward balanced unit/integration coverage.
- Coverage target: Focused coverage for parsing, persistence, and core metric integrity.

## 2. Test Environments
- Local: Browser run of `altdash.html`.
- CI: Not configured yet.
- Staging: GitHub Pages preview (planned).

## 3. Test Types
- Unit: CSV parse/validation helpers and metric recalculation helpers.
- Integration: API refresh + UI update + persistence path.
- Contract: Validate minimal expected shape from CoinGecko/FNG responses.
- E2E: Manual scenario checks for filtering, editing, save/reload, import/export.
- Visual regression: Manual screenshot comparison for major UI changes.
- Performance smoke: Manual check for render/refresh responsiveness on desktop.

## 4. Red-Green-Refactor Workflow
1. Write failing checks for a specific behavior (for example, valid CSV import).
2. Implement minimal change to pass.
3. Refactor while preserving behavior.
4. Update docs/state after acceptance.

## 5. Feature Test Template
### Feature Name
- Requirement link: `REQ.md#6-functional-requirements`
- Context link: `CONTEXT.md#6-api-contracts`

### Cases
1. Happy path: Valid refresh and valid CSV import/export round-trip.
2. Validation: Reject malformed rows and unknown headers safely.
3. Error handling: API failure does not clear existing rows.
4. Edge conditions: Missing numeric values, duplicated symbols, partial import files.

### Test Data
- Fixtures: CSV samples (valid, invalid, partial).
- Factories: In-memory coin row builder for deterministic checks.
- Mocks/stubs: Stub API JSON payloads for non-network tests.

### Exit Criteria
- All mandatory behavior checks green.
- No flaky manual flows in repeated refresh/import runs.
- Documented known limitations for unresolved edge cases.

## 6. Regression Checklist
- Existing core table/edit flows unaffected.
- LocalStorage compatibility retained.
- CSV export remains readable after import-enabled changes.

## 7. Quality Gates in CI
- Lint/type checks: Not set yet.
- Unit tests: Planned.
- Integration tests: Planned.
- E2E smoke: Planned.
- Coverage threshold: To be defined after initial test harness setup.

## 8. Defect Log Template
| Bug ID | Found in | Test added? | Root cause | Preventive action |
|---|---|---|---|---|
| BUG-001 |  | yes/no |  |  |

## 9. Flakiness Protocol
- How to quarantine: Mark unstable checks and isolate from release gate.
- Max quarantine period: 7 days.
- Owner to fix: lower.
