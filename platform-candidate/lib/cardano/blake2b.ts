// Minimal pure-TypeScript BLAKE2b (RFC 7693), unkeyed, used for the
// blake2b-224 key-hash binding between an Ed25519 public key and a Cardano
// stake address credential. Node's OpenSSL build only exposes blake2b512,
// so the 28-byte digest is implemented here. Vector-tested against Python
// hashlib.blake2b(digest_size=28).

const IV = new BigUint64Array([
  0x6a09e667f3bcc908n,
  0xbb67ae8584caa73bn,
  0x3c6ef372fe94f82bn,
  0xa54ff53a5f1d36f1n,
  0x510e527fade682d1n,
  0x9b05688c2b3e6c1fn,
  0x1f83d9abfb41bd6bn,
  0x5be0cd19137e2179n
]);

const SIGMA = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
  [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
  [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
  [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
  [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
  [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
  [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
  [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
  [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3]
] as const;

const MASK64 = (1n << 64n) - 1n;

function rotr64(value: bigint, bits: bigint): bigint {
  return ((value >> bits) | (value << (64n - bits))) & MASK64;
}

function readLe64(block: Uint8Array, offset: number): bigint {
  let value = 0n;

  for (let i = 7; i >= 0; i -= 1) {
    value = (value << 8n) | BigInt(block[offset + i]);
  }

  return value;
}

function compress(h: BigUint64Array, block: Uint8Array, counter: bigint, isFinal: boolean): void {
  const v = new BigUint64Array(16);
  const m = new BigUint64Array(16);

  for (let i = 0; i < 8; i += 1) {
    v[i] = h[i];
    v[i + 8] = IV[i];
  }

  v[12] ^= counter & MASK64;
  v[13] ^= (counter >> 64n) & MASK64;

  if (isFinal) {
    v[14] ^= MASK64;
  }

  for (let i = 0; i < 16; i += 1) {
    m[i] = readLe64(block, i * 8);
  }

  const mix = (a: number, b: number, c: number, d: number, x: bigint, y: bigint): void => {
    v[a] = (v[a] + v[b] + x) & MASK64;
    v[d] = rotr64(v[d] ^ v[a], 32n);
    v[c] = (v[c] + v[d]) & MASK64;
    v[b] = rotr64(v[b] ^ v[c], 24n);
    v[a] = (v[a] + v[b] + y) & MASK64;
    v[d] = rotr64(v[d] ^ v[a], 16n);
    v[c] = (v[c] + v[d]) & MASK64;
    v[b] = rotr64(v[b] ^ v[c], 63n);
  };

  for (let round = 0; round < 12; round += 1) {
    const s = SIGMA[round];
    mix(0, 4, 8, 12, m[s[0]], m[s[1]]);
    mix(1, 5, 9, 13, m[s[2]], m[s[3]]);
    mix(2, 6, 10, 14, m[s[4]], m[s[5]]);
    mix(3, 7, 11, 15, m[s[6]], m[s[7]]);
    mix(0, 5, 10, 15, m[s[8]], m[s[9]]);
    mix(1, 6, 11, 12, m[s[10]], m[s[11]]);
    mix(2, 7, 8, 13, m[s[12]], m[s[13]]);
    mix(3, 4, 9, 14, m[s[14]], m[s[15]]);
  }

  for (let i = 0; i < 8; i += 1) {
    h[i] ^= v[i] ^ v[i + 8];
  }
}

export function blake2b(message: Uint8Array, digestLength: number): Uint8Array {
  if (!Number.isInteger(digestLength) || digestLength < 1 || digestLength > 64) {
    throw new Error("blake2b digest length must be between 1 and 64 bytes");
  }

  const h = new BigUint64Array(IV);
  h[0] ^= 0x01010000n ^ BigInt(digestLength);

  const blockCount = Math.max(1, Math.ceil(message.length / 128));

  for (let block = 0; block < blockCount; block += 1) {
    const start = block * 128;
    const isFinal = block === blockCount - 1;
    const chunk = new Uint8Array(128);
    chunk.set(message.subarray(start, Math.min(start + 128, message.length)));
    const counter = BigInt(isFinal ? message.length : start + 128);
    compress(h, chunk, counter, isFinal);
  }

  const out = new Uint8Array(digestLength);

  for (let i = 0; i < digestLength; i += 1) {
    out[i] = Number((h[i >> 3] >> BigInt(8 * (i & 7))) & 0xffn);
  }

  return out;
}

export function blake2b224(message: Uint8Array): Uint8Array {
  return blake2b(message, 28);
}
