import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { users, partners, oauthStates } from "@/db/schema";
import { newId, newPartnerCode } from "@/lib/ids";
import { createSession } from "@/lib/session";
import {
  exchangeCodeForToken,
  fetchGoogleProfile,
  appUrl,
} from "@/lib/google-oauth";

function errorRedirect(reason: string) {
  const u = new URL("/fr/login", appUrl());
  u.searchParams.set("oauth_error", reason);
  return NextResponse.redirect(u);
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const err = req.nextUrl.searchParams.get("error");

  if (err) return errorRedirect(err);
  if (!code || !state) return errorRedirect("missing_params");

  const now = new Date();
  const staterows = await db
    .select()
    .from(oauthStates)
    .where(and(eq(oauthStates.state, state), gt(oauthStates.expiresAt, now)))
    .limit(1);

  const stateRow = staterows[0];
  if (!stateRow) return errorRedirect("invalid_state");

  await db.delete(oauthStates).where(eq(oauthStates.id, stateRow.id));

  let profile;
  try {
    const token = await exchangeCodeForToken(code, stateRow.codeVerifier);
    profile = await fetchGoogleProfile(token.access_token);
  } catch (e) {
    console.error("[google callback]", e);
    return errorRedirect("exchange_failed");
  }

  if (!profile.email_verified) return errorRedirect("email_not_verified");

  const email = profile.email.toLowerCase();

  // Already linked by google_id?
  let userRow =
    (await db.select().from(users).where(eq(users.googleId, profile.sub)).limit(1))[0] ??
    (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];

  if (userRow) {
    if (!userRow.googleId) {
      await db
        .update(users)
        .set({ googleId: profile.sub, image: profile.picture ?? userRow.image, updatedAt: new Date() })
        .where(eq(users.id, userRow.id));
    }
  } else {
    const userId = newId();
    await db.insert(users).values({
      id: userId,
      email,
      name: profile.name,
      image: profile.picture,
      googleId: profile.sub,
      role: "partner",
      emailVerifiedAt: new Date(),
    });
    await db.insert(partners).values({
      id: newId(),
      userId,
      partnerCode: newPartnerCode(),
      companyName: profile.name ?? email,
      contactName: profile.name ?? email,
      status: "pending",
    });
    userRow = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  }

  await createSession(userRow!.id);

  const target = new URL(stateRow.redirectTo || "/fr/dashboard", appUrl());
  return NextResponse.redirect(target);
}
