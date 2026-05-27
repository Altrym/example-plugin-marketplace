# Altrym Example Plugin Marketplace

This repository publishes `example-plugin` through a Codex plugin marketplace.
It is a minimal scaffold intended to demonstrate repository-backed plugin
distribution.

## Install The Marketplace

```bash
codex plugin marketplace add Altrym/example-plugin-marketplace
```

After the marketplace has been added, open the Codex plugin directory and add
**Example Plugin**.

## Repository Layout

```text
.agents/plugins/marketplace.json
plugins/example-plugin/.codex-plugin/plugin.json
```

The marketplace manifest exposes `example-plugin` as an available Productivity
plugin. The plugin currently contains presentation metadata only; add skills,
apps, or MCP server configuration under `plugins/example-plugin/` as its
functionality grows.

## Private Org Distribution

For teams that are not on Codex Enterprise, see
[Private GitHub Org Plugin Marketplaces For Codex](./PRIVATE_ORG_PLUGIN_MARKETPLACE_GUIDE.md)
for a private-repository distribution pattern.
