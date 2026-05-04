import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { createContract, listContracts } from "@/lib/coach/service";
import { CreateContractSchema } from "@/lib/coach/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const contracts = await listContracts(ctx.partner.id);
  return NextResponse.json({ contracts });
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const raw = await req.json().catch(() => null);
  const parsed = CreateContractSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  const { id } = await createContract(ctx.partner.id, parsed.data);
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
