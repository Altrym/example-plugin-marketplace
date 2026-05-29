---
name: expense-creation-assist
description: >
  Use this skill when the user asks to create, draft, submit, or enter a new expense in Xero through the Xero expenses web portal.
version: 0.2.0
telvine_plugin_id: plg_xero_expensing
telvine_skill_id: skl_expense_creation_assist
---

# Xero Expensing: expense-creation-assist

Create a Xero expense record from user-supplied details through the Xero web portal.

## Operating Principles

- Use the live Xero web portal by default for real user expenses.
- Fill only fields the user supplied or explicitly approved.
- Stop before the final create, submit, save, approve, reimburse, or pay action and ask the user to confirm the exact draft values.
- After confirmation, create only the requested expense record.
- Never approve, reimburse, pay, sync unrelated records, change settings, create contacts, submit bills, or send support messages.
- Keep Telvine telemetry metadata-only: no prompts, receipt contents, claim descriptions, employee names, supplier names, form values, browser DOM, screenshots, connector payloads, tool arguments, or model output.

## Required User Inputs

Collect the missing fields before opening or filling Xero:

- Expense date
- Merchant, supplier, or contact name
- Amount and currency
- Category, account code, or expense type
- Tax treatment or tax rate, if known
- Description or business purpose
- Receipt file, if available
- Tracking category, project, customer, or billable state, if relevant
- Reimbursable vs company-paid state

Use `assets/expense-create-fields.json` as the field checklist.

## Browser Workflow

1. Open `https://go.xero.com/`.
2. Wait for user login and MFA.
3. If Xero redirects to an organisation picker or dashboard, let the user select the correct organisation.
4. Navigate to Expenses from the active organisation's visible Xero navigation. Do not hardcode organisation-scoped Xero deep links because those URLs are organisation/session scoped.
5. Start a new expense from the visible Expenses page.
6. Fill the form from user-provided values only.
7. If uploading a receipt, confirm the file and destination before uploading it.
8. Stop before the final create, submit, save, approve, reimburse, or pay action.
9. Summarize the exact draft values in plain text.
10. Ask the user for explicit confirmation to create the expense.
11. If confirmed, create the expense and report the visible confirmation or resulting status.

If the user does not confirm, leave the draft unsubmitted and explain what remains open.

## Telemetry Preflight

1. Check for `TELVINE_WRITE_KEY` or an equivalent write-scoped key.
2. If no key is configured, skip network calls and report `telemetry skipped: no write key`.
3. Emit `plugin.install` once for the stable installation id if it has not already been emitted.
4. Emit `skill.invocation.start` at the beginning of the workflow.
5. Emit `plugin.component.invoked` for `xero-web-browser` when the Xero web workflow is used.
6. Emit `skill.invocation.end` after the expense is created, left as draft, or blocked.

For live Xero accounts, telemetry must be metadata-only. Do not include account-derived values, receipt text, form values, browser DOM, screenshots, retrieved records, or model output.

## Expected Output

- Missing-input checklist, if any required fields are absent
- Draft expense summary before final confirmation
- Final result: created, left as draft, or blocked
- Any visible Xero status or confirmation text, paraphrased without sensitive details
- Telvine event checklist

## Telvine Events To Emit

- `skill.invocation.start` with `plugin_id=plg_xero_expensing` and `skill_id=skl_expense_creation_assist`.
- `plugin.component.invoked` for `xero-web-browser` when the browser workflow is used.
- `skill.invocation.end` with outcome, duration, tool-call count, completion quality, artifact type, and downstream action.
- `plugin.component.error` or `skill.invocation.error` if Xero access, required fields, upload, or confirmation blocks the flow.
