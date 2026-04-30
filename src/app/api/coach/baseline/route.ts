import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { coverageProfiles } from "@/db/schema";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "fr";

  // baseline = partner_id IS NULL, partner contracts = belong to this partner
  const rows = await db
    .select({
      id: coverageProfiles.id,
      partnerId: coverageProfiles.partnerId,
      type: coverageProfiles.type,
      source: coverageProfiles.source,
      name: coverageProfiles.name,
      issuer: coverageProfiles.issuer,
      country: coverageProfiles.country,
      locale: coverageProfiles.locale,
      data: coverageProfiles.data,
      active: coverageProfiles.active,
      notes: coverageProfiles.notes,
    })
    .from(coverageProfiles)
    .where(
      and(
        eq(coverageProfiles.active, true),
        or(
          isNull(coverageProfiles.partnerId),
          eq(coverageProfiles.partnerId, ctx.partner.id),
        ),
      ),
    );

  const filtered = rows.filter((r) => {
    if (r.type === "partner_contract") return r.partnerId === ctx.partner!.id;
    return r.locale === locale;
  });

  return NextResponse.json({
    cards: filtered.filter((r) => r.type === "card"),
    mutuelles: filtered.filter((r) => r.type === "mutuelle"),
    socialSecurity: filtered.filter((r) => r.type === "social_security"),
    partnerContracts: filtered.filter((r) => r.type === "partner_contract"),
  });
}
