import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import {
  deleteContract,
  getContract,
  updateContract,
} from "@/lib/coach/service";
import { UpdateContractSchema } from "@/lib/coach/validators";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSessionContext();
  if (!session?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const contract = await getContract(session.partner.id, id);
  if (!contract) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ contract });
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
  const raw = await req.json().catch(() => null);
  const parsed = UpdateContractSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "MISSING_BODY" }, { status: 400 });
  }
  await updateContract(session.partner.id, id, parsed.data);
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
  await deleteContract(session.partner.id, id);
  return NextResponse.json({ ok: true });
}
