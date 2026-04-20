import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
    },
    partner: ctx.partner
      ? {
          id: ctx.partner.id,
          partnerCode: ctx.partner.partnerCode,
          companyName: ctx.partner.companyName,
          contactName: ctx.partner.contactName,
          status: ctx.partner.status,
        }
      : null,
  });
}
