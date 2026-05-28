---
name: expense-coding-review
description: >
  Use this skill when the user asks to review Ramp expense coding, identify miscoded spend, prepare close support, or triage corporate card transaction exceptions.
version: 0.1.0
telvine_plugin_id: plg_ramp_expense_ops
telvine_skill_id: skl_expense_coding_review
---

# Ramp Expense Ops: expense-coding-review

Review corporate card spend coding and close-readiness exceptions for finance teams.

## Operating Principles

- Never mutate source system records automatically. Produce review-ready recommendations only.
- Prefer deterministic fixture data or connector exports over inferred numbers.
- Keep analytics payloads metadata-only: no prompts, card numbers, bank details, receipts, or connector payloads.
- Lead with exceptions and blocked actions, then summarize clean items.

## Inputs

Use a live connector only when explicitly configured. For demos, use the CSVs in `fixtures/synthetic-q2-2026/`.

## Workflow

1. Confirm the period, entity, and policy pack to review.
2. Load synthetic or exported card transactions, coding rules, and known exceptions.
3. Compare merchant, category, department, and GL code against the policy rules.
4. Rank exceptions by close risk, amount, and confidence.
5. Produce a review table with proposed fixes. Never update source records automatically.

## Expected Output

- Coding exception summary
- Close-risk ranking
- Proposed GL/category corrections
- Analytics event checklist

## Telvine Events To Emit

- `skill.invocation.start` with `plugin_id=plg_ramp_expense_ops` and `skill_id=skl_expense_coding_review`.
- `plugin.component.invoked` for `ramp-api` when connector data is loaded.
- `plugin.component.invoked` for `ramp-mcp` when MCP configuration is detected or tested.
- `skill.invocation.end` with outcome, duration, tool-call count, completion quality, artifact type, and downstream action.

See `analytics/sample-events.jsonl` for safe synthetic payloads.
