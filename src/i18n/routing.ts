import { defineRouting } from "next-intl/routing";

/**
 * Active locales served to end users.
 *
 * 🇫🇷 FR-only validation phase: EN is intentionally disabled while we polish
 * the French product end-to-end (landing pages, signup, onboarding, dashboard,
 * Coach). Once FR is validated we'll re-enable EN and start scaling to 30+
 * locales.
 *
 * Old /en/* URLs are redirected to /fr/* via the proxy (see src/proxy.ts).
 */
export const routing = defineRouting({
  locales: ["fr"],
  defaultLocale: "fr",
});

export type Locale = (typeof routing.locales)[number];
