import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Avatar, QuoteIcon } from "./icons";

/** 3-card testimonials, middle one elevated. */
export function Testimonials() {
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
