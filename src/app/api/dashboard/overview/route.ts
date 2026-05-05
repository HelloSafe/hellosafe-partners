import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { getOverview } from "@/lib/dashboard/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner || ctx.partner.status !== "approved") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const out = await getOverview(ctx.partner);
  return NextResponse.json(out);
}
