import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";
import { ResetPasswordForm } from "./ResetPasswordForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: "/reset-password",
    title: "Nouveau mot de passe",
    description: "Choisis un nouveau mot de passe HelloSafe Partners.",
    noindex: true,
  });
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="py-16 lg:py-24 bg-surface-50">
      <Container size="narrow">
        <ResetPasswordForm />
      </Container>
    </section>
  );
}
