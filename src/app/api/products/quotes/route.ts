import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Server-side proxy to hellosafe.com `/api/display-offers`. Avoids CORS, lets
 * us add partner-side logging later without changing the front, and gives us
 * a stable contract from the partner-dashboard's perspective.
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
  startDate: z.string(), // ISO 8601
  endDate: z.string(),
  currency: z.enum(["EUR", "USD", "GBP", "CAD"]).default("EUR"),
  travellers: z
    .array(z.object({ age: z.number().int().min(0).max(120) }))
    .min(1)
    .max(20),
  shouldCoverCancellation: z.boolean().default(false),
  isAnnual: z.boolean().default(false),
  tripPrice: z.number().default(-1),
});

const BodySchema = z.object({ tripInfo: TripInfoSchema });

export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { tripInfo } = parsed.data;
  // Forward to HelloSafe with the locale + a sensible default timezone.
  const tz =
    req.headers.get("x-timezone") ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "Europe/Paris";

  const upstream = await fetch("https://hellosafe.com/api/display-offers", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      locale: "fr",
      tripInfo: {
        ...tripInfo,
        language: "fr",
        userBrowserTimezone: tz,
      },
    }),
    // 25 s leaves room for slow partner APIs (Heymondo / Mutuaide can hang).
    signal: AbortSignal.timeout(25_000),
  }).catch(() => null);

  if (!upstream || !upstream.ok) {
    const status = upstream?.status ?? 502;
    return NextResponse.json(
      { error: "UPSTREAM_FAILED", status },
      { status: 502 },
    );
  }
  const data = await upstream.json();
  return NextResponse.json(data);
}
