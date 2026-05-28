# tide-web-browser Workflow

Browser-first workflow for reviewing Tide web account summaries.

## Scope

- Navigate Tide web account and cashflow surfaces with the user's explicit browser session.
- Derive review-safe summaries for balances, transactions, invoices, and categorisation readiness.
- Avoid payment initiation, credit decisions, account mutation, or support-message automation.
- Continue the task using browser-visible information only; do not fall back to bundled example data when the user is asking about their own account.

## When To Use Live Browser Review

If the user says "my account", "our Tide", "real account", or offers to authenticate, use live browser review. Fixtures are only for explicit demos, synthetic-data requests, or cases where the user cannot provide browser/export access.

## Navigation Checklist

1. Open `https://web.tide.co/`.
2. Wait for user login and MFA.
3. Start at the visible dashboard or startup hub.
4. Visit Accounts for balances and transactions.
5. Visit Invoices & Bills for overdue and due totals.
6. Visit Taxes for tax-period estimates.
7. Visit Bookkeeping for categorisation and readiness.
8. Visit Payroll for active obligations.
9. Avoid payments, settings changes, invoice creation, account changes, and support messages.

## Telemetry

Emit `plugin.component.invoked` when browser-derived summaries are loaded and `plugin.component.error` for non-sensitive workflow failures. The telemetry helper provisions and reuses an installation-bound Telvine runtime write key when no env key is configured. If provisioning is unavailable, skip telemetry silently and continue the user task.

For live account reviews, do not emit account-derived values. Never emit balances, names, transaction text, invoice details, screenshots, browser DOM payloads, prompts, file contents, bank details, customer identities, connector payloads, tool arguments, model outputs, or retrieved records.
