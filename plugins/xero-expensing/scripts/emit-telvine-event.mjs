#!/usr/bin/env node
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const PLUGIN_SLUG = "xero-expensing";
const DEFAULT_SKILL_SLUG = "expense-creation-assist";
const VERSION = "0.2.1";
const EVENTS_API = process.env.TELVINE_EVENTS_URL || process.env.TELVINE_API_URL || "https://api.telvine.com/v1/events";
const RUNTIME_KEY_API = process.env.TELVINE_RUNTIME_KEY_URL || new URL("/v1/runtime/write-key", EVENTS_API).toString();
const ENV_KEY = process.env.TELVINE_WRITE_KEY || process.env.TELVINE_API_KEY || "";
const ENV_PLUGIN_ID = process.env.TELVINE_PLUGIN_ID || "";
const ENV_SKILL_ID = process.env.TELVINE_SKILL_ID || "";
const DEBUG = process.env.TELVINE_DEBUG_TELEMETRY === "1";
const PLUGIN_STATE_DIR = process.env.PLUGIN_DATA || process.env.CLAUDE_PLUGIN_DATA || join(homedir(), ".telvine", "plugins", PLUGIN_SLUG);
const INSTALL_FILE = join(PLUGIN_STATE_DIR, "install_id");

const skillIdSlugHints = new Map([
  ["skl_expense_creation_assist", "expense-creation-assist"],
  ["skl_expense_readiness_review", "expense-readiness-review"],
]);

const forbiddenPropertyKeys = [
  "prompt",
  "file_contents",
  "browser_capture",
  "browser_dom",
  "screenshot",
  "connector_payload",
  "tool_arguments",
  "model_output",
  "receipt",
  "receipt_contents",
  "transaction_text",
  "invoice_contents",
  "company_name",
  "employee_name",
  "supplier_name",
  "customer_name",
  "account_number",
  "bank_detail",
  "claim_description",
  "account_value",
  "form_value",
  "retrieved_records",
];

const eventTypeDefaults = {
  "plugin.install": {
    via: "marketplace",
    source: "marketplace",
    install_context: "self_serve",
    initial_version: VERSION,
  },
  "skill.invocation.start": {
    trigger: "explicit",
    task_category: "automation",
  },
  "plugin.component.invoked": {
    component_type: "runtime_component",
    component_name: "xero-web-browser",
    operation: "loaded",
  },
  "skill.invocation.end": {
    duration_ms: 0,
    tool_calls_count: 0,
    trigger: "explicit",
    outcome: "completed",
    completion_quality: "not_applicable",
    user_visible_output: true,
    task_category: "automation",
  },
  "feedback.submitted": {
    task_category: "automation",
  },
};

const stdin = await readStdin();
const input = stdin.trim() ? JSON.parse(stdin) : {};
const eventType = input.event_type || "plugin.install";
if (!eventTypeDefaults[eventType] && eventType !== "plugin.component.error" && eventType !== "skill.invocation.error") {
  throw new Error(`Unsupported event_type for Xero telemetry helper: ${eventType}`);
}

const properties = {
  ...(eventTypeDefaults[eventType] || {}),
  ...(input.properties || {}),
};
assertMetadataOnly(properties);

const installationId = input.installation_id || await getOrCreateInstallationId();
const skillRequired = eventType.startsWith("skill.") || eventType === "feedback.submitted";
const requestedSkillSlug = skillRequired ? resolveSkillSlug(input) : null;
const runtimeCredential = await getRuntimeCredential(installationId, requestedSkillSlug);
const key = ENV_KEY || runtimeCredential.key;
const pluginId = input.plugin_id || ENV_PLUGIN_ID || runtimeCredential.pluginId;
const skillId = skillRequired ? input.skill_id && !skillIdSlugHints.has(input.skill_id) ? input.skill_id : ENV_SKILL_ID || runtimeCredential.skillId : null;

if (!key || !pluginId || (skillRequired && !skillId)) {
  if (DEBUG) console.error(`telemetry skipped: missing runtime credential (${eventType})`);
  process.exit(0);
}

const event = {
  event_type: eventType,
  plugin_id: pluginId,
  version: input.version || VERSION,
  installation_id: installationId,
  occurred_at: input.occurred_at || new Date().toISOString(),
  idempotency_key: input.idempotency_key || makeIdempotencyKey(eventType, installationId),
  runtime: input.runtime || process.env.TELVINE_RUNTIME || "codex-app",
  properties,
  ...(skillRequired ? { skill_id: skillId } : {}),
};

let response = await sendEvent(key, event);

if (!response.ok) {
  const body = await response.text().catch(() => "");
  if (response.status === 401 || response.status === 403) {
    const refreshedCredential = await getRuntimeCredential(installationId, requestedSkillSlug, { force: true });
    const refreshedKey = refreshedCredential.key;
    const refreshedPluginId = input.plugin_id || refreshedCredential.pluginId || ENV_PLUGIN_ID;
    const refreshedSkillId = skillRequired ? input.skill_id && !skillIdSlugHints.has(input.skill_id) ? input.skill_id : refreshedCredential.skillId || ENV_SKILL_ID : null;
    if (refreshedKey && refreshedPluginId && (!skillRequired || refreshedSkillId) && refreshedKey !== key) {
      response = await sendEvent(refreshedKey, {
        ...event,
        plugin_id: refreshedPluginId,
        ...(skillRequired ? { skill_id: refreshedSkillId } : {}),
      });
      if (response.ok) {
        if (DEBUG) console.error(`telemetry emitted after key refresh: ${event.event_type}`);
        process.exit(0);
      }
      const retryBody = await response.text().catch(() => "");
      if (DEBUG) console.error(`telemetry skipped after key refresh: ${response.status} ${retryBody}`);
      process.exit(0);
    }
  }
  if (DEBUG) console.error(`telemetry skipped: ${response.status} ${body}`);
  process.exit(0);
}

if (DEBUG) console.error(`telemetry emitted: ${event.event_type}`);

async function readStdin() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

function resolveSkillSlug(eventInput) {
  if (eventInput.skill_slug) return eventInput.skill_slug;
  if (eventInput.skill_id && skillIdSlugHints.has(eventInput.skill_id)) return skillIdSlugHints.get(eventInput.skill_id);
  return DEFAULT_SKILL_SLUG;
}

async function sendEvent(writeKey, payload) {
  return fetch(EVENTS_API, {
    method: "POST",
    headers: {
      authorization: `Bearer ${writeKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

async function getOrCreateInstallationId() {
  try {
    const existing = (await readFile(INSTALL_FILE, "utf8")).trim();
    if (existing) return existing;
  } catch {
    // Create below.
  }
  const id = `inst_${randomUUID().replace(/-/g, "")}`;
  await mkdir(dirname(INSTALL_FILE), { recursive: true });
  await writeFile(INSTALL_FILE, `${id}\n`, { mode: 0o600 });
  return id;
}

async function getRuntimeCredential(installationId, skillSlug, options = {}) {
  if (ENV_KEY && !options.force) return { key: ENV_KEY, pluginId: ENV_PLUGIN_ID, skillId: ENV_SKILL_ID };

  const cachePath = runtimeKeyFile(skillSlug);
  const cached = options.force ? null : await readCachedRuntimeCredential(installationId, skillSlug, cachePath);
  if (cached) return cached;

  try {
    const response = await fetch(RUNTIME_KEY_API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        plugin_slug: PLUGIN_SLUG,
        ...(skillSlug ? { skill_slug: skillSlug } : {}),
        installation_id: installationId,
        runtime: process.env.TELVINE_RUNTIME || "codex-app",
        runtime_version: process.env.TELVINE_RUNTIME_VERSION,
      }),
    });
    if (!response.ok) {
      if (DEBUG) console.error(`telemetry key provisioning failed: ${response.status}`);
      return { key: "", pluginId: "", skillId: "" };
    }

    const body = await response.json();
    if (!body?.key || !body?.plugin_id || (skillSlug && !body?.skill_id)) {
      if (DEBUG) console.error("telemetry key provisioning failed: missing credential fields");
      return { key: "", pluginId: "", skillId: "" };
    }
    const credential = {
      key: body.key,
      pluginId: body.plugin_id,
      skillId: body.skill_id || "",
      expiresAt: body.expires_at || null,
    };
    await writeCachedRuntimeCredential(installationId, skillSlug, credential, cachePath);
    if (DEBUG) console.error("telemetry runtime write key provisioned");
    return credential;
  } catch (error) {
    if (DEBUG) console.error(`telemetry key provisioning failed: ${error instanceof Error ? error.message : String(error)}`);
    return { key: "", pluginId: "", skillId: "" };
  }
}

function runtimeKeyFile(skillSlug) {
  return join(PLUGIN_STATE_DIR, skillSlug ? `runtime_key.${skillSlug}.json` : "runtime_key.plugin.json");
}

async function readCachedRuntimeCredential(installationId, skillSlug, cachePath) {
  try {
    const payload = JSON.parse(await readFile(cachePath, "utf8"));
    if (payload.plugin_slug !== PLUGIN_SLUG || payload.skill_slug !== (skillSlug || null) || payload.installation_id !== installationId || !payload.key) {
      return null;
    }
    if (payload.expires_at && new Date(payload.expires_at).getTime() - Date.now() < 60 * 60 * 1000) return null;
    return {
      key: decryptRuntimeKey(payload.key, installationId, skillSlug),
      pluginId: payload.plugin_id || "",
      skillId: payload.skill_id || "",
      expiresAt: payload.expires_at || null,
    };
  } catch {
    return null;
  }
}

async function writeCachedRuntimeCredential(installationId, skillSlug, credential, cachePath) {
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(
    cachePath,
    `${JSON.stringify(
      {
        plugin_slug: PLUGIN_SLUG,
        plugin_id: credential.pluginId,
        skill_slug: skillSlug || null,
        skill_id: credential.skillId || null,
        installation_id: installationId,
        expires_at: credential.expiresAt || null,
        key: encryptRuntimeKey(credential.key, installationId, skillSlug),
      },
      null,
      2,
    )}\n`,
    { mode: 0o600 },
  );
}

function encryptRuntimeKey(key, installationId, skillSlug) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", runtimeKeyEncryptionKey(installationId, skillSlug), iv);
  const encrypted = Buffer.concat([cipher.update(key, "utf8"), cipher.final()]);
  return {
    alg: "aes-256-gcm-local-obfuscation",
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    ciphertext: encrypted.toString("base64url"),
  };
}

function decryptRuntimeKey(payload, installationId, skillSlug) {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    runtimeKeyEncryptionKey(installationId, skillSlug),
    Buffer.from(payload.iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function runtimeKeyEncryptionKey(installationId, skillSlug) {
  return createHash("sha256")
    .update(`${PLUGIN_SLUG}:${skillSlug || "plugin"}:${installationId}:${homedir()}`)
    .digest();
}

function makeIdempotencyKey(eventType, installationId) {
  const bucket = eventType === "plugin.install" ? "once" : new Date().toISOString();
  return createHash("sha256")
    .update(`${PLUGIN_SLUG}:${VERSION}:${installationId}:${eventType}:${bucket}`)
    .digest("hex");
}

function assertMetadataOnly(value, path = "properties") {
  if (value == null) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertMetadataOnly(item, `${path}.${index}`));
    return;
  }
  if (typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    if (forbiddenPropertyKeys.some((blocked) => normalized.includes(blocked))) {
      throw new Error(`Refusing unsafe telemetry key: ${path}.${key}`);
    }
    assertMetadataOnly(nested, `${path}.${key}`);
  }
}
