import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { CoachReportMockup } from "@/components/landing/CoachReportMockup";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, path: "/coach", titleKey: "coach" });
}

export default async function CoachPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Intro />
      <Steps />
      <Demo />
      <Benefits />
      <UseCases />
      <FinalCta />
    </>
  );
}

function Hero() {
  const t = useTranslations("coach.hero");
  const highlights = t.raw("highlights") as string[];
  return (
    <section className="relative overflow-hidden bg-brand-gradient">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-brand-200/40 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent-200/35 blur-3xl" />
      <Container className="relative ds-section lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <span className="ds-corpo">{t("eyebrow")}</span>
            <h1 className="ds-h1 mt-4 text-ink-900">{t("title")}</h1>
            <p className="ds-subtitle mt-6 text-ink-700 max-w-xl">
              {t("subtitle")}
            </p>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-700">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <CheckIcon />
                  {h}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/signup" size="lg">
                {t("primaryCta")} →
              </LinkButton>
              <LinkButton href="#demo" variant="outline" size="lg">
                {t("secondaryCta")}
              </LinkButton>
            </div>
          </div>
          <CoachReportMockup variant="hero" />
        </div>
      </Container>
    </section>
  );
}

function Intro() {
  const t = useTranslations("coach.intro");
  const stats = t.raw("stats") as { value: string; label: string }[];
  return (
    <section className="ds-section">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="max-w-2xl">
            <span className="ds-corpo">{t("eyebrow")}</span>
            <h2 className="ds-h2 mt-3 text-ink-900">{t("title")}</h2>
            <p className="ds-body mt-4 text-ink-700">{t("body")}</p>
          </div>
          <ul className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <li
                key={s.label}
                className="rounded-2xl border border-surface-200 bg-white p-5 text-center"
              >
                <p className="font-display text-3xl font-extrabold tabular-nums text-brand-700">
                  {s.value}
                </p>
                <p className="mt-2 text-xs uppercase tracking-wider text-ink-500 leading-tight">
                  {s.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function Steps() {
  const t = useTranslations("coach.steps");
  const items = t.raw("items") as {
    n: string;
    title: string;
    body: string;
  }[];
  return (
    <section className="ds-section bg-surface-50 border-y border-surface-200">
      <Container>
        <div className="max-w-3xl">
          <h2 className="ds-h2 text-ink-900">{t("title")}</h2>
          <p className="ds-body mt-3 text-ink-700">{t("subtitle")}</p>
        </div>
        <ol className="mt-10 grid gap-4 lg:grid-cols-4">
          {items.map((s) => (
            <li
              key={s.n}
              className="hs-card-hover rounded-3xl border border-surface-200 bg-white p-6 flex flex-col"
            >
              <span className="font-display text-4xl font-extrabold tabular-nums text-brand-700 leading-none">
                {s.n}
              </span>
              <h3 className="mt-5 font-display font-bold text-lg text-ink-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function Demo() {
  const t = useTranslations("coach.demo");
  return (
    <section id="demo" className="ds-section">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="max-w-xl">
            <span className="ds-corpo">{t("eyebrow")}</span>
            <h2 className="ds-h2 mt-3 text-ink-900">{t("title")}</h2>
            <p className="ds-body mt-4 text-ink-700">{t("subtitle")}</p>
          </div>
          <CoachReportMockup variant="demo" />
        </div>
      </Container>
    </section>
  );
}

function Benefits() {
  const t = useTranslations("coach.benefits");
  const items = t.raw("items") as {
    badge: string;
    title: string;
    body: string;
  }[];
  const accents = [
    "hs-gain-money",
    "hs-gain-time",
    "hs-gain-trust",
    "hs-gain-calm",
  ];
  return (
    <section className="ds-section bg-surface-50 border-y border-surface-200">
      <Container>
        <h2 className="ds-h2 text-ink-900 max-w-3xl">{t("title")}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {items.map((b, i) => (
            <article
              key={b.title}
              className={`hs-card-hover ${accents[i % accents.length]} rounded-3xl border border-surface-200 p-7 lg:p-8 flex flex-col`}
            >
              <span className="inline-flex self-start items-center rounded-full bg-white/80 backdrop-blur px-2.5 py-1 text-[0.68rem] font-display font-bold uppercase tracking-wider text-brand-700 border border-surface-200">
                {b.badge}
              </span>
              <h3 className="ds-h4 mt-5 text-ink-900">{b.title}</h3>
              <p className="ds-body mt-3 text-ink-700">{b.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function UseCases() {
  const t = useTranslations("coach.useCases");
  const items = t.raw("items") as { title: string; body: string }[];
  return (
    <section className="ds-section">
      <Container>
        <h2 className="ds-h2 text-ink-900 max-w-3xl">{t("title")}</h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((u, i) => (
            <li
              key={u.title}
              className="hs-card-hover rounded-2xl border border-surface-200 bg-white p-6 flex flex-col"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-display font-bold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-5 font-display font-bold text-lg text-ink-900">
                {u.title}
              </h3>
              <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                {u.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function FinalCta() {
  const t = useTranslations("coach.finalCta");
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

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden
      className="text-success-500"
    >
      <path
        d="M3 8.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
