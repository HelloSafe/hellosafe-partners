import { NextRequest } from "next/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { clicks, conversions, trackedLinks } from "@/db/schema";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Per-link CSV export of the same period the Reporting tab is showing.
 * One row per link, all amounts converted to euros (commas → dots are
 * not needed because Excel-FR also reads dots if the cell is a number).
 */
export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return new Response("UNAUTHENTICATED", { status: 401 });
  }
  const partnerId = ctx.partner.id;
  const params = req.nextUrl.searchParams;

  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 86_400_000);
  const from = params.get("from") ? new Date(params.get("from")!) : defaultFrom;
  const to = params.get("to") ? new Date(params.get("to")!) : now;
  const subId = (params.get("subid") ?? "").trim();

  const rows = await db
    .select({
      linkId: trackedLinks.id,
      label: trackedLinks.label,
      destination: trackedLinks.destination,
      subId: trackedLinks.subId,
      campaign: trackedLinks.campaign,
      createdAt: trackedLinks.createdAt,
      clicks: sql<number>`(
        select count(*)::int from ${clicks}
        where ${clicks.linkId} = ${trackedLinks.id}
          and ${clicks.createdAt} >= ${from} and ${clicks.createdAt} <= ${to}
      )`,
      pendingConv: sql<number>`(
        select count(*)::int from ${conversions}
        where ${conversions.linkId} = ${trackedLinks.id}
          and ${conversions.status} = 'pending'
          and ${conversions.createdAt} >= ${from} and ${conversions.createdAt} <= ${to}
      )`,
      validatedConv: sql<number>`(
        select count(*)::int from ${conversions}
        where ${conversions.linkId} = ${trackedLinks.id}
          and ${conversions.status} = 'validated'
          and ${conversions.createdAt} >= ${from} and ${conversions.createdAt} <= ${to}
      )`,
      revenueCents: sql<number>`(
        select coalesce(sum(${conversions.amountCents}),0)::bigint from ${conversions}
        where ${conversions.linkId} = ${trackedLinks.id}
          and ${conversions.status} = 'validated'
          and ${conversions.createdAt} >= ${from} and ${conversions.createdAt} <= ${to}
      )`,
      commissionCents: sql<number>`(
        select coalesce(sum(${conversions.commissionCents}),0)::bigint from ${conversions}
        where ${conversions.linkId} = ${trackedLinks.id}
          and ${conversions.status} = 'validated'
          and ${conversions.createdAt} >= ${from} and ${conversions.createdAt} <= ${to}
      )`,
    })
    .from(trackedLinks)
    .where(
      subId
        ? and(eq(trackedLinks.partnerId, partnerId), eq(trackedLinks.subId, subId))
        : eq(trackedLinks.partnerId, partnerId),
    )
    .orderBy(desc(trackedLinks.createdAt));

  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = [
    "link_id",
    "label",
    "destination",
    "sub_id",
    "campaign",
    "created_at",
    "clicks",
    "quotes",
    "sales",
    "revenue_eur",
    "commission_eur",
  ];
  const lines = [header.join(";")];
  for (const r of rows) {
    lines.push(
      [
        r.linkId,
        r.label,
        r.destination,
        r.subId,
        r.campaign,
        r.createdAt.toISOString().slice(0, 10),
        r.clicks,
        r.pendingConv,
        r.validatedConv,
        (Number(r.revenueCents) / 100).toFixed(2),
        (Number(r.commissionCents) / 100).toFixed(2),
      ]
        .map(esc)
        .join(";"),
    );
  }
  const csv = "﻿" + lines.join("\n"); // BOM so Excel-FR opens it as UTF-8

  const filename = `hellosafe-reporting-${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
