import "server-only";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, partners } from "@/db/schema";
import { newId, newSessionToken } from "./ids";
import type { User, Partner } from "@/db/schema";

const COOKIE_NAME = "hsp_session";
const SESSION_TTL_DAYS = 30;

export async function createSession(userId: string) {
  const token = newSessionToken();
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  await db.insert(sessions).values({
    id: token,
    userId,
    expiresAt,
  });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroyCurrentSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
    jar.delete(COOKIE_NAME);
  }
}

export type SessionContext = {
  user: User;
  partner: Partner | null;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const now = new Date();
  const rows = await db
    .select({
      user: users,
      partner: partners,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .leftJoin(partners, eq(partners.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, now)))
    .limit(1);

  if (rows.length === 0) return null;

  return {
    user: rows[0].user,
    partner: rows[0].partner,
  };
}

export async function requireApprovedPartner(): Promise<SessionContext & { partner: Partner }> {
  const ctx = await getSessionContext();
  if (!ctx) {
    throw new AuthError("UNAUTHENTICATED");
  }
  if (!ctx.partner) {
    throw new AuthError("NO_PARTNER");
  }
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

/** id used by caller to set session during signup or login */
export async function startSessionFor(userId: string) {
  return createSession(userId);
}

/** for server-side userId creation helper */
export { newId as newUserId };
