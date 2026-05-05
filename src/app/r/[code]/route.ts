/**
 * Hot-path tracked-link redirect. Runs on Vercel Edge so the latency
 * stays tight worldwide. The DB round-trip uses Neon's HTTP driver
 * (`@neondatabase/serverless`); the click is logged asynchronously via
 * an Inngest event so the redirect never waits on a write.
 *
 * Migration path to Cloudflare Workers later: this file's only deps are
 * `@neondatabase/serverless` (works on CF), `inngest` (works on CF),
 * Web Crypto, and pure helpers — no Vercel-specific APIs are used here.
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { dbEdge } from "@/db/edge";
import { partners, trackedLinks } from "@/db/schema";
import { hashIpEdge } from "@/lib/ids-edge";
import { inngest } from "@/lib/inngest/client";
import {
  buildHelloSafeUrl,
  isDestination,
  type DestinationKey,
} from "@/lib/links/destinations";
import {
  clientIp,
  rateLimitResponse,
  redirectLimiter,
} from "@/lib/ratelimit";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const FALLBACK = "https://hellosafe.com/fr/travel-insurance";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  // Per-IP redirect limiter. No-op when Upstash is unconfigured.
  const verdict = await redirectLimiter(clientIp(req));
  if (!verdict.success) return rateLimitResponse(verdict);

  const { code } = await ctx.params;

  // Resolve link + owner partnerCode in a single round-trip.
  const rows = await dbEdge
    .select({
      linkId: trackedLinks.id,
      partnerId: trackedLinks.partnerId,
      shortCode: trackedLinks.shortCode,
      destination: trackedLinks.destination,
      language: trackedLinks.language,
      campaign: trackedLinks.campaign,
      subId: trackedLinks.subId,
      partnerCode: partners.partnerCode,
    })
    .from(trackedLinks)
    .innerJoin(partners, eq(partners.id, trackedLinks.partnerId))
    .where(eq(trackedLinks.shortCode, code))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return NextResponse.redirect(FALLBACK, { status: 307 });
  }

  // Click context. ipHash is computed via Web Crypto (edge-safe).
  const ip = clientIp(req);
  const subIdOverride = req.nextUrl.searchParams.get("subid");
  const ipHash = await hashIpEdge(ip);

  // Fire and forget — the actual DB write happens in the Inngest
  // click-logged handler (Node runtime).
  inngest
    .send({
      name: "click/logged",
      data: {
        linkId: row.linkId,
        partnerId: row.partnerId,
        ipHash,
        userAgent: req.headers.get("user-agent"),
        referer: req.headers.get("referer"),
        country: req.headers.get("x-vercel-ip-country"),
        subIdOverride,
      },
    })
    .catch((e) => console.error("[click] event send failed", e));

  const destination: DestinationKey = isDestination(row.destination)
    ? row.destination
    : "travel";

  const target = buildHelloSafeUrl({
    destination,
    language: row.language || "fr",
    partnerCode: row.partnerCode,
    shortCode: row.shortCode,
    campaign: row.campaign,
    subId: row.subId,
    subIdOverride: subIdOverride ?? undefined,
  });

  const res = NextResponse.redirect(target, { status: 302 });
  res.cookies.set("hs_ref", `${row.partnerCode}-${row.shortCode}`, {
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
  });
  return res;
}
