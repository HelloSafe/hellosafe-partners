/**
 * Pure helpers for deriving a partner's display identity from an auth user.
 *
 * Deliberately free of "server-only" / DB imports so it can be unit-tested in
 * the node test environment and shared by both the Better Auth `user.create`
 * hook and the email/password signup route.
 */

export type AuthUserLike = {
  name?: string | null;
  email: string;
};

/**
 * Best-effort display identity for a partner provisioned from an auth user.
 *
 * Google hands us a real `name`; email/password signups overwrite
 * `companyName` with the real company via the signup form afterwards. The
 * email local-part is the last-resort fallback so a freshly created row is
 * never blank (companyName is NOT NULL).
 */
export function derivePartnerIdentity(user: AuthUserLike): {
  companyName: string;
  contactName: string;
} {
  const name = user.name?.trim();
  const local = user.email.split("@")[0]?.trim();
  const display = name && name.length > 0 ? name : local || "Partenaire";
  return { companyName: display, contactName: display };
}
