import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAgencyChatHttpHandler } from "../../lib/agency-chat/http";
import { InMemoryRateLimitCounterStore } from "../../lib/rate-limit/index";
import type { AgencyChatResponse } from "../../lib/agency-chat/contract";

const reply: AgencyChatResponse = { reply: "Audio transcription is a common fit.", fit: "common_fit", handoff: null };
const request = (origin = "https://webot.agency") => new Request("http://localhost/api/agency/chat", {
  method: "POST",
  headers: { "content-type": "application/json", origin, "x-forwarded-for": "203.0.113.10" },
  body: JSON.stringify({ messages: [{ role: "user", content: "Can you transcribe audio?" }] })
});

describe("Agency chat HTTP", () => {
  let store: InMemoryRateLimitCounterStore;
  beforeEach(() => { store = new InMemoryRateLimitCounterStore(); });
  const handler = (answer = vi.fn(async () => reply)) => createAgencyChatHttpHandler({ answer, store, pepper: "test-only-pepper" });

  it("allows the public origin, emits no-store, and never logs content", async () => {
    const response = await handler()(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("https://webot.agency");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual(reply);
  });
  it("handles preflight and rejects other origins", async () => {
    const preflight = await handler()(new Request("http://localhost/api/agency/chat", { method: "OPTIONS", headers: { origin: "https://webot.agency" } }));
    expect(preflight.status).toBe(204);
    expect((await handler()(request("https://evil.example"))).status).toBe(403);
  });
  it("returns bounded validation and safe service failures", async () => {
    const invalid = await handler()(new Request("http://localhost/api/agency/chat", { method: "POST", headers: { origin: "https://webot.agency" }, body: "{}" }));
    expect(invalid.status).toBe(400);
    const failed = await handler(vi.fn(async () => { throw new Error("synthetic"); }))(request());
    expect(failed.status).toBe(503);
    expect(JSON.stringify(await failed.json())).not.toContain("synthetic");
  });
  it("rate limits the same keyed client without storing the raw IP", async () => {
    const consume = vi.spyOn(store, "consume");
    const run = handler();
    for (let index = 0; index < 10; index += 1) expect((await run(request())).status).toBe(200);
    const limited = await run(request());
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("600");
    const key = consume.mock.calls[0][0];
    expect(key).not.toContain("203.0.113.10");
    expect(key).toMatch(/^agency-chat:[a-f0-9]{64}$/);
  });
});
