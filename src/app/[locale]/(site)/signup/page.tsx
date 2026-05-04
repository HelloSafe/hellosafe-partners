import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SignupForm } from "./SignupForm";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, path: "/signup", titleKey: "signup" });
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="py-16 lg:py-20 bg-surface-50 min-h-[calc(100dvh-var(--header-h,64px))]">
      <Container size="narrow">
        <SignupForm />
      </Container>
    </section>
  );
}
