import type { EmailTemplate } from "../types";

export type PartnerApprovedData = {
  name: string;
  dashboardUrl: string;
};

export const partnerApprovedTemplate: EmailTemplate<PartnerApprovedData> = {
  id: "partner-approved",
  render({ name, dashboardUrl }, locale) {
    const isEn = locale === "en";
    const greet = name?.trim() || (isEn ? "there" : "à toi");

    const subject = isEn
      ? "Your HelloSafe Partners account is live"
      : "Ton compte HelloSafe Partners est actif";

    const heading = isEn
      ? "Welcome aboard. Time to ship your first link."
      : "Bienvenue. Place à ton premier lien traqué.";

    const body = isEn
      ? `Hi ${greet},\n\nGood news: your account is approved. You can now generate tracked links, run Coach analyses for your clients, and start earning recurring commissions.\n\nJump in: ${dashboardUrl}`
      : `Salut ${greet},\n\nBonne nouvelle : ton compte est validé. Tu peux maintenant générer des liens traqués, lancer des analyses Coach pour tes clients, et toucher des commissions récurrentes.\n\nVas-y : ${dashboardUrl}`;

    const html = `<!doctype html>
<html><body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">
  <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;">${heading}</h1>
  <p style="font-size:15px;line-height:1.6;color:#3f3f5a;white-space:pre-line;">${escapeHtml(body)}</p>
  <p style="margin-top:32px;"><a href="${dashboardUrl}" style="background:#563BFF;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;display:inline-block;">${
      isEn ? "Open my dashboard" : "Ouvrir mon dashboard"
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
