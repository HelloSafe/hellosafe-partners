import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";

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
      <Integrations />
      <Assets />
      <Networks />
      <Cta />
    </>
  );
}

function Hero() {
  const t = useTranslations("how.hero");
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

function Steps() {
  const t = useTranslations("how");
  const steps = t.raw("steps") as {
    step: string;
    title: string;
    body: string;
    details: string[];
  }[];
  return (
    <section className="py-20">
      <Container size="narrow">
        <ol className="space-y-8">
          {steps.map((s) => (
            <li
              key={s.step}
              className="relative grid gap-4 lg:grid-cols-[180px_1fr] rounded-2xl border border-surface-200 bg-white p-8"
            >
              <div className="text-5xl font-bold text-brand-200 font-mono">
                {s.step}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-ink-700 leading-relaxed">{s.body}</p>
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
                        className="mt-0.5 shrink-0 text-brand-500"
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

function Integrations() {
  const t = useTranslations("how.integrations");
  const items = t.raw("items") as { title: string; body: string }[];
  return (
    <section className="py-16 bg-surface-50 border-t border-surface-200">
      <Container>
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-xl bg-white border border-surface-200 p-5"
            >
              <h3 className="font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{it.body}</p>
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
    <section className="py-20 border-t border-surface-200 bg-white">
      <Container>
        <div className="max-w-3xl">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-3 text-ink-700">{t("subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((it) => (
              <article
                key={it.title}
                className="rounded-2xl border border-surface-200 bg-surface-50 p-6 flex flex-col"
              >
                <span className="inline-flex self-start items-center rounded-full bg-white border border-surface-200 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">
                  {it.tag}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{it.title}</h3>
                <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                  {it.body}
                </p>
              </article>
            ))}
          </div>
          <div className="rounded-2xl border border-surface-200 bg-ink-900 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
              <span className="h-2.5 w-2.5 rounded-full bg-danger-600/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success-600/70" />
              <span className="ml-2 text-xs font-mono text-white/50">
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
      <p className="text-[0.68rem] uppercase tracking-wider text-white/40">
        Aperçu bannières
      </p>
      <div className="flex flex-wrap gap-2">
        <div className="rounded-md bg-brand-500/90 text-white text-xs font-semibold px-3 py-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          728 × 90
        </div>
        <div className="rounded-md bg-brand-500/90 text-white text-xs font-semibold px-3 py-6 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          300 × 250
        </div>
        <div className="rounded-md bg-brand-500/90 text-white text-xs font-semibold px-3 py-3 flex items-center gap-2">
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
    <section className="py-16 bg-surface-50 border-t border-surface-200">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-3 text-ink-700">{t("subtitle")}</p>
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

function Cta() {
  return (
    <section className="py-20">
      <Container size="narrow" className="text-center">
        <LinkButton href="/signup" size="lg">
          Créer mon espace partenaire →
        </LinkButton>
      </Container>
    </section>
  );
}
