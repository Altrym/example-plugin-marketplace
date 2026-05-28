# tide-mcp Fixture

Synthetic MCP configuration notes for a Tide-style business banking plugin.

## Example Tools

- `list_business_accounts`
- `summarize_cash_movements`
- `list_invoice_risks`
- `check_vat_readiness`

## Safety

Tools should return fixture-safe summaries for demos. Live implementations must redact sensitive banking data before any telemetry event is emitted.
