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
