import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { listBaselineCoverages } from "@/lib/coach/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "fr";
  const out = await listBaselineCoverages(ctx.partner.id, locale);
  return NextResponse.json(out);
}
