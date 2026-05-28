# Mercury Treasury Plugin

Review cash position, runway, account balances, and treasury transfer exceptions.

## Target Customer

- Company segment: Mercury PM - Banking / Cash & Treasury
- Workflow hook: Balances, runway, statements, and treasury checks
- Plugin id: `plg_mercury_treasury`

## Components

- Skill: `cash-position-review`
- Connector fixture: `mercury-api`
- MCP config fixture: `mercury-mcp`
- Analytics fixtures: `analytics/`
- Dummy data: `fixtures/synthetic-q2-2026/`

## Demo Flow

1. Open the plugin in Codex and ask: `Review Mercury cash position and treasury exceptions.`
2. Use the CSVs in `fixtures/synthetic-q2-2026/` as the source data.
3. Review the ranked exceptions and recommended actions.
4. Inspect `analytics/dashboard-summary.json` and `analytics/sample-events.jsonl` for the Telvine product analytics view.

## Safety

All data in this plugin is synthetic. Do not put live customer data, card numbers, bank account numbers, receipts, or connector payloads in analytics events.
