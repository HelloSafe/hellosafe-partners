import { setRequestLocale } from "next-intl/server";
import { PersonaPage } from "@/components/persona/PersonaPage";
import { getPersona } from "@/lib/personas";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = getPersona(locale, "agency");
  return <PersonaPage data={data} locale={locale} />;
}
