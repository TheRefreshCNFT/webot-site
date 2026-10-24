import { describe, expect, it, vi } from "vitest";
import { createAgencyChatService } from "../../lib/agency-chat/service";
import type { AgencyChatModelClient } from "../../lib/agency-chat/ollama";

const request = (content: string) => ({ messages: [{ role: "user" as const, content }] });

describe("Agency chat service", () => {
  it("declines pricing without calling the model", async () => {
    const client: AgencyChatModelClient = { generate: vi.fn() };
    const result = await createAgencyChatService(client)(request("How much does this cost?"));
    expect(result.reply).toMatch(/quote|scoping/i);
    expect(result.reply).not.toMatch(/\$\d/);
    expect(client.generate).not.toHaveBeenCalled();
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
});
