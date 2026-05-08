import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { trackedLinks } from "@/db/schema";
import { newId, newShortCode } from "@/lib/ids";
import { appUrl } from "@/lib/app-url";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Creates a shareable, attribution-aware quote link for a partner-prepared
 * trip.
 *
 * Flow
 *   1. Create a HelloSafe subscription via /api/create-or-update-subscription
 *      to get a stable subscription_id.
 *   2. Persist a tracked_link row in Neon with `targetUrl` set to the
 *      hellosafe.com quote URL — this lets the existing /r/<code> redirect
 *      drop the partner cookie before sending the client to HelloSafe.
 *   3. Return the partner-domain short URL. The client clicks it, the
 *      router posts the cookie, then redirects them to HelloSafe with the
 *      partner ref baked in for attribution.
 */

const TripInfoSchema = z.object({
  intent: z.enum([
    "forTourism",
    "forSchengen",
    "forCancellation",
    "forAnnual",
    "forWorkingHoliday",
    "forOther",
  ]),
  countryResidence: z.string().min(2).max(3),
  arrivalCountries: z.array(z.string().min(2).max(3)).min(1),
  startDate: z.string(),
  endDate: z.string(),
  currency: z.enum(["EUR", "USD", "GBP", "CAD"]).default("EUR"),
  travellers: z.array(z.object({ age: z.number().int().min(0).max(120) })).min(1),
  shouldCoverCancellation: z.boolean().default(false),
  isAnnual: z.boolean().default(false),
  tripPrice: z.number().default(-1),
});

const Body = z.object({ tripInfo: TripInfoSchema });

export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const raw = await req.json().catch(() => null);
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const tz =
    req.headers.get("x-timezone") ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "Europe/Paris";

  // 1) Create the HelloSafe subscription
  const upstream = await fetch(
    "https://hellosafe.com/api/create-or-update-subscription",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        locale: "fr",
        tripInfo: {
          ...parsed.data.tripInfo,
          language: "fr",
          userBrowserTimezone: tz,
        },
      }),
      signal: AbortSignal.timeout(15_000),
    },
  ).catch(() => null);

  if (!upstream || !upstream.ok) {
    return NextResponse.json(
      { error: "UPSTREAM_FAILED", status: upstream?.status ?? 502 },
      { status: 502 },
    );
  }

  const data = (await upstream.json()) as { cmsSubscription?: { id?: string } };
  const subscriptionId = data.cmsSubscription?.id;
  if (!subscriptionId) {
    return NextResponse.json({ error: "NO_SUBSCRIPTION_ID" }, { status: 502 });
  }

  // 2) Create a tracked link with targetUrl set to the HelloSafe quote URL
  const targetUrl = `https://hellosafe.com/fr/travel-insurance/app/quote?subscription_id=${encodeURIComponent(subscriptionId)}`;

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
  const dest = parsed.data.tripInfo.arrivalCountries.join("+");
  const label = `Devis ${parsed.data.tripInfo.intent.replace(
    "for",
    "",
  )} → ${dest} · ${parsed.data.tripInfo.startDate.slice(0, 10)}`;

  await db.insert(trackedLinks).values({
    id,
    partnerId: ctx.partner.id,
    shortCode,
    label,
    destination: "travel", // legacy column kept non-null; the targetUrl wins at redirect time
    language: "fr",
    campaign: "products-share",
    subId: subscriptionId.slice(0, 8), // small prefix for log filtering
    targetUrl,
  });

  // 3) Return the partner-domain short URL
  const shareUrl = `${appUrl()}/r/${shortCode}`;

  return NextResponse.json({ subscriptionId, shareUrl });
}
