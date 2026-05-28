# xero-mcp

MCP configuration placeholder for Xero Expensing Plugin.

The Codex plugin manifest does not reference a live `.mcp.json` because this demo package intentionally avoids starting non-existent services. Keep this fixture as product inventory and analytics documentation until a real server command is available.

If a real Xero MCP server is added later, register it as a plugin component and emit metadata-only `plugin.component.invoked` / `plugin.component.error` events. Use the standard Telvine runtime flow: send normally first, refresh the installation-bound runtime key on `401` or `403`, retry once, and only continue silently if the retry still fails.
