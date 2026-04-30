import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { coverageProfiles } from "@/db/schema";
import { getSessionContext } from "@/lib/session";
import type { CoverageData } from "@/lib/coverage-types";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSessionContext();
  if (!session?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const rows = await db
    .select()
    .from(coverageProfiles)
    .where(
      and(
        eq(coverageProfiles.id, id),
        eq(coverageProfiles.partnerId, session.partner.id),
        eq(coverageProfiles.type, "partner_contract"),
      ),
    )
    .limit(1);
  if (!rows[0]) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ contract: rows[0] });
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSessionContext();
  if (!session?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as
    | {
        name?: string;
        issuer?: string;
        notes?: string;
        active?: boolean;
        data?: CoverageData;
      }
    | null;
  if (!body) {
    return NextResponse.json({ error: "MISSING_BODY" }, { status: 400 });
  }
  await db
    .update(coverageProfiles)
    .set({
      ...(body.name && { name: body.name }),
      ...(body.issuer !== undefined && { issuer: body.issuer ?? null }),
      ...(body.notes !== undefined && { notes: body.notes ?? null }),
      ...(typeof body.active === "boolean" && { active: body.active }),
      ...(body.data && { data: body.data }),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(coverageProfiles.id, id),
        eq(coverageProfiles.partnerId, session.partner.id),
        eq(coverageProfiles.type, "partner_contract"),
      ),
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSessionContext();
  if (!session?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await db
    .delete(coverageProfiles)
    .where(
      and(
        eq(coverageProfiles.id, id),
        eq(coverageProfiles.partnerId, session.partner.id),
        eq(coverageProfiles.type, "partner_contract"),
      ),
    );
  return NextResponse.json({ ok: true });
}
