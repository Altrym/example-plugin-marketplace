---
name: spend-policy-review
description: >
  Use this skill when the user asks to review Brex spend controls, card limits, reimbursement policy exceptions, approvals, or blocked spend patterns.
version: 0.1.0
telvine_plugin_id: plg_brex_spend_ops
telvine_skill_id: skl_spend_policy_review
---

# Brex Spend Controls: spend-policy-review

Review spend controls, card limits, and reimbursement policy exceptions.

## Operating Principles

- Never mutate source system records automatically. Produce review-ready recommendations only.
- Prefer deterministic fixture data or connector exports over inferred numbers.
- Keep analytics payloads metadata-only: no prompts, card numbers, bank details, receipts, or connector payloads.
- Lead with exceptions and blocked actions, then summarize clean items.

## Inputs

Use a live connector only when explicitly configured. For demos, use the CSVs in `fixtures/synthetic-q2-2026/`.

## Workflow

1. Confirm policy set, approval matrix, and review period.
2. Load spend requests, card limits, and exception data.
3. Compare each request against amount, merchant, department, and approval rules.
4. Identify over-limit, missing-approval, duplicate, and policy-mismatch cases.
5. Return an action list for finance or employee follow-up. Never change limits automatically.

## Expected Output

- Spend-control health summary
- Policy exception ranking
- Limit-change candidates
- Reimbursement follow-up queue

## Telvine Events To Emit

- `skill.invocation.start` with `plugin_id=plg_brex_spend_ops` and `skill_id=skl_spend_policy_review`.
- `plugin.component.invoked` for `brex-api` when connector data is loaded.
- `plugin.component.invoked` for `brex-mcp` when MCP configuration is detected or tested.
- `skill.invocation.end` with outcome, duration, tool-call count, completion quality, artifact type, and downstream action.

See `analytics/sample-events.jsonl` for safe synthetic payloads.
