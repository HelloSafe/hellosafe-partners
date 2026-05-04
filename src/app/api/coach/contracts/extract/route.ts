import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { extractContractFromText } from "@/lib/coach/service";
import { ExtractContractSchema } from "@/lib/coach/validators";

export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const raw = await req.json().catch(() => null);
  const parsed = ExtractContractSchema.safeParse(raw);
  const text = parsed.success ? parsed.data.text : "";
  const out = extractContractFromText(text);
  return NextResponse.json({ ok: true, ...out });
}
