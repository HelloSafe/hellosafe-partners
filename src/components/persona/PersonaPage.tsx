import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { HeroIllustration } from "@/components/landing/HeroIllustration";
import type { PersonaContent, PersonaSlug } from "@/lib/personas";

export function PersonaPage({
  data,
  locale,
}: {
  data: PersonaContent;
  locale: string;
}) {
  return (
    <>
      <Hero data={data} locale={locale} />
      <Pains data={data} locale={locale} />
      <Benefits data={data} />
      <RevenueCalc data={data} locale={locale} />
      <Proof data={data} />
      <FinalCta data={data} locale={locale} />
    </>
  );
}

function Hero({
  data,
}: {
  data: PersonaContent;
  locale: string;
}) {
  return (
    <section className="relative overflow-hidden bg-brand-gradient">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-brand-200/40 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-accent-200/30 blur-3xl" />
      <Container className="relative ds-section lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <span className="ds-corpo">{data.hero.eyebrow}</span>
            <h1 className="ds-h1 mt-4 text-ink-900">{data.hero.title}</h1>
            <p className="ds-subtitle mt-6 text-ink-700 max-w-xl">
              {data.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/signup" size="lg">
                {data.cta.primary} →
              </LinkButton>
              <LinkButton href="/how-it-works" variant="outline" size="lg">
                {data.cta.secondary}
              </LinkButton>
            </div>
          </div>
          <HeroIllustration kind={illustrationKindFor(data.slug)} />
        </div>
      </Container>
    </section>
  );
}

function illustrationKindFor(
  slug: PersonaSlug,
): "blog" | "agency" | "visa" | "creator" | "student" {
  // PersonaSlug is the same set as the matching illustration kinds.
  return slug;
}

function Pains({
  data,
  locale,
}: {
  data: PersonaContent;
  locale: string;
}) {
  const isEn = locale === "en";
  return (
    <section className="ds-section border-b border-surface-200">
      <Container>
        <span className="ds-corpo" style={{ color: "#B72E24" }}>
          {isEn ? "What hurts today" : "Les difficultés rencontrées"}
        </span>
        <h2 className="ds-h2 mt-3 text-ink-900 max-w-3xl">
          {isEn
            ? "You know these problems. Most of your peers do too."
            : "Vous reconnaissez ces situations. La plupart de vos confrères également."}
        </h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {data.pains.map((p, i) => (
            <li
              key={i}
              className="hs-card-hover rounded-2xl border border-surface-200 bg-surface-50 p-6"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-900 font-display font-bold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="ds-h4 mt-4 text-ink-900">{p.title}</h3>
              <p className="ds-body mt-3 text-ink-700 text-sm">{p.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Benefits({ data }: { data: PersonaContent }) {
  const accents = [
    "hs-gain-money",
    "hs-gain-time",
    "hs-gain-trust",
    "hs-gain-calm",
  ];
  return (
    <section className="ds-section">
      <Container>
        <div className="grid gap-5 md:grid-cols-2">
          {data.benefits.map((b, i) => (
            <article
              key={i}
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

function RevenueCalc({
  data,
  locale,
}: {
  data: PersonaContent;
  locale: string;
}) {
  const isEn = locale === "en";
  const v = data.calc.visitorsDefault;
  const clicks = (v * data.calc.ctrPct) / 100;
  const sales = (clicks * data.calc.convPct) / 100;
  const monthly = Math.round(
    (sales * data.calc.basketEur * data.calc.commissionPct) / 100,
  );
  const yearly = monthly * 12;
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR").format(
      Math.round(n),
    );
  const eur = (n: number) =>
    new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  return (
    <section className="ds-section bg-surface-50 border-y border-surface-200">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-center">
          <div>
            <h2 className="ds-h2 text-ink-900">{data.calc.title}</h2>
            <p className="ds-body mt-4 text-ink-700">
              {isEn
                ? "Median assumptions across the HelloSafe network. Adjust to your reality with the calculator inside the dashboard."
                : "Hypothèses médianes du réseau HelloSafe. Ajustez ces paramètres à votre réalité dans le simulateur du tableau de bord."}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink-500">
              <li>
                · {data.calc.visitorsLabel} :{" "}
                <span className="text-ink-900 font-semibold">
                  {fmt(data.calc.visitorsDefault)}
                </span>
              </li>
              <li>
                · {isEn ? "Click rate" : "Taux de clic"} :{" "}
                <span className="text-ink-900 font-semibold">
                  {data.calc.ctrPct}%
                </span>
              </li>
              <li>
                · {isEn ? "Conversion" : "Conversion"} :{" "}
                <span className="text-ink-900 font-semibold">
                  {data.calc.convPct}%
                </span>
              </li>
              <li>
                · {isEn ? "Avg basket" : "Panier moyen"} :{" "}
                <span className="text-ink-900 font-semibold">
                  {eur(data.calc.basketEur)}
                </span>
              </li>
              <li>
                · {isEn ? "Commission" : "Commission"} :{" "}
                <span className="text-ink-900 font-semibold">
                  {data.calc.commissionPct}%
                </span>
              </li>
            </ul>
            <p className="mt-6 text-xs text-ink-500 italic">{data.calc.note}</p>
          </div>
          <div className="rounded-3xl bg-hero-violet text-white p-8 lg:p-10 relative overflow-hidden border border-brand-500/30">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500/40 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-500/25 blur-3xl" />
            <div className="absolute inset-0 bg-grid opacity-[0.07]" />
            <div className="relative">
              <p className="ds-corpo" style={{ color: "#FFB991" }}>
                {isEn ? "Estimated commission" : "Commission estimée"}
              </p>
              <p className="mt-2 font-display text-5xl lg:text-6xl font-extrabold tabular-nums leading-none">
                {eur(monthly)}
              </p>
              <p className="mt-2 text-sm text-white/60">
                / {isEn ? "month" : "mois"}
              </p>
              <div className="mt-8 pt-6 border-t border-white/10 flex items-baseline justify-between">
                <span className="text-sm text-white/60">
                  {isEn ? "Annual projection" : "Projection annuelle"}
                </span>
                <span className="font-display text-2xl font-extrabold tabular-nums">
                  {eur(yearly)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Proof({ data }: { data: PersonaContent }) {
  return (
    <section className="ds-section">
      <Container size="narrow">
        <figure className="hs-card-hover relative rounded-3xl border border-surface-200 bg-white p-8 lg:p-12 shadow-sm">
          <span className="absolute -top-3 left-8 inline-flex items-center rounded-full bg-success-50 border border-success-600/30 px-3 py-1 text-[0.68rem] font-display font-bold uppercase tracking-wider text-success-900">
            {data.proof.metric}
          </span>
          <blockquote className="text-lg lg:text-xl text-ink-900 leading-relaxed">
            «&nbsp;{data.proof.quote}&nbsp;»
          </blockquote>
          <figcaption className="mt-6 pt-6 border-t border-surface-200">
            <p className="font-display font-bold text-ink-900">
              {data.proof.author}
            </p>
            <p className="text-sm text-ink-500 mt-0.5">{data.proof.role}</p>
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}

function FinalCta({
  data,
  locale,
}: {
  data: PersonaContent;
  locale: string;
}) {
  const isEn = locale === "en";
  return (
    <section className="ds-section">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-hero-violet text-white p-10 lg:p-16">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-500/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent-500/30 blur-3xl" />
          <div className="absolute inset-0 bg-grid opacity-[0.07]" />
          <div className="relative max-w-2xl">
            <span className="ds-corpo" style={{ color: "#FFB991" }}>
              {data.category}
            </span>
            <h2 className="ds-h2 mt-3 text-white">
              {isEn
                ? "Free to join, no commitment, manual approval in 24h."
                : "Gratuit, sans engagement, validation manuelle sous 24h."}
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/signup" size="lg">
                {data.cta.primary} →
              </LinkButton>
              <LinkButton
                href="/faq"
                size="lg"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:text-white"
              >
                FAQ
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
