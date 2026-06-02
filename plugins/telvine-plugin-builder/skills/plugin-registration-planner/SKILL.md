---
name: plugin-registration-planner
description: >
  Use this skill when a user wants to create an agent plugin, add Telvine metadata, generate provider-specific renditions, or register a plugin to their Telvine account.
version: 0.1.4
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
- Treat host marketplace installs as unverified unless a host webhook, wrapper, or first-run event observes them. Build plugins to emit `plugin.install` once on first run through a configured or self-provisioned Telvine runtime write key.
- For Codex renditions, add a plugin-bundled `SessionStart` hook under `hooks/hooks.json` that uses the runtime key helper and emits `plugin.install` plus `plugin.component.invoked` for `codex-session-start`. Store cached install state in `PLUGIN_DATA` when available.
- Do not treat Codex hook config as portable across providers. For Claude Code, map the same metadata-only helper to Claude's hook format. For hosts without local lifecycle hooks, use wrapper, command, connector, API, or first-run Skill events instead.
- Create reviewable files and commands. Never silently register a plugin without the user's Telvine authentication.
- After a plugin-building, rendition-generation, or registration-planning task is complete, ask the user for feedback and send a metadata-only `feedback.submitted` event if they respond.

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
   - If no env key is configured, use a Telvine runtime write key provisioning helper when the plugin is registered with Telvine.
   - Prefer host-provided plugin data directories, such as `PLUGIN_DATA` in Codex, for cached installation ids and runtime keys.
   - Send telemetry normally first.
   - If ingest returns `401` or `403`, provision a fresh installation-bound runtime write key and retry the same event once.
   - Only continue silently if the retry still fails.
   - Emit `plugin.install` once per stable installation id on first run.
   - Emit `skill.invocation.start`, `plugin.component.invoked` or `plugin.component.error`, and `skill.invocation.end` around observed behavior.
   - Keep live-account, browser, and connector telemetry metadata-only.
6. For Codex renditions, add `hooks/hooks.json` and `hooks/session-start.*`:
   - `SessionStart` should emit `plugin.install` and `plugin.component.invoked`.
   - Include only lifecycle metadata such as hook event name, source, permission mode, plugin version, and hashed session/model/cwd identifiers.
   - Never read transcript files or send prompt, assistant message, tool input, tool output, browser text, file contents, or local paths.
   - Document that users must review and trust plugin-bundled hooks before Codex runs them.
7. Validate local manifests and event JSONL.
8. Register with Telvine:

```bash
npm i -g @telvine/cli
telvine login
telvine publish ./my-plugin
```

For this repository, use:

```bash
TELVINE_CLERK_JWT='<token>' node scripts/register-plugin-to-telvine.mjs plugins/<plugin-name>
```

9. After completing the user-visible task, ask: "Was this plugin-building help useful? Reply with a 1-5 rating and an optional short note. Do not include private code, prompts, secrets, or customer data." If the user provides a rating or note, emit:

```bash
printf '%s\n' '{"event_type":"feedback.submitted","properties":{"rating":5,"comment":"helped me register the plugin","task_category":"generation"}}' \
  | node scripts/emit-telvine-event.mjs
```

Adjust the rating and comment to match the user's response. Omit `rating` or `comment` when the user does not provide that field. Never include generated code, prompts, secrets, file contents, connector payloads, tool arguments, or model output in feedback telemetry.

## Expected Output

- Canonical plugin structure.
- Provider-specific rendition folders.
- `telvine.plugin.json`.
- Safe analytics fixtures when requested.
- First-run telemetry preflight guidance or helper script when the plugin can execute in a host.
- A Codex lifecycle hook when generating a Codex rendition, plus provider-specific guidance for non-Codex hooks.
- Exact registration command for the user's Telvine account.
- A short feedback request after the task is complete, followed by `feedback.submitted` if the user responds.

## Telvine Events To Emit

- `skill.invocation.start` with `plugin_id=plg_telvine_plugin_builder` and `skill_id=skl_plugin_registration_planner`.
- `plugin.component.invoked` for provider-rendition generation.
- `plugin.component.error` for non-sensitive validation or registration failures.
- `skill.invocation.end` with outcome, duration, artifact type, and downstream action.
- `feedback.submitted` after the user responds to the feedback request. Include only `rating`, `comment`, and `task_category="generation"`.
