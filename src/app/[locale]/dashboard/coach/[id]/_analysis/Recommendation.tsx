"use client";

import type { GapAnalysisOutput } from "@/lib/coach/coverage-types";

export function Recommendation({
  output,
  isEn,
  accent,
}: {
  output: GapAnalysisOutput;
  isEn: boolean;
  accent: string;
}) {
  const eur = (cents: number) =>
    new Intl.NumberFormat(isEn ? "en-US" : "fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(cents / 100);

  return (
    <div
      className="mt-10 rounded-2xl p-7 lg:p-9 text-white relative overflow-hidden break-inside-avoid"
      style={{ background: `linear-gradient(135deg, ${accent} 0%, #0b1031 100%)` }}
    >
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="relative">
        <p className="text-[0.65rem] uppercase tracking-wider text-white/70 font-bold">
          {isEn ? "Recommendation" : "Recommandation"}
        </p>
        <h2 className="mt-2 text-2xl font-bold">
          {output.helloSafeRecommendation.name}
        </h2>
        <p className="mt-1 text-white/80 text-sm">
          {isEn ? "From " : "À partir de "}
          {eur(output.helloSafeRecommendation.pricePerDayCents)} /{" "}
          {isEn ? "day" : "jour"}
        </p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {output.helloSafeRecommendation.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[0.6rem] font-bold">
                ✓
              </span>
              <span className="text-white/90 leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
