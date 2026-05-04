import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { createAnalysis, listAnalyses } from "@/lib/coach/service";
import { RunAnalysisInputSchema } from "@/lib/coach/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const analyses = await listAnalyses(ctx.partner.id);
  return NextResponse.json({ analyses });
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (ctx.partner.status !== "approved") {
    return NextResponse.json({ error: "PARTNER_NOT_APPROVED" }, { status: 403 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = RunAnalysisInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "MISSING_INPUTS", required: "inputs.client.label and trip details" },
      { status: 400 },
    );
  }
  const { inputs, locale: rawLocale } = parsed.data;
  const locale: "fr" | "en" = rawLocale === "en" ? "en" : "fr";

  const { id, output } = await createAnalysis(ctx.partner.id, inputs, locale);
  return NextResponse.json({ ok: true, id, output }, { status: 201 });
}
