# Altrym Target Customer Plugin Marketplace

This repository publishes synthetic target-customer Codex plugins for finance
operations demos. Each plugin packages a focused `SKILL.md`, connector and MCP
component inventory, Telvine analytics fixtures, and dummy data for offline
walkthroughs.

Each target plugin includes two synthetic fixture snapshots, `v0.1.0` and
`v0.2.0`, so teams can compare plugin-version behavior, completion quality,
exception volume, and Telvine telemetry side by side.

## Install The Marketplace

```bash
codex plugin marketplace add Altrym/example-plugin-marketplace
```

After the marketplace has been added, open the Codex plugin directory and add
one of the target-customer plugins.

## Included Plugins

| Plugin | Target | Demo hook |
| --- | --- | --- |
| `ramp-expense-ops` | Ramp accounting automation / expense PM | Spend coding, categorisation, and close support |
| `brex-spend-controls` | Brex expense management / spend controls PM | Spend policy, card limits, and reimbursement controls |
| `mercury-treasury` | Mercury banking / cash and treasury PM | Balances, runway, statements, and treasury checks |
| `tide-cashflow-ops` | Tide business banking / cashflow PM | SME balances, invoices, cashflow risk, and banking operations exceptions |
| `xero-expensing` | Xero expenses / AP automation PM | Expense claims, receipts, reimbursements, and accounting sync checks |
| `telvine-plugin-builder` | Plugin builders and platform teams | Create provider renditions and register plugins with Telvine |

## Repository Layout

```text
.agents/plugins/marketplace.json
plugins/<plugin>/.codex-plugin/plugin.json
plugins/<plugin>/skills/<skill>/SKILL.md
plugins/<plugin>/analytics/
plugins/<plugin>/fixtures/synthetic-q2-2026/
plugins/<plugin>/fixtures/synthetic-q2-2026/v0.1.0/
plugins/<plugin>/fixtures/synthetic-q2-2026/v0.2.0/
```

The marketplace manifest exposes the GTM target-customer plugins as available
Productivity plugins. All analytics and fixture data are synthetic.

## Register A Plugin With Telvine

Use Telvine CLI for the normal publishing path:

```bash
npm i -g @telvine/cli
telvine login
telvine publish ./plugins/tide-cashflow-ops
```

This repository also includes a direct registration helper for local testing:

```bash
TELVINE_CLERK_JWT='<token>' node scripts/register-plugin-to-telvine.mjs plugins/tide-cashflow-ops
```

## Private Org Distribution

For teams that are not on Codex Enterprise, see
[Private GitHub Org Plugin Marketplaces For Codex](./PRIVATE_ORG_PLUGIN_MARKETPLACE_GUIDE.md)
for a private-repository distribution pattern.
