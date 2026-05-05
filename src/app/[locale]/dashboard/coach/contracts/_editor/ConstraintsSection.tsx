"use client";

import type { CoverageData } from "@/lib/coach/coverage-types";
import { inputCls } from "./constants";
import { Field, NumberField } from "./ui";

export function ConstraintsSection({
  isEn,
  data,
  setData,
}: {
  isEn: boolean;
  data: CoverageData;
  setData: (next: CoverageData) => void;
}) {
  return (
    <details className="rounded-xl border border-surface-200 p-4">
      <summary className="font-semibold cursor-pointer">
        {isEn ? "Constraints" : "Contraintes"}
      </summary>
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <NumberField
          label={isEn ? "Max trip duration (days)" : "Durée max (jours)"}
          value={data.constraints.maxTripDurationDays ?? 0}
          onChange={(v) =>
            setData({
              ...data,
              constraints: { ...data.constraints, maxTripDurationDays: v },
            })
          }
        />
        <NumberField
          label={isEn ? "Max traveler age" : "Âge max du voyageur"}
          value={data.constraints.maxAgeYears ?? 0}
          onChange={(v) =>
            setData({
              ...data,
              constraints: { ...data.constraints, maxAgeYears: v },
            })
          }
        />
        <Field
          label={isEn ? "Geographical zone" : "Zone géographique"}
          hint={
            isEn
              ? '"worldwide" or "worldwide_excluding_us_canada"'
              : '« worldwide » ou « worldwide_excluding_us_canada »'
          }
        >
          <select
            value={data.constraints.geographicalZone ?? "worldwide"}
            onChange={(e) =>
              setData({
                ...data,
                constraints: {
                  ...data.constraints,
                  geographicalZone: e.target.value,
                },
              })
            }
            className={inputCls}
          >
            <option value="worldwide">worldwide</option>
            <option value="worldwide_excluding_us_canada">
              worldwide excl. US/Canada
            </option>
            <option value="EU+EHIC">EU + EHIC only</option>
          </select>
        </Field>
      </div>
    </details>
  );
}
