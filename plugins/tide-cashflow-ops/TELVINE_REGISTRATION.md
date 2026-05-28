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
- Version: `0.3.0`

## Telemetry Safety

Do not send prompts, file contents, browser captures, connector payloads, tool arguments, model outputs, bank details, or customer identities in Telvine events.
