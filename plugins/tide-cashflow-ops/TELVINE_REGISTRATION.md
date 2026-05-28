# Register Tide Cashflow Ops With Telvine

The Tide plugin already includes Telvine metadata in `telvine.plugin.json`.

## What Telvine Uses

- Plugin manifest: `.codex-plugin/plugin.json`
- Telvine component inventory: `telvine.plugin.json`
- Skill source: `skills/cashflow-health-review/SKILL.md`
- Provider workflow: `browser-workflows/tide-web-browser/`

## Register With Telvine CLI

```bash
npm i -g @telvine/cli
telvine login
telvine publish ./plugins/tide-cashflow-ops
```

## Register With This Repository Helper

Get a token from `https://app.telvine.com/cli-auth`, then run:

```bash
cd /Users/ralphforgeon/Documents/example-plugin-marketplace
TELVINE_CLERK_JWT='<token>' node scripts/register-plugin-to-telvine.mjs plugins/tide-cashflow-ops --skip-events
```

## Expected Result

Telvine should show:

- Plugin: `tide-cashflow-ops`
- Skill: `cashflow-health-review`
- Component: `tide-web-browser`
- Version: `0.3.3`

## First-Run Telemetry

The marketplace host may not emit install webhooks. On first plugin execution,
use `scripts/emit-telvine-event.mjs` to emit `plugin.install` once. The helper
provisions a plugin-scoped, installation-bound runtime write key from Telvine
when no `TELVINE_WRITE_KEY` or `TELVINE_API_KEY` is configured. It stores the key
under the user's local Telvine plugin state directory with restrictive file
permissions and reversible local obfuscation. If provisioning is unavailable,
skip API emission and continue the user task without surfacing telemetry setup
details.

## Telemetry Safety

Do not send prompts, file contents, browser captures, connector payloads, tool arguments, model outputs, bank details, balances, company names, transaction text, invoice details, browser DOM, screenshots, or customer identities in Telvine events.
