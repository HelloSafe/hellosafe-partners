import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { partners } from "@/db/schema";
import { getSessionContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const CompanySchema = z.object({
  companyName: z.string().trim().min(1).max(160),
  legalForm: z.string().trim().max(40).nullable().optional(),
  siret: z.string().trim().max(40).nullable().optional(),
  vatNumber: z.string().trim().max(40).nullable().optional(),
  billingStreet: z.string().trim().max(200).nullable().optional(),
  billingPostalCode: z.string().trim().max(20).nullable().optional(),
  billingCity: z.string().trim().max(120).nullable().optional(),
  billingCountry: z.string().trim().max(80).nullable().optional(),
});

const blank = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null);

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const p = ctx.partner;
  return NextResponse.json({
    companyName: p.companyName,
    legalForm: p.legalForm ?? null,
    siret: p.siret ?? null,
    vatNumber: p.vatNumber ?? null,
    billingStreet: p.billingStreet ?? null,
    billingPostalCode: p.billingPostalCode ?? null,
    billingCity: p.billingCity ?? null,
    billingCountry: p.billingCountry ?? null,
  });
}

export async function PUT(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const raw = await req.json().catch(() => null);
  const parsed = CompanySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const d = parsed.data;
  await db
    .update(partners)
    .set({
      companyName: d.companyName.trim(),
      legalForm: blank(d.legalForm),
      siret: blank(d.siret),
      vatNumber: blank(d.vatNumber),
      billingStreet: blank(d.billingStreet),
      billingPostalCode: blank(d.billingPostalCode),
      billingCity: blank(d.billingCity),
      billingCountry: blank(d.billingCountry),
    })
    .where(eq(partners.id, ctx.partner.id));
  return NextResponse.json({ ok: true });
}
