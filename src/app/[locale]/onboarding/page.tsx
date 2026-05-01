import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSessionContext } from "@/lib/session";
import { OnboardingFlow } from "./OnboardingFlow";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const ctx = await getSessionContext();
  if (!ctx) {
    redirect({ href: "/login", locale: locale as "fr" | "en" });
  }
  if (ctx && !ctx.partner) {
    redirect({ href: "/dashboard", locale: locale as "fr" | "en" });
  }
  // If already onboarded, send straight to the dashboard.
  if (ctx?.partner?.onboardedAt) {
    redirect({ href: "/dashboard", locale: locale as "fr" | "en" });
  }

  return <OnboardingFlow />;
}
