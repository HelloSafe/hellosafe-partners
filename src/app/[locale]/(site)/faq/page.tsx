import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Body />
    </>
  );
}

function Hero() {
  const t = useTranslations("faq.hero");
  return (
    <section className="bg-brand-gradient py-16 lg:py-20">
      <Container size="narrow">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-700">
          {t("eyebrow")}
        </span>
        <h1 className="mt-4 text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-ink-700 max-w-2xl">{t("subtitle")}</p>
      </Container>
    </section>
  );
}

function Body() {
  const t = useTranslations("faq");
  const items = t.raw("items") as { q: string; a: string }[];
  return (
    <section className="py-16">
      <Container size="narrow">
        <div className="divide-y divide-surface-200 rounded-2xl border border-surface-200 bg-white overflow-hidden">
          {items.map((it, i) => (
            <details
              key={i}
              className="group [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 hover:bg-surface-50 transition-colors">
                <span className="font-semibold text-ink-900">{it.q}</span>
                <svg
                  aria-hidden
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  className="text-brand-500 shrink-0 transition-transform group-open:rotate-45"
                >
                  <path
                    d="M10 4v12M4 10h12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>
              <div className="px-6 pb-6 pt-1 text-ink-700 leading-relaxed">
                {it.a}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
