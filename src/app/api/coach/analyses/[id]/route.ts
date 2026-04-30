import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { gapAnalyses } from "@/db/schema";
import { getSessionContext } from "@/lib/session";

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
    .from(gapAnalyses)
    .where(
      and(eq(gapAnalyses.id, id), eq(gapAnalyses.partnerId, session.partner.id)),
    )
    .limit(1);
  if (!rows[0]) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ analysis: rows[0] });
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
    .delete(gapAnalyses)
    .where(
      and(eq(gapAnalyses.id, id), eq(gapAnalyses.partnerId, session.partner.id)),
    );
  return NextResponse.json({ ok: true });
}
