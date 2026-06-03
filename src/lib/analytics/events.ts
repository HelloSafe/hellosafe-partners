/**
 * Typed event registry for PostHog. Each event has a stable string id
 * and a typed payload. Use the union to invoke `track()` with correct
 * properties at the call site.
 *
 * Naming: snake_case verbs that describe what happened
 * (e.g. `signup_completed`, not `user_was_created`).
 */

export type AnalyticsEvent =
  | { name: "page_viewed"; props: { path: string; locale?: string } }
  | { name: "signup_started"; props: { source?: string } }
  | {
      name: "signup_completed";
      props: { partnerId: string; persona?: string };
    }
  | { name: "login_completed"; props: { method: "email" | "google" } }
  | { name: "logout"; props: Record<string, never> }
  | { name: "profile_completed"; props: Record<string, never> }
  | { name: "onboarding_step"; props: { step: 1 | 2 | 3; persona?: string } }
  | { name: "onboarding_completed"; props: { persona?: string } }
  | {
      name: "link_created";
      props: { destination: string; partnerId: string; campaign?: string };
    }
  | { name: "coach_analysis_started"; props: { partnerId: string } }
  | {
      name: "coach_analysis_completed";
      props: { partnerId: string; score: number; criticalGaps: number };
    }
  | { name: "contract_created"; props: { partnerId: string } }
  | {
      name: "conversion_received";
      props: {
        partnerId: string;
        commissionCents: number;
        status: "pending" | "validated" | "cancelled";
      };
    }
  | {
      name: "partner_status_changed";
      props: { partnerId: string; status: "approved" | "rejected" };
    }
  | { name: "perk_code_copied"; props: { brand: string } }
  | { name: "perk_offer_opened"; props: { brand: string } };

export type EventName = AnalyticsEvent["name"];

export type EventProps<N extends EventName> = Extract<
  AnalyticsEvent,
  { name: N }
>["props"];
