import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { updateBranding } from "@/lib/partners/service";
import { BrandingSchema } from "@/lib/partners/validators";

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
  const raw = await req.json().catch(() => null);
  const parsed = BrandingSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "MISSING_BODY" }, { status: 400 });
  }
  await updateBranding(ctx.partner.id, ctx.partner, parsed.data);
  return NextResponse.json({ ok: true });
}
