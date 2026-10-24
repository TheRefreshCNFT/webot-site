// Cardano wallet service layer: signature-free connect registration (the
// default flow), challenge issuance + CIP-8/tx ownership proofs (reserved
// for future higher-stakes actions), server-side holder eligibility,
// refresh/downgrade, and entitlement gating for the holder_unlimited tier.

import { createHash, randomUUID } from "node:crypto";
import {
  WEBOT_HOLDER_ENTITLEMENT_CODE,
  WEBOT_HOLDER_MIN_ASSET_COUNT,
  WEBOT_HOLDER_REFRESH_MIN_INTERVAL_SECONDS
} from "../../config/cardano";
import type { AccountContext } from "../auth/account";
import type { EntitlementRow } from "../db/server";
import { isValidPaymentAddress, parseStakeAddress, type CardanoNetwork, type ParsedStakeAddress } from "./addresses";
import { buildWalletChallenge } from "./challenge";
import { countPolicyAssets, ChainProviderError, getCardanoNetwork, type ChainQueryOptions } from "./chain";
import { verifyCip8StakeOwnership } from "./cip8";
import { verifyTxChallengeOwnership } from "./tx-verify";
import {
  getWalletRepository,
  type CardanoWalletRow,
  type WalletChallengeRow,
  type WalletOwnershipMethod,
  type WalletRepository
} from "./wallet-store";

export type WalletErrorCode =
  | "invalid_stake_address"
  | "wallet_not_found"
  | "challenge_not_found"
  | "challenge_expired"
  | "challenge_address_mismatch"
  | "ownership_proof_failed"
  | "stake_address_in_use"
  | "refresh_too_soon"
  | "wallet_chain_unavailable";

export class WalletError extends Error {
  readonly status: 400 | 404 | 409 | 429 | 503;
  readonly code: WalletErrorCode;

  constructor(status: WalletError["status"], code: WalletErrorCode, message: string) {
    super(message);
    this.name = "WalletError";
    this.status = status;
    this.code = code;
  }
}

export type SafeWallet = {
  stake_address: string;
  payment_address: string | null;
  network: CardanoNetwork;
  verified_at: string;
  policy_asset_count: number;
  holder_eligible: boolean;
  holder_min_asset_count: number;
  last_asset_check_at: string | null;
};

export type WalletServiceOptions = {
  repository?: WalletRepository;
  chain?: ChainQueryOptions;
  now?: () => Date;
};

export function toSafeWallet(wallet: CardanoWalletRow): SafeWallet {
  return {
    stake_address: wallet.stakeAddress,
    payment_address: wallet.paymentAddress,
    network: wallet.network,
    verified_at: wallet.verifiedAt,
    policy_asset_count: wallet.policyAssetCount,
    holder_eligible: wallet.holderEligible,
    holder_min_asset_count: WEBOT_HOLDER_MIN_ASSET_COUNT,
    last_asset_check_at: wallet.lastAssetCheckAt
  };
}

export async function getWalletStatus(
  context: AccountContext,
  options: WalletServiceOptions = {}
): Promise<SafeWallet | null> {
  const repository = options.repository ?? getWalletRepository();
  const wallet = await repository.getWalletByAccountId(context.account.id);
  return wallet ? toSafeWallet(wallet) : null;
}

export async function requestWalletChallenge(
  context: AccountContext,
  input: { stake_address?: unknown },
  options: WalletServiceOptions = {}
): Promise<{ challenge: string; nonce: string; expires_at: string }> {
  const repository = options.repository ?? getWalletRepository();
  const network = getCardanoNetwork(options.chain?.env ?? process.env);
  const parsed = parseStakeAddress(input.stake_address, network);

  if (!parsed || parsed.isScriptCredential) {
    throw new WalletError(
      400,
      "invalid_stake_address",
      `A valid ${network} stake address (key credential) is required.`
    );
  }

  const linkedElsewhere = await repository.getWalletByStakeAddress(parsed.stakeAddress);

  if (linkedElsewhere && linkedElsewhere.accountId !== context.account.id) {
    throw new WalletError(409, "stake_address_in_use", "This wallet is already linked to another account.");
  }

  const now = options.now ? options.now() : new Date();
  const built = buildWalletChallenge({
    accountId: context.account.id,
    stakeAddress: parsed.stakeAddress,
    now
  });

  await repository.createChallenge({
    id: randomUUID(),
    accountId: context.account.id,
    stakeAddress: parsed.stakeAddress,
    nonce: built.nonce,
    challenge: built.challenge,
    expiresAt: built.expiresAt,
    consumedAt: null,
    createdAt: now.toISOString()
  });

  return { challenge: built.challenge, nonce: built.nonce, expires_at: built.expiresAt };
}

export type VerifyWalletResult = {
  wallet: SafeWallet;
  holdings_checked: boolean;
};

/**
 * Default connect flow: signature-free wallet registration. CIP-30
 * `enable()` plus reading the reward address IS the ownership model — the
 * extension only exposes user-controlled wallets after the user's in-wallet
 * approval, so the posted stake address is trusted at the "holder discount"
 * stakes level. No signData, no tx signing, no challenge: hardware devices
 * (Keystone, Ledger, Trezor) get zero signing prompts. The signature-backed
 * proofs below (verifyWalletOwnership / verifyWalletOwnershipByTx) are KEPT
 * for future higher-stakes actions such as Cardano payments.
 *
 * The server still does all the authority-bearing work: bech32 shape +
 * network validation, cross-account duplicate guard, and the on-chain
 * policy asset count (Blockfrost/Koios) that gates holder eligibility.
 */
export async function registerConnectedWallet(
  context: AccountContext,
  input: { stake_address?: unknown; payment_address?: unknown },
  options: WalletServiceOptions = {}
): Promise<VerifyWalletResult> {
  const repository = options.repository ?? getWalletRepository();
  const env = options.chain?.env ?? process.env;
  const network = getCardanoNetwork(env);
  const now = options.now ? options.now() : new Date();
  const parsed = parseStakeAddress(input.stake_address, network);

  // Script-credential stake addresses are allowed here (multisig/dApp
  // wallets): there is no signature to bind to a key credential.
  if (!parsed) {
    throw new WalletError(
      400,
      "invalid_stake_address",
      `A valid ${network} stake address is required.`
    );
  }

  await assertStakeAddressAvailable(repository, parsed.stakeAddress, context.account.id);

  return persistWalletWithHoldings(context, {
    repository,
    env,
    network,
    now,
    parsed,
    paymentAddress: normalizeOptionalPaymentAddress(input.payment_address, network),
    ownershipMethod: "cip30_connect",
    // Audit anchor: no signed payload exists on this path, so hash the
    // registration tuple instead (satisfies the 0016 length constraint).
    proofPayloadHash: hashChallengePayload(
      `cip30-connect:${context.account.id}:${parsed.stakeAddress}`
    ),
    options
  });
}

type ChallengeVerificationSetup = {
  repository: WalletRepository;
  env: NodeJS.ProcessEnv;
  network: CardanoNetwork;
  now: Date;
  parsed: ParsedStakeAddress;
  challenge: WalletChallengeRow;
};

/**
 * Shared preamble for both ownership-proof paths (signData and tx-proof):
 * validates the claimed stake address and loads the matching open,
 * unexpired challenge. Consumption happens later, after the proof checks.
 */
async function loadChallengeForVerification(
  context: AccountContext,
  input: { stake_address?: unknown; nonce?: unknown },
  options: WalletServiceOptions
): Promise<ChallengeVerificationSetup> {
  const repository = options.repository ?? getWalletRepository();
  const env = options.chain?.env ?? process.env;
  const network = getCardanoNetwork(env);
  const now = options.now ? options.now() : new Date();
  const parsed = parseStakeAddress(input.stake_address, network);

  if (!parsed || parsed.isScriptCredential) {
    throw new WalletError(
      400,
      "invalid_stake_address",
      `A valid ${network} stake address (key credential) is required.`
    );
  }

  if (typeof input.nonce !== "string" || input.nonce.length < 16 || input.nonce.length > 80) {
    throw new WalletError(404, "challenge_not_found", "Request a new signing challenge first.");
  }

  const challenge = await repository.findOpenChallenge(context.account.id, input.nonce);

  if (!challenge) {
    throw new WalletError(404, "challenge_not_found", "Request a new signing challenge first.");
  }

  if (challenge.expiresAt <= now.toISOString()) {
    throw new WalletError(400, "challenge_expired", "The signing challenge expired. Request a new one.");
  }

  if (challenge.stakeAddress !== parsed.stakeAddress) {
    throw new WalletError(400, "challenge_address_mismatch", "The challenge was issued for a different wallet.");
  }

  return { repository, env, network, now, parsed, challenge };
}

/**
 * OWNERSHIP-PROOF PATH (CIP-30 signData / CIP-8) — NOT used at connect.
 * The default connect flow is registerConnectedWallet (signature-free);
 * hardware wallets hang on signData prompts, so no connect path may reach
 * this. Kept, tested, and reserved for future higher-stakes actions
 * (e.g. Cardano payments) where a cryptographic proof is warranted.
 */
export async function verifyWalletOwnership(
  context: AccountContext,
  input: {
    stake_address?: unknown;
    nonce?: unknown;
    cose_sign1_hex?: unknown;
    cose_key_hex?: unknown;
    payment_address?: unknown;
  },
  options: WalletServiceOptions = {}
): Promise<VerifyWalletResult> {
  const { repository, env, network, now, parsed, challenge } = await loadChallengeForVerification(
    context,
    input,
    options
  );

  const verification = verifyCip8StakeOwnership({
    coseSign1Hex: input.cose_sign1_hex,
    coseKeyHex: input.cose_key_hex,
    expectedPayload: challenge.challenge,
    stakeAddress: parsed
  });

  if (!verification.ok) {
    throw new WalletError(
      400,
      "ownership_proof_failed",
      `Wallet ownership proof failed (${verification.error}).`
    );
  }

  return completeVerifiedWallet(context, {
    setup: { repository, env, network, now, parsed, challenge },
    paymentAddress: normalizeOptionalPaymentAddress(input.payment_address, network),
    ownershipMethod: "cip30_signdata",
    proofPayloadHash: verification.payloadSha256,
    options
  });
}

/**
 * OWNERSHIP-PROOF PATH (signed, never-submitted self-transaction) — NOT
 * used at connect. Hardware-compatible alternative to signData for future
 * higher-stakes actions (e.g. Cardano payments): most Cardano hardware
 * devices cannot sign arbitrary data payloads. Challenge lifecycle,
 * duplicate-link rules, persistence, and the holdings check are identical
 * to the signData path.
 */
export async function verifyWalletOwnershipByTx(
  context: AccountContext,
  input: {
    stake_address?: unknown;
    nonce?: unknown;
    tx_body_hex?: unknown;
    aux_data_hex?: unknown;
    witness_set_hex?: unknown;
    payment_address?: unknown;
  },
  options: WalletServiceOptions = {}
): Promise<VerifyWalletResult> {
  const setup = await loadChallengeForVerification(context, input, options);

  const verification = verifyTxChallengeOwnership({
    txBodyHex: input.tx_body_hex,
    auxDataHex: input.aux_data_hex,
    witnessSetHex: input.witness_set_hex,
    expectedPayload: setup.challenge.challenge,
    stakeAddress: setup.parsed
  });

  if (!verification.ok) {
    throw new WalletError(
      400,
      "ownership_proof_failed",
      `Wallet ownership proof failed (${verification.error}).`
    );
  }

  return completeVerifiedWallet(context, {
    setup,
    paymentAddress: normalizeOptionalPaymentAddress(input.payment_address, setup.network),
    ownershipMethod: "tx_proof",
    proofPayloadHash: verification.payloadSha256,
    options
  });
}

async function assertStakeAddressAvailable(
  repository: WalletRepository,
  stakeAddress: string,
  accountId: string
): Promise<void> {
  const linkedElsewhere = await repository.getWalletByStakeAddress(stakeAddress);

  if (linkedElsewhere && linkedElsewhere.accountId !== accountId) {
    throw new WalletError(409, "stake_address_in_use", "This wallet is already linked to another account.");
  }
}

/**
 * Shared tail for the signature-proof paths: duplicate-link guard, atomic
 * single-use challenge burn, then the shared persistence + holdings check.
 */
async function completeVerifiedWallet(
  context: AccountContext,
  args: {
    setup: ChallengeVerificationSetup;
    paymentAddress: string | null;
    ownershipMethod: WalletOwnershipMethod;
    proofPayloadHash: string;
    options: WalletServiceOptions;
  }
): Promise<VerifyWalletResult> {
  const { repository, env, network, now, parsed, challenge } = args.setup;

  await assertStakeAddressAvailable(repository, parsed.stakeAddress, context.account.id);

  // Single-use: atomically burn the challenge before persisting so a
  // replayed or racing request cannot complete a second verification.
  const consumed = await repository.consumeChallenge(challenge.id, now.toISOString());

  if (!consumed) {
    throw new WalletError(404, "challenge_not_found", "Request a new signing challenge first.");
  }

  return persistWalletWithHoldings(context, {
    repository,
    env,
    network,
    now,
    parsed,
    paymentAddress: args.paymentAddress,
    ownershipMethod: args.ownershipMethod,
    proofPayloadHash: args.proofPayloadHash,
    options: args.options
  });
}

/**
 * Shared persistence + best-effort holdings check for every link path
 * (connect registration and both signature proofs). Ownership is settled
 * by the time this runs; a chain-provider outage keeps the wallet linked
 * but not holder-eligible until a refresh succeeds.
 */
async function persistWalletWithHoldings(
  context: AccountContext,
  args: {
    repository: WalletRepository;
    env: NodeJS.ProcessEnv;
    network: CardanoNetwork;
    now: Date;
    parsed: ParsedStakeAddress;
    paymentAddress: string | null;
    ownershipMethod: WalletOwnershipMethod;
    proofPayloadHash: string;
    options: WalletServiceOptions;
  }
): Promise<VerifyWalletResult> {
  const { repository, env, network, now, parsed, options } = args;
  const nowIso = now.toISOString();

  let wallet = await repository.upsertWallet({
    id: randomUUID(),
    accountId: context.account.id,
    stakeAddress: parsed.stakeAddress,
    paymentAddress: args.paymentAddress,
    network,
    verifiedAt: nowIso,
    ownershipMethod: args.ownershipMethod,
    proofPayloadHash: args.proofPayloadHash,
    policyAssetCount: 0,
    holderEligible: false,
    lastAssetCheckAt: null,
    createdAt: nowIso,
    updatedAt: nowIso
  });

  let holdingsChecked = false;

  try {
    const holdings = await countPolicyAssets(parsed.stakeAddress, {
      ...options.chain,
      env,
      now: options.now ?? options.chain?.now
    });
    const updated = await repository.updateWalletHoldings({
      accountId: context.account.id,
      policyAssetCount: holdings.assetCount,
      holderEligible: holdings.assetCount >= WEBOT_HOLDER_MIN_ASSET_COUNT,
      lastAssetCheckAt: holdings.checkedAt
    });
    wallet = updated ?? wallet;
    holdingsChecked = true;
  } catch (error) {
    if (!(error instanceof ChainProviderError)) {
      throw error;
    }
  }

  return { wallet: toSafeWallet(wallet), holdings_checked: holdingsChecked };
}

export type RefreshWalletResult = {
  wallet: SafeWallet;
  downgraded: boolean;
  upgraded: boolean;
};

export async function refreshWalletHoldings(
  accountId: string,
  options: WalletServiceOptions & { force?: boolean } = {}
): Promise<RefreshWalletResult> {
  const repository = options.repository ?? getWalletRepository();
  const wallet = await repository.getWalletByAccountId(accountId);

  if (!wallet) {
    throw new WalletError(404, "wallet_not_found", "No verified wallet is linked to this account.");
  }

  const now = options.now ? options.now() : new Date();

  if (!options.force && wallet.lastAssetCheckAt) {
    const earliest = new Date(wallet.lastAssetCheckAt).getTime() + WEBOT_HOLDER_REFRESH_MIN_INTERVAL_SECONDS * 1000;

    if (now.getTime() < earliest) {
      throw new WalletError(429, "refresh_too_soon", "Holdings were checked moments ago. Try again shortly.");
    }
  }

  let holdings;

  try {
    holdings = await countPolicyAssets(wallet.stakeAddress, {
      ...options.chain,
      now: options.now
    });
  } catch (error) {
    if (error instanceof ChainProviderError) {
      // Provider outage: keep the previous eligibility state rather than
      // downgrading a paying holder on infrastructure noise.
      throw new WalletError(503, "wallet_chain_unavailable", "Chain data is temporarily unavailable.");
    }

    throw error;
  }

  const eligible = holdings.assetCount >= WEBOT_HOLDER_MIN_ASSET_COUNT;
  const updated = await repository.updateWalletHoldings({
    accountId,
    policyAssetCount: holdings.assetCount,
    holderEligible: eligible,
    lastAssetCheckAt: holdings.checkedAt
  });

  if (!updated) {
    throw new WalletError(404, "wallet_not_found", "No verified wallet is linked to this account.");
  }

  return {
    wallet: toSafeWallet(updated),
    downgraded: wallet.holderEligible && !eligible,
    upgraded: !wallet.holderEligible && eligible
  };
}

export async function disconnectWallet(
  context: AccountContext,
  options: WalletServiceOptions = {}
): Promise<boolean> {
  const repository = options.repository ?? getWalletRepository();
  return repository.deleteWalletByAccountId(context.account.id);
}

/**
 * True when the account has a verified wallet currently meeting the holder
 * threshold. Used to gate holder_unlimited entitlements.
 */
export async function isAccountHolderEligible(
  accountId: string,
  options: WalletServiceOptions = {}
): Promise<boolean> {
  const repository = options.repository ?? getWalletRepository();
  const wallet = await repository.getWalletByAccountId(accountId);
  return Boolean(wallet?.holderEligible);
}

/**
 * Downgrade policy enforcement point: holder_unlimited entitlement rows are
 * ignored while the account's wallet is missing or below the threshold.
 * Rows are never deleted, so access returns automatically when holdings
 * recover and a refresh runs.
 */
export async function filterWalletGatedEntitlements(
  rows: EntitlementRow[],
  accountId: string,
  options: WalletServiceOptions = {}
): Promise<EntitlementRow[]> {
  const hasHolderRow = rows.some((row) => row.entitlementCode === WEBOT_HOLDER_ENTITLEMENT_CODE);

  if (!hasHolderRow) {
    return rows;
  }

  const eligible = await isAccountHolderEligible(accountId, options);

  if (eligible) {
    return rows;
  }

  return rows.filter((row) => row.entitlementCode !== WEBOT_HOLDER_ENTITLEMENT_CODE);
}

export function hashChallengePayload(payload: string): string {
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

function normalizeOptionalPaymentAddress(value: unknown, network: CardanoNetwork): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  // Payment address is advisory metadata (display + future payment UX);
  // invalid values are dropped rather than failing verification.
  return isValidPaymentAddress(trimmed, network) ? trimmed : null;
}
