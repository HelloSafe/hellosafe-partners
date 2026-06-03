import type { EmailTemplate } from "../types";

export type ResetPasswordData = {
  /** Display name. Falls back to a neutral greeting if empty. */
  name: string;
  /** One-time URL that opens the reset form (validated token embedded). */
  resetUrl: string;
};

export const resetPasswordTemplate: EmailTemplate<ResetPasswordData> = {
  id: "reset-password",
  render({ name, resetUrl }, locale) {
    const isEn = locale === "en";
    const greet = name?.trim() || (isEn ? "there" : "à toi");

    const subject = isEn
      ? "Reset your HelloSafe Partners password"
      : "Réinitialise ton mot de passe HelloSafe Partners";

    const heading = isEn
      ? "Reset your password"
      : "Réinitialise ton mot de passe";

    const body = isEn
      ? `Hi ${greet},\n\nWe received a request to reset your HelloSafe Partners password. Use the button below to choose a new one — this link is valid for 1 hour.\n\nIf you didn't request this, just ignore this email: your password stays unchanged.\n\nReset link: ${resetUrl}`
      : `Salut ${greet},\n\nNous avons reçu une demande de réinitialisation de ton mot de passe HelloSafe Partners. Utilise le bouton ci-dessous pour en choisir un nouveau — ce lien est valable 1 heure.\n\nSi tu n'es pas à l'origine de cette demande, ignore simplement cet email : ton mot de passe reste inchangé.\n\nLien de réinitialisation : ${resetUrl}`;

    const html = `<!doctype html>
<html><body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">
  <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;">${heading}</h1>
  <p style="font-size:15px;line-height:1.6;color:#3f3f5a;white-space:pre-line;">${escapeHtml(body)}</p>
  <p style="margin-top:32px;"><a href="${resetUrl}" style="background:#563BFF;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;display:inline-block;">${
      isEn ? "Choose a new password" : "Choisir un nouveau mot de passe"
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
