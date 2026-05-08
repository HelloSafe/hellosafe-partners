import { redirect } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";

/**
 * Legacy URL — the branding form has been moved to the profile tab system
 * at /dashboard/admin/profile?tab=brand. We redirect existing bookmarks so
 * nothing breaks.
 */
export default async function LegacyBrandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({
    href: "/dashboard/admin/profile?tab=brand",
    locale: locale as "fr",
  });
}
