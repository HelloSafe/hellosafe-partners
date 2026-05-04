/**
 * HelloSafe reference values used as the "right column" benchmark in the
 * gap analysis. Centralized so a single product update propagates to every
 * row.
 */

import type { CoverageData, GuaranteeKey } from "../coverage-types";

export const HELLOSAFE_PRICE_PER_DAY_CENTS = 140; // €1.40 / day

export const HELLOSAFE_BASELINE: CoverageData = {
  limits: {
    medical_expenses: {
      unlimited: false,
      amount: { cents: 4_500_000_00, currency: "EUR" },
      deductibleCents: 0,
    },
    repatriation: { covered: true, actualCosts: true },
    trip_cancellation: {
      cents: 12_000_00,
      currency: "EUR",
      perPerson: true,
      allCauses: true,
    },
    baggage: { cents: 3_000_00, currency: "EUR" },
    personal_liability: { cents: 4_500_000_00, currency: "EUR" },
    trip_delay: { cents: 800_00, currency: "EUR", afterHours: 4 },
    rental_car_excess: { cents: 50_000_00, currency: "EUR" },
    winter_sports: {
      covered: true,
      cap: { cents: 5_000_00, currency: "EUR" },
    },
  },
  constraints: {
    maxTripDurationDays: 365,
    maxAgeYears: 99,
    geographicalZone: "worldwide",
  },
  coveredRelatives: [
    "self",
    "spouse_legal",
    "concubin",
    "children_under_25",
    "children_over_25",
    "parents",
    "friends",
  ],
};

export const GUARANTEE_LABELS_FR: Record<GuaranteeKey, string> = {
  medical_expenses: "Frais médicaux à l'étranger",
  repatriation: "Rapatriement / assistance médicale",
  trip_cancellation: "Annulation de voyage",
  baggage: "Bagages",
  personal_liability: "Responsabilité civile à l'étranger",
  trip_delay: "Retard de transport",
  rental_car_excess: "Franchise location de voiture",
  winter_sports: "Sports d'hiver / activités à risque",
};

export const GUARANTEE_LABELS_EN: Record<GuaranteeKey, string> = {
  medical_expenses: "Medical expenses abroad",
  repatriation: "Repatriation / medical assistance",
  trip_cancellation: "Trip cancellation",
  baggage: "Baggage",
  personal_liability: "Personal liability abroad",
  trip_delay: "Trip delay",
  rental_car_excess: "Rental car excess",
  winter_sports: "Winter sports / risk activities",
};

/** Format an amount in cents as a localized euro string. */
export function fmtEur(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
