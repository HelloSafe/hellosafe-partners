import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, path: "/", titleKey: "home" });
}

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
      <LogosMarquee />
      <Gains />
      <Stats />
      <ProfileSelector />
      <Testimonials />
      <Personas />
      <Steps />
      <FinalCta />
    </>
  );
}

/* ---------- Hero ---------- */

function Hero() {
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

/* ---------- Logos marquee ---------- */

function LogosMarquee() {
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

/* ---------- Gains (bento) ---------- */

type GainKey = "money" | "time" | "trust" | "calm";

function Gains() {
  const t = useTranslations("landing.gains");
  const items = t.raw("items") as {
    key: GainKey;
    tag: string;
    title: string;
    body: string;
  }[];
  const accentByKey: Record<GainKey, string> = {
    money: "hs-gain-money",
    time: "hs-gain-time",
    trust: "hs-gain-trust",
    calm: "hs-gain-calm",
  };
  const tagColor: Record<GainKey, string> = {
    money: "bg-brand-50 text-brand-700",
    time: "bg-accent-50 text-accent-900",
    trust: "bg-success-50 text-success-900",
    calm: "bg-brand-50 text-brand-900",
  };
  const iconByKey: Record<GainKey, React.ReactNode> = {
    money: <CoinIcon />,
    time: <ClockIcon />,
    trust: <ShieldIcon />,
    calm: <SparkleIcon />,
  };
  return (
    <section className="ds-section">
      <Container>
        <div className="max-w-3xl">
          <span className="ds-corpo">{t("eyebrow")}</span>
          <h2 className="ds-h2 mt-3 text-ink-900">{t("title")}</h2>
          <p className="ds-body mt-4 text-ink-700">{t("subtitle")}</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(0,1fr)]">
          {items.map((it, i) => {
            const span =
              i === 0
                ? "lg:col-span-7 lg:row-span-1"
                : i === 1
                  ? "lg:col-span-5"
                  : i === 2
                    ? "lg:col-span-5"
                    : "lg:col-span-7";
            return (
              <article
                key={it.key}
                className={`hs-card-hover ${accentByKey[it.key]} ${span} rounded-3xl border border-surface-200 p-7 lg:p-8 flex flex-col`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-500 border border-surface-200">
                    {iconByKey[it.key]}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-display font-bold uppercase tracking-wider ${tagColor[it.key]}`}
                  >
                    {it.tag}
                  </span>
                </div>
                <h3 className="ds-h4 mt-5 text-ink-900">{it.title}</h3>
                <p className="ds-body mt-3 text-ink-700">{it.body}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Stats ---------- */

function Stats() {
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

/* ---------- Profile selector (Tu es...) ---------- */

function ProfileSelector() {
  const t = useTranslations("landing.forWho");
  const items = t.raw("items") as {
    slug: string;
    label: string;
    tag: string;
    blurb: string;
  }[];
  return (
    <section className="ds-section">
      <Container>
        <div className="max-w-3xl">
          <span className="ds-corpo">{t("eyebrow")}</span>
          <h2 className="ds-h2 mt-3 text-ink-900">{t("title")}</h2>
          <p className="ds-body mt-4 text-ink-700">{t("subtitle")}</p>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/for/${item.slug}` as never}
                className="hs-card-hover group flex flex-col h-full rounded-2xl border border-surface-200 bg-white p-6 hover:border-brand-300"
              >
                <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 via-white to-accent-50">
                  <PersonaGlyph slug={item.slug} />
                </div>
                <span className="inline-flex self-start items-center rounded-full bg-brand-50 px-2.5 py-1 text-[0.68rem] font-display font-bold uppercase tracking-wider text-brand-700">
                  {item.tag}
                </span>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-ink-900">
                  {item.label}
                </h3>
                <p className="mt-2 text-sm text-ink-700 leading-relaxed flex-1">
                  {item.blurb}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  {t("linkLabel")}
                  <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ---------- Testimonials ---------- */

function Testimonials() {
  const t = useTranslations("landing.testimonials");
  const items = t.raw("items") as {
    quote: string;
    author: string;
    role: string;
    metric: string;
  }[];
  return (
    <section className="ds-section bg-surface-50 border-y border-surface-200">
      <Container>
        <div className="max-w-3xl">
          <h2 className="ds-h2 text-ink-900">{t("title")}</h2>
          <p className="ds-body mt-3 text-ink-700">{t("subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((q, i) => (
            <figure
              key={i}
              className={`hs-card-hover relative flex flex-col rounded-3xl border bg-white p-7 ${
                i === 1
                  ? "border-brand-200 lg:-mt-6 lg:mb-6 shadow-[0_24px_48px_-12px_rgba(86,59,255,0.18)]"
                  : "border-surface-200"
              }`}
            >
              <span className="inline-flex self-start items-center rounded-full bg-success-50 px-2.5 py-1 text-[0.68rem] font-display font-bold uppercase tracking-wider text-success-900">
                {q.metric}
              </span>
              <QuoteIcon className="absolute right-6 top-6 text-brand-100" />
              <blockquote className="ds-body mt-4 text-ink-900">
                «&nbsp;{q.quote}&nbsp;»
              </blockquote>
              <figcaption className="mt-5 pt-5 border-t border-surface-200 flex items-center gap-3">
                <Avatar name={q.author} />
                <div>
                  <p className="font-display font-bold text-ink-900">
                    {q.author}
                  </p>
                  <p className="text-sm text-ink-500">{q.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Personas (counts) ---------- */

function Personas() {
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

/* ---------- Steps ---------- */

function Steps() {
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

/* ---------- Final CTA ---------- */

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

/* ---------- Icons & glyphs ---------- */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={className}
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className={className}
      aria-hidden
    >
      <path
        d="M3 7h8m-3-3l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path
        d="M6 10V2m0 0L2 6m4-4l4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={className}
      aria-hidden
    >
      <rect
        x="2.5"
        y="5.5"
        width="7"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M4 5.5V4a2 2 0 014 0v1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M10 5.5v9M7.5 8c.4-.6 1.2-1 2.5-1 1.5 0 2.5.7 2.5 1.7s-1 1.5-2.5 1.6c-1.5.1-2.5.6-2.5 1.7s1 1.7 2.5 1.7c1.3 0 2.1-.4 2.5-1"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M10 5.5V10l3 2"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path
        d="M10 2.5l6 2v5c0 4-3 6.5-6 7.5-3-1-6-3.5-6-7.5v-5l6-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10.2l1.8 1.8L13 8.2"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path
        d="M10 3l1.7 4.3L16 9l-4.3 1.7L10 15l-1.7-4.3L4 9l4.3-1.7L10 3z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
    >
      <path
        d="M9 22c-3 0-5-2-5-5s2-5 5-5l1-5h3l-2 6c2 .5 3 2 3 4s-2 5-5 5zm14 0c-3 0-5-2-5-5s2-5 5-5l1-5h3l-2 6c2 .5 3 2 3 4s-2 5-5 5z"
        fill="currentColor"
      />
    </svg>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  // Deterministic background per name.
  const palette = [
    "bg-brand-100 text-brand-700",
    "bg-accent-100 text-accent-900",
    "bg-success-100 text-success-900",
  ];
  const idx =
    [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  return (
    <span
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full font-display font-bold text-sm ${palette[idx]}`}
    >
      {initials}
    </span>
  );
}

/* Persona glyphs — abstract icons per persona slug. Replace with real
   illustrations / photos once Gemini-generated assets land in /public/personas/. */
function PersonaGlyph({ slug }: { slug: string }) {
  const common = "h-16 w-16";
  switch (slug) {
    case "blog":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <rect x="10" y="10" width="44" height="44" rx="10" fill="#DFD7FF" />
          <path d="M20 22h24M20 30h24M20 38h16" stroke="#563BFF" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="46" cy="46" r="7" fill="#FF7049" />
        </svg>
      );
    case "agency":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <path d="M14 46V22l18-8 18 8v24" fill="#DFD7FF" />
          <path d="M14 46h36" stroke="#563BFF" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="26" y="32" width="12" height="14" fill="#FF7049" />
          <path d="M32 14v8" stroke="#140B7A" strokeWidth="2.5" />
        </svg>
      );
    case "visa":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <rect x="14" y="10" width="36" height="44" rx="4" fill="#FFEDDA" />
          <rect x="20" y="18" width="24" height="6" rx="1.5" fill="#FF7049" />
          <path d="M20 30h24M20 36h24M20 42h16" stroke="#B72E24" strokeWidth="2" strokeLinecap="round" />
          <circle cx="46" cy="46" r="6" fill="#20C997" />
        </svg>
      );
    case "creator":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <rect x="12" y="14" width="32" height="36" rx="6" fill="#DFD7FF" />
          <circle cx="28" cy="32" r="8" fill="#563BFF" />
          <path d="M44 22l8-4v28l-8-4z" fill="#FF7049" />
        </svg>
      );
    case "expat":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <circle cx="32" cy="32" r="20" fill="#CFFCDE" />
          <path d="M14 32h36M32 14c5 5 8 11 8 18s-3 13-8 18c-5-5-8-11-8-18s3-13 8-18z" stroke="#0A7474" strokeWidth="2" fill="none" />
          <circle cx="44" cy="22" r="5" fill="#FF7049" />
        </svg>
      );
    case "student":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <path d="M8 28l24-12 24 12-24 12L8 28z" fill="#DFD7FF" />
          <path d="M20 32v10c0 4 5 7 12 7s12-3 12-7V32" stroke="#563BFF" strokeWidth="2.5" fill="none" />
          <path d="M52 28v14" stroke="#FF7049" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "cruise":
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <path d="M8 42c4 4 10 4 14 0s10-4 14 0 10 4 14 0" stroke="#0A7474" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M14 38h36L46 28H18l-4 10z" fill="#DFD7FF" />
          <rect x="22" y="20" width="20" height="8" fill="#FF7049" />
          <path d="M32 12v8" stroke="#140B7A" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" className={common} aria-hidden>
          <circle cx="32" cy="32" r="20" fill="#DFD7FF" />
        </svg>
      );
  }
}
