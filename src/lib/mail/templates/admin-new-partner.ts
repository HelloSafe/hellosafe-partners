import type { EmailTemplate } from "../types";

export type AdminNewPartnerData = {
  /** Contact name the partner submitted. */
  partnerName: string;
  /** Partner's login email — lets the admin recognise/contact them. */
  partnerEmail: string;
  /** Company / site name. */
  companyName: string;
  /** Optional website the partner declared. */
  website?: string | null;
  /** Link to the admin back-office where the partner can be reviewed. */
  reviewUrl: string;
};

/**
 * Internal alert sent to the team when a partner finishes their profile and
 * lands in the "pending" review queue. Not a customer-facing email — it exists
 * so signups don't silently stall waiting for validation.
 */
export const adminNewPartnerTemplate: EmailTemplate<AdminNewPartnerData> = {
  id: "admin-new-partner",
  render(
    { partnerName, partnerEmail, companyName, website, reviewUrl },
    locale,
  ) {
    const isEn = locale === "en";

    const subject = isEn
      ? `New partner to review: ${companyName}`
      : `Nouveau partenaire à valider : ${companyName}`;

    const heading = isEn
      ? "A new partner is waiting for review"
      : "Un nouveau partenaire attend ta validation";

    const lines = isEn
      ? [
          `Company: ${companyName}`,
          `Contact: ${partnerName}`,
          `Email: ${partnerEmail}`,
          website ? `Website: ${website}` : null,
        ]
      : [
          `Société : ${companyName}`,
          `Contact : ${partnerName}`,
          `Email : ${partnerEmail}`,
          website ? `Site : ${website}` : null,
        ];

    const body = lines.filter(Boolean).join("\n");

    const html = `<!doctype html>
<html><body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">
  <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;">${heading}</h1>
  <p style="font-size:15px;line-height:1.6;color:#3f3f5a;white-space:pre-line;">${escapeHtml(body)}</p>
  <p style="margin-top:32px;"><a href="${reviewUrl}" style="background:#563BFF;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;display:inline-block;">${
    isEn ? "Review in the back-office" : "Ouvrir le back-office"
  }</a></p>
</body></html>`;

    return { subject, html, text: `${body}\n\n${reviewUrl}` };
  },
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
