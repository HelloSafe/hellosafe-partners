import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { partners } from "@/db/schema";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  return NextResponse.json({
    branding: {
      agencyName: ctx.partner.agencyName ?? ctx.partner.companyName,
      agencyLogoUrl: ctx.partner.agencyLogoUrl ?? null,
      agencyBrandColor: ctx.partner.agencyBrandColor ?? "#563bff",
      agencyTagline: ctx.partner.agencyTagline ?? null,
    },
  });
}

export async function PUT(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as
    | {
        agencyName?: string;
        agencyLogoUrl?: string | null;
        agencyBrandColor?: string;
        agencyTagline?: string | null;
      }
    | null;
  if (!body) {
    return NextResponse.json({ error: "MISSING_BODY" }, { status: 400 });
  }
  // Light validation on the brand color: must look like a hex.
  const color =
    body.agencyBrandColor && /^#[0-9a-fA-F]{6}$/.test(body.agencyBrandColor)
      ? body.agencyBrandColor
      : ctx.partner.agencyBrandColor ?? "#563bff";

  await db
    .update(partners)
    .set({
      agencyName: body.agencyName?.trim() || ctx.partner.companyName,
      agencyLogoUrl: body.agencyLogoUrl?.trim() || null,
      agencyBrandColor: color,
      agencyTagline: body.agencyTagline?.trim() || null,
    })
    .where(eq(partners.id, ctx.partner.id));

  return NextResponse.json({ ok: true });
}
