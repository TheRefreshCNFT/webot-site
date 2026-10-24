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
    expect(body.format).toBe("json");
    expect(body.options.num_predict).toBe(500);
    expect(body.prompt).toContain("Visitor: Can you use audio?");
    expect(body.system).toContain("APPROVED KNOWLEDGE VERSION");
    expect(init.signal).toBeDefined();
  });
  it("fails closed on provider status and malformed envelope", async () => {
    await expect(new OllamaAgencyChatClient(vi.fn(async () => new Response("no", { status: 503 })) as typeof fetch).generate([{ role: "user", content: "hello" }])).rejects.toThrow("Provider unavailable");
    await expect(new OllamaAgencyChatClient(vi.fn(async () => new Response(JSON.stringify({}))) as typeof fetch).generate([{ role: "user", content: "hello" }])).rejects.toThrow("Provider response missing text");
  });
});
