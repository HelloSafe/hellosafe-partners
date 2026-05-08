import { setRequestLocale } from "next-intl/server";
import { TrainingCatalog } from "./TrainingCatalog";

export default async function TrainingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TrainingCatalog />;
}
