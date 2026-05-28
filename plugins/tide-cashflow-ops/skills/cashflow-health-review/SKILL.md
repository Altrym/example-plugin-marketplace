---
name: cashflow-health-review
description: >
  Use this skill when the user asks to review Tide-style SME business banking balances, invoice collection risk, VAT categorisation readiness, cashflow forecasts, or low-balance operations exceptions.
version: 0.2.0
telvine_plugin_id: plg_tide_cashflow_ops
telvine_skill_id: skl_cashflow_health_review
---

# Tide Cashflow Ops: cashflow-health-review

Review SME cashflow health, upcoming obligations, invoice collection risk, VAT-ready categorisation, and banking operations exceptions.

## Operating Principles

- Never initiate payments, credit decisions, or account changes automatically. Produce review-ready recommendations only.
- Prefer deterministic fixture data or connector exports over inferred numbers.
- Keep analytics payloads metadata-only: no prompts, bank details, customer identities, invoice contents, connector payloads, tool arguments, file contents, or model outputs.
- Lead with urgent cashflow risk and blocked actions, then summarize healthy accounts.

## Inputs

Use a live connector only when explicitly configured. For demos, use the CSVs in `fixtures/synthetic-q2-2026/`.

## Workflow

1. Confirm business segment, cash runway horizon, invoice ageing policy, VAT readiness rules, and alert thresholds.
2. Load account balances, cash movements, invoices, and exception fixtures.
3. Calculate available cash, net 30-day cashflow, invoice ageing exposure, VAT category coverage, and low-balance risk.
4. Flag overdue invoices, upcoming tax or payroll obligations, uncategorised spend, unusual outflows, and accounts projected below threshold.
5. Produce product-facing recommendations for review. Never move money, chase customers, or update banking records automatically.

## Expected Output

- Cashflow health summary
- 30-day runway and obligation coverage
- Invoice collection risk ranking
- VAT and category readiness checklist
- Product insight notes for onboarding, alerts, and workflow gaps

## Telvine Events To Emit

- `skill.invocation.start` with `plugin_id=plg_tide_cashflow_ops` and `skill_id=skl_cashflow_health_review`.
- `plugin.component.invoked` for `tide-api` when connector data is loaded.
- `plugin.component.invoked` for `tide-mcp` when MCP configuration is detected or tested.
- `plugin.component.error` only for non-sensitive connector or MCP failure metadata.
- `skill.invocation.end` with outcome, duration, tool-call count, completion quality, artifact type, and downstream action.

See `analytics/sample-events.jsonl` for safe synthetic payloads.
