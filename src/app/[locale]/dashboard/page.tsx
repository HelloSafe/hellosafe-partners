import { setRequestLocale } from "next-intl/server";
import { Overview } from "./Overview";

export default async function DashboardHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Overview />;
}
