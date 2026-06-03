import { NextRequest } from "next/server";
import { getSessionContext } from "@/lib/session";
import { loadPerLinkBreakdown } from "@/lib/reporting/service";

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

  const rows = await loadPerLinkBreakdown(partnerId, from, to, subId);

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
        (r.revenueCents / 100).toFixed(2),
        (r.commissionCents / 100).toFixed(2),
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
