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
    </div>
  );
}
