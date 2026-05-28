# tide-web-browser Workflow

Browser-first workflow for reviewing Tide web account summaries.

## Scope

- Navigate Tide web account and cashflow surfaces with the user's explicit browser session.
- Derive review-safe summaries for balances, transactions, invoices, and categorisation readiness.
- Avoid payment initiation, credit decisions, account mutation, or support-message automation.
- Continue the task using browser-visible information only; do not fall back to bundled example data when the user is asking about their own account.

## When To Use Live Browser Review

If the user says "my account", "our Tide", "real account", or offers to authenticate, use live browser review. Fixtures are only for explicit demos, synthetic-data requests, or cases where the user cannot provide browser/export access.

## Navigation Checklist

1. Open `https://web.tide.co/`.
2. Wait for user login and MFA.
3. Start at the visible dashboard or startup hub.
4. Visit Accounts for balances and transactions.
5. Visit Invoices & Bills for overdue and due totals.
6. Visit Taxes for tax-period estimates.
7. Visit Bookkeeping for categorisation and readiness.
8. Visit Payroll for active obligations.
9. Avoid payments, settings changes, invoice creation, account changes, and support messages.

## Browser Access Ladder

For live Tide reviews, try every read-only browser route before falling back to exports:

1. Codex in-app Browser plugin, if available.
2. Codex Chrome plugin or connected Chrome extension, if available.
3. Local Chrome automation on macOS using AppleScript:
   - read active tab URL
   - navigate to Tide URLs
   - execute read-only JavaScript to extract visible page text and links
4. Local Safari automation on macOS, if Chrome is unavailable.
5. User-provided export or screenshot.

Do not conclude browser access is unavailable after only checking the in-app browser backend. If one route fails, record the non-sensitive failure reason and continue to the next route. For live account reviews, "browser unavailable" means all configured read-only browser routes failed, not just the Codex in-app browser.

Only perform read-only actions:

- navigate
- click navigation links/tabs
- read visible text
- summarize balances, transactions, invoices, taxes, bookkeeping, and payroll status

Never:

- initiate payments
- create invoices or bills
- change settings
- send support messages
- expose credentials, MFA, full account numbers, card details, or sensitive identifiers

### macOS Chrome Read-Only Probe

If the in-app browser is unavailable, check Chrome:

- Get active URL:
  `osascript -e 'tell application "Google Chrome" to if (count of windows) > 0 then get URL of active tab of front window'`
- Extract visible Tide links with read-only JavaScript over `document.querySelectorAll("a,button")`.
- Extract page summary with read-only `document.body.innerText`.

Mask bank identifiers in the final answer.

## Telemetry

Emit `plugin.component.invoked` when browser-derived summaries are loaded and `plugin.component.error` for non-sensitive workflow failures. The telemetry helper provisions and reuses an installation-bound Telvine runtime write key when no env key is configured. If a configured or cached key returns an auth/scope error, refresh the runtime key and retry once. If provisioning or retry is unavailable, continue the user task without surfacing telemetry details.

After a completed Tide review, ask the user for a 1-5 usefulness rating and optional short note. If they reply, emit `feedback.submitted` through the telemetry helper. Do not include browser-derived values, balances, names, account data, prompts, file contents, or model output in the feedback event.

For live account reviews, do not emit account-derived values. Never emit balances, names, transaction text, invoice details, screenshots, browser DOM payloads, prompts, file contents, bank details, customer identities, connector payloads, tool arguments, model outputs, or retrieved records.
