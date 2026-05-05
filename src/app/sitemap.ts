import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";

/** Static landing routes (without locale prefix). */
const STATIC_PATHS = [
  "/",
  "/why-partner",
  "/how-it-works",
  "/faq",
  "/signup",
  "/login",
] as const;

const PERSONA_SLUGS = [
  "blog",
  "agency",
  "visa",
  "creator",
  "student",
] as const;

const PERSONA_PATHS = PERSONA_SLUGS.map((s) => `/for/${s}`);

const ALL_PATHS = [...STATIC_PATHS, ...PERSONA_PATHS];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ALL_PATHS.flatMap((path) =>
    routing.locales.map((locale) => {
      const cleaned = path === "/" ? "" : path;
      const url = `${SITE_URL}/${locale}${cleaned}`;
      // Build hreflang alternates pointing to all the localized URLs.
      const languages: Record<string, string> = {};
      for (const l of routing.locales) {
        languages[l] = `${SITE_URL}/${l}${cleaned}`;
      }
      languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${cleaned}`;
      // Priority + changefreq heuristics: home > landing > auth.
      const isHome = path === "/";
      const isAuth = path === "/signup" || path === "/login";
      const priority = isHome ? 1.0 : isAuth ? 0.4 : 0.8;
      return {
        url,
        lastModified,
        changeFrequency: isHome ? "weekly" : ("monthly" as const),
        priority,
        alternates: { languages },
      };
    }),
  );
}
