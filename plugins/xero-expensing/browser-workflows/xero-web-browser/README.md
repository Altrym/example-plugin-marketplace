# xero-web-browser

Read-only browser workflow for Xero Expensing Plugin.

Use this workflow when a user wants a live review of their own Xero account, offers to authenticate, or says "my Xero", "our Xero", or "real account".

## Navigation Checklist

1. Open the user's Xero web session.
2. Wait for user login and MFA.
3. Start at the visible dashboard.
4. Visit Expenses or Expense Claims for submitted claims, receipt status, and approval queues.
5. Visit Bills to Pay / Purchases for spend that affects AP or reimbursement timing.
6. Visit Bank Reconciliation for unmatched expense payments.
7. Visit Reports only for summary checks.
8. Avoid payments, approvals, settings changes, bill creation, contact edits, invoice creation, or support messages.

## Privacy

Do not emit balances, transaction text, receipt contents, employee names, supplier names, browser DOM, screenshots, retrieved records, or model output to Telvine. For live accounts, emit only metadata lifecycle events.

Use the plugin telemetry helper flow:

1. Send telemetry normally first.
2. If no env key is configured, provision an installation-bound runtime write key once the plugin is registered with Telvine.
3. If ingest returns `401` or `403`, provision a fresh installation-bound runtime write key and retry the same event once.
4. Only continue silently if the retry still fails.
