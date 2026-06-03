import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSessionContext } from "@/lib/session";
import { DashboardShell, type DashboardSession } from "./DashboardShell";
import { DashboardStatusCard } from "./DashboardStatusCard";

/**
 * Server-side auth gate for the partner dashboard. Mirrors the admin layout:
 * the session + partner-approval checks run here (RSC) instead of in a client
 * `/api/auth/me` waterfall. The shell is only rendered for an approved,
 * onboarded partner; everything else either redirects or shows a status card.
 */
export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const ctx = await getSessionContext();
  if (!ctx) {
    redirect({ href: "/login", locale: locale as "fr" | "en" });
    return null;
  }

  const { user, partner } = ctx;

  if (!partner) {
    return <DashboardStatusCard reason="no_partner" />;
  }
  // OAuth (Google) signups arrive without company/site details. Collect them
  // first — before the pending/approval gates — so every account reaching
  // review has a real profile.
  if (!partner.profileCompletedAt) {
    redirect({ href: "/complete-profile", locale: locale as "fr" | "en" });
    return null;
  }
  if (partner.status === "pending") {
    return <DashboardStatusCard reason="pending" />;
  }
  if (partner.status === "rejected") {
    return <DashboardStatusCard reason="rejected" />;
  }
  // Approved but not yet onboarded → walk them through onboarding first.
  if (!partner.onboardedAt) {
    redirect({ href: "/onboarding", locale: locale as "fr" | "en" });
    return null;
  }

  const session: DashboardSession = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    partner: {
      id: partner.id,
      partnerCode: partner.partnerCode,
      companyName: partner.companyName,
      contactName: partner.contactName,
      status: partner.status,
      persona: partner.persona,
      onboardedAt: partner.onboardedAt.toISOString(),
    },
  };

  return <DashboardShell session={session}>{children}</DashboardShell>;
}
