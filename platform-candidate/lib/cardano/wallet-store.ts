// Cardano wallet persistence. Mirrors the intake repository pattern:
// in-memory adapter for local/test, Supabase REST (service role) adapter
// when the runtime is configured. All writes are server-owned; RLS gives
// customers account-scoped SELECT only (migration 0016).

import { isSupabaseRuntimeConfigured, SupabaseRestClient } from "../db/supabase-rest";
import type { CardanoNetwork } from "./addresses";

/**
 * How the wallet-account link was established. `cip30_connect` is the
 * default signature-free connect flow (enable() + address read); the
 * signature-backed methods are reserved for future higher-stakes actions.
 */
export type WalletOwnershipMethod = "cip30_connect" | "cip30_signdata" | "tx_proof";

export type CardanoWalletRow = {
  id: string;
  accountId: string;
  stakeAddress: string;
  paymentAddress: string | null;
  network: CardanoNetwork;
  verifiedAt: string;
  ownershipMethod: WalletOwnershipMethod;
  proofPayloadHash: string;
  policyAssetCount: number;
  holderEligible: boolean;
  lastAssetCheckAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WalletChallengeRow = {
  id: string;
  accountId: string;
  stakeAddress: string;
  nonce: string;
  challenge: string;
  expiresAt: string;
  consumedAt: string | null;
  createdAt: string;
};

export type CardanoPaymentIntentStatus = "pending" | "confirmed" | "expired" | "canceled";

export type CardanoPaymentIntentRow = {
  id: string;
  accountId: string;
  purpose: string;
  lovelaceAmount: string;
  paymentAddress: string;
  network: CardanoNetwork;
  status: CardanoPaymentIntentStatus;
  txHash: string | null;
  expiresAt: string;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WalletRepository = {
  getWalletByAccountId(accountId: string): Promise<CardanoWalletRow | null>;
  getWalletByStakeAddress(stakeAddress: string): Promise<CardanoWalletRow | null>;
  upsertWallet(row: CardanoWalletRow): Promise<CardanoWalletRow>;
  updateWalletHoldings(input: {
    accountId: string;
    policyAssetCount: number;
    holderEligible: boolean;
    lastAssetCheckAt: string;
  }): Promise<CardanoWalletRow | null>;
  deleteWalletByAccountId(accountId: string): Promise<boolean>;
  listWalletsForRefresh(staleBefore: string, limit: number): Promise<CardanoWalletRow[]>;

  createChallenge(row: WalletChallengeRow): Promise<WalletChallengeRow>;
  findOpenChallenge(accountId: string, nonce: string): Promise<WalletChallengeRow | null>;
  /** Atomically marks the challenge consumed; false when already consumed. */
  consumeChallenge(id: string, consumedAt: string): Promise<boolean>;

  createPaymentIntent(row: CardanoPaymentIntentRow): Promise<CardanoPaymentIntentRow>;
  findPaymentIntentForAccount(id: string, accountId: string): Promise<CardanoPaymentIntentRow | null>;
  updatePaymentIntent(row: CardanoPaymentIntentRow): Promise<CardanoPaymentIntentRow>;
  findPaymentIntentByTxHash(txHash: string): Promise<CardanoPaymentIntentRow | null>;
};

export class InMemoryWalletRepository implements WalletRepository {
  private readonly wallets = new Map<string, CardanoWalletRow>();
  private readonly challenges = new Map<string, WalletChallengeRow>();
  private readonly paymentIntents = new Map<string, CardanoPaymentIntentRow>();

  async getWalletByAccountId(accountId: string): Promise<CardanoWalletRow | null> {
    for (const wallet of this.wallets.values()) {
      if (wallet.accountId === accountId) {
        return { ...wallet };
      }
    }

    return null;
  }

  async getWalletByStakeAddress(stakeAddress: string): Promise<CardanoWalletRow | null> {
    for (const wallet of this.wallets.values()) {
      if (wallet.stakeAddress === stakeAddress) {
        return { ...wallet };
      }
    }

    return null;
  }

  async upsertWallet(row: CardanoWalletRow): Promise<CardanoWalletRow> {
    const existingForStake = await this.getWalletByStakeAddress(row.stakeAddress);

    if (existingForStake && existingForStake.accountId !== row.accountId) {
      throw new Error("stake address is already linked to another account");
    }

    const existing = await this.getWalletByAccountId(row.accountId);

    if (existing) {
      this.wallets.delete(existing.id);
      const merged = { ...row, id: existing.id, createdAt: existing.createdAt };
      this.wallets.set(merged.id, { ...merged });
      return { ...merged };
    }

    this.wallets.set(row.id, { ...row });
    return { ...row };
  }

  async updateWalletHoldings(input: {
    accountId: string;
    policyAssetCount: number;
    holderEligible: boolean;
    lastAssetCheckAt: string;
  }): Promise<CardanoWalletRow | null> {
    const wallet = await this.getWalletByAccountId(input.accountId);

    if (!wallet) {
      return null;
    }

    const updated: CardanoWalletRow = {
      ...wallet,
      policyAssetCount: input.policyAssetCount,
      holderEligible: input.holderEligible,
      lastAssetCheckAt: input.lastAssetCheckAt,
      updatedAt: input.lastAssetCheckAt
    };
    this.wallets.set(updated.id, { ...updated });
    return { ...updated };
  }

  async deleteWalletByAccountId(accountId: string): Promise<boolean> {
    const wallet = await this.getWalletByAccountId(accountId);

    if (!wallet) {
      return false;
    }

    this.wallets.delete(wallet.id);
    return true;
  }

  async listWalletsForRefresh(staleBefore: string, limit: number): Promise<CardanoWalletRow[]> {
    return Array.from(this.wallets.values())
      .filter((wallet) => !wallet.lastAssetCheckAt || wallet.lastAssetCheckAt < staleBefore)
      .sort((left, right) => (left.lastAssetCheckAt ?? "").localeCompare(right.lastAssetCheckAt ?? ""))
      .slice(0, limit)
      .map((wallet) => ({ ...wallet }));
  }

  async createChallenge(row: WalletChallengeRow): Promise<WalletChallengeRow> {
    this.challenges.set(row.id, { ...row });
    return { ...row };
  }

  async findOpenChallenge(accountId: string, nonce: string): Promise<WalletChallengeRow | null> {
    for (const challenge of this.challenges.values()) {
      if (challenge.accountId === accountId && challenge.nonce === nonce && challenge.consumedAt === null) {
        return { ...challenge };
      }
    }

    return null;
  }

  async consumeChallenge(id: string, consumedAt: string): Promise<boolean> {
    const challenge = this.challenges.get(id);

    if (!challenge || challenge.consumedAt !== null) {
      return false;
    }

    this.challenges.set(id, { ...challenge, consumedAt });
    return true;
  }

  async createPaymentIntent(row: CardanoPaymentIntentRow): Promise<CardanoPaymentIntentRow> {
    this.paymentIntents.set(row.id, { ...row });
    return { ...row };
  }

  async findPaymentIntentForAccount(id: string, accountId: string): Promise<CardanoPaymentIntentRow | null> {
    const intent = this.paymentIntents.get(id);
    return intent && intent.accountId === accountId ? { ...intent } : null;
  }

  async updatePaymentIntent(row: CardanoPaymentIntentRow): Promise<CardanoPaymentIntentRow> {
    this.paymentIntents.set(row.id, { ...row });
    return { ...row };
  }

  async findPaymentIntentByTxHash(txHash: string): Promise<CardanoPaymentIntentRow | null> {
    for (const intent of this.paymentIntents.values()) {
      if (intent.txHash === txHash) {
        return { ...intent };
      }
    }

    return null;
  }
}

type SupabaseWalletRow = {
  id: string;
  account_id: string;
  stake_address: string;
  payment_address: string | null;
  network: CardanoNetwork;
  verified_at: string;
  ownership_method: WalletOwnershipMethod;
  proof_payload_hash: string;
  policy_asset_count: number;
  holder_eligible: boolean;
  last_asset_check_at: string | null;
  created_at: string;
  updated_at: string;
};

type SupabaseChallengeRow = {
  id: string;
  account_id: string;
  stake_address: string;
  nonce: string;
  challenge: string;
  expires_at: string;
  consumed_at: string | null;
  created_at: string;
};

type SupabasePaymentIntentRow = {
  id: string;
  account_id: string;
  purpose: string;
  lovelace_amount: string | number;
  payment_address: string;
  network: CardanoNetwork;
  status: CardanoPaymentIntentStatus;
  tx_hash: string | null;
  expires_at: string;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

const walletSelect = [
  "id",
  "account_id",
  "stake_address",
  "payment_address",
  "network",
  "verified_at",
  "ownership_method",
  "proof_payload_hash",
  "policy_asset_count",
  "holder_eligible",
  "last_asset_check_at",
  "created_at",
  "updated_at"
].join(",");

const challengeSelect = "id,account_id,stake_address,nonce,challenge,expires_at,consumed_at,created_at";
const paymentIntentSelect = [
  "id",
  "account_id",
  "purpose",
  "lovelace_amount",
  "payment_address",
  "network",
  "status",
  "tx_hash",
  "expires_at",
  "confirmed_at",
  "created_at",
  "updated_at"
].join(",");

export class SupabaseWalletRepository implements WalletRepository {
  private readonly client: SupabaseRestClient;

  constructor(client: SupabaseRestClient = SupabaseRestClient.fromEnv()) {
    this.client = client;
  }

  async getWalletByAccountId(accountId: string): Promise<CardanoWalletRow | null> {
    const rows = await this.client.get<SupabaseWalletRow>("app_public", "cardano_wallets", {
      select: walletSelect,
      account_id: `eq.${accountId}`,
      limit: "1"
    });
    return rows[0] ? toWalletRow(rows[0]) : null;
  }

  async getWalletByStakeAddress(stakeAddress: string): Promise<CardanoWalletRow | null> {
    const rows = await this.client.get<SupabaseWalletRow>("app_public", "cardano_wallets", {
      select: walletSelect,
      stake_address: `eq.${stakeAddress}`,
      limit: "1"
    });
    return rows[0] ? toWalletRow(rows[0]) : null;
  }

  async upsertWallet(row: CardanoWalletRow): Promise<CardanoWalletRow> {
    // Update-then-insert instead of PostgREST upsert: the shared REST client
    // does not send a merge resolution preference, and one-wallet-per-account
    // makes the account_id update path the common re-verification case.
    const patch = {
      stake_address: row.stakeAddress,
      payment_address: row.paymentAddress,
      network: row.network,
      verified_at: row.verifiedAt,
      ownership_method: row.ownershipMethod,
      proof_payload_hash: row.proofPayloadHash,
      policy_asset_count: row.policyAssetCount,
      holder_eligible: row.holderEligible,
      last_asset_check_at: row.lastAssetCheckAt,
      updated_at: row.updatedAt
    };

    const updated = await this.client.update<SupabaseWalletRow>(
      "app_public",
      "cardano_wallets",
      { account_id: `eq.${row.accountId}` },
      patch
    );

    if (updated[0]) {
      return toWalletRow(updated[0]);
    }

    const inserted = await this.client.insert<SupabaseWalletRow>("app_public", "cardano_wallets", {
      id: row.id,
      account_id: row.accountId,
      created_at: row.createdAt,
      ...patch
    });

    if (!inserted[0]) {
      throw new Error("Supabase cardano_wallets insert returned no row.");
    }

    return toWalletRow(inserted[0]);
  }

  async updateWalletHoldings(input: {
    accountId: string;
    policyAssetCount: number;
    holderEligible: boolean;
    lastAssetCheckAt: string;
  }): Promise<CardanoWalletRow | null> {
    const rows = await this.client.update<SupabaseWalletRow>(
      "app_public",
      "cardano_wallets",
      { account_id: `eq.${input.accountId}` },
      {
        policy_asset_count: input.policyAssetCount,
        holder_eligible: input.holderEligible,
        last_asset_check_at: input.lastAssetCheckAt,
        updated_at: input.lastAssetCheckAt
      }
    );
    return rows[0] ? toWalletRow(rows[0]) : null;
  }

  async deleteWalletByAccountId(accountId: string): Promise<boolean> {
    const rows = await this.client.deleteRows<SupabaseWalletRow>("app_public", "cardano_wallets", {
      account_id: `eq.${accountId}`
    });
    return rows.length > 0;
  }

  async listWalletsForRefresh(staleBefore: string, limit: number): Promise<CardanoWalletRow[]> {
    const rows = await this.client.get<SupabaseWalletRow>("app_public", "cardano_wallets", {
      select: walletSelect,
      or: `(last_asset_check_at.is.null,last_asset_check_at.lt.${staleBefore})`,
      order: "last_asset_check_at.asc.nullsfirst",
      limit: String(limit)
    });
    return rows.map(toWalletRow);
  }

  async createChallenge(row: WalletChallengeRow): Promise<WalletChallengeRow> {
    const rows = await this.client.insert<SupabaseChallengeRow>("app_private", "cardano_wallet_challenges", {
      id: row.id,
      account_id: row.accountId,
      stake_address: row.stakeAddress,
      nonce: row.nonce,
      challenge: row.challenge,
      expires_at: row.expiresAt,
      consumed_at: row.consumedAt,
      created_at: row.createdAt
    });

    if (!rows[0]) {
      throw new Error("Supabase cardano_wallet_challenges insert returned no row.");
    }

    return toChallengeRow(rows[0]);
  }

  async findOpenChallenge(accountId: string, nonce: string): Promise<WalletChallengeRow | null> {
    const rows = await this.client.get<SupabaseChallengeRow>("app_private", "cardano_wallet_challenges", {
      select: challengeSelect,
      account_id: `eq.${accountId}`,
      nonce: `eq.${nonce}`,
      consumed_at: "is.null",
      limit: "1"
    });
    return rows[0] ? toChallengeRow(rows[0]) : null;
  }

  async consumeChallenge(id: string, consumedAt: string): Promise<boolean> {
    const rows = await this.client.update<SupabaseChallengeRow>(
      "app_private",
      "cardano_wallet_challenges",
      { id: `eq.${id}`, consumed_at: "is.null" },
      { consumed_at: consumedAt }
    );
    return rows.length > 0;
  }

  async createPaymentIntent(row: CardanoPaymentIntentRow): Promise<CardanoPaymentIntentRow> {
    const rows = await this.client.insert<SupabasePaymentIntentRow>("app_public", "cardano_payment_intents", {
      id: row.id,
      account_id: row.accountId,
      purpose: row.purpose,
      lovelace_amount: row.lovelaceAmount,
      payment_address: row.paymentAddress,
      network: row.network,
      status: row.status,
      tx_hash: row.txHash,
      expires_at: row.expiresAt,
      confirmed_at: row.confirmedAt,
      created_at: row.createdAt,
      updated_at: row.updatedAt
    });

    if (!rows[0]) {
      throw new Error("Supabase cardano_payment_intents insert returned no row.");
    }

    return toPaymentIntentRow(rows[0]);
  }

  async findPaymentIntentForAccount(id: string, accountId: string): Promise<CardanoPaymentIntentRow | null> {
    const rows = await this.client.get<SupabasePaymentIntentRow>("app_public", "cardano_payment_intents", {
      select: paymentIntentSelect,
      id: `eq.${id}`,
      account_id: `eq.${accountId}`,
      limit: "1"
    });
    return rows[0] ? toPaymentIntentRow(rows[0]) : null;
  }

  async updatePaymentIntent(row: CardanoPaymentIntentRow): Promise<CardanoPaymentIntentRow> {
    const rows = await this.client.update<SupabasePaymentIntentRow>(
      "app_public",
      "cardano_payment_intents",
      { id: `eq.${row.id}` },
      {
        status: row.status,
        tx_hash: row.txHash,
        confirmed_at: row.confirmedAt,
        updated_at: row.updatedAt
      }
    );

    if (!rows[0]) {
      throw new Error("Supabase cardano_payment_intents update returned no row.");
    }

    return toPaymentIntentRow(rows[0]);
  }

  async findPaymentIntentByTxHash(txHash: string): Promise<CardanoPaymentIntentRow | null> {
    const rows = await this.client.get<SupabasePaymentIntentRow>("app_public", "cardano_payment_intents", {
      select: paymentIntentSelect,
      tx_hash: `eq.${txHash}`,
      limit: "1"
    });
    return rows[0] ? toPaymentIntentRow(rows[0]) : null;
  }
}

let defaultRepository: WalletRepository | null = null;

export function getWalletRepository(): WalletRepository {
  if (!defaultRepository) {
    defaultRepository = isSupabaseRuntimeConfigured()
      ? new SupabaseWalletRepository()
      : new InMemoryWalletRepository();
  }

  return defaultRepository;
}

export function resetWalletRepositoryForTests(repository: WalletRepository = new InMemoryWalletRepository()): void {
  defaultRepository = repository;
}

function toWalletRow(row: SupabaseWalletRow): CardanoWalletRow {
  return {
    id: row.id,
    accountId: row.account_id,
    stakeAddress: row.stake_address,
    paymentAddress: row.payment_address,
    network: row.network,
    verifiedAt: row.verified_at,
    ownershipMethod: row.ownership_method,
    proofPayloadHash: row.proof_payload_hash,
    policyAssetCount: row.policy_asset_count,
    holderEligible: row.holder_eligible,
    lastAssetCheckAt: row.last_asset_check_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toChallengeRow(row: SupabaseChallengeRow): WalletChallengeRow {
  return {
    id: row.id,
    accountId: row.account_id,
    stakeAddress: row.stake_address,
    nonce: row.nonce,
    challenge: row.challenge,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at,
    createdAt: row.created_at
  };
}

function toPaymentIntentRow(row: SupabasePaymentIntentRow): CardanoPaymentIntentRow {
  return {
    id: row.id,
    accountId: row.account_id,
    purpose: row.purpose,
    lovelaceAmount: String(row.lovelace_amount),
    paymentAddress: row.payment_address,
    network: row.network,
    status: row.status,
    txHash: row.tx_hash,
    expiresAt: row.expires_at,
    confirmedAt: row.confirmed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
