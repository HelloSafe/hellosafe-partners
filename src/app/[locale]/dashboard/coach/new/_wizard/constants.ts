import type { AgeRange, CompanionKind } from "@/lib/coach/coverage-types";

export type Baseline = {
  cards: { id: string; name: string; issuer: string | null; locale: string }[];
  mutuelles: { id: string; name: string; locale: string }[];
  socialSecurity: { id: string; name: string; locale: string }[];
  partnerContracts: { id: string; name: string; issuer: string | null }[];
};

export const AGE_RANGES: AgeRange[] = [
  "18_25",
  "26_35",
  "36_50",
  "51_65",
  "66_75",
  "over_75",
  "under_18",
];

export const COMPANION_KINDS: CompanionKind[] = [
  "spouse_legal",
  "concubin",
  "child_under_25",
  "child_over_25",
  "parent",
  "friend",
];

/** ISO date 30 days from today, plus an optional offset. */
export function nextMonthISO(daysOffset: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 30 + daysOffset);
  return d.toISOString().slice(0, 10);
}
