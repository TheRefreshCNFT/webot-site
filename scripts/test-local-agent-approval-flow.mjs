#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const outputRoot = resolve(process.env.WEBOT_AGENT_TEST_OUTPUT || `/Users/webot/Backups/webot-site/local-agent-approval-flow-${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z")}`);
const ollamaHost = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");
const requestedModel = process.env.WEBOT_LOCAL_MODEL || "";
const scenario = {
  customer: "Maya",
  email: "maya.demo@example.com",
  product: "Standard One-Time Job",
  request: "We need a four-day Asheville family vacation itinerary with two kids, good food, light hikes, one museum, driving times, reservation notes, a rain backup plan, and a concise final checklist.",
  allowedFamilies: ["Plan & Itinerary", "Gather & Extract", "Create & Polish", "Build & Automate", "Review & Decide"]
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function waitForOllama(ms = 8000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      await fetchJson(`${ollamaHost}/api/tags`);
      return true;
    } catch {
      await new Promise((resolveWait) => setTimeout(resolveWait, 400));
    }
  }
  return false;
}

async function ensureOllama() {
  if (await waitForOllama(1200)) return null;
  const child = spawn("ollama", ["serve"], { stdio: "ignore", detached: true });
  child.unref();
  const ok = await waitForOllama(10000);
  assert(ok, "Ollama is not reachable at " + ollamaHost + ". Start Ollama or set OLLAMA_HOST.");
  return child;
}

function pickModel(models) {
  if (requestedModel) return requestedModel;
  const names = models.map((item) => item.name || item.model).filter(Boolean);
  const preferred = names.find((name) => /llama|qwen|gemma|mistral|phi/i.test(name));
  return preferred || names[0];
}

function extractJson(text) {
  const trimmed = String(text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON: " + trimmed.slice(0, 240));
    return JSON.parse(match[0]);
  }
}

async function chatJson(model, role, prompt, attempt = 1) {
  const body = {
    model,
    stream: false,
    messages: [
      {
        role: "system",
        content: "You are a concise WeBot production agent. Return only valid compact JSON. No markdown. No commentary."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    options: {
      temperature: 0.1,
      num_predict: 700
    }
  };
  const data = await fetchJson(`${ollamaHost}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  try {
    const parsed = extractJson(data.message?.content || "");
    return { role, parsed, raw: data.message?.content || "" };
  } catch (error) {
    if (attempt >= 2) throw error;
    return chatJson(model, role, `${prompt}\n\nYour previous answer was invalid. Return only one valid JSON object.`, attempt + 1);
  }
}

function routePrompt() {
  return JSON.stringify({
    task: "Route this paid customer job to exactly one allowed family.",
    allowed_families: scenario.allowedFamilies,
    request: scenario.request,
    required_json_shape: {
      agent_family: "one allowed family",
      confidence: "high|medium|low",
      reason: "one sentence",
      first_question: "one short customer-facing question if needed, otherwise empty string"
    }
  });
}

function draftPrompt(route) {
  return JSON.stringify({
    task: "Prepare a short production draft for this paid customer job.",
    route,
    request: scenario.request,
    required_json_shape: {
      customer_summary: "one sentence",
      deliverable_outline: ["3 to 6 concise bullets"],
      draft_excerpt: "short customer-facing sample of the deliverable",
      missing_info: ["0 to 3 concise items"],
      next_checkpoint: "one customer-facing sentence"
    }
  });
}

function reviewPrompt(kind, draft) {
  return JSON.stringify({
    task: `${kind} review for a paid WeBot customer deliverable.`,
    request: scenario.request,
    draft,
    required_json_shape: {
      approved: true,
      review_type: kind,
      checks_passed: ["3 to 6 concise checks"],
      risks_or_fixes: ["0 to 3 concise items"],
      customer_ready_note: "one sentence"
    }
  });
}

function approvalPacket(route, draft, lead, fresh) {
  return {
    crm_status: "ready_for_customer_review",
    customer: scenario.customer,
    email: scenario.email,
    product: scenario.product,
    agent_family: route.agent_family,
    request_summary: draft.customer_summary,
    approval_options: ["approve", "ask_question", "request_focused_adjustment"],
    lead_review_approved: Boolean(lead.approved),
    fresh_review_approved: Boolean(fresh.approved),
    final_delivery_gate: "locked_until_customer_approval",
    audit: {
      no_external_send: true,
      no_payment_charge_attempted: true,
      local_model_only: true
    }
  };
}

async function main() {
  mkdirSync(outputRoot, { recursive: true });
  await ensureOllama();
  const tags = await fetchJson(`${ollamaHost}/api/tags`);
  const model = pickModel(tags.models || []);
  assert(model, "No local Ollama models are installed. Install or pull a local model, then rerun this script.");

  const route = await chatJson(model, "route", routePrompt());
  assert(scenario.allowedFamilies.includes(route.parsed.agent_family), "Route returned invalid family: " + route.parsed.agent_family);

  const draft = await chatJson(model, "draft", draftPrompt(route.parsed));
  assert(Array.isArray(draft.parsed.deliverable_outline), "Draft missing deliverable_outline");
  assert(String(draft.parsed.draft_excerpt || "").length > 40, "Draft excerpt too short");

  const lead = await chatJson(model, "lead_review", reviewPrompt("lead review", draft.parsed));
  assert(lead.parsed.approved === true, "Lead review did not approve the draft");

  const fresh = await chatJson(model, "fresh_context_review", reviewPrompt("fresh-context review", draft.parsed));
  assert(fresh.parsed.approved === true, "Fresh-context review did not approve the draft");

  const packet = approvalPacket(route.parsed, draft.parsed, lead.parsed, fresh.parsed);
  assert(packet.crm_status === "ready_for_customer_review", "Approval packet not ready for customer review");
  assert(packet.final_delivery_gate === "locked_until_customer_approval", "Final delivery gate not locked");

  const report = {
    ok: true,
    model,
    ollama_host: ollamaHost,
    scenario,
    route: route.parsed,
    draft: draft.parsed,
    lead_review: lead.parsed,
    fresh_context_review: fresh.parsed,
    approval_packet: packet,
    transcript_raw: {
      route: route.raw,
      draft: draft.raw,
      lead_review: lead.raw,
      fresh_context_review: fresh.raw
    }
  };
  const reportPath = join(outputRoot, "local-agent-approval-flow.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log("PASS local model agent approval flow");
  console.log(`Model: ${model}`);
  console.log(`Output: ${reportPath}`);
  console.log(`Route: ${route.parsed.agent_family}`);
  console.log(`CRM status: ${packet.crm_status}`);
}

main().catch((error) => {
  console.error("FAIL local model agent approval flow");
  console.error(error.stack || error.message);
  process.exit(1);
});
