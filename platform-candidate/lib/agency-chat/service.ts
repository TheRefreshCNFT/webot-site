import { parseAgencyChatModelOutput, safeAgencyChatFallback, type AgencyChatRequest, type AgencyChatResponse } from "./contract";
import type { AgencyChatModelClient } from "./ollama";

export function createAgencyChatService(client: AgencyChatModelClient) {
  return async function answerAgencyChat(request: AgencyChatRequest): Promise<AgencyChatResponse> {
    const last = request.messages.at(-1)?.content ?? "";
    const hasDirectPriceRequest = /\b(how much|price|pricing|cost|charge|rate|estimate)\b/i.test(last);
    const hasQuoteRequest = /\bquote\b/i.test(last);
    const hasBudgetRequest = /\bbudget(?:\s+range)?\b/i.test(last);
    const hasVisitorSuppliedBudget = /\b(my|our)\b[^.?!]*\bbudget(?:\s+range)?\b/i.test(last);
    const hasBudgetRecommendationRequest = /\b(what|which|how)\b[^.?!]*\b(my|our)\s+budget(?:\s+range)?\b/i.test(last);
    const hasProjectQuoteScopingIntent = /\bproject\s+quote\s+request\b/i.test(last)
      || /\b(prepare|request|like|book)\b[^.?!]*\bproject\s+quote\b/i.test(last);
    if (hasDirectPriceRequest || (hasQuoteRequest && !hasProjectQuoteScopingIntent) || (hasBudgetRequest && (!hasVisitorSuppliedBudget || hasBudgetRecommendationRequest))) {
      return {
        reply: "Custom work is priced by quote after we understand the workflow and scope. The first 30-minute consultation is free. I can help summarize your use case for a booking or project-quote request, but I cannot provide a price here.",
        fit: "technical_review",
        handoff: null
      };
    }
    try {
      const raw = await client.generate(request.messages);
      const text = typeof raw === "string" ? raw : (JSON.stringify(raw) ?? "");
      return parseAgencyChatModelOutput(text);
    } catch {
      return safeAgencyChatFallback();
    }
  };
}
