import "server-only";
import { send } from "@/lib/mail";
import { appUrl } from "@/lib/app-url";

/**
 * Internal inbox that receives "new partner to review" alerts. Defaults to the
 * shared support address; override with SUPPORT_EMAIL in prod.
 */
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@hellosafe.com";

/**
 * Tell the team a partner has finished their profile and is waiting in the
 * review queue. Fired from BOTH signup paths at the moment profileCompletedAt
 * is stamped — email/password (api/auth/signup) and OAuth
 * (api/account/complete-profile). Never throws: a mail hiccup must not break
 * account creation, so failures are swallowed and logged.
 */
export async function notifyAdminNewPartner(input: {
  partnerName: string;
  partnerEmail: string;
  companyName: string;
  website?: string | null;
}): Promise<void> {
  try {
    await send({
      to: SUPPORT_EMAIL,
      template: "admin-new-partner",
      data: { ...input, reviewUrl: `${appUrl()}/admin` },
      locale: "fr",
    });
  } catch (e) {
    console.error("[mail] admin-new-partner failed", e);
  }
}
