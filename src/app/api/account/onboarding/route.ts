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
    onboardedAt: ctx.partner.onboardedAt,
    persona: ctx.partner.persona,
    agencyName: ctx.partner.agencyName ?? ctx.partner.companyName,
    agencyLogoUrl: ctx.partner.agencyLogoUrl,
    agencyBrandColor: ctx.partner.agencyBrandColor ?? "#563BFF",
    agencyTagline: ctx.partner.agencyTagline,
  });
}

const VALID_PERSONAS = [
  "blog",
  "agency",
  "visa",
  "creator",
  "expat",
  "student",
  "cruise",
  "other",
];

export async function PUT(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    persona?: string;
    agencyName?: string;
    agencyLogoUrl?: string | null;
    agencyBrandColor?: string;
    agencyTagline?: string | null;
    complete?: boolean;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "MISSING_BODY" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.persona !== undefined) {
    if (!VALID_PERSONAS.includes(body.persona)) {
      return NextResponse.json({ error: "INVALID_PERSONA" }, { status: 400 });
    }
    updates.persona = body.persona;
  }
  if (body.agencyName !== undefined) {
    updates.agencyName = body.agencyName.trim() || ctx.partner.companyName;
  }
  if (body.agencyLogoUrl !== undefined) {
    updates.agencyLogoUrl = body.agencyLogoUrl?.trim() || null;
  }
  if (body.agencyBrandColor !== undefined) {
    if (/^#[0-9a-fA-F]{6}$/.test(body.agencyBrandColor)) {
      updates.agencyBrandColor = body.agencyBrandColor;
    }
  }
  if (body.agencyTagline !== undefined) {
    updates.agencyTagline = body.agencyTagline?.trim() || null;
  }
  if (body.complete) {
    updates.onboardedAt = new Date();
  }

  if (Object.keys(updates).length > 0) {
    await db
      .update(partners)
      .set(updates)
      .where(eq(partners.id, ctx.partner.id));
  }

  return NextResponse.json({ ok: true });
}
