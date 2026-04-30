/**
 * Shared types for coverage profiles (cards, mutuelles, social security, partner contracts)
 * and for gap-analysis inputs/outputs. All money amounts in cents to keep math integer-clean.
 */

export type Currency = "EUR" | "GBP" | "USD";

export type AmountCents = {
  cents: number;
  currency: Currency;
};

export type AmountOrUnlimited =
  | { unlimited: true }
  | { unlimited: false; amount: AmountCents };

export type RelativeKind =
  | "self"
  | "spouse_legal"
  | "concubin"
  | "children_under_25"
  | "children_over_25"
  | "parents"
  | "friends";

export type GuaranteeKey =
  | "medical_expenses"
  | "repatriation"
  | "trip_cancellation"
  | "baggage"
  | "personal_liability"
  | "trip_delay"
  | "rental_car_excess"
  | "winter_sports";

export type CoverageData = {
  limits: Partial<{
    medical_expenses: AmountOrUnlimited & { deductibleCents?: number };
    repatriation: { covered: boolean; actualCosts?: boolean; cap?: AmountCents };
    trip_cancellation: AmountCents & { perPerson?: boolean; allCauses?: boolean };
    baggage: AmountCents;
    personal_liability: AmountCents;
    trip_delay: AmountCents & { afterHours?: number };
    rental_car_excess: AmountCents;
    winter_sports: { covered: boolean; cap?: AmountCents };
  }>;
  constraints: {
    maxTripDurationDays?: number;
    maxAgeYears?: number;
    /** Examples: "worldwide", "worldwide_excluding_us_canada", "EU+EHIC", "schengen" */
    geographicalZone?: string;
    deductibleCents?: number;
  };
  coveredRelatives: RelativeKind[];
  excludedRelatives?: RelativeKind[];
  keyExclusions?: string[];
  /** Free notes for the agency (e.g. claim hotline, PDF link). */
  notes?: string;
};

// ---------- Wizard inputs ----------

export type AgeRange = "under_18" | "18_25" | "26_35" | "36_50" | "51_65" | "66_75" | "over_75";

export type CompanionKind =
  | "spouse_legal"
  | "concubin"
  | "child_under_25"
  | "child_over_25"
  | "parent"
  | "friend";

export type Companion = {
  kind: CompanionKind;
  count: number; // 1 by default; e.g. "2 children under 25"
};

export type DepartureCountry = "FR" | "UK";

export type TripPurpose =
  | "leisure"
  | "business"
  | "study"
  | "expat"
  | "visa_required"
  | "cruise";

export type TripActivity =
  | "winter_sports"
  | "diving"
  | "trekking"
  | "extreme_sports"
  | "motorbike"
  | "none";

export type WizardInputs = {
  client: {
    label: string; // e.g. "Mme Martin", "dossier 1242"
    ageRange: AgeRange;
    companions: Companion[];
    departureCountry: DepartureCountry;
  };
  trip: {
    destination: string; // ISO country or free-text
    destinationLabel: string; // e.g. "Indonésie (Bali)"
    startDate: string;
    endDate: string;
    purpose: TripPurpose;
    activities: TripActivity[];
    estimatedTripValueEur: number;
  };
  coverage: {
    cardId: string | null;
    mutuelleId: string | null;
    /** Always derived from departureCountry but stored explicit for the snapshot */
    socialSecurityId: string | null;
    partnerContractId: string | null;
  };
};

// ---------- Output ----------

export type GapSeverity = "info" | "warning" | "critical";

export type GuaranteeRow = {
  guarantee: GuaranteeKey | "companions" | "duration" | "destination";
  guaranteeLabel: string;
  /** Aggregated picture of what the traveler currently has. */
  current: {
    summary: string;
    breakdown: { source: string; detail: string }[];
  };
  helloSafe: { summary: string };
  gap: {
    severity: GapSeverity;
    title: string;
    explanation: string;
    helloSafeAnswer: string;
  } | null;
};

export type GapAnalysisOutput = {
  generatedAt: string;
  locale: "fr" | "en";
  summary: {
    totalSources: number;
    rowsCount: number;
    criticalGaps: number;
    warningGaps: number;
    coverageScore: number; // 0..100
  };
  rows: GuaranteeRow[];
  helloSafeRecommendation: {
    name: string;
    pricePerDayCents: number;
    bullets: string[];
  };
};

// ---------- Helpers ----------

export const AGE_RANGE_LABEL_FR: Record<AgeRange, string> = {
  under_18: "Moins de 18 ans",
  "18_25": "18 – 25 ans",
  "26_35": "26 – 35 ans",
  "36_50": "36 – 50 ans",
  "51_65": "51 – 65 ans",
  "66_75": "66 – 75 ans",
  over_75: "Plus de 75 ans",
};
export const AGE_RANGE_LABEL_EN: Record<AgeRange, string> = {
  under_18: "Under 18",
  "18_25": "18 – 25",
  "26_35": "26 – 35",
  "36_50": "36 – 50",
  "51_65": "51 – 65",
  "66_75": "66 – 75",
  over_75: "Over 75",
};

export const COMPANION_LABEL_FR: Record<CompanionKind, string> = {
  spouse_legal: "Conjoint(e) marié(e)",
  concubin: "Concubin(e) / partenaire non marié(e)",
  child_under_25: "Enfant de moins de 25 ans",
  child_over_25: "Enfant de plus de 25 ans",
  parent: "Parent",
  friend: "Ami(e)",
};
export const COMPANION_LABEL_EN: Record<CompanionKind, string> = {
  spouse_legal: "Legal spouse",
  concubin: "Unmarried partner",
  child_under_25: "Child under 25",
  child_over_25: "Child over 25",
  parent: "Parent",
  friend: "Friend",
};

/** Map a companion kind to the relative kind used in coverage profiles. */
export function companionToRelative(c: CompanionKind): RelativeKind {
  switch (c) {
    case "spouse_legal":
      return "spouse_legal";
    case "concubin":
      return "concubin";
    case "child_under_25":
      return "children_under_25";
    case "child_over_25":
      return "children_over_25";
    case "parent":
      return "parents";
    case "friend":
      return "friends";
  }
}

/** Approximate age range to a numeric upper bound (used for max-age constraint checks). */
export function ageRangeUpperBound(r: AgeRange): number {
  return {
    under_18: 17,
    "18_25": 25,
    "26_35": 35,
    "36_50": 50,
    "51_65": 65,
    "66_75": 75,
    over_75: 90,
  }[r];
}

export function tripDurationDays(startISO: string, endISO: string): number {
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return 0;
  return Math.max(1, Math.round((e - s) / 86_400_000) + 1);
}

export function fmtAmountCents(
  amount: AmountOrUnlimited | AmountCents | undefined,
  locale: string,
): string {
  if (!amount) return "—";
  if ("unlimited" in amount && amount.unlimited) {
    return locale === "en" ? "Unlimited" : "Illimité";
  }
  const a = "unlimited" in amount ? amount.amount : amount;
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
    style: "currency",
    currency: a.currency,
    maximumFractionDigits: 0,
  }).format(a.cents / 100);
}
