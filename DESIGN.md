# DESIGN.md

## Meta
- Last updated: 2026-05-04
- Owner: lower
- Status: active

## 1. Visual Direction
- Product name: WEEK ALT
- Style: Dark terminal-like trading board with compact density.
- Priority: Desktop web first; mobile support is secondary.
- Language: English-only UI copy.

## 2. Design Tokens (Current Baseline)
- Background: `--bg #0b0d10`, `--bg2 #111318`, `--bg3 #0d0f13`
- Border: `--border #1e2530`
- Accent: `--amber #f59e0b`
- Positive: `--green #22c55e`
- Negative: `--red #ef4444`
- Secondary accents: `--blue #60a5fa`, `--purple #a78bfa`
- Text: `--text #e2e8f0`, `--dim #475569`, `--pale #94a3b8`

## 3. Typography
- Base font: `'Segoe UI', system-ui, sans-serif`
- Monospace data font: `'Courier New', Courier, monospace`
- Dense sizing: 9px-16px with emphasis on compact table readability.

## 4. Layout System
- Main structure: ticker -> header -> widgets -> search/filter bar -> screener table.
- Primary grid: 3-column widgets (`240px 1fr 210px`) on desktop.
- Responsive fallback: 2 columns below 1000px, 1 column below 640px.

## 5. Component Language
- Widget cards: rounded dark panels with thin borders.
- Data states: green/red numeric polarity, zone-specific color cues.
- Table: sticky header, sortable columns, row state tinting, expandable detail row.
- Controls: small outline buttons, focused amber input border.

## 6. Interaction Patterns
- Auto-save indicator visible in header.
- Hover card for in-place coin edit.
- Refresh buttons with loading/spin and toast feedback.
- Keyboard shortcut: `R` for refresh (outside text inputs).

## 7. Current Constraints
- Keep design consistent with existing `altdash.html` styling as baseline.
- Avoid large visual redesign before CSV import and deployment tasks are complete.
