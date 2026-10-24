type FetchLike = typeof fetch;

export type SupabaseRestSchema = "app_public" | "app_private";

export type SupabaseRestConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImpl?: FetchLike;
};

export type SupabaseWriteOptions = {
  onConflict?: string;
  ignoreDuplicates?: boolean;
};

export class SupabaseRestClient {
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly fetchImpl: FetchLike;

  constructor(config: SupabaseRestConfig) {
    this.supabaseUrl = normalizeSupabaseUrl(config.supabaseUrl);
    this.serviceRoleKey = requireConfigValue(config.serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY");
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env, fetchImpl?: FetchLike): SupabaseRestClient {
    return new SupabaseRestClient({
      supabaseUrl: requireConfigValue(env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
      serviceRoleKey: requireConfigValue(env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
      fetchImpl
    });
  }

  async get<Row>(schema: SupabaseRestSchema, table: string, query: Record<string, string>): Promise<Row[]> {
    return this.request<Row>("GET", schema, table, query);
  }

  async insert<Row>(
    schema: SupabaseRestSchema,
    table: string,
    row: unknown,
    options: SupabaseWriteOptions = {}
  ): Promise<Row[]> {
    return this.request<Row>("POST", schema, table, options.onConflict ? { on_conflict: options.onConflict } : {}, row, options);
  }

  async update<Row>(
    schema: SupabaseRestSchema,
    table: string,
    query: Record<string, string>,
    patch: unknown
  ): Promise<Row[]> {
    return this.request<Row>("PATCH", schema, table, query, patch);
  }

  async deleteRows<Row>(schema: SupabaseRestSchema, table: string, query: Record<string, string>): Promise<Row[]> {
    return this.request<Row>("DELETE", schema, table, query);
  }

  async rpc<Row>(schema: SupabaseRestSchema, functionName: string, body: unknown): Promise<Row[]> {
    return this.request<Row>("POST", schema, `rpc/${functionName}`, {}, body);
  }

  private async request<Row>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    schema: SupabaseRestSchema,
    table: string,
    query: Record<string, string>,
    body?: unknown,
    writeOptions: SupabaseWriteOptions = {}
  ): Promise<Row[]> {
    const url = new URL(`${this.supabaseUrl}/rest/v1/${table}`);

    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }

    const prefer = [
      "return=representation",
      writeOptions.ignoreDuplicates ? "resolution=ignore-duplicates" : null
    ].filter(Boolean).join(",");
    const response = await this.fetchImpl(url.toString(), {
      method,
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        accept: "application/json",
        "content-type": "application/json",
        "accept-profile": schema,
        "content-profile": schema,
        prefer
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `Supabase ${schema}.${table} ${method} failed with status ${response.status}${
          errorBody ? `: ${errorBody.slice(0, 300)}` : ""
        }.`
      );
    }

    if (response.status === 204) {
      return [];
    }

    const payload: unknown = await response.json();

    if (!Array.isArray(payload)) {
      throw new Error(`Supabase ${schema}.${table} ${method} returned an invalid payload.`);
    }

    return payload as Row[];
  }
}

export function isSupabaseRuntimeConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function normalizeSupabaseUrl(value: string): string {
  const parsed = new URL(requireConfigValue(value, "NEXT_PUBLIC_SUPABASE_URL"));
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/+$/, "");
}

export function requireConfigValue(value: string | undefined, name: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required for Supabase runtime access.`);
  }

  return value.trim();
}
