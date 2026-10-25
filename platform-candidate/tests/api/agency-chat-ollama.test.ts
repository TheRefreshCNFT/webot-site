import { describe, expect, it, vi } from "vitest";
import { OllamaAgencyChatClient } from "../../lib/agency-chat/ollama";

describe("Ollama Agency chat adapter", () => {
  it("uses the approved local generate contract and bounded options", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ response: '{"reply":"Yes","fit":"common_fit","handoff":null}' }), { status: 200 }));
    const client = new OllamaAgencyChatClient(fetchImpl as typeof fetch);
    await expect(client.generate([{ role: "user", content: "Can you use audio?" }])).resolves.toEqual({ reply: "Yes", fit: "common_fit", handoff: null });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://127.0.0.1:11434/api/generate");
    const body = JSON.parse(String(init.body));
    expect(body.model).toBe("gpt-oss:20b");
    expect(body.stream).toBe(false);
    expect(body.think).toBe(false);
    expect(body.options.num_predict).toBe(1200);
    expect(body.prompt).toContain("Visitor: Can you use audio?");
    expect(body.system).toContain("APPROVED KNOWLEDGE VERSION");
    expect(init.signal).toBeDefined();
  });
  it("requests the exact Agency response JSON schema", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ response: '{"reply":"Yes","fit":"common_fit","handoff":null}' }), { status: 200 }));
    const client = new OllamaAgencyChatClient(fetchImpl as typeof fetch);
    await client.generate([{ role: "user", content: "Can you use audio?" }]);
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.format).toEqual({
      type: "object",
      properties: {
        reply: { type: "string" },
        fit: { type: "string", enum: ["common_fit", "technical_review", "not_a_fit", "unknown"] },
        handoff: {
          anyOf: [
            { type: "null" },
            {
              type: "object",
              properties: {
                summary: { type: "string" },
                requestQuote: { type: "boolean" }
              },
              required: ["summary", "requestQuote"],
              additionalProperties: false
            }
          ]
        }
      },
      required: ["reply", "fit", "handoff"],
      additionalProperties: false
    });
  });
  it("fails closed on provider status and malformed envelope", async () => {
    await expect(new OllamaAgencyChatClient(vi.fn(async () => new Response("no", { status: 503 })) as typeof fetch).generate([{ role: "user", content: "hello" }])).rejects.toThrow("Provider unavailable");
    await expect(new OllamaAgencyChatClient(vi.fn(async () => new Response(JSON.stringify({}))) as typeof fetch).generate([{ role: "user", content: "hello" }])).rejects.toThrow("Provider response missing text");
  });
  it.each([
    ["provider_timeout", async () => { throw Object.assign(new Error("private timeout detail"), { name: "TimeoutError" }); }],
    ["provider_transport", async () => { throw new Error("private transport detail"); }],
    ["provider_status", async () => new Response("private status detail", { status: 503 })],
    ["provider_envelope", async () => new Response("not json")],
    ["provider_envelope", async () => new Response("null")],
    ["provider_envelope", async () => new Response(JSON.stringify({ detail: "private envelope detail" }))],
    ["provider_length", async () => new Response(JSON.stringify({ done: true, done_reason: "length", response: "" }))],
    ["provider_length", async () => new Response(JSON.stringify({ done: true, done_reason: "length", response: " \n\t" }))],
    ["provider_inner_json", async () => new Response(JSON.stringify({ response: "not json" }))]
  ] as const)("reports only the safe diagnostic category %s", async (category, respond) => {
    const diagnostic = vi.fn();
    const client = new OllamaAgencyChatClient(vi.fn(respond) as typeof fetch, 20_000, diagnostic);
    await expect(client.generate([{ role: "user", content: "private prompt" }])).rejects.toThrow();
    expect(diagnostic).toHaveBeenCalledExactlyOnceWith(category);
    expect(JSON.stringify(diagnostic.mock.calls)).not.toMatch(/private|prompt|detail/);
  });
});
