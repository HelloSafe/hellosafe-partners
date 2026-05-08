import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { partners, users } from "@/db/schema";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const ProfileSchema = z.object({
  contactName: z.string().trim().min(1).max(120),
});

/**
 * GET — current partner's "Compte" tab payload (contact name, email,
 * partner code, member-since date). Email change goes through Better
 * Auth (`authClient.changeEmail`); password change too. This endpoint
 * only owns the partner.contactName field.
 */
export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const userRow = await db
    .select({ email: users.email, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, ctx.partner.userId))
    .limit(1);

  return NextResponse.json({
    contactName: ctx.partner.contactName,
    email: userRow[0]?.email ?? null,
    emailVerified: userRow[0]?.emailVerified ?? false,
    partnerCode: ctx.partner.partnerCode,
    memberSince: ctx.partner.createdAt.toISOString(),
  });
}

export async function PUT(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const raw = await req.json().catch(() => null);
  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  await db
    .update(partners)
    .set({ contactName: parsed.data.contactName })
    .where(eq(partners.id, ctx.partner.id));
  return NextResponse.json({ ok: true });
}
