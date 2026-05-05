"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type {
  GapAnalysisOutput,
  WizardInputs,
} from "@/lib/coach/coverage-types";
import {
  AGE_RANGE_LABEL_EN,
  AGE_RANGE_LABEL_FR,
  COMPANION_LABEL_EN,
  COMPANION_LABEL_FR,
} from "@/lib/coach/coverage-types";
import { Recommendation } from "./_analysis/Recommendation";
import { ReportHeader } from "./_analysis/ReportHeader";
import { RowCard } from "./_analysis/RowCard";
import { SummaryStrip } from "./_analysis/SummaryStrip";
import type { Branding } from "./_analysis/types";

/**
 * Print-ready analysis report. Loads the analysis + the partner's
 * branding, then composes the brandable document from sub-sections.
 *
 * Sub-sections live under _analysis/:
 *   - ReportHeader      brand bar + score badge + 3-snippet recap
 *   - SummaryStrip      3-stat counters
 *   - RowCard           one per guarantee
 *   - Recommendation    HelloSafe upsell card at the bottom
 */
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
        <ReportHeader
          branding={branding}
          accent={accent}
          score={analysis.output.summary.coverageScore}
          inputs={analysis.inputs}
          clientLabel={analysis.clientLabel}
          isEn={isEn}
          ageLabels={ageLabels}
          compLabels={compLabels}
        />

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
              <RowCard
                key={row.guarantee}
                row={row}
                isEn={isEn}
                accent={accent}
              />
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
