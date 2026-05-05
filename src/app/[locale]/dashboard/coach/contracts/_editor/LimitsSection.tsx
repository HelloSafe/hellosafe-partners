"use client";

import type { CoverageData } from "@/lib/coach/coverage-types";
import { CheckboxField, NumberField } from "./ui";

export function LimitsSection({
  isEn,
  data,
  setData,
}: {
  isEn: boolean;
  data: CoverageData;
  setData: (next: CoverageData) => void;
}) {
  return (
    <details className="rounded-xl border border-surface-200 p-4 group" open>
      <summary className="font-semibold cursor-pointer">
        {isEn ? "Coverage limits" : "Plafonds garanties"}
      </summary>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <NumberField
          label={isEn ? "Medical expenses (€)" : "Frais médicaux (€)"}
          value={
            data.limits.medical_expenses && !data.limits.medical_expenses.unlimited
              ? data.limits.medical_expenses.amount.cents / 100
              : 0
          }
          onChange={(v) =>
            setData({
              ...data,
              limits: {
                ...data.limits,
                medical_expenses: {
                  unlimited: false,
                  amount: { cents: Math.round(v * 100), currency: "EUR" },
                },
              },
            })
          }
        />
        <NumberField
          label={isEn ? "Trip cancellation (€)" : "Annulation (€)"}
          value={(data.limits.trip_cancellation?.cents ?? 0) / 100}
          onChange={(v) =>
            setData({
              ...data,
              limits: {
                ...data.limits,
                trip_cancellation: {
                  ...(data.limits.trip_cancellation ?? {
                    currency: "EUR",
                    cents: 0,
                  }),
                  cents: Math.round(v * 100),
                  currency: "EUR",
                },
              },
            })
          }
        />
        <NumberField
          label={isEn ? "Baggage (€)" : "Bagages (€)"}
          value={(data.limits.baggage?.cents ?? 0) / 100}
          onChange={(v) =>
            setData({
              ...data,
              limits: {
                ...data.limits,
                baggage: { cents: Math.round(v * 100), currency: "EUR" },
              },
            })
          }
        />
        <NumberField
          label={isEn ? "Personal liability (€)" : "Responsabilité civile (€)"}
          value={(data.limits.personal_liability?.cents ?? 0) / 100}
          onChange={(v) =>
            setData({
              ...data,
              limits: {
                ...data.limits,
                personal_liability: {
                  cents: Math.round(v * 100),
                  currency: "EUR",
                },
              },
            })
          }
        />
        <CheckboxField
          label={isEn ? "Repatriation covered" : "Rapatriement couvert"}
          checked={data.limits.repatriation?.covered ?? false}
          onChange={(c) =>
            setData({
              ...data,
              limits: {
                ...data.limits,
                repatriation: { covered: c, actualCosts: c },
              },
            })
          }
        />
        <CheckboxField
          label={isEn ? "Winter sports covered" : "Sports d'hiver couverts"}
          checked={data.limits.winter_sports?.covered ?? false}
          onChange={(c) =>
            setData({
              ...data,
              limits: {
                ...data.limits,
                winter_sports: c
                  ? { covered: true, cap: { cents: 5_000_00, currency: "EUR" } }
                  : { covered: false },
              },
            })
          }
        />
      </div>
    </details>
  );
}
