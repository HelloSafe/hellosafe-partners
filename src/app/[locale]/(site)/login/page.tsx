import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="py-16 lg:py-24 bg-surface-50">
      <Container size="narrow">
        <LoginForm />
      </Container>
    </section>
  );
}
