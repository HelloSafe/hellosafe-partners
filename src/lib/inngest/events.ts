/**
 * Typed event registry. Adding a new event:
 *   1. Add an entry here with `name` and `data` shape.
 *   2. Fire it via `await inngest.send({ name, data })`.
 *   3. Write a handler in `src/lib/inngest/functions/`.
 *
 * Keep names in dotted "namespace/action" form so Inngest's dashboard
 * groups them sensibly.
 */

export type Events = {
  /** A new partner just signed up. */
  "partner/signed-up": {
    data: {
      partnerId: string;
      userId: string;
      email: string;
      contactName: string;
      locale: "fr" | "en";
    };
  };

  /** Admin flipped a partner's approval status. */
  "partner/status-changed": {
    data: {
      partnerId: string;
      newStatus: "pending" | "approved" | "rejected";
      reason?: string | null;
      locale: "fr" | "en";
    };
  };

  /** A conversion was recorded (HelloSafe postback or admin sim). */
  "conversion/created": {
    data: {
      conversionId: string;
      partnerId: string;
      linkId: string | null;
      amountCents: number;
      commissionCents: number;
      currency: "EUR" | "GBP" | "USD";
      status: "pending" | "validated" | "cancelled";
    };
  };

  /** A click was logged on /r/[code]. Future: enrich with geo, etc. */
  "click/logged": {
    data: {
      linkId: string;
      partnerId: string;
      ipHash: string | null;
      userAgent: string | null;
      referer: string | null;
      country: string | null;
      subIdOverride: string | null;
    };
  };
};
