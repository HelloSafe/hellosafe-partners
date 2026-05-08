import { setRequestLocale } from "next-intl/server";
import { CompareWizard } from "./CompareWizard";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CompareWizard />;
}
