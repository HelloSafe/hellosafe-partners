import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

/** Site root URL — set via NEXT_PUBLIC_APP_URL in Vercel env. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://hellosafe-partners.vercel.app";

const OG_LOCALE: Record<string, string> = {
  fr: "fr_FR",
  en: "en_US",
};

/** Build language alternates (hreflang) for a given canonical path
 *  (path WITHOUT the locale prefix, e.g. "/why-partner" or "" for the home).
 *  next-intl emits routes like `/{locale}{path}`. */
function languagesFor(path: string): Record<string, string> {
  const cleaned = path === "/" ? "" : path;
  const alternates: Record<string, string> = {};
  for (const l of routing.locales) {
    alternates[l] = `/${l}${cleaned}`;
  }
  alternates["x-default"] = `/${routing.defaultLocale}${cleaned}`;
  return alternates;
}

type PageMetaArgs = {
  locale: string;
  /** Path WITHOUT the locale prefix, e.g. "/why-partner". Use "/" for the home. */
  path: string;
  /** Translation key under `seo.pages.*` for the title (without site suffix). */
  titleKey?: string;
  /** Translation key under `seo.pages.*` for the description. */
  descriptionKey?: string;
  /** Override the title with a literal string (used by persona pages). */
  title?: string;
  /** Override the description with a literal string. */
  description?: string;
  /** Index/follow flags. Default: index, follow. */
  noindex?: boolean;
};

/**
 * Build a fully populated Next.js Metadata object for a landing page,
 * including canonical, hreflang, OpenGraph and Twitter card.
 *
 * Usage in a server component / page.tsx:
 *
 *   export async function generateMetadata({ params }) {
 *     const { locale } = await params;
 *     return pageMetadata({ locale, path: "/why-partner", titleKey: "whyPartner" });
 *   }
 */
export async function pageMetadata({
  locale,
  path,
  titleKey,
  descriptionKey,
  title,
  description,
  noindex,
}: PageMetaArgs): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo" });
  const resolvedTitle = title ?? (titleKey ? t(`pages.${titleKey}.title`) : t("siteTitle"));
  const resolvedDesc =
    description ??
    (descriptionKey
      ? t(`pages.${descriptionKey}.description`)
      : titleKey
        ? t(`pages.${titleKey}.description`)
        : t("siteDescription"));
  const cleaned = path === "/" ? "" : path;
  const canonical = `/${locale}${cleaned}`;
  const ogImage = `/${locale}/opengraph-image`;
  return {
    metadataBase: new URL(SITE_URL),
    title: resolvedTitle,
    description: resolvedDesc,
    alternates: {
      canonical,
      languages: languagesFor(path),
    },
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      title: resolvedTitle,
      description: resolvedDesc,
      url: canonical,
      locale: OG_LOCALE[locale] ?? OG_LOCALE.fr,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDesc,
      images: [ogImage],
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
