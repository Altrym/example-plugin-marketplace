---
name: expense-readiness-review
description: >
  Use this skill when the user asks to review Xero expense claims, receipt compliance, reimbursement queues, billable spend, or accounting sync exceptions.
version: 0.2.1
telvine_plugin_id: plg_xero_expensing
telvine_skill_id: skl_expense_readiness_review
---

# Xero Expensing: expense-readiness-review

Review existing expense claims, receipts, reimbursements, and accounting sync readiness for finance teams using Xero. Use `expense-creation-assist` when the user wants to create a new expense.

## Operating Principles

- Never approve, reject, reimburse, post, or sync records automatically. Produce review-ready recommendations only.
- Prefer deterministic fixture data or connector exports over inferred numbers.
- Keep analytics payloads metadata-only: no prompts, receipts, bank details, employee names, supplier names, connector payloads, browser DOM, screenshots, or model output.
- Lead with exceptions and blocked actions, then summarize clean claims.

## Inputs

Use a live connector only when explicitly configured. For demos, use the CSVs in `fixtures/synthetic-q2-2026/`.

If the user says "my Xero", "our Xero", "real account", or offers to authenticate, do not use fixtures by default. Use user-authorized browser or connector access, produce summaries only, and disable account-derived Telvine analytics. Emit only metadata lifecycle events through the telemetry helper.

## Browser-First Routing

1. Open Xero from the user's authenticated browser session when requested.
2. Wait for user login and MFA.
3. Start from the visible dashboard.
4. Visit Business > Expense Claims or the visible Expenses area for submitted claims and receipts.
5. Visit Bills to Pay / Purchases for reimbursable or card-linked spend that may affect AP.
6. Visit Bank Reconciliation for unmatched expense payments.
7. Visit Accounting reports only for summary checks.
8. Avoid payments, approvals, settings changes, bill creation, contact edits, invoice creation, or support messages. If the user wants to create a new expense, switch to `expense-creation-assist`.

## Telemetry Preflight

1. Run `scripts/emit-telvine-event.mjs` for metadata-only lifecycle events.
2. Use `TELVINE_WRITE_KEY` or `TELVINE_API_KEY` when configured.
3. If no env key is configured, let the helper provision an installation-bound runtime write key from Telvine.
4. Create and persist a stable installation id on first run.
5. Emit `plugin.install` exactly once for that installation id.
6. Emit `skill.invocation.start`, `plugin.component.invoked`, and `skill.invocation.end` as the workflow runs.
7. Never emit receipt text, claim descriptions, employee names, supplier names, bank details, connector payloads, browser DOM, screenshots, prompts, tool arguments, or model output.

## Workflow

1. Confirm entity, review period, currency, policy pack, approval matrix, and reimbursement cut-off.
2. Load synthetic or exported expense claims, policy rules, and reimbursement status.
3. Compare each claim against receipt, tax, category, billable, duplicate, approval, and payment-status rules.
4. Rank exceptions by reimbursement risk, month-end close risk, amount, and confidence.
5. Separate actions into employee follow-up, approver follow-up, finance review, and ready-to-sync.
6. Produce a review table with proposed actions. Never update Xero records automatically.

## Expected Output

- Expense-claim health summary
- Receipt and policy exception ranking
- Reimbursement follow-up queue
- Accounting sync readiness list
- Analytics event checklist

## Telvine Events To Emit

- `plugin.install` once per stable installation id when first-run telemetry is available.
- `skill.invocation.start` with `plugin_id=plg_xero_expensing` and `skill_id=skl_expense_readiness_review`.
- `plugin.component.invoked` for `xero-api` when connector data is loaded.
- `plugin.component.invoked` for `xero-web-browser` when browser-derived summaries are loaded.
- `plugin.component.invoked` for `xero-mcp` when MCP configuration is detected or tested.
- `skill.reference.loaded` for `synthetic-q2-2026-fixtures` when fixture files are loaded.
- `skill.invocation.end` with outcome, duration, tool-call count, completion quality, artifact type, and downstream action.

See `analytics/sample-events.jsonl` for safe synthetic payloads.
