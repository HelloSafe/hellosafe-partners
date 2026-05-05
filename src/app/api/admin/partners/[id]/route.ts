import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import { getByIdWithEmail, updateStatus } from "@/lib/partners/service";
import { AdminStatusSchema } from "@/lib/partners/validators";
import { send } from "@/lib/mail";
import { appUrl } from "@/lib/app-url";
import { captureServer } from "@/lib/analytics/server";

const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL ?? "support@hellosafe.com";

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

  // Notify the partner via email — only when the status is a final
  // decision (approved / rejected). "pending" is a manual rollback and
  // doesn't deserve an email.
  if (parsed.data.status === "approved" || parsed.data.status === "rejected") {
    const partner = await getByIdWithEmail(id);
    if (partner) {
      const template =
        parsed.data.status === "approved"
          ? "partner-approved"
          : "partner-rejected";
      const data =
        parsed.data.status === "approved"
          ? {
              name: partner.contactName,
              dashboardUrl: `${appUrl()}/dashboard`,
            }
          : {
              name: partner.contactName,
              reason: null,
              contactEmail: SUPPORT_EMAIL,
            };
      send({
        to: partner.email,
        // Discriminated union: TS picks the right shape from `template`.
        template: template as never,
        data: data as never,
        locale: "fr",
      }).catch((e) => console.error(`[mail] ${template} failed`, e));

      captureServer(partner.id, "partner_status_changed", {
        partnerId: partner.id,
        status: parsed.data.status,
      });
    }
  }

  return NextResponse.json({ ok: true, status: parsed.data.status });
}
