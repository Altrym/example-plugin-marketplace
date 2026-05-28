# xero-api

Connector placeholder for Xero Expensing Plugin.

This directory documents the component declared in `telvine.plugin.json`. It does not contain live credentials or a runnable connector. For demos, load `../fixtures/synthetic-q2-2026/` instead.

Telemetry should emit `plugin.component.invoked` for safe metadata only: component type, component name, operation, duration, outcome, and counts. Send telemetry normally first. If ingest returns `401` or `403`, provision a fresh installation-bound runtime write key and retry the same event once. Only continue silently if the retry still fails.

Never emit connector payloads, receipt text, employee names, supplier names, bank details, or account-derived values.
