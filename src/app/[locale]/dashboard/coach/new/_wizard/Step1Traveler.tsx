"use client";

import { useTranslations } from "next-intl";
import type {
  AgeRange,
  Companion,
  CompanionKind,
  DepartureCountry,
  WizardInputs,
} from "@/lib/coach/coverage-types";
import { AGE_RANGES, COMPANION_KINDS } from "./constants";
import { Field, inputCls } from "./ui";

export function Step1Traveler({
  data,
  setData,
  ageLabels,
  compLabels,
}: {
  data: WizardInputs;
  setData: (s: WizardInputs) => void;
  ageLabels: Record<AgeRange, string>;
  compLabels: Record<CompanionKind, string>;
}) {
  const t = useTranslations("coachWizard.step1");

  const toggleCompanion = (kind: CompanionKind) => {
    const exists = data.client.companions.find((c) => c.kind === kind);
    let next: Companion[];
    if (exists) {
      next = data.client.companions.filter((c) => c.kind !== kind);
    } else {
      next = [...data.client.companions, { kind, count: 1 }];
    }
    setData({ ...data, client: { ...data.client, companions: next } });
  };

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-7">
      <Field label={t("ref.label")} hint={t("ref.hint")}>
        <input
          autoFocus
          value={data.client.label}
          onChange={(e) =>
            setData({ ...data, client: { ...data.client, label: e.target.value } })
          }
          placeholder={t("ref.placeholder")}
          className={inputCls}
        />
      </Field>

      <Field label={t("ageRange.label")}>
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() =>
                setData({
                  ...data,
                  client: { ...data.client, ageRange: r },
                })
              }
              className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
                data.client.ageRange === r
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-300 text-ink-700 hover:border-brand-300"
              }`}
            >
              {ageLabels[r]}
            </button>
          ))}
        </div>
      </Field>

      <Field label={t("country.label")} hint={t("country.hint")}>
        <div className="flex gap-2">
          {(["FR", "CA"] as DepartureCountry[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() =>
                setData({
                  ...data,
                  client: { ...data.client, departureCountry: c },
                })
              }
              className={`rounded-lg border px-4 h-10 text-sm font-semibold transition-colors ${
                data.client.departureCountry === c
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-300 text-ink-700 hover:border-brand-300"
              }`}
            >
              {c === "FR" ? t("country.fr") : t("country.ca")}
            </button>
          ))}
        </div>
      </Field>

      <Field label={t("companions.label")} hint={t("companions.hint")}>
        <div className="flex flex-wrap gap-2">
          {COMPANION_KINDS.map((k) => {
            const checked = data.client.companions.find((c) => c.kind === k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleCompanion(k)}
                className={`rounded-lg border px-3 h-10 text-sm font-medium transition-colors ${
                  checked
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-300 text-ink-700 hover:border-brand-300"
                }`}
              >
                {checked ? "✓ " : ""}
                {compLabels[k]}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}
