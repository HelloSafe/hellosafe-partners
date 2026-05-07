import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";

export default async function SignupPendingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.pending");

  return (
    <section className="py-20 lg:py-28 bg-surface-50">
      <Container size="narrow" className="text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-success-600 text-3xl">
          ✓
        </span>
        <h1 className="mt-6 text-3xl lg:text-4xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-ink-700 leading-relaxed max-w-xl mx-auto">
          {t("body")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/login">{t("goLogin")}</LinkButton>
          <LinkButton href="/" variant="outline">
            {t("backHome")}
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
