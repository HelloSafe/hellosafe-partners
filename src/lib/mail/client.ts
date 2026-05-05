import "server-only";
import { Resend } from "resend";

/**
 * Lazy Resend client. Returns null when RESEND_API_KEY is missing so the
 * app boots in dev / on PRs without a real Resend account. The send.ts
 * helper logs a warning and skips sending in that case.
 */

let cached: Resend | null | undefined = undefined;

export function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    cached = null;
    return null;
  }
  cached = new Resend(key);
  return cached;
}

/**
 * Default From address. Override via MAIL_FROM env var (must be a verified
 * domain in Resend, otherwise messages are rejected).
 */
export const MAIL_FROM =
  process.env.MAIL_FROM ?? "HelloSafe Partners <noreply@partners.hellosafe.com>";
