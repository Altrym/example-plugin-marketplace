# Xero Expensing Plugin

Xero Expensing Plugin creates and reviews Xero expense claims through user-confirmed browser, connector export, or synthetic fixture workflows.

## Target Customer

- Company segment: Xero PM - Expenses / AP Automation
- Workflow hook: Expense creation, receipts, reimbursements, and accounting sync checks
- Plugin slug: `xero-expensing`

## Components

- Skill: `expense-creation-assist`
- Skill: `expense-readiness-review`
- Connector: `xero-api`
- Runtime workflow: `xero-web-browser`
- MCP config: `xero-mcp`
- Asset: `synthetic-q2-2026-fixtures`
- Asset: `assets/expense-create-fields.json`
- Telemetry helper: `scripts/emit-telvine-event.mjs`

## Create Expense Flow

Use this flow when the user asks to create an expense in Xero. Start from the generic Xero web entrypoint:

```text
https://go.xero.com/
```

1. Collect required details: date, merchant/contact, amount, currency, category/account, tax treatment, description, receipt file if available, tracking category, project/customer, and billable/reimbursable state.
2. Open Xero in the user's authenticated browser session.
3. Let the user select the correct organisation if Xero asks.
4. Navigate to Expenses from the active organisation's visible Xero navigation. Do not hardcode organisation-scoped Xero deep links.
5. Fill the expense form from the user's supplied details.
6. Stop before the final create/submit/save action and show the user the exact draft values.
7. Continue only after the user explicitly confirms the final action.

The plugin may create an expense record after confirmation. It must not approve, reimburse, pay, sync, edit settings, create contacts, or submit unrelated bills.

## Demo Data

Use `fixtures/synthetic-q2-2026/` for demos. The files are invented and safe to use in product walkthroughs:

- `expense_claims.csv`
- `policy_rules.csv`
- `reimbursements.csv`

## Read-Only Review Flow

1. Ask the user to open or authenticate Xero if a session is not already available.
2. Use browser-visible information or user-provided exports only.
3. Review Expenses, Bills to Pay, Purchases, Bank Reconciliation, Contacts, Reports, and Tracking Categories when visible.
4. Summarize missing receipts, uncategorized spend, reimbursement bottlenecks, duplicate-looking expenses, overdue bills, and reconciliation blockers.
5. Never create expenses, approve reimbursements, submit bills, change settings, send messages, or expose credentials, MFA, bank identifiers, card details, or sensitive identifiers.

## Telemetry Flow

The plugin includes `scripts/emit-telvine-event.mjs` for metadata-only Telvine events. The helper uses `TELVINE_WRITE_KEY` or `TELVINE_API_KEY` when configured, otherwise it provisions an installation-bound runtime write key from Telvine after the plugin has been registered.

If a configured or cached key returns `401` or `403`, the helper provisions a fresh runtime key and retries once. If provisioning is unavailable, it continues the Xero task without surfacing telemetry details unless `TELVINE_DEBUG_TELEMETRY=1` is set.

Expected sequence:

1. `plugin.install` once per stable installation id.
2. `skill.invocation.start`.
3. `plugin.component.invoked` for `xero-web-browser` when read-only browser or export summaries are loaded.
4. `skill.invocation.end`.
5. `feedback.submitted` when the user replies to the post-task feedback request.

## Safety

Do not put live customer data, receipt contents, transaction text, bank account numbers, company names, employee names, supplier names, invoice contents, screenshots, browser captures, browser DOM, prompts, tool arguments, retrieved records, or model outputs in Telvine events.

## Publish With Telvine

```bash
npm i -g @telvine/cli
telvine login
telvine publish ./plugins/xero-expensing
```
