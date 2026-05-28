#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const PLUGIN_ID = "plg_tide_cashflow_ops";
const SKILL_ID = "skl_cashflow_health_review";
const VERSION = "0.3.1";
const API = process.env.TELVINE_API_URL || "https://api.telvine.com/v1/events";
const KEY = process.env.TELVINE_WRITE_KEY || process.env.TELVINE_API_KEY || "";
const INSTALL_FILE = join(homedir(), ".telvine", "plugins", "tide-cashflow-ops", "install_id");

const forbiddenPropertyKeys = [
  "prompt",
  "file_contents",
  "browser_capture",
  "browser_dom",
  "screenshot",
  "connector_payload",
  "tool_arguments",
  "model_output",
  "balance",
  "balances",
  "transaction_text",
  "invoice_details",
  "company_name",
  "customer_name",
  "account_number",
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
  },
  "plugin.component.invoked": {
    component_type: "runtime_component",
    component_name: "tide-web-browser",
    operation: "loaded",
  },
  "skill.invocation.end": {
    duration_ms: 0,
    tool_calls_count: 0,
    trigger: "explicit",
    outcome: "completed",
    completion_quality: "not_applicable",
    user_visible_output: true,
  },
};

const stdin = await readStdin();
const input = stdin.trim() ? JSON.parse(stdin) : {};
const eventType = input.event_type || "plugin.install";
if (!eventTypeDefaults[eventType] && eventType !== "plugin.component.error" && eventType !== "skill.invocation.error") {
  throw new Error(`Unsupported event_type for Tide telemetry helper: ${eventType}`);
}

const properties = {
  ...(eventTypeDefaults[eventType] || {}),
  ...(input.properties || {}),
};
assertMetadataOnly(properties);

const installationId = input.installation_id || await getOrCreateInstallationId();
const event = {
  event_type: eventType,
  plugin_id: PLUGIN_ID,
  version: input.version || VERSION,
  installation_id: installationId,
  occurred_at: input.occurred_at || new Date().toISOString(),
  idempotency_key: input.idempotency_key || makeIdempotencyKey(eventType, installationId),
  runtime: input.runtime || process.env.TELVINE_RUNTIME || "codex-app",
  properties,
  ...(eventType.startsWith("skill.") ? { skill_id: SKILL_ID } : {}),
};

if (!KEY) {
  console.error(`telemetry skipped: no write key (${event.event_type})`);
  process.exit(0);
}

const response = await fetch(API, {
  method: "POST",
  headers: {
    authorization: `Bearer ${KEY}`,
    "content-type": "application/json",
  },
  body: JSON.stringify(event),
});

if (!response.ok) {
  const body = await response.text().catch(() => "");
  throw new Error(`Telvine telemetry failed: ${response.status} ${body}`);
}

console.error(`telemetry emitted: ${event.event_type}`);

async function readStdin() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
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

function makeIdempotencyKey(eventType, installationId) {
  const bucket = eventType === "plugin.install" ? "once" : new Date().toISOString();
  return createHash("sha256")
    .update(`${PLUGIN_ID}:${VERSION}:${installationId}:${eventType}:${bucket}`)
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
      throw new Error(`Refusing live-data telemetry key: ${path}.${key}`);
    }
    assertMetadataOnly(nested, `${path}.${key}`);
  }
}
