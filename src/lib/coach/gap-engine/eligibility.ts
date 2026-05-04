/**
 * Pre-flight checks that decide whether a coverage source actually applies
 * to a given trip, and which companions are left uncovered.
 */

import {
  ageRangeUpperBound,
  companionToRelative,
  type WizardInputs,
} from "../coverage-types";
import type { CoverageRecord, SourceWithStatus } from "./types";

/**
 * Determine whether a coverage record applies to the trip.
 * If `maxTripDurationDays` is exceeded, age is out of bounds, or the
 * geographic zone excludes the destination, the source is marked inactive.
 */
export function recordApplies(
  rec: CoverageRecord,
  inputs: WizardInputs,
  durationDays: number,
): { applies: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const c = rec.data.constraints;

  if (c.maxTripDurationDays && durationDays > c.maxTripDurationDays) {
    reasons.push(
      `Durée du voyage (${durationDays} j) > durée max couverte (${c.maxTripDurationDays} j) par ${rec.name}`,
    );
  }

  if (
    c.maxAgeYears &&
    ageRangeUpperBound(inputs.client.ageRange) > c.maxAgeYears
  ) {
    reasons.push(
      `Tranche d'âge (${inputs.client.ageRange}) > âge max couvert (${c.maxAgeYears}) par ${rec.name}`,
    );
  }

  // Geographic — simple heuristic for US/Canada zone exclusions.
  if (
    c.geographicalZone === "worldwide_excluding_us_canada" &&
    /(US|USA|United States|Canada)/i.test(inputs.trip.destinationLabel)
  ) {
    reasons.push(
      `${rec.name} exclut les États-Unis et le Canada de sa zone de couverture`,
    );
  }

  return { applies: reasons.length === 0, reasons };
}

/**
 * For each companion in the wizard inputs, find the active sources that
 * cover their relative kind. Returns the companions that have zero matching
 * source.
 */
export function computeUncoveredCompanions(
  inputs: WizardInputs,
  activeSources: SourceWithStatus[],
): { kind: string; sources: string[] }[] {
  const out: { kind: string; sources: string[] }[] = [];
  for (const comp of inputs.client.companions) {
    const rel = companionToRelative(comp.kind);
    const sourcesCovering = activeSources.filter((s) =>
      s.rec.data.coveredRelatives.includes(rel),
    );
    if (sourcesCovering.length === 0) {
      out.push({
        kind: comp.kind,
        sources: activeSources.map((s) => s.rec.name),
      });
    }
  }
  return out;
}
