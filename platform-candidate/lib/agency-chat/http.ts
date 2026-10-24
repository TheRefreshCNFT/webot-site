import { createHmac } from "node:crypto";
import { parseAgencyChatRequest, safeAgencyChatFallback, type AgencyChatResponse } from "./contract";
import type { RateLimitCounterStore } from "../rate-limit";

const allowedOrigins = new Set(["https://webot.agency", "http://127.0.0.1:4180"]);
const bucket = { limit: 10, windowMs: 600_000 };
const maxBodyBytes = 64 * 1024;

class AgencyChatBodyTooLargeError extends Error {}

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
    try { input = parseAgencyChatRequest(await readJsonBody(request)); }
    catch (error) {
      if (error instanceof AgencyChatBodyTooLargeError) return json({ error: "Please send a shorter conversation." }, 413, cors);
      return json({ error: "Please send a shorter valid conversation." }, 400, cors);
    }
    try { return json(await answer(input), 200, cors); }
    catch { return json(safeAgencyChatFallback(), 503, cors); }
  };
}

type AgencyChatCounter = { count: number; resetAtMs: number };

export class BoundedAgencyChatRateLimitStore implements RateLimitCounterStore {
  private readonly counters = new Map<string, AgencyChatCounter>();

  constructor(private readonly maxEntries = 1024) {
    if (!Number.isInteger(maxEntries) || maxEntries < 1) throw new Error("Agency chat rate-limit capacity must be positive.");
  }

  async consume(key: string, bucket: { limit: number; windowMs: number }, now: Date) {
    const nowMs = now.getTime();
    for (const [candidate, counter] of this.counters) {
      if (counter.resetAtMs <= nowMs) this.counters.delete(candidate);
    }

    const existing = this.counters.get(key);
    if (existing) this.counters.delete(key);
    if (!existing && this.counters.size >= this.maxEntries) {
      const oldest = this.counters.keys().next().value;
      if (oldest !== undefined) this.counters.delete(oldest);
    }

    const current = existing ?? { count: 0, resetAtMs: nowMs + bucket.windowMs };
    current.count += 1;
    this.counters.set(key, current);
    return { allowed: current.count <= bucket.limit, count: current.count, resetAtMs: current.resetAtMs };
  }
}

export const defaultAgencyChatRateLimitStore = new BoundedAgencyChatRateLimitStore();

async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
    try { await request.body?.cancel(); } catch {}
    throw new AgencyChatBodyTooLargeError();
  }
  if (!request.body) return JSON.parse("");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBodyBytes) {
        try { await reader.cancel(); } catch {}
        throw new AgencyChatBodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

function json(body: unknown, status: number, cors: Record<string, string>, retryAfter?: number): Response {
  return Response.json(body, { status, headers: { ...cors, "cache-control": "no-store", ...(retryAfter === undefined ? {} : { "retry-after": String(retryAfter) }) } });
}
