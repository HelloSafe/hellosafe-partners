"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type {
  GapAnalysisOutput,
  GuaranteeRow,
  WizardInputs,
} from "@/lib/coverage-types";
import {
  AGE_RANGE_LABEL_EN,
  AGE_RANGE_LABEL_FR,
  COMPANION_LABEL_EN,
  COMPANION_LABEL_FR,
} from "@/lib/coverage-types";

type Branding = {
  agencyName: string;
  agencyLogoUrl: string | null;
  agencyBrandColor: string;
  agencyTagline: string | null;
};

export function AnalysisView({ id }: { id: string }) {
  const locale = useLocale();
  const isEn = locale === "en";
  const [analysis, setAnalysis] = useState<{
    inputs: WizardInputs;
    output: GapAnalysisOutput;
    clientLabel: string;
    createdAt: string;
  } | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/coach/analyses/${id}`, { cache: "no-store" }).then((r) =>
        r.json(),
      ),
      fetch("/api/account/branding", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([a, b]) => {
      if (a.analysis) {
        setAnalysis({
          inputs: a.analysis.inputs,
          output: a.analysis.output,
          clientLabel: a.analysis.clientLabel,
          createdAt: a.analysis.createdAt,
        });
      }
      if (b.branding) setBranding(b.branding);
    });
  }, [id]);

  if (!analysis) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const ageLabels = isEn ? AGE_RANGE_LABEL_EN : AGE_RANGE_LABEL_FR;
  const compLabels = isEn ? COMPANION_LABEL_EN : COMPANION_LABEL_FR;
  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(iso));

  const accent = branding?.agencyBrandColor ?? "#563bff";

  return (
    <div className="max-w-6xl">
      {/* Sticky toolbar — hidden on print */}
      <div className="print:hidden flex flex-wrap items-center gap-3 mb-6">
        <Link
          href={"/dashboard/coach" as never}
          className="text-sm text-ink-700 hover:text-brand-700"
        >
          ← {isEn ? "Back to Coach" : "Retour au Coach"}
        </Link>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => window.print()}
            className="h-10 px-4 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600"
          >
            🖨 {isEn ? "Print / save as PDF" : "Imprimer / PDF"}
          </button>
        </div>
      </div>

      {/* Brandable document */}
      <article className="rounded-2xl border border-surface-200 bg-white print:border-0 print:shadow-none">
        <header
          className="rounded-t-2xl px-8 py-6 print:px-0"
          style={{ background: `linear-gradient(135deg, ${accent} 0%, #0b1031 100%)` }}
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
                  {branding?.agencyTagline ?? (isEn ? "Travel coverage analysis" : "Analyse de couverture voyage")}
                </p>
              </div>
            </div>
            <ScoreBadgeBig score={analysis.output.summary.coverageScore} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3 text-white/90">
            <Snippet
              label={isEn ? "Client" : "Client"}
              value={analysis.clientLabel}
            />
            <Snippet
              label={isEn ? "Trip" : "Voyage"}
              value={`${analysis.inputs.trip.destinationLabel} · ${analysis.inputs.trip.startDate} → ${analysis.inputs.trip.endDate}`}
            />
            <Snippet
              label={isEn ? "Companions" : "Accompagnants"}
              value={
                analysis.inputs.client.companions.length === 0
                  ? isEn
                    ? "Solo"
                    : "Seul"
                  : analysis.inputs.client.companions
                      .map((c) => compLabels[c.kind])
                      .join(", ")
              }
            />
          </div>
        </header>

        <div className="px-8 py-8 print:px-0">
          <p className="text-sm text-ink-500">
            {isEn ? "Generated on" : "Généré le"} {fmtDate(analysis.createdAt)} ·{" "}
            {ageLabels[analysis.inputs.client.ageRange]} ·{" "}
            {analysis.inputs.client.departureCountry === "FR"
              ? isEn
                ? "Departure: France"
                : "Départ depuis la France"
              : isEn
              ? "Departure: United Kingdom"
              : "Départ depuis le Royaume-Uni"}
          </p>

          <SummaryStrip output={analysis.output} isEn={isEn} accent={accent} />

          <div className="mt-10 space-y-4">
            {analysis.output.rows.map((row) => (
              <RowCard key={row.guarantee} row={row} isEn={isEn} accent={accent} />
            ))}
          </div>

          <Recommendation
            output={analysis.output}
            isEn={isEn}
            accent={accent}
          />
        </div>

        <footer className="border-t border-surface-200 px-8 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500 print:px-0">
          <span>
            {isEn
              ? "This document is a sales aid. Coverage decisions are subject to the actual contract terms."
              : "Ce document est une aide à la vente. Les décisions de couverture sont soumises aux conditions réelles du contrat."}
          </span>
          <span className="font-mono text-ink-300">{id.slice(0, 8)}</span>
        </footer>
      </article>
    </div>
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

function SummaryStrip({
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

function RowCard({
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

function Recommendation({
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
