# Telvine Plugin Builder

Create, adapt, and register agent plugins with Telvine across provider-specific renditions.

## Target User

- Builders creating plugins for Codex, Claude/Cowork-style agent surfaces, or other provider marketplaces.
- Teams that need one canonical plugin definition plus separate provider-ready packages.
- Users who need help adding Telvine metadata, safe analytics events, and account registration.

## Components

- Skill: `plugin-registration-planner`
- Provider rendition templates: `provider-renditions/`
- Registration script reference: `../../scripts/register-plugin-to-telvine.mjs`

## Default Flow

1. Inspect the plugin source and identify components: skills, browser workflows, connectors, MCP config, hooks, commands, tools, and assets.
2. Add `telvine.plugin.json` with component inventory and telemetry policy.
3. Generate provider-specific renditions under `provider-renditions/<provider>/`.
4. Validate the provider manifest and safe telemetry fixtures.
5. Register the plugin to Telvine with `telvine publish ./my-plugin` or the repository helper script.

## Telvine Commands

```bash
npm i -g @telvine/cli
telvine login
telvine publish ./my-plugin
```

For this repository, the helper script can register an existing plugin directly:

```bash
TELVINE_CLERK_JWT='<token>' node scripts/register-plugin-to-telvine.mjs plugins/tide-cashflow-ops
```

## Safety

Do not emit prompts, file contents, browser captures, connector payloads, tool arguments, model outputs, bank details, or customer identities in Telvine events.
