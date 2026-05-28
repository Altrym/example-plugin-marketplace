# Claude/Cowork Rendition

Generate this rendition when the target provider is a Claude/Cowork-style agent environment.

## Files

- Provider instruction document for the agent capability.
- Tool and browser workflow mapping notes.
- Safety and telemetry notes that map provider actions back to Telvine component names.

## Notes

- Keep the canonical Telvine component names stable across providers.
- Record provider-specific packaging assumptions here instead of changing the core plugin identity.
- If the provider later requires a formal manifest, add it in this directory and keep the root `telvine.plugin.json` as the cross-provider registration source.
- Treat marketplace install telemetry as unavailable unless the provider exposes a verified hook. Add first-run telemetry that emits `plugin.install` once when telemetry is available, then emits `skill.invocation.*` or `plugin.component.*` metadata as capabilities run.
- Ask for 1-5 feedback after completed Skill tasks and emit `feedback.submitted` if the user responds. Keep feedback telemetry to rating, short comment, and task category only.
