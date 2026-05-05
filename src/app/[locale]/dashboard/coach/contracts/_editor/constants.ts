import type { CoverageData, RelativeKind } from "@/lib/coach/coverage-types";

export const RELATIVE_OPTIONS: RelativeKind[] = [
  "self",
  "spouse_legal",
  "concubin",
  "children_under_25",
  "children_over_25",
  "parents",
  "friends",
];

export const DEFAULT_DATA: CoverageData = {
  limits: {
    medical_expenses: {
      unlimited: false,
      amount: { cents: 250_000_00, currency: "EUR" },
    },
    repatriation: { covered: true, actualCosts: true },
    trip_cancellation: {
      cents: 8_000_00,
      currency: "EUR",
      perPerson: true,
      allCauses: true,
    },
    baggage: { cents: 2_000_00, currency: "EUR" },
    personal_liability: { cents: 4_500_000_00, currency: "EUR" },
    trip_delay: { cents: 500_00, currency: "EUR", afterHours: 4 },
    rental_car_excess: { cents: 0, currency: "EUR" },
    winter_sports: { covered: true, cap: { cents: 5_000_00, currency: "EUR" } },
  },
  constraints: {
    maxTripDurationDays: 60,
    maxAgeYears: 80,
    geographicalZone: "worldwide",
  },
  coveredRelatives: ["self", "spouse_legal", "children_under_25"],
  excludedRelatives: ["concubin", "children_over_25", "parents", "friends"],
  keyExclusions: [],
};

export const inputCls =
  "w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] focus-ring focus:border-brand-500";
