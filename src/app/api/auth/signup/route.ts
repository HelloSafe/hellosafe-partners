import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, partners } from "@/db/schema";
import { newId, newPartnerCode } from "@/lib/ids";
import { notifyAdminNewPartner } from "@/lib/partners/notify";
import { VALID_PERSONAS } from "@/lib/partners/types";
import {
  clientIp,
  rateLimitResponse,
  signupLimiter,
} from "@/lib/ratelimit";

// Wrapper around Better Auth signUpEmail. Partner provisioning (the affiliate
// code + welcome email) is handled centrally by the `user.create` hook in
// auth.ts; this route only enriches that partner with the signup form fields
// and marks the profile complete.
const Body = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "PASSWORD_TOO_SHORT"),
  companyName: z.string().trim().min(1, "MISSING_FIELDS"),
  contactName: z.string().trim().min(1, "MISSING_FIELDS"),
  website: z.string().trim().optional().nullable(),
  audience: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
  monthlyVisitors: z
    .union([z.string(), z.number()])
    .optional()
    .nullable(),
  // Self-declared profile from the signup selector. Persisted so onboarding
  // step 1 is pre-selected; optional because the selector can be skipped.
  persona: z.enum(VALID_PERSONAS).optional().nullable(),
});

export async function POST(req: NextRequest) {
  // Rate limit signups per IP to absorb scripted account-creation floods.
  const verdict = await signupLimiter(clientIp(req));
  if (!verdict.success) return rateLimitResponse(verdict);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const code =
      issue?.message === "PASSWORD_TOO_SHORT"
        ? "PASSWORD_TOO_SHORT"
        : issue?.path[0] === "email"
          ? "INVALID_EMAIL"
          : "MISSING_FIELDS";
    return NextResponse.json({ error: code }, { status: 400 });
  }

  const {
    email,
    password,
    companyName,
    contactName,
    website,
    audience,
    country,
    monthlyVisitors,
    persona,
  } = parsed.data;

  // Better Auth handles: hashing, duplicate detection, session creation,
  // cookie setting (via nextCookies plugin).
  let userId: string;
  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name: contactName },
      headers: req.headers,
    });
    userId = result.user.id;
  } catch (err) {
    if (err instanceof APIError) {
      // Map Better Auth error codes to the existing UI taxonomy.
      const code =
        err.body?.code === "USER_ALREADY_EXISTS" ||
        err.body?.message?.toLowerCase().includes("already")
          ? "EMAIL_ALREADY_USED"
          : err.body?.code ?? "SIGNUP_FAILED";
      const status = err.statusCode ?? 400;
      return NextResponse.json({ error: code }, { status });
    }
    return NextResponse.json({ error: "SIGNUP_FAILED" }, { status: 500 });
  }

  // Check that the user was created (defense in depth: avoid orphaned partner).
  const userRow = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!userRow.length) {
    return NextResponse.json({ error: "SIGNUP_FAILED" }, { status: 500 });
  }

  const visitors =
    typeof monthlyVisitors === "string"
      ? parseInt(monthlyVisitors, 10) || null
      : monthlyVisitors ?? null;

  // The `user.create` hook (auth.ts) already provisioned a pending partner
  // with its affiliate code and sent the welcome email. Enrich that row with
  // the form fields and mark the profile complete — the email/password form
  // collects everything up front, so these users skip /complete-profile.
  const enriched = await db
    .update(partners)
    .set({
      companyName,
      contactName,
      website: website || null,
      audience: audience || null,
      country: country || null,
      monthlyVisitors: visitors,
      ...(persona ? { persona } : {}),
      profileCompletedAt: new Date(),
    })
    .where(eq(partners.userId, userId))
    .returning({ id: partners.id });

  // Defense in depth: if the hook didn't run for any reason, create the row
  // now so the user is never left without a partner profile.
  if (enriched.length === 0) {
    await db.insert(partners).values({
      id: newId(),
      userId,
      partnerCode: newPartnerCode(),
      companyName,
      contactName,
      website: website || null,
      audience: audience || null,
      country: country || null,
      monthlyVisitors: visitors,
      persona: persona ?? null,
      status: "pending",
      profileCompletedAt: new Date(),
    });
  }

  // Alert the team that a partner is now in the review queue. Awaited (not
  // fire-and-forget) so the email is dispatched before this serverless
  // function can be frozen; the helper swallows its own errors.
  await notifyAdminNewPartner({
    partnerName: contactName,
    partnerEmail: email,
    companyName,
    website: website || null,
  });

  return NextResponse.json({ ok: true, status: "pending" }, { status: 201 });
}
