import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { deleteAnalysis, getAnalysis } from "@/lib/coach/service";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSessionContext();
  if (!session?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const analysis = await getAnalysis(session.partner.id, id);
  if (!analysis) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ analysis });
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
  await deleteAnalysis(session.partner.id, id);
  return NextResponse.json({ ok: true });
}
