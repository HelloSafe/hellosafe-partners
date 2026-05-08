import { setRequestLocale } from "next-intl/server";
import { ProfileTabs } from "./ProfileTabs";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProfileTabs />;
}
