"use client";

import type {
  AgeRange,
  CompanionKind,
  WizardInputs,
} from "@/lib/coach/coverage-types";
import type { Branding } from "./types";

/**
 * Print-ready header of the analysis report. Shows the partner's brand
 * (logo or initial), tagline, the score, and a 3-snippet recap row.
 */
export function ReportHeader({
  branding,
  accent,
  score,
  inputs,
  clientLabel,
  isEn,
  compLabels,
}: {
  branding: Branding | null;
  accent: string;
  score: number;
  inputs: WizardInputs;
  clientLabel: string;
  isEn: boolean;
  ageLabels?: Record<AgeRange, string>;
  compLabels: Record<CompanionKind, string>;
}) {
  return (
    <header
      className="rounded-t-2xl px-8 py-6 print:px-0"
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, #0b1031 100%)`,
      }}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {branding?.agencyLogoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={branding.agencyLogoUrl}
              alt={branding.agencyName}
              className="h-10 w-auto bg-white rounded p-1"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center text-white font-bold">
              {(branding?.agencyName ?? "·").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-white text-lg font-bold leading-tight">
              {branding?.agencyName ?? "Voyages"}
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              {branding?.agencyTagline ??
                (isEn ? "Travel coverage analysis" : "Analyse de couverture voyage")}
            </p>
          </div>
        </div>
        <ScoreBadgeBig score={score} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3 text-white/90">
        <Snippet label={isEn ? "Client" : "Client"} value={clientLabel} />
        <Snippet
          label={isEn ? "Trip" : "Voyage"}
          value={`${inputs.trip.destinationLabel} · ${inputs.trip.startDate} → ${inputs.trip.endDate}`}
        />
        <Snippet
          label={isEn ? "Companions" : "Accompagnants"}
          value={
            inputs.client.companions.length === 0
              ? isEn
                ? "Solo"
                : "Seul"
              : inputs.client.companions
                  .map((c) => compLabels[c.kind])
                  .join(", ")
          }
        />
      </div>
    </header>
  );
}

function ScoreBadgeBig({ score }: { score: number }) {
  const tone =
    score >= 75
      ? "bg-success-50 text-success-600"
      : score >= 50
      ? "bg-warning-50 text-warning-600"
      : "bg-danger-50 text-danger-600";
  return (
    <div
      className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl ${tone}`}
    >
      <span className="text-4xl font-bold tabular-nums">{score}</span>
      <span className="text-[0.65rem] font-bold uppercase tracking-wider">
        / 100
      </span>
    </div>
  );
}

function Snippet({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-wider text-white/60 font-bold">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium leading-snug">{value}</p>
    </div>
  );
}
