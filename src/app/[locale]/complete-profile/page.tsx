import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSessionContext } from "@/lib/session";
import { CompleteProfileForm } from "./CompleteProfileForm";

/**
 * Profile-completion step for OAuth (Google) signups. Better Auth created the
 * user + a pending partner via the auth hook, but with no company/site info —
 * we collect that here before the account goes to review. Email/password
 * signups never land here (their form already completed the profile).
 */
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
    return null;
  }
  // No partner row at all → the dashboard status card explains what to do.
  if (!ctx.partner) {
    redirect({ href: "/dashboard", locale: locale as "fr" | "en" });
    return null;
  }
  // Already completed → nothing to do here.
  if (ctx.partner.profileCompletedAt) {
    redirect({ href: "/dashboard", locale: locale as "fr" | "en" });
    return null;
  }

  const p = ctx.partner;
  return (
    <CompleteProfileForm
      initial={{
        // companyName is a placeholder derived from the user's name at signup,
        // not a real company — start blank so they type the real one.
        companyName: "",
        contactName: p.contactName ?? "",
        website: p.website ?? "",
        audience: p.audience ?? "",
        country: p.country ?? "FR",
        monthlyVisitors:
          p.monthlyVisitors != null ? String(p.monthlyVisitors) : "",
      }}
    />
  );
}
