import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Creates a shareable quote link for a partner-prepared trip.
 *
 * Phase 1: we hit hellosafe.com `create-or-update-subscription` to get a
 * stable subscription_id, then return the public URL with that id. The
 * client lands on hellosafe.com with their trip pre-filled and finishes
 * the subscription there.
 *
 * Partner attribution layer (cookie via /r/<short_code>) is the next
 * iteration — coordination needed with the HelloSafe core team.
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

const Body = z.object({
  tripInfo: TripInfoSchema,
});

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

  // For now, the share link points directly to hellosafe.com. Once we wire
  // partner attribution we'll wrap this in a /r/<short_code> redirect.
  const shareUrl = `https://hellosafe.com/fr/travel-insurance/app/quote?subscription_id=${encodeURIComponent(subscriptionId)}`;

  return NextResponse.json({ subscriptionId, shareUrl });
}
