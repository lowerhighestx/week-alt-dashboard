# TDD.md

## Meta
- Last updated: 2026-04-29
- Owner: lower
- Status: active

## 1. Testing Strategy
- Primary approach: Test-Driven Development (red -> green -> refactor)
- Test pyramid ratio: 60% unit / 30% integration / 10% UI smoke
- Coverage target: 70% lines for core modules in v1

## 2. Test Environments
- Local: Vitest + jsdom
- CI: Not yet configured (planned in next iteration)
- Staging: Not applicable for v1

## 3. Test Types
- Unit: mapping and validation utilities
- Integration: refresh flow + persistence behavior
- Contract: adapter normalization against expected payload shape
- E2E: deferred to v2
- Visual regression: manual screenshot check in v1
- Performance smoke: manual load and refresh responsiveness

## 4. Red-Green-Refactor Workflow
1. Write failing test that captures behavior.
2. Implement minimal code to pass.
3. Refactor with tests green.
4. Update docs and state.

## 5. Feature Test Template
### Feature Name
- Requirement link: `REQ.md#6-functional-requirements`
- Context link: `CONTEXT.md#6-api-contracts`

### Cases
1. Happy path: refresh updates market fields.
2. Validation: invalid priority/trend values fallback to defaults.
3. Error handling: partial endpoint failure keeps board usable.
4. Edge conditions: unresolved coin id yields N/A market fields.

### Test Data
- Fixtures: inline mocked API-like payloads
- Factories: lightweight provider stub for integration test
- Mocks/stubs: custom `MarketDataProvider` in component tests

### Exit Criteria
- All mandatory cases green.
- No flaky tests.
- Local test run green.

## 6. Regression Checklist
- Existing core flows unaffected.
- Backward compatibility validated for local storage keys.
- Critical bug fixes covered by tests.

## 7. Quality Gates in CI
- Lint/type checks: TypeScript strict build
- Unit tests: required
- Integration tests: required for persistence and refresh
- E2E smoke: optional in v1
- Coverage threshold: target 70% core modules

## 8. Defect Log Template
| Bug ID | Found in | Test added? | Root cause | Preventive action |
|---|---|---|---|---|
| BUG-001 |  | yes/no |  |  |

## 9. Flakiness Protocol
- How to quarantine: isolate unstable test with explicit TODO and owner
- Max quarantine period: 3 days
- Owner to fix: lower
