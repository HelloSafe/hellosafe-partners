/**
 * Hot-path tracked-link redirect. Runs on the Cloudflare Workers runtime
 * (via OpenNext) so the latency stays tight worldwide. The DB round-trip
 * uses Neon's HTTP driver (`@neondatabase/serverless`); the click is
 * logged asynchronously via an Inngest event so the redirect never waits
 * on a write.
 *
 * Every dep here is Workers-safe: `@neondatabase/serverless` (SQL over
 * fetch), `inngest`, Web Crypto, and pure helpers — no Node-only or
 * platform-specific APIs.
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
      targetUrl: trackedLinks.targetUrl,
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
        // Cloudflare sets cf-ipcountry; keep the Vercel header as a
        // fallback so the field still resolves if we ever run elsewhere.
        country:
          req.headers.get("cf-ipcountry") ??
          req.headers.get("x-vercel-ip-country"),
        subIdOverride,
      },
    })
    .catch((e) => console.error("[click] event send failed", e));

  const ref = `${row.partnerCode}-${row.shortCode}`;
  let target: string;
  if (row.targetUrl) {
    // Custom target — used by the products comparator (subscription_id
    // baked into the URL). We append `ref` so HelloSafe's attribution
    // still sees the partner.
    const u = new URL(row.targetUrl);
    if (!u.searchParams.has("ref")) u.searchParams.set("ref", ref);
    if (!u.searchParams.has("utm_source"))
      u.searchParams.set("utm_source", "hellosafe-partners");
    if (!u.searchParams.has("utm_medium"))
      u.searchParams.set("utm_medium", "affiliate");
    if (!u.searchParams.has("utm_campaign"))
      u.searchParams.set("utm_campaign", row.campaign || "direct");
    if (subIdOverride && !u.searchParams.has("subid"))
      u.searchParams.set("subid", subIdOverride);
    target = u.toString();
  } else {
    const destination: DestinationKey = isDestination(row.destination)
      ? row.destination
      : "travel";

    target = buildHelloSafeUrl({
      destination,
      language: row.language || "fr",
      partnerCode: row.partnerCode,
      shortCode: row.shortCode,
      campaign: row.campaign,
      subId: row.subId,
      subIdOverride: subIdOverride ?? undefined,
    });
  }

  const res = NextResponse.redirect(target, { status: 302 });
  res.cookies.set("hs_ref", ref, {
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
  });
  return res;
}
