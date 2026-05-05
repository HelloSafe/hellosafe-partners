import type { EmailTemplate } from "../types";

export type ConversionNotificationData = {
  name: string;
  /** Commission amount in cents. */
  commissionCents: number;
  currency: "EUR" | "GBP" | "USD";
  /** Optional human-readable label of the link that converted. */
  linkLabel?: string | null;
  dashboardUrl: string;
};

export const conversionNotificationTemplate: EmailTemplate<ConversionNotificationData> =
  {
    id: "conversion-notification",
    render(
      { name, commissionCents, currency, linkLabel, dashboardUrl },
      locale,
    ) {
      const isEn = locale === "en";
      const greet = name?.trim() || (isEn ? "there" : "à toi");

      const formatted = new Intl.NumberFormat(isEn ? "en-US" : "fr-FR", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(commissionCents / 100);

      const subject = isEn
        ? `New commission: ${formatted}`
        : `Nouvelle commission : ${formatted}`;

      const heading = isEn
        ? `+${formatted} just landed.`
        : `+${formatted} viennent d'arriver.`;

      const linkBlock = linkLabel
        ? isEn
          ? `\nFrom your link: ${linkLabel}.`
          : `\nDepuis ton lien : ${linkLabel}.`
        : "";

      const body = isEn
        ? `Hi ${greet},\n\nA HelloSafe sale just converted on one of your tracked links.${linkBlock}\n\nNew commission: ${formatted}.\n\nDashboard: ${dashboardUrl}`
        : `Salut ${greet},\n\nUne vente HelloSafe vient de convertir sur un de tes liens traqués.${linkBlock}\n\nNouvelle commission : ${formatted}.\n\nDashboard : ${dashboardUrl}`;

      const html = `<!doctype html>
<html><body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">
  <p style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#7d7d99;margin:0;">${
    isEn ? "Commission earned" : "Commission gagnée"
  }</p>
  <h1 style="font-size:32px;font-weight:800;margin:8px 0 16px;color:#20C997;">${heading}</h1>
  <p style="font-size:15px;line-height:1.6;color:#3f3f5a;white-space:pre-line;">${escapeHtml(body)}</p>
  <p style="margin-top:32px;"><a href="${dashboardUrl}" style="background:#563BFF;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;display:inline-block;">${
        isEn ? "Open dashboard" : "Ouvrir le dashboard"
      }</a></p>
</body></html>`;

      return { subject, html, text: body };
    },
  };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
