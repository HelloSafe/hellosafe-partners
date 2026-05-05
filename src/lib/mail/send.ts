import "server-only";
import { getResend, MAIL_FROM } from "./client";
import { conversionNotificationTemplate } from "./templates/conversion-notification";
import { partnerApprovedTemplate } from "./templates/partner-approved";
import { partnerRejectedTemplate } from "./templates/partner-rejected";
import { welcomeTemplate } from "./templates/welcome";
import type {
  EmailTemplate,
  Locale,
  RenderedEmail,
} from "./types";
import type { ConversionNotificationData } from "./templates/conversion-notification";
import type { PartnerApprovedData } from "./templates/partner-approved";
import type { PartnerRejectedData } from "./templates/partner-rejected";
import type { WelcomeData } from "./templates/welcome";

/**
 * Strongly-typed mail sender. Each template id maps to its data shape so
 * `mail.send("welcome", { invalid: 1 })` is a compile error.
 *
 * If RESEND_API_KEY is not configured, the function logs a warning to the
 * console and returns null. Calling code should treat email as best-effort
 * (we don't fail user requests on mail issues).
 *
 * The provider is hidden behind this function. Swapping Resend for
 * Postmark / SES means changing this file alone.
 */

type TemplateMap = {
  welcome: { template: EmailTemplate<WelcomeData>; data: WelcomeData };
  "partner-approved": {
    template: EmailTemplate<PartnerApprovedData>;
    data: PartnerApprovedData;
  };
  "partner-rejected": {
    template: EmailTemplate<PartnerRejectedData>;
    data: PartnerRejectedData;
  };
  "conversion-notification": {
    template: EmailTemplate<ConversionNotificationData>;
    data: ConversionNotificationData;
  };
};

const TEMPLATES: { [K in keyof TemplateMap]: TemplateMap[K]["template"] } = {
  welcome: welcomeTemplate,
  "partner-approved": partnerApprovedTemplate,
  "partner-rejected": partnerRejectedTemplate,
  "conversion-notification": conversionNotificationTemplate,
};

export type SendOptions<K extends keyof TemplateMap> = {
  to: string | string[];
  template: K;
  data: TemplateMap[K]["data"];
  locale?: Locale;
  /** Optional reply-to override; otherwise the From's address is used. */
  replyTo?: string;
};

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "no-provider" | "send-failed"; error?: string };

/** Send a typed email. Returns null when the provider is not configured. */
export async function send<K extends keyof TemplateMap>(
  opts: SendOptions<K>,
): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      `[mail] RESEND_API_KEY not set — skipping ${opts.template} to ${
        Array.isArray(opts.to) ? opts.to.join(",") : opts.to
      }`,
    );
    return { ok: false, reason: "no-provider" };
  }

  const tpl = TEMPLATES[opts.template];
  const rendered: RenderedEmail = tpl.render(
    opts.data as never,
    opts.locale ?? "fr",
  );

  try {
    const r = await resend.emails.send({
      from: MAIL_FROM,
      to: opts.to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    if (r.error) {
      return { ok: false, reason: "send-failed", error: r.error.message };
    }
    return { ok: true, id: r.data?.id ?? "" };
  } catch (e) {
    return {
      ok: false,
      reason: "send-failed",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
