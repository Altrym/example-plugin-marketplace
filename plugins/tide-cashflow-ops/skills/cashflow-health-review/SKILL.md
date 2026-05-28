---
name: cashflow-health-review
description: >
  Use this skill when the user asks to review Tide-style SME business banking balances, invoice collection risk, VAT categorisation readiness, cashflow forecasts, or low-balance operations exceptions.
version: 0.3.3
telvine_plugin_id: plg_yxZaBuCDr68V5R5u
telvine_skill_id: skl_jfQK6gsd3JnsiNA3
---

# Tide Cashflow Ops: cashflow-health-review

Review SME cashflow health, upcoming obligations, invoice collection risk, VAT-ready categorisation, and banking operations exceptions.

## Operating Principles

- Never initiate payments, credit decisions, or account changes automatically. Produce review-ready recommendations only.
- Use browser-visible Tide information only after the user explicitly opens or authenticates the Tide session.
- If the user says "my account", "our Tide", "real account", or offers to authenticate, do not use fixtures. Open Tide web, wait for user authentication, then review browser-derived summaries only.
- Keep analytics payloads metadata-only: no prompts, bank details, customer identities, invoice contents, browser captures, screenshots, connector payloads, tool arguments, file contents, or model outputs.
- For live account reviews, telemetry must be metadata-only. The telemetry helper provisions a plugin-scoped runtime write key on first use when no `TELVINE_WRITE_KEY` or `TELVINE_API_KEY` is configured. Never send balances, company names, transaction text, invoice details, screenshots, DOM, retrieved records, or model output.
- Lead with urgent cashflow risk and blocked actions, then summarize healthy accounts.

## Inputs

Use the browser workflow to review the user's Tide account directly. Do not use bundled example data unless the user explicitly asks for a demo, synthetic data, or cannot provide browser/export access.

## Browser-First Routing

Use live Tide browser review by default when the user says "my account", "our Tide", "real account", "log in", "authenticate", or similar. The correct path is:

1. Open `https://web.tide.co/`.
2. Wait for the user to complete login and MFA.
3. Start at the visible dashboard or startup hub.
4. Visit Accounts for balances and transactions.
5. Visit Invoices & Bills for overdue and due totals.
6. Visit Taxes for tax-period estimates.
7. Visit Bookkeeping for categorisation and readiness.
8. Visit Payroll for active obligations.
9. Avoid payments, settings changes, invoice creation, account changes, and support messages.

Only use fixtures when the user explicitly asks for a demo or synthetic review, or when live browser/export access is unavailable.

## Telemetry Preflight

Before review work, run `scripts/emit-telvine-event.mjs`. The helper reuses an existing local runtime key, provisions an installation-scoped write key from Telvine on first use, or skips telemetry silently if provisioning is unavailable.

- Emit `plugin.install` once per stable local installation id.
- Emit `skill.invocation.start`.
- When the Tide browser summaries are loaded, emit `plugin.component.invoked` for `tide-web-browser`.
- At the end, emit `skill.invocation.end`.
- If telemetry is unavailable, continue the user task without surfacing telemetry setup details.
- If the review uses a live Tide account, keep events metadata-only and do not include account-derived values.

## Workflow

1. Run the telemetry preflight.
2. Confirm business segment, cash runway horizon, invoice ageing policy, VAT readiness rules, and alert thresholds.
3. Ask the user to open or sign in to Tide in the browser if a Tide session is not already available.
4. Navigate Tide web surfaces using the browser-first routing checklist. Capture only derived, review-safe fields needed for the summary.
5. Calculate available cash, net 30-day cashflow, invoice ageing exposure, VAT category coverage, and low-balance risk from visible browser information.
6. Flag overdue invoices, upcoming tax or payroll obligations, uncategorised spend, unusual outflows, and accounts projected below threshold.
7. Produce review-ready recommendations. Never move money, chase customers, or update banking records automatically.

## Expected Output

- Cashflow health summary
- 30-day runway and obligation coverage
- Invoice collection risk ranking
- VAT and category readiness checklist
- Product insight notes for onboarding, alerts, and workflow gaps

## Telvine Events To Emit

- `plugin.install` once per stable installation id when telemetry is available.
- `skill.invocation.start` with `plugin_id=plg_yxZaBuCDr68V5R5u` and `skill_id=skl_jfQK6gsd3JnsiNA3`.
- `plugin.component.invoked` for `tide-web-browser` when browser-derived account summaries are loaded.
- `plugin.component.error` only for non-sensitive browser workflow failure metadata.
- `skill.invocation.end` with outcome, duration, tool-call count, completion quality, artifact type, and downstream action.
