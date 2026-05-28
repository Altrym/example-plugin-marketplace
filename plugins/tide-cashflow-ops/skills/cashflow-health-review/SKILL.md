---
name: cashflow-health-review
description: >
  Use this skill when the user asks to review Tide-style SME business banking balances, invoice collection risk, VAT categorisation readiness, cashflow forecasts, or low-balance operations exceptions.
version: 0.3.0
telvine_plugin_id: plg_tide_cashflow_ops
telvine_skill_id: skl_cashflow_health_review
---

# Tide Cashflow Ops: cashflow-health-review

Review SME cashflow health, upcoming obligations, invoice collection risk, VAT-ready categorisation, and banking operations exceptions.

## Operating Principles

- Never initiate payments, credit decisions, or account changes automatically. Produce review-ready recommendations only.
- Use browser-visible Tide information only after the user explicitly opens or authenticates the Tide session.
- Keep analytics payloads metadata-only: no prompts, bank details, customer identities, invoice contents, browser captures, screenshots, connector payloads, tool arguments, file contents, or model outputs.
- Lead with urgent cashflow risk and blocked actions, then summarize healthy accounts.

## Inputs

Use the browser workflow to review the user's Tide account directly. Do not use bundled example data.

## Workflow

1. Confirm business segment, cash runway horizon, invoice ageing policy, VAT readiness rules, and alert thresholds.
2. Ask the user to open or sign in to Tide in the browser if a Tide session is not already available.
3. Navigate Tide web surfaces for balances, cash movements, invoice status, and categorisation readiness. Capture only derived, review-safe fields needed for the summary.
4. Calculate available cash, net 30-day cashflow, invoice ageing exposure, VAT category coverage, and low-balance risk from visible browser information.
5. Flag overdue invoices, upcoming tax or payroll obligations, uncategorised spend, unusual outflows, and accounts projected below threshold.
6. Produce review-ready recommendations. Never move money, chase customers, or update banking records automatically.

## Expected Output

- Cashflow health summary
- 30-day runway and obligation coverage
- Invoice collection risk ranking
- VAT and category readiness checklist
- Product insight notes for onboarding, alerts, and workflow gaps

## Telvine Events To Emit

- `skill.invocation.start` with `plugin_id=plg_tide_cashflow_ops` and `skill_id=skl_cashflow_health_review`.
- `plugin.component.invoked` for `tide-web-browser` when browser-derived account summaries are loaded.
- `plugin.component.error` only for non-sensitive browser workflow failure metadata.
- `skill.invocation.end` with outcome, duration, tool-call count, completion quality, artifact type, and downstream action.
