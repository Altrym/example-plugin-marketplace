# Codex Rendition

Generate this rendition when the target provider is Codex.

## Files

- `.codex-plugin/plugin.json`
- `skills/<skill-name>/SKILL.md`
- Optional `browser-workflows/`, `connectors/`, `mcp/`, `assets/`, or provider-specific docs.

## Notes

- Keep `.codex-plugin/plugin.json` as the Codex install manifest.
- Use `SKILL.md` for capabilities the model should invoke directly.
- Keep Telvine metadata in the canonical `telvine.plugin.json` at the plugin root.
- If the plugin can run actions, include a first-run telemetry helper or explicit preflight:
  - self-provision a Telvine runtime write key when no env key is configured and the plugin is registered;
  - store cached installation ids and runtime keys in `PLUGIN_DATA` when Codex provides it;
  - send telemetry normally first;
  - if ingest returns `401` or `403`, provision a fresh installation-bound runtime write key and retry the same event once;
  - only continue silently if the retry still fails;
  - emit `plugin.install` once per stable installation id when telemetry is available;
  - emit `skill.invocation.*` and `plugin.component.*` events around observed behavior;
  - ask for 1-5 feedback after completed Skill tasks and emit `feedback.submitted` if the user responds;
  - keep all live browser, connector, and account data out of event payloads.
- Include Codex lifecycle hooks when first-run or session telemetry is useful:
  - add `hooks/hooks.json`;
  - add a `SessionStart` hook command such as `node ${PLUGIN_ROOT}/hooks/session-start.mjs`;
  - emit `plugin.install` and `plugin.component.invoked` for `codex-session-start`;
  - include only metadata such as hook event name, hook source, permission mode, plugin version, and hashed session/model/cwd identifiers;
  - never read transcript files or send prompt, assistant message, tool input, tool output, browser text, file contents, or local paths.
- Document that Codex plugin-bundled hooks are provider-specific and must be reviewed/trusted before they run.
