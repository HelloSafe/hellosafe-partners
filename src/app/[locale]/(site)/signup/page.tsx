import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SignupForm } from "./SignupForm";

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
