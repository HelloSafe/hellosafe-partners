import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, path: "/products", titleKey: "products" });
}

export default async function ProductsPublicPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Features />
    </>
  );
}

function Hero() {
  const t = useTranslations("productsLp.hero");
  return (
    <section className="relative overflow-hidden bg-brand-gradient">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-brand-200/40 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-accent-200/30 blur-3xl" />
      <Container className="relative ds-section lg:py-24">
        <div className="max-w-3xl">
          <span className="ds-corpo">{t("eyebrow")}</span>
          <h1 className="ds-h1 mt-4 text-ink-900">{t("title")}</h1>
          <p className="ds-subtitle mt-6 text-ink-700 max-w-2xl">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/dashboard/products/compare" size="lg">
              {t("primaryCta")} →
            </LinkButton>
            <LinkButton href="/why-partner" variant="outline" size="lg">
              {t("secondaryCta")}
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Features() {
  const t = useTranslations("productsLp.features");
  const items = t.raw("items") as { title: string; body: string }[];
  return (
    <section className="ds-section">
      <Container>
        <h2 className="ds-h2 text-ink-900 max-w-3xl">{t("title")}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <article
              key={i}
              className="hs-card-hover rounded-3xl border border-surface-200 bg-white p-7 flex flex-col"
            >
              <h3 className="ds-h4 text-ink-900">{it.title}</h3>
              <p className="ds-body mt-3 text-ink-700">{it.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
