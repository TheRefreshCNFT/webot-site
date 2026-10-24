import { createHmac } from "node:crypto";
import { parseAgencyChatRequest, safeAgencyChatFallback, type AgencyChatResponse } from "./contract";
import { InMemoryRateLimitCounterStore, type RateLimitCounterStore } from "../rate-limit";

const allowedOrigins = new Set(["https://webot.agency", "http://127.0.0.1:4180"]);
const bucket = { limit: 10, windowMs: 600_000 };

export function createAgencyChatHttpHandler({ answer, store, pepper, now = () => new Date() }: {
  answer(input: ReturnType<typeof parseAgencyChatRequest>): Promise<AgencyChatResponse>;
  store: RateLimitCounterStore;
  pepper: string;
  now?: () => Date;
}) {
  return async function handle(request: Request): Promise<Response> {
    const origin = request.headers.get("origin");
    const cors = origin && allowedOrigins.has(origin) ? { "access-control-allow-origin": origin, vary: "Origin" } : {};
    if (request.method === "OPTIONS") {
      if (!origin || !allowedOrigins.has(origin)) return json({ error: "Origin not allowed" }, 403, cors);
      return new Response(null, { status: 204, headers: { ...cors, "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "Content-Type", "access-control-max-age": "600", "cache-control": "no-store" } });
    }
    if (origin && !allowedOrigins.has(origin)) return json({ error: "Origin not allowed" }, 403, cors);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "direct-local-client";
    const key = `agency-chat:${createHmac("sha256", pepper).update(ip).digest("hex")}`;
    const limit = await store.consume(key, bucket, now());
    if (!limit.allowed) return json({ error: "Too many requests. Please wait, or use phone, email, or direct booking." }, 429, cors, Math.max(1, Math.ceil((limit.resetAtMs - now().getTime()) / 1000)));
    let input: ReturnType<typeof parseAgencyChatRequest>;
    try { input = parseAgencyChatRequest(await request.json()); }
    catch { return json({ error: "Please send a shorter valid conversation." }, 400, cors); }
    try { return json(await answer(input), 200, cors); }
    catch { return json(safeAgencyChatFallback(), 503, cors); }
  };
}

export const defaultAgencyChatRateLimitStore = new InMemoryRateLimitCounterStore();

function json(body: unknown, status: number, cors: Record<string, string>, retryAfter?: number): Response {
  return Response.json(body, { status, headers: { ...cors, "cache-control": "no-store", ...(retryAfter === undefined ? {} : { "retry-after": String(retryAfter) }) } });
}
