// Minimal CBOR reader/writer covering the subset used by COSE_Sign1 and
// COSE_Key payloads from CIP-30 signData (unsigned/negative integers, byte
// and text strings, definite arrays and maps, simple values, and tags) plus
// the Cardano transaction structures used by the hardware-wallet tx-proof
// path (byte-string map keys for multiasset bundles, canonical uint/map/tag
// encoding, raw top-level array slicing so exact body bytes can be hashed).
// Ported from the verified decoder pattern in idp-work/wallet_auth.php.

export type CborValue =
  | number
  | bigint
  | string
  | boolean
  | null
  | Uint8Array
  | CborValue[]
  | CborMap;

/**
 * Byte-string map keys (Cardano multiasset policy ids / asset names) are
 * stored as hex strings with this prefix so they stay usable as Map keys.
 */
export const CBOR_BYTES_KEY_PREFIX = "bytes:";

export type CborMap = Map<number | string, CborValue>;

function toHex(bytes: Uint8Array): string {
  let out = "";

  for (const byte of bytes) {
    out += byte.toString(16).padStart(2, "0");
  }

  return out;
}

class CborReader {
  private offset = 0;

  constructor(private readonly data: Uint8Array) {}

  get finished(): boolean {
    return this.offset >= this.data.length;
  }

  readItem(depth = 0): CborValue {
    if (depth > 16) {
      throw new Error("CBOR nesting too deep");
    }

    const initial = this.readByte();
    const major = initial >> 5;
    const additional = initial & 0x1f;

    switch (major) {
      case 0:
        return this.coerceInteger(this.readLength(additional));
      case 1: {
        const magnitude = this.readLength(additional);
        return this.coerceInteger(-1n - magnitude);
      }
      case 2:
        return this.readBytes(this.requireSize(this.readLength(additional)));
      case 3:
        return new TextDecoder("utf-8", { fatal: true }).decode(
          this.readBytes(this.requireSize(this.readLength(additional)))
        );
      case 4: {
        const length = this.requireSize(this.readLength(additional));
        const items: CborValue[] = [];

        for (let i = 0; i < length; i += 1) {
          items.push(this.readItem(depth + 1));
        }

        return items;
      }
      case 5: {
        const length = this.requireSize(this.readLength(additional));
        const map: CborMap = new Map();

        for (let i = 0; i < length; i += 1) {
          const rawKey = this.readItem(depth + 1);
          const key = rawKey instanceof Uint8Array
            ? CBOR_BYTES_KEY_PREFIX + toHex(rawKey)
            : rawKey;

          if (typeof key !== "number" && typeof key !== "string") {
            throw new Error("CBOR map keys must be integers, text, or bytes");
          }

          map.set(key, this.readItem(depth + 1));
        }

        return map;
      }
      case 6:
        this.readLength(additional);
        return this.readItem(depth + 1);
      case 7:
        if (additional === 20) return false;
        if (additional === 21) return true;
        if (additional === 22 || additional === 23) return null;
        throw new Error("Unsupported CBOR simple value");
      default:
        throw new Error("Unsupported CBOR major type");
    }
  }

  private coerceInteger(value: bigint): number | bigint {
    if (value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER)) {
      return Number(value);
    }

    return value;
  }

  private requireSize(value: bigint): number {
    if (value < 0n || value > BigInt(this.data.length)) {
      throw new Error("CBOR length exceeds input");
    }

    return Number(value);
  }

  private readLength(additional: number): bigint {
    if (additional < 24) {
      return BigInt(additional);
    }

    if (additional === 24) {
      return BigInt(this.readByte());
    }

    if (additional === 25) {
      return (BigInt(this.readByte()) << 8n) | BigInt(this.readByte());
    }

    if (additional === 26) {
      let value = 0n;

      for (let i = 0; i < 4; i += 1) {
        value = (value << 8n) | BigInt(this.readByte());
      }

      return value;
    }

    if (additional === 27) {
      let value = 0n;

      for (let i = 0; i < 8; i += 1) {
        value = (value << 8n) | BigInt(this.readByte());
      }

      return value;
    }

    throw new Error("Unsupported CBOR length encoding");
  }

  private readByte(): number {
    if (this.offset >= this.data.length) {
      throw new Error("CBOR input truncated");
    }

    const byte = this.data[this.offset];
    this.offset += 1;
    return byte;
  }

  private readBytes(length: number): Uint8Array {
    if (this.offset + length > this.data.length) {
      throw new Error("CBOR input truncated");
    }

    const bytes = this.data.slice(this.offset, this.offset + length);
    this.offset += length;
    return bytes;
  }
}

export function decodeCbor(data: Uint8Array): CborValue {
  const reader = new CborReader(data);
  const value = reader.readItem();

  if (!reader.finished) {
    throw new Error("CBOR input has trailing bytes");
  }

  return value;
}

/**
 * Splits a definite-length top-level CBOR array into the RAW byte slices of
 * its elements. Cardano's transaction id is blake2b-256 over the exact body
 * bytes as serialized inside `[body, witness_set, valid, aux]`, so byte-true
 * slicing (never re-encoding) is required for hashing and verification.
 */
export function splitCborArrayRaw(data: Uint8Array): Uint8Array[] {
  const initial = data[0];

  if (initial === undefined || initial >> 5 !== 4) {
    throw new Error("CBOR input is not an array");
  }

  const additional = initial & 0x1f;
  let offset = 1;
  let length: number;

  if (additional < 24) {
    length = additional;
  } else if (additional === 24) {
    length = data[1];
    offset = 2;
  } else {
    throw new Error("Unsupported CBOR array head");
  }

  const slices: Uint8Array[] = [];

  for (let i = 0; i < length; i += 1) {
    const end = measureCborItem(data, offset, 0);
    slices.push(data.slice(offset, end));
    offset = end;
  }

  if (offset !== data.length) {
    throw new Error("CBOR input has trailing bytes");
  }

  return slices;
}

/** Returns the end offset (exclusive) of the CBOR item starting at `offset`. */
function measureCborItem(data: Uint8Array, offset: number, depth: number): number {
  if (depth > 32) {
    throw new Error("CBOR nesting too deep");
  }

  if (offset >= data.length) {
    throw new Error("CBOR input truncated");
  }

  const initial = data[offset];
  const major = initial >> 5;
  const additional = initial & 0x1f;
  let cursor = offset + 1;
  let length = 0n;

  if (additional < 24) {
    length = BigInt(additional);
  } else if (additional >= 24 && additional <= 27) {
    const width = 1 << (additional - 24);

    if (cursor + width > data.length) {
      throw new Error("CBOR input truncated");
    }

    for (let i = 0; i < width; i += 1) {
      length = (length << 8n) | BigInt(data[cursor + i]);
    }

    cursor += width;
  } else {
    throw new Error("Unsupported CBOR length encoding");
  }

  if (major === 0 || major === 1 || major === 7) {
    return cursor;
  }

  if (major === 2 || major === 3) {
    if (length > BigInt(data.length)) {
      throw new Error("CBOR length exceeds input");
    }

    return cursor + Number(length);
  }

  if (major === 6) {
    return measureCborItem(data, cursor, depth + 1);
  }

  if (major === 4 || major === 5) {
    const items = major === 5 ? 2n * length : length;

    if (items > BigInt(data.length)) {
      throw new Error("CBOR length exceeds input");
    }

    for (let i = 0n; i < items; i += 1n) {
      cursor = measureCborItem(data, cursor, depth + 1);
    }

    return cursor;
  }

  throw new Error("Unsupported CBOR major type");
}

function encodeHead(major: number, length: number): Uint8Array {
  if (length < 24) {
    return Uint8Array.of((major << 5) | length);
  }

  if (length <= 0xff) {
    return Uint8Array.of((major << 5) | 24, length);
  }

  if (length <= 0xffff) {
    return Uint8Array.of((major << 5) | 25, length >> 8, length & 0xff);
  }

  return Uint8Array.of(
    (major << 5) | 26,
    (length >>> 24) & 0xff,
    (length >>> 16) & 0xff,
    (length >>> 8) & 0xff,
    length & 0xff
  );
}

export function encodeCborBytes(bytes: Uint8Array): Uint8Array {
  return concatBytes(encodeHead(2, bytes.length), bytes);
}

export function encodeCborText(text: string): Uint8Array {
  const raw = new TextEncoder().encode(text);
  return concatBytes(encodeHead(3, raw.length), raw);
}

export function encodeCborArrayHead(length: number): Uint8Array {
  return encodeHead(4, length);
}

export function encodeCborMapHead(size: number): Uint8Array {
  return encodeHead(5, size);
}

/** Canonical (minimal-length) unsigned integer encoding, up to 64 bits. */
export function encodeCborUint(value: number | bigint): Uint8Array {
  const big = typeof value === "bigint" ? value : BigInt(Math.trunc(value));

  if (big < 0n || big > 0xffffffffffffffffn) {
    throw new Error("CBOR uint out of range");
  }

  if (big < 24n) {
    return Uint8Array.of(Number(big));
  }

  if (big <= 0xffn) {
    return Uint8Array.of(0x18, Number(big));
  }

  if (big <= 0xffffn) {
    return Uint8Array.of(0x19, Number(big >> 8n), Number(big & 0xffn));
  }

  if (big <= 0xffffffffn) {
    return Uint8Array.of(
      0x1a,
      Number((big >> 24n) & 0xffn),
      Number((big >> 16n) & 0xffn),
      Number((big >> 8n) & 0xffn),
      Number(big & 0xffn)
    );
  }

  const out = new Uint8Array(9);
  out[0] = 0x1b;

  for (let i = 0; i < 8; i += 1) {
    out[8 - i] = Number((big >> BigInt(8 * i)) & 0xffn);
  }

  return out;
}

export function encodeCborTagHead(tag: number): Uint8Array {
  return encodeHead(6, tag);
}

export const CBOR_TRUE = Uint8Array.of(0xf5);
export const CBOR_NULL = Uint8Array.of(0xf6);

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;

  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }

  return out;
}
