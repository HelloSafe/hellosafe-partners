import { eq } from "drizzle-orm";
import { db } from "@/db";
import { partners, trackedLinks, users } from "@/db/schema";
import { send } from "@/lib/mail";
import { appUrl } from "@/lib/app-url";
import { inngest } from "../client";

/**
 * On `conversion/created`: send the partner a notification email when the
 * conversion is validated. We skip pending and cancelled conversions —
 * the partner only cares about money that's actually theirs.
 *
 * Inngest gives us automatic retries with exponential backoff, so a
 * Resend hiccup doesn't drop the email.
 */
export const conversionCreatedNotify = inngest.createFunction(
  {
    id: "conversion-created-notify",
    name: "Notify partner on validated conversion",
    triggers: [{ event: "conversion/created" }],
  },
  async ({ event, step }) => {
    const data = event.data as {
      conversionId: string;
      partnerId: string;
      linkId: string | null;
      amountCents: number;
      commissionCents: number;
      currency: "EUR" | "GBP" | "USD";
      status: "pending" | "validated" | "cancelled";
    };
    if (data.status !== "validated") {
      // Pending / cancelled don't trigger an email. Future: queue a delayed
      // retry to re-check the status after 7 days.
      return { skipped: "not-validated" };
    }

    const partnerInfo = await step.run("load-partner", async () => {
      const rows = await db
        .select({
          contactName: partners.contactName,
          email: users.email,
        })
        .from(partners)
        .innerJoin(users, eq(users.id, partners.userId))
        .where(eq(partners.id, data.partnerId))
        .limit(1);
      return rows[0] ?? null;
    });

    if (!partnerInfo) return { skipped: "partner-not-found" };

    const linkLabel = data.linkId
      ? await step.run("load-link", async () => {
          const rows = await db
            .select({ label: trackedLinks.label })
            .from(trackedLinks)
            .where(eq(trackedLinks.id, data.linkId!))
            .limit(1);
          return rows[0]?.label ?? null;
        })
      : null;

    const result = await step.run("send-mail", () =>
      send({
        to: partnerInfo.email,
        template: "conversion-notification",
        data: {
          name: partnerInfo.contactName,
          commissionCents: data.commissionCents,
          currency: data.currency,
          linkLabel,
          dashboardUrl: `${appUrl()}/dashboard`,
        },
        locale: "fr",
      }),
    );

    return { mailResult: result };
  },
);
