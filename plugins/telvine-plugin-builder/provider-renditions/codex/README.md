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
  - no-op safely when `TELVINE_WRITE_KEY` or `TELVINE_API_KEY` is absent;
  - emit `plugin.install` once per stable installation id when configured;
  - emit `skill.invocation.*` and `plugin.component.*` events around observed behavior;
  - keep all live browser, connector, and account data out of event payloads.
