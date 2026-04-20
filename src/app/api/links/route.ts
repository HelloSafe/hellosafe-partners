import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { trackedLinks, clicks, conversions } from "@/db/schema";
import { getSessionContext } from "@/lib/session";
import { newId, newShortCode } from "@/lib/ids";
import { isDestination, DESTINATIONS, type DestinationKey } from "@/lib/destinations";
import { appUrl } from "@/lib/google-oauth";

function shortUrl(code: string) {
  return `${appUrl()}/r/${code}`;
}

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const rows = await db
    .select({
      id: trackedLinks.id,
      shortCode: trackedLinks.shortCode,
      label: trackedLinks.label,
      destination: trackedLinks.destination,
      language: trackedLinks.language,
      campaign: trackedLinks.campaign,
      subId: trackedLinks.subId,
      createdAt: trackedLinks.createdAt,
      clicks: sql<number>`coalesce(count(distinct ${clicks.id}), 0)::int`,
      sales: sql<number>`coalesce(count(distinct ${conversions.id}) filter (where ${conversions.status} <> 'cancelled'), 0)::int`,
      commissionCents: sql<number>`coalesce(sum(${conversions.commissionCents}) filter (where ${conversions.status} <> 'cancelled'), 0)::bigint`,
    })
    .from(trackedLinks)
    .leftJoin(clicks, eq(clicks.linkId, trackedLinks.id))
    .leftJoin(conversions, eq(conversions.linkId, trackedLinks.id))
    .where(eq(trackedLinks.partnerId, ctx.partner.id))
    .groupBy(trackedLinks.id)
    .orderBy(desc(trackedLinks.createdAt));

  return NextResponse.json({
    links: rows.map((r) => ({
      ...r,
      commissionCents: Number(r.commissionCents),
      url: shortUrl(r.shortCode),
    })),
  });
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (ctx.partner.status !== "approved") {
    return NextResponse.json({ error: "PARTNER_NOT_APPROVED" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    label?: string;
    destination?: string;
    language?: string;
    campaign?: string;
    subId?: string;
  };

  if (!isDestination(body.destination)) {
    return NextResponse.json(
      { error: "INVALID_DESTINATION", allowed: DESTINATIONS },
      { status: 400 },
    );
  }
  const language = body.language === "en" ? "en" : "fr";
  const destination: DestinationKey = body.destination;
  const label =
    body.label?.trim() ||
    body.campaign?.trim() ||
    `${destination}-${new Date().toISOString().slice(0, 10)}`;
  const campaign = (body.campaign || "").trim();
  const subId = (body.subId || "").trim();

  // Generate a unique short code (retry on collision, very unlikely with 8 chars).
  let shortCode = newShortCode(8);
  for (let i = 0; i < 3; i++) {
    const hit = await db
      .select({ id: trackedLinks.id })
      .from(trackedLinks)
      .where(eq(trackedLinks.shortCode, shortCode))
      .limit(1);
    if (hit.length === 0) break;
    shortCode = newShortCode(8);
  }

  const id = newId();
  await db.insert(trackedLinks).values({
    id,
    partnerId: ctx.partner.id,
    shortCode,
    label,
    destination,
    language,
    campaign,
    subId,
  });

  return NextResponse.json(
    {
      ok: true,
      link: {
        id,
        shortCode,
        label,
        destination,
        language,
        campaign,
        subId,
        url: shortUrl(shortCode),
        clicks: 0,
        sales: 0,
        commissionCents: 0,
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  );
}
