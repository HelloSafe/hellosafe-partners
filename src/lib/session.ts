import "server-only";
import { headers as nextHeaders } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { partners, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { User, Partner } from "@/db/schema";

/**
 * Thin app-level session façade that wraps Better Auth.
 *
 * Better Auth owns: cookies, session lifetime, hashing, OAuth, password reset.
 * We own: the app's "partner approval" + "admin role" gates.
 */

export type SessionContext = {
  user: User;
  partner: Partner | null;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const h = await nextHeaders();
  const session = await auth.api.getSession({ headers: h });
  if (!session) return null;

  // We need the full DB user (Better Auth's session.user is shaped by its
  // own returned schema; we want the row including app-specific columns).
  const rows = await db
    .select({ user: users, partner: partners })
    .from(users)
    .leftJoin(partners, eq(partners.userId, users.id))
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!rows.length) return null;
  return { user: rows[0].user, partner: rows[0].partner };
}

export async function requireApprovedPartner(): Promise<
  SessionContext & { partner: Partner }
> {
  const ctx = await getSessionContext();
  if (!ctx) throw new AuthError("UNAUTHENTICATED");
  if (!ctx.partner) throw new AuthError("NO_PARTNER");
  if (ctx.partner.status !== "approved") {
    throw new AuthError("PARTNER_NOT_APPROVED");
  }
  return { ...ctx, partner: ctx.partner };
}

export async function requireAdmin(): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) throw new AuthError("UNAUTHENTICATED");
  if (ctx.user.role !== "admin") throw new AuthError("NOT_ADMIN");
  return ctx;
}

export class AuthError extends Error {
  constructor(public code: string) {
    super(code);
  }
}
