import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { listConversions } from "@/lib/admin/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx || ctx.user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const conversions = await listConversions();
  return NextResponse.json({ conversions });
}
