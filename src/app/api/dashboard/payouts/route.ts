import { NextResponse } from "next/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { conversions } from "@/db/schema";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner || ctx.partner.status !== "approved") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const partnerId = ctx.partner.id;

  const rows = await db
    .select({
      period: sql<string>`to_char(date_trunc('month', ${conversions.createdAt}), 'YYYY-MM')`,
      sales: sql<number>`count(*)::int`,
      grossCents: sql<number>`coalesce(sum(${conversions.commissionCents}),0)::bigint`,
      validatedCount: sql<number>`count(*) filter (where ${conversions.status} = 'validated')::int`,
    })
    .from(conversions)
    .where(
      and(
        eq(conversions.partnerId, partnerId),
        ne(conversions.status, "cancelled"),
      ),
    )
    .groupBy(sql`date_trunc('month', ${conversions.createdAt})`)
    .orderBy(sql`date_trunc('month', ${conversions.createdAt}) desc`);

  const now = new Date();
  const currentPeriod = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const payouts = rows.map((r) => {
    const isCurrent = r.period === currentPeriod;
    const fullyValidated = r.validatedCount === r.sales && r.sales > 0;
    const status: "paid" | "processing" | "pending" = isCurrent
      ? "processing"
      : fullyValidated
      ? "paid"
      : "pending";
    // Payout date = 15th of the month following the period.
    const [y, m] = r.period.split("-").map(Number);
    const payDate = new Date(Date.UTC(y, m, 15)); // month+1 because m is 1-indexed but Date uses 0-index that rolls over
    return {
      id: `pay-${r.period}`,
      period: r.period,
      sales: Number(r.sales),
      grossCents: Number(r.grossCents),
      status,
      date: isCurrent ? null : payDate.toISOString(),
    };
  });

  const totalPaidCents = payouts
    .filter((p) => p.status === "paid")
    .reduce((a, p) => a + p.grossCents, 0);

  const current = payouts.find((p) => p.status === "processing");

  return NextResponse.json({
    currentPeriod,
    totalPaidCents,
    current,
    payouts,
  });
}
