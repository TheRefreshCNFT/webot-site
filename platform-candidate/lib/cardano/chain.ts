// Server-side Cardano chain queries. Holder verification NEVER trusts a
// client-supplied count; these helpers are the only source of truth.
//
// Provider selection:
//   - Blockfrost when CARDANO_BLOCKFROST_PROJECT_ID is configured (the key
//     stays server-side and is never logged or echoed).
//   - Koios (free, keyless) as the fallback provider.
//
// Both providers are queried with bounded pagination and strict response
// validation so a malformed provider payload fails closed.

import { WEBOT_HOLDER_POLICY_ID } from "../../config/cardano";
import type { CardanoNetwork } from "./addresses";

type FetchLike = typeof fetch;

export type ChainProviderName = "blockfrost" | "koios";

export type PolicyHoldingResult = {
  provider: ChainProviderName;
  network: CardanoNetwork;
  /** Total units held under the policy (sum of quantities across assets). */
  assetCount: number;
  checkedAt: string;
};

export class ChainProviderError extends Error {
  readonly code: "chain_provider_not_configured" | "chain_provider_failed";

  constructor(code: ChainProviderError["code"], message: string) {
    super(message);
    this.name = "ChainProviderError";
    this.code = code;
  }
}

export type ChainQueryOptions = {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: FetchLike;
  policyId?: string;
  now?: () => Date;
};

const PAGE_SIZE = 100;
const MAX_PAGES = 100;
const KOIOS_PAGE_SIZE = 500;
const MAX_COUNT = 10_000_000;

export function getCardanoNetwork(env: NodeJS.ProcessEnv = process.env): CardanoNetwork {
  const raw = env.CARDANO_NETWORK?.trim().toLowerCase();

  if (raw === "preprod" || raw === "preview") {
    return raw;
  }

  return "mainnet";
}

export function getChainProviderName(env: NodeJS.ProcessEnv = process.env): ChainProviderName {
  return env.CARDANO_BLOCKFROST_PROJECT_ID?.trim() ? "blockfrost" : "koios";
}

function blockfrostBase(network: CardanoNetwork, env: NodeJS.ProcessEnv): string {
  const override = env.CARDANO_BLOCKFROST_BASE_URL?.trim();

  if (override) {
    return override.replace(/\/+$/, "");
  }

  return `https://cardano-${network}.blockfrost.io/api/v0`;
}

function koiosBase(network: CardanoNetwork, env: NodeJS.ProcessEnv): string {
  const override = env.CARDANO_KOIOS_BASE_URL?.trim();

  if (override) {
    return override.replace(/\/+$/, "");
  }

  const host = network === "mainnet" ? "api" : network;
  return `https://${host}.koios.rest/api/v1`;
}

/**
 * Counts assets held by a stake address under the holder policy.
 * Sum of quantities: 25 distinct NFTs and 25 units of one asset both count
 * as 25 held assets.
 */
export async function countPolicyAssets(
  stakeAddress: string,
  options: ChainQueryOptions = {}
): Promise<PolicyHoldingResult> {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const network = getCardanoNetwork(env);
  const policyId = options.policyId ?? WEBOT_HOLDER_POLICY_ID;
  const provider = getChainProviderName(env);
  const checkedAt = (options.now ? options.now() : new Date()).toISOString();

  const assetCount = provider === "blockfrost"
    ? await countViaBlockfrost(stakeAddress, policyId, network, env, fetchImpl)
    : await countViaKoios(stakeAddress, policyId, network, env, fetchImpl);

  return { provider, network, assetCount, checkedAt };
}

async function countViaBlockfrost(
  stakeAddress: string,
  policyId: string,
  network: CardanoNetwork,
  env: NodeJS.ProcessEnv,
  fetchImpl: FetchLike
): Promise<number> {
  const projectId = env.CARDANO_BLOCKFROST_PROJECT_ID?.trim();

  if (!projectId) {
    throw new ChainProviderError("chain_provider_not_configured", "Blockfrost project id is not configured.");
  }

  const base = blockfrostBase(network, env);
  let total = 0n;

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = `${base}/accounts/${encodeURIComponent(stakeAddress)}/addresses/assets?count=${PAGE_SIZE}&page=${page}`;
    const response = await fetchImpl(url, {
      headers: { project_id: projectId, accept: "application/json" }
    });

    if (response.status === 404) {
      // Account never seen on chain: zero holdings.
      return 0;
    }

    if (!response.ok) {
      throw new ChainProviderError(
        "chain_provider_failed",
        `Blockfrost holdings query failed with status ${response.status}.`
      );
    }

    const body: unknown = await response.json();

    if (!Array.isArray(body)) {
      throw new ChainProviderError("chain_provider_failed", "Blockfrost holdings payload was not a list.");
    }

    for (const entry of body) {
      const unit = (entry as { unit?: unknown }).unit;
      const quantity = (entry as { quantity?: unknown }).quantity;

      if (typeof unit !== "string" || typeof quantity !== "string" || !/^\d+$/.test(quantity)) {
        throw new ChainProviderError("chain_provider_failed", "Blockfrost holdings entry was malformed.");
      }

      if (unit.startsWith(policyId)) {
        total += BigInt(quantity);
      }
    }

    if (body.length < PAGE_SIZE) {
      break;
    }
  }

  return clampCount(total);
}

async function countViaKoios(
  stakeAddress: string,
  policyId: string,
  network: CardanoNetwork,
  env: NodeJS.ProcessEnv,
  fetchImpl: FetchLike
): Promise<number> {
  const base = koiosBase(network, env);
  let total = 0n;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const url = `${base}/account_assets?offset=${page * KOIOS_PAGE_SIZE}&limit=${KOIOS_PAGE_SIZE}`;
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ _stake_addresses: [stakeAddress] })
    });

    if (!response.ok) {
      throw new ChainProviderError(
        "chain_provider_failed",
        `Koios holdings query failed with status ${response.status}.`
      );
    }

    const body: unknown = await response.json();

    if (!Array.isArray(body)) {
      throw new ChainProviderError("chain_provider_failed", "Koios holdings payload was not a list.");
    }

    for (const entry of body) {
      const rowPolicy = (entry as { policy_id?: unknown }).policy_id;
      const quantity = (entry as { quantity?: unknown }).quantity;

      if (typeof rowPolicy !== "string" || typeof quantity !== "string" || !/^\d+$/.test(quantity)) {
        throw new ChainProviderError("chain_provider_failed", "Koios holdings entry was malformed.");
      }

      if (rowPolicy === policyId) {
        total += BigInt(quantity);
      }
    }

    if (body.length < KOIOS_PAGE_SIZE) {
      break;
    }
  }

  return clampCount(total);
}

export type TxOutputCheckResult = {
  provider: ChainProviderName;
  found: boolean;
  /** Total lovelace paid to the expected address across tx outputs. */
  lovelaceToAddress: bigint;
};

/**
 * On-chain verification for the (feature-flagged) Cardano payment option:
 * confirms a transaction exists and how much lovelace it paid to the
 * expected platform address. Never builds or submits transactions.
 */
export async function getTxLovelaceToAddress(
  txHash: string,
  address: string,
  options: ChainQueryOptions = {}
): Promise<TxOutputCheckResult> {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const network = getCardanoNetwork(env);
  const provider = getChainProviderName(env);

  if (provider === "blockfrost") {
    const projectId = env.CARDANO_BLOCKFROST_PROJECT_ID?.trim();

    if (!projectId) {
      throw new ChainProviderError("chain_provider_not_configured", "Blockfrost project id is not configured.");
    }

    const response = await fetchImpl(`${blockfrostBase(network, env)}/txs/${encodeURIComponent(txHash)}/utxos`, {
      headers: { project_id: projectId, accept: "application/json" }
    });

    if (response.status === 404) {
      return { provider, found: false, lovelaceToAddress: 0n };
    }

    if (!response.ok) {
      throw new ChainProviderError("chain_provider_failed", `Blockfrost tx query failed with status ${response.status}.`);
    }

    const body = await response.json() as { outputs?: Array<{ address?: unknown; amount?: Array<{ unit?: unknown; quantity?: unknown }> }> };
    const outputs = Array.isArray(body.outputs) ? body.outputs : [];
    let lovelace = 0n;

    for (const output of outputs) {
      if (output.address !== address || !Array.isArray(output.amount)) {
        continue;
      }

      for (const amount of output.amount) {
        if (amount.unit === "lovelace" && typeof amount.quantity === "string" && /^\d+$/.test(amount.quantity)) {
          lovelace += BigInt(amount.quantity);
        }
      }
    }

    return { provider, found: true, lovelaceToAddress: lovelace };
  }

  const response = await fetchImpl(`${koiosBase(network, env)}/tx_info`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ _tx_hashes: [txHash] })
  });

  if (!response.ok) {
    throw new ChainProviderError("chain_provider_failed", `Koios tx query failed with status ${response.status}.`);
  }

  const body: unknown = await response.json();

  if (!Array.isArray(body) || body.length === 0) {
    return { provider, found: false, lovelaceToAddress: 0n };
  }

  const outputs = (body[0] as { outputs?: Array<{ payment_addr?: { bech32?: unknown }; value?: unknown }> }).outputs;
  let lovelace = 0n;

  for (const output of Array.isArray(outputs) ? outputs : []) {
    if (
      output.payment_addr?.bech32 === address
      && typeof output.value === "string"
      && /^\d+$/.test(output.value)
    ) {
      lovelace += BigInt(output.value);
    }
  }

  return { provider, found: true, lovelaceToAddress: lovelace };
}

function clampCount(total: bigint): number {
  if (total < 0n) {
    return 0;
  }

  if (total > BigInt(MAX_COUNT)) {
    return MAX_COUNT;
  }

  return Number(total);
}
