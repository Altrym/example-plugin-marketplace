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
- Dummy data: `fixtures/synthetic-q2-2026/`

## Demo Flow

1. Open the plugin in Codex and ask: `Review Ramp spend coding exceptions for close.`
2. Use the CSVs in `fixtures/synthetic-q2-2026/` as the source data.
3. Review the ranked exceptions and recommended actions.
4. Inspect `analytics/dashboard-summary.json` and `analytics/sample-events.jsonl` for the Telvine product analytics view.

## Safety

All data in this plugin is synthetic. Do not put live customer data, card numbers, bank account numbers, receipts, or connector payloads in analytics events.
