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
    </>
  );
}

function Hero() {
  const t = useTranslations("why.hero");
  return (
    <section className="bg-brand-gradient py-20 lg:py-24">
      <Container size="narrow">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-700">
          {t("eyebrow")}
        </span>
        <h1 className="mt-4 text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
          {t("title")}
        </h1>
        <p className="mt-5 text-lg text-ink-700 max-w-2xl">{t("subtitle")}</p>
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
  return (
    <section className="py-20">
      <Container>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <article
              key={i}
              className="rounded-2xl border border-surface-200 bg-white p-7 hover:border-brand-200 transition-colors"
            >
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">
                {it.badge}
              </span>
              <h3 className="mt-4 text-xl font-semibold leading-snug">
                {it.title}
              </h3>
              <p className="mt-3 text-ink-700 leading-relaxed">{it.body}</p>
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
    <section className="py-20 border-t border-surface-200 bg-white">
      <Container>
        <div className="max-w-3xl">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-3 text-ink-700">{t("subtitle")}</p>
        </div>
        <div className="mt-10 overflow-hidden rounded-2xl border border-surface-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-surface-200">
                  <th className="px-5 py-4 bg-surface-50 text-ink-500 text-[0.72rem] font-semibold uppercase tracking-wider w-1/4">
                    &nbsp;
                  </th>
                  {columns.map((c, i) => {
                    const highlighted = i === 0;
                    return (
                      <th
                        key={c}
                        className={`px-5 py-4 text-[0.78rem] font-bold uppercase tracking-wider ${
                          highlighted
                            ? "bg-ink-900 text-white"
                            : "bg-surface-50 text-ink-500"
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
  const items = t.raw("items") as {
    name: string;
    range: string;
    rate: string;
  }[];
  return (
    <section className="py-20 bg-surface-50 border-t border-surface-200">
      <Container size="narrow">
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="mt-3 text-ink-700">{t("subtitle")}</p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((tier, i) => {
            const highlighted = i === items.length - 1;
            return (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 ${
                  highlighted
                    ? "bg-ink-900 text-white"
                    : "bg-white border border-surface-200"
                }`}
              >
                <p className={`text-sm font-semibold uppercase tracking-wider ${highlighted ? "text-brand-300" : "text-ink-500"}`}>
                  {tier.name}
                </p>
                <p className={`mt-2 text-3xl font-bold ${highlighted ? "text-white" : "text-ink-900"}`}>
                  {tier.rate}
                </p>
                <p className={`mt-3 text-sm ${highlighted ? "text-white/70" : "text-ink-500"}`}>
                  {tier.range}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-10">
          <LinkButton href="/signup" size="lg">
            Rejoindre maintenant →
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
