"use client";

import { useTranslations } from "next-intl";
import { CountryMultiSelect } from "./CountryMultiSelect";

export type TripFormState = {
  arrivalCountries: string[];
  startDate: string; // YYYY-MM-DD
  endDate: string;
  travellers: { age: number }[];
};

export function TripForm({
  state,
  setState,
}: {
  state: TripFormState;
  setState: (s: TripFormState) => void;
}) {
  const t = useTranslations("dashboard.products.form");

  const addTraveller = () =>
    setState({
      ...state,
      travellers: [...state.travellers, { age: 35 }],
    });

  const removeTraveller = (idx: number) =>
    setState({
      ...state,
      travellers: state.travellers.filter((_, i) => i !== idx),
    });

  const updateAge = (idx: number, age: number) => {
    const next = [...state.travellers];
    next[idx] = { age };
    setState({ ...state, travellers: next });
  };

  return (
    <section className="rounded-2xl border border-surface-200 bg-white p-6 lg:p-8 space-y-6">
      <h2 className="text-lg font-bold text-ink-900">{t("title")}</h2>

      <Field label={t("residence")}>
        <div className="inline-flex items-center rounded-lg border border-surface-300 bg-surface-50 px-3 h-10 text-sm font-medium text-ink-700">
          {t("residenceFr")}
        </div>
      </Field>

      <Field label={t("destinations")}>
        <CountryMultiSelect
          selected={state.arrivalCountries}
          onChange={(codes) =>
            setState({ ...state, arrivalCountries: codes })
          }
          placeholder="Tapez un nom de pays (ex : Espagne)…"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("startDate")}>
          <input
            type="date"
            value={state.startDate}
            onChange={(e) => setState({ ...state, startDate: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label={t("endDate")}>
          <input
            type="date"
            value={state.endDate}
            onChange={(e) => setState({ ...state, endDate: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label={t("travelers")}>
        <div className="space-y-2">
          {state.travellers.map((tr, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm text-ink-500 w-8 tabular-nums">
                #{i + 1}
              </span>
              <input
                type="number"
                min={0}
                max={120}
                value={tr.age}
                onChange={(e) => updateAge(i, Number(e.target.value) || 0)}
                placeholder={t("travelerAge")}
                className="w-24 rounded-lg border border-surface-300 bg-white px-3 h-10 text-sm font-mono tabular-nums text-ink-900 focus-ring focus:border-brand-500"
              />
              <span className="text-sm text-ink-500">{t("travelerAge")}</span>
              {state.travellers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTraveller(i)}
                  className="ml-auto text-xs text-ink-500 hover:text-danger-600"
                >
                  {t("removeTraveler")}
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTraveller}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            {t("addTraveler")}
          </button>
        </div>
      </Field>
    </section>
  );
}

const inputCls =
  "w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] text-ink-900 focus-ring transition-colors focus:border-brand-500";

function Field({
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
