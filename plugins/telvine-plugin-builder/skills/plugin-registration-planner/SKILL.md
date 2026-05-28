---
name: plugin-registration-planner
description: >
  Use this skill when a user wants to create an agent plugin, add Telvine metadata, generate provider-specific renditions, or register a plugin to their Telvine account.
version: 0.1.1
telvine_plugin_id: plg_telvine_plugin_builder
telvine_skill_id: skl_plugin_registration_planner
---

# Telvine Plugin Builder: plugin-registration-planner

Help users turn a local agent capability into an installable plugin, create provider-specific renditions, and register it to Telvine.

## Operating Principles

- Treat the plugin as the installable product. Skills, browser workflows, connectors, MCP config, commands, tools, hooks, and assets are plugin components.
- Keep one canonical plugin model, then generate provider-specific renditions from it.
- Prefer browser workflows when the provider or source system has no normal user-facing API key setup.
- Use Telvine telemetry safely. Do not emit prompts, file contents, browser captures, connector payloads, tool arguments, model outputs, bank details, or customer identities.
- Treat host marketplace installs as unverified unless a host webhook, wrapper, or first-run event observes them. Build plugins to emit `plugin.install` once on first run when a Telvine write key is configured.
- Create reviewable files and commands. Never silently register a plugin without the user's Telvine authentication.

## Inputs

- Plugin name, target user, and workflow.
- Target providers such as `codex`, `claude-cowork`, or another provider.
- Component list: skills, browser workflows, connectors, MCP config, commands, hooks, tools, and assets.
- Optional analytics fixtures and dummy data.

## Workflow

1. Normalize the plugin name and create the canonical plugin directory.
2. Add provider-neutral Telvine metadata in `telvine.plugin.json`.
3. Create provider renditions:
   - `provider-renditions/codex/` for Codex `.codex-plugin/plugin.json` and `SKILL.md` packaging.
   - `provider-renditions/claude-cowork/` for Claude/Cowork-style instructions, tool mapping, and manifest notes.
   - Additional provider directories as needed.
4. Add safe telemetry fixtures using `skill.*` events for `SKILL.md` capabilities and `plugin.component.invoked` or `plugin.component.error` for non-Skill components.
5. Add a telemetry preflight for runnable plugins:
   - Check for a configured write key such as `TELVINE_WRITE_KEY` or `TELVINE_API_KEY`.
   - If configured, emit `plugin.install` once per stable installation id on first run.
   - Emit `skill.invocation.start`, `plugin.component.invoked` or `plugin.component.error`, and `skill.invocation.end` around observed behavior.
   - If not configured, skip the API call and report `telemetry skipped: no write key`.
   - Keep live-account, browser, and connector telemetry metadata-only.
6. Validate local manifests and event JSONL.
7. Register with Telvine:

```bash
npm i -g @telvine/cli
telvine login
telvine publish ./my-plugin
```

For this repository, use:

```bash
TELVINE_CLERK_JWT='<token>' node scripts/register-plugin-to-telvine.mjs plugins/<plugin-name>
```

## Expected Output

- Canonical plugin structure.
- Provider-specific rendition folders.
- `telvine.plugin.json`.
- Safe analytics fixtures when requested.
- First-run telemetry preflight guidance or helper script when the plugin can execute in a host.
- Exact registration command for the user's Telvine account.

## Telvine Events To Emit

- `skill.invocation.start` with `plugin_id=plg_telvine_plugin_builder` and `skill_id=skl_plugin_registration_planner`.
- `plugin.component.invoked` for provider-rendition generation.
- `plugin.component.error` for non-sensitive validation or registration failures.
- `skill.invocation.end` with outcome, duration, artifact type, and downstream action.
