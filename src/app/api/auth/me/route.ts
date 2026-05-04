import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { partners } from "@/db/schema";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ user: null });

  const partnerRows = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, session.user.id))
    .limit(1);
  const partner = partnerRows[0] ?? null;

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as { role?: string }).role ?? "partner",
    },
    partner: partner
      ? {
          id: partner.id,
          partnerCode: partner.partnerCode,
          companyName: partner.companyName,
          contactName: partner.contactName,
          status: partner.status,
          persona: partner.persona,
          onboardedAt: partner.onboardedAt,
        }
      : null,
  });
}
