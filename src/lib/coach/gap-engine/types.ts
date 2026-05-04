/**
 * Internal types used by the gap-engine. They are not exposed in the public
 * `runGapAnalysis` signature directly — the orchestrator wraps them.
 */

import type {
  CoverageData,
  GuaranteeKey,
  WizardInputs,
} from "../coverage-types";

export type Locale = "fr" | "en";

export type CoverageRecord = {
  id: string;
  name: string;
  type: "card" | "mutuelle" | "social_security" | "partner_contract";
  data: CoverageData;
};

export type EngineInput = {
  inputs: WizardInputs;
  card: CoverageRecord | null;
  mutuelle: CoverageRecord | null;
  socialSecurity: CoverageRecord | null;
  partnerContract: CoverageRecord | null;
  locale: Locale;
};

/** A coverage source plus the eligibility verdict for the current trip. */
export type SourceWithStatus = {
  rec: CoverageRecord;
  applies: boolean;
  reasons: string[];
};

/**
 * Pre-computed values that every row builder needs. Built once by the
 * orchestrator and passed to each row builder.
 */
export type RowContext = {
  locale: Locale;
  labels: Record<GuaranteeKey, string>;
  inputs: WizardInputs;
  tripDays: number;
  activeSources: SourceWithStatus[];
  inactiveSources: SourceWithStatus[];
  aggMedicalCents: number;
  aggCancellationCents: number;
  aggBaggageCents: number;
  aggLiabilityCents: number;
  repatriationCovered: boolean;
  winterSportsCovered: boolean;
  uncoveredCompanions: { kind: string; sources: string[] }[];
};
