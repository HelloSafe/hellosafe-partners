import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Body />
      <FinalCta />
    </>
  );
}

function Hero() {
  const t = useTranslations("faq.hero");
  return (
    <section className="relative overflow-hidden bg-brand-gradient">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-brand-200/40 blur-3xl" />
      <Container className="relative ds-section lg:py-20">
        <div className="max-w-3xl">
          <span className="ds-corpo">{t("eyebrow")}</span>
          <h1 className="ds-h1 mt-4 text-ink-900">{t("title")}</h1>
          <p className="ds-subtitle mt-6 text-ink-700 max-w-2xl">
            {t("subtitle")}
          </p>
        </div>
      </Container>
    </section>
  );
}

function Body() {
  const t = useTranslations("faq");
  const items = t.raw("items") as { q: string; a: string }[];
  return (
    <section className="ds-section">
      <Container size="narrow">
        <div className="divide-y divide-surface-200 rounded-2xl border border-surface-200 bg-white overflow-hidden shadow-sm">
          {items.map((it, i) => (
            <details
              key={i}
              className="group [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 hover:bg-surface-50 transition-colors">
                <span className="font-display font-semibold text-ink-900">
                  {it.q}
                </span>
                <svg
                  aria-hidden
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  className="text-brand-500 shrink-0 transition-transform group-open:rotate-45"
                >
                  <path
                    d="M10 4v12M4 10h12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>
              <div className="px-6 pb-6 pt-1 text-ink-700 leading-relaxed">
                {it.a}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FinalCta() {
  const t = useTranslations("landing.finalCta");
  return (
    <section className="ds-section">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-hero-violet text-white p-10 lg:p-16">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-500/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent-500/30 blur-3xl" />
          <div className="absolute inset-0 bg-grid opacity-[0.07]" />
          <div className="relative max-w-2xl">
            <span className="ds-corpo" style={{ color: "#FFB991" }}>
              {t("eyebrow")}
            </span>
            <h2 className="ds-h2 mt-3 text-white">{t("title")}</h2>
            <p className="ds-body mt-4 text-white/80">{t("body")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/signup" size="lg">
                {t("primary")} →
              </LinkButton>
              <LinkButton
                href="/why-partner"
                size="lg"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:text-white"
              >
                {t("secondary")}
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
