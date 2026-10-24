// CIP-8 / CIP-30 signData ownership verification.
//
// The wallet calls signData(rewardAddress, payloadHex) and returns a
// COSE_Sign1 signature plus a COSE_Key. Verification here is strictly
// server-side and requires ALL of:
//   1. structural COSE_Sign1 / COSE_Key validity (EdDSA alg, Ed25519 OKP key)
//   2. the signed payload to equal the server-issued challenge exactly
//   3. a valid Ed25519 signature over the COSE Sig_structure
//   4. the signed protected "address" header to equal the claimed stake
//      address bytes
//   5. blake2b-224(public key) to equal the stake credential hash inside the
//      claimed stake address (binds the signing key to the address; without
//      this, a signer could claim any address in its own signed headers)
//
// The idp-work reference (wallet_auth.php) covers 1-4; step 5 closes the
// remaining gap for key-hash reward addresses.

import { createPublicKey, verify as cryptoVerify, createHash } from "node:crypto";
import type { ParsedStakeAddress } from "./addresses";
import { hexToBytes } from "./addresses";
import { blake2b224 } from "./blake2b";
import {
  concatBytes,
  decodeCbor,
  encodeCborArrayHead,
  encodeCborBytes,
  encodeCborText,
  type CborMap,
  type CborValue
} from "./cbor";

const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
const COSE_ALG_EDDSA = -8;
const COSE_KEY_KTY_OKP = 1;
const COSE_KEY_CRV_ED25519 = 6;

export type Cip8VerificationErrorCode =
  | "invalid_encoding"
  | "invalid_cose_key"
  | "invalid_cose_sign1"
  | "payload_mismatch"
  | "address_mismatch"
  | "key_binding_failed"
  | "signature_invalid"
  | "script_credential_unsupported";

export type Cip8VerificationResult =
  | {
      ok: true;
      publicKeyHex: string;
      /** SHA-256 of the signed payload bytes, hex-encoded, for audit rows. */
      payloadSha256: string;
    }
  | {
      ok: false;
      error: Cip8VerificationErrorCode;
    };

export type Cip8VerificationInput = {
  /** Hex-encoded COSE_Sign1 from CIP-30 signData().signature */
  coseSign1Hex: unknown;
  /** Hex-encoded COSE_Key from CIP-30 signData().key */
  coseKeyHex: unknown;
  /** The exact challenge text the server issued. */
  expectedPayload: string;
  /** Parsed stake address the caller claims to own. */
  stakeAddress: ParsedStakeAddress;
};

export function verifyCip8StakeOwnership(input: Cip8VerificationInput): Cip8VerificationResult {
  const keyBytes = boundedHex(input.coseKeyHex, 2048);
  const sign1Bytes = boundedHex(input.coseSign1Hex, 8192);

  if (!keyBytes || !sign1Bytes) {
    return { ok: false, error: "invalid_encoding" };
  }

  if (input.stakeAddress.isScriptCredential) {
    return { ok: false, error: "script_credential_unsupported" };
  }

  let coseKey: CborValue;
  let coseSign1: CborValue;

  try {
    coseKey = decodeCbor(keyBytes);
    coseSign1 = decodeCbor(sign1Bytes);
  } catch {
    return { ok: false, error: "invalid_encoding" };
  }

  const publicKey = extractOkpPublicKey(coseKey);

  if (!publicKey) {
    return { ok: false, error: "invalid_cose_key" };
  }

  if (!Array.isArray(coseSign1) || coseSign1.length !== 4) {
    return { ok: false, error: "invalid_cose_sign1" };
  }

  const [protectedHeaderBytes, , payload, signature] = coseSign1;

  if (
    !(protectedHeaderBytes instanceof Uint8Array)
    || !(payload instanceof Uint8Array)
    || !(signature instanceof Uint8Array)
    || signature.length !== 64
  ) {
    return { ok: false, error: "invalid_cose_sign1" };
  }

  let protectedHeaders: CborMap;

  try {
    const decoded = decodeCbor(protectedHeaderBytes);

    if (!(decoded instanceof Map)) {
      return { ok: false, error: "invalid_cose_sign1" };
    }

    protectedHeaders = decoded;
  } catch {
    return { ok: false, error: "invalid_cose_sign1" };
  }

  const alg = protectedHeaders.get(1);

  if (alg !== COSE_ALG_EDDSA) {
    return { ok: false, error: "invalid_cose_sign1" };
  }

  const expectedPayloadBytes = new TextEncoder().encode(input.expectedPayload);

  if (!bytesEqual(payload, expectedPayloadBytes)) {
    return { ok: false, error: "payload_mismatch" };
  }

  const signedAddress = protectedHeaders.get("address");

  if (!(signedAddress instanceof Uint8Array) || !bytesEqual(signedAddress, input.stakeAddress.bytes)) {
    return { ok: false, error: "address_mismatch" };
  }

  // Bind the signing key to the claimed stake address: the address embeds
  // blake2b-224 of the stake verification key.
  if (!bytesEqual(blake2b224(publicKey), input.stakeAddress.credentialHash)) {
    return { ok: false, error: "key_binding_failed" };
  }

  const sigStructure = concatBytes(
    encodeCborArrayHead(4),
    encodeCborText("Signature1"),
    encodeCborBytes(protectedHeaderBytes),
    encodeCborBytes(new Uint8Array(0)),
    encodeCborBytes(payload)
  );

  if (!verifyEd25519Signature(signature, sigStructure, publicKey)) {
    return { ok: false, error: "signature_invalid" };
  }

  return {
    ok: true,
    publicKeyHex: Buffer.from(publicKey).toString("hex"),
    payloadSha256: createHash("sha256").update(payload).digest("hex")
  };
}

function extractOkpPublicKey(coseKey: CborValue): Uint8Array | null {
  if (!(coseKey instanceof Map)) {
    return null;
  }

  const kty = coseKey.get(1);
  const crv = coseKey.get(-1);
  const x = coseKey.get(-2);

  if (kty !== COSE_KEY_KTY_OKP || crv !== COSE_KEY_CRV_ED25519) {
    return null;
  }

  if (!(x instanceof Uint8Array) || x.length !== 32) {
    return null;
  }

  return x;
}

/** Raw Ed25519 verification (shared by the CIP-8 and tx-proof paths). */
export function verifyEd25519Signature(
  signature: Uint8Array,
  message: Uint8Array,
  publicKeyRaw: Uint8Array
): boolean {
  try {
    const key = createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(publicKeyRaw)]),
      format: "der",
      type: "spki"
    });

    return cryptoVerify(null, Buffer.from(message), key, Buffer.from(signature));
  } catch {
    return false;
  }
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

function boundedHex(value: unknown, maxChars: number): Uint8Array | null {
  if (typeof value !== "string" || value.length > maxChars) {
    return null;
  }

  return hexToBytes(value);
}
