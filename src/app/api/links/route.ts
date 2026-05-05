import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { createLink, listLinksWithStats } from "@/lib/links/service";
import { CreateLinkSchema } from "@/lib/links/validators";
import { DESTINATIONS } from "@/lib/links/destinations";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const links = await listLinksWithStats(ctx.partner.id);
  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (ctx.partner.status !== "approved") {
    return NextResponse.json({ error: "PARTNER_NOT_APPROVED" }, { status: 403 });
  }
  const raw = await req.json().catch(() => ({}));
  const parsed = CreateLinkSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_DESTINATION", allowed: DESTINATIONS },
      { status: 400 },
    );
  }
  const link = await createLink(ctx.partner.id, parsed.data);
  return NextResponse.json({ ok: true, link }, { status: 201 });
}
