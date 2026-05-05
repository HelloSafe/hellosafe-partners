import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  clicks,
  conversions,
  partners,
  trackedLinks,
} from "@/db/schema";
import { newId, newShortCode, hashIp } from "@/lib/ids";
import { appUrl } from "@/lib/app-url";
import {
  buildHelloSafeUrl,
  isDestination,
  type DestinationKey,
} from "./destinations";
import type { CreateLinkInput } from "./validators";

/**
 * Service for the affiliate-tracking domain.
 * Public surface: list / create links from the partner dashboard, and
 * resolve + log clicks for /r/[code].
 */

/** Public short URL shown to partners. */
export function shortUrl(code: string) {
  return `${appUrl()}/r/${code}`;
}

/** Default fallback when a /r/[code] doesn't resolve. */
export const FALLBACK_URL = "https://hellosafe.com/fr/travel-insurance";

// ===================== Read =====================

/**
 * List all of a partner's links with click + sales aggregations.
 */
export async function listLinksWithStats(partnerId: string) {
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
    .where(eq(trackedLinks.partnerId, partnerId))
    .groupBy(trackedLinks.id)
    .orderBy(desc(trackedLinks.createdAt));

  return rows.map((r) => ({
    ...r,
    commissionCents: Number(r.commissionCents),
    url: shortUrl(r.shortCode),
  }));
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

// ===================== Click resolution + logging =====================

export type ResolvedClick = {
  targetUrl: string;
  partnerCode: string;
  shortCode: string;
};

export type ClickContext = {
  ip: string;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  subIdOverride: string | null;
};

/**
 * Resolve a short code to a redirect target and log the click.
 * Returns null if the code doesn't exist (caller should redirect to
 * FALLBACK_URL).
 *
 * Click logging is fire-and-forget: failures are logged but never block
 * the redirect.
 */
export async function resolveAndLogClick(
  code: string,
  click: ClickContext,
): Promise<ResolvedClick | null> {
  const rows = await db
    .select({
      link: trackedLinks,
      partnerCode: partners.partnerCode,
    })
    .from(trackedLinks)
    .innerJoin(partners, eq(partners.id, trackedLinks.partnerId))
    .where(eq(trackedLinks.shortCode, code))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  const { link, partnerCode } = row;

  // Fire and forget — catch in case of pool exhaustion / DB hiccup.
  db.insert(clicks)
    .values({
      id: newId(),
      linkId: link.id,
      partnerId: link.partnerId,
      ipHash: hashIp(click.ip),
      userAgent: click.userAgent,
      referer: click.referer,
      country: click.country,
      subIdOverride: click.subIdOverride,
    })
    .catch((e) => console.error("[click log]", e));

  const destination: DestinationKey = isDestination(link.destination)
    ? link.destination
    : "travel";

  const targetUrl = buildHelloSafeUrl({
    destination,
    language: link.language || "fr",
    partnerCode,
    shortCode: link.shortCode,
    campaign: link.campaign,
    subId: link.subId,
    subIdOverride: click.subIdOverride ?? undefined,
  });

  return { targetUrl, partnerCode, shortCode: link.shortCode };
}
