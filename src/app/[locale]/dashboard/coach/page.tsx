import { setRequestLocale } from "next-intl/server";
import { CoachOverview } from "./CoachOverview";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CoachOverview />;
}
