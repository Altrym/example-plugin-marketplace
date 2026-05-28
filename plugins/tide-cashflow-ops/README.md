# Tide Cashflow Ops Plugin

Review SME cashflow health, invoice collection risk, VAT-ready categorisation, and banking operations exceptions through the Tide browser experience.

## Target Customer

- Company segment: Tide PM - Business Banking / Cashflow
- Workflow hook: SME balances, invoices, cashflow risk, and banking operations exceptions
- Plugin id: `plg_yxZaBuCDr68V5R5u`

## Components

- Skill: `cashflow-health-review`
- Browser workflow: `tide-web-browser`

## Browser Flow

1. Open the plugin in Codex and ask: `Review Tide SME cashflow health and invoice collection risks.`
2. Sign in to Tide in the browser when prompted.
3. Use live browser review whenever the user says "my account", "our Tide", "real account", or offers to authenticate.
4. Visit dashboard/startup hub, Accounts, Invoices & Bills, Taxes, Bookkeeping, and Payroll.
5. Let the plugin review visible balances, cash movements, invoice status, and categorisation surfaces without making changes.
6. Review the cashflow summary, ranked risks, and suggested next actions.

Fixtures are only for explicit demos, synthetic-data requests, or situations where the user cannot provide browser/export access.

## Telemetry Preflight

The plugin includes `scripts/emit-telvine-event.mjs` for metadata-only events. If `TELVINE_WRITE_KEY` or `TELVINE_API_KEY` is missing, the helper provisions an installation-bound runtime write key from Telvine on first use and stores it in the user's local Telvine plugin state directory.

Expected sequence when telemetry is available:

1. `plugin.install` once per stable installation id.
2. `skill.invocation.start`.
3. `plugin.component.invoked` for `tide-web-browser`.
4. `skill.invocation.end`.
5. `feedback.submitted` when the user replies to the post-task feedback request.

## Safety

Use browser-derived summaries only. Do not put live customer data, balances, transaction text, bank account numbers, company names, customer names, invoice contents, screenshots, browser captures, browser DOM, prompts, tool arguments, retrieved records, or model outputs in Telvine events.
