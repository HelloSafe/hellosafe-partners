"use client";

import { useTranslations } from "next-intl";
import { PERSONAS, type Persona } from "./personas";

export function Step1Persona({
  selected,
  onSelect,
}: {
  selected: Persona | null;
  onSelect: (p: Persona) => void;
}) {
  const t = useTranslations("onboarding");

  const quoteKey = selected && selected !== "other" ? selected : "blog";
  const quote = t.raw(`testimonial.byPersona.${quoteKey}`) as {
    quote: string;
    author: string;
    role: string;
    metric: string;
  };

  return (
    <div>
      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-700">
        {t("step1.label")}
      </span>
      <h1 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight">
        {t("step1.title")}
      </h1>
      <p className="mt-3 text-ink-700 max-w-2xl">{t("step1.subtitle")}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {PERSONAS.map((p) => {
          const on = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`group flex items-start gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                on
                  ? "border-brand-500 bg-brand-50 shadow-sm"
                  : "border-surface-200 bg-white hover:border-brand-300 hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="flex-1">
                <span className="block font-semibold text-ink-900">
                  {t(`personas.${p.id}.label`)}
                </span>
                <span className="block text-sm text-ink-500 mt-0.5">
                  {t(`personas.${p.id}.sub`)}
                </span>
              </span>
              <span
                className={`h-5 w-5 rounded-full border-2 transition-colors ${
                  on
                    ? "border-brand-500 bg-brand-500"
                    : "border-surface-300 group-hover:border-brand-300"
                }`}
              >
                {on && (
                  <svg viewBox="0 0 16 16" className="text-white" aria-hidden>
                    <path
                      d="M3 8.5l3 3 6-6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <figure className="mt-8 relative rounded-3xl border border-surface-200 bg-white p-6 lg:p-8 shadow-sm">
        <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-success-50 border border-success-600/30 px-3 py-1 text-[0.68rem] font-display font-bold uppercase tracking-wider text-success-900">
          {quote.metric}
        </span>
        <span className="block text-xs font-semibold uppercase tracking-wider text-brand-700">
          {t("testimonial.eyebrow")}
        </span>
        <blockquote className="mt-3 text-base lg:text-lg text-ink-900 leading-relaxed">
          «&nbsp;{quote.quote}&nbsp;»
        </blockquote>
        <figcaption className="mt-5 pt-5 border-t border-surface-200 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-display font-bold">
            {quote.author.slice(0, 1)}
          </span>
          <span>
            <span className="block font-display font-bold text-ink-900">
              {quote.author}
            </span>
            <span className="block text-sm text-ink-500">{quote.role}</span>
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
