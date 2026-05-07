"use client";

import { useTranslations } from "next-intl";
import type {
  TripActivity,
  TripPurpose,
  WizardInputs,
} from "@/lib/coach/coverage-types";
import { Field, inputCls } from "./ui";

export function Step2Trip({
  data,
  setData,
}: {
  data: WizardInputs;
  setData: (s: WizardInputs) => void;
}) {
  const t = useTranslations("coachWizard.step2");

  const purposes: TripPurpose[] = [
    "leisure",
    "business",
    "study",
    "expat",
    "visa_required",
    "cruise",
  ];
  const activities: TripActivity[] = [
    "winter_sports",
    "diving",
    "trekking",
    "extreme_sports",
    "motorbike",
  ];

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-7">
      <Field label={t("destination.label")} hint={t("destination.hint")}>
        <input
          value={data.trip.destinationLabel}
          onChange={(e) =>
            setData({
              ...data,
              trip: {
                ...data.trip,
                destinationLabel: e.target.value,
                destination: e.target.value,
              },
            })
          }
          placeholder={t("destination.placeholder")}
          className={inputCls}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("startDate")}>
          <input
            type="date"
            value={data.trip.startDate}
            onChange={(e) =>
              setData({
                ...data,
                trip: { ...data.trip, startDate: e.target.value },
              })
            }
            className={inputCls}
          />
        </Field>
        <Field label={t("endDate")}>
          <input
            type="date"
            value={data.trip.endDate}
            onChange={(e) =>
              setData({
                ...data,
                trip: { ...data.trip, endDate: e.target.value },
              })
            }
            className={inputCls}
          />
        </Field>
      </div>

      <Field label={t("tripValue.label")} hint={t("tripValue.hint")}>
        <input
          type="number"
          min={0}
          step={100}
          value={data.trip.estimatedTripValueEur}
          onChange={(e) =>
            setData({
              ...data,
              trip: {
                ...data.trip,
                estimatedTripValueEur: Number(e.target.value) || 0,
              },
            })
          }
          className={inputCls}
        />
      </Field>

      <Field label={t("purpose.label")}>
        <div className="flex flex-wrap gap-2">
          {purposes.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() =>
                setData({ ...data, trip: { ...data.trip, purpose: p } })
              }
              className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
                data.trip.purpose === p
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-300 text-ink-700 hover:border-brand-300"
              }`}
            >
              {t(`purpose.options.${p}`)}
            </button>
          ))}
        </div>
      </Field>

      <Field label={t("activities.label")}>
        <div className="flex flex-wrap gap-2">
          {activities.map((a) => {
            const on = data.trip.activities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => {
                  const next = on
                    ? data.trip.activities.filter((x) => x !== a)
                    : [...data.trip.activities, a];
                  setData({ ...data, trip: { ...data.trip, activities: next } });
                }}
                className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
                  on
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-300 text-ink-700 hover:border-brand-300"
                }`}
              >
                {on ? "✓ " : ""}
                {t(`activities.options.${a}`)}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}
