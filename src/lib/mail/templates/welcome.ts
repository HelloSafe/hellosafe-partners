import type { EmailTemplate } from "../types";

export type WelcomeData = {
  /** Display name. Falls back to "there" if empty. */
  name: string;
  /** Login URL the partner can use to sign back in. */
  loginUrl: string;
};

export const welcomeTemplate: EmailTemplate<WelcomeData> = {
  id: "welcome",
  render({ name, loginUrl }, locale) {
    const isEn = locale === "en";
    const greet = name?.trim() || (isEn ? "there" : "à toi");

    const subject = isEn
      ? "Welcome to HelloSafe Partners"
      : "Bienvenue sur HelloSafe Partners";

    const heading = isEn
      ? "You're in. Now wait for our team to validate your account."
      : "Tu es inscrit. Notre équipe va valider ton compte.";

    const body = isEn
      ? `Hi ${greet},\n\nThanks for joining HelloSafe Partners. Our team reviews every signup to keep the network clean — typically within 24 working hours. You'll get a follow-up email the moment your account is validated.\n\nIn the meantime, you can sign back in here: ${loginUrl}`
      : `Salut ${greet},\n\nMerci d'avoir rejoint HelloSafe Partners. Notre équipe valide chaque inscription pour garder le réseau propre — en général sous 24h ouvrées. Tu recevras un email dès que ton compte est validé.\n\nEn attendant tu peux te reconnecter ici : ${loginUrl}`;

    const html = `<!doctype html>
<html><body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">
  <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;">${heading}</h1>
  <p style="font-size:15px;line-height:1.6;color:#3f3f5a;white-space:pre-line;">${escapeHtml(body)}</p>
  <p style="margin-top:32px;"><a href="${loginUrl}" style="background:#563BFF;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;display:inline-block;">${
      isEn ? "Sign in" : "Se connecter"
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
