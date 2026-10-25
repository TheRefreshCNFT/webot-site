import { createAgencyChatHttpHandler, defaultAgencyChatRateLimitStore } from "../../../../lib/agency-chat/http";
import type { AgencyChatDiagnostic } from "../../../../lib/agency-chat/diagnostics";
import { OllamaAgencyChatClient } from "../../../../lib/agency-chat/ollama";
import { createAgencyChatService } from "../../../../lib/agency-chat/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const diagnostic: AgencyChatDiagnostic = (category) => console.error(`Ask WeBot diagnostic: ${category}`);
const client = new OllamaAgencyChatClient(fetch, 20_000, diagnostic);
const handle = createAgencyChatHttpHandler({
  answer: createAgencyChatService(client, diagnostic),
  store: defaultAgencyChatRateLimitStore,
  pepper: process.env.API_KEY_PEPPER ?? "local-development-only-agency-chat"
});

export async function POST(request: Request): Promise<Response> { return handle(request); }
export async function OPTIONS(request: Request): Promise<Response> { return handle(request); }
