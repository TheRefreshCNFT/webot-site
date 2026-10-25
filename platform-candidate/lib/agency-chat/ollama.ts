import type { AgencyChatMessage } from "./contract";
import type { AgencyChatDiagnostic } from "./diagnostics";
import { buildAgencySystemPrompt } from "./knowledge";

export type AgencyChatModelClient = { generate(messages: AgencyChatMessage[]): Promise<unknown> };

export class OllamaAgencyChatClient implements AgencyChatModelClient {
  constructor(
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly timeoutMs = 20_000,
    private readonly diagnostic: AgencyChatDiagnostic = () => {}
  ) {}

  async generate(messages: AgencyChatMessage[]): Promise<unknown> {
    let response: Response;
    try {
      response = await this.fetchImpl("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(this.timeoutMs),
        body: JSON.stringify({
          model: "gpt-oss:20b",
          prompt: messages.map((message) => `${message.role === "user" ? "Visitor" : "Ask WeBot"}: ${message.content}`).join("\n\n"),
          system: buildAgencySystemPrompt(),
          stream: false,
          think: false,
          format: {
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
          },
          options: { temperature: 0.1, num_ctx: 8192, num_predict: 1200 }
        })
      });
    } catch (error) {
      const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
      this.diagnostic(timedOut ? "provider_timeout" : "provider_transport");
      throw error;
    }
    if (!response.ok) {
      this.diagnostic("provider_status");
      throw new Error("Provider unavailable");
    }
    let body: { response?: unknown; done_reason?: unknown };
    try {
      body = await response.json() as { response?: unknown; done_reason?: unknown };
    } catch (error) {
      this.diagnostic("provider_envelope");
      throw error;
    }
    if (!body || typeof body.response !== "string") {
      this.diagnostic("provider_envelope");
      throw new Error("Provider response missing text");
    }
    if (body.done_reason === "length" && !body.response.trim()) {
      this.diagnostic("provider_length");
      throw new Error("Provider generation length exhausted");
    }
    try {
      return JSON.parse(body.response) as unknown;
    } catch (error) {
      this.diagnostic("provider_inner_json");
      throw error;
    }
  }
}
