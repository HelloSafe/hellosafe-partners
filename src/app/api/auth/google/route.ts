import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { oauthStates } from "@/db/schema";
import { newId } from "@/lib/ids";
import {
  buildAuthorizeUrl,
  isGoogleConfigured,
  newPkcePair,
} from "@/lib/google-oauth";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  if (!isGoogleConfigured()) {
    return NextResponse.json(
      { error: "GOOGLE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const redirectTo = req.nextUrl.searchParams.get("redirect_to") ?? "/dashboard";
  const state = randomBytes(16).toString("base64url");
  const { verifier, challenge } = newPkcePair();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(oauthStates).values({
    id: newId(),
    state,
    codeVerifier: verifier,
    redirectTo,
    expiresAt,
  });

  const url = buildAuthorizeUrl({ state, codeChallenge: challenge });
  return NextResponse.redirect(url);
}
