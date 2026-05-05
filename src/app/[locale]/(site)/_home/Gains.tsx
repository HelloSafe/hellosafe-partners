import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { ClockIcon, CoinIcon, ShieldIcon, SparkleIcon } from "./icons";

type GainKey = "money" | "time" | "trust" | "calm";

/** "Why partner with us" bento section. Order of items determines layout span. */
export function Gains() {
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
