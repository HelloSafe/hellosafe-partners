import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { updateOnboarding } from "@/lib/partners/service";
import { OnboardingSchema } from "@/lib/partners/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  return NextResponse.json({
    onboardedAt: ctx.partner.onboardedAt,
    persona: ctx.partner.persona,
    agencyName: ctx.partner.agencyName ?? ctx.partner.companyName,
    agencyLogoUrl: ctx.partner.agencyLogoUrl,
    agencyBrandColor: ctx.partner.agencyBrandColor ?? "#563BFF",
    agencyTagline: ctx.partner.agencyTagline,
  });
}

export async function PUT(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = OnboardingSchema.safeParse(raw);
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message ?? "MISSING_BODY";
    const status =
      code === "INVALID_PERSONA" || code === "INVALID_COLOR" ? 400 : 400;
    return NextResponse.json({ error: code }, { status });
  }

  await updateOnboarding(ctx.partner.id, ctx.partner, parsed.data);
  return NextResponse.json({ ok: true });
}
