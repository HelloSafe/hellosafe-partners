import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { partners } from "@/db/schema";
import { getSessionContext } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSessionContext();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as {
    status?: "pending" | "approved" | "rejected";
  };

  if (!body.status || !["pending", "approved", "rejected"].includes(body.status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  await db
    .update(partners)
    .set({
      status: body.status,
      approvedAt: body.status === "approved" ? new Date() : null,
    })
    .where(eq(partners.id, id));

  return NextResponse.json({ ok: true, status: body.status });
}
