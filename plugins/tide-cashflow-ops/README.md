# Tide Cashflow Ops Plugin

Review SME cashflow health, invoice collection risk, VAT-ready categorisation, and banking operations exceptions for Tide-style business banking teams.

## Target Customer

- Company segment: Tide PM - Business Banking / Cashflow
- Workflow hook: SME balances, invoices, cashflow risk, and banking operations exceptions
- Plugin id: `plg_tide_cashflow_ops`

## Components

- Skill: `cashflow-health-review`
- Connector fixture: `tide-api`
- MCP config fixture: `tide-mcp`
- Analytics fixtures: `analytics/`
- Dummy data: `fixtures/synthetic-q2-2026/` with `v0.1.0/` and `v0.2.0/` comparison snapshots

## Demo Flow

1. Open the plugin in Codex and ask: `Review Tide SME cashflow health and invoice collection risks.`
2. Use the latest CSVs in `fixtures/synthetic-q2-2026/`, or compare `fixtures/synthetic-q2-2026/v0.1.0/` against `fixtures/synthetic-q2-2026/v0.2.0/`.
3. Review the ranked cashflow exceptions, collection risks, and recommended product actions.
4. Inspect `analytics/dashboard-summary.json`, `analytics/version-comparison.json`, and the versioned `analytics/sample-events*.jsonl` files for the Telvine product analytics view.

## Safety

All data in this plugin is synthetic. Do not put live customer data, bank account numbers, customer names, invoice contents, connector payloads, prompts, or model outputs in analytics events.
