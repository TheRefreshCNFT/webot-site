import type { AgencyChatMessage } from "./contract";
import { buildAgencySystemPrompt } from "./knowledge";

export type AgencyChatModelClient = { generate(messages: AgencyChatMessage[]): Promise<unknown> };

export class OllamaAgencyChatClient implements AgencyChatModelClient {
  constructor(private readonly fetchImpl: typeof fetch = fetch, private readonly timeoutMs = 20_000) {}

  async generate(messages: AgencyChatMessage[]): Promise<unknown> {
    const response = await this.fetchImpl("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(this.timeoutMs),
      body: JSON.stringify({
        model: "gpt-oss:20b",
        prompt: messages.map((message) => `${message.role === "user" ? "Visitor" : "Ask WeBot"}: ${message.content}`).join("\n\n"),
        system: buildAgencySystemPrompt(),
        stream: false,
        think: false,
        format: "json",
        options: { temperature: 0.1, num_ctx: 8192, num_predict: 500 }
      })
    });
    if (!response.ok) throw new Error("Provider unavailable");
    const body = await response.json() as { response?: unknown };
    if (typeof body.response !== "string") throw new Error("Provider response missing text");
    return JSON.parse(body.response) as unknown;
  }
}
