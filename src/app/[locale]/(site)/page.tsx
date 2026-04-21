import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Stats />
      <Value />
      <Testimonials />
      <Personas />
      <Steps />
      <FinalCta />
    </>
  );
}

function Hero() {
  const t = useTranslations("landing.hero");
  return (
    <section className="relative overflow-hidden bg-brand-gradient">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <Container className="relative ds-section lg:py-28">
        <div className="max-w-3xl">
          <span className="ds-corpo">
            {t("eyebrow")}
          </span>
          <h1 className="ds-h1 mt-4 text-ink-900">{t("title")}</h1>
          <p className="ds-subtitle mt-6 text-ink-700 max-w-2xl">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/signup" size="lg">
              {t("primaryCta")} →
            </LinkButton>
            <LinkButton href="/how-it-works" variant="outline" size="lg">
              {t("secondaryCta")}
            </LinkButton>
          </div>
          <p className="mt-6 text-sm text-ink-500">{t("social")}</p>
        </div>
      </Container>
    </section>
  );
}

function Stats() {
  const t = useTranslations("landing.hero.stats");
  const items = [
    { v: t("commission"), l: t("commissionLabel") },
    { v: t("conversion"), l: t("conversionLabel") },
    { v: t("cookie"), l: t("cookieLabel") },
    { v: t("recurring"), l: t("recurringLabel") },
  ];
  return (
    <section className="border-y border-surface-200 bg-white">
      <Container className="py-10 lg:py-12">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {items.map((it) => (
            <div key={it.l}>
              <dt className="text-sm text-ink-500">{it.l}</dt>
              <dd className="ds-h3 mt-2 text-ink-900 tabular-nums">{it.v}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

function Testimonials() {
  const t = useTranslations("landing.testimonials");
  const items = t.raw("items") as {
    quote: string;
    author: string;
    role: string;
    metric: string;
  }[];
  return (
    <section className="ds-section">
      <Container>
        <div className="max-w-3xl">
          <h2 className="ds-h2 text-ink-900">{t("title")}</h2>
          <p className="ds-body mt-3 text-ink-700">{t("subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((q, i) => (
            <figure
              key={i}
              className="relative flex flex-col rounded-3xl border border-surface-200 bg-white p-7 hover:border-brand-200 transition-colors"
            >
              <span className="inline-flex self-start items-center rounded-full bg-success-50 px-2.5 py-1 text-[0.68rem] font-display font-bold uppercase tracking-wider text-success-900">
                {q.metric}
              </span>
              <blockquote className="ds-body mt-4 text-ink-900">
                «&nbsp;{q.quote}&nbsp;»
              </blockquote>
              <figcaption className="mt-5 pt-5 border-t border-surface-200">
                <p className="font-display font-bold text-ink-900">{q.author}</p>
                <p className="text-sm text-ink-500">{q.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Value() {
  const t = useTranslations("landing.value");
  const items = t.raw("items") as { title: string; body: string }[];
  return (
    <section className="ds-section">
      <Container>
        <h2 className="ds-h2 max-w-2xl text-ink-900">{t("title")}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {items.map((it, i) => (
            <article
              key={i}
              className="rounded-3xl border border-surface-200 bg-surface-100 p-7 transition-colors hover:border-brand-200 hover:bg-white"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 font-display font-bold">
                  0{i + 1}
                </span>
                <h3 className="ds-h4 text-ink-900">{it.title}</h3>
              </div>
              <p className="ds-body mt-4 text-ink-700">{it.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Personas() {
  const t = useTranslations("landing.personas");
  const items = t.raw("items") as { label: string; count: string }[];
  return (
    <section className="ds-section bg-surface-100 border-y border-surface-200">
      <Container>
        <h2 className="ds-h3 text-ink-900">{t("title")}</h2>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((p) => (
            <div
              key={p.label}
              className="rounded-2xl bg-white border border-surface-200 px-5 py-4"
            >
              <p className="text-sm text-ink-500">{p.label}</p>
              <p className="mt-1 font-display text-lg font-bold text-brand-500">
                {p.count}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Steps() {
  const t = useTranslations("landing.steps");
  const items = t.raw("items") as {
    step: string;
    title: string;
    body: string;
  }[];
  return (
    <section className="ds-section">
      <Container>
        <h2 className="ds-h2 max-w-2xl text-ink-900">{t("title")}</h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <li
              key={it.step}
              className="rounded-3xl border border-surface-200 p-7 bg-white"
            >
              <span className="ds-corpo text-sm">{it.step}</span>
              <h3 className="ds-h4 mt-3 text-ink-900">{it.title}</h3>
              <p className="ds-body mt-3 text-ink-700">{it.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function FinalCta() {
  const t = useTranslations("landing.finalCta");
  return (
    <section className="ds-section">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-900 text-white p-10 lg:p-16">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-500/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent-500/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="ds-h2 text-white">{t("title")}</h2>
            <p className="ds-body mt-4 text-white/80">{t("body")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/signup" size="lg">
                {t("primary")} →
              </LinkButton>
              <LinkButton
                href="/faq"
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
