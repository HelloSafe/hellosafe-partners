import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { clicks, conversions } from "@/db/schema";
import { getSessionContext } from "@/lib/session";
import { loadPerLinkBreakdown } from "@/lib/reporting/service";

export const dynamic = "force-dynamic";

/**
 * Detailed financial reporting payload for the Administration → Reporting tab.
 * Returns the period summary (clicks / quotes / sales / commissions) and a
 * per-link breakdown that can be filtered by Sub-ID. All amounts in cents.
 */

function parseDate(s: string | null, fallback: Date): Date {
  if (!s) return fallback;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d : fallback;
}

export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const partnerId = ctx.partner.id;
  const params = req.nextUrl.searchParams;

  // Default range = last 30 days
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 86_400_000);
  const from = parseDate(params.get("from"), defaultFrom);
  const to = parseDate(params.get("to"), now);
  const subId = (params.get("subid") ?? "").trim();

  // ── Summary ────────────────────────────────────────────────────────────
  const clickFilters = and(
    eq(clicks.partnerId, partnerId),
    gte(clicks.createdAt, from),
    lte(clicks.createdAt, to),
    subId ? eq(clicks.subIdOverride, subId) : undefined,
  );
  const convFilters = and(
    eq(conversions.partnerId, partnerId),
    gte(conversions.createdAt, from),
    lte(conversions.createdAt, to),
    subId ? eq(conversions.subIdOverride, subId) : undefined,
  );

  const [clickAgg] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clicks)
    .where(clickFilters);

  const convAgg = await db
    .select({
      status: conversions.status,
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${conversions.amountCents}),0)::bigint`,
      commission: sql<number>`coalesce(sum(${conversions.commissionCents}),0)::bigint`,
    })
    .from(conversions)
    .where(convFilters)
    .groupBy(conversions.status);

  type Bucket = { count: number; revenue: number; commission: number };
  const empty: Bucket = { count: 0, revenue: 0, commission: 0 };
  const buckets: Record<"pending" | "validated" | "cancelled", Bucket> = {
    pending: { ...empty },
    validated: { ...empty },
    cancelled: { ...empty },
  };
  for (const row of convAgg) {
    buckets[row.status] = {
      count: row.count,
      revenue: Number(row.revenue),
      commission: Number(row.commission),
    };
  }

  // ── Per-link breakdown ─────────────────────────────────────────────────
  // Pre-aggregated in flat GROUP BY queries (no N+1, no JOIN fan-out).
  const perLinkRows = await loadPerLinkBreakdown(partnerId, from, to, subId);

  return NextResponse.json({
    range: { from: from.toISOString(), to: to.toISOString() },
    summary: {
      clicks: clickAgg?.count ?? 0,
      pendingConversions: buckets.pending.count,
      validatedConversions: buckets.validated.count,
      cancelledConversions: buckets.cancelled.count,
      pendingRevenueCents: buckets.pending.revenue,
      validatedRevenueCents: buckets.validated.revenue,
      pendingCommissionCents: buckets.pending.commission,
      validatedCommissionCents: buckets.validated.commission,
    },
    perLink: perLinkRows.map((r) => ({
      linkId: r.linkId,
      label: r.label,
      destination: r.destination,
      subId: r.subId,
      campaign: r.campaign,
      clicks: r.clicks,
      pendingConv: r.pendingConv,
      validatedConv: r.validatedConv,
      cancelledConv: r.cancelledConv,
      revenueCents: r.revenueCents,
      commissionCents: r.commissionCents,
    })),
  });
}
