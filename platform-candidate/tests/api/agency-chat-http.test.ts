import { beforeEach, describe, expect, it, vi } from "vitest";
import { BoundedAgencyChatRateLimitStore, createAgencyChatHttpHandler } from "../../lib/agency-chat/http";
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
    const malformed = await handler()(new Request("http://localhost/api/agency/chat", { method: "POST", headers: { origin: "https://webot.agency" }, body: "{" }));
    expect(malformed.status).toBe(400);
    expect(malformed.headers.get("cache-control")).toBe("no-store");
    const failed = await handler(vi.fn(async () => { throw new Error("synthetic"); }))(request());
    expect(failed.status).toBe(503);
    expect(JSON.stringify(await failed.json())).not.toContain("synthetic");
  });
  it("rejects a declared oversized body with safe CORS and no-store headers", async () => {
    const answer = vi.fn(async () => reply);
    const response = await handler(answer)(new Request("http://localhost/api/agency/chat", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": "65537", origin: "https://webot.agency" },
      body: "{}"
    }));
    expect(response.status).toBe(413);
    expect(response.headers.get("access-control-allow-origin")).toBe("https://webot.agency");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(answer).not.toHaveBeenCalled();
  });
  it("cancels an actually oversized stream without Content-Length or calling answer", async () => {
    const answer = vi.fn(async () => reply);
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.enqueue(new Uint8Array(32 * 1024).fill(32));
      },
      cancel() { cancelled = true; }
    });
    const response = await handler(answer)(new Request("http://localhost/api/agency/chat", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://webot.agency" },
      body,
      duplex: "half"
    } as RequestInit & { duplex: "half" }));
    expect(response.status).toBe(413);
    expect(response.headers.get("access-control-allow-origin")).toBe("https://webot.agency");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(cancelled).toBe(true);
    expect(answer).not.toHaveBeenCalled();
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

describe("Bounded Agency chat rate-limit store", () => {
  const bucket = { limit: 1, windowMs: 1000 };

  it("expires old keys without resetting active visitors", async () => {
    const store = new BoundedAgencyChatRateLimitStore(8);
    expect(await store.consume("expired", bucket, new Date(0))).toMatchObject({ allowed: true, count: 1, resetAtMs: 1000 });
    expect(await store.consume("active", bucket, new Date(500))).toMatchObject({ allowed: true, count: 1, resetAtMs: 1500 });

    expect(await store.consume("expired", bucket, new Date(1001))).toMatchObject({ allowed: true, count: 1, resetAtMs: 2001 });
    expect(await store.consume("active", bucket, new Date(1001))).toMatchObject({ allowed: false, count: 2, resetAtMs: 1500 });
  });

  it("preserves ten requests per ten minutes independently for each key", async () => {
    const store = new BoundedAgencyChatRateLimitStore(2);
    const policy = { limit: 10, windowMs: 600_000 };
    const now = new Date(0);
    for (let index = 0; index < 10; index += 1) {
      expect(await store.consume("a", policy, now)).toMatchObject({ allowed: true, count: index + 1, resetAtMs: 600_000 });
    }
    expect(await store.consume("a", policy, now)).toMatchObject({ allowed: false, count: 11, resetAtMs: 600_000 });
    expect(await store.consume("b", policy, now)).toMatchObject({ allowed: true, count: 1, resetAtMs: 600_000 });
  });

  it("bounds cardinality with deterministic LRU eviction", async () => {
    const store = new BoundedAgencyChatRateLimitStore(2);
    const now = new Date(0);
    expect(await store.consume("a", bucket, now)).toMatchObject({ allowed: true, count: 1 });
    expect(await store.consume("b", bucket, now)).toMatchObject({ allowed: true, count: 1 });
    expect(await store.consume("a", bucket, now)).toMatchObject({ allowed: false, count: 2 });
    expect(await store.consume("c", bucket, now)).toMatchObject({ allowed: true, count: 1 });
    expect(await store.consume("b", bucket, now)).toMatchObject({ allowed: true, count: 1 });
    expect(await store.consume("c", bucket, now)).toMatchObject({ allowed: false, count: 2 });
  });
});
