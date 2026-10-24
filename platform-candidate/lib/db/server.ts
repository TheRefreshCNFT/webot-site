import { isSupabaseServerDbConfigured, SupabaseServerDb } from "./supabase";

export type AccountStatus = "active" | "suspended" | "closed";
export type MembershipRole = "owner" | "admin" | "member" | "viewer";
export type MembershipStatus = "active" | "invited" | "disabled";
export type EntitlementStatus = "active" | "trialing" | "past_due" | "canceled" | "expired";
export type AuthMethod = "supabase_session" | "api_key";

export type AccountRow = {
  id: string;
  name: string;
  slug: string;
  primaryEmail: string;
  stripeCustomerId: string | null;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
};

export type UserRow = {
  id: string;
  supabaseUserId: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AccountMembershipRow = {
  accountId: string;
  userId: string;
  role: MembershipRole;
  status: MembershipStatus;
  createdAt: string;
  updatedAt: string;
};

export type EntitlementRow = {
  id: string;
  accountId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeProductId: string;
  stripePriceId: string;
  entitlementCode: string;
  tierFamily: string;
  tierLevel: number;
  monthlyQuota: number;
  apiAccess: boolean;
  dashboardAccess: boolean;
  status: EntitlementStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  sourceWebhookEventId: string;
  createdAt: string;
  updatedAt: string;
};

export type SupabaseAuthUser = {
  id: string;
  email: string | null;
};

export type AuthResult =
  | {
      ok: true;
      method: AuthMethod;
      user: SupabaseAuthUser;
      scopes: string[];
    }
  | {
      ok: false;
      status: 401 | 500;
      code: "unauthorized" | "auth_not_configured";
      message: string;
    };

export type ServerDb = {
  authenticate(headers: Headers): Promise<AuthResult>;
  getUserBySupabaseId(supabaseUserId: string): Promise<UserRow | null>;
  listMembershipsByUserId(userId: string): Promise<AccountMembershipRow[]>;
  getAccount(accountId: string): Promise<AccountRow | null>;
  listEntitlementsByAccountId(accountId: string): Promise<EntitlementRow[]>;
};

const now = new Date("2026-06-28T00:00:00.000Z").toISOString();

export const testFixtures = {
  users: {
    alpha: "11111111-1111-4111-8111-111111111111",
    beta: "22222222-2222-4222-8222-222222222222",
    noMembership: "33333333-3333-4333-8333-333333333333"
  },
  accounts: {
    alpha: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    beta: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
  }
} as const;

const fixtureUsers: UserRow[] = [
  {
    id: "01010101-0101-4101-8101-010101010101",
    supabaseUserId: testFixtures.users.alpha,
    email: "owner.alpha@example.test",
    displayName: "Alpha Owner",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "02020202-0202-4202-8202-020202020202",
    supabaseUserId: testFixtures.users.beta,
    email: "owner.beta@example.test",
    displayName: "Beta Owner",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "03030303-0303-4303-8303-030303030303",
    supabaseUserId: testFixtures.users.noMembership,
    email: "nomembership@example.test",
    displayName: "No Membership",
    createdAt: now,
    updatedAt: now
  }
];

const fixtureAccounts: AccountRow[] = [
  {
    id: testFixtures.accounts.alpha,
    name: "Alpha Studio",
    slug: "alpha-studio",
    primaryEmail: "billing.alpha@example.test",
    stripeCustomerId: "cus_alpha_internal",
    status: "active",
    createdAt: now,
    updatedAt: now
  },
  {
    id: testFixtures.accounts.beta,
    name: "Beta Studio",
    slug: "beta-studio",
    primaryEmail: "billing.beta@example.test",
    stripeCustomerId: "cus_beta_internal",
    status: "active",
    createdAt: now,
    updatedAt: now
  }
];

const fixtureMemberships: AccountMembershipRow[] = [
  {
    accountId: testFixtures.accounts.alpha,
    userId: fixtureUsers[0].id,
    role: "owner",
    status: "active",
    createdAt: now,
    updatedAt: now
  },
  {
    accountId: testFixtures.accounts.beta,
    userId: fixtureUsers[1].id,
    role: "owner",
    status: "active",
    createdAt: now,
    updatedAt: now
  }
];

const fixtureEntitlements: EntitlementRow[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    accountId: testFixtures.accounts.alpha,
    stripeCustomerId: "cus_alpha_internal",
    stripeSubscriptionId: "sub_alpha_internal",
    stripeProductId: "prod_alpha_internal",
    stripePriceId: "price_alpha_internal",
    entitlementCode: "api_agent_top",
    tierFamily: "api_only_agent",
    tierLevel: 3,
    monthlyQuota: 500,
    apiAccess: true,
    dashboardAccess: false,
    status: "active",
    currentPeriodStart: "2026-06-01T00:00:00.000Z",
    currentPeriodEnd: "2026-07-01T00:00:00.000Z",
    sourceWebhookEventId: "evt_alpha_internal",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    accountId: testFixtures.accounts.beta,
    stripeCustomerId: "cus_beta_internal",
    stripeSubscriptionId: "sub_beta_internal",
    stripeProductId: "prod_beta_internal",
    stripePriceId: "price_beta_internal",
    entitlementCode: "api_agent_basic",
    tierFamily: "api_only_agent",
    tierLevel: 1,
    monthlyQuota: 0,
    apiAccess: false,
    dashboardAccess: false,
    status: "expired",
    currentPeriodStart: "2026-05-01T00:00:00.000Z",
    currentPeriodEnd: "2026-06-01T00:00:00.000Z",
    sourceWebhookEventId: "evt_beta_internal",
    createdAt: now,
    updatedAt: now
  }
];

export function isLocalTestAuthEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.NODE_ENV === "production") {
    return false;
  }

  if (env.WEBOT_RUNTIME_ENV === "staging" || env.WEBOT_RUNTIME_ENV === "production") {
    return false;
  }

  return true;
}

export function isFixtureServerDbAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV !== "production";
}

export class FixtureServerDb implements ServerDb {
  async authenticate(headers: Headers): Promise<AuthResult> {
    const fixtureUserId = headers.get("x-webot-test-user-id");
    const fixtureEmail = headers.get("x-webot-test-user-email");

    if (fixtureUserId) {
      if (!isLocalTestAuthEnabled()) {
        return {
          ok: false,
          status: 401,
          code: "unauthorized",
          message: "Authentication is required."
        };
      }

      return {
        ok: true,
        method: "supabase_session",
        user: {
          id: fixtureUserId,
          email: fixtureEmail
        },
        scopes: ["dashboard:read"]
      };
    }

    if (headers.get("authorization")) {
      return {
        ok: false,
        status: 500,
        code: "auth_not_configured",
        message: "Authentication is not configured for this environment."
      };
    }

    return {
      ok: false,
      status: 401,
      code: "unauthorized",
      message: "Authentication is required."
    };
  }

  async getUserBySupabaseId(supabaseUserId: string): Promise<UserRow | null> {
    return fixtureUsers.find((user) => user.supabaseUserId === supabaseUserId) ?? null;
  }

  async listMembershipsByUserId(userId: string): Promise<AccountMembershipRow[]> {
    return fixtureMemberships.filter((membership) => membership.userId === userId);
  }

  async getAccount(accountId: string): Promise<AccountRow | null> {
    return fixtureAccounts.find((account) => account.id === accountId) ?? null;
  }

  async listEntitlementsByAccountId(accountId: string): Promise<EntitlementRow[]> {
    return fixtureEntitlements.filter((entitlement) => entitlement.accountId === accountId);
  }
}

let defaultDb: ServerDb | null = null;

export function getServerDb(): ServerDb {
  if (!defaultDb) {
    if (isSupabaseServerDbConfigured()) {
      defaultDb = SupabaseServerDb.fromEnv();
      return defaultDb;
    }

    if (!isFixtureServerDbAllowed()) {
      throw new Error("Production ServerDb adapter is not configured. FixtureServerDb is local/test only.");
    }

    defaultDb = new FixtureServerDb();
  }

  return defaultDb;
}

export function resetServerDbForTests(db: ServerDb | null = null): void {
  defaultDb = db;
}

export function getRequestId(headers: Headers): string {
  return headers.get("x-request-id") ?? `req_${crypto.randomUUID()}`;
}
