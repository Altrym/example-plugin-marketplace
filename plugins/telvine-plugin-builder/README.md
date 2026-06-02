# Telvine Plugin Builder

Create, adapt, and register agent plugins with Telvine across provider-specific renditions.

## Target User

- Builders creating plugins for Codex, Claude/Cowork-style agent surfaces, or other provider marketplaces.
- Teams that need one canonical plugin definition plus separate provider-ready packages.
- Users who need help adding Telvine metadata, safe analytics events, and account registration.

## Components

- Skill: `plugin-registration-planner`
- Provider rendition templates: `provider-renditions/`
- Codex lifecycle hook: `hooks/session-start.mjs`
- Telemetry helper: `scripts/emit-telvine-event.mjs`
- Registration script reference: `../../scripts/register-plugin-to-telvine.mjs`

## Default Flow

1. Inspect the plugin source and identify components: skills, browser workflows, connectors, MCP config, hooks, commands, tools, and assets.
2. Add `telvine.plugin.json` with component inventory and telemetry policy.
3. Generate provider-specific renditions under `provider-renditions/<provider>/`.
4. Add first-run telemetry guidance or a helper script for runnable plugins.
5. Validate the provider manifest and safe telemetry fixtures.
6. Register the plugin to Telvine with `telvine publish ./my-plugin` or the repository helper script.
7. Ask the user for a 1-5 usefulness rating and optional short note after completing the task; send it as `feedback.submitted` when they respond.

## First-Run Telemetry Pattern

Most host marketplaces do not reliably emit install webhooks. Generated plugins
should not claim verified installs unless telemetry observes them.

For runnable plugins, add a preflight:

1. Check for `TELVINE_WRITE_KEY` or `TELVINE_API_KEY`.
2. If no env key is configured, use Telvine runtime key provisioning once the plugin is registered with Telvine.
3. Persist a stable installation id and emit `plugin.install` once on first run.
4. For Codex renditions, include a `SessionStart` lifecycle hook that emits `plugin.install` and `plugin.component.invoked` for `codex-session-start` using metadata only.
5. Send telemetry normally first.
6. If ingest returns `401` or `403`, provision a fresh installation-bound runtime write key and retry the same event once.
7. Only continue silently if the retry still fails.
8. Emit `skill.invocation.*` for Skills and `plugin.component.*` for browser
   workflows, connectors, hooks, commands, MCP config, agents, and runtime
   components.
9. Ask for feedback after a completed Skill task. If the user replies, emit
   `feedback.submitted` with only `rating`, `comment`, and `task_category`.

Hook support is provider-specific. Codex plugins use `hooks/hooks.json` and `PLUGIN_DATA`. Claude Code renditions should map the same metadata-only helper into Claude's hook format. Hosts without local lifecycle hooks should use wrapper, command, connector, API, or first-run Skill events instead of copying Codex hook config.

For this plugin, the helper can be called like:

```bash
printf '%s\n' '{"event_type":"feedback.submitted","properties":{"rating":5,"comment":"useful setup flow","task_category":"generation"}}' \
  | node scripts/emit-telvine-event.mjs
```

Do not include private code, prompts, secrets, file contents, connector payloads,
tool arguments, or model output in feedback telemetry.

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

Do not emit prompts, file contents, browser captures, browser DOM, connector payloads, tool arguments, model outputs, live account values, transaction text, invoice details, bank details, company names, customer names, or customer identities in Telvine events.
