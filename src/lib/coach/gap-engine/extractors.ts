/**
 * Pure getters that pull a single dimension out of a CoverageData blob.
 * Centralized so the row builders never care about the storage shape
 * (unlimited vs. amount, deductibles, optional fields).
 */

import type { CoverageData } from "../coverage-types";

export function getMedicalCents(data: CoverageData): number {
  const m = data.limits.medical_expenses;
  if (!m) return 0;
  if (m.unlimited) return Number.POSITIVE_INFINITY;
  return m.amount.cents;
}

export function getCancellationCents(data: CoverageData): number {
  return data.limits.trip_cancellation?.cents ?? 0;
}

export function getBaggageCents(data: CoverageData): number {
  return data.limits.baggage?.cents ?? 0;
}

export function getLiabilityCents(data: CoverageData): number {
  return data.limits.personal_liability?.cents ?? 0;
}

export function isRepatriationCovered(data: CoverageData): boolean {
  return data.limits.repatriation?.covered === true;
}

export function isWinterSportsCovered(data: CoverageData): boolean {
  return data.limits.winter_sports?.covered === true;
}
