import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversions, partners, trackedLinks } from "@/db/schema";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx || ctx.user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const rows = await db
    .select({
      id: conversions.id,
      externalOrderId: conversions.externalOrderId,
      amountCents: conversions.amountCents,
      commissionCents: conversions.commissionCents,
      currency: conversions.currency,
      status: conversions.status,
      createdAt: conversions.createdAt,
      validatedAt: conversions.validatedAt,
      partnerCompany: partners.companyName,
      partnerCode: partners.partnerCode,
      linkLabel: trackedLinks.label,
      linkShortCode: trackedLinks.shortCode,
      subId: conversions.subIdOverride,
    })
    .from(conversions)
    .innerJoin(partners, eq(partners.id, conversions.partnerId))
    .leftJoin(trackedLinks, eq(trackedLinks.id, conversions.linkId))
    .orderBy(desc(conversions.createdAt))
    .limit(50);
  return NextResponse.json({
    conversions: rows.map((r) => ({
      ...r,
      amountCents: Number(r.amountCents),
      commissionCents: Number(r.commissionCents),
    })),
  });
}
