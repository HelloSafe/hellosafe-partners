import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { partners, users, conversions, clicks } from "@/db/schema";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx || ctx.user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const rows = await db
    .select({
      id: partners.id,
      userId: partners.userId,
      partnerCode: partners.partnerCode,
      companyName: partners.companyName,
      contactName: partners.contactName,
      website: partners.website,
      audience: partners.audience,
      country: partners.country,
      monthlyVisitors: partners.monthlyVisitors,
      status: partners.status,
      createdAt: partners.createdAt,
      approvedAt: partners.approvedAt,
      email: users.email,
      clickCount: sql<number>`(select count(*)::int from ${clicks} where ${clicks.partnerId} = ${partners.id})`,
      salesCount: sql<number>`(select count(*)::int from ${conversions} where ${conversions.partnerId} = ${partners.id} and ${conversions.status} <> 'cancelled')`,
      commissionCents: sql<number>`(select coalesce(sum(${conversions.commissionCents}),0)::bigint from ${conversions} where ${conversions.partnerId} = ${partners.id} and ${conversions.status} <> 'cancelled')`,
    })
    .from(partners)
    .innerJoin(users, eq(users.id, partners.userId))
    .orderBy(desc(partners.createdAt));

  return NextResponse.json({
    partners: rows.map((r) => ({
      ...r,
      commissionCents: Number(r.commissionCents),
    })),
  });
}
