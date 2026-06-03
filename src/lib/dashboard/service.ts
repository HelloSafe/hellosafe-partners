import "server-only";
import { and, eq, gte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { clicks, conversions, trackedLinks } from "@/db/schema";
import type { Partner } from "@/db/schema";
import { attachLinkStats } from "@/lib/links/aggregate";

/**
 * Read-only services backing the partner self-service dashboard.
 *   - getOverview: 30-day totals, daily clicks/sales series, top 5 links.
 *   - listPayouts: monthly aggregates with derived payout status + date.
 */

const OVERVIEW_DAYS = 30;

export async function getOverview(partner: Partner) {
  const partnerId = partner.id;
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (OVERVIEW_DAYS - 1));

  // Window aggregates.
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

  // Daily series — fetch grouped raw days, fill gaps in JS.
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
  for (let i = 0; i < OVERVIEW_DAYS; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    daily.push({
      date: key,
      clicks: cMap.get(key) ?? 0,
      sales: sMap.get(key) ?? 0,
    });
  }

  // Top 5 links by all-time validated commission. Pre-aggregate each side
  // separately, then merge — joining clicks AND conversions in one query fans
  // out the commission SUM by the per-link click count.
  const [linkRows, topClickRows, topSalesRows] = await Promise.all([
    db
      .select({
        id: trackedLinks.id,
        label: trackedLinks.label,
        destination: trackedLinks.destination,
        language: trackedLinks.language,
        subId: trackedLinks.subId,
      })
      .from(trackedLinks)
      .where(eq(trackedLinks.partnerId, partnerId)),
    db
      .select({ linkId: clicks.linkId, clicks: sql<number>`count(*)::int` })
      .from(clicks)
      .where(eq(clicks.partnerId, partnerId))
      .groupBy(clicks.linkId),
    db
      .select({
        linkId: conversions.linkId,
        sales: sql<number>`count(*)::int`,
        commissionCents: sql<number>`coalesce(sum(${conversions.commissionCents}),0)::bigint`,
      })
      .from(conversions)
      .where(
        and(eq(conversions.partnerId, partnerId), ne(conversions.status, "cancelled")),
      )
      .groupBy(conversions.linkId),
  ]);

  const top = attachLinkStats(
    linkRows,
    topClickRows.map((c) => ({ linkId: c.linkId, clicks: Number(c.clicks) })),
    topSalesRows.map((s) => ({
      linkId: s.linkId,
      sales: Number(s.sales),
      commissionCents: Number(s.commissionCents),
    })),
  )
    .sort((a, b) => b.commissionCents - a.commissionCents)
    .slice(0, 5);

  return {
    range: { days: OVERVIEW_DAYS, since: since.toISOString() },
    totals: {
      clicks: Number(clicksAgg?.count ?? 0),
      sales: Number(convAgg?.count ?? 0),
      commissionCents: Number(convAgg?.commissionCents ?? 0),
    },
    daily,
    topLinks: top,
    partner: {
      name: partner.contactName,
      companyName: partner.companyName,
      partnerCode: partner.partnerCode,
    },
  };
}

export async function listPayouts(partnerId: string) {
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
    const [y, m] = r.period.split("-").map(Number);
    const payDate = new Date(Date.UTC(y, m, 15)); // m is 1-indexed; Date rolls over to next month
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

  return { currentPeriod, totalPaidCents, current, payouts };
}
