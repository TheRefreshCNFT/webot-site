import { randomUUID } from "node:crypto";
import { WEBOT_WALLET_CHALLENGE_TTL_SECONDS } from "../../config/cardano";

export type WalletChallenge = {
  nonce: string;
  challenge: string;
  expiresAt: string;
};

/**
 * Builds the exact text a wallet must sign to prove stake-key ownership.
 * The text embeds the account id, stake address, a single-use nonce, and an
 * issue timestamp so a signature can never be replayed for another account,
 * wallet, or session.
 */
export function buildWalletChallenge(input: {
  accountId: string;
  stakeAddress: string;
  now?: Date;
  nonce?: string;
}): WalletChallenge {
  const issuedAt = input.now ?? new Date();
  const nonce = input.nonce ?? randomUUID();
  const expiresAt = new Date(issuedAt.getTime() + WEBOT_WALLET_CHALLENGE_TTL_SECONDS * 1000).toISOString();

  const challenge = [
    "webot.studio wallet ownership proof",
    `account: ${input.accountId}`,
    `stake: ${input.stakeAddress}`,
    `nonce: ${nonce}`,
    `issued: ${issuedAt.toISOString()}`,
    "This signature only links this wallet to this WeBot account.",
    "It never authorizes spending."
  ].join("\n");

  return { nonce, challenge, expiresAt };
}
