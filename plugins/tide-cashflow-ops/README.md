# Tide Cashflow Ops Plugin

Review SME cashflow health, invoice collection risk, VAT-ready categorisation, and banking operations exceptions through the Tide browser experience.

## Target Customer

- Company segment: Tide PM - Business Banking / Cashflow
- Workflow hook: SME balances, invoices, cashflow risk, and banking operations exceptions
- Plugin id: `plg_tide_cashflow_ops`

## Components

- Skill: `cashflow-health-review`
- Browser workflow: `tide-web-browser`

## Browser Flow

1. Open the plugin in Codex and ask: `Review Tide SME cashflow health and invoice collection risks.`
2. Sign in to Tide in the browser when prompted.
3. Let the plugin review visible balances, cash movements, invoice status, and categorisation surfaces.
4. Review the cashflow summary, ranked risks, and suggested next actions.

## Safety

Use browser-derived summaries only. Do not put live customer data, bank account numbers, customer names, invoice contents, screenshots, browser captures, prompts, tool arguments, or model outputs in Telvine events.
