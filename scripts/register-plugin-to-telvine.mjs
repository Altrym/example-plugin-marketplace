#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const apiBase = (process.env.TELVINE_API_BASE_URL || "https://api.telvine.com").replace(/\/$/, "");
const token = process.env.TELVINE_CLERK_JWT || process.env.CLERK_JWT || "";
const args = process.argv.slice(2);
const eventsOnly = args.includes("--events-only");
const skipEvents = args.includes("--skip-events");
const platformArgIndex = args.indexOf("--platform");
const platform = platformArgIndex >= 0 ? args[platformArgIndex + 1] : "codex";
const positional = args.filter((arg, index) => {
  if (arg === "--events-only" || arg === "--skip-events" || arg === "--platform") return false;
  if (platformArgIndex >= 0 && index === platformArgIndex + 1) return false;
  return true;
});

if (!positional[0]) {
  console.error("Usage: TELVINE_CLERK_JWT='<token>' node scripts/register-plugin-to-telvine.mjs <plugin-path-or-slug> [--platform codex] [--events-only] [--skip-events]");
  console.error("Example: TELVINE_CLERK_JWT='<token>' node scripts/register-plugin-to-telvine.mjs plugins/tide-cashflow-ops");
  process.exit(2);
}

if (!token) {
  console.error("Missing TELVINE_CLERK_JWT. Get one from https://app.telvine.com/cli-auth and run:");
  console.error("  TELVINE_CLERK_JWT='<token>' node scripts/register-plugin-to-telvine.mjs plugins/tide-cashflow-ops");
  process.exit(2);
}

const input = positional[0];
const pluginDir = path.resolve(repoRoot, input.startsWith("plugins/") || input.includes("/") ? input : `plugins/${input}`);
const manifestPath = path.join(pluginDir, ".codex-plugin", "plugin.json");
const telvinePath = path.join(pluginDir, "telvine.plugin.json");
const eventsPath = path.join(pluginDir, "analytics", "sample-events.jsonl");

const json = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const text = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

async function api(method, endpoint, body, authToken = token) {
  const res = await fetch(`${apiBase}${endpoint}`, {
    method,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${authToken}`,
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const payload = res.status === 204 ? null : await res.json().catch(async () => ({ raw: await res.text() }));
  if (!res.ok) {
    const err = new Error(`${method} ${endpoint} failed ${res.status}: ${JSON.stringify(payload)}`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

function skillHashes(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(normalized);
  if (!match) return { frontmatter_hash: sha256(""), body_hash: sha256(normalized.trim() + "\n") };
  return {
    frontmatter_hash: sha256(match[1].trim() + "\n"),
    body_hash: sha256(match[2].trim() + "\n"),
  };
}

function findSkillFiles() {
  const skillsDir = path.join(pluginDir, "skills");
  if (!fs.existsSync(skillsDir)) return [];
  return fs
    .readdirSync(skillsDir)
    .filter((name) => fs.statSync(path.join(skillsDir, name)).isDirectory())
    .map((slug) => ({ slug, file: path.join(skillsDir, slug, "SKILL.md") }))
    .filter((skill) => fs.existsSync(skill.file));
}

function fallbackComponents(skillFiles) {
  const components = skillFiles.map((skill) => ({
    component_type: "skill",
    name: skill.slug,
    telemetry_mode: "skill_events",
  }));
  for (const dirname of ["browser-workflows", "connectors", "mcp", "assets"]) {
    const full = path.join(pluginDir, dirname);
    if (!fs.existsSync(full)) continue;
    for (const name of fs.readdirSync(full)) {
      if (!fs.statSync(path.join(full, name)).isDirectory()) continue;
      components.push({
        component_type: dirname === "browser-workflows" ? "browser_workflow" : dirname.replace(/s$/, ""),
        name,
        telemetry_mode: dirname === "assets" ? "declaration_only" : "component_events",
      });
    }
  }
  return components;
}

async function upsertPlugin(slug, manifest) {
  const existing = await api("GET", "/v1/plugins");
  const found = existing.data.find((plugin) => plugin.slug === slug);
  if (found) return found;
  return api("POST", "/v1/plugins", {
    slug,
    name: manifest.interface?.displayName || manifest.name || slug,
    description: manifest.description,
    platforms: [platform],
  });
}

async function upsertSkill(skillSlug, pluginId, manifest) {
  const existing = await api("GET", "/v1/skills");
  const found = existing.data.find((skill) => skill.slug === skillSlug);
  if (found) {
    if (found.pluginId !== pluginId) {
      return api("PATCH", `/v1/skills/${found.id}`, { plugin_id: pluginId });
    }
    return found;
  }
  return api("POST", "/v1/skills", {
    slug: skillSlug,
    name: skillSlug,
    description: manifest.description || `Capability from ${manifest.name}`,
    plugin_id: pluginId,
  });
}

async function createPluginVersion(pluginId, manifest, components) {
  return api("POST", `/v1/plugins/${pluginId}/versions`, {
    version: manifest.version || "0.1.0",
    manifest_format: platform,
    manifest_hash: sha256(JSON.stringify(manifest)),
    components,
  });
}

async function createSkillVersion(skillId, manifest, skillFile) {
  return api("POST", `/v1/skills/${skillId}/versions`, {
    version: manifest.version || "0.1.0",
    ...skillHashes(text(skillFile)),
  });
}

async function createWriteKey(pluginId, slug) {
  return api("POST", "/v1/keys", {
    name: `${slug} analytics import`,
    scope: "write",
    plugin_id: pluginId,
  });
}

function mappedEvents(pluginId, skillIdByOriginal, originalPluginId) {
  const importId = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return text(eventsPath)
    .trim()
    .split(/\n/)
    .filter(Boolean)
    .map((line, index) => {
      const event = JSON.parse(line);
      event.plugin_id = pluginId;
      if (event.skill_id && skillIdByOriginal.has(event.skill_id)) event.skill_id = skillIdByOriginal.get(event.skill_id);
      event.idempotency_key = `${event.idempotency_key}-${pluginId}-${importId}-${index}`;
      if (event.installation_id && originalPluginId) {
        event.installation_id = event.installation_id.replace(originalPluginId, pluginId);
      }
      return event;
    });
}

const manifest = json(manifestPath);
const telvineManifest = fs.existsSync(telvinePath) ? json(telvinePath) : null;
const slug = manifest.name || path.basename(pluginDir);
const skillFiles = findSkillFiles();
const components = telvineManifest?.components?.map((component) => ({
  component_type: component.component_type,
  name: component.name,
  telemetry_mode: component.telemetry_mode,
})) || fallbackComponents(skillFiles);

console.log(`Registering ${slug} with Telvine`);
const plugin = await upsertPlugin(slug, manifest);
console.log(`  plugin: ${plugin.id}`);

const skillIdByOriginal = new Map();
for (const skillFile of skillFiles) {
  const skill = await upsertSkill(skillFile.slug, plugin.id, manifest);
  console.log(`  skill ${skillFile.slug}: ${skill.id}`);
  const raw = text(skillFile.file);
  const originalSkillId = /telvine_skill_id:\s*([^\s]+)/.exec(raw)?.[1];
  if (originalSkillId) skillIdByOriginal.set(originalSkillId, skill.id);
  if (!eventsOnly) {
    const skillVersion = await createSkillVersion(skill.id, manifest, skillFile.file);
    console.log(`  skill version ${skillFile.slug}: ${skillVersion.id}`);
  }
}

if (!eventsOnly) {
  const pluginVersion = await createPluginVersion(plugin.id, manifest, components);
  console.log(`  plugin version: ${pluginVersion.id}`);
}

if (!skipEvents && fs.existsSync(eventsPath)) {
  const key = await createWriteKey(plugin.id, slug);
  const originalPluginId = telvineManifest?.plugin_id;
  const events = mappedEvents(plugin.id, skillIdByOriginal, originalPluginId);
  const ingest = await api("POST", "/v1/events", { events }, key.key);
  console.log(`  events accepted: ${ingest.accepted.length}, duplicate: ${ingest.duplicate.length}`);
}

console.log("Done. Open https://app.telvine.com to review the plugin record.");
