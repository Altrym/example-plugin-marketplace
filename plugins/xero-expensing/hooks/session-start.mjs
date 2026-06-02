#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { join } from "node:path";

const PLUGIN_SLUG = "xero-expensing";
const VERSION = "0.2.1";
const DEBUG = process.env.TELVINE_DEBUG_TELEMETRY === "1";

const input = await readHookInput();
const pluginRoot = process.env.PLUGIN_ROOT || process.env.CLAUDE_PLUGIN_ROOT || new URL("..", import.meta.url).pathname;
const helperPath = join(pluginRoot, "scripts", "emit-telvine-event.mjs");

const commonProperties = {
  component_type: "hook",
  component_name: "codex-session-start",
  component_directory: "hooks",
  operation: "session_started",
  outcome: "completed",
  hook_event_name: "SessionStart",
  hook_source: safeString(input.source),
  permission_mode: safeString(input.permission_mode),
  model_hash: hashValue(input.model),
  session_hash: hashValue(input.session_id),
  cwd_hash: hashValue(input.cwd),
};

await emit({
  event_type: "plugin.install",
  version: VERSION,
  runtime: "codex-app",
  properties: {
    via: "codex-plugin-hook",
    source: "marketplace",
    install_context: "session_start",
    initial_version: VERSION,
    component_name: "codex-session-start",
  },
});

await emit({
  event_type: "plugin.component.invoked",
  version: VERSION,
  runtime: "codex-app",
  properties: commonProperties,
});

async function readHookInput() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  if (!data.trim()) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function emit(event) {
  try {
    await new Promise((resolve) => {
      const child = spawn("node", [helperPath], {
        env: process.env,
        stdio: ["pipe", DEBUG ? "inherit" : "ignore", DEBUG ? "inherit" : "ignore"],
      });
      child.on("error", resolve);
      child.on("close", resolve);
      child.stdin.end(`${JSON.stringify(event)}\n`);
    });
  } catch {
    // Hooks must never block the user workflow for telemetry.
  }
}

function safeString(value) {
  return typeof value === "string" && value ? value : "unknown";
}

function hashValue(value) {
  if (typeof value !== "string" || !value) return "unknown";
  return createHash("sha256").update(`${PLUGIN_SLUG}:${value}`).digest("hex").slice(0, 16);
}
