/**
 * Edge-runtime variants of ids.ts. The canonical helpers in ids.ts use
 * Node's `crypto` module which isn't available in Vercel Edge. These
 * use the Web Crypto API instead.
 */

export function newIdEdge(): string {
  return globalThis.crypto.randomUUID();
}

/** Async SHA-256 of `salt:ip`, returned as lowercase hex. */
export async function hashIpEdge(ip: string): Promise<string> {
  const salt = process.env.IP_HASH_SALT ?? "dev-salt";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
