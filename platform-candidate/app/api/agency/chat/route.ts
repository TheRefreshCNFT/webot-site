import { createAgencyChatHttpHandler, defaultAgencyChatRateLimitStore } from "../../../../lib/agency-chat/http";
import { OllamaAgencyChatClient } from "../../../../lib/agency-chat/ollama";
import { createAgencyChatService } from "../../../../lib/agency-chat/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const handle = createAgencyChatHttpHandler({
  answer: createAgencyChatService(new OllamaAgencyChatClient()),
  store: defaultAgencyChatRateLimitStore,
  pepper: process.env.API_KEY_PEPPER ?? "local-development-only-agency-chat"
});

export async function POST(request: Request): Promise<Response> { return handle(request); }
export async function OPTIONS(request: Request): Promise<Response> { return handle(request); }
