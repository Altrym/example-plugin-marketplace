# Ramp Expense Ops Plugin

Review corporate card spend coding and close-readiness exceptions for finance teams.

## Target Customer

- Company segment: Ramp PM - Accounting Automation / Expense
- Workflow hook: Spend coding, categorisation, and close support
- Plugin id: `plg_ramp_expense_ops`

## Components

- Skill: `expense-coding-review`
- Connector fixture: `ramp-api`
- MCP config fixture: `ramp-mcp`
- Analytics fixtures: `analytics/`
- Dummy data: `fixtures/synthetic-q2-2026/` with `v0.1.0/` and `v0.2.0/` comparison snapshots

## Demo Flow

1. Open the plugin in Codex and ask: `Review Ramp spend coding exceptions for close.`
2. Use the latest CSVs in `fixtures/synthetic-q2-2026/`, or compare `fixtures/synthetic-q2-2026/v0.1.0/` against `fixtures/synthetic-q2-2026/v0.2.0/`.
3. Review the ranked exceptions and recommended actions.
4. Inspect `analytics/dashboard-summary.json`, `analytics/version-comparison.json`, and the versioned `analytics/sample-events*.jsonl` files for the Telvine product analytics view.

## Safety

All data in this plugin is synthetic. Do not put live customer data, card numbers, bank account numbers, receipts, or connector payloads in analytics events.
