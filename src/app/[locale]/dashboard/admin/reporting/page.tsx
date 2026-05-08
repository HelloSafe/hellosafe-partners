import { setRequestLocale } from "next-intl/server";
import { ReportingPanel } from "./ReportingPanel";

export default async function ReportingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ReportingPanel />;
}
