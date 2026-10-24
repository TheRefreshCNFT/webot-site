export type AgencyChatRole = "user" | "assistant";
export type AgencyChatMessage = { role: AgencyChatRole; content: string };
export type AgencyChatRequest = { messages: AgencyChatMessage[]; sessionId?: string };
export type AgencyChatFit = "common_fit" | "technical_review" | "not_a_fit" | "unknown";
export type AgencyChatHandoff = { summary: string; requestQuote: boolean };
export type AgencyChatResponse = { reply: string; fit: AgencyChatFit; handoff: AgencyChatHandoff | null };

const fits = new Set<AgencyChatFit>(["common_fit", "technical_review", "not_a_fit", "unknown"]);
const internalPattern = /gpt-oss|qwen|ollama|system prompt|developer message|127\.0\.0\.1|localhost|11434|api\/generate/i;

export function parseAgencyChatRequest(body: unknown): AgencyChatRequest {
  if (!body || typeof body !== "object") throw new Error("Invalid request");
  const value = body as Record<string, unknown>;
  if (!Array.isArray(value.messages) || value.messages.length < 1 || value.messages.length > 12) throw new Error("Invalid messages");
  let previousRole: AgencyChatRole | undefined;
  const messages = value.messages.map((message, index): AgencyChatMessage => {
    if (!message || typeof message !== "object") throw new Error("Invalid message");
    const candidate = message as Record<string, unknown>;
    if ((candidate.role !== "user" && candidate.role !== "assistant") || typeof candidate.content !== "string") throw new Error("Invalid message");
    if (previousRole === candidate.role) throw new Error("Messages must alternate roles");
    previousRole = candidate.role;
    const content = candidate.content.trim();
    if (!content || content.length > 2000) throw new Error("Invalid content");
    if (index === value.messages.length - 1 && candidate.role !== "user") throw new Error("Last message must be user");
    return { role: candidate.role, content };
  });
  if (messages.reduce((sum, message) => sum + message.content.length, 0) > 8000) throw new Error("Conversation too long");
  let sessionId: string | undefined;
  if (value.sessionId !== undefined) {
    if (typeof value.sessionId !== "string" || !/^[A-Za-z0-9_-]{8,128}$/.test(value.sessionId)) throw new Error("Invalid session");
    sessionId = value.sessionId;
  }
  return { messages, ...(sessionId ? { sessionId } : {}) };
}

export function parseAgencyChatModelOutput(text: string): AgencyChatResponse {
  if (text.length > 8000) throw new Error("Response too large");
  const clean = text.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  if (clean.length > 8000) throw new Error("Response too large");
  const value: unknown = JSON.parse(clean);
  if (!value || typeof value !== "object") throw new Error("Invalid response");
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.reply !== "string" || !candidate.reply.trim() || candidate.reply.length > 4000 || internalPattern.test(candidate.reply)) throw new Error("Unsafe reply");
  if (typeof candidate.fit !== "string" || !fits.has(candidate.fit as AgencyChatFit)) throw new Error("Invalid fit");
  let handoff: AgencyChatHandoff | null = null;
  if (candidate.handoff !== null) {
    if (!candidate.handoff || typeof candidate.handoff !== "object") throw new Error("Invalid handoff");
    const proposed = candidate.handoff as Record<string, unknown>;
    if (typeof proposed.summary !== "string" || !proposed.summary.trim() || proposed.summary.length > 1000 || typeof proposed.requestQuote !== "boolean" || internalPattern.test(proposed.summary)) throw new Error("Invalid handoff");
    handoff = { summary: proposed.summary.trim(), requestQuote: proposed.requestQuote };
  }
  return { reply: candidate.reply.trim(), fit: candidate.fit as AgencyChatFit, handoff };
}

export function safeAgencyChatFallback(): AgencyChatResponse {
  return {
    reply: "I could not confirm that just now. You can still book a free 30-minute consultation, email hello@webot.agency, or call +1 754 210 1827 and we will review the workflow with you.",
    fit: "unknown",
    handoff: null
  };
}
