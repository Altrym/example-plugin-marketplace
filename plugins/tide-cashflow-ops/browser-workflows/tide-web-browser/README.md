# tide-web-browser Workflow Fixture

Browser-first workflow for reviewing Tide web account summaries.

## Scope

- Navigate Tide web account and cashflow surfaces with the user's explicit browser session.
- Derive review-safe summaries for balances, transactions, invoices, and categorisation readiness.
- Avoid payment initiation, credit decisions, account mutation, or support-message automation.

## Telemetry

Emit `plugin.component.invoked` when browser-derived summaries are loaded and `plugin.component.error` for non-sensitive workflow failures. Do not emit screenshots, prompts, file contents, bank details, customer identities, invoice contents, browser DOM payloads, tool arguments, or model outputs.
