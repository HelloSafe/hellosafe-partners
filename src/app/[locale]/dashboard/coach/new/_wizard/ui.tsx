"use client";

/** Shared presentational primitives for the CoachWizard steps. */
import { useTranslations } from "next-intl";

export const inputCls =
  "w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] text-ink-900 focus-ring transition-colors focus:border-brand-500";

export function Header({ step }: { step: number }) {
  const t = useTranslations("coachWizard.header");
  const stepKeys = ["traveler", "trip", "coverage", "review"] as const;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
        {t("newAnalysis")} · {step}/4
      </p>
      <h1 className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight">
        {t(`steps.${stepKeys[step - 1]}`)}
      </h1>
      <ol className="mt-5 flex items-center gap-2">
        {stepKeys.map((key, i) => (
          <li
            key={key}
            className={`flex-1 h-1 rounded-full ${
              i + 1 <= step ? "bg-brand-500" : "bg-surface-200"
            }`}
          />
        ))}
      </ol>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink-900 mb-1">
        {label}
      </span>
      {hint && (
        <span className="block text-xs text-ink-500 mb-2 leading-relaxed">
          {hint}
        </span>
      )}
      {children}
    </label>
  );
}

export function SelectChips({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id || "none"}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
            value === o.id
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-surface-300 text-ink-700 hover:border-brand-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ReviewBlock({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
        {title}
      </p>
      <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-baseline justify-between gap-3 border-b border-surface-200 pb-1.5"
          >
            <dt className="text-sm text-ink-500">{k}</dt>
            <dd className="text-sm font-medium text-ink-900 text-right truncate">
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
