/**
 * Smaller landing sections grouped together: each is short enough that
 * one file per section would feel ceremonial.
 *   - LogosMarquee
 *   - Stats
 *   - Personas
 *   - Steps
 *   - FinalCta
 */

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";

export function LogosMarquee() {
  const t = useTranslations("landing.logos");
  const items = t.raw("items") as string[];
  const loop = [...items, ...items];
  return (
    <section className="border-y border-surface-200 bg-white">
      <Container className="py-10">
        <p className="text-center text-sm font-medium text-ink-500">
          {t("title")}
        </p>
        <div className="mt-6 hs-marquee-mask overflow-hidden">
          <div className="hs-marquee flex gap-12 lg:gap-16 items-center">
            {loop.map((name, i) => (
              <span
                key={i}
                className="font-display text-xl lg:text-2xl font-bold text-ink-300/70 whitespace-nowrap select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Stats() {
  const t = useTranslations("landing.hero.stats");
  const items = [
    { v: t("commission"), l: t("commissionLabel") },
    { v: t("conversion"), l: t("conversionLabel") },
    { v: t("cookie"), l: t("cookieLabel") },
    { v: t("recurring"), l: t("recurringLabel") },
  ];
  return (
    <section className="border-y border-surface-200 bg-surface-50">
      <Container className="py-14 lg:py-16">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {items.map((it) => (
            <div key={it.l}>
              <dd className="hs-stat-number font-display text-3xl lg:text-[2.5rem] font-extrabold tabular-nums leading-tight">
                {it.v}
              </dd>
              <dt className="mt-3 text-sm text-ink-700">{it.l}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

export function Personas() {
  const t = useTranslations("landing.personas");
  const items = t.raw("items") as { label: string; count: string }[];
  return (
    <section className="ds-section">
      <Container>
        <h2 className="ds-h3 text-ink-900">{t("title")}</h2>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((p) => (
            <div
              key={p.label}
              className="hs-card-hover rounded-2xl bg-white border border-surface-200 px-5 py-5 hover:border-brand-300"
            >
              <p className="text-sm text-ink-500">{p.label}</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-brand-500 tabular-nums">
                {p.count}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Steps() {
  const t = useTranslations("landing.steps");
  const items = t.raw("items") as {
    step: string;
    title: string;
    body: string;
  }[];
  return (
    <section className="ds-section bg-surface-50 border-y border-surface-200">
      <Container>
        <div className="max-w-3xl">
          <span className="ds-corpo">{t("eyebrow")}</span>
          <h2 className="ds-h2 mt-3 text-ink-900">{t("title")}</h2>
          <p className="ds-body mt-4 text-ink-700">{t("subtitle")}</p>
        </div>
        <ol className="hs-step-row mt-12 grid gap-6 md:grid-cols-3 relative">
          {/* connector */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-brand-200 via-accent-200 to-success-200" />
          {items.map((it) => (
            <li
              key={it.step}
              className="hs-card-hover relative rounded-3xl border border-surface-200 bg-white p-7"
            >
              <div className="flex items-center gap-3">
                <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white font-display text-lg font-bold tabular-nums">
                  {it.step}
                </span>
              </div>
              <h3 className="ds-h4 mt-4 text-ink-900">{it.title}</h3>
              <p className="ds-body mt-3 text-ink-700">{it.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function FinalCta() {
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
