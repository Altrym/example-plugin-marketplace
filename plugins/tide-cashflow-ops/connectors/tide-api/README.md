# tide-api Connector Fixture

Synthetic connector fixture for Tide-style business banking data.

## Scope

- Business current account balances
- Card and bank cash movements
- Invoice summary and payment status
- Categorisation and VAT readiness metadata

## Telemetry

Emit `plugin.component.invoked` for successful connector reads and `plugin.component.error` for failures. Do not emit prompts, file contents, account numbers, customer identities, invoice contents, connector payloads, tool arguments, or model outputs.
