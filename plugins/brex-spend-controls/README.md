# Brex Spend Controls Plugin

Review spend controls, card limits, and reimbursement policy exceptions.

## Target Customer

- Company segment: Brex PM - Expense Management / Spend Controls
- Workflow hook: Spend policy, card limits, and reimbursement controls
- Plugin id: `plg_brex_spend_ops`

## Components

- Skill: `spend-policy-review`
- Connector fixture: `brex-api`
- MCP config fixture: `brex-mcp`
- Analytics fixtures: `analytics/`
- Dummy data: `fixtures/synthetic-q2-2026/` with `v0.1.0/` and `v0.2.0/` comparison snapshots

## Demo Flow

1. Open the plugin in Codex and ask: `Review Brex spend-control exceptions.`
2. Use the latest CSVs in `fixtures/synthetic-q2-2026/`, or compare `fixtures/synthetic-q2-2026/v0.1.0/` against `fixtures/synthetic-q2-2026/v0.2.0/`.
3. Review the ranked exceptions and recommended actions.
4. Inspect `analytics/dashboard-summary.json`, `analytics/version-comparison.json`, and the versioned `analytics/sample-events*.jsonl` files for the Telvine product analytics view.

## Safety

All data in this plugin is synthetic. Do not put live customer data, card numbers, bank account numbers, receipts, or connector payloads in analytics events.
