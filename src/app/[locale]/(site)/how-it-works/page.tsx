import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
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
  return pageMetadata({
    locale,
    path: "/how-it-works",
    titleKey: "howItWorks",
  });
}

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Steps />
      <LinkBuilderMockup />
      <Integrations />
      <Assets />
      <Networks />
      <FinalCta />
    </>
  );
}

function Hero() {
  const t = useTranslations("how.hero");
  const tc = useTranslations("common.cta");
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
            <LinkButton href="/signup" size="lg">
              {tc("joinNow")} →
            </LinkButton>
            <LinkButton href="/why-partner" variant="outline" size="lg">
              {tc("getStarted")}
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Steps() {
  const t = useTranslations("how");
  const steps = t.raw("steps") as {
    step: string;
    title: string;
    body: string;
    details: string[];
  }[];
  return (
    <section className="ds-section">
      <Container size="narrow">
        <ol className="space-y-6">
          {steps.map((s) => (
            <li
              key={s.step}
              className="hs-card-hover relative grid gap-5 lg:grid-cols-[180px_1fr] rounded-3xl border border-surface-200 bg-white p-7 lg:p-8"
            >
              <div className="font-display text-5xl lg:text-6xl font-extrabold leading-none tabular-nums hs-stat-number">
                {s.step}
              </div>
              <div>
                <h3 className="ds-h4 text-ink-900">{s.title}</h3>
                <p className="ds-body mt-3 text-ink-700">{s.body}</p>
                <ul className="mt-5 space-y-2">
                  {s.details.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-2 text-sm text-ink-700"
                    >
                      <svg
                        aria-hidden
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        className="mt-0.5 shrink-0 text-success-500"
                      >
                        <path
                          d="M2 8.5l4 4 8-9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* Mockup CSS reproducing the link generator inside the partner dashboard. */
function LinkBuilderMockup() {
  return (
    <section className="ds-section bg-surface-50 border-y border-surface-200">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] items-center">
          <div className="max-w-xl">
            <span className="ds-corpo">Aperçu</span>
            <h2 className="ds-h2 mt-3 text-ink-900">
              Le générateur de liens en 30 secondes.
            </h2>
            <p className="ds-body mt-4 text-ink-700">
              Tu choisis la destination, on te sort le deep link traqué avec
              Sub-ID. Pas de formulaire à remplir, pas de doc d&apos;API à lire.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink-700">
              <li className="flex items-start gap-2">
                <Check />
                Destinations pré-mappées (PVT, Schengen, longue durée…).
              </li>
              <li className="flex items-start gap-2">
                <Check />
                Sub-ID par article, par newsletter, par story.
              </li>
              <li className="flex items-start gap-2">
                <Check />
                UTM personnalisables, cookie 90 jours.
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-500/20 via-accent-500/15 to-success-500/20 blur-2xl" />
            <div className="hs-mockup relative rounded-[1.75rem] border border-white/60 p-3 lg:p-4">
              <div className="hs-mockup-bar flex items-center gap-2 rounded-t-2xl px-4 py-3 border-b border-surface-200">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-success-500" />
                <span className="ml-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-ink-500 border border-surface-200">
                  partners.hellosafe.com / links / new
                </span>
              </div>
              <div className="rounded-b-2xl bg-white p-5 lg:p-6 space-y-4">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wider text-ink-500 font-display font-bold">
                    Destination
                  </label>
                  <div className="mt-2 flex items-center justify-between rounded-xl border border-surface-200 bg-surface-50 px-4 py-3">
                    <span className="text-sm font-medium text-ink-900">
                      PVT Canada · French·visa-friendly
                    </span>
                    <span className="text-xs text-ink-500">▾</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[0.7rem] uppercase tracking-wider text-ink-500 font-display font-bold">
                      Sub-ID
                    </label>
                    <div className="mt-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm font-mono text-ink-900">
                      article-pvt-2026
                    </div>
                  </div>
                  <div>
                    <label className="text-[0.7rem] uppercase tracking-wider text-ink-500 font-display font-bold">
                      Campagne
                    </label>
                    <div className="mt-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm text-ink-900">
                      newsletter-mai
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3">
                  <p className="text-[0.7rem] uppercase tracking-wider text-brand-700 font-display font-bold">
                    Lien généré
                  </p>
                  <p className="mt-1 font-mono text-sm text-ink-900 break-all">
                    https://hellosafe.com/r/hs-v9bavm-abc12345?subid=article-pvt-2026
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 text-white text-xs font-semibold px-3 py-1.5"
                    >
                      <Copy /> Copier
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white border border-surface-200 text-ink-900 text-xs font-semibold px-3 py-1.5"
                    >
                      <QR /> QR
                    </button>
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success-50 text-success-900 text-xs font-display font-bold px-2.5 py-1 uppercase tracking-wider">
                      ● Live
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-5 hidden sm:flex items-center gap-3 rounded-2xl bg-white border border-surface-200 px-4 py-3 shadow-lg">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                ⏱
              </span>
              <div>
                <p className="text-[0.7rem] uppercase tracking-wider text-ink-500">
                  Temps moyen
                </p>
                <p className="font-display font-bold text-ink-900">
                  28 secondes
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Integrations() {
  const t = useTranslations("how.integrations");
  const items = t.raw("items") as { title: string; body: string }[];
  return (
    <section className="ds-section">
      <Container>
        <h2 className="ds-h2 text-ink-900">{t("title")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="hs-card-hover rounded-2xl bg-white border border-surface-200 p-5 hover:border-brand-300"
            >
              <h3 className="font-display font-bold text-ink-900">
                {it.title}
              </h3>
              <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Assets() {
  const t = useTranslations("how.assets");
  const items = t.raw("items") as {
    title: string;
    body: string;
    tag: string;
  }[];
  const widgetSnippet = `<script src="https://widgets.hellosafe.com/v1/embed.js"
        data-partner="hs-partner-abc123"
        data-product="travel-insurance"
        data-subid="article-pvt-canada"></script>
<div id="hellosafe-compare"></div>`;
  return (
    <section className="ds-section bg-surface-50 border-y border-surface-200">
      <Container>
        <div className="max-w-3xl">
          <h2 className="ds-h2 text-ink-900">{t("title")}</h2>
          <p className="ds-body mt-3 text-ink-700">{t("subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((it) => (
              <article
                key={it.title}
                className="hs-card-hover rounded-2xl border border-surface-200 bg-white p-6 flex flex-col"
              >
                <span className="inline-flex self-start items-center rounded-full bg-brand-50 border border-brand-100 px-2.5 py-1 text-[0.68rem] font-display font-bold uppercase tracking-wider text-brand-700">
                  {it.tag}
                </span>
                <h3 className="mt-3 font-display font-bold text-lg text-ink-900">
                  {it.title}
                </h3>
                <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                  {it.body}
                </p>
              </article>
            ))}
          </div>
          <div className="rounded-3xl border border-ink-900/20 bg-ink-900 overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success-500/70" />
              <span className="ml-2 text-xs font-mono text-white/60">
                {t("snippetTitle")}
              </span>
              <span className="ml-auto text-[0.68rem] uppercase tracking-wider text-white/40">
                {t("snippetLanguage")}
              </span>
            </div>
            <pre className="px-5 py-5 text-[0.78rem] leading-relaxed text-white/90 overflow-x-auto font-mono">
              <code>{widgetSnippet}</code>
            </pre>
            <div className="px-5 pb-5">
              <BannerMockups />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function BannerMockups() {
  return (
    <div className="space-y-2">
      <p className="text-[0.68rem] uppercase tracking-wider text-white/40 font-display font-bold">
        Aperçu bannières
      </p>
      <div className="flex flex-wrap gap-2">
        <div className="rounded-md bg-brand-500 text-white text-xs font-semibold px-3 py-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          728 × 90
        </div>
        <div className="rounded-md bg-accent-500 text-white text-xs font-semibold px-3 py-6 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          300 × 250
        </div>
        <div className="rounded-md bg-success-500 text-white text-xs font-semibold px-3 py-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          320 × 50
        </div>
      </div>
    </div>
  );
}

function Networks() {
  const t = useTranslations("networks");
  const items = t.raw("items") as string[];
  return (
    <section className="ds-section">
      <Container>
        <div className="max-w-2xl">
          <h2 className="ds-h3 text-ink-900">{t("title")}</h2>
          <p className="ds-body mt-3 text-ink-700">{t("subtitle")}</p>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2">
          {items.map((name) => (
            <li
              key={name}
              className="inline-flex items-center gap-2 rounded-full bg-white border border-surface-200 px-4 py-2 text-sm font-medium text-ink-700"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {name}
            </li>
          ))}
        </ul>
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

/* ----- Inline icons ----- */

function Check() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="mt-0.5 shrink-0 text-success-500"
      aria-hidden
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

function Copy() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <rect
        x="3.5"
        y="3.5"
        width="6.5"
        height="6.5"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2 8.5V2.5A1 1 0 013 1.5h6"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QR() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <rect x="1.5" y="1.5" width="3.5" height="3.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="7" y="1.5" width="3.5" height="3.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="1.5" y="7" width="3.5" height="3.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="7" y="7" width="1.5" height="1.5" fill="currentColor" />
      <rect x="9.5" y="9.5" width="1" height="1" fill="currentColor" />
    </svg>
  );
}
