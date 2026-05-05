import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_URL, resolveAndLogClick } from "@/lib/links/service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;

  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const resolved = await resolveAndLogClick(code, {
    ip,
    userAgent: req.headers.get("user-agent") ?? null,
    referer: req.headers.get("referer") ?? null,
    country: req.headers.get("x-vercel-ip-country") ?? null,
    subIdOverride: req.nextUrl.searchParams.get("subid"),
  });

  if (!resolved) {
    return NextResponse.redirect(FALLBACK_URL, { status: 307 });
  }

  const res = NextResponse.redirect(resolved.targetUrl, { status: 302 });
  res.cookies.set("hs_ref", `${resolved.partnerCode}-${resolved.shortCode}`, {
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
  });
  return res;
}
