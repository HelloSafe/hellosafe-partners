import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import {
  PostbackError,
  simulateConversionForShortCode,
} from "@/lib/postback/service";
import { SimulateConversionSchema } from "@/lib/postback/validators";

/**
 * Admin helper: simulate a HelloSafe conversion postback for a given link.
 * Useful for local demos when there is no real HelloSafe backoffice
 * hitting /api/postback/conversion.
 */
export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx || ctx.user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = SimulateConversionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "MISSING_SHORTCODE" }, { status: 400 });
  }

  try {
    const out = await simulateConversionForShortCode(parsed.data);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    if (e instanceof PostbackError) {
      return NextResponse.json({ error: e.code }, { status: e.httpStatus });
    }
    throw e;
  }
}
