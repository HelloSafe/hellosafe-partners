/**
 * Gap engine — deterministic coverage gap analyzer.
 *
 * Public API: `runGapAnalysis(input)` → `GapAnalysisOutput`.
 *
 * Internal layout:
 *   types.ts        — RowContext, EngineInput, CoverageRecord
 *   baseline.ts     — HelloSafe reference values + i18n labels + fmtEur
 *   extractors.ts   — pure getters over CoverageData
 *   eligibility.ts  — recordApplies + uncovered companions
 *   rows.ts         — one builder per guarantee row
 *   index.ts        — this file: orchestrates the above
 */

import {
  tripDurationDays,
  type GapAnalysisOutput,
  type GuaranteeRow,
} from "../coverage-types";
import {
  fmtEur,
  GUARANTEE_LABELS_EN,
  GUARANTEE_LABELS_FR,
  HELLOSAFE_BASELINE,
  HELLOSAFE_PRICE_PER_DAY_CENTS,
} from "./baseline";
import {
  computeUncoveredCompanions,
  recordApplies,
} from "./eligibility";
import {
  getBaggageCents,
  getCancellationCents,
  getLiabilityCents,
  getMedicalCents,
  isRepatriationCovered,
  isWinterSportsCovered,
} from "./extractors";
import {
  buildBaggageRow,
  buildCancellationRow,
  buildCompanionsRow,
  buildDurationRow,
  buildLiabilityRow,
  buildMedicalRow,
  buildRepatriationRow,
  buildWinterSportsRow,
} from "./rows";
import type {
  EngineInput,
  RowContext,
  SourceWithStatus,
} from "./types";

// Re-export types that callers need.
export type { EngineInput } from "./types";

/** Run the full gap analysis. */
export function runGapAnalysis(input: EngineInput): GapAnalysisOutput {
  const { inputs, card, mutuelle, socialSecurity, partnerContract, locale } =
    input;
  const labels = locale === "en" ? GUARANTEE_LABELS_EN : GUARANTEE_LABELS_FR;
  const tripDays = tripDurationDays(inputs.trip.startDate, inputs.trip.endDate);

  // Determine which sources actually apply.
  const sources: SourceWithStatus[] = [];
  for (const r of [card, mutuelle, socialSecurity, partnerContract]) {
    if (!r) continue;
    sources.push({ rec: r, ...recordApplies(r, inputs, tripDays) });
  }
  const activeSources = sources.filter((s) => s.applies);
  const inactiveSources = sources.filter((s) => !s.applies);

  // Aggregate caps across active sources. Medical/baggage/cancellation sum;
  // liability takes the best (max). Repatriation/winter-sports are bools.
  const aggMedicalCents = activeSources.reduce(
    (acc, s) =>
      acc +
      (Number.isFinite(getMedicalCents(s.rec.data))
        ? getMedicalCents(s.rec.data)
        : 0),
    0,
  );
  const aggCancellationCents = activeSources.reduce(
    (acc, s) => acc + getCancellationCents(s.rec.data),
    0,
  );
  const aggBaggageCents = activeSources.reduce(
    (acc, s) => acc + getBaggageCents(s.rec.data),
    0,
  );
  const aggLiabilityCents = activeSources.reduce(
    (acc, s) => Math.max(acc, getLiabilityCents(s.rec.data)),
    0,
  );
  const repatriationCovered = activeSources.some((s) =>
    isRepatriationCovered(s.rec.data),
  );
  const winterSportsCovered = activeSources.some((s) =>
    isWinterSportsCovered(s.rec.data),
  );
  const uncoveredCompanions = computeUncoveredCompanions(inputs, activeSources);

  const ctx: RowContext = {
    locale,
    labels,
    inputs,
    tripDays,
    activeSources,
    inactiveSources,
    aggMedicalCents,
    aggCancellationCents,
    aggBaggageCents,
    aggLiabilityCents,
    repatriationCovered,
    winterSportsCovered,
    uncoveredCompanions,
  };

  // Order matters: companions and duration appear at the top because they
  // are the most concrete pain points for the agent's pitch.
  const rows: GuaranteeRow[] = [
    buildCompanionsRow(ctx),
    buildDurationRow(ctx),
    buildMedicalRow(ctx),
    buildRepatriationRow(ctx),
    buildCancellationRow(ctx),
    buildLiabilityRow(ctx),
    buildBaggageRow(ctx),
    buildWinterSportsRow(ctx),
  ].filter((r): r is GuaranteeRow => r !== null);

  // ---------- Summary score ----------
  const filledRows = rows.filter((r) => r.gap === null).length;
  const score = rows.length === 0 ? 100 : Math.round((filledRows / rows.length) * 100);
  const criticalGaps = rows.filter((r) => r.gap?.severity === "critical").length;
  const warningGaps = rows.filter((r) => r.gap?.severity === "warning").length;

  const helloMedicalCents = HELLOSAFE_BASELINE.limits.medical_expenses!.unlimited
    ? Number.POSITIVE_INFINITY
    : (
        HELLOSAFE_BASELINE.limits.medical_expenses as {
          unlimited: false;
          amount: { cents: number; currency: string };
        }
      ).amount.cents;

  return {
    generatedAt: new Date().toISOString(),
    locale,
    summary: {
      totalSources: activeSources.length,
      rowsCount: rows.length,
      criticalGaps,
      warningGaps,
      coverageScore: score,
    },
    rows,
    helloSafeRecommendation: {
      name: "HelloSafe Travel — Go Protect",
      pricePerDayCents: HELLOSAFE_PRICE_PER_DAY_CENTS,
      bullets:
        locale === "en"
          ? [
              `Medical expenses up to ${fmtEur(helloMedicalCents, locale)}`,
              "Repatriation at actual costs, 24/7 hotline",
              "Cancellation up to 100% of trip value, all justified causes",
              "Spouse, partner, all-age children & parents covered identically",
            ]
          : [
              `Frais médicaux jusqu'à ${fmtEur(helloMedicalCents, locale)}`,
              "Rapatriement aux frais réels, assistance 24/7",
              "Annulation jusqu'à 100 % du voyage, toutes causes justifiées",
              "Conjoint, concubin, enfants tous âges et parents couverts à l'identique",
            ],
    },
  };
}
