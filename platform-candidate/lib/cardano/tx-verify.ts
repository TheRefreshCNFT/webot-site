// Server-side verification for the hardware-wallet tx-proof path.
//
// The client submits the exact bytes of an UNSIGNED self-transaction body,
// its auxiliary data, and the witness set returned by CIP-30 signTx. The
// transaction is NEVER submitted to the chain; ownership is proven when ALL
// of the following hold:
//   1. the body is a minimal self-send: exactly one input, one output, only
//      body fields {inputs, outputs, fee, ttl, aux_data_hash} — nothing that
//      could carry side effects (no certificates, withdrawals, mint, ...)
//   2. the body's aux_data_hash equals blake2b-256 of the submitted
//      auxiliary data, and that auxiliary data carries the exact outstanding
//      server challenge as CIP-20 label-674 message metadata
//   3. the output address is a base address on the right network whose
//      stake credential equals the claimed stake address (key credential)
//   4. a vkey witness signature is valid over blake2b-256 of the exact body
//      bytes (the Cardano transaction id)
//   5. blake2b-224 of that witness public key equals the output's payment
//      credential OR the claimed stake credential — hardware wallets sign
//      with payment keys, so payment-key witnesses are accepted; the stake
//      binding comes from the self-output address (rule 3)
//
// Challenge single-use/TTL semantics are identical to the signData path and
// enforced by the caller in lib/cardano/index.ts.

import { createHash } from "node:crypto";
import { parseShelleyAddressBytes, type ParsedStakeAddress } from "./addresses";
import { blake2b, blake2b224 } from "./blake2b";
import { decodeCbor, splitCborArrayRaw, type CborMap, type CborValue } from "./cbor";
import { verifyEd25519Signature } from "./cip8";

const ALLOWED_BODY_KEYS = new Set([0, 1, 2, 3, 7]);
const MAX_BODY_HEX_CHARS = 65536;
const MAX_AUX_HEX_CHARS = 16384;
const MAX_WITNESS_HEX_CHARS = 16384;
const MAX_WITNESSES = 5;
const PROOF_METADATA_LABEL = 674;

export type TxProofVerificationErrorCode =
  | "invalid_encoding"
  | "invalid_tx_body"
  | "unsupported_tx_field"
  | "invalid_output"
  | "address_binding_failed"
  | "aux_data_missing"
  | "aux_hash_mismatch"
  | "challenge_mismatch"
  | "invalid_witness_set"
  | "key_binding_failed"
  | "signature_invalid";

export type TxProofVerificationResult =
  | {
      ok: true;
      publicKeyHex: string;
      /** SHA-256 of the challenge text, hex — same audit semantic as CIP-8. */
      payloadSha256: string;
      /** blake2b-256 of the body bytes (the would-be transaction id). */
      txBodyHashHex: string;
      boundVia: "payment_key" | "stake_key";
    }
  | {
      ok: false;
      error: TxProofVerificationErrorCode;
    };

export type TxProofVerificationInput = {
  /** Hex of the exact transaction body bytes. */
  txBodyHex: unknown;
  /** Hex of the auxiliary data bytes referenced by the body. */
  auxDataHex: unknown;
  /** Hex of the CIP-30 signTx result (witness set, or a full signed tx). */
  witnessSetHex: unknown;
  /** The exact challenge text the server issued. */
  expectedPayload: string;
  /** Parsed stake address the caller claims to own. */
  stakeAddress: ParsedStakeAddress;
};

export function verifyTxChallengeOwnership(input: TxProofVerificationInput): TxProofVerificationResult {
  const bodyBytes = boundedHexBytes(input.txBodyHex, MAX_BODY_HEX_CHARS);
  const auxBytes = boundedHexBytes(input.auxDataHex, MAX_AUX_HEX_CHARS);
  const witnessBytes = boundedHexBytes(input.witnessSetHex, MAX_WITNESS_HEX_CHARS);

  if (!bodyBytes || !auxBytes || !witnessBytes) {
    return { ok: false, error: "invalid_encoding" };
  }

  if (input.stakeAddress.isScriptCredential) {
    return { ok: false, error: "address_binding_failed" };
  }

  // --- 1. body structure -------------------------------------------------
  let body: CborValue;

  try {
    body = decodeCbor(bodyBytes);
  } catch {
    return { ok: false, error: "invalid_encoding" };
  }

  if (!(body instanceof Map)) {
    return { ok: false, error: "invalid_tx_body" };
  }

  for (const key of body.keys()) {
    if (typeof key !== "number" || !ALLOWED_BODY_KEYS.has(key)) {
      return { ok: false, error: "unsupported_tx_field" };
    }
  }

  const inputs = body.get(0);
  const outputs = body.get(1);
  const fee = body.get(2);
  const auxHash = body.get(7);

  if (!Array.isArray(inputs) || inputs.length !== 1 || !isTransactionInput(inputs[0])) {
    return { ok: false, error: "invalid_tx_body" };
  }

  if (typeof fee !== "number" && typeof fee !== "bigint") {
    return { ok: false, error: "invalid_tx_body" };
  }

  // --- 2. auxiliary data carries the exact challenge ---------------------
  if (!(auxHash instanceof Uint8Array) || auxHash.length !== 32) {
    return { ok: false, error: "aux_data_missing" };
  }

  if (!bytesEqual(blake2b(auxBytes, 32), auxHash)) {
    return { ok: false, error: "aux_hash_mismatch" };
  }

  const challengeText = extractMessageMetadata(auxBytes);

  if (challengeText === null) {
    return { ok: false, error: "aux_data_missing" };
  }

  if (challengeText !== input.expectedPayload) {
    return { ok: false, error: "challenge_mismatch" };
  }

  // --- 3. self-output binds the claimed stake credential -----------------
  if (!Array.isArray(outputs) || outputs.length !== 1) {
    return { ok: false, error: "invalid_output" };
  }

  const output = outputs[0];
  let outputAddress: CborValue | undefined;

  if (Array.isArray(output) && output.length === 2) {
    [outputAddress] = output;
  } else if (output instanceof Map) {
    outputAddress = output.get(0);
  }

  if (!(outputAddress instanceof Uint8Array)) {
    return { ok: false, error: "invalid_output" };
  }

  const parsedAddress = parseShelleyAddressBytes(outputAddress);

  if (
    !parsedAddress
    || parsedAddress.networkId !== input.stakeAddress.networkId
    || !parsedAddress.stakeIsKeyCredential
    || !parsedAddress.stakeCredentialHash
    || !bytesEqual(parsedAddress.stakeCredentialHash, input.stakeAddress.credentialHash)
  ) {
    return { ok: false, error: "address_binding_failed" };
  }

  // --- 4 + 5. witness signature over the body hash, key bound ------------
  const witnesses = extractVkeyWitnesses(witnessBytes);

  if (!witnesses) {
    return { ok: false, error: "invalid_witness_set" };
  }

  const txBodyHash = blake2b(bodyBytes, 32);
  let sawBoundKey = false;

  for (const witness of witnesses) {
    const keyHash = blake2b224(witness.publicKey);
    const boundVia = parsedAddress.paymentIsKeyCredential
      && bytesEqual(keyHash, parsedAddress.paymentCredentialHash)
      ? "payment_key" as const
      : bytesEqual(keyHash, input.stakeAddress.credentialHash)
        ? "stake_key" as const
        : null;

    if (!boundVia) {
      continue;
    }

    sawBoundKey = true;

    if (verifyEd25519Signature(witness.signature, txBodyHash, witness.publicKey)) {
      return {
        ok: true,
        publicKeyHex: toHex(witness.publicKey),
        payloadSha256: createHash("sha256").update(input.expectedPayload, "utf8").digest("hex"),
        txBodyHashHex: toHex(txBodyHash),
        boundVia
      };
    }
  }

  return { ok: false, error: sawBoundKey ? "signature_invalid" : "key_binding_failed" };
}

/** transaction_input = [bytes32 tx_id, uint index] */
function isTransactionInput(value: CborValue): boolean {
  return (
    Array.isArray(value)
    && value.length === 2
    && value[0] instanceof Uint8Array
    && value[0].length === 32
    && typeof value[1] === "number"
    && Number.isInteger(value[1])
    && value[1] >= 0
  );
}

/**
 * Reads CIP-20 message metadata (label 674 "msg" chunks) out of auxiliary
 * data. Accepts the alonzo tag-259 wrapper {0: metadata}, plain shelley
 * metadata maps, and shelley-ma [metadata, scripts] arrays. Returns the
 * joined message text or null.
 */
function extractMessageMetadata(auxBytes: Uint8Array): string | null {
  let aux: CborValue;

  try {
    aux = decodeCbor(auxBytes);
  } catch {
    return null;
  }

  let metadata: CborMap | null = null;

  if (aux instanceof Map) {
    const wrapped = aux.get(0);
    metadata = aux.has(PROOF_METADATA_LABEL)
      ? aux
      : wrapped instanceof Map
        ? wrapped
        : null;
  } else if (Array.isArray(aux) && aux[0] instanceof Map) {
    metadata = aux[0];
  }

  if (!metadata) {
    return null;
  }

  const label = metadata.get(PROOF_METADATA_LABEL);

  if (!(label instanceof Map)) {
    return null;
  }

  const message = label.get("msg");

  if (!Array.isArray(message) || message.length === 0) {
    return null;
  }

  let joined = "";

  for (const chunk of message) {
    if (typeof chunk !== "string") {
      return null;
    }

    joined += chunk;
  }

  return joined;
}

type VkeyWitness = { publicKey: Uint8Array; signature: Uint8Array };

/**
 * Extracts vkey witnesses from a CIP-30 signTx result. Spec-compliant
 * wallets return a transaction_witness_set map; some return the full signed
 * transaction instead — in that case the witness set is element 1.
 */
function extractVkeyWitnesses(witnessBytes: Uint8Array): VkeyWitness[] | null {
  let decoded: CborValue;

  try {
    decoded = decodeCbor(witnessBytes);
  } catch {
    return null;
  }

  let witnessSet: CborValue = decoded;

  if (Array.isArray(decoded) && decoded.length >= 2 && decoded[1] instanceof Map) {
    witnessSet = decoded[1];
  }

  if (!(witnessSet instanceof Map)) {
    return null;
  }

  const vkeyWitnesses = witnessSet.get(0);

  if (!Array.isArray(vkeyWitnesses) || vkeyWitnesses.length === 0 || vkeyWitnesses.length > MAX_WITNESSES) {
    return null;
  }

  const witnesses: VkeyWitness[] = [];

  for (const entry of vkeyWitnesses) {
    if (
      !Array.isArray(entry)
      || entry.length !== 2
      || !(entry[0] instanceof Uint8Array)
      || entry[0].length !== 32
      || !(entry[1] instanceof Uint8Array)
      || entry[1].length !== 64
    ) {
      return null;
    }

    witnesses.push({ publicKey: entry[0], signature: entry[1] });
  }

  return witnesses;
}

export function splitSignedTransaction(txBytes: Uint8Array): {
  bodyBytes: Uint8Array;
  witnessSetBytes: Uint8Array;
  auxDataBytes: Uint8Array | null;
} | null {
  let slices: Uint8Array[];

  try {
    slices = splitCborArrayRaw(txBytes);
  } catch {
    return null;
  }

  if (slices.length < 2) {
    return null;
  }

  const auxSlice = slices.length >= 4 ? slices[3] : null;

  return {
    bodyBytes: slices[0],
    witnessSetBytes: slices[1],
    auxDataBytes: auxSlice && !(auxSlice.length === 1 && auxSlice[0] === 0xf6) ? auxSlice : null
  };
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i] ^ right[i];
  }

  return diff === 0;
}

function toHex(bytes: Uint8Array): string {
  let out = "";

  for (const byte of bytes) {
    out += byte.toString(16).padStart(2, "0");
  }

  return out;
}

function boundedHexBytes(value: unknown, maxChars: number): Uint8Array | null {
  if (typeof value !== "string" || value.length === 0 || value.length > maxChars) {
    return null;
  }

  const clean = value.trim().toLowerCase();

  if (clean.length % 2 !== 0 || !/^[0-9a-f]+$/.test(clean)) {
    return null;
  }

  const out = new Uint8Array(clean.length / 2);

  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }

  return out;
}
