import { decodeBech32, encodeBech32 } from "./bech32";

export type CardanoNetwork = "mainnet" | "preprod" | "preview";

export type ParsedStakeAddress = {
  stakeAddress: string;
  networkId: 0 | 1;
  /** 28-byte stake credential hash (blake2b-224 of the stake verification key). */
  credentialHash: Uint8Array;
  /** Raw 29 address bytes (header + credential). */
  bytes: Uint8Array;
  isScriptCredential: boolean;
};

const MAX_ADDRESS_INPUT_LENGTH = 256;

export function networkIdForNetwork(network: CardanoNetwork): 0 | 1 {
  return network === "mainnet" ? 1 : 0;
}

export function expectedStakeHrp(network: CardanoNetwork): "stake" | "stake_test" {
  return network === "mainnet" ? "stake" : "stake_test";
}

/**
 * Validates and parses a bech32 stake (reward) address. Returns null for
 * anything that is not a checksum-valid, correctly sized reward address on
 * the expected network. Script-credential reward addresses parse but are
 * flagged so callers can reject them for signature-based ownership proof.
 */
export function parseStakeAddress(value: unknown, network: CardanoNetwork): ParsedStakeAddress | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0 || trimmed.length > MAX_ADDRESS_INPUT_LENGTH) {
    return null;
  }

  const decoded = decodeBech32(trimmed);

  if (!decoded || decoded.hrp !== expectedStakeHrp(network) || decoded.bytes.length !== 29) {
    return null;
  }

  const header = decoded.bytes[0];
  const addressType = header >> 4;
  const networkId = header & 0x0f;

  // Reward addresses: type 0b1110 (key hash) or 0b1111 (script hash).
  if (addressType !== 0x0e && addressType !== 0x0f) {
    return null;
  }

  if (networkId !== networkIdForNetwork(network)) {
    return null;
  }

  return {
    stakeAddress: trimmed.toLowerCase(),
    networkId: networkId as 0 | 1,
    credentialHash: decoded.bytes.slice(1),
    bytes: decoded.bytes,
    isScriptCredential: addressType === 0x0f
  };
}

/** Validates a bech32 payment (base/enterprise) address on the expected network. */
export function isValidPaymentAddress(value: unknown, network: CardanoNetwork): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0 || trimmed.length > MAX_ADDRESS_INPUT_LENGTH) {
    return false;
  }

  const decoded = decodeBech32(trimmed);
  const expectedHrp = network === "mainnet" ? "addr" : "addr_test";

  if (!decoded || decoded.hrp !== expectedHrp || decoded.bytes.length < 29) {
    return false;
  }

  const header = decoded.bytes[0];
  const addressType = header >> 4;
  const networkId = header & 0x0f;

  // Shelley payment address types are 0b0000-0b0111.
  return addressType <= 0x07 && networkId === networkIdForNetwork(network);
}

export type ParsedShelleyAddress = {
  /** Header type nibble (0x00-0x07 for payment addresses). */
  addressType: number;
  networkId: number;
  /** 28-byte payment credential hash. */
  paymentCredentialHash: Uint8Array;
  paymentIsKeyCredential: boolean;
  /** 28-byte stake credential hash for base addresses, null otherwise. */
  stakeCredentialHash: Uint8Array | null;
  stakeIsKeyCredential: boolean;
};

/**
 * Parses raw Shelley payment-address bytes into credentials. Used by the
 * hardware tx-proof path to bind a transaction's self-output address to the
 * claimed stake credential. Base addresses (types 0-3) carry both payment
 * and stake credentials; enterprise/pointer forms return no stake part.
 */
export function parseShelleyAddressBytes(bytes: Uint8Array): ParsedShelleyAddress | null {
  if (bytes.length < 29) {
    return null;
  }

  const header = bytes[0];
  const addressType = header >> 4;
  const networkId = header & 0x0f;

  // Payment address types are 0b0000-0b0111 (base/pointer/enterprise).
  if (addressType > 0x07) {
    return null;
  }

  const paymentIsKeyCredential = (addressType & 0x01) === 0;
  const paymentCredentialHash = bytes.slice(1, 29);

  // Base addresses (types 0-3) are exactly 57 bytes: header + two 28-byte
  // credential hashes. Types 0/1 embed a stake KEY hash, 2/3 a script hash.
  if (addressType <= 0x03) {
    if (bytes.length !== 57) {
      return null;
    }

    return {
      addressType,
      networkId,
      paymentCredentialHash,
      paymentIsKeyCredential,
      stakeCredentialHash: bytes.slice(29, 57),
      stakeIsKeyCredential: (addressType & 0x02) === 0
    };
  }

  return {
    addressType,
    networkId,
    paymentCredentialHash,
    paymentIsKeyCredential,
    stakeCredentialHash: null,
    stakeIsKeyCredential: false
  };
}

export function stakeAddressFromCredentialHash(credentialHash: Uint8Array, network: CardanoNetwork): string {
  if (credentialHash.length !== 28) {
    throw new Error("Stake credential hash must be 28 bytes.");
  }

  const header = 0xe0 | networkIdForNetwork(network);
  const bytes = new Uint8Array(29);
  bytes[0] = header;
  bytes.set(credentialHash, 1);
  return encodeBech32(expectedStakeHrp(network), bytes);
}

export function isValidTxHash(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

export function hexToBytes(value: unknown): Uint8Array | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().toLowerCase();

  if (trimmed.length === 0 || trimmed.length % 2 !== 0 || !/^[0-9a-f]+$/.test(trimmed)) {
    return null;
  }

  return Uint8Array.from(Buffer.from(trimmed, "hex"));
}
