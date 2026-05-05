"use client";

import type { GapAnalysisOutput } from "@/lib/coach/coverage-types";

export function SummaryStrip({
  output,
  isEn,
  accent,
}: {
  output: GapAnalysisOutput;
  isEn: boolean;
  accent: string;
}) {
  const { summary } = output;
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <div
        className="rounded-xl border border-surface-200 px-5 py-4"
        style={{ borderLeftWidth: 4, borderLeftColor: accent }}
      >
        <p className="text-xs text-ink-500">
          {isEn ? "Active sources" : "Sources actives"}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums">
          {summary.totalSources}
        </p>
      </div>
      <div className="rounded-xl border border-danger-600/30 bg-danger-50/50 px-5 py-4">
        <p className="text-xs text-danger-600 font-semibold">
          {isEn ? "Critical gaps" : "Écarts critiques"}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-danger-600">
          {summary.criticalGaps}
        </p>
      </div>
      <div className="rounded-xl border border-warning-500/30 bg-warning-50/50 px-5 py-4">
        <p className="text-xs text-warning-600 font-semibold">
          {isEn ? "Warnings" : "Alertes"}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-warning-600">
          {summary.warningGaps}
        </p>
      </div>
    </div>
  );
}
