import "server-only";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { clicks, conversions, trackedLinks } from "@/db/schema";
import { mergePerLink, type PerLinkRow } from "./aggregate";

/**
 * Per-link breakdown for a partner over a date range, optionally filtered by
 * the link's Sub-ID. Three flat GROUP BY queries (links, clicks, conversions)
 * merged in JS — equivalent to the old per-row correlated subqueries but
 * without the N+1 and without JOIN fan-out on the SUMs.
 *
 * Note: clicks/conversions are scoped by partnerId + date only (not by the
 * Sub-ID), exactly like the previous implementation — the Sub-ID filter
 * selects which *links* appear, then all of each link's traffic in the
 * window is counted.
 */
export async function loadPerLinkBreakdown(
  partnerId: string,
  from: Date,
  to: Date,
  subId: string,
): Promise<PerLinkRow[]> {
  const links = await db
    .select({
      linkId: trackedLinks.id,
      label: trackedLinks.label,
      destination: trackedLinks.destination,
      subId: trackedLinks.subId,
      campaign: trackedLinks.campaign,
      createdAt: trackedLinks.createdAt,
    })
    .from(trackedLinks)
    .where(
      subId
        ? and(eq(trackedLinks.partnerId, partnerId), eq(trackedLinks.subId, subId))
        : eq(trackedLinks.partnerId, partnerId),
    )
    .orderBy(desc(trackedLinks.createdAt));

  const [clickRows, convRows] = await Promise.all([
    db
      .select({
        linkId: clicks.linkId,
        clicks: sql<number>`count(*)::int`,
      })
      .from(clicks)
      .where(
        and(
          eq(clicks.partnerId, partnerId),
          gte(clicks.createdAt, from),
          lte(clicks.createdAt, to),
        ),
      )
      .groupBy(clicks.linkId),
    db
      .select({
        linkId: conversions.linkId,
        status: conversions.status,
        count: sql<number>`count(*)::int`,
        amountCents: sql<number>`coalesce(sum(${conversions.amountCents}),0)::bigint`,
        commissionCents: sql<number>`coalesce(sum(${conversions.commissionCents}),0)::bigint`,
      })
      .from(conversions)
      .where(
        and(
          eq(conversions.partnerId, partnerId),
          gte(conversions.createdAt, from),
          lte(conversions.createdAt, to),
        ),
      )
      .groupBy(conversions.linkId, conversions.status),
  ]);

  return mergePerLink(
    links,
    clickRows.map((c) => ({ linkId: c.linkId, clicks: Number(c.clicks) })),
    convRows.map((r) => ({
      linkId: r.linkId,
      status: r.status,
      count: Number(r.count),
      amountCents: Number(r.amountCents),
      commissionCents: Number(r.commissionCents),
    })),
  );
}
