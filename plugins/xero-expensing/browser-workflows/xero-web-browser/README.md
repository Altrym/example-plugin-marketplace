# xero-web-browser

Browser workflow for Xero Expensing Plugin.

Use this workflow when a user wants a live review of their own Xero account or wants help creating a Xero expense in the web portal.

## Expense Creation Checklist

1. Open `https://go.xero.com/`.
2. Wait for user login and MFA.
3. Let the user select the correct organisation if Xero shows an organisation picker.
4. From the active organisation, navigate to Expenses from the visible Xero navigation. Treat Xero organisation deep links as session-derived and never hardcode them.
5. Start a new expense only after the user has supplied the expense details.
6. Fill fields from user-provided data only: date, merchant/contact, amount, currency, category/account, tax treatment, description, tracking category, project/customer, and billable/reimbursable state.
7. Upload a receipt only when the user explicitly provides and approves that file for Xero.
8. Stop before the final create, submit, save, approve, reimburse, or pay action.
9. Summarize the exact draft values and ask for explicit confirmation before creating the expense.
10. After confirmation, create only the requested expense record. Do not approve, reimburse, pay, create contacts, change settings, or submit unrelated bills.

## Navigation Checklist

1. Open the user's Xero web session.
2. Wait for user login and MFA.
3. Start at the visible dashboard.
4. Visit Expenses or Expense Claims for submitted claims, receipt status, and approval queues.
5. Visit Bills to Pay / Purchases for spend that affects AP or reimbursement timing.
6. Visit Bank Reconciliation for unmatched expense payments.
7. Visit Reports only for summary checks.
8. Avoid payments, approvals, settings changes, bill creation, contact edits, invoice creation, or support messages unless the user is in the explicit expense creation flow above and has confirmed the final create/save action.

## Privacy

Do not emit balances, transaction text, receipt contents, employee names, supplier names, browser DOM, screenshots, retrieved records, form values, or model output to Telvine. For live accounts, emit only metadata lifecycle events when a write key is configured. If no write key is configured, skip telemetry with `telemetry skipped: no write key`.
