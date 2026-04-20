import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { trackedLinks, partners, conversions } from "@/db/schema";
import { getSessionContext } from "@/lib/session";
import { newId } from "@/lib/ids";

/**
 * Admin helper: simulate a HelloSafe conversion postback for a given link.
 * Useful for local demos when we don't have a real HelloSafe backoffice hitting /api/postback.
 *
 * Body: { shortCode: string, amount?: number, commission?: number, status?: "pending" | "validated" }
 */
export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx || ctx.user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    shortCode?: string;
    amount?: number;
    commission?: number;
    status?: "pending" | "validated" | "cancelled";
  };
  if (!body.shortCode) {
    return NextResponse.json({ error: "MISSING_SHORTCODE" }, { status: 400 });
  }

  const rows = await db
    .select({
      linkId: trackedLinks.id,
      partnerId: partners.id,
      subId: trackedLinks.subId,
    })
    .from(trackedLinks)
    .innerJoin(partners, eq(partners.id, trackedLinks.partnerId))
    .where(eq(trackedLinks.shortCode, body.shortCode))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "LINK_NOT_FOUND" }, { status: 404 });
  }

  const amount = body.amount ?? 79;
  const commission = body.commission ?? Math.round(amount * 0.15 * 100) / 100;
  const status = body.status ?? "validated";

  const id = newId();
  const externalOrderId = `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  await db.insert(conversions).values({
    id,
    linkId: row.linkId,
    partnerId: row.partnerId,
    externalOrderId,
    amountCents: Math.round(amount * 100),
    commissionCents: Math.round(commission * 100),
    currency: "EUR",
    status,
    validatedAt: status === "validated" ? new Date() : null,
    subIdOverride: row.subId || null,
  });

  return NextResponse.json({
    ok: true,
    id,
    externalOrderId,
    amountCents: Math.round(amount * 100),
    commissionCents: Math.round(commission * 100),
    status,
  });
}
