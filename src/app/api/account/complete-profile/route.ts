import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { completeProfile } from "@/lib/partners/service";
import { CompleteProfileSchema } from "@/lib/partners/validators";

export const dynamic = "force-dynamic";

/**
 * Profile completion for OAuth (Google) signups. The user already has a
 * session and a partner row (provisioned by the auth `user.create` hook);
 * this fills in the company / site details and stamps profileCompletedAt so
 * the dashboard stops redirecting them here and the account moves to review.
 *
 * Distinct from /api/account/profile, which owns the post-approval "Compte"
 * tab (contactName only).
 */
export async function PUT(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = CompleteProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message ?? "MISSING_FIELDS";
    return NextResponse.json({ error: code }, { status: 400 });
  }

  await completeProfile(ctx.partner.id, parsed.data);
  return NextResponse.json({ ok: true });
}
