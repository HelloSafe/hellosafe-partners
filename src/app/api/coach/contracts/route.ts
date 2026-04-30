import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { coverageProfiles } from "@/db/schema";
import { getSessionContext } from "@/lib/session";
import { newId } from "@/lib/ids";
import type { CoverageData } from "@/lib/coverage-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(coverageProfiles)
    .where(
      and(
        eq(coverageProfiles.partnerId, ctx.partner.id),
        eq(coverageProfiles.type, "partner_contract"),
      ),
    )
    .orderBy(desc(coverageProfiles.createdAt));
  return NextResponse.json({ contracts: rows });
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as
    | {
        name?: string;
        issuer?: string;
        notes?: string;
        active?: boolean;
        data?: CoverageData;
      }
    | null;
  if (!body?.name || !body.data) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  const id = newId();
  await db.insert(coverageProfiles).values({
    id,
    partnerId: ctx.partner.id,
    type: "partner_contract",
    source: "manual",
    name: body.name,
    issuer: body.issuer ?? null,
    locale: "fr",
    country: "FR",
    data: body.data,
    active: body.active ?? true,
    notes: body.notes ?? null,
  });
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
