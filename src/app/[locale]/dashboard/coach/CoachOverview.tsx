"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

type AnalysisRow = {
  id: string;
  clientLabel: string;
  locale: "fr" | "en";
  createdAt: string;
  output: {
    summary: {
      totalSources: number;
      criticalGaps: number;
      warningGaps: number;
      coverageScore: number;
    };
  };
  inputs: {
    trip: { destinationLabel: string; startDate: string; endDate: string };
  };
};

export function CoachOverview() {
  const locale = useLocale();
  const isEn = locale === "en";
  const [items, setItems] = useState<AnalysisRow[] | null>(null);

  useEffect(() => {
    fetch("/api/coach/analyses", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(d.analyses ?? []));
  }, []);

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));

  return (
    <div className="space-y-10 max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            {isEn ? "Sales coach" : "Coach de vente"}
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-bold tracking-tight">
            {isEn
              ? "Show your client what their current cover misses, in 30 seconds."
              : "Montrez à votre client ce que sa couverture actuelle ne couvre pas, en 30 secondes."}
          </h1>
          <p className="mt-3 text-ink-700 max-w-2xl">
            {isEn
              ? "Pick a card, a top-up, the home country social security, and (optionally) your own contract. The Coach lays out the gaps in red, with the HelloSafe answer on the right."
              : "Sélectionnez une carte, une mutuelle, la sécu du pays de départ et (en option) votre propre contrat. Le Coach affiche les écarts en rouge, avec la réponse HelloSafe à droite."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={"/dashboard/coach/contracts" as never}
            className="inline-flex items-center h-11 px-4 rounded-xl border border-surface-300 text-sm font-semibold text-ink-900 hover:border-brand-300 hover:text-brand-700"
          >
            {isEn ? "My contracts" : "Mes contrats"}
          </Link>
          <Link
            href={"/dashboard/coach/new" as never}
            className="inline-flex items-center h-11 px-5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            {isEn ? "+ New analysis" : "+ Nouvelle analyse"}
          </Link>
        </div>
      </header>

      {!items && (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        </div>
      )}

      {items && items.length === 0 && (
        <EmptyState isEn={isEn} />
      )}

      {items && items.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">
            {isEn ? "Past analyses" : "Analyses passées"}
          </h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/dashboard/coach/${a.id}` as never}
                  className="group block rounded-2xl border border-surface-200 bg-white p-5 hover:border-brand-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-900 truncate max-w-[14rem]">
                        {a.clientLabel}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {a.inputs?.trip?.destinationLabel ?? "—"}
                      </p>
                    </div>
                    <ScoreBadge score={a.output.summary.coverageScore} />
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs">
                    {a.output.summary.criticalGaps > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-2 py-0.5 font-semibold text-danger-600">
                        {a.output.summary.criticalGaps} {isEn ? "critical" : "critiques"}
                      </span>
                    )}
                    {a.output.summary.warningGaps > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 font-semibold text-warning-600">
                        {a.output.summary.warningGaps} {isEn ? "warnings" : "alertes"}
                      </span>
                    )}
                    <span className="ml-auto text-ink-500">
                      {fmtDate(a.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function EmptyState({ isEn }: { isEn: boolean }) {
  return (
    <div className="rounded-3xl border border-dashed border-surface-300 bg-surface-50 px-8 py-16 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 text-2xl">
        🎯
      </span>
      <h2 className="mt-5 text-2xl font-bold">
        {isEn
          ? "Run your first analysis in under 2 minutes"
          : "Lancez votre première analyse en moins de 2 minutes"}
      </h2>
      <p className="mt-3 text-ink-700 max-w-xl mx-auto">
        {isEn
          ? "Tell the Coach the basics about the trip and the traveler's existing cover. We'll lay out exactly what's missing — and what to recommend."
          : "Indiquez au Coach les bases du voyage et la couverture déjà en place. On vous sort les trous et la bonne recommandation."}
      </p>
      <div className="mt-8">
        <Link
          href={"/dashboard/coach/new" as never}
          className="inline-flex items-center h-12 px-6 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
        >
          {isEn ? "Start an analysis" : "Démarrer une analyse"} →
        </Link>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 75
      ? "bg-success-50 text-success-600"
      : score >= 50
      ? "bg-warning-50 text-warning-600"
      : "bg-danger-50 text-danger-600";
  return (
    <span
      className={`inline-flex items-center justify-center h-10 w-10 rounded-xl font-bold text-sm tabular-nums ${tone}`}
    >
      {score}
    </span>
  );
}
