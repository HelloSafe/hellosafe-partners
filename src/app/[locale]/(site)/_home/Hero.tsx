import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { ArrowUpIcon, CheckIcon, LockIcon } from "./icons";

/** Top hero with copy on the left and an animated mockup on the right. */
export function Hero() {
  const t = useTranslations("landing.hero");
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
                  <CheckIcon className="text-success-500" />
                  {h}
                </li>
              ))}
            </ul>
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
          <HeroMockup />
        </div>
      </Container>
    </section>
  );
}

function HeroMockup() {
  const t = useTranslations("landing.hero.stats");
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-500/20 via-accent-500/15 to-success-500/20 blur-2xl" />
      <div className="hs-mockup relative rounded-[1.75rem] border border-white/60 p-3 lg:p-4">
        <div className="hs-mockup-bar flex items-center gap-2 rounded-t-2xl px-4 py-3 border-b border-surface-200">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-success-500" />
          <span className="ml-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-ink-500 border border-surface-200">
            <LockIcon className="text-ink-300" />
            partners.hellosafe.com
          </span>
        </div>
        <div className="rounded-b-2xl bg-white p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-500">
                Revenu sur 30 jours
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-ink-900 tabular-nums">
                4 287,40 €
              </p>
              <p className="mt-1 text-xs font-semibold text-success-600 inline-flex items-center gap-1">
                <ArrowUpIcon /> +18 % vs période précédente
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-[0.7rem] font-display font-bold uppercase text-success-900">
              ● Live
            </span>
          </div>
          <Sparkline />
          <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
            <MockStat value={t("commission")} label={t("commissionLabel")} accent="brand" />
            <MockStat value={t("conversion")} label={t("conversionLabel")} accent="accent" />
            <MockStat value={t("cookie")} label={t("cookieLabel")} accent="success" />
          </dl>
          <ul className="mt-5 space-y-2">
            {[
              { src: "PVT Canada — Sarah", v: "+89 €", t: "il y a 2 min" },
              { src: "Schengen 30j — Tripzy", v: "+13 €", t: "il y a 12 min" },
              { src: "Long-stay Bali — Camille", v: "+47 €", t: "il y a 41 min" },
            ].map((row, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-xl bg-surface-100 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-ink-700">
                  <span className="h-2 w-2 rounded-full bg-success-500" />
                  {row.src}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-display font-bold text-ink-900 tabular-nums">
                    {row.v}
                  </span>
                  <span className="text-xs text-ink-500">{row.t}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Floating badge */}
      <div className="absolute -bottom-5 -left-5 hidden sm:flex items-center gap-3 rounded-2xl bg-white border border-surface-200 px-4 py-3 shadow-lg">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-success-50 text-success-600">
          €
        </span>
        <div>
          <p className="text-[0.7rem] uppercase tracking-wider text-ink-500">
            Paiement
          </p>
          <p className="font-display font-bold text-ink-900">Le 15 chaque mois</p>
        </div>
      </div>
    </div>
  );
}

function MockStat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: "brand" | "accent" | "success";
}) {
  const tone =
    accent === "brand"
      ? "text-brand-500"
      : accent === "accent"
        ? "text-accent-500"
        : "text-success-600";
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-3">
      <p className={`font-display text-base font-bold tabular-nums ${tone}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[0.65rem] uppercase tracking-wider text-ink-500 leading-tight">
        {label}
      </p>
    </div>
  );
}

function Sparkline() {
  // Hand-tuned 30-day curve, ascending — illustrative only.
  return (
    <svg
      viewBox="0 0 320 70"
      className="mt-3 h-16 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="sparkArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#563BFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#563BFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 55 L20 50 L40 52 L60 44 L80 46 L100 38 L120 41 L140 32 L160 34 L180 26 L200 28 L220 20 L240 24 L260 16 L280 18 L300 10 L320 12 L320 70 L0 70 Z"
        fill="url(#sparkArea)"
      />
      <path
        d="M0 55 L20 50 L40 52 L60 44 L80 46 L100 38 L120 41 L140 32 L160 34 L180 26 L200 28 L220 20 L240 24 L260 16 L280 18 L300 10 L320 12"
        stroke="#563BFF"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
