import { setRequestLocale } from "next-intl/server";
import { AnalysisView } from "./AnalysisView";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <AnalysisView id={id} />;
}
