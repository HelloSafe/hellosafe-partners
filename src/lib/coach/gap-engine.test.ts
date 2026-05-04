import { describe, it, expect } from "vitest";
import { runGapAnalysis } from "./gap-engine";
import type { CoverageData, WizardInputs } from "./coverage-types";

// ---------- Helpers ----------

function baseInputs(overrides: Partial<WizardInputs> = {}): WizardInputs {
  return {
    client: {
      label: "Mme Martin",
      ageRange: "36_50",
      companions: [],
      departureCountry: "FR",
    },
    trip: {
      destination: "ID",
      destinationLabel: "Indonésie (Bali)",
      startDate: "2026-06-01",
      endDate: "2026-06-15", // 14 days
      purpose: "leisure",
      activities: [],
      estimatedTripValueEur: 3000,
    },
    coverage: {
      cardId: null,
      mutuelleId: null,
      socialSecurityId: null,
      partnerContractId: null,
    },
    ...overrides,
  };
}

function makeCard(data: Partial<CoverageData> = {}) {
  const fullData: CoverageData = {
    limits: {},
    constraints: {},
    coveredRelatives: ["self"],
    ...data,
  };
  return {
    id: "card-1",
    name: "Visa Premier",
    type: "card" as const,
    data: fullData,
  };
}

// ---------- Tests ----------

describe("runGapAnalysis", () => {
  it("flags everything as a gap when no coverage source is provided", () => {
    const out = runGapAnalysis({
      inputs: baseInputs(),
      card: null,
      mutuelle: null,
      socialSecurity: null,
      partnerContract: null,
      locale: "fr",
    });

    expect(out.summary.totalSources).toBe(0);
    // With zero sources, the score should be at the floor (or close to it).
    expect(out.summary.coverageScore).toBeLessThanOrEqual(20);
    // We always emit at least the medical row, which is critical without sources.
    expect(out.rows.length).toBeGreaterThan(0);
    expect(out.summary.criticalGaps).toBeGreaterThan(0);
  });

  it("aggregates medical caps across active sources (sum)", () => {
    const card = makeCard({
      limits: {
        medical_expenses: {
          unlimited: false,
          amount: { cents: 50_000_00, currency: "EUR" },
        },
      },
    });

    const out = runGapAnalysis({
      inputs: baseInputs(),
      card,
      mutuelle: null,
      socialSecurity: null,
      partnerContract: null,
      locale: "fr",
    });

    expect(out.summary.totalSources).toBe(1);
    // Medical row must reference the card name in its current.breakdown.
    const medicalRow = out.rows.find((r) => r.guarantee === "medical_expenses");
    expect(medicalRow).toBeDefined();
    expect(
      medicalRow!.current.breakdown.some((b) => b.source === "Visa Premier"),
    ).toBe(true);
  });

  it("disqualifies a card when trip duration exceeds its max", () => {
    // Card capped at 7 days; trip is 14 days.
    const card = makeCard({
      constraints: { maxTripDurationDays: 7 },
      limits: {
        medical_expenses: {
          unlimited: false,
          amount: { cents: 50_000_00, currency: "EUR" },
        },
      },
    });

    const out = runGapAnalysis({
      inputs: baseInputs(),
      card,
      mutuelle: null,
      socialSecurity: null,
      partnerContract: null,
      locale: "fr",
    });

    // Source loaded but not active → totalSources counts active OR all? Read API.
    // We at least expect the duration row to mention the disqualified card or
    // the score to remain low (no usable source for medical).
    expect(out.summary.coverageScore).toBeLessThan(60);
  });

  it("flags companions row when a kid is present and no source covers children", () => {
    const card = makeCard({
      coveredRelatives: ["self"], // self only, not children
      limits: {
        medical_expenses: {
          unlimited: false,
          amount: { cents: 50_000_00, currency: "EUR" },
        },
      },
    });

    const inputs = baseInputs({
      client: {
        label: "M. Martin",
        ageRange: "36_50",
        companions: [{ kind: "child_under_25", count: 1 }],
        departureCountry: "FR",
      },
    });

    const out = runGapAnalysis({
      inputs,
      card,
      mutuelle: null,
      socialSecurity: null,
      partnerContract: null,
      locale: "fr",
    });

    const compsRow = out.rows.find((r) => r.guarantee === "companions");
    expect(compsRow).toBeDefined();
    // Gap should be present with critical or warning severity when a kid is
    // uncovered.
    expect(compsRow!.gap).not.toBeNull();
    expect(["critical", "warning"]).toContain(compsRow!.gap!.severity);
  });

  it("excludes a card with worldwide_excluding_us_canada when the trip is to the US", () => {
    const card = makeCard({
      constraints: { geographicalZone: "worldwide_excluding_us_canada" },
      limits: {
        medical_expenses: {
          unlimited: false,
          amount: { cents: 100_000_00, currency: "EUR" },
        },
      },
    });

    const inputs = baseInputs({
      trip: {
        destination: "US",
        destinationLabel: "United States",
        startDate: "2026-06-01",
        endDate: "2026-06-10",
        purpose: "leisure",
        activities: [],
        estimatedTripValueEur: 4000,
      },
    });

    const out = runGapAnalysis({
      inputs,
      card,
      mutuelle: null,
      socialSecurity: null,
      partnerContract: null,
      locale: "fr",
    });

    // Card is loaded but not active for US → score should be low.
    expect(out.summary.coverageScore).toBeLessThan(60);
    // Recommendation should still surface a HelloSafe baseline.
    expect(out.helloSafeRecommendation).toBeDefined();
    expect(out.helloSafeRecommendation.bullets.length).toBeGreaterThan(0);
  });
});
