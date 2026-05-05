import type { EmailTemplate } from "../types";

export type PartnerRejectedData = {
  name: string;
  /** Optional admin reason — shown only when present. */
  reason?: string | null;
  contactEmail: string;
};

export const partnerRejectedTemplate: EmailTemplate<PartnerRejectedData> = {
  id: "partner-rejected",
  render({ name, reason, contactEmail }, locale) {
    const isEn = locale === "en";
    const greet = name?.trim() || (isEn ? "there" : "à toi");

    const subject = isEn
      ? "About your HelloSafe Partners application"
      : "À propos de ta candidature HelloSafe Partners";

    const heading = isEn
      ? "We can't accept your application right now."
      : "On ne peut pas valider ta candidature pour le moment.";

    const reasonBlock = reason?.trim()
      ? isEn
        ? `\n\nReason from our team: ${reason}`
        : `\n\nMotif de notre équipe : ${reason}`
      : "";

    const body = isEn
      ? `Hi ${greet},\n\nThanks for applying to HelloSafe Partners. After review, we can't accept your account at this stage.${reasonBlock}\n\nIf you think this is a mistake or want to discuss it, reach out to ${contactEmail}.`
      : `Salut ${greet},\n\nMerci pour ta candidature à HelloSafe Partners. Après examen, on ne peut pas valider ton compte à ce stade.${reasonBlock}\n\nSi tu penses que c'est une erreur ou veux en discuter, écris-nous à ${contactEmail}.`;

    const html = `<!doctype html>
<html><body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">
  <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;">${heading}</h1>
  <p style="font-size:15px;line-height:1.6;color:#3f3f5a;white-space:pre-line;">${escapeHtml(body)}</p>
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
