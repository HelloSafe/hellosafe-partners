import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";

export default async function WhyPartnerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Pillars />
      <Comparison />
      <Tiers />
      <FinalCta />
    </>
  );
}

function Hero() {
  const t = useTranslations("why.hero");
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
            <LinkButton href="/how-it-works" variant="outline" size="lg">
              {tc("getStarted")}
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Pillars() {
  const t = useTranslations("why");
  const items = t.raw("pillars") as {
    badge: string;
    title: string;
    body: string;
  }[];
  // Cycle 4 gradient backgrounds across the cards.
  const accents = [
    "hs-gain-money",
    "hs-gain-time",
    "hs-gain-trust",
    "hs-gain-calm",
  ];
  return (
    <section className="ds-section">
      <Container>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <article
              key={i}
              className={`hs-card-hover ${accents[i % accents.length]} rounded-3xl border border-surface-200 p-7 flex flex-col`}
            >
              <span className="inline-flex self-start items-center rounded-full bg-white/80 backdrop-blur px-2.5 py-1 text-[0.68rem] font-display font-bold uppercase tracking-wider text-brand-700 border border-surface-200">
                {it.badge}
              </span>
              <h3 className="ds-h4 mt-5 text-ink-900">{it.title}</h3>
              <p className="ds-body mt-3 text-ink-700">{it.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Comparison() {
  const t = useTranslations("why.comparison");
  const columns = t.raw("columns") as string[];
  const rows = t.raw("rows") as { label: string; values: string[] }[];
  return (
    <section className="ds-section bg-surface-50 border-y border-surface-200">
      <Container>
        <div className="max-w-3xl">
          <h2 className="ds-h2 text-ink-900">{t("title")}</h2>
          <p className="ds-body mt-3 text-ink-700">{t("subtitle")}</p>
        </div>
        <div className="mt-10 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-surface-200">
                  <th className="px-5 py-4 bg-surface-100 text-ink-500 text-[0.72rem] font-display font-bold uppercase tracking-wider w-1/4">
                    &nbsp;
                  </th>
                  {columns.map((c, i) => {
                    const highlighted = i === 0;
                    return (
                      <th
                        key={c}
                        className={`px-5 py-4 text-[0.78rem] font-display font-bold uppercase tracking-wider ${
                          highlighted
                            ? "bg-brand-500 text-white"
                            : "bg-surface-100 text-ink-500"
                        }`}
                      >
                        {c}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {rows.map((r) => (
                  <tr key={r.label} className="hover:bg-surface-50">
                    <td className="px-5 py-4 font-medium text-ink-900 align-top w-1/4">
                      {r.label}
                    </td>
                    {r.values.map((v, i) => {
                      const highlighted = i === 0;
                      return (
                        <td
                          key={i}
                          className={`px-5 py-4 align-top ${
                            highlighted
                              ? "bg-brand-50 text-brand-700 font-semibold"
                              : "text-ink-700"
                          }`}
                        >
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 text-xs text-ink-500">{t("legend")}</p>
      </Container>
    </section>
  );
}

function Tiers() {
  const t = useTranslations("why.tiers");
  const tc = useTranslations("common.cta");
  const items = t.raw("items") as {
    name: string;
    range: string;
    rate: string;
  }[];
  return (
    <section className="ds-section">
      <Container size="narrow">
        <h2 className="ds-h2 text-ink-900">{t("title")}</h2>
        <p className="ds-body mt-3 text-ink-700">{t("subtitle")}</p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((tier, i) => {
            const highlighted = i === items.length - 1;
            return (
              <div
                key={tier.name}
                className={`hs-card-hover relative rounded-2xl p-6 ${
                  highlighted
                    ? "bg-hero-violet text-white border border-brand-500"
                    : "bg-white border border-surface-200"
                }`}
              >
                {highlighted && (
                  <span className="absolute -top-2.5 right-4 inline-flex items-center rounded-full bg-accent-500 px-2.5 py-1 text-[0.62rem] font-display font-bold uppercase tracking-wider text-white">
                    Top
                  </span>
                )}
                <p
                  className={`text-sm font-display font-bold uppercase tracking-wider ${
                    highlighted ? "text-accent-200" : "text-ink-500"
                  }`}
                >
                  {tier.name}
                </p>
                <p
                  className={`mt-2 font-display text-4xl font-extrabold tabular-nums ${
                    highlighted ? "text-white" : "hs-stat-number"
                  }`}
                >
                  {tier.rate}
                </p>
                <p
                  className={`mt-3 text-sm ${
                    highlighted ? "text-white/70" : "text-ink-500"
                  }`}
                >
                  {tier.range}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-10">
          <LinkButton href="/signup" size="lg">
            {tc("joinNow")} →
          </LinkButton>
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
