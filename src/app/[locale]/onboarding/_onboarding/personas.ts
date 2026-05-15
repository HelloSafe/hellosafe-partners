/**
 * Persona definitions for the onboarding wizard. Drives:
 *  - the cards shown in Step1 (icon + i18n label key)
 *  - the first-action redirect at finish
 *  - the suggestion copy slot in Step3
 *
 * Labels and suggestion copy live in messages/{locale}.json under
 * `onboarding.personas` and `onboarding.step3.suggestions`.
 */

export type Persona = "blog" | "agency" | "visa" | "creator" | "other";

export const PERSONAS: ReadonlyArray<{ id: Persona; icon: string }> = [
  { id: "blog", icon: "✍️" },
  { id: "agency", icon: "🏢" },
  { id: "visa", icon: "🛂" },
  { id: "creator", icon: "📸" },
  { id: "other", icon: "✨" },
];

/** Send the user to the most relevant first action by persona. */
export function personaFirstAction(p: Persona | null): string {
  // Every persona is now an affiliate at heart: generate links, drive
  // traffic to hellosafe.com, get paid on conversions. Agencies in
  // particular use the public Coach on hellosafe.com and share its
  // URL with clients via WhatsApp/email through their tracked link.
  void p;
  return "/dashboard/links";
}

/**
 * Slot key under `onboarding.step3.suggestions.<slot>` to use for the given
 * persona. Several personas share the same slot.
 */
export function personaSuggestionSlot(
  p: Persona | null,
): "agency" | "blogCreator" | "visa" | "other" {
  switch (p) {
    case "agency":
      return "agency";
    case "blog":
    case "creator":
      return "blogCreator";
    case "visa":
      return "visa";
    default:
      return "other";
  }
}
