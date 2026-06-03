import "server-only";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { clicks, conversions, trackedLinks } from "@/db/schema";
import { newId, newShortCode } from "@/lib/ids";
import { appUrl } from "@/lib/app-url";
import { attachLinkStats } from "./aggregate";
import { type DestinationKey } from "./destinations";
import type { CreateLinkInput } from "./validators";

/**
 * Service for the affiliate-tracking domain (Node runtime).
 *
 * The hot path /r/[code] no longer lives here — it runs on Edge runtime
 * with a Neon HTTP client and fires `click/logged` events to log clicks
 * asynchronously. See src/app/r/[code]/route.ts.
 */

/** Public short URL shown to partners. */
export function shortUrl(code: string) {
  return `${appUrl()}/r/${code}`;
}

// ===================== Read =====================

/** List all of a partner's links with click + sales aggregations. */
export async function listLinksWithStats(partnerId: string) {
  // Pre-aggregate each side separately, then merge in JS. Joining clicks AND
  // conversions in one query fans out the commission SUM by the click count.
  const [links, clickRows, salesRows] = await Promise.all([
    db
      .select({
        id: trackedLinks.id,
        shortCode: trackedLinks.shortCode,
        label: trackedLinks.label,
        destination: trackedLinks.destination,
        language: trackedLinks.language,
        campaign: trackedLinks.campaign,
        subId: trackedLinks.subId,
        createdAt: trackedLinks.createdAt,
      })
      .from(trackedLinks)
      .where(eq(trackedLinks.partnerId, partnerId))
      .orderBy(desc(trackedLinks.createdAt)),
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

  const withStats = attachLinkStats(
    links,
    clickRows.map((c) => ({ linkId: c.linkId, clicks: Number(c.clicks) })),
    salesRows.map((s) => ({
      linkId: s.linkId,
      sales: Number(s.sales),
      commissionCents: Number(s.commissionCents),
    })),
  );

  return withStats.map((r) => ({ ...r, url: shortUrl(r.shortCode) }));
}

// ===================== Create =====================

/**
 * Create a new tracked link. Generates a unique short code (retries on
 * the very unlikely 8-char collision).
 */
export async function createLink(partnerId: string, input: CreateLinkInput) {
  const language = input.language === "en" ? "en" : "fr";
  const destination = input.destination as DestinationKey;
  const label =
    input.label?.trim() ||
    input.campaign?.trim() ||
    `${destination}-${new Date().toISOString().slice(0, 10)}`;
  const campaign = (input.campaign || "").trim();
  const subId = (input.subId || "").trim();

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
    partnerId,
    shortCode,
    label,
    destination,
    language,
    campaign,
    subId,
  });

  return {
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
  };
}
