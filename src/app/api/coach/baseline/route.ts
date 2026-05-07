import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { listBaselineCoverages } from "@/lib/coach/service";
import { listCards, type HcCountry } from "@/lib/coach/cards-catalog";
import type { DepartureCountry } from "@/lib/coach/coverage-types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const rawCountry = req.nextUrl.searchParams.get("country");
  const country: DepartureCountry = rawCountry === "CA" ? "CA" : "FR";
  const hcCountry: HcCountry = country; // same shape

  // Mutuelles, social security, partner contracts come from Neon (always fr locale)
  const [base, hcCards] = await Promise.all([
    listBaselineCoverages(ctx.partner.id, "fr"),
    listCards(hcCountry),
  ]);

  return NextResponse.json({
    // Cards: real HelloCard data from Supabase
    cards: hcCards.map((c) => ({ ...c, locale: "fr" })),
    // The rest stays from Neon
    mutuelles: base.mutuelles,
    socialSecurity: base.socialSecurity,
    partnerContracts: base.partnerContracts,
  });
}
