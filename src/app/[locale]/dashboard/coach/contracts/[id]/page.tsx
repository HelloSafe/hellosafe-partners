import { setRequestLocale } from "next-intl/server";
import { ContractEditor } from "../ContractEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <ContractEditor mode="edit" id={id} />;
}
