import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { trackedLinks, clicks, partners } from "@/db/schema";
import { newId, hashIp } from "@/lib/ids";
import {
  buildHelloSafeUrl,
  isDestination,
  type DestinationKey,
} from "@/lib/destinations";

export const dynamic = "force-dynamic";

const FALLBACK = "https://hellosafe.com/fr/travel-insurance";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;

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
  if (!row) {
    return NextResponse.redirect(FALLBACK, { status: 307 });
  }
  const { link, partnerCode } = row;

  // Click logging — fire and forget, never block the redirect.
  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const userAgent = req.headers.get("user-agent") ?? null;
  const referer = req.headers.get("referer") ?? null;
  const country = req.headers.get("x-vercel-ip-country") ?? null;
  const subIdOverride = req.nextUrl.searchParams.get("subid");

  db.insert(clicks)
    .values({
      id: newId(),
      linkId: link.id,
      partnerId: link.partnerId,
      ipHash: hashIp(ip),
      userAgent,
      referer,
      country,
      subIdOverride: subIdOverride || null,
    })
    .catch((e) => console.error("[click log]", e));

  const destination: DestinationKey = isDestination(link.destination)
    ? link.destination
    : "travel";

  const target = buildHelloSafeUrl({
    destination,
    language: link.language || "fr",
    partnerCode,
    shortCode: link.shortCode,
    campaign: link.campaign,
    subId: link.subId,
    subIdOverride: subIdOverride ?? undefined,
  });

  const res = NextResponse.redirect(target, { status: 302 });
  res.cookies.set("hs_ref", `${partnerCode}-${link.shortCode}`, {
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
  });
  return res;
}
