// Minimal bech32 decode/encode (BIP-173 charset, no length cap so long
// Cardano addresses are accepted). Modeled on the verified decoder used by
// the idp-work wallet gate; checksum failures reject.

const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function polymod(values: number[]): number {
  let chk = 1;

  for (const value of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ value;

    for (let i = 0; i < 5; i += 1) {
      if ((top >> i) & 1) {
        chk ^= GENERATOR[i];
      }
    }
  }

  return chk;
}

function hrpExpand(hrp: string): number[] {
  const out: number[] = [];

  for (const char of hrp) {
    out.push(char.charCodeAt(0) >> 5);
  }

  out.push(0);

  for (const char of hrp) {
    out.push(char.charCodeAt(0) & 31);
  }

  return out;
}

function convertBits(data: number[], fromBits: number, toBits: number, pad: boolean): number[] | null {
  let acc = 0;
  let bits = 0;
  const out: number[] = [];
  const maxValue = (1 << toBits) - 1;

  for (const value of data) {
    if (value < 0 || value >> fromBits !== 0) {
      return null;
    }

    acc = (acc << fromBits) | value;
    bits += fromBits;

    while (bits >= toBits) {
      bits -= toBits;
      out.push((acc >> bits) & maxValue);
    }
  }

  if (pad) {
    if (bits > 0) {
      out.push((acc << (toBits - bits)) & maxValue);
    }
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxValue) !== 0) {
    return null;
  }

  return out;
}

export type Bech32Decoded = {
  hrp: string;
  bytes: Uint8Array;
};

export function decodeBech32(value: string): Bech32Decoded | null {
  if (typeof value !== "string" || value.length < 8 || value.length > 256) {
    return null;
  }

  const lower = value.toLowerCase();

  if (lower !== value && value.toUpperCase() !== value) {
    return null;
  }

  const separator = lower.lastIndexOf("1");

  if (separator < 1 || separator + 7 > lower.length) {
    return null;
  }

  const hrp = lower.slice(0, separator);
  const data: number[] = [];

  for (const char of lower.slice(separator + 1)) {
    const index = CHARSET.indexOf(char);

    if (index < 0) {
      return null;
    }

    data.push(index);
  }

  if (polymod([...hrpExpand(hrp), ...data]) !== 1) {
    return null;
  }

  const bytes = convertBits(data.slice(0, -6), 5, 8, false);

  if (!bytes) {
    return null;
  }

  return { hrp, bytes: Uint8Array.from(bytes) };
}

export function encodeBech32(hrp: string, bytes: Uint8Array): string {
  const data = convertBits(Array.from(bytes), 8, 5, true);

  if (!data) {
    throw new Error("bech32 payload conversion failed");
  }

  const values = [...hrpExpand(hrp), ...data];
  const checksumSource = [...values, 0, 0, 0, 0, 0, 0];
  const mod = polymod(checksumSource) ^ 1;
  const checksum: number[] = [];

  for (let i = 0; i < 6; i += 1) {
    checksum.push((mod >> (5 * (5 - i))) & 31);
  }

  return `${hrp}1${[...data, ...checksum].map((value) => CHARSET[value]).join("")}`;
}
