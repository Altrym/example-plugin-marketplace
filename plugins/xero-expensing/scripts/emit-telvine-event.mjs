#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const PLUGIN_ID = "plg_xero_expensing";
const SKILL_ID = "skl_expense_readiness_review";
const VERSION = "0.2.0";
const API = process.env.TELVINE_API_URL || "https://api.telvine.com/v1/events";
const KEY = process.env.TELVINE_WRITE_KEY || process.env.TELVINE_API_KEY;
const INSTALL_FILE = join(homedir(), ".telvine", "plugins", "xero-expensing", "install_id");

const input = await readStdinJson();
const eventType = input.event_type || "plugin.install";
const installationId = input.installation_id || getInstallationId();
const occurredAt = input.occurred_at || new Date().toISOString();
const properties = input.properties || defaultProperties(eventType);

const event = {
  event_type: eventType,
  version: input.version || VERSION,
  installation_id: installationId,
  occurred_at: occurredAt,
  idempotency_key: input.idempotency_key || idempotencyKey(eventType, installationId, occurredAt),
  runtime: input.runtime || process.env.TELVINE_RUNTIME || "unknown",
  properties,
  plugin_id: input.plugin_id || PLUGIN_ID,
  ...(eventType.startsWith("skill.") ? { skill_id: input.skill_id || SKILL_ID } : {}),
};

assertMetadataOnly(event.properties);

if (!KEY) {
  console.log(`telemetry skipped: no write key (${event.event_type})`);
  process.exit(0);
}

const response = await fetch(API, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${KEY}`,
  },
  body: JSON.stringify({ events: [event] }),
});

if (!response.ok) {
  const body = await response.text().catch(() => "");
  throw new Error(`Telvine telemetry failed ${response.status}: ${body}`);
}

console.log(`telemetry sent: ${event.event_type}`);

async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

function getInstallationId() {
  if (existsSync(INSTALL_FILE)) return readFileSync(INSTALL_FILE, "utf8").trim();
  const id = `inst_xero_expensing_${randomUUID().replace(/-/g, "").slice(0, 18)}`;
  mkdirSync(dirname(INSTALL_FILE), { recursive: true });
  writeFileSync(INSTALL_FILE, `${id}\n`, { mode: 0o600 });
  return id;
}

function idempotencyKey(eventType, installationId, occurredAt) {
  return createHash("sha256").update(`${PLUGIN_ID}:${VERSION}:${eventType}:${installationId}:${occurredAt}`).digest("hex");
}

function defaultProperties(eventType) {
  if (eventType === "plugin.install") {
    return {
      via: "marketplace",
      source: "marketplace",
      install_context: "first_run",
      initial_version: VERSION,
    };
  }
  if (eventType === "skill.invocation.start") {
    return {
      trigger: "explicit",
      task_category: "analysis",
      session_id: `xero-expensing-${Date.now()}`,
      session_invocation_index: 0,
    };
  }
  if (eventType === "plugin.component.invoked") {
    return {
      component_type: "connector",
      component_name: "xero-api",
      operation: "loaded",
      component_directory: "connectors",
      duration_ms: 0,
      outcome: "completed",
      tool_calls_count: 0,
    };
  }
  if (eventType === "skill.invocation.end") {
    return {
      duration_ms: 0,
      tool_calls_count: 0,
      trigger: "explicit",
      outcome: "completed",
      completion_quality: "full",
      user_visible_output: true,
      task_category: "analysis",
      retry_count: 0,
      intervention: "none",
      artifact_type: "text",
      artifact_count_bucket: "1",
      downstream_action: "none",
      configuration_status: "complete",
      reference_load_status: "all_loaded",
      session_id: `xero-expensing-${Date.now()}`,
      session_invocation_index: 0,
    };
  }
  return {};
}

function assertMetadataOnly(value, path = "properties") {
  const forbidden = [
    "prompt",
    "file_contents",
    "browser_dom",
    "screenshot",
    "connector_payload",
    "tool_arguments",
    "model_output",
    "receipt",
    "employee_name",
    "supplier_name",
    "bank_detail",
    "claim_description",
    "account_value",
    "form_value",
  ];
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    if (forbidden.some((term) => normalized.includes(term))) {
      throw new Error(`Refusing live-data telemetry key: ${path}.${key}`);
    }
    assertMetadataOnly(child, `${path}.${key}`);
  }
}
