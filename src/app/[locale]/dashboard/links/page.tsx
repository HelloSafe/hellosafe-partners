import { setRequestLocale } from "next-intl/server";
import { LinksPanel } from "./LinksPanel";

export default async function DashboardLinksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LinksPanel />;
}
