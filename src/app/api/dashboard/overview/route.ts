import { NextResponse } from "next/server";
import { and, desc, eq, gte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { clicks, conversions, trackedLinks } from "@/db/schema";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const DAYS = 30;

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner || ctx.partner.status !== "approved") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const partnerId = ctx.partner.id;
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (DAYS - 1));

  // 30-day totals — 2 plain aggregates.
  const [clicksAgg] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clicks)
    .where(and(eq(clicks.partnerId, partnerId), gte(clicks.createdAt, since)));

  const [convAgg] = await db
    .select({
      count: sql<number>`count(*)::int`,
      commissionCents: sql<number>`coalesce(sum(${conversions.commissionCents}),0)::bigint`,
    })
    .from(conversions)
    .where(
      and(
        eq(conversions.partnerId, partnerId),
        ne(conversions.status, "cancelled"),
        gte(conversions.createdAt, since),
      ),
    );

  const totals = {
    totalClicks: Number(clicksAgg?.count ?? 0),
    totalSales: Number(convAgg?.count ?? 0),
    totalCommissionCents: Number(convAgg?.commissionCents ?? 0),
  };

  // Daily series: compute in JS from raw rows to keep it portable.
  const [clickDays, salesDays] = await Promise.all([
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${clicks.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(clicks)
      .where(and(eq(clicks.partnerId, partnerId), gte(clicks.createdAt, since)))
      .groupBy(sql`date_trunc('day', ${clicks.createdAt})`),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${conversions.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(conversions)
      .where(
        and(
          eq(conversions.partnerId, partnerId),
          ne(conversions.status, "cancelled"),
          gte(conversions.createdAt, since),
        ),
      )
      .groupBy(sql`date_trunc('day', ${conversions.createdAt})`),
  ]);

  const cMap = new Map(clickDays.map((r) => [r.day, r.count]));
  const sMap = new Map(salesDays.map((r) => [r.day, r.count]));
  const daily: { date: string; clicks: number; sales: number }[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    daily.push({
      date: key,
      clicks: cMap.get(key) ?? 0,
      sales: sMap.get(key) ?? 0,
    });
  }

  // Top 5 links by commission (all-time) — grouped join.
  const top = await db
    .select({
      id: trackedLinks.id,
      label: trackedLinks.label,
      destination: trackedLinks.destination,
      language: trackedLinks.language,
      subId: trackedLinks.subId,
      clicks: sql<number>`count(distinct ${clicks.id})::int`,
      sales: sql<number>`count(distinct ${conversions.id}) filter (where ${conversions.status} <> 'cancelled')::int`,
      commissionCents: sql<number>`coalesce(sum(${conversions.commissionCents}) filter (where ${conversions.status} <> 'cancelled'), 0)::bigint`,
    })
    .from(trackedLinks)
    .leftJoin(clicks, eq(clicks.linkId, trackedLinks.id))
    .leftJoin(conversions, eq(conversions.linkId, trackedLinks.id))
    .where(eq(trackedLinks.partnerId, partnerId))
    .groupBy(trackedLinks.id)
    .orderBy(
      desc(
        sql`coalesce(sum(${conversions.commissionCents}) filter (where ${conversions.status} <> 'cancelled'), 0)`,
      ),
    )
    .limit(5);

  return NextResponse.json({
    range: { days: DAYS, since: since.toISOString() },
    totals: {
      clicks: Number(totals?.totalClicks ?? 0),
      sales: Number(totals?.totalSales ?? 0),
      commissionCents: Number(totals?.totalCommissionCents ?? 0),
    },
    daily,
    topLinks: top.map((t) => ({
      ...t,
      commissionCents: Number(t.commissionCents),
    })),
    partner: {
      name: ctx.partner.contactName,
      companyName: ctx.partner.companyName,
      partnerCode: ctx.partner.partnerCode,
    },
  });
}
