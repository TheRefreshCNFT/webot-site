import { parseAgencyChatModelOutput, safeAgencyChatFallback, type AgencyChatRequest, type AgencyChatResponse } from "./contract";
import type { AgencyChatModelClient } from "./ollama";

export function createAgencyChatService(client: AgencyChatModelClient) {
  return async function answerAgencyChat(request: AgencyChatRequest): Promise<AgencyChatResponse> {
    const last = request.messages.at(-1)?.content ?? "";
    if (/\b(how much|price|pricing|cost|charge|rate|budget)\b/i.test(last) && !/\b(budget range|project quote)\b/i.test(last)) {
      return {
        reply: "Custom work is priced by quote after we understand the workflow and scope. The first 30-minute consultation is free. I can help summarize your use case for a booking or project-quote request, but I cannot provide a price here.",
        fit: "technical_review",
        handoff: null
      };
    }
    try {
      const raw = await client.generate(request.messages);
      const text = typeof raw === "string" ? raw : JSON.stringify(raw);
      return parseAgencyChatModelOutput(text);
    } catch {
      return safeAgencyChatFallback();
    }
  };
}
