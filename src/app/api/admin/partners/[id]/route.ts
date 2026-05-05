import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { updateStatus } from "@/lib/partners/service";
import { AdminStatusSchema } from "@/lib/partners/validators";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSessionContext();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const raw = await req.json().catch(() => ({}));
  const parsed = AdminStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  await updateStatus(id, parsed.data);
  return NextResponse.json({ ok: true, status: parsed.data.status });
}
