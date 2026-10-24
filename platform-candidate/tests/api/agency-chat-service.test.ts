import { describe, expect, it, vi } from "vitest";
import { createAgencyChatService } from "../../lib/agency-chat/service";
import type { AgencyChatModelClient } from "../../lib/agency-chat/ollama";

const request = (content: string) => ({ messages: [{ role: "user" as const, content }] });

describe("Agency chat service", () => {
  it("declines price, estimate, quote, and expected-budget requests without calling the model", async () => {
    const pricingRequests = [
      "How much does this cost?",
      "Can you give me an estimate?",
      "Can I get a quote?",
      "What budget range should I expect?",
      "How much is this project quote?"
    ];
    for (const content of pricingRequests) {
      const client: AgencyChatModelClient = { generate: vi.fn() };
      const result = await createAgencyChatService(client)(request(content));
      expect(client.generate).not.toHaveBeenCalled();
      expect(result.reply).toMatch(/quote|scoping/i);
      expect(result.reply).toMatch(/30-minute consultation is free/i);
      expect(result.reply).not.toMatch(/\$\d/);
    }
  });
  it("allows visitor-supplied budgets and project-quote scoping intent", async () => {
    const scopingRequests = [
      "My budget range is flexible; can you automate weekly invoices?",
      "Please help me prepare a project quote request for invoice sorting.",
      "I'd also like a project quote."
    ];
    for (const content of scopingRequests) {
      const client: AgencyChatModelClient = { generate: vi.fn(async () => ({ reply: "Invoice workflow review is a common fit.", fit: "common_fit", handoff: null })) };
      const result = await createAgencyChatService(client)(request(content));
      expect(result.fit).toBe("common_fit");
      expect(client.generate).toHaveBeenCalledTimes(1);
    }
  });
  it("returns validated model responses", async () => {
    const client: AgencyChatModelClient = { generate: vi.fn(async () => ({ reply: "Audio transcription is a common fit.", fit: "common_fit", handoff: null })) };
    const result = await createAgencyChatService(client)(request("Can your bots use audio?"));
    expect(result.fit).toBe("common_fit");
  });
  it("uses a safe fallback for malformed output or provider failure", async () => {
    const clients: AgencyChatModelClient[] = [
      { generate: vi.fn(async () => { throw new Error("synthetic"); }) },
      { generate: vi.fn(async () => ({ reply: "raw", fit: "bad" })) }
    ];
    for (const client of clients) {
      const result = await createAgencyChatService(client)(request("Can you do this?"));
      expect(result.fit).toBe("unknown");
      expect(result.reply).toContain("hello@webot.agency");
    }
  });
  it("uses a safe fallback for undefined model output", async () => {
    const client: AgencyChatModelClient = { generate: vi.fn(async () => undefined) };
    const result = await createAgencyChatService(client)(request("Can you do this?"));
    expect(result.fit).toBe("unknown");
    expect(result.reply).toContain("hello@webot.agency");
    expect(client.generate).toHaveBeenCalledTimes(1);
  });
});
