# Private GitHub Org Plugin Marketplaces For Codex

Organizations that are not on Codex Enterprise can still distribute custom
Codex plugins internally by using a private GitHub organization repository as a
plugin marketplace. The repository acts as the catalog. GitHub controls who can
read it, and each user adds the marketplace to their own Codex installation.

This is a pragmatic self-serve path for teams that need private plugins without
a managed enterprise plugin directory.

## What This Gives You

- Private distribution through normal GitHub organization access.
- One repo-level catalog that can contain one plugin or many plugins.
- User-controlled installation through `codex plugin marketplace add`.
- No need to publish plugins publicly.
- No need for Codex Enterprise workspace sharing.

This does not make plugins available to people who lack GitHub read access to
the private repository.

## Repository Shape

Create a private GitHub repository in your organization, for example:

```text
github.com/acme/codex-plugins
```

Use this layout:

```text
.agents/plugins/marketplace.json
plugins/
  my-plugin/
    .codex-plugin/
      plugin.json
    skills/
      my-skill/
        SKILL.md
```

The marketplace file must live at:

```text
.agents/plugins/marketplace.json
```

Each plugin should live under:

```text
plugins/<plugin-name>/
```

## Example Marketplace

```json
{
  "name": "acme-plugins",
  "interface": {
    "displayName": "Acme Plugins"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "local",
        "path": "./plugins/my-plugin"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

Rules that matter:

- `name` is the marketplace identifier users will see after adding it.
- `interface.displayName` is the friendly marketplace title.
- `source.path` is relative to the repository root and should start with `./`.
- Keep plugin folders inside the repository.
- Include `policy.installation`, `policy.authentication`, and `category` for
  every plugin entry.
- Use `AVAILABLE` for normal optional installs.

## Example Plugin Manifest

```json
{
  "name": "my-plugin",
  "version": "0.1.0",
  "description": "Internal Codex workflows for Acme.",
  "author": {
    "name": "Acme"
  },
  "skills": "./skills/",
  "interface": {
    "displayName": "My Plugin",
    "shortDescription": "Internal Acme Codex workflows.",
    "longDescription": "My Plugin packages reusable Codex workflows for Acme teams.",
    "developerName": "Acme",
    "category": "Productivity",
    "capabilities": [],
    "defaultPrompt": "Help me use My Plugin."
  }
}
```

## GitHub Setup

1. Create a private repository in the GitHub organization.
2. Add the marketplace and plugin files.
3. Grant read access to the teams or users who should use the plugins.
4. Make sure users can clone the repo from their machine.

For private org repos, users may need to:

- Sign in to GitHub locally.
- Authorize SSO for the organization if SAML SSO is enabled.
- Use HTTPS credentials, GitHub CLI auth, or SSH keys that can read the repo.

Codex can only add the marketplace if Git can access the repository from the
user's environment.

## User Install Flow

Users add the private marketplace once:

```bash
codex plugin marketplace add acme/codex-plugins
```

If GitHub shorthand does not work in your environment, use an explicit Git URL:

```bash
codex plugin marketplace add https://github.com/acme/codex-plugins.git
```

Or SSH:

```bash
codex plugin marketplace add git@github.com:acme/codex-plugins.git
```

After adding the marketplace, users open the Codex plugin directory and install
the plugins they need.

If your Codex CLI supports marketplace listing, users can check what Codex sees:

```bash
codex plugin marketplace list
```

Some older Codex CLI builds support `add`, `upgrade`, and `remove` but not
`list`. In that case, rely on the command output and the Codex plugin directory.

## Updating Plugins

When you update a plugin:

1. Commit and push the changes to the private repo.
2. Update the plugin version when the install surface or behavior changes.
3. Ask users to refresh the marketplace:

```bash
codex plugin marketplace upgrade acme-plugins
```

If they are unsure of the marketplace name, it is the top-level `name` in:

```text
.agents/plugins/marketplace.json
```

For plugin skill or MCP changes, users should start a new Codex thread after
refreshing and reinstalling so the new plugin components are picked up cleanly.

## Recommended Operating Model

- Keep one private marketplace repo per organization or major product area.
- Use one plugin folder per reusable workflow bundle.
- Review plugin changes like application code.
- Keep secrets out of the repository.
- Put setup notes and required external accounts in each plugin README.
- Prefer stable `main` for normal users, and use branches only for testing.
- Use GitHub teams to control access instead of copying plugin files around.

## When To Use A Public Repo Instead

Use a public marketplace repo when the plugin is intended for customers,
partners, or open-source users outside your GitHub organization. Use a private
org repo when access should stay limited to employees or approved collaborators.

## References

- OpenAI Codex plugin marketplace metadata:
  <https://developers.openai.com/codex/plugins/build#marketplace-metadata>
- OpenAI Codex CLI marketplace command:
  <https://developers.openai.com/codex/cli/reference#codex-plugin-marketplace>
