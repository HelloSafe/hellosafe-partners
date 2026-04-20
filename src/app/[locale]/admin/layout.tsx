import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSessionContext } from "@/lib/session";

export default async function AdminLayout({
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
  }
  if (ctx && ctx.user.role !== "admin") {
    redirect({ href: "/dashboard", locale: locale as "fr" | "en" });
  }
  return children;
}
