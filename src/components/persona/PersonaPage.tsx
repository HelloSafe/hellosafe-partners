import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import type { PersonaContent } from "@/lib/personas";

export function PersonaPage({ data, locale }: { data: PersonaContent; locale: string }) {
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

function Hero({ data, locale }: { data: PersonaContent; locale: string }) {
  return (
    <section className="relative overflow-hidden bg-brand-gradient">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <Container className="relative py-20 lg:py-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 ring-1 ring-brand-100">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {data.hero.eyebrow}
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-ink-900 leading-[1.05]">
            {data.hero.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-700 max-w-2xl">
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
      </Container>
    </section>
  );
}

function Pains({ data, locale }: { data: PersonaContent; locale: string }) {
  const isEn = locale === "en";
  return (
    <section className="py-16 lg:py-20 border-b border-surface-200">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-wider text-danger-600">
          {isEn ? "What hurts today" : "Ce qui coince aujourd'hui"}
        </p>
        <h2 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight max-w-3xl">
          {isEn
            ? "You know these problems. Most of your peers do too."
            : "Vous reconnaissez ces situations. La plupart de vos pairs aussi."}
        </h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {data.pains.map((p, i) => (
            <li
              key={i}
              className="rounded-2xl border border-surface-200 bg-surface-50 p-6"
            >
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-danger-50 text-danger-600 font-bold text-sm">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-snug">
                {p.title}
              </h3>
              <p className="mt-3 text-ink-700 leading-relaxed text-sm">
                {p.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Benefits({ data }: { data: PersonaContent }) {
  return (
    <section className="py-20 lg:py-24">
      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          {data.benefits.map((b, i) => (
            <article
              key={i}
              className="rounded-2xl border border-surface-200 bg-white p-7 transition-colors hover:border-brand-200 hover:shadow-sm"
            >
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">
                {b.badge}
              </span>
              <h3 className="mt-4 text-xl font-semibold leading-snug">
                {b.title}
              </h3>
              <p className="mt-3 text-ink-700 leading-relaxed">{b.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function RevenueCalc({ data, locale }: { data: PersonaContent; locale: string }) {
  const isEn = locale === "en";
  // Server-side simple calc.
  const v = data.calc.visitorsDefault;
  const clicks = (v * data.calc.ctrPct) / 100;
  const sales = (clicks * data.calc.convPct) / 100;
  const monthly = Math.round((sales * data.calc.basketEur * data.calc.commissionPct) / 100);
  const yearly = monthly * 12;
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR").format(Math.round(n));
  const eur = (n: number) =>
    new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  return (
    <section className="py-16 bg-surface-50 border-y border-surface-200">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              {data.calc.title}
            </h2>
            <p className="mt-4 text-ink-700 leading-relaxed">
              {isEn
                ? "Median assumptions across the HelloSafe network. Adjust to your reality with the calculator inside the dashboard."
                : "Hypothèses médianes du réseau HelloSafe. Ajustez à votre réalité dans le simulateur du dashboard."}
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
          <div className="rounded-2xl bg-ink-900 text-white p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">
                {isEn ? "Estimated commission" : "Commission estimée"}
              </p>
              <p className="mt-2 text-5xl lg:text-6xl font-bold tabular-nums">
                {eur(monthly)}
              </p>
              <p className="mt-1 text-sm text-white/60">
                / {isEn ? "month" : "mois"}
              </p>
              <div className="mt-8 pt-6 border-t border-white/10 flex items-baseline justify-between">
                <span className="text-sm text-white/60">
                  {isEn ? "Annual projection" : "Projection annuelle"}
                </span>
                <span className="text-2xl font-bold tabular-nums">
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
    <section className="py-20 lg:py-24">
      <Container size="narrow">
        <figure className="rounded-3xl border border-surface-200 bg-white p-8 lg:p-12 relative">
          <span className="absolute -top-3 left-8 inline-flex items-center rounded-full bg-success-50 border border-success-600/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-success-600">
            {data.proof.metric}
          </span>
          <blockquote className="text-lg lg:text-xl text-ink-900 leading-relaxed">
            «&nbsp;{data.proof.quote}&nbsp;»
          </blockquote>
          <figcaption className="mt-6 pt-6 border-t border-surface-200">
            <p className="font-semibold">{data.proof.author}</p>
            <p className="text-sm text-ink-500 mt-0.5">{data.proof.role}</p>
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}

function FinalCta({ data, locale }: { data: PersonaContent; locale: string }) {
  const isEn = locale === "en";
  return (
    <section className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 text-white p-10 lg:p-16">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">
              {data.category}
            </p>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight">
              {isEn
                ? "Free to join, no commitment, manual validation in 24h."
                : "Gratuit, sans engagement, validation manuelle sous 24h."}
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/signup" size="lg">
                {data.cta.primary} →
              </LinkButton>
              <LinkButton
                href="/faq"
                size="lg"
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
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
