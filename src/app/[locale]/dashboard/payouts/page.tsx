import { setRequestLocale } from "next-intl/server";
import { PayoutsPanel } from "./PayoutsPanel";

export default async function DashboardPayoutsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PayoutsPanel />;
}
