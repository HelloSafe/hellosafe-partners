import { setRequestLocale } from "next-intl/server";
import { PersonaPage } from "@/components/persona/PersonaPage";
import { getPersona } from "@/lib/personas";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const data = getPersona(locale, "cruise");
  return pageMetadata({
    locale,
    path: "/for/cruise",
    title: data.hero.title,
    description: data.hero.subtitle,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = getPersona(locale, "cruise");
  return <PersonaPage data={data} locale={locale} />;
}
