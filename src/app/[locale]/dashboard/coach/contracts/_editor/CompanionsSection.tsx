"use client";

import type { CoverageData } from "@/lib/coach/coverage-types";
import { RELATIVE_OPTIONS } from "./constants";

export function CompanionsSection({
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
        {isEn ? "Companions covered" : "Proches couverts"}
      </summary>
      <p className="mt-2 text-xs text-ink-500">
        {isEn
          ? "Pick everyone the contract explicitly covers. Anyone unchecked will be flagged as not covered when the agent runs an analysis."
          : "Cochez chaque proche que le contrat couvre explicitement. Les non-cochés seront signalés non couverts dans l'analyse."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {RELATIVE_OPTIONS.map((r) => {
          const on = data.coveredRelatives.includes(r);
          return (
            <button
              type="button"
              key={r}
              onClick={() => {
                const next = on
                  ? data.coveredRelatives.filter((x) => x !== r)
                  : [...data.coveredRelatives, r];
                setData({ ...data, coveredRelatives: next });
              }}
              className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
                on
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-300 text-ink-700"
              }`}
            >
              {on ? "✓ " : ""}
              {r.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>
    </details>
  );
}
