---
name: cash-position-review
description: >
  Use this skill when the user asks to review Mercury balances, runway, treasury movement readiness, statement anomalies, or cash-position exceptions.
version: 0.1.0
telvine_plugin_id: plg_mercury_treasury
telvine_skill_id: skl_cash_position_review
---

# Mercury Treasury: cash-position-review

Review cash position, runway, account balances, and treasury transfer exceptions.

## Operating Principles

- Never mutate source system records automatically. Produce review-ready recommendations only.
- Prefer deterministic fixture data or connector exports over inferred numbers.
- Keep analytics payloads metadata-only: no prompts, card numbers, bank details, receipts, or connector payloads.
- Lead with exceptions and blocked actions, then summarize clean items.

## Inputs

Use a live connector only when explicitly configured. For demos, use the CSVs in `fixtures/synthetic-q2-2026/`.

## Workflow

1. Confirm entity, bank accounts, runway horizon, and cash policy.
2. Load balances, movements, runway assumptions, and exception fixtures.
3. Calculate operating cash, reserve coverage, burn multiple, and cash runway.
4. Flag pending transfers, low reserve coverage, unusual outflows, and statement gaps.
5. Produce treasury actions for review. Never initiate payments or transfers automatically.

## Expected Output

- Cash-position summary
- Runway and reserve coverage
- Treasury exception ranking
- Transfer readiness checklist

## Telvine Events To Emit

- `skill.invocation.start` with `plugin_id=plg_mercury_treasury` and `skill_id=skl_cash_position_review`.
- `plugin.component.invoked` for `mercury-api` when connector data is loaded.
- `plugin.component.invoked` for `mercury-mcp` when MCP configuration is detected or tested.
- `skill.invocation.end` with outcome, duration, tool-call count, completion quality, artifact type, and downstream action.

See `analytics/sample-events.jsonl` for safe synthetic payloads.
