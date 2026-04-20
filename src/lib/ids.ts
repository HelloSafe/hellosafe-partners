import { randomBytes, randomUUID, createHash } from "crypto";

export function newId(): string {
  return randomUUID();
}

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no 0/o/1/l to reduce confusion

export function newShortCode(length = 8): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function newPartnerCode(): string {
  return "hs-" + newShortCode(6);
}

export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "dev-salt";
  return createHash("sha256").update(salt + ":" + ip).digest("hex");
}
