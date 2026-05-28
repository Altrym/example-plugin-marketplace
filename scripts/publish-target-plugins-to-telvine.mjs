#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const apiBase = (process.env.TELVINE_API_BASE_URL || "https://api.telvine.com").replace(/\/$/, "");
const token = process.env.TELVINE_CLERK_JWT || process.env.CLERK_JWT || "";
const args = process.argv.slice(2);
const eventsOnly = args.includes("--events-only");
const requestedSlugs = args.filter((arg) => arg !== "--events-only");
const targetSlugs = requestedSlugs.length
  ? requestedSlugs
  : ["ramp-expense-ops", "brex-spend-controls", "mercury-treasury", "tide-cashflow-ops"];

if (!token) {
  console.error("Missing TELVINE_CLERK_JWT. Get one from https://app.telvine.com/cli-auth and run:");
  console.error("  TELVINE_CLERK_JWT='<token>' node scripts/publish-target-plugins-to-telvine.mjs");
  process.exit(2);
}

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
    const message = `${method} ${endpoint} failed ${res.status}: ${JSON.stringify(payload)}`;
    const err = new Error(message);
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

function findSkillFile(pluginDir) {
  const skillsDir = path.join(pluginDir, "skills");
  const skillNames = fs.readdirSync(skillsDir).filter((name) => fs.statSync(path.join(skillsDir, name)).isDirectory());
  if (skillNames.length !== 1) throw new Error(`Expected exactly one skill under ${skillsDir}`);
  return {
    slug: skillNames[0],
    file: path.join(skillsDir, skillNames[0], "SKILL.md"),
  };
}

async function upsertPlugin(slug, manifest) {
  const existing = await api("GET", "/v1/plugins");
  const found = existing.data.find((plugin) => plugin.slug === slug);
  if (found) return found;
  return api("POST", "/v1/plugins", {
    slug,
    name: manifest.interface?.displayName || manifest.name || slug,
    description: manifest.description,
    platforms: ["codex"],
  });
}

async function upsertSkill(skillSlug, pluginId, manifest, skillPath) {
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
    description: manifest.description || `Capability from ${path.basename(path.dirname(path.dirname(skillPath)))}`,
    plugin_id: pluginId,
  });
}

function inventoryFromTelvine(telvineManifest) {
  return telvineManifest.components.map((component) => ({
    component_type: component.component_type,
    name: component.name,
    telemetry_mode: component.telemetry_mode,
  }));
}

async function createPluginVersion(pluginId, manifest, telvineManifest) {
  return api("POST", `/v1/plugins/${pluginId}/versions`, {
    version: manifest.version || telvineManifest.version || "0.1.0",
    manifest_format: "codex",
    manifest_hash: sha256(JSON.stringify(manifest)),
    components: inventoryFromTelvine(telvineManifest),
  });
}

async function createSkillVersion(skillId, manifest, skillFile) {
  const hashes = skillHashes(text(skillFile));
  return api("POST", `/v1/skills/${skillId}/versions`, {
    version: manifest.version || "0.1.0",
    ...hashes,
  });
}

async function createWriteKey(pluginId, slug) {
  return api("POST", "/v1/keys", {
    name: `${slug} synthetic analytics import`,
    scope: "write",
    plugin_id: pluginId,
  });
}

function mappedEvents(pluginDir, pluginId, skillId, originalPluginId, originalSkillId) {
  const eventsPath = path.join(pluginDir, "analytics", "sample-events.jsonl");
  const importId = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return text(eventsPath)
    .trim()
    .split(/\n/)
    .map((line, index) => {
      const event = JSON.parse(line);
      event.plugin_id = pluginId;
      if (event.skill_id === originalSkillId || event.skill_id) event.skill_id = skillId;
      event.idempotency_key = `${event.idempotency_key}-${pluginId}-${importId}-${index}`;
      if (event.installation_id) event.installation_id = event.installation_id.replace(originalPluginId, pluginId);
      return event;
    });
}

async function ingestEvents(writeKey, events) {
  return api("POST", "/v1/events", { events }, writeKey);
}

for (const slug of targetSlugs) {
  const pluginDir = path.join(root, "plugins", slug);
  const manifestPath = path.join(pluginDir, ".codex-plugin", "plugin.json");
  const telvinePath = path.join(pluginDir, "telvine.plugin.json");
  const manifest = json(manifestPath);
  const telvineManifest = json(telvinePath);
  const { slug: skillSlug, file: skillFile } = findSkillFile(pluginDir);
  const skillRaw = text(skillFile);
  const originalSkillId = /telvine_skill_id:\s*([^\s]+)/.exec(skillRaw)?.[1];

  console.log(`\nPublishing ${slug}`);
  const plugin = await upsertPlugin(slug, manifest);
  console.log(`  plugin: ${plugin.id}`);
  const skill = await upsertSkill(skillSlug, plugin.id, manifest, skillFile);
  console.log(`  skill: ${skill.id}`);
  if (!eventsOnly) {
    const pluginVersion = await createPluginVersion(plugin.id, manifest, telvineManifest);
    console.log(`  plugin version: ${pluginVersion.id}`);
    const skillVersion = await createSkillVersion(skill.id, manifest, skillFile);
    console.log(`  skill version: ${skillVersion.id}`);
  }

  try {
    const key = await createWriteKey(plugin.id, slug);
    const events = mappedEvents(pluginDir, plugin.id, skill.id, telvineManifest.plugin_id, originalSkillId);
    const ingest = await ingestEvents(key.key, events);
    console.log(`  events accepted: ${ingest.accepted.length}, duplicate: ${ingest.duplicate.length}`);
  } catch (err) {
    console.warn(`  event ingest skipped: ${err.message}`);
  }
}

console.log("\nDone. Open https://app.telvine.com to review the plugin records.");
