"use client";

import type { GuaranteeRow } from "@/lib/coach/coverage-types";

/** One guarantee row: 3 columns (current / gap / HelloSafe answer). */
export function RowCard({
  row,
  isEn,
  accent,
}: {
  row: GuaranteeRow;
  isEn: boolean;
  accent: string;
}) {
  const tone = row.gap?.severity ?? "ok";
  return (
    <div className="grid gap-0 lg:grid-cols-3 rounded-2xl border border-surface-200 overflow-hidden break-inside-avoid">
      {/* Left: current */}
      <div className="px-6 py-5 bg-surface-50 border-b lg:border-b-0 lg:border-r border-surface-200">
        <p className="text-[0.65rem] uppercase tracking-wider font-bold text-ink-500">
          {isEn ? "Current cover" : "Couverture actuelle"}
        </p>
        <h3 className="mt-2 text-base font-semibold leading-snug">
          {row.guaranteeLabel}
        </h3>
        <p className="mt-3 text-sm text-ink-700 leading-relaxed">
          {row.current.summary}
        </p>
        {row.current.breakdown.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-ink-500">
            {row.current.breakdown.map((b, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span className="truncate">{b.source}</span>
                <span className="font-medium text-ink-700 text-right">
                  {b.detail}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Middle: gap */}
      <div
        className={`px-6 py-5 border-b lg:border-b-0 lg:border-r border-surface-200 ${
          tone === "critical"
            ? "bg-danger-50/40"
            : tone === "warning"
            ? "bg-warning-50/40"
            : "bg-success-50/30"
        }`}
      >
        <p className="text-[0.65rem] uppercase tracking-wider font-bold">
          {tone === "critical" ? (
            <span className="text-danger-600">
              {isEn ? "Critical gap" : "Écart critique"}
            </span>
          ) : tone === "warning" ? (
            <span className="text-warning-600">
              {isEn ? "Warning" : "Alerte"}
            </span>
          ) : (
            <span className="text-success-600">
              {isEn ? "Already covered" : "Déjà couvert"}
            </span>
          )}
        </p>
        {row.gap ? (
          <>
            <h3 className="mt-2 text-base font-semibold leading-snug">
              {row.gap.title}
            </h3>
            <p className="mt-3 text-sm text-ink-700 leading-relaxed">
              {row.gap.explanation}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-700 leading-relaxed">
            {isEn
              ? "Sufficient coverage on this guarantee — no recommendation."
              : "Couverture suffisante sur cette garantie, pas de recommandation."}
          </p>
        )}
      </div>
      {/* Right: HelloSafe answer */}
      <div className="px-6 py-5 bg-white">
        <p
          className="text-[0.65rem] uppercase tracking-wider font-bold"
          style={{ color: accent }}
        >
          {isEn ? "HelloSafe answer" : "Réponse HelloSafe"}
        </p>
        <p className="mt-3 text-sm font-semibold leading-relaxed">
          {row.helloSafe.summary}
        </p>
        {row.gap && (
          <p className="mt-2 text-xs text-ink-500 leading-relaxed">
            {row.gap.helloSafeAnswer}
          </p>
        )}
      </div>
    </div>
  );
}
